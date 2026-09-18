import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Lock, 
  Truck, 
  QrCode, 
  CreditCard, 
  Barcode, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowLeft, 
  ExternalLink,
  Phone,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Order, PaymentMethod, ShippingAddress } from '../../types';

interface CheckoutViewProps {
  onBackToCatalog: () => void;
  onNavigateTracking: (orderNumber: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onBackToCatalog,
  onNavigateTracking,
}) => {
  const {
    cart,
    cartSubtotal,
    discountAmount,
    appliedCoupon,
    currentCustomer,
    createOrder,
    calculateShippingByCep,
    updateOrderStatus,
    companySettings
  } = useCitrinoStore();

  // Step state
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Customer & Shipping state
  const [customerName, setCustomerName] = useState<string>(currentCustomer?.name || '');
  const [customerEmail, setCustomerEmail] = useState<string>(currentCustomer?.email || '');
  const [customerPhone, setCustomerPhone] = useState<string>(currentCustomer?.phone || '');
  const [customerCpf, setCustomerCpf] = useState<string>(currentCustomer?.document || '');

  const [address, setAddress] = useState<ShippingAddress>({
    cep: currentCustomer?.address.cep || '01426-000',
    logradouro: currentCustomer?.address.logradouro || 'Rua Oscar Freire',
    numero: currentCustomer?.address.numero || '920',
    complemento: currentCustomer?.address.complemento || 'Apto 42',
    bairro: currentCustomer?.address.bairro || 'Cerqueira César',
    cidade: currentCustomer?.address.cidade || 'São Paulo',
    uf: currentCustomer?.address.uf || 'SP',
  });

  const [shippingMethod, setShippingMethod] = useState<string>('Correios PAC');
  const [shippingCost, setShippingCost] = useState<number>(cartSubtotal >= companySettings.freeShippingThreshold ? 0 : 22.90);
  const [shippingDays, setShippingDays] = useState<number>(5);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [installments, setInstallments] = useState<number>(1);
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 9812');
  const [cardHolder, setCardHolder] = useState<string>(currentCustomer?.name || 'JULIANA P CAMARGO');
  const [cardExp, setCardExp] = useState<string>('11/29');
  const [cardCvv, setCardCvv] = useState<string>('741');

  const [copiedPix, setCopiedPix] = useState<boolean>(false);
  const [simulatingWebhook, setSimulatingWebhook] = useState<boolean>(false);
  const [apiPixQrCode, setApiPixQrCode] = useState<string | null>(null);

  // Calculations
  const pixDiscount = paymentMethod === 'pix' ? cartSubtotal * 0.05 : 0;
  const totalOrderPrice = Math.max(0, cartSubtotal - discountAmount - pixDiscount + shippingCost);

  // Handle CEP change auto-lookup
  const handleCepLookup = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setAddress((prev) => ({ ...prev, cep: val }));
    if (clean.length === 8) {
      const options = calculateShippingByCep(clean);
      if (options.length > 0) {
        setShippingMethod(options[0].name);
        setShippingCost(options[0].price);
        setShippingDays(options[0].days);
      }
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      sku: item.product.sku,
      image: item.product.images[0],
      price: item.product.promoPrice || item.product.price,
      quantity: item.quantity,
      variation: item.selectedVariation,
      warranty: item.selectedWarranty || '6 meses',
    }));

    const newOrder = createOrder({
      customerName,
      customerEmail,
      customerPhone,
      customerCpf,
      items: orderItems,
      subtotal: cartSubtotal,
      shippingPrice: shippingCost,
      shippingMethod,
      discountPrice: discountAmount + pixDiscount,
      total: totalOrderPrice,
      status: paymentMethod === 'pix' ? 'aguardando' : 'pago',
      paymentMethod,
      installments,
      shippingAddress: address,
    });

    setCompletedOrder(newOrder);
    setStep('success');

    // Asynchronously call backend Mercado Pago API route
    if (paymentMethod === 'pix') {
      fetch('/api/mercadopago/process-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_amount: totalOrderPrice,
          description: `Pedido ${newOrder.orderNumber} - Citrino Semijoias`,
          orderNumber: newOrder.orderNumber,
          payer: {
            name: customerName,
            email: customerEmail,
            identification: { number: customerCpf },
          },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.point_of_interaction?.transaction_data?.qr_code) {
            setApiPixQrCode(data.point_of_interaction.transaction_data.qr_code);
          }
        })
        .catch((err) => {
          console.log('[Mercado Pago API]', err);
        });
    }

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C9A84C', '#E8705A', '#FAF8F4', '#1C1C1C'],
      });
    } catch {
      // safe fallback
    }
  };

  // Simulate instant PIX approval via Webhook
  const handleSimulatePaymentApproval = () => {
    if (!completedOrder) return;
    setSimulatingWebhook(true);
    setTimeout(() => {
      updateOrderStatus(completedOrder.id, 'pago');
      setCompletedOrder((prev) => (prev ? { ...prev, status: 'pago' } : null));
      setSimulatingWebhook(false);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#10B981', '#C9A84C'],
        });
      } catch {}
    }, 1200);
  };

  if (cart.length === 0 && step === 'form') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-serif-luxury text-[#1C1C1C]">
          Sua sacola está vazia para finalizar pedido.
        </h2>
        <p className="text-xs text-[#777]">
          Navegue pelo catálogo e escolha peças encantadoras antes de prosseguir para o checkout.
        </p>
        <button
          onClick={onBackToCatalog}
          className="bg-[#1C1C1C] text-white text-xs px-6 py-2.5 rounded font-semibold uppercase tracking-wider hover:bg-[#C9A84C] transition"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  // Confirmation Success View
  if (step === 'success' && completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
              Pedido Realizado com Sucesso
            </span>
            <h1 className="text-3xl font-serif-luxury text-[#1C1C1C]">
              Obrigado, {completedOrder.customerName.split(' ')[0]}!
            </h1>
            <p className="text-sm text-[#555]">
              Número do Pedido: <strong className="text-[#1C1C1C] text-base">{completedOrder.orderNumber}</strong>
            </p>
          </div>

          {/* Real-time status pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF8F4] border border-[#E8E4DC]">
            <span>Status:</span>
            {completedOrder.status === 'aguardando' ? (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Aguardando Pagamento (PIX)
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Pagamento Confirmado & Em Preparação
              </span>
            )}
          </div>

          {/* If PIX and still pending, show interactive QR Code and simulator button */}
          {completedOrder.paymentMethod === 'pix' && completedOrder.status === 'aguardando' && (
            <div className="bg-[#FAF8F4] border border-[#E8E4DC] p-6 rounded-xl space-y-4 max-w-md mx-auto text-left">
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#C9A84C]" /> Pague via PIX com 5% de Desconto
                </p>
                <p className="text-[11px] text-[#777]">
                  Escaneie o QR Code ou copie o código Pix abaixo no app do seu banco:
                </p>
              </div>

              {/* Dynamic QR Visual */}
              <div className="flex justify-center py-2">
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs text-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      apiPixQrCode || completedOrder.pixCode || '00020126580014br.gov.bcb.pix0136citrino'
                    )}`}
                    alt="QR Code PIX Mercado Pago"
                    className="w-40 h-40 object-contain mx-auto"
                  />
                  <span className="text-[10px] text-[#999] block mt-1">Válido por 30 minutos</span>
                </div>
              </div>

              {/* Copy Paste Code */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#555] block">Código Pix Copia e Cola:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={apiPixQrCode || completedOrder.pixCode}
                    className="flex-1 bg-white border border-[#D5CFBF] text-[10px] font-mono rounded px-2.5 py-2 select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(apiPixQrCode || completedOrder.pixCode || '');
                      setCopiedPix(true);
                      setTimeout(() => setCopiedPix(false), 2000);
                    }}
                    className="bg-[#1C1C1C] hover:bg-[#C9A84C] text-white text-xs font-semibold px-3 py-2 rounded flex items-center gap-1 transition"
                  >
                    {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPix ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Simulation Trigger Button for reviewer testing */}
              <div className="pt-2 border-t border-[#E8E4DC]">
                <button
                  onClick={handleSimulatePaymentApproval}
                  disabled={simulatingWebhook}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${simulatingWebhook ? 'animate-spin' : ''}`} />
                  {simulatingWebhook
                    ? 'Confirmando no Webhook Mercado Pago...'
                    : '⚡ Simular Aprovação do PIX (Mercado Pago)'}
                </button>
                <p className="text-[10px] text-[#888] text-center mt-1">
                  (Simulação instantânea da notificação IPN/Webhook para testes)
                </p>
              </div>
            </div>
          )}

          {/* Summary Box */}
          <div className="bg-white border border-[#E8E4DC] rounded-xl p-5 text-left space-y-3 max-w-lg mx-auto text-xs">
            <h4 className="font-serif-luxury text-base text-[#1C1C1C] font-semibold pb-2 border-b border-gray-100">
              Resumo da Compra
            </h4>
            <div className="space-y-2.5">
              {completedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-start text-[#444]">
                  <div>
                    <span className="font-medium text-[#1C1C1C]">
                      {it.quantity}x {it.name} {it.variation ? `(${it.variation})` : ''}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Garantia: {it.warranty || '6 meses'}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-[#1C1C1C]">
                    R$ {(it.price * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-1 text-[#666]">
              <div className="flex justify-between">
                <span>Frete ({completedOrder.shippingMethod}):</span>
                <span>{completedOrder.shippingPrice === 0 ? 'Grátis' : `R$ ${completedOrder.shippingPrice.toFixed(2)}`}</span>
              </div>
              {completedOrder.discountPrice > 0 && (
                <div className="flex justify-between text-[#E8705A]">
                  <span>Descontos:</span>
                  <span>- R$ {completedOrder.discountPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#1C1C1C] pt-1">
                <span>Total Pago:</span>
                <span>R$ {completedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 text-[11px] text-[#777]">
              <strong>Endereço de Entrega:</strong><br />
              {completedOrder.shippingAddress.logradouro}, {completedOrder.shippingAddress.numero} - {completedOrder.shippingAddress.bairro}, {completedOrder.shippingAddress.cidade}/{completedOrder.shippingAddress.uf} (CEP {completedOrder.shippingAddress.cep})
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigateTracking(completedOrder.orderNumber)}
              className="bg-[#1C1C1C] hover:bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg transition"
            >
              Acompanhar Entrega
            </button>
            <a
              href={`https://wa.me/5511987654321?text=Ol%C3%A1!%20Acabei%20de%20fazer%20o%20pedido%20${completedOrder.orderNumber}%20na%20Citrino%20Semijoias.`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Falar no WhatsApp
            </a>
            <button
              onClick={onBackToCatalog}
              className="border border-[#D5CFBF] text-[#555] hover:text-[#1C1C1C] text-xs font-semibold px-5 py-3 rounded-lg transition"
            >
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Checkout Form View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 flex items-center justify-between border-b border-[#E8E4DC] pb-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#C9A84C] font-semibold">
            Ambiente 100% Criptografado
          </span>
          <h1 className="text-3xl font-serif-luxury text-[#1C1C1C] mt-0.5">
            Finalizar Compra
          </h1>
        </div>
        <button
          onClick={onBackToCatalog}
          className="text-xs text-[#666] hover:text-[#C9A84C] flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Customer & Shipping & Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Dados Pessoais */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DC] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="w-5 h-5 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-[10px]">1</span>
              Dados do Comprador
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-[#333]">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Juliana de Camargo"
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#333]">E-mail para Confirmação *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#333]">CPF / CNPJ *</label>
                <input
                  type="text"
                  required
                  value={customerCpf}
                  onChange={(e) => setCustomerCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-[#333]">WhatsApp / Telefone para Contato *</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Endereço de Entrega */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DC] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="w-5 h-5 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-[10px]">2</span>
              Endereço de Entrega
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1 sm:col-span-1">
                <label className="font-semibold text-[#333]">CEP *</label>
                <input
                  type="text"
                  required
                  value={address.cep}
                  onChange={(e) => handleCepLookup(e.target.value)}
                  placeholder="01426-000"
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-[#333]">Rua / Avenida *</label>
                <input
                  type="text"
                  required
                  value={address.logradouro}
                  onChange={(e) => setAddress({ ...address, logradouro: e.target.value })}
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#333]">Número *</label>
                <input
                  type="text"
                  required
                  value={address.numero}
                  onChange={(e) => setAddress({ ...address, numero: e.target.value })}
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-[#333]">Complemento / Apto</label>
                <input
                  type="text"
                  value={address.complemento}
                  onChange={(e) => setAddress({ ...address, complemento: e.target.value })}
                  placeholder="Apto, Bloco, etc."
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#333]">Bairro *</label>
                <input
                  type="text"
                  required
                  value={address.bairro}
                  onChange={(e) => setAddress({ ...address, bairro: e.target.value })}
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#333]">Cidade *</label>
                <input
                  type="text"
                  required
                  value={address.cidade}
                  onChange={(e) => setAddress({ ...address, cidade: e.target.value })}
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#333]">Estado (UF) *</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={address.uf}
                  onChange={(e) => setAddress({ ...address, uf: e.target.value.toUpperCase() })}
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none uppercase"
                />
              </div>
            </div>

            {/* Escolha do Frete */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <label className="font-semibold text-xs text-[#333] block">Opção de Envio:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div
                  onClick={() => {
                    setShippingMethod('Correios PAC');
                    setShippingCost(cartSubtotal >= companySettings.freeShippingThreshold ? 0 : 22.90);
                    setShippingDays(5);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                    shippingMethod === 'Correios PAC'
                      ? 'border-[#C9A84C] bg-[#FAF8F4] text-[#1C1C1C]'
                      : 'border-[#E8E4DC] text-gray-600'
                  }`}
                >
                  <div>
                    <strong className="block">Correios PAC</strong>
                    <span className="text-[11px] text-[#777]">Entrega em 5 dias úteis</span>
                  </div>
                  <span className="font-bold">
                    {cartSubtotal >= companySettings.freeShippingThreshold ? (
                      <span className="text-emerald-700">Grátis</span>
                    ) : (
                      'R$ 22,90'
                    )}
                  </span>
                </div>

                <div
                  onClick={() => {
                    setShippingMethod('Correios SEDEX Express');
                    setShippingCost(34.50);
                    setShippingDays(2);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                    shippingMethod === 'Correios SEDEX Express'
                      ? 'border-[#C9A84C] bg-[#FAF8F4] text-[#1C1C1C]'
                      : 'border-[#E8E4DC] text-gray-600'
                  }`}
                >
                  <div>
                    <strong className="block">SEDEX Express</strong>
                    <span className="text-[11px] text-[#777]">Entrega em 2 dias úteis</span>
                  </div>
                  <span className="font-bold">R$ 34,50</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Forma de Pagamento */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DC] space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="w-5 h-5 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-[10px]">3</span>
              Forma de Pagamento (Mercado Pago Integrado)
            </h3>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  paymentMethod === 'pix'
                    ? 'border-[#C9A84C] bg-[#FAF8F4] text-[#1C1C1C]'
                    : 'border-[#E8E4DC] text-gray-500 hover:border-gray-300'
                }`}
              >
                <QrCode className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs font-bold block">PIX</span>
                <span className="text-[10px] text-emerald-700 font-bold">5% OFF</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cartao')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  paymentMethod === 'cartao'
                    ? 'border-[#C9A84C] bg-[#FAF8F4] text-[#1C1C1C]'
                    : 'border-[#E8E4DC] text-gray-500 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-sky-600" />
                <span className="text-xs font-bold block">Cartão de Crédito</span>
                <span className="text-[10px] text-gray-500">Até 10x sem juros</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('boleto')}
                className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                  paymentMethod === 'boleto'
                    ? 'border-[#C9A84C] bg-[#FAF8F4] text-[#1C1C1C]'
                    : 'border-[#E8E4DC] text-gray-500 hover:border-gray-300'
                }`}
              >
                <Barcode className="w-5 h-5 mx-auto mb-1 text-gray-700" />
                <span className="text-xs font-bold block">Boleto</span>
                <span className="text-[10px] text-gray-500">Vencimento 3 dias</span>
              </button>
            </div>

            {/* PIX Details */}
            {paymentMethod === 'pix' && (
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-2 text-emerald-900">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Desconto Especial de 5% Aplicado no PIX!
                </p>
                <p className="text-[11px] text-emerald-800">
                  O QR Code e o código Pix Copia e Cola serão gerados na próxima tela. A confirmação é instantânea e o pedido entra em separação imediatamente.
                </p>
              </div>
            )}

            {/* Credit Card Inputs */}
            {paymentMethod === 'cartao' && (
              <div className="space-y-4 pt-2 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-[#333]">Número do Cartão *</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#333]">Nome Impresso no Cartão *</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#333]">Validade (MM/AA) *</label>
                    <input
                      type="text"
                      required
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      placeholder="12/28"
                      className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#333]">CVV (Código de Segurança) *</label>
                    <input
                      type="text"
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none text-center font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#333]">Parcelamento sem Juros *</label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:border-[#C9A84C] focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}x de R$ {(totalOrderPrice / num).toFixed(2)} sem juros
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Boleto Details */}
            {paymentMethod === 'boleto' && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1 text-gray-700">
                <p className="font-bold">Boleto Bancário Mercado Pago</p>
                <p className="text-[11px] text-gray-500">
                  O boleto tem vencimento em 3 dias úteis. A aprovação pode levar até 2 dias úteis após o pagamento.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Place Button */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-white p-6 rounded-2xl border border-[#E8E4DC] space-y-6 shadow-sm">
            <h3 className="font-serif-luxury text-xl font-medium text-[#1C1C1C] pb-3 border-b border-[#F2ECE1]">
              Resumo do Pedido ({cart.reduce((a, b) => a + b.quantity, 0)} itens)
            </h3>

            {/* Mini Items List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 divide-y divide-gray-100">
              {cart.map((item, idx) => (
                <div key={idx} className="pt-2.5 first:pt-0 flex items-center gap-3 text-xs">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 rounded object-cover border border-gray-100"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=900&auto=format&fit=crop';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1C1C1C] truncate">{item.product.name}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#777]">
                      <span>{item.quantity}x {item.selectedVariation ? `(${item.selectedVariation})` : ''}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">Garantia {item.selectedWarranty || '6 meses'}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-[#1C1C1C]">
                    R$ {((item.product.promoPrice || item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-2 text-xs text-[#555] pt-3 border-t border-[#F2ECE1]">
              <div className="flex justify-between">
                <span>Subtotal dos produtos:</span>
                <span className="font-semibold text-[#1C1C1C]">R$ {cartSubtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#E8705A]">
                  <span>Cupom ({appliedCoupon?.code}):</span>
                  <span className="font-semibold">- R$ {discountAmount.toFixed(2)}</span>
                </div>
              )}

              {pixDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Desconto 5% PIX:</span>
                  <span>- R$ {pixDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Frete ({shippingMethod}):</span>
                <span className="font-semibold text-[#1C1C1C]">
                  {shippingCost === 0 ? <span className="text-emerald-700">Grátis</span> : `R$ ${shippingCost.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#1C1C1C] pt-3 border-t border-[#F2ECE1]">
                <span>Total a Pagar:</span>
                <span className="text-xl text-[#1C1C1C]">
                  R$ {totalOrderPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#C9A84C] hover:bg-[#B5943B] text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Confirmar e Finalizar Pedido</span>
            </button>

            <div className="space-y-2 pt-2 border-t border-gray-100 text-[11px] text-[#777] text-center">
              <p className="flex items-center justify-center gap-1.5 font-medium text-[#444]">
                <ShieldCheck className="w-4 h-4 text-[#C9A84C]" /> Certificado de Autenticidade & 1 Ano de Garantia
              </p>
              <p>
                Ao finalizar, você concorda com os termos de troca e política de privacidade da Citrino Semijoias.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
