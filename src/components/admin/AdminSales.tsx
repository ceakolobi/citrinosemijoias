// Pedidos reais (InfinitePay) + certificados de garantia.
// Quem protege os dados é o RLS do banco; aqui só escondemos botões que o papel não pode usar.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ShoppingBag, ShieldCheck, RefreshCw, Printer, Send, Plus, X, Search, Ban, RotateCcw, Truck, ExternalLink, Loader2,
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useCitrinoStore } from '../../services/store';
import { openCertificate } from '../../services/certificatePrint';
import { certificateUrl, formatBRL, formatDateBR } from '../../services/checkout';

type Pedido = {
  id: string; order_nsu: string; status: string; created_at: string; paid_at: string | null;
  customer: { name: string; email: string; phone: string; cpf: string };
  address: Record<string, string>; shipping: { name: string; cents: number; days: number };
  items: { name: string; sku: string; quantity: number; unit_cents: number; variation?: string | null; warranty: string }[];
  total_cents: number; payment: any; tracking_code: string | null; notes: string | null;
};
type Cert = {
  id: string; code: string; pedido_id: string | null; customer_name: string; customer_phone: string | null;
  order_ref: string | null; items: { name: string; variation?: string | null; quantity?: number }[];
  warranty: string; purchase_date: string; valid_until: string; revoked: boolean; notes: string | null; created_at: string;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  aguardando: { label: 'Aguardando pagamento', cls: 'bg-gray-100 text-gray-600' },
  pago: { label: 'Pago', cls: 'bg-emerald-100 text-emerald-700' },
  separacao: { label: 'Em separação', cls: 'bg-blue-100 text-blue-700' },
  enviado: { label: 'Enviado', cls: 'bg-indigo-100 text-indigo-700' },
  entregue: { label: 'Entregue', cls: 'bg-teal-100 text-teal-700' },
  cancelado: { label: 'Cancelado', cls: 'bg-red-100 text-red-700' },
};

const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
const waLink = (phone: string | null | undefined, text: string) => {
  const d = String(phone || '').replace(/\D/g, '');
  if (d.length < 10) return null;
  return `https://wa.me/${d.startsWith('55') && d.length > 11 ? d : `55${d}`}?text=${encodeURIComponent(text)}`;
};
const certMessage = (c: Cert) =>
  `Olá, ${c.customer_name.split(' ')[0]}! Aqui está o seu certificado de garantia Citrino Semijoias ✨\n\n` +
  `Código: ${c.code}\nGarantia: ${c.warranty} (válida até ${formatDateBR(c.valid_until)})\n\n` +
  `Confira a autenticidade aqui: ${certificateUrl(c.code)}\n\nGuarde este código para acionar a garantia. 💛`;
const printCert = (c: Cert) =>
  openCertificate({
    code: c.code, customerName: c.customer_name, items: c.items, warranty: c.warranty,
    purchaseDate: c.purchase_date, validUntil: c.valid_until, orderRef: c.order_ref, revoked: c.revoked,
  });

export const AdminSales: React.FC = () => {
  const { adminSession, allProducts } = useCitrinoStore();
  const canEdit = adminSession?.role === 'admin' || adminSession?.role === 'operador';
  const [tab, setTab] = useState<'pedidos' | 'certificados'>('pedidos');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [p, c] = await Promise.all([
      supabase.from('citrino_pedidos').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('citrino_certificados').select('*').order('created_at', { ascending: false }).limit(500),
    ]);
    if (p.error || c.error) setError('Não foi possível carregar. Saia e entre de novo no painel.');
    setPedidos((p.data || []) as Pedido[]);
    setCerts((c.data || []) as Cert[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const updatePedido = async (id: string, patch: Partial<Pedido>) => {
    const { error: e } = await supabase.from('citrino_pedidos').update(patch).eq('id', id);
    if (e) return alert(e.message.includes('pago') ? e.message : 'Não foi possível atualizar o pedido.');
    load();
  };
  const toggleRevoke = async (c: Cert) => {
    if (!confirm(c.revoked ? `Reativar o certificado ${c.code}?` : `Cancelar o certificado ${c.code}? Ele passa a aparecer como CANCELADO na verificação.`)) return;
    const { error: e } = await supabase.from('citrino_certificados').update({ revoked: !c.revoked }).eq('id', c.id);
    if (e) return alert('Não foi possível alterar o certificado.');
    load();
  };

  const filteredPedidos = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? pedidos.filter((p) => `${p.order_nsu} ${p.customer?.name} ${p.customer?.email}`.toLowerCase().includes(s)) : pedidos;
  }, [pedidos, q]);
  const filteredCerts = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? certs.filter((c) => `${c.code} ${c.customer_name} ${c.order_ref || ''}`.toLowerCase().includes(s)) : certs;
  }, [certs, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas & Garantias</h1>
          <p className="text-sm text-gray-500">Pedidos pagos pelo site (InfinitePay) e certificados de garantia.</p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 bg-[#C9A84C] hover:bg-[#B5943B] text-white px-4 py-2 rounded-lg text-sm font-semibold">
              <Plus className="w-4 h-4" /> Emitir certificado
            </button>
          )}
          <button onClick={load} className="flex items-center gap-1.5 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {([['pedidos', 'Pedidos do site', ShoppingBag, pedidos.length], ['certificados', 'Certificados', ShieldCheck, certs.length]] as const).map(([id, label, Icon, n]) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm ${tab === id ? 'bg-white shadow font-semibold' : 'text-gray-600'}`}>
              <Icon className="w-4 h-4" /> {label} <span className="text-xs text-gray-400">({n})</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, código ou pedido" className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      {tab === 'pedidos' && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y">
          {!loading && filteredPedidos.length === 0 && (
            <p className="p-8 text-center text-sm text-gray-500">Nenhum pedido pelo site ainda. Assim que um cliente pagar, ele aparece aqui.</p>
          )}
          {filteredPedidos.map((p) => {
            const st = STATUS[p.status] || STATUS.aguardando;
            const pc = certs.filter((c) => c.pedido_id === p.id);
            const isOpen = open === p.id;
            return (
              <div key={p.id} className="p-4">
                <button onClick={() => setOpen(isOpen ? null : p.id)} className="w-full flex flex-wrap items-center justify-between gap-2 text-left">
                  <div>
                    <p className="font-semibold text-gray-900">{p.customer?.name} <span className="font-mono text-xs text-gray-400 ml-1">{p.order_nsu}</span></p>
                    <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString('pt-BR')} • {p.items.reduce((a, i) => a + i.quantity, 0)} peça(s)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${st.cls}`}>{st.label}</span>
                    <span className="font-bold text-gray-900">{formatBRL(p.total_cents / 100)}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-700">Peças</p>
                      <ul className="text-xs space-y-1">
                        {p.items.map((i, k) => (
                          <li key={k}>{i.quantity}× {i.name}{i.variation ? ` (${i.variation})` : ''} — {formatBRL(i.unit_cents / 100)} • garantia {i.warranty}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500">Frete: {p.shipping?.name} ({formatBRL((p.shipping?.cents || 0) / 100)})</p>
                      {p.payment && (
                        <p className="text-xs text-gray-500">
                          Pago via {p.payment.capture_method === 'pix' ? 'PIX' : 'cartão'}{p.payment.installments > 1 ? ` em ${p.payment.installments}x` : ''}
                          {p.paid_at ? ` em ${new Date(p.paid_at).toLocaleString('pt-BR')}` : ''}
                          {p.payment.receipt_url && (
                            <> • <a href={p.payment.receipt_url} target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] underline inline-flex items-center gap-0.5">comprovante <ExternalLink className="w-3 h-3" /></a></>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-700">Entrega</p>
                      <p className="text-xs text-gray-600">
                        {p.address?.logradouro}, {p.address?.numero} {p.address?.complemento}<br />
                        {p.address?.bairro} — {p.address?.cidade}/{p.address?.uf} • CEP {p.address?.cep}
                      </p>
                      <p className="text-xs text-gray-600">{p.customer?.email} • {p.customer?.phone}</p>

                      {canEdit && p.paid_at && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {p.status === 'pago' && (
                            <button onClick={() => updatePedido(p.id, { status: 'separacao' })} className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50">Marcar em separação</button>
                          )}
                          {(p.status === 'pago' || p.status === 'separacao') && (
                            <button
                              onClick={() => {
                                const code = prompt('Código de rastreio (opcional):', p.tracking_code || '');
                                if (code === null) return;
                                updatePedido(p.id, { status: 'enviado', tracking_code: code.trim().slice(0, 40) || null });
                              }}
                              className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50 flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" /> Marcar enviado
                            </button>
                          )}
                          {p.status === 'enviado' && (
                            <button onClick={() => updatePedido(p.id, { status: 'entregue' })} className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50">Marcar entregue</button>
                          )}
                        </div>
                      )}
                      {p.tracking_code && <p className="text-xs">Rastreio: <span className="font-mono">{p.tracking_code}</span></p>}
                      {pc.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {pc.map((c) => (
                            <button key={c.id} onClick={() => printCert(c)} className="text-xs px-3 py-1.5 rounded bg-[#1C1C1C] text-white flex items-center gap-1">
                              <Printer className="w-3.5 h-3.5" /> Certificado {c.warranty}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'certificados' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr><th className="p-3 text-left">Código</th><th className="p-3 text-left">Cliente</th><th className="p-3 text-left">Garantia</th><th className="p-3 text-left">Válida até</th><th className="p-3 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y">
              {!loading && filteredCerts.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum certificado ainda.</td></tr>
              )}
              {filteredCerts.map((c) => {
                const wa = waLink(c.customer_phone, certMessage(c));
                const expired = c.valid_until < today();
                return (
                  <tr key={c.id} className={c.revoked ? 'opacity-50' : ''}>
                    <td className="p-3 font-mono text-xs">{c.code}{c.revoked && <span className="ml-1 text-red-600 font-sans font-semibold">CANCELADO</span>}</td>
                    <td className="p-3">{c.customer_name}<div className="text-xs text-gray-400">{c.items.map((i) => i.name).join(', ').slice(0, 70)}</div></td>
                    <td className="p-3">{c.warranty}</td>
                    <td className={`p-3 ${expired ? 'text-amber-600' : ''}`}>{formatDateBR(c.valid_until)}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1.5">
                        <button title="Imprimir / PDF" onClick={() => printCert(c)} className="p-2 rounded border hover:bg-gray-50"><Printer className="w-4 h-4" /></button>
                        {wa && !c.revoked && (
                          <a title="Enviar no WhatsApp do cliente" href={wa} target="_blank" rel="noopener noreferrer" className="p-2 rounded border hover:bg-emerald-50 text-emerald-700"><Send className="w-4 h-4" /></a>
                        )}
                        {canEdit && (
                          <button title={c.revoked ? 'Reativar' : 'Cancelar'} onClick={() => toggleRevoke(c)} className="p-2 rounded border hover:bg-gray-50">
                            {c.revoked ? <RotateCcw className="w-4 h-4" /> : <Ban className="w-4 h-4 text-red-600" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showNew && <NewCertificateModal products={allProducts || []} onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); setTab('certificados'); setQ(''); load(); }} />}
    </div>
  );
};

const NewCertificateModal: React.FC<{ products: any[]; onClose: () => void; onSaved: () => void }> = ({ products, onClose, onSaved }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(today());
  const [warranty, setWarranty] = useState<'6 meses' | '1 ano'>('6 meses');
  const [orderRef, setOrderRef] = useState('');
  const [items, setItems] = useState<{ name: string; quantity: number }[]>([]);
  const [pick, setPick] = useState('');
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const matches = useMemo(() => {
    const s = pick.trim().toLowerCase();
    if (s.length < 2) return [];
    return products.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(s)).slice(0, 8);
  }, [pick, products]);

  const add = (n: string) => {
    const v = n.trim().slice(0, 120);
    if (!v || items.length >= 30) return;
    setItems((prev) => [...prev, { name: v, quantity: 1 }]);
    setPick('');
    setCustom('');
  };

  const save = async () => {
    setErr(null);
    const phoneDigits = phone.replace(/\D/g, '');
    if (name.trim().length < 3) return setErr('Informe o nome completo do cliente.');
    if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 11)) return setErr('WhatsApp inválido (DDD + número).');
    if (items.length === 0) return setErr('Adicione pelo menos uma peça.');
    setSaving(true);
    const { data, error } = await supabase
      .from('citrino_certificados')
      .insert({
        customer_name: name.trim(),
        customer_phone: phoneDigits || null,
        order_ref: orderRef.trim().slice(0, 40) || null,
        items,
        warranty,
        purchase_date: date,
        valid_until: date, // o banco recalcula
      })
      .select('*')
      .single();
    setSaving(false);
    if (error || !data) return setErr('Não foi possível emitir. Confira os dados e tente de novo.');
    onSaved();
  };

  const inp = 'w-full border border-gray-300 rounded-lg p-2 text-sm';
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#C9A84C]" /> Emitir certificado</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <p className="text-xs text-gray-500">Para vendas feitas fora do site (WhatsApp, Instagram, presencial). Vendas pagas pelo site já geram o certificado sozinhas.</p>
        <div className="space-y-3 text-sm">
          <div><label className="text-xs font-semibold">Nome completo do cliente *</label><input className={inp} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold">WhatsApp do cliente</label><input className={inp} inputMode="tel" placeholder="(47) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div><label className="text-xs font-semibold">Data da compra *</label><input type="date" max={today()} className={inp} value={date} onChange={(e) => setDate(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold">Garantia *</label>
              <select className={inp} value={warranty} onChange={(e) => setWarranty(e.target.value as any)}>
                <option value="6 meses">6 meses (oficial)</option>
                <option value="1 ano">1 ano (estendida)</option>
              </select>
            </div>
            <div><label className="text-xs font-semibold">Nº do pedido (opcional)</label><input className={inp} maxLength={40} value={orderRef} onChange={(e) => setOrderRef(e.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Peças *</label>
            <div className="relative">
              <input className={inp} placeholder="Buscar no catálogo (nome ou SKU)" value={pick} onChange={(e) => setPick(e.target.value)} />
              {matches.length > 0 && (
                <div className="absolute z-10 left-0 right-0 bg-white border rounded-lg shadow mt-1 max-h-48 overflow-y-auto">
                  {matches.map((p) => (
                    <button key={p.id} onClick={() => add(p.name)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">{p.name} <span className="text-gray-400">{p.sku}</span></button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input className={inp} placeholder="...ou digite o nome da peça" value={custom} maxLength={120} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(custom); } }} />
              <button onClick={() => add(custom)} className="px-3 rounded-lg border text-xs">Adicionar</button>
            </div>
            {items.length > 0 && (
              <ul className="space-y-1">
                {items.map((it, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs bg-gray-50 rounded px-2 py-1">
                    <input type="number" min={1} max={20} value={it.quantity} onChange={(e) => setItems(items.map((x, k) => (k === i ? { ...x, quantity: Math.max(1, Math.min(20, Number(e.target.value) || 1)) } : x)))} className="w-12 border rounded px-1" />
                    <span className="flex-1">{it.name}</span>
                    <button onClick={() => setItems(items.filter((_, k) => k !== i))}><X className="w-3.5 h-3.5 text-gray-400" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
          <button disabled={saving} onClick={save} className="px-4 py-2 bg-[#1C1C1C] text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Emitir certificado
          </button>
        </div>
      </div>
    </div>
  );
};
