import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Clock, AlertCircle, ShieldCheck, Download, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { confirmPayment, verifyCertificate, PublicCertificate, formatDateBR } from '../../services/checkout';
import { openCertificate } from '../../services/certificatePrint';
import { useCitrinoStore } from '../../services/store';

const NSU_RE = /^CIT\d{6}-[2-9A-HJ-NP-Z]{6}$/;
const TOKEN_RE = /^[A-Za-z0-9_.:-]{1,100}$/;

function readPending(): { nsu?: string; name?: string } {
  try {
    const raw = sessionStorage.getItem('citrino_pending_order');
    if (!raw) return {};
    const j = JSON.parse(raw);
    return typeof j === 'object' && j ? j : {};
  } catch {
    return {};
  }
}

export const PaymentReturnView: React.FC<{ onGoHome: () => void; onVerify: (code: string) => void }> = ({ onGoHome, onVerify }) => {
  const { clearCart, companySettings } = useCitrinoStore();
  const [state, setState] = useState<'checking' | 'paid' | 'pending' | 'error'>('checking');
  const [message, setMessage] = useState<string>('');
  const [certs, setCerts] = useState<PublicCertificate[]>([]);
  const params = useRef(new URLSearchParams(window.location.search));
  const orderNsu = params.current.get('order_nsu') || '';
  const pending = useRef(readPending());

  useEffect(() => {
    const transaction_nsu = params.current.get('transaction_nsu') || '';
    const slug = params.current.get('slug') || '';
    const receipt_url = params.current.get('receipt_url') || undefined;
    if (!NSU_RE.test(orderNsu) || !TOKEN_RE.test(transaction_nsu) || !TOKEN_RE.test(slug)) {
      setState('error');
      setMessage('Não encontramos os dados do pagamento neste endereço. Se você já pagou, fale com a loja no WhatsApp informando seu nome.');
      return;
    }

    let cancelled = false;
    let attempt = 0;
    const run = async () => {
      attempt += 1;
      try {
        const res = await confirmPayment({ order_nsu: orderNsu, transaction_nsu, slug, receipt_url });
        if (cancelled) return;
        if (res.success && res.status && res.status !== 'aguardando') {
          setState('paid');
          clearCart();
          try { sessionStorage.removeItem('citrino_pending_order'); } catch { /* ok */ }
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors: ['#C9A84C', '#1C1C1C', '#FAF8F4'] });
          const list = await Promise.all((res.certificados || []).map((c) => verifyCertificate(c).catch(() => null)));
          if (!cancelled) setCerts(list.filter(Boolean) as PublicCertificate[]);
          return;
        }
        if (attempt < 8) {
          setState('pending');
          setTimeout(run, 4000);
        } else {
          setState('pending');
          setMessage('A confirmação do banco ainda não chegou. Assim que chegar, a loja recebe seu pedido automaticamente.');
        }
      } catch (e: any) {
        if (cancelled) return;
        setState('error');
        setMessage(e?.message || 'Não foi possível confirmar agora.');
      }
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const whatsDigits = String(companySettings?.whatsapp || '').replace(/\D/g, '');
  const whatsLink = whatsDigits
    ? `https://wa.me/55${whatsDigits}?text=${encodeURIComponent(`Olá! Fiz o pedido ${orderNsu} no site da Citrino.`)}`
    : null;

  const download = (c: PublicCertificate) =>
    openCertificate({
      code: c.code,
      customerName: pending.current.nsu === orderNsu && pending.current.name ? pending.current.name : c.cliente,
      items: c.itens.map((name) => ({ name })),
      warranty: c.garantia,
      purchaseDate: c.data_compra,
      validUntil: c.valido_ate,
      orderRef: orderNsu,
    });

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      {state === 'checking' && (
        <>
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#C9A84C]" />
          <h1 className="text-2xl font-serif-luxury">Confirmando seu pagamento...</h1>
          <p className="text-sm text-[#666]">Estamos conferindo com a InfinitePay. Leva só alguns segundos.</p>
        </>
      )}
      {state === 'pending' && (
        <>
          <Clock className="w-12 h-12 mx-auto text-[#C9A84C]" />
          <h1 className="text-2xl font-serif-luxury">Pagamento em processamento</h1>
          <p className="text-sm text-[#666]">{message || 'Aguardando a confirmação do banco...'}</p>
          <p className="text-xs text-[#999]">Pedido {orderNsu}</p>
        </>
      )}
      {state === 'error' && (
        <>
          <AlertCircle className="w-12 h-12 mx-auto text-[#E8705A]" />
          <h1 className="text-2xl font-serif-luxury">Não conseguimos confirmar</h1>
          <p className="text-sm text-[#666]">{message}</p>
        </>
      )}
      {state === 'paid' && (
        <>
          <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-600" />
          <h1 className="text-3xl font-serif-luxury">Pagamento confirmado!</h1>
          <p className="text-sm text-[#666]">
            Pedido <strong>{orderNsu}</strong> recebido. A Citrino já está preparando suas peças com todo o carinho.
          </p>

          {certs.length > 0 && (
            <div className="bg-white border border-[#E8E4DC] rounded-2xl p-6 text-left space-y-4">
              <p className="flex items-center gap-2 font-semibold text-[#1C1C1C]">
                <ShieldCheck className="w-5 h-5 text-[#C9A84C]" /> Seu certificado de garantia
              </p>
              {certs.map((c) => (
                <div key={c.code} className="border border-[#F2ECE1] rounded-xl p-4 text-xs space-y-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-mono font-bold text-sm">{c.code}</span>
                    <span className="text-emerald-700 font-semibold">Garantia {c.garantia} • válida até {formatDateBR(c.valido_ate)}</span>
                  </div>
                  <p className="text-[#666]">{c.itens.join(', ')}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button onClick={() => download(c)} className="flex items-center gap-1.5 bg-[#1C1C1C] hover:bg-[#C9A84C] text-white px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-[11px]">
                      <Download className="w-3.5 h-3.5" /> Baixar certificado
                    </button>
                    <button onClick={() => onVerify(c.code)} className="px-4 py-2 rounded-lg border border-[#D5CFBF] hover:border-[#C9A84C] text-[11px] font-semibold">
                      Página de verificação
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-[#999]">Guarde o código. Ele é o que você informa para acionar a garantia. O certificado físico também segue junto com o pedido.</p>
            </div>
          )}
        </>
      )}

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        {whatsLink && (
          <a href={whatsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
            <Phone className="w-3.5 h-3.5" /> Falar com a loja
          </a>
        )}
        <button onClick={onGoHome} className="px-5 py-2.5 rounded-lg border border-[#D5CFBF] text-xs font-semibold hover:border-[#C9A84C]">
          Voltar para a loja
        </button>
      </div>
    </div>
  );
};
