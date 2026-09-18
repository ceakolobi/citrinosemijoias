import React, { useState } from 'react';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  LogOut, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Product } from '../../types';

interface AccountViewProps {
  initialTab?: string;
  onNavigateTracking: (orderNumber: string) => void;
  onOpenProduct: (product: Product) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  initialTab = 'orders',
  onNavigateTracking,
  onOpenProduct,
}) => {
  const {
    currentCustomer,
    orders,
    wishlist,
    products,
    setCurrentCustomer,
    customers,
  } = useCitrinoStore();

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const customerOrders = orders.filter(
    (o) => o.customerEmail === currentCustomer?.email || o.customerCpf === currentCustomer?.document
  );

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  // Quick switcher between demo customers for easy reviewer testing
  const handleSwitchCustomer = (idx: number) => {
    if (customers[idx]) {
      setCurrentCustomer(customers[idx]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F4] border-2 border-[#C9A84C] flex items-center justify-center text-[#C9A84C] font-serif-luxury text-2xl font-bold">
            {currentCustomer?.name.charAt(0) || 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif-luxury text-[#1C1C1C]">
                {currentCustomer?.name}
              </h1>
              {currentCustomer?.isB2BWholesale && (
                <span className="bg-[#E8705A] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Revendedora B2B ({currentCustomer.b2bDiscountPct}% OFF)
                </span>
              )}
            </div>
            <p className="text-xs text-[#777] mt-0.5">
              {currentCustomer?.email} • CPF/CNPJ: {currentCustomer?.document}
            </p>
          </div>
        </div>

        {/* Demo Customer Switcher for fast testing */}
        <div className="text-xs text-right space-y-1">
          <span className="text-[11px] text-[#888] block">Alternar cliente de teste:</span>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {customers.map((c, i) => (
              <button
                key={c.id}
                onClick={() => handleSwitchCustomer(i)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium border transition ${
                  currentCustomer?.id === c.id
                    ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#C9A84C]'
                }`}
              >
                {c.type === 'PJ' ? `🏢 ${c.fantasyName?.split(' ')[0] || c.name.split(' ')[0]}` : `👤 ${c.name.split(' ')[0]}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Navigation Tabs + Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Tabs Nav */}
        <div className="md:col-span-1 space-y-2">
          <div className="bg-white rounded-xl border border-[#E8E4DC] p-2 space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-semibold transition text-left ${
                activeTab === 'orders'
                  ? 'bg-[#FAF8F4] text-[#C9A84C] font-bold'
                  : 'text-[#555] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Meus Pedidos ({customerOrders.length})</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-semibold transition text-left ${
                activeTab === 'wishlist'
                  ? 'bg-[#FAF8F4] text-[#C9A84C] font-bold'
                  : 'text-[#555] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4" />
                <span>Lista de Desejos ({wishlistProducts.length})</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-semibold transition text-left ${
                activeTab === 'addresses'
                  ? 'bg-[#FAF8F4] text-[#C9A84C] font-bold'
                  : 'text-[#555] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4" />
                <span>Endereços de Entrega</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('b2b')}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-semibold transition text-left ${
                activeTab === 'b2b'
                  ? 'bg-[#FAF8F4] text-[#C9A84C] font-bold'
                  : 'text-[#555] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4" />
                <span>Programa de Revenda</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-3">
          {/* TAB 1: MEUS PEDIDOS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-xl font-serif-luxury text-[#1C1C1C]">Histórico de Pedidos</h2>

              {customerOrders.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E8E4DC] p-10 text-center space-y-3">
                  <Package className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-sm font-medium text-[#1C1C1C]">Nenhum pedido encontrado</p>
                  <p className="text-xs text-[#777]">Faça sua primeira compra para acompanhar o rastreio aqui.</p>
                </div>
              ) : (
                customerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-[#E8E4DC] overflow-hidden p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                      <div>
                        <span className="text-xs font-bold text-[#1C1C1C] block sm:inline mr-3">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-[#777]">
                          Feito em: {order.createdAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            order.status === 'pago' || order.status === 'entregue'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.status === 'enviado'
                              ? 'bg-sky-50 text-sky-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {order.status === 'pago' ? 'Pago' : order.status === 'enviado' ? 'Despachado' : order.status === 'entregue' ? 'Entregue' : 'Aguardando Pagamento'}
                        </span>

                        <button
                          onClick={() => onNavigateTracking(order.orderNumber)}
                          className="bg-[#FAF8F4] hover:bg-[#F2ECE1] border border-[#D5CFBF] text-[#1C1C1C] text-xs px-3 py-1 rounded font-semibold transition flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Rastrear
                        </button>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded object-cover border border-gray-100"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-[#1C1C1C]">{item.name}</p>
                            <span className="text-[#777]">
                              {item.quantity}x {item.variation ? `(${item.variation})` : ''} • R$ {item.price.toFixed(2)} un.
                            </span>
                          </div>
                          <span className="font-bold text-[#1C1C1C]">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Order Info */}
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-[#666]">
                      <span>
                        Frete: <strong>{order.shippingMethod}</strong>
                        {order.trackingCode && (
                          <span className="ml-2 text-sky-700 font-mono">
                            (Rastreio: {order.trackingCode})
                          </span>
                        )}
                      </span>
                      <div className="text-right">
                        <span>Total: </span>
                        <strong className="text-base text-[#1C1C1C]">R$ {order.total.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="text-xl font-serif-luxury text-[#1C1C1C]">Lista de Desejos</h2>

              {wishlistProducts.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E8E4DC] p-10 text-center space-y-3">
                  <Heart className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-sm font-medium text-[#1C1C1C]">Sua lista de desejos está vazia</p>
                  <p className="text-xs text-[#777]">Clique no coração das peças que você mais amou para salvar aqui.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onOpenProduct(p)}
                      className="group bg-white rounded-xl border border-[#E8E4DC] p-3 space-y-2 cursor-pointer hover:border-[#C9A84C] transition"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <h4 className="font-serif-luxury text-sm font-medium line-clamp-1">{p.name}</h4>
                      <p className="text-xs font-bold">R$ {(p.promoPrice || p.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ENDEREÇOS */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <h2 className="text-xl font-serif-luxury text-[#1C1C1C]">Endereço Cadastrado</h2>
              {currentCustomer?.address && (
                <div className="bg-white rounded-xl border border-[#E8E4DC] p-6 space-y-2 max-w-md">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9A84C]">
                    <MapPin className="w-4 h-4" /> Endereço Principal de Envio
                  </div>
                  <p className="text-sm font-semibold text-[#1C1C1C]">
                    {currentCustomer.name}
                  </p>
                  <p className="text-xs text-[#555] leading-relaxed">
                    {currentCustomer.address.logradouro}, {currentCustomer.address.numero}
                    {currentCustomer.address.complemento ? ` (${currentCustomer.address.complemento})` : ''}<br />
                    {currentCustomer.address.bairro} • {currentCustomer.address.cidade} - {currentCustomer.address.uf}<br />
                    CEP: {currentCustomer.address.cep}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROGRAMA DE REVENDA B2B */}
          {activeTab === 'b2b' && (
            <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#E8705A]">
                  Canal de Atacado & Revendedoras
                </span>
                <h2 className="text-2xl font-serif-luxury text-[#1C1C1C]">
                  Seja uma Revendedora Autorizada Citrino
                </h2>
                <p className="text-xs text-[#666] leading-relaxed max-w-2xl">
                  Oferecemos margens de lucro de 100% a 150%, mostruário completo de veludo, material de marketing para redes sociais e peças com banho nobre de 10 milésimos de ouro 18k e garantia total de 1 ano.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-[#FAF8F4] rounded-xl border border-[#E8E4DC] space-y-1 text-center">
                  <span className="text-2xl font-bold text-[#C9A84C]">35%</span>
                  <p className="text-xs font-semibold text-[#1C1C1C]">Desconto no Atacado</p>
                  <p className="text-[11px] text-[#777]">Para pedidos com CNPJ acima de R$ 1.500</p>
                </div>

                <div className="p-4 bg-[#FAF8F4] rounded-xl border border-[#E8E4DC] space-y-1 text-center">
                  <span className="text-2xl font-bold text-[#C9A84C]">1 Ano</span>
                  <p className="text-xs font-semibold text-[#1C1C1C]">Garantia com Certificado</p>
                  <p className="text-[11px] text-[#777]">Segurança total para suas clientes finais</p>
                </div>

                <div className="p-4 bg-[#FAF8F4] rounded-xl border border-[#E8E4DC] space-y-1 text-center">
                  <span className="text-2xl font-bold text-[#C9A84C]">Mostruário</span>
                  <p className="text-xs font-semibold text-[#1C1C1C]">Material Exclusivo</p>
                  <p className="text-[11px] text-[#777]">Estojos, tags douradas e sacolas personalizadas</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-[#555]">
                  Deseja habilitar compras com faturamento 30/60 dias no seu CNPJ?
                </span>
                <a
                  href="https://wa.me/5511987654321?text=Ol%C3%A1!%20Gostaria%20de%20me%20cadastrar%20como%20Revendedora%20B2B%20da%20Citrino%20Semijoias."
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#1C1C1C] hover:bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition"
                >
                  Falar com Consultora B2B
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
