import React from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Truck, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { AdminModule } from './AdminLayout';

interface AdminDashboardProps {
  onNavigateModule: (module: AdminModule) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateModule }) => {
  const { orders, products, customers, financialEntries } = useCitrinoStore();

  // Metrics calculations
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((acc, curr) => acc + curr.total, 0);

  const pendingShippingOrders = orders.filter((o) => o.status === 'pago');
  const waitingPaymentOrders = orders.filter((o) => o.status === 'aguardando');
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  const receivableToday = financialEntries
    .filter((f) => f.type === 'receita' && f.status === 'pendente')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Top 5 products by rating/sales
  const topProducts = [...products]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 5);

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Painel Executivo — Citrino Semijoias
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Visão consolidada de vendas, faturamento e logística integrada Citrino Semijoias.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateModule('products')}
            className="bg-[#E97527] hover:bg-[#D5651B] text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Joia</span>
          </button>
          <button
            onClick={() => onNavigateModule('orders')}
            className="bg-white border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Ver Todos os Pedidos
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Faturamento Bruto
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs mês anterior</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Pedidos para Despachar */}
        <div 
          onClick={() => onNavigateModule('orders')}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3 cursor-pointer hover:border-[#E97527] transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Aguardando Envio
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#E97527] flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {pendingShippingOrders.length}
            </span>
            <div className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Pagos prontos para embalagem</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Contas a Receber Hoje */}
        <div 
          onClick={() => onNavigateModule('financial')}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3 cursor-pointer hover:border-[#E97527] transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              A Receber (Mercado Pago)
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">
              R$ {receivableToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-xs text-sky-600 font-medium mt-1">
              Liquidação D+2 e PIX instantâneo
            </div>
          </div>
        </div>

        {/* KPI 4: Alerta de Estoque Baixo */}
        <div 
          onClick={() => onNavigateModule('products')}
          className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3 cursor-pointer hover:border-red-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Estoque Crítico
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              lowStockProducts.length > 0 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {lowStockProducts.length} itens
            </span>
            <div className="text-xs text-red-600 font-medium mt-1">
              {lowStockProducts.length > 0 ? 'Reposição no polo Limeira urgente' : 'Estoque regular'}
            </div>
          </div>
        </div>
      </div>

      {/* Stock Critical Alert Banner (if items < minStock) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-red-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <strong>Alerta de Reposição Galvânica:</strong> {lowStockProducts.length} peças estão com estoque abaixo do mínimo (ex: {lowStockProducts[0]?.name}).
            </div>
          </div>
          <button
            onClick={() => onNavigateModule('products')}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded transition shrink-0"
          >
            Gerenciar Estoque
          </button>
        </div>
      )}

      {/* Grid: Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Últimos Pedidos na Loja</h3>
              <p className="text-xs text-gray-500">Acompanhamento dos pedidos de clientes e revendedoras</p>
            </div>
            <button
              onClick={() => onNavigateModule('orders')}
              className="text-xs font-bold text-[#E97527] hover:underline flex items-center gap-1"
            >
              <span>Ver Todos</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Nº Pedido</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-800 block truncate max-w-[150px]">
                        {ord.customerName}
                      </span>
                      <span className="text-[10px] text-gray-400">{ord.shippingAddress.cidade}/{ord.shippingAddress.uf}</span>
                    </td>
                    <td className="py-3 px-4 uppercase text-[11px] font-semibold text-gray-600">
                      {ord.paymentMethod}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      R$ {ord.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          ord.status === 'pago'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'enviado'
                            ? 'bg-sky-100 text-sky-800'
                            : ord.status === 'aguardando'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Top Selling Products (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Top Semijoias Mais Vendidas</h3>
              <p className="text-xs text-gray-500">Ranking por popularidade</p>
            </div>
            <button
              onClick={() => onNavigateModule('reports')}
              className="text-xs text-[#E97527] font-semibold hover:underline"
            >
              Curva ABC
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                <span className="w-5 text-center font-bold text-gray-400 text-xs">
                  #{idx + 1}
                </span>
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                  <span className="text-[11px] text-gray-500">
                    {p.material} • R$ {(p.promoPrice || p.price).toFixed(2)}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="font-bold text-gray-900 block">{p.stock} un.</span>
                  <span className={`text-[10px] ${p.stock <= p.minStock ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    estoque
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateModule('products')}
            className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-lg transition text-center"
          >
            Gerenciar Todos os {products.length} Produtos
          </button>
        </div>
      </div>
    </div>
  );
};
