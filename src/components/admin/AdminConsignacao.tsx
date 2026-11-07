// Consignação ("maleta"): peças saem do estoque ao entregar, voltam ao ler as que sobraram; o resto vira venda.
// A regra e o estoque ficam nas funções do banco (citrino_consig_*); aqui só a tela.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Briefcase, Users, Tag, Plus, X, Camera, ScanLine, Printer, Loader2, Check, Trash2, RefreshCw, BarChart3, Download } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { supabase } from '../../services/supabaseClient';
import { useCitrinoStore } from '../../services/store';
import { refreshCatalog } from '../../services/remote';

type Rev = { id: string; nome: string; telefone: string | null; comissao_percent: number; ativo: boolean };
type Item = { id: string; sku: string; nome: string; unit_cents: number; qtd_levada: number; qtd_devolvida: number; codigos_saida: string[]; codigos_devolvidos: string[] };
type Maleta = {
  id: string; numero: number; revendedora_id: string | null; revendedora_nome: string | null; comissao_percent: number; status: string;
  obs: string | null; saida_em: string; acerto_em: string | null; total_levado_cents: number; total_vendido_cents: number;
  comissao_cents: number; a_receber_cents: number; citrino_consignacao_itens: Item[];
};
type Linha = { sku: string; nome: string; qty: number; codes: string[]; unit_cents: number };

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dt = (s: string | null) => (s ? new Date(s).toLocaleDateString('pt-BR') : '—');
const skuDe = (code: string) => code.split('#')[0].trim();
const esc = (s: string) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

/** Folha imprimível: romaneio de entrega (maleta aberta) ou comprovante de acerto (maleta encerrada). */
function imprimirRomaneio(m: Maleta) {
  const w = window.open('', '_blank'); if (!w) { alert('Libere pop-ups para imprimir.'); return; }
  const acertada = m.status === 'encerrada';
  const linhas = m.citrino_consignacao_itens.map((i) => {
    const vend = i.qtd_levada - i.qtd_devolvida;
    return `<tr><td>${esc(i.sku)}</td><td>${esc(i.nome)}</td><td class="r">${i.qtd_levada}</td><td class="r">${brl(i.unit_cents)}</td><td class="r">${brl(i.unit_cents * i.qtd_levada)}</td>${acertada ? `<td class="r">${i.qtd_devolvida}</td><td class="r">${vend}</td><td class="r">${brl(vend * i.unit_cents)}</td>` : ''}</tr>`;
  }).join('');
  const pecas = m.citrino_consignacao_itens.reduce((t, i) => t + i.qtd_levada, 0);
  w.document.write(`<html><head><title>${acertada ? 'Acerto' : 'Romaneio'} #${m.numero}</title><style>
  body{font-family:Arial,sans-serif;margin:28px;color:#222;font-size:13px}h1{font-size:20px;margin:0}h2{font-size:14px;margin:2px 0 14px;color:#666;font-weight:normal}
  table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#f2f2f2}.r{text-align:right}
  .tot{margin-top:6px;text-align:right;font-size:14px}.ass{display:flex;gap:40px;margin-top:70px}.ass div{flex:1;border-top:1px solid #333;text-align:center;padding-top:4px;font-size:12px}
  .nota{margin-top:18px;font-size:11px;color:#555}</style></head><body>
  <h1>Citrino Semijoias — ${acertada ? 'Comprovante de acerto' : 'Romaneio de entrega (consignação)'}</h1>
  <h2>Maleta nº ${m.numero} · Revendedora: <b>${esc(m.revendedora_nome || '—')}</b> · Saída: ${dt(m.saida_em)}${acertada ? ` · Acerto: ${dt(m.acerto_em)}` : ''}</h2>
  <table><thead><tr><th>SKU</th><th>Peça</th><th class="r">Qtd. levada</th><th class="r">Valor unit.</th><th class="r">Subtotal</th>${acertada ? '<th class="r">Devolvidas</th><th class="r">Vendidas</th><th class="r">Valor vendido</th>' : ''}</tr></thead><tbody>${linhas}</tbody></table>
  <div class="tot">${pecas} peça(s) · Total levado: <b>${brl(m.total_levado_cents)}</b></div>
  ${acertada ? `<div class="tot">Vendido: <b>${brl(m.total_vendido_cents)}</b> · Comissão (${m.comissao_percent}%): <b>${brl(m.comissao_cents)}</b> · <b>Valor a pagar à Citrino: ${brl(m.a_receber_cents)}</b></div>`
    : `<div class="tot">Comissão combinada: ${m.comissao_percent}% sobre o que for vendido</div>`}
  ${m.obs ? `<div class="nota">Obs.: ${esc(m.obs)}</div>` : ''}
  <div class="nota">${acertada ? 'Declaro que conferi as peças devolvidas e os valores acima.' : 'Declaro que recebi as peças acima em consignação e me comprometo a devolver as não vendidas e acertar o valor das vendidas na data combinada.'}</div>
  <div class="ass"><div>Citrino Semijoias</div><div>${esc(m.revendedora_nome || 'Revendedora')}</div></div>
  <script>onload=()=>print()</script></body></html>`);
  w.document.close();
}

/** Acha a peça pelo código lido: código de barras da embalagem, SKU, ou SKU#único. */
const acharProduto = (lista: any[], code: string) => {
  const c = code.trim().toLowerCase(); const sku = skuDe(code).toLowerCase();
  return lista.find((p) => p.barcode && String(p.barcode).trim().toLowerCase() === c)
    || lista.find((p) => String(p.sku || '').toLowerCase() === sku);
};

/** Entrada de leitura: leitor USB/Bluetooth (age como teclado + Enter), digitação manual e câmera do celular. */
export function Leitor({ onCode }: { onCode: (code: string) => void }) {
  const [txt, setTxt] = useState('');
  const [cam, setCam] = useState(false);
  const [msg, setMsg] = useState('');
  const video = useRef<HTMLVideoElement>(null);
  const ultimo = useRef({ c: '', t: 0 });
  const suportaCamera = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  useEffect(() => {
    if (!cam) return;
    let stop = false; let stream: MediaStream | null = null; let timer: any;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (video.current) { video.current.srcObject = stream; await video.current.play(); }
        const det = new (window as any).BarcodeDetector({ formats: ['code_128', 'ean_13', 'ean_8', 'code_39', 'qr_code', 'upc_a'] });
        const loop = async () => {
          if (stop || !video.current) return;
          try {
            const r = await det.detect(video.current);
            if (r[0]) {
              const c = String(r[0].rawValue); const agora = Date.now();
              if (c !== ultimo.current.c || agora - ultimo.current.t > 1800) { ultimo.current = { c, t: agora }; onCode(c); }
            }
          } catch { /* ignora quadro ruim */ }
          timer = setTimeout(loop, 250);
        };
        loop();
      } catch { setMsg('Não consegui abrir a câmera. Use o leitor ou digite o código.'); setCam(false); }
    })();
    return () => { stop = true; clearTimeout(timer); stream?.getTracks().forEach((t) => t.stop()); };
  }, [cam]);

  const enviar = () => { const c = txt.trim(); if (c) { onCode(c); setTxt(''); } };
  const modo: 'leitor' | 'celular' | 'digitar' = cam ? 'celular' : 'leitor';
  const btn = (ativo: boolean) => `flex-1 px-2 py-2 rounded-lg border text-sm flex items-center justify-center gap-1 ${ativo ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-300'}`;
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-gray-600">Como quer ler as peças?</div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setCam(false)} className={btn(modo === 'leitor')}><ScanLine className="w-4 h-4" />Leitor de código</button>
        <button type="button" onClick={() => setCam(true)} className={btn(modo === 'celular')}><Camera className="w-4 h-4" />Câmera do celular</button>
      </div>
      {!cam && (
        <>
          <div className="flex gap-2">
            <input autoFocus value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), enviar())}
              placeholder="Clique aqui e passe o leitor (ou digite o código)" className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 outline-none text-sm bg-white" />
            <button type="button" onClick={enviar} className="px-3 rounded-lg bg-gray-900 text-white text-sm">Adicionar</button>
          </div>
          <p className="text-xs text-gray-500">Leitor USB ou Bluetooth: conecte no computador (ou pareie no celular), clique no campo acima e passe nas peças. Ele digita o código sozinho e já adiciona. Sem leitor? Digite o código e aperte Enter.</p>
        </>
      )}
      {cam && (
        <>
          {suportaCamera
            ? <><video ref={video} muted playsInline className="w-full max-h-56 rounded-lg bg-black object-cover" /><p className="text-xs text-gray-500">Aponte a câmera para o código de barras da peça. Cada leitura adiciona 1 peça. Permita o acesso à câmera quando o navegador pedir.</p></>
            : <p className="text-xs text-red-600">Este navegador não lê código pela câmera. No celular, abra o sistema pelo Chrome (Android). No iPhone use um leitor Bluetooth ou digite o código.</p>}
        </>
      )}
      {msg && <p className="text-xs text-red-600">{msg}</p>}
    </div>
  );
}

export function AdminConsignacao() {
  const { allProducts } = useCitrinoStore();
  const [aba, setAba] = useState<'maletas' | 'revendedoras' | 'relatorios' | 'etiquetas'>('maletas');
  const [revs, setRevs] = useState<Rev[]>([]);
  const [maletas, setMaletas] = useState<Maleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState<null | { tipo: 'nova' } | { tipo: 'acerto'; m: Maleta } | { tipo: 'ver'; m: Maleta }>(null);

  const carregar = useCallback(async (focoId?: string): Promise<Maleta | undefined> => {
    setLoading(true); setErro('');
    const [r, m] = await Promise.all([
      supabase.from('citrino_revendedoras').select('*').order('nome'),
      supabase.from('citrino_consignacoes').select('*, citrino_consignacao_itens(*)').order('saida_em', { ascending: false }).limit(200),
    ]);
    if (r.error || m.error) setErro('Não foi possível carregar. Se for a primeira vez, falta aplicar a migração de consignação no banco.');
    setRevs((r.data as Rev[]) || []); setMaletas((m.data as Maleta[]) || []); setLoading(false);
    return focoId ? ((m.data as Maleta[]) || []).find((x) => x.id === focoId) : undefined;
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const abertas = maletas.filter((m) => m.status === 'aberta');
  const aReceber = maletas.filter((m) => m.status === 'encerrada').reduce((t, m) => t + m.a_receber_cents, 0);
  const foraDoEstoque = abertas.reduce((t, m) => t + m.citrino_consignacao_itens.reduce((s, i) => s + i.qtd_levada * i.unit_cents, 0), 0);

  const achar = (code: string) => acharProduto(allProducts, code);
  const precoCents = (p: any) => Math.round((Number(p.promoPrice) > 0 ? Number(p.promoPrice) : Number(p.price) || 0) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Briefcase className="w-5 h-5" /> Consignação (maletas)</h1>
          <p className="text-sm text-gray-500">Entregue peças para revendedoras; no acerto, leia as que sobraram e o sistema calcula o resto e dá baixa no estoque.</p>
        </div>
        <button onClick={() => carregar()} className="text-sm flex items-center gap-1 text-gray-600"><RefreshCw className="w-4 h-4" />Atualizar</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[['Maletas abertas', String(abertas.length)], ['Fora do estoque', brl(foraDoEstoque)], ['A receber (acertadas)', brl(aReceber)]].map(([t, v]) => (
          <div key={t} className="bg-white rounded-xl border border-gray-200 p-3"><div className="text-xs text-gray-500">{t}</div><div className="text-lg font-bold">{v}</div></div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {([['maletas', 'Maletas', Briefcase], ['revendedoras', 'Revendedoras', Users], ['relatorios', 'Relatórios', BarChart3], ['etiquetas', 'Etiquetas', Tag]] as const).map(([k, l, Ic]) => (
          <button key={k} onClick={() => setAba(k)} className={`px-4 py-2 text-sm flex items-center gap-1.5 border-b-2 ${aba === k ? 'border-gray-900 font-semibold' : 'border-transparent text-gray-500'}`}><Ic className="w-4 h-4" />{l}</button>
        ))}
      </div>
      {erro && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{erro}</div>}
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}

      {aba === 'maletas' && (
        <div className="space-y-3">
          <button onClick={() => setModal({ tipo: 'nova' })} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm flex items-center gap-1"><Plus className="w-4 h-4" />Nova maleta</button>
          {maletas.length === 0 && !loading && <p className="text-sm text-gray-500">Nenhuma maleta ainda.</p>}
          {maletas.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">#{m.numero} · {m.revendedora_nome || 'Sem revendedora'}
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${m.status === 'aberta' ? 'bg-amber-100 text-amber-700' : m.status === 'encerrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{m.status === 'aberta' ? 'Aberta' : m.status === 'encerrada' ? 'Acertada' : 'Cancelada'}</span></div>
                <div className="text-xs text-gray-500">Saída {dt(m.saida_em)} · Levou {brl(m.total_levado_cents)}{m.status === 'encerrada' && ` · Vendeu ${brl(m.total_vendido_cents)} · Comissão ${brl(m.comissao_cents)} · A receber ${brl(m.a_receber_cents)}`}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setModal({ tipo: 'ver', m })} className="px-3 py-1.5 text-sm border rounded-lg">Detalhes</button>
                {m.status === 'aberta' && <button onClick={() => setModal({ tipo: 'acerto', m })} className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white">Fazer acerto</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {aba === 'revendedoras' && <Revendedoras revs={revs} onSaved={carregar} />}
      {aba === 'relatorios' && <Relatorios maletas={maletas} revs={revs} />}
      {aba === 'etiquetas' && <Etiquetas />}

      {modal?.tipo === 'nova' && <NovaMaleta revs={revs.filter((r) => r.ativo)} achar={achar} precoCents={precoCents} onClose={() => setModal(null)} onDone={async (id?: string) => { setModal(null); await refreshCatalog(); const novo = await carregar(id); if (novo) imprimirRomaneio(novo); }} />}
      {modal?.tipo === 'acerto' && <Acerto m={modal.m} onClose={() => setModal(null)} onDone={async () => { const id = modal.m.id; setModal(null); await refreshCatalog(); const fechada = await carregar(id); if (fechada) imprimirRomaneio(fechada); }} />}
      {modal?.tipo === 'ver' && <Detalhes m={modal.m} onClose={() => setModal(null)} onCancel={async () => {
        if (!confirm('Cancelar esta maleta? As peças voltam ao estoque.')) return;
        const { error } = await supabase.rpc('citrino_consig_cancelar', { _id: modal.m.id });
        if (error) alert(error.message); else { setModal(null); await refreshCatalog(); carregar(); }
      }} />}
    </div>
  );
}

function Moldura({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start md:items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-5 space-y-4 my-4">
        <div className="flex items-center justify-between"><h2 className="font-bold text-lg">{titulo}</h2><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        {children}
      </div>
    </div>
  );
}

function NovaMaleta({ revs, achar, precoCents, onClose, onDone }: { revs: Rev[]; achar: (c: string) => any; precoCents: (p: any) => number; onClose: () => void; onDone: (id?: string) => void }) {
  const [rev, setRev] = useState('');
  const [obs, setObs] = useState('');
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [aviso, setAviso] = useState('');
  const [busy, setBusy] = useState(false);
  const [busca, setBusca] = useState('');
  const { allProducts } = useCitrinoStore();

  const adicionar = (code: string) => {
    const p = achar(code);
    if (!p) { setAviso(`Código não encontrado: ${code}`); return; }
    const unico = code.includes('#');
    setAviso('');
    setLinhas((prev) => {
      const i = prev.findIndex((l) => l.sku.toLowerCase() === String(p.sku).toLowerCase());
      if (unico && i > -1 && prev[i].codes.includes(code)) { setAviso(`Peça ${code} já foi lida`); return prev; }
      const qtdAtual = i > -1 ? prev[i].qty : 0;
      if (qtdAtual + 1 > Number(p.stock)) { setAviso(`Estoque insuficiente de ${p.sku} (tem ${p.stock})`); return prev; }
      if (i > -1) { const n = [...prev]; n[i] = { ...n[i], qty: n[i].qty + 1, codes: unico ? [...n[i].codes, code] : n[i].codes }; return n; }
      return [...prev, { sku: p.sku, nome: p.name, qty: 1, codes: unico ? [code] : [], unit_cents: precoCents(p) }];
    });
  };
  const sugestoes = busca.trim().length >= 2 ? allProducts.filter((p: any) => `${p.sku} ${p.name}`.toLowerCase().includes(busca.toLowerCase())).slice(0, 6) : [];
  const total = linhas.reduce((t, l) => t + l.qty * l.unit_cents, 0);

  const confirmar = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc('citrino_consig_abrir', { _rev: rev || null, _itens: linhas.map((l) => ({ sku: l.sku, qty: l.qty, codes: l.codes })), _obs: obs });
    setBusy(false);
    if (error) setAviso(error.message); else onDone(String(data));
  };
  return (
    <Moldura titulo="Nova maleta" onClose={onClose}>
      <select value={rev} onChange={(e) => setRev(e.target.value)} className="w-full border rounded-lg px-3 py-2.5 text-sm">
        <option value="">Sem revendedora (funcionária / venda externa da equipe)</option>
        {revs.map((r) => <option key={r.id} value={r.id}>{r.nome} — comissão {r.comissao_percent}%</option>)}
      </select>
      <Leitor onCode={adicionar} />
      <div className="relative">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="…ou busque a peça por nome/SKU" className="w-full border rounded-lg px-3 py-2 text-sm" />
        {sugestoes.length > 0 && <div className="absolute z-10 left-0 right-0 bg-white border rounded-lg shadow mt-1">{sugestoes.map((p: any) => (
          <button key={p.id} type="button" onClick={() => { adicionar(p.sku); setBusca(''); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">{p.sku} · {p.name} <span className="text-gray-400">(estoque {p.stock})</span></button>))}</div>}
      </div>
      {aviso && <div className="text-sm text-red-600">{aviso}</div>}
      <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
        {linhas.length === 0 && <p className="p-3 text-sm text-gray-400">Nenhuma peça lida.</p>}
        {linhas.map((l) => (
          <div key={l.sku} className="p-2.5 flex items-center justify-between gap-2 text-sm">
            <div className="min-w-0"><div className="truncate">{l.sku} · {l.nome}</div><div className="text-xs text-gray-400">{brl(l.unit_cents)} cada{l.codes.length ? ` · ${l.codes.length} peça(s) com código único` : ''}</div></div>
            <div className="flex items-center gap-2">
              <button onClick={() => setLinhas((p) => p.map((x) => x.sku === l.sku ? { ...x, qty: Math.max(1, x.qty - 1), codes: x.codes.slice(0, Math.max(1, x.qty - 1)) } : x))} className="w-7 h-7 border rounded">−</button>
              <span className="w-6 text-center">{l.qty}</span>
              <button onClick={() => adicionar(l.sku)} className="w-7 h-7 border rounded">+</button>
              <button onClick={() => setLinhas((p) => p.filter((x) => x.sku !== l.sku))}><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </div>))}
      </div>
      <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observação (opcional)" className="w-full border rounded-lg px-3 py-2 text-sm" />
      <div className="flex items-center justify-between"><div className="text-sm">Total levado: <b>{brl(total)}</b></div>
        <button disabled={!linhas.length || busy} onClick={confirmar} className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-40 flex items-center gap-1">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Entregar maleta, dar saída e imprimir romaneio</button></div>
    </Moldura>
  );
}

function Acerto({ m, onClose, onDone }: { m: Maleta; onClose: () => void; onDone: () => void }) {
  const itens = m.citrino_consignacao_itens;
  const [dev, setDev] = useState<Record<string, { qty: number; codes: string[] }>>({});
  const [aviso, setAviso] = useState('');
  const [busy, setBusy] = useState(false);
  const get = (sku: string) => dev[sku.toLowerCase()] || { qty: 0, codes: [] };

  const { allProducts } = useCitrinoStore();
  const ler = (code: string) => {
    const prod = acharProduto(allProducts as any[], code);
    const sku = String(prod?.sku ?? skuDe(code)).toLowerCase();
    const it = itens.find((i) => i.sku.toLowerCase() === sku);
    if (!it) { setAviso(`${code} não faz parte desta maleta`); return; }
    const cur = get(it.sku); const unico = code.includes('#');
    if (unico) {
      if (it.codigos_saida.length && !it.codigos_saida.includes(code)) { setAviso(`Peça ${code} não saiu nesta maleta`); return; }
      if (cur.codes.includes(code)) { setAviso(`Peça ${code} já foi lida`); return; }
    }
    if (cur.qty + 1 > it.qtd_levada) { setAviso(`Já leu todas as ${it.sku} que saíram`); return; }
    setAviso('');
    setDev((p) => ({ ...p, [sku]: { qty: cur.qty + 1, codes: unico ? [...cur.codes, code] : cur.codes } }));
  };
  const ajustar = (sku: string, max: number, delta: number) => setDev((p) => {
    const cur = p[sku.toLowerCase()] || { qty: 0, codes: [] };
    const qty = Math.min(max, Math.max(0, cur.qty + delta));
    return { ...p, [sku.toLowerCase()]: { qty, codes: cur.codes.slice(0, qty) } };
  });

  const vendidoCents = itens.reduce((t, i) => t + (i.qtd_levada - get(i.sku).qty) * i.unit_cents, 0);
  const comissao = Math.round(vendidoCents * Number(m.comissao_percent) / 100);
  const confirmar = async () => {
    if (!confirm(`Confirmar o acerto? O que não foi lido (${itens.reduce((t, i) => t + i.qtd_levada - get(i.sku).qty, 0)} peça(s)) será contado como vendido.`)) return;
    setBusy(true);
    const { error } = await supabase.rpc('citrino_consig_acertar', { _id: m.id, _devolvidos: itens.map((i) => ({ sku: i.sku, qty: get(i.sku).qty, codes: get(i.sku).codes })) });
    setBusy(false);
    if (error) setAviso(error.message); else onDone();
  };
  return (
    <Moldura titulo={`Acerto da maleta #${m.numero} — ${m.revendedora_nome || 'sem revendedora'}`} onClose={onClose}>
      <p className="text-sm text-gray-500">Leia <b>as peças que sobraram</b> (devolvidas). O que não for lido conta como vendido.</p>
      <Leitor onCode={ler} />
      {aviso && <div className="text-sm text-red-600">{aviso}</div>}
      <div className="border rounded-lg divide-y">
        {itens.map((i) => { const d = get(i.sku); return (
          <div key={i.id} className="p-2.5 flex items-center justify-between gap-2 text-sm">
            <div className="min-w-0"><div className="truncate">{i.sku} · {i.nome}</div><div className="text-xs text-gray-400">Levou {i.qtd_levada} · {brl(i.unit_cents)} cada · vendeu <b>{i.qtd_levada - d.qty}</b></div></div>
            <div className="flex items-center gap-2"><span className="text-xs text-gray-500">devolveu</span>
              <button onClick={() => ajustar(i.sku, i.qtd_levada, -1)} className="w-7 h-7 border rounded">−</button><span className="w-6 text-center">{d.qty}</span><button onClick={() => ajustar(i.sku, i.qtd_levada, 1)} className="w-7 h-7 border rounded">+</button></div>
          </div>); })}
      </div>
      <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
        <div className="flex justify-between"><span>Total vendido</span><b>{brl(vendidoCents)}</b></div>
        <div className="flex justify-between"><span>Comissão da revendedora ({m.comissao_percent}%)</span><b>{brl(comissao)}</b></div>
        <div className="flex justify-between text-base"><span>Valor a receber da revendedora</span><b>{brl(vendidoCents - comissao)}</b></div>
      </div>
      <div className="flex justify-end"><button disabled={busy} onClick={confirmar} className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm flex items-center gap-1">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Concluir acerto e imprimir comprovante</button></div>
    </Moldura>
  );
}

function Detalhes({ m, onClose, onCancel }: { m: Maleta; onClose: () => void; onCancel: () => void }) {
  return (
    <Moldura titulo={`Maleta #${m.numero} — ${m.revendedora_nome || 'sem revendedora'}`} onClose={onClose}>
      <div className="text-xs text-gray-500">Saída {dt(m.saida_em)}{m.acerto_em && ` · Encerrada ${dt(m.acerto_em)}`}{m.obs && ` · ${m.obs}`}</div>
      <div className="border rounded-lg divide-y text-sm">
        {m.citrino_consignacao_itens.map((i) => (
          <div key={i.id} className="p-2.5 flex justify-between gap-2"><span className="truncate">{i.sku} · {i.nome}</span>
            <span className="text-gray-600 whitespace-nowrap">levou {i.qtd_levada}{m.status === 'encerrada' && ` · voltou ${i.qtd_devolvida} · vendeu ${i.qtd_levada - i.qtd_devolvida}`}</span></div>))}
      </div>
      {m.status === 'encerrada' && <div className="text-sm">Vendido {brl(m.total_vendido_cents)} · Comissão {brl(m.comissao_cents)} · <b>A receber {brl(m.a_receber_cents)}</b></div>}
      {m.status !== 'cancelada' && <button onClick={() => imprimirRomaneio(m)} className="px-3 py-1.5 text-sm border rounded-lg flex items-center gap-1"><Printer className="w-4 h-4" />{m.status === 'aberta' ? 'Imprimir romaneio de entrega' : 'Imprimir comprovante de acerto'}</button>}
      {m.status === 'aberta' && <button onClick={onCancel} className="text-sm text-red-600 underline">Cancelar maleta (devolve tudo ao estoque)</button>}
    </Moldura>
  );
}

function Revendedoras({ revs, onSaved }: { revs: Rev[]; onSaved: () => void }) {
  const vazio = { nome: '', telefone: '', comissao_percent: '30' };
  const [f, setF] = useState(vazio);
  const [erro, setErro] = useState('');
  const salvar = async () => {
    setErro('');
    const { error } = await supabase.from('citrino_revendedoras').insert({ nome: f.nome.trim(), telefone: f.telefone.trim() || null, comissao_percent: Number(f.comissao_percent) || 0 });
    if (error) setErro(error.message); else { setF(vazio); onSaved(); }
  };
  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-xl p-4 grid md:grid-cols-4 gap-2">
        <input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} placeholder="Nome" className="border rounded-lg px-3 py-2 text-sm md:col-span-2" />
        <input value={f.telefone} onChange={(e) => setF({ ...f, telefone: e.target.value })} placeholder="WhatsApp" className="border rounded-lg px-3 py-2 text-sm" />
        <input value={f.comissao_percent} onChange={(e) => setF({ ...f, comissao_percent: e.target.value })} placeholder="Comissão %" inputMode="decimal" className="border rounded-lg px-3 py-2 text-sm" />
        <button disabled={f.nome.trim().length < 2} onClick={salvar} className="md:col-span-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-40">Cadastrar revendedora</button>
        {erro && <div className="md:col-span-4 text-sm text-red-600">{erro}</div>}
      </div>
      {revs.map((r) => (
        <div key={r.id} className="bg-white border rounded-xl p-3 flex items-center justify-between text-sm">
          <div><b>{r.nome}</b> <span className="text-gray-500">· {r.telefone || 'sem telefone'} · comissão {r.comissao_percent}%</span></div>
          <button onClick={async () => { await supabase.from('citrino_revendedoras').update({ ativo: !r.ativo }).eq('id', r.id); onSaved(); }} className={`text-xs px-2 py-1 rounded-full ${r.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{r.ativo ? 'Ativa' : 'Inativa'}</button>
        </div>))}
    </div>
  );
}

function Etiquetas() {
  const { allProducts } = useCitrinoStore();
  const [sel, setSel] = useState<Record<string, number>>({});
  const [modo, setModo] = useState<'modelo' | 'peca'>('modelo');
  const [busca, setBusca] = useState('');
  const lista = useMemo(() => allProducts.filter((p: any) => p.sku && `${p.sku} ${p.name}`.toLowerCase().includes(busca.toLowerCase())).slice(0, 40), [allProducts, busca]);
  const rotulos = useMemo(() => {
    const out: { code: string; nome: string; preco: number }[] = [];
    for (const p of allProducts as any[]) {
      const n = sel[p.id] || 0;
      for (let i = 0; i < n; i++) out.push({ code: modo === 'modelo' ? p.sku : `${p.sku}#${Math.random().toString(36).slice(2, 7).toUpperCase()}`, nome: p.name, preco: Number(p.promoPrice) > 0 ? Number(p.promoPrice) : Number(p.price) });
    }
    return out;
  }, [sel, modo, allProducts]);

  const imprimir = () => {
    const w = window.open('', '_blank'); if (!w) return;
    const svgs = rotulos.map((r) => {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(s, r.code, { format: 'CODE128', height: 40, width: 1.6, fontSize: 11, margin: 2 });
      return `<div class="e">${s.outerHTML}<div class="n">${r.nome.slice(0, 34)}</div><div class="p">${r.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></div>`;
    }).join('');
    w.document.write(`<html><head><title>Etiquetas</title><style>body{font-family:Arial;margin:8px}.e{display:inline-block;width:200px;border:1px dashed #bbb;padding:4px;margin:3px;text-align:center}.n{font-size:10px}.p{font-weight:bold;font-size:12px}svg{max-width:100%}</style></head><body>${svgs}<script>onload=()=>print()</script></body></html>`);
    w.document.close();
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-3 text-sm items-center flex-wrap">
        <label className="flex items-center gap-1"><input type="radio" checked={modo === 'modelo'} onChange={() => setModo('modelo')} />Um código por modelo (SKU)</label>
        <label className="flex items-center gap-1"><input type="radio" checked={modo === 'peca'} onChange={() => setModo('peca')} />Um código único por peça</label>
      </div>
      <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar peça" className="w-full border rounded-lg px-3 py-2 text-sm" />
      <div className="bg-white border rounded-xl divide-y max-h-80 overflow-y-auto">
        {lista.map((p: any) => (
          <div key={p.id} className="p-2.5 flex items-center justify-between text-sm gap-2"><span className="truncate">{p.sku} · {p.name}</span>
            <input type="number" min={0} value={sel[p.id] || ''} placeholder="qtd" onChange={(e) => setSel({ ...sel, [p.id]: Math.max(0, Number(e.target.value) || 0) })} className="w-20 border rounded px-2 py-1" /></div>))}
      </div>
      <button disabled={!rotulos.length} onClick={imprimir} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm flex items-center gap-1 disabled:opacity-40"><Printer className="w-4 h-4" />Imprimir {rotulos.length} etiqueta(s)</button>
      <p className="text-xs text-gray-400">Se a peça já tem código de barras da embalagem, não precisa etiqueta: cadastre o código no produto. Imprima em impressora comum (papel adesivo) ou de etiquetas. As etiquetas "por peça" geram códigos novos a cada impressão.</p>
    </div>
  );
}

function Relatorios({ maletas, revs }: { maletas: Maleta[]; revs: Rev[] }) {
  const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
  const [de, setDe] = useState(hoje.slice(0, 8) + '01');
  const [ate, setAte] = useState(hoje);
  const [rev, setRev] = useState('');
  const [status, setStatus] = useState('');
  const dia = (s: string) => new Date(s).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
  const lista = useMemo(() => maletas.filter((m) => m.status !== 'cancelada' || status === 'cancelada')
    .filter((m) => (!de || dia(m.saida_em) >= de) && (!ate || dia(m.saida_em) <= ate))
    .filter((m) => !rev || (rev === 'sem' ? !m.revendedora_id : m.revendedora_id === rev))
    .filter((m) => !status || m.status === status), [maletas, de, ate, rev, status]);
  const soma = (f: (m: Maleta) => number) => lista.reduce((t, m) => t + f(m), 0);
  const acertadas = lista.filter((m) => m.status === 'encerrada');

  const porRev = useMemo(() => {
    const mp = new Map<string, { nome: string; maletas: number; levado: number; vendido: number; comissao: number; receber: number }>();
    for (const m of lista) {
      const k = m.revendedora_nome || 'Sem revendedora';
      const o = mp.get(k) || { nome: k, maletas: 0, levado: 0, vendido: 0, comissao: 0, receber: 0 };
      o.maletas++; o.levado += m.total_levado_cents;
      if (m.status === 'encerrada') { o.vendido += m.total_vendido_cents; o.comissao += m.comissao_cents; o.receber += m.a_receber_cents; }
      mp.set(k, o);
    }
    return [...mp.values()].sort((x, y) => y.vendido - x.vendido);
  }, [lista]);
  const topPecas = useMemo(() => {
    const mp = new Map<string, { sku: string; nome: string; qtd: number; valor: number }>();
    for (const m of acertadas) for (const i of m.citrino_consignacao_itens) {
      const v = i.qtd_levada - i.qtd_devolvida; if (v <= 0) continue;
      const o = mp.get(i.sku) || { sku: i.sku, nome: i.nome, qtd: 0, valor: 0 };
      o.qtd += v; o.valor += v * i.unit_cents; mp.set(i.sku, o);
    }
    return [...mp.values()].sort((x, y) => y.qtd - x.qtd).slice(0, 10);
  }, [acertadas]);

  const exportar = () => {
    const cab = ['Maleta', 'Revendedora', 'Status', 'Saída', 'Acerto', 'Levado (R$)', 'Vendido (R$)', 'Comissão (R$)', 'A receber (R$)'];
    const n = (c: number) => (c / 100).toFixed(2).replace('.', ',');
    const rows = lista.map((m) => [m.numero, m.revendedora_nome || '', m.status, dt(m.saida_em), dt(m.acerto_em), n(m.total_levado_cents), n(m.total_vendido_cents), n(m.comissao_cents), n(m.a_receber_cents)]);
    const csv = [cab, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    const el = document.createElement('a'); el.href = url; el.download = `consignacao-${de}-a-${ate}.csv`; el.click(); URL.revokeObjectURL(url);
  };
  const imprimir = () => window.print();

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-xl p-3 grid grid-cols-2 md:grid-cols-5 gap-2 items-end text-sm print:hidden">
        <label className="flex flex-col gap-1">De<input type="date" value={de} onChange={(e) => setDe(e.target.value)} className="border rounded-lg px-2 py-2" /></label>
        <label className="flex flex-col gap-1">Até<input type="date" value={ate} onChange={(e) => setAte(e.target.value)} className="border rounded-lg px-2 py-2" /></label>
        <label className="flex flex-col gap-1">Revendedora
          <select value={rev} onChange={(e) => setRev(e.target.value)} className="border rounded-lg px-2 py-2"><option value="">Todas</option><option value="sem">Sem revendedora</option>{revs.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}</select></label>
        <label className="flex flex-col gap-1">Situação
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-2 py-2"><option value="">Abertas e acertadas</option><option value="aberta">Só abertas</option><option value="encerrada">Só acertadas</option><option value="cancelada">Canceladas</option></select></label>
        <div className="flex gap-2"><button onClick={exportar} className="flex-1 px-3 py-2 border rounded-lg flex items-center justify-center gap-1"><Download className="w-4 h-4" />Excel</button>
          <button onClick={imprimir} className="flex-1 px-3 py-2 border rounded-lg flex items-center justify-center gap-1"><Printer className="w-4 h-4" />Imprimir</button></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[['Maletas', String(lista.length)], ['Levado', brl(soma((m) => m.total_levado_cents))], ['Vendido', brl(soma((m) => m.total_vendido_cents))], ['Comissões', brl(soma((m) => m.comissao_cents))], ['A receber', brl(soma((m) => m.a_receber_cents))]].map(([t, v]) => (
          <div key={t} className="bg-white rounded-xl border p-3"><div className="text-xs text-gray-500">{t}</div><div className="text-lg font-bold">{v}</div></div>))}
      </div>

      <div className="bg-white border rounded-xl overflow-x-auto">
        <div className="px-3 pt-3 font-semibold text-sm">Por revendedora</div>
        <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="p-2">Revendedora</th><th className="p-2 text-right">Maletas</th><th className="p-2 text-right">Levado</th><th className="p-2 text-right">Vendido</th><th className="p-2 text-right">Comissão</th><th className="p-2 text-right">A receber</th></tr></thead>
          <tbody>{porRev.map((r) => <tr key={r.nome} className="border-t"><td className="p-2">{r.nome}</td><td className="p-2 text-right">{r.maletas}</td><td className="p-2 text-right">{brl(r.levado)}</td><td className="p-2 text-right">{brl(r.vendido)}</td><td className="p-2 text-right">{brl(r.comissao)}</td><td className="p-2 text-right font-semibold">{brl(r.receber)}</td></tr>)}
            {porRev.length === 0 && <tr><td colSpan={6} className="p-3 text-gray-400">Nada no período.</td></tr>}</tbody></table>
      </div>

      <div className="bg-white border rounded-xl overflow-x-auto">
        <div className="px-3 pt-3 font-semibold text-sm">Maletas do período</div>
        <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="p-2">Nº</th><th className="p-2">Revendedora</th><th className="p-2">Situação</th><th className="p-2">Saída</th><th className="p-2 text-right">Levado</th><th className="p-2 text-right">Vendido</th><th className="p-2 text-right">A receber</th></tr></thead>
          <tbody>{lista.map((m) => <tr key={m.id} className="border-t"><td className="p-2">#{m.numero}</td><td className="p-2">{m.revendedora_nome || '—'}</td><td className="p-2">{m.status === 'aberta' ? 'Aberta' : m.status === 'encerrada' ? 'Acertada' : 'Cancelada'}</td><td className="p-2">{dt(m.saida_em)}</td><td className="p-2 text-right">{brl(m.total_levado_cents)}</td><td className="p-2 text-right">{m.status === 'encerrada' ? brl(m.total_vendido_cents) : '—'}</td><td className="p-2 text-right">{m.status === 'encerrada' ? brl(m.a_receber_cents) : '—'}</td></tr>)}</tbody></table>
      </div>

      <div className="bg-white border rounded-xl overflow-x-auto">
        <div className="px-3 pt-3 font-semibold text-sm">Peças mais vendidas (maletas acertadas)</div>
        <table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="p-2">SKU</th><th className="p-2">Peça</th><th className="p-2 text-right">Vendidas</th><th className="p-2 text-right">Valor</th></tr></thead>
          <tbody>{topPecas.map((p) => <tr key={p.sku} className="border-t"><td className="p-2">{p.sku}</td><td className="p-2">{p.nome}</td><td className="p-2 text-right">{p.qtd}</td><td className="p-2 text-right">{brl(p.valor)}</td></tr>)}
            {topPecas.length === 0 && <tr><td colSpan={4} className="p-3 text-gray-400">Sem vendas acertadas no período.</td></tr>}</tbody></table>
      </div>
    </div>
  );
}
