import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  PieChart, 
  FileText,
  X
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { FinancialEntry } from '../../types';

export const AdminFinancial: React.FC = () => {
  const { financialEntries, addFinancialEntry, orders } = useCitrinoStore();

  const [activeTab, setActiveTab] = useState<'entries' | 'dre' | 'mercadopago'>('entries');
  const [filterType, setFilterType] = useState<string>('all');

  // New Entry Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [desc, setDesc] = useState<string>('');
  const [amount, setAmount] = useState<number>(150);
  const [type, setType] = useState<'receita' | 'despesa'>('despesa');
  const [category, setCategory] = useState<string>('Banho Galvânico Limeira');
  const [status, setStatus] = useState<'pendente' | 'pago'>('pago');
  const [dueDate, setDueDate] = useState<string>('2025-05-10');

  // Metrics
  const totalRevenue = financialEntries
    .filter((f) => f.type === 'receita')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = financialEntries
    .filter((f) => f.type === 'despesa')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalRevenue - totalExpenses;

  // Mercado Pago Sales fee reconciliation calculation (typical 3.99% credit card, 0.99% PIX)
  const mpSales = orders.filter((o) => o.status !== 'cancelado').map((o) => {
    const feeRate = o.paymentMethod === 'pix' ? 0.0099 : 0.0399;
    const feeAmount = o.total * feeRate;
    const netAmount = o.total - feeAmount;
    return {
      orderNumber: o.orderNumber,
      customer: o.customerName,
      date: o.createdAt,
      method: o.paymentMethod,
      gross: o.total,
      fee: feeAmount,
      net: netAmount,
      status: o.status === 'pago' || o.status === 'enviado' || o.status === 'entregue' ? 'Disponível D+2' : 'Pendente',
    };
  });

  const totalGrossMP = mpSales.reduce((a, b) => a + b.gross, 0);
  const totalFeesMP = mpSales.reduce((a, b) => a + b.fee, 0);
  const totalNetMP = mpSales.reduce((a, b) => a + b.net, 0);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    addFinancialEntry({
      description: desc,
      amount: Number(amount),
      type,
      category,
      status,
      dueDate,
    });
    setIsModalOpen(false);
    setDesc('');
  };

  const filteredEntries = financialEntries.filter((f) => {
    if (filterType !== 'all' && f.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Gestão Financeira & DRE Integrado
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Fluxo de caixa, conciliação de taxas Mercado Pago e despesas operacionais da joalheria.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#E97527] hover:bg-[#D5651B] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Entrada / Saída</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>Receitas Totais</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            R$ {(totalRevenue ?? 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>Despesas Operacionais</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">
            R$ {(totalExpenses ?? 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>Saldo Líquido em Caixa</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            R$ {(netBalance ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-gray-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('entries')}
          className={`pb-3 border-b-2 uppercase tracking-wider transition ${
            activeTab === 'entries'
              ? 'border-[#E97527] text-[#E97527] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Lançamentos & Fluxo de Caixa
        </button>
        <button
          onClick={() => setActiveTab('mercadopago')}
          className={`pb-3 border-b-2 uppercase tracking-wider transition ${
            activeTab === 'mercadopago'
              ? 'border-[#E97527] text-[#E97527] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Conciliação Mercado Pago
        </button>
        <button
          onClick={() => setActiveTab('dre')}
          className={`pb-3 border-b-2 uppercase tracking-wider transition ${
            activeTab === 'dre'
              ? 'border-[#E97527] text-[#E97527] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          DRE Gerencial Simplificado
        </button>
      </div>

      {/* TAB 1: LANÇAMENTOS */}
      {activeTab === 'entries' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 uppercase">
                Extrato de Entradas e Saídas
              </span>
              <div className="flex items-center gap-2 text-xs">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded px-2.5 py-1 text-gray-700"
                >
                  <option value="all">Todas</option>
                  <option value="receita">Receitas (+)</option>
                  <option value="despesa">Despesas (-)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Descrição</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Valor (R$)</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEntries.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-medium text-gray-900">{item.description}</td>
                      <td className="py-3 px-4 text-gray-600">{item.category}</td>
                      <td className="py-3 px-4 text-gray-500">{item.dueDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            item.type === 'receita'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 font-bold ${
                          item.type === 'receita' ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {item.type === 'receita' ? '+' : '-'} R$ {(item.amount ?? 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            item.status === 'pago'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONCILIAÇÃO MERCADO PAGO */}
      {activeTab === 'mercadopago' && (
        <div className="space-y-6">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-900 space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-sm">
              <CreditCard className="w-4 h-4 text-sky-700" />
              Taxas & Liquidação Mercado Pago Brasil
            </h4>
            <p className="text-sky-800">
              Taxa negociada PIX: <strong>0,99%</strong> (recebimento imediato) | Cartão de Crédito 10x: <strong>3,99%</strong> (liquidação em D+2 na conta Mercado Pago PJ).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Total Bruto Transacionado</span>
              <strong className="text-xl text-gray-900">R$ {(totalGrossMP ?? 0).toFixed(2)}</strong>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Taxas Mercado Pago Descontadas</span>
              <strong className="text-xl text-red-600">- R$ {(totalFeesMP ?? 0).toFixed(2)}</strong>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 block">Valor Líquido Citrino</span>
              <strong className="text-xl text-emerald-700">R$ {(totalNetMP ?? 0).toFixed(2)}</strong>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Pedido / Data</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Valor Bruto</th>
                  <th className="py-3 px-4 text-red-600">Taxa MP</th>
                  <th className="py-3 px-4 text-emerald-700 font-bold">Líquido</th>
                  <th className="py-3 px-4 text-right">Disponibilidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mpSales.map((sale, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{sale.orderNumber}</td>
                    <td className="py-3 px-4 text-gray-700">{sale.customer}</td>
                    <td className="py-3 px-4 uppercase text-[11px] font-semibold">{sale.method}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">R$ {(sale.gross ?? 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-red-600 font-medium">- R$ {(sale.fee ?? 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">R$ {(sale.net ?? 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DRE GERENCIAL SIMPLIFICADO */}
      {activeTab === 'dre' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 max-w-2xl mx-auto space-y-4 text-xs">
          <div className="border-b pb-3">
            <h3 className="text-base font-bold text-gray-900">
              Demonstrativo de Resultado do Exercício (DRE)
            </h3>
            <p className="text-gray-500">Período Corrente • Regime de Competência</p>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between py-1.5 font-bold text-sm text-gray-900 border-b">
              <span>(=) RECEITA BRUTA DE VENDAS</span>
              <span>R$ {(totalRevenue ?? 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600 pl-4">
              <span>(-) Deduções e Taxas Mercado Pago (Média 2.8%)</span>
              <span className="text-red-600">- R$ {((totalRevenue ?? 0) * 0.028).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600 pl-4">
              <span>(-) Impostos Simples Nacional (Anexo I - 6.5%)</span>
              <span className="text-red-600">- R$ {((totalRevenue ?? 0) * 0.065).toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-1.5 font-bold text-gray-800 border-t border-b">
              <span>(=) RECEITA LÍQUIDA</span>
              <span>R$ {((totalRevenue ?? 0) * 0.907).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600 pl-4">
              <span>(-) Custo de Mercadorias Vendidas (CMV Brutos e Banho Limeira)</span>
              <span className="text-red-600">- R$ {((totalRevenue ?? 0) * 0.28).toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-1.5 font-bold text-emerald-800 bg-emerald-50/50 px-2 rounded">
              <span>(=) LUCRO BRUTO OPERACIONAL</span>
              <span>R$ {((totalRevenue ?? 0) * 0.627).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600 pl-4">
              <span>(-) Despesas com Embalagens de Veludo & Sacolas</span>
              <span className="text-red-600">- R$ 180,00</span>
            </div>

            <div className="flex justify-between text-gray-600 pl-4">
              <span>(-) Marketing Digital & Anúncios Meta/Google</span>
              <span className="text-red-600">- R$ 250,00</span>
            </div>

            <div className="flex justify-between py-2 font-bold text-base text-gray-900 border-t-2 border-gray-900">
              <span>(=) LUCRO LÍQUIDO DO PERÍODO</span>
              <span className="text-emerald-700">
                R$ {((totalRevenue ?? 0) * 0.627 - 430).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-gray-900">Novo Lançamento Financeiro</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    checked={type === 'despesa'}
                    onChange={() => setType('despesa')}
                  />
                  Despesa (-)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    checked={type === 'receita'}
                    onChange={() => setType('receita')}
                  />
                  Receita (+)
                </label>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Descrição *</label>
                <input
                  type="text"
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ex: Banho Galvânico Ouro 18k - Lote 14"
                  className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:outline-none focus:border-[#E97527]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:outline-none focus:border-[#E97527]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Data Vencimento</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:outline-none focus:border-[#E97527]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Categoria de Custo</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:outline-none focus:border-[#E97527]"
                >
                  <option value="Banho Galvânico Limeira">Banho Galvânico Limeira</option>
                  <option value="Embalagens e Estojos Veludo">Embalagens e Estojos Veludo</option>
                  <option value="Fretes e Envios Correios">Fretes e Envios Correios</option>
                  <option value="Marketing & Tráfego Pago">Marketing & Tráfego Pago</option>
                  <option value="Venda E-commerce">Venda E-commerce</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E97527] hover:bg-[#D5651B] text-white font-bold rounded"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
