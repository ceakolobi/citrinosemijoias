import React, { useState } from 'react';
import { 
  Search, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Order } from '../../types';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  onBackToCatalog: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber = '',
  onBackToCatalog,
}) => {
  const { orders } = useCitrinoStore();
  const [searchInput, setSearchInput] = useState<string>(initialOrderNumber);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => {
    if (initialOrderNumber) {
      return orders.find((o) => o.orderNumber.toUpperCase() === initialOrderNumber.toUpperCase()) || null;
    }
    return orders[0] || null;
  });
  const [notFound, setNotFound] = useState<boolean>(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim().toUpperCase();
    if (!clean) return;

    const found = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === clean ||
        o.orderNumber.replace('#', '').toUpperCase() === clean ||
        o.customerCpf.replace(/\D/g, '') === clean.replace(/\D/g, '')
    );

    if (found) {
      setSearchedOrder(found);
      setNotFound(false);
    } else {
      setSearchedOrder(null);
      setNotFound(true);
    }
  };

  const getStepStatus = (stepName: string, orderStatus: string) => {
    const sequence = ['aguardando', 'pago', 'separacao', 'enviado', 'entregue'];
    const currentIdx = sequence.indexOf(orderStatus === 'cancelado' ? 'aguardando' : orderStatus);
    const stepIdx = sequence.indexOf(stepName);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
          Acompanhamento em Tempo Real
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif-luxury text-[#1C1C1C]">
          Rastreio de Pedido Citrino
        </h1>
        <p className="text-xs sm:text-sm text-[#666]">
          Consulte o status do seu pedido, código de envio dos Correios e prazo estimado de entrega.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Digite o nº do pedido (ex: #CIT-8201) ou CPF"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border border-[#D5CFBF] rounded-xl text-xs py-3 pl-10 pr-3 focus:outline-none focus:border-[#C9A84C] shadow-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        </div>
        <button
          type="submit"
          className="bg-[#1C1C1C] hover:bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-xs cursor-pointer"
        >
          Rastrear
        </button>
      </form>

      {/* Not Found */}
      {notFound && (
        <div className="bg-white rounded-xl border border-[#E8E4DC] p-8 text-center space-y-2 max-w-md mx-auto">
          <p className="font-serif-luxury text-lg text-[#1C1C1C]">Pedido não localizado.</p>
          <p className="text-xs text-[#777]">
            Verifique se digitou o número completo (exemplo: #CIT-8201) ou o CPF do comprador.
          </p>
        </div>
      )}

      {/* Order Tracking Card */}
      {searchedOrder && (
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-10 space-y-8 shadow-sm animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#C9A84C] font-bold">
                Pedido Selecionado
              </span>
              <h2 className="text-2xl font-serif-luxury text-[#1C1C1C]">
                {searchedOrder.orderNumber}
              </h2>
              <p className="text-xs text-[#777] mt-0.5">
                Cliente: {searchedOrder.customerName} • Realizado em {searchedOrder.createdAt}
              </p>
            </div>

            {searchedOrder.trackingCode && (
              <div className="bg-[#FAF8F4] border border-[#D5CFBF] px-4 py-2 rounded-xl text-right">
                <span className="text-[10px] uppercase font-bold text-[#888] block">Código dos Correios:</span>
                <span className="text-sm font-mono font-bold text-[#1C1C1C]">
                  {searchedOrder.trackingCode}
                </span>
              </div>
            )}
          </div>

          {/* Step Timeline */}
          <div className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2 relative">
              {[
                { id: 'aguardando', title: '1. Pedido Recebido', desc: 'Aguardando validação' },
                { id: 'pago', title: '2. Pago & Aprovado', desc: 'Emissão da nota' },
                { id: 'enviado', title: '3. Despachado', desc: 'Em trânsito postal' },
                { id: 'entregue', title: '4. Entregue', desc: 'Recebido com sucesso' },
              ].map((st, i) => {
                const statusKind = getStepStatus(st.id, searchedOrder.status);
                return (
                  <div key={st.id} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition z-10 ${
                        statusKind === 'completed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : statusKind === 'current'
                          ? 'bg-[#C9A84C] text-white ring-4 ring-[#C9A84C]/20 shadow-md'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      {statusKind === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${statusKind === 'upcoming' ? 'text-gray-400' : 'text-[#1C1C1C]'}`}>
                        {st.title}
                      </p>
                      <p className="text-[11px] text-[#777]">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Details & Order Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 text-xs">
            <div className="space-y-3 p-4 bg-[#FAF8F4] rounded-xl border border-[#E8E4DC]">
              <h4 className="font-semibold text-[#1C1C1C] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <MapPin className="w-4 h-4 text-[#C9A84C]" /> Endereço de Entrega
              </h4>
              <p className="text-[#555] leading-relaxed">
                {searchedOrder.shippingAddress.logradouro}, {searchedOrder.shippingAddress.numero}
                {searchedOrder.shippingAddress.complemento ? ` (${searchedOrder.shippingAddress.complemento})` : ''}<br />
                {searchedOrder.shippingAddress.bairro} • {searchedOrder.shippingAddress.cidade}/{searchedOrder.shippingAddress.uf}<br />
                CEP: {searchedOrder.shippingAddress.cep}
              </p>
              <p className="text-[11px] text-[#777]">
                Modalidade: <strong>{searchedOrder.shippingMethod}</strong>
              </p>
            </div>

            <div className="space-y-3 p-4 bg-[#FAF8F4] rounded-xl border border-[#E8E4DC]">
              <h4 className="font-semibold text-[#1C1C1C] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Package className="w-4 h-4 text-[#C9A84C]" /> Peças Inclusas no Pacote
              </h4>
              <div className="space-y-2">
                {searchedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[#444]">
                    <span>
                      {it.quantity}x {it.name} {it.variation ? `(${it.variation})` : ''}
                    </span>
                    <span className="font-semibold text-[#1C1C1C]">
                      R$ {(it.price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-[#1C1C1C]">
                <span>Total do Pedido:</span>
                <span>R$ {searchedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Back Button */}
      <div className="text-center pt-4">
        <button
          onClick={onBackToCatalog}
          className="text-xs uppercase tracking-widest font-semibold text-[#1C1C1C] hover:text-[#C9A84C] transition"
        >
          &larr; Voltar para a Loja Virtual
        </button>
      </div>
    </div>
  );
};
