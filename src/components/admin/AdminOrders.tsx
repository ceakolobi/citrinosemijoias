import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  Printer, 
  Mail, 
  CheckCircle2, 
  Clock, 
  X, 
  Copy, 
  Check, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Order, OrderStatus } from '../../types';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, updateOrderTracking } = useCitrinoStore();

  const [search, setSearch] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Tracking code edit
  const [newTrackingCode, setNewTrackingCode] = useState<string>('');
  const [trackingFeedback, setTrackingFeedback] = useState<boolean>(false);

  // Print Label Modal
  const [isPrintLabelOpen, setIsPrintLabelOpen] = useState<boolean>(false);

  // Email resend notification feedback
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerCpf.includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpdateTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrder && newTrackingCode.trim()) {
      updateOrderTracking(selectedOrder.id, newTrackingCode.trim().toUpperCase());
      setSelectedOrder((prev) =>
        prev ? { ...prev, trackingCode: newTrackingCode.trim().toUpperCase(), status: 'enviado' } : null
      );
      setTrackingFeedback(true);
      setTimeout(() => setTrackingFeedback(false), 2500);
    }
  };

  const handleResendEmail = () => {
    setEmailFeedback('Disparando notificação via Edge Function (Resend API)...');
    setTimeout(() => {
      setEmailFeedback('✓ E-mail com status do pedido reenviado com sucesso ao cliente!');
      setTimeout(() => setEmailFeedback(null), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Gestão de Pedidos & Expedição
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Controle de pedidos, conciliação de pagamentos Mercado Pago e despacho Correios/Melhor Envio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Total:</span>
          <strong className="text-sm font-bold text-gray-900 bg-white px-2.5 py-1 rounded border border-gray-200">
            {orders.length} pedidos
          </strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Buscar por nº pedido, nome do cliente, CPF ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F4F5F7] border border-gray-200 rounded-lg text-xs py-2 pl-9 pr-3 focus:outline-none focus:border-[#E97527]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#F4F5F7] border border-gray-200 text-xs rounded-lg px-3 py-2 text-gray-700 focus:outline-none font-medium"
          >
            <option value="all">Todos os Status ({orders.length})</option>
            <option value="aguardando">Aguardando Pagamento</option>
            <option value="pago">Pago (Aguardando Envio)</option>
            <option value="separacao">Em Separação</option>
            <option value="enviado">Enviado / Em Trânsito</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Pedido / Data</th>
                <th className="py-3 px-4">Cliente / Cidade</th>
                <th className="py-3 px-4">Itens</th>
                <th className="py-3 px-4">Valor Total</th>
                <th className="py-3 px-4">Forma Pagto</th>
                <th className="py-3 px-4">Status Atual</th>
                <th className="py-3 px-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                return (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition">
                    {/* Number & Date */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-gray-900 block text-xs">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-gray-400">{order.createdAt}</span>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900 block truncate max-w-[170px]">
                        {order.customerName}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {order.shippingAddress.cidade}/{order.shippingAddress.uf} • {order.customerPhone}
                      </span>
                    </td>

                    {/* Items count */}
                    <td className="py-3 px-4">
                      <span className="text-gray-700 font-medium">
                        {order.items.reduce((a, b) => a + b.quantity, 0)} peça(s)
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate max-w-[150px]">
                        {order.items[0]?.name}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 font-bold text-gray-900">
                      R$ {(order.total ?? 0).toFixed(2)}
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-4 uppercase text-[11px] font-semibold text-gray-600">
                      {order.paymentMethod}
                    </td>

                    {/* Status Pill with 1-click update dropdown */}
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border-0 focus:ring-1 focus:ring-[#E97527] cursor-pointer ${
                          order.status === 'pago'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'enviado'
                            ? 'bg-sky-100 text-sky-800'
                            : order.status === 'separacao'
                            ? 'bg-indigo-100 text-indigo-800'
                            : order.status === 'aguardando'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'entregue'
                            ? 'bg-green-100 text-green-900'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <option value="aguardando">Aguardando</option>
                        <option value="pago">Pago</option>
                        <option value="separacao">Separação</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewTrackingCode(order.trackingCode || '');
                        }}
                        className="p-1.5 text-gray-600 hover:text-[#E97527] hover:bg-orange-50 rounded transition inline-flex items-center gap-1 font-semibold text-xs"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detalhes</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E97527]">
                  Ficha do Pedido Citrino
                </span>
                <div className="flex items-center gap-3 mt-0.5">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedOrder.orderNumber}
                  </h2>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      selectedOrder.status === 'pago'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedOrder.status === 'enviado'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer info & shipping destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-200 space-y-2">
                <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px] block">
                  Dados do Cliente
                </span>
                <p className="font-semibold text-gray-900 text-sm">{selectedOrder.customerName}</p>
                <p className="text-gray-600">CPF: {selectedOrder.customerCpf}</p>
                <p className="text-gray-600">E-mail: {selectedOrder.customerEmail}</p>
                <p className="text-gray-600">WhatsApp: {selectedOrder.customerPhone}</p>
              </div>

              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-200 space-y-2">
                <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px] block">
                  Endereço de Entrega ({selectedOrder.shippingMethod})
                </span>
                <p className="text-gray-700 leading-relaxed">
                  {selectedOrder.shippingAddress.logradouro}, {selectedOrder.shippingAddress.numero}
                  {selectedOrder.shippingAddress.complemento ? ` (${selectedOrder.shippingAddress.complemento})` : ''}<br />
                  {selectedOrder.shippingAddress.bairro} • {selectedOrder.shippingAddress.cidade}/{selectedOrder.shippingAddress.uf}<br />
                  CEP: {selectedOrder.shippingAddress.cep}
                </p>
                <p className="text-[11px] text-gray-500">
                  Custo frete: R$ {(selectedOrder.shippingPrice ?? 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Tracking Code input form */}
            <form onSubmit={handleUpdateTracking} className="p-4 bg-orange-50/50 border border-orange-200 rounded-xl space-y-2 text-xs">
              <label className="font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Truck className="w-4 h-4 text-[#E97527]" />
                Código de Rastreio dos Correios / Transportadora:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: QB123456789BR"
                  value={newTrackingCode}
                  onChange={(e) => setNewTrackingCode(e.target.value)}
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 uppercase font-mono font-bold focus:border-[#E97527] focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#E97527] hover:bg-[#D5651B] text-white px-4 py-2 rounded-lg font-bold transition"
                >
                  Salvar & Marcar Enviado
                </button>
              </div>
              {trackingFeedback && (
                <p className="text-emerald-700 font-semibold text-[11px]">
                  ✓ Código salvo e status atualizado para "Enviado"!
                </p>
              )}
            </form>

            {/* Items table */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                Semijoias Inclusas no Pedido
              </h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover border border-gray-100"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span>SKU: {item.sku} {item.variation ? `• Var: ${item.variation}` : ''}</span>
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                            Garantia: {item.warranty || '6 meses'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-600 block">{item.quantity}x R$ {(item.price ?? 0).toFixed(2)}</span>
                      <strong className="text-gray-900">R$ {((item.price ?? 0) * item.quantity).toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals & Discounts */}
            <div className="bg-[#F8F9FA] p-4 rounded-xl space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">R$ {(selectedOrder.subtotal ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete:</span>
                <span>R$ {(selectedOrder.shippingPrice ?? 0).toFixed(2)}</span>
              </div>
              {(selectedOrder.discountPrice ?? 0) > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Desconto:</span>
                  <span>- R$ {(selectedOrder.discountPrice ?? 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
                <span>Valor Total:</span>
                <span>R$ {(selectedOrder.total ?? 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Modal Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintLabelOpen(true)}
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-1.5 font-semibold"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Etiqueta</span>
                </button>
                <button
                  onClick={handleResendEmail}
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-1.5 font-semibold"
                >
                  <Mail className="w-4 h-4" />
                  <span>Reenviar E-mail</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-900 text-white px-5 py-2 rounded-lg font-bold uppercase tracking-wider hover:bg-black transition"
              >
                Fechar
              </button>
            </div>

            {emailFeedback && (
              <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                {emailFeedback}
              </p>
            )}
          </div>
        </div>
      )}

      {/* PRINT SHIPPING LABEL MODAL (Etiqueta de Envio Padrão Correios) */}
      {isPrintLabelOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-[#E97527]" />
                Etiqueta de Envio Simplificada (Padrão Correios / Jadlog)
              </h3>
              <button onClick={() => setIsPrintLabelOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* The printable label frame */}
            <div className="border-2 border-dashed border-gray-400 p-5 rounded-lg space-y-4 bg-[#FAF9F5] font-mono">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <div>
                  <strong className="text-base font-bold font-sans">CITRINO SEMIJOIAS</strong>
                  <p className="text-[10px] text-gray-500 font-sans">Limeira - SP (Polo Joalheiro Nacional)</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs uppercase font-sans bg-black text-white px-2 py-0.5 rounded">
                    {selectedOrder.shippingMethod}
                  </span>
                </div>
              </div>

              {/* Destinatário */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 font-sans">DESTINATÁRIO:</span>
                <p className="font-bold text-sm text-gray-900">{selectedOrder.customerName}</p>
                <p>{selectedOrder.shippingAddress.logradouro}, {selectedOrder.shippingAddress.numero} {selectedOrder.shippingAddress.complemento || ''}</p>
                <p>{selectedOrder.shippingAddress.bairro} - {selectedOrder.shippingAddress.cidade} / {selectedOrder.shippingAddress.uf}</p>
                <p className="font-bold text-base">CEP: {selectedOrder.shippingAddress.cep}</p>
              </div>

              {/* Barcode representation */}
              <div className="pt-2 border-t border-gray-300 text-center space-y-1">
                <div className="h-10 bg-black flex items-center justify-center text-white tracking-[0.5em] text-xs">
                  ||||||||||||||||||||||||||||||||||||
                </div>
                <span className="text-[10px] text-gray-600 block">
                  {selectedOrder.trackingCode || selectedOrder.orderNumber}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPrintLabelOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-[#E97527] hover:bg-[#D5651B] text-white font-bold rounded"
              >
                Imprimir Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
