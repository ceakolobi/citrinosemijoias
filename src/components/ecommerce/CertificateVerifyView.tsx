import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Loader2, Search } from 'lucide-react';
import { verifyCertificate, PublicCertificate, CERT_CODE_RE, formatDateBR } from '../../services/checkout';

// Página pública de verificação: mostra só o primeiro nome + inicial, as peças e a validade.
export const CertificateVerifyView: React.FC<{ initialCode?: string }> = ({ initialCode = '' }) => {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [state, setState] = useState<'idle' | 'loading' | 'found' | 'notfound' | 'error'>('idle');
  const [cert, setCert] = useState<PublicCertificate | null>(null);

  const check = async (raw: string) => {
    const c = raw.trim().toUpperCase();
    if (!CERT_CODE_RE.test(c)) {
      setState('notfound');
      setCert(null);
      return;
    }
    setState('loading');
    try {
      const r = await verifyCertificate(c);
      setCert(r);
      setState(r ? 'found' : 'notfound');
      window.history.replaceState(null, '', `/garantia/${encodeURIComponent(c)}`);
    } catch {
      setState('error');
    }
  };

  useEffect(() => {
    if (initialCode) check(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  const badge = cert?.situacao === 'valido'
    ? { Icon: ShieldCheck, cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', text: 'Garantia válida' }
    : cert?.situacao === 'expirado'
      ? { Icon: ShieldAlert, cls: 'text-amber-700 bg-amber-50 border-amber-200', text: 'Garantia expirada' }
      : { Icon: ShieldX, cls: 'text-red-700 bg-red-50 border-red-200', text: 'Certificado cancelado' };

  return (
    <div className="max-w-xl mx-auto px-4 py-14 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[11px] uppercase tracking-widest text-[#C9A84C] font-semibold">Autenticidade Citrino</span>
        <h1 className="text-3xl font-serif-luxury text-[#1C1C1C]">Verificar certificado de garantia</h1>
        <p className="text-sm text-[#666]">Digite o código impresso no certificado (ex: CIT-ABCDE-23456).</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); check(code); }} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 15))}
          placeholder="CIT-XXXXX-XXXXX"
          className="flex-1 bg-white border border-[#D5CFBF] rounded-lg p-3 font-mono text-sm tracking-wider focus:border-[#C9A84C] focus:outline-none"
        />
        <button className="bg-[#1C1C1C] hover:bg-[#C9A84C] text-white px-5 rounded-lg flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
          {state === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Verificar
        </button>
      </form>

      {state === 'notfound' && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 text-center">
          Código não encontrado. Confira se digitou exatamente como está no certificado.
        </div>
      )}
      {state === 'error' && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-700 text-center">
          Não foi possível consultar agora. Tente novamente em instantes.
        </div>
      )}
      {state === 'found' && cert && (
        <div className="bg-white border border-[#E8E4DC] rounded-2xl p-6 space-y-4">
          <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-sm ${badge.cls}`}>
            <badge.Icon className="w-5 h-5" /> {badge.text}
          </div>
          <dl className="text-sm divide-y divide-[#F2ECE1]">
            <div className="flex justify-between py-2"><dt className="text-[#777]">Código</dt><dd className="font-mono font-bold">{cert.code}</dd></div>
            <div className="flex justify-between py-2"><dt className="text-[#777]">Cliente</dt><dd>{cert.cliente}</dd></div>
            <div className="flex justify-between gap-4 py-2"><dt className="text-[#777]">Peça(s)</dt><dd className="text-right">{cert.itens.join(', ')}</dd></div>
            <div className="flex justify-between py-2"><dt className="text-[#777]">Data da compra</dt><dd>{formatDateBR(cert.data_compra)}</dd></div>
            <div className="flex justify-between py-2"><dt className="text-[#777]">Garantia</dt><dd>{cert.garantia}</dd></div>
            <div className="flex justify-between py-2"><dt className="text-[#777]">Válida até</dt><dd className="font-semibold">{formatDateBR(cert.valido_ate)}</dd></div>
          </dl>
          <p className="text-[11px] text-[#999] text-center">Por privacidade, mostramos apenas o primeiro nome e a inicial do sobrenome.</p>
        </div>
      )}
    </div>
  );
};
