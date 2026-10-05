import React, { useMemo, useState } from 'react';
import { ShieldCheck, Lock, Truck, ArrowLeft, Loader2, AlertCircle, CreditCard, QrCode } from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { ShippingAddress } from '../../types';
import { SHIPPING_OPTIONS, startCheckout, formatBRL } from '../../services/checkout';

interface CheckoutViewProps {
  onBackToCatalog: () => void;
  onNavigateTracking?: (orderNumber: string) => void;
}

const inputCls =
  'w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none';

const maskCpf = (v: string) =>
  v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};
const maskCep = (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onBackToCatalog }) => {
  const { cart, cartSubtotal, currentCustomer, companySettings } = useCitrinoStore();

  const [customerName, setCustomerName] = useState(currentCustomer?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentCustomer?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentCustomer?.phone || '');
  const [customerCpf, setCustomerCpf] = useState(currentCustomer?.document || '');
  const [address, setAddress] = useState<ShippingAddress>({
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
  });
  const [shippingId, setShippingId] = useState('pac');
  const [cepLoading, setCepLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const freeFrom = Number(companySettings?.freeShippingThreshold) || 299;
  const options = useMemo(() => SHIPPING_OPTIONS(cartSubtotal, freeFrom), [cartSubtotal, freeFrom]);
  const shipping = options.find((o) => o.id === shippingId) || options[0];
  const total = cartSubtotal + shipping.price;
  const cepOk = address.cep.replace(/\D/g, '').length === 8;

  const lookupCep = async (raw: string) => {
    const cep = maskCep(raw);
    setAddress((a) => ({ ...a, cep }));
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const j = await r.json();
      if (!j?.erro) {
        setAddress((a) => ({
          ...a,
          logradouro: j.logradouro || a.logradouro,
          bairro: j.bairro || a.bairro,
          cidade: j.localidade || a.cidade,
          uf: j.uf || a.uf,
        }));
      }
    } catch {
      /* preenche manualmente */
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!cepOk) return setError('Informe um CEP válido.');
    setSubmitting(true);
    try {
      const res = await startCheckout({
        customer: { name: customerName, email: customerEmail, phone: customerPhone, cpf: customerCpf },
        address,
        shippingId: shipping.id,
        cart,
      });
      try {
        // nome fica só neste navegador, para o comprador baixar o próprio certificado nominal
        sessionStorage.setItem('citrino_pending_order', JSON.stringify({ nsu: res.order_nsu, name: customerName.trim() }));
      } catch {
        /* ok */
      }
      window.location.href = res.url; // página oficial de pagamento da InfinitePay
    } catch (err: any) {
      setError(err?.message || 'Não foi possível iniciar o pagamento.');
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-serif-luxury text-[#1C1C1C]">Seu carrinho está vazio</h1>
        <p className="text-sm text-[#666]">Navegue pelo catálogo e escolha suas peças antes de finalizar.</p>
        <button onClick={onBackToCatalog} className="bg-[#1C1C1C] hover:bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-lg transition">
          Ver catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 flex items-center justify-between border-b border-[#E8E4DC] pb-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#C9A84C] font-semibold">Pagamento seguro InfinitePay</span>
          <h1 className="text-3xl font-serif-luxury text-[#1C1C1C] mt-0.5">Finalizar Compra</h1>
        </div>
        <button onClick={onBackToCatalog} className="text-xs text-[#666] hover:text-[#C9A84C] flex items-center gap-1 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Dados */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DC] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="w-5 h-5 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-[10px]">1</span>
              Seus dados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-[#333]">Nome completo * <span className="font-normal text-[#888]">(vai no certificado de garantia)</span></label>
                <input type="text" required minLength={3} maxLength={120} autoComplete="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome e sobrenome" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#333]">E-mail *</label>
                <input type="email" required maxLength={120} autoComplete="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="voce@email.com" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#333]">CPF *</label>
                <input type="text" required inputMode="numeric" value={customerCpf} onChange={(e) => setCustomerCpf(maskCpf(e.target.value))} placeholder="000.000.000-00" className={inputCls} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-[#333]">WhatsApp *</label>
                <input type="tel" required inputMode="tel" autoComplete="tel" value={customerPhone} onChange={(e) => setCustomerPhone(maskPhone(e.target.value))} placeholder="(47) 99999-9999" className={inputCls} />
              </div>
            </div>
          </div>

          {/* 2. Entrega */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DC] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="w-5 h-5 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-[10px]">2</span>
              Endereço de entrega
            </h3>
            <div className="grid grid-cols-6 gap-4 text-xs">
              <div className="space-y-1 col-span-6 sm:col-span-2">
                <label className="font-semibold text-[#333]">CEP *</label>
                <div className="relative">
                  <input type="text" required inputMode="numeric" autoComplete="postal-code" value={address.cep} onChange={(e) => lookupCep(e.target.value)} placeholder="00000-000" className={inputCls} />
                  {cepLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-2.5 top-2.5 text-[#C9A84C]" />}
                </div>
              </div>
              <div className="space-y-1 col-span-6 sm:col-span-4">
                <label className="font-semibold text-[#333]">Rua *</label>
                <input type="text" required maxLength={120} value={address.logradouro} onChange={(e) => setAddress({ ...address, logradouro: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="font-semibold text-[#333]">Número *</label>
                <input type="text" required maxLength={10} value={address.numero} onChange={(e) => setAddress({ ...address, numero: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-1 col-span-4">
                <label className="font-semibold text-[#333]">Complemento</label>
                <input type="text" maxLength={60} value={address.complemento} onChange={(e) => setAddress({ ...address, complemento: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-1 col-span-6 sm:col-span-2">
                <label className="font-semibold text-[#333]">Bairro *</label>
                <input type="text" required maxLength={80} value={address.bairro} onChange={(e) => setAddress({ ...address, bairro: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-1 col-span-4 sm:col-span-3">
                <label className="font-semibold text-[#333]">Cidade *</label>
                <input type="text" required maxLength={80} value={address.cidade} onChange={(e) => setAddress({ ...address, cidade: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="font-semibold text-[#333]">UF *</label>
                <input type="text" required maxLength={2} value={address.uf} onChange={(e) => setAddress({ ...address, uf: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })} className={`${inputCls} uppercase`} />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <p className="text-xs font-semibold text-[#333] flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#C9A84C]" /> Forma de envio</p>
              {options.map((o) => (
                <label key={o.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer text-xs transition ${shippingId === o.id ? 'border-[#C9A84C] bg-[#FDF9EE]' : 'border-[#E8E4DC] hover:border-[#C9A84C]/60'}`}>
                  <span className="flex items-center gap-2">
                    <input type="radio" name="shipping" checked={shippingId === o.id} onChange={() => setShippingId(o.id)} className="accent-[#C9A84C]" />
                    <span className="font-medium text-[#1C1C1C]">{o.name}</span>
                    <span className="text-[#888]">até {o.days} dias úteis</span>
                  </span>
                  <span className="font-semibold">{o.price === 0 ? <span className="text-emerald-700">Grátis</span> : formatBRL(o.price)}</span>
                </label>
              ))}
              {cartSubtotal < freeFrom && (
                <p className="text-[11px] text-[#888]">Frete grátis (PAC) acima de {formatBRL(freeFrom)}.</p>
              )}
            </div>
          </div>

          {/* 3. Pagamento */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DC] space-y-3 text-xs text-[#555]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="w-5 h-5 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-[10px]">3</span>
              Pagamento
            </h3>
            <p className="flex items-center gap-2"><QrCode className="w-4 h-4 text-[#C9A84C]" /> PIX com aprovação na hora</p>
            <p className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#C9A84C]" /> Cartão de crédito, com parcelamento</p>
            <p className="text-[11px] text-[#888]">
              Ao continuar, você vai para a página oficial e segura da InfinitePay para pagar. Seus dados de cartão
              nunca passam pelo site da Citrino. Depois do pagamento você volta para cá e recebe o seu certificado de garantia.
            </p>
          </div>
        </div>

        {/* Resumo */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-white p-6 rounded-2xl border border-[#E8E4DC] space-y-6 shadow-sm">
            <h3 className="font-serif-luxury text-xl font-medium text-[#1C1C1C] pb-3 border-b border-[#F2ECE1]">
              Resumo do pedido ({cart.reduce((a, b) => a + b.quantity, 0)} itens)
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 divide-y divide-gray-100">
              {cart.map((item, idx) => (
                <div key={idx} className="pt-2.5 first:pt-0 flex items-center gap-3 text-xs">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded object-cover border border-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1C1C1C] truncate">{item.product.name}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#777]">
                      <span>{item.quantity}x {item.selectedVariation ? `(${item.selectedVariation})` : ''}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">Garantia {item.selectedWarranty || '6 meses'}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-[#1C1C1C]">{formatBRL((item.product.promoPrice || item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-[#555] pt-3 border-t border-[#F2ECE1]">
              <div className="flex justify-between"><span>Produtos:</span><span className="font-semibold text-[#1C1C1C]">{formatBRL(cartSubtotal)}</span></div>
              <div className="flex justify-between">
                <span>Frete ({shipping.name}):</span>
                <span className="font-semibold text-[#1C1C1C]">{shipping.price === 0 ? <span className="text-emerald-700">Grátis</span> : formatBRL(shipping.price)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1C1C1C] pt-3 border-t border-[#F2ECE1]">
                <span>Total:</span><span className="text-xl">{formatBRL(total)}</span>
              </div>
              <p className="text-[10px] text-[#999]">O valor final é conferido pelo servidor com os preços atuais da loja.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={submitting} className="w-full bg-[#C9A84C] hover:bg-[#B5943B] disabled:opacity-60 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>{submitting ? 'Gerando pagamento...' : 'Ir para o pagamento'}</span>
            </button>

            <div className="space-y-2 pt-2 border-t border-gray-100 text-[11px] text-[#777] text-center">
              <p className="flex items-center justify-center gap-1.5 font-medium text-[#444]">
                <ShieldCheck className="w-4 h-4 text-[#C9A84C]" /> Certificado de garantia nominal em todas as peças
              </p>
              <p>Ao finalizar, você concorda com os termos de troca e a política de privacidade da Citrino Semijoias.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
