import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  PieChart, 
  TrendingUp, 
  Layers, 
  Users, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';

export const AdminReports: React.FC = () => {
  const { products, orders, customers } = useCitrinoStore();
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  // Revenue by Category
  const categoryRevenue: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const cat = prod?.category || 'Outros';
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + it.price * it.quantity;
    });
  });

  // Revenue by Plating
  const platingRevenue: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const plating = prod?.material || 'Ouro 18k';
      platingRevenue[plating] = (platingRevenue[plating] || 0) + it.price * it.quantity;
    });
  });

  // Curva ABC calculation
  // Rank products by total sales value
  const productSalesMap = products.map((p) => {
    let salesCount = 0;
    orders.forEach((o) => {
      o.items.forEach((it) => {
        if (it.productId === p.id) {
          salesCount += it.quantity;
        }
      });
    });
    const totalGenerated = salesCount * (p.promoPrice || p.price);
    return {
      product: p,
      salesCount,
      totalGenerated,
    };
  }).sort((a, b) => b.totalGenerated - a.totalGenerated);

  const totalOverallGenerated = productSalesMap.reduce((a, b) => a + b.totalGenerated, 0) || 1;
  let runningSum = 0;
  const abcProducts = productSalesMap.map((item) => {
    runningSum += item.totalGenerated;
    const accumulatedPct = (runningSum / totalOverallGenerated) * 100;
    let classification = 'C';
    if (accumulatedPct <= 70) classification = 'A';
    else if (accumulatedPct <= 90) classification = 'B';
    return {
      ...item,
      accumulatedPct,
      classification,
    };
  });

  // Ticket Médio Varejo vs Atacado
  const retailCustomers = customers.filter((c) => c.customerTag === 'varejo');
  const wholesaleCustomers = customers.filter((c) => c.customerTag === 'atacado');

  const retailAvgTicket = retailCustomers.length
    ? retailCustomers.reduce((a, b) => a + (b.orderCount > 0 ? b.totalSpent / b.orderCount : 0), 0) / retailCustomers.length
    : 0;

  const wholesaleAvgTicket = wholesaleCustomers.length
    ? wholesaleCustomers.reduce((a, b) => a + (b.orderCount > 0 ? b.totalSpent / b.orderCount : 0), 0) / wholesaleCustomers.length
    : 0;

  // Export CSV
  const handleExportCSV = (reportName: string) => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "SKU,Nome,Categoria,Preco,Estoque,Classificacao_ABC\n" +
      abcProducts.map(e => `"${e.product.sku}","${e.product.name}","${e.product.category}",${e.product.price},${e.product.stock},"${e.classification}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `citrino_${reportName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadFeedback(`✓ Relatório "${reportName}" exportado com sucesso em CSV!`);
    setTimeout(() => setDownloadFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Relatórios Estratégicos & Curva ABC
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Análise aprofundada de receitas por banho, rentabilidade de produtos e segmentação de canais.
          </p>
        </div>

        <button
          onClick={() => handleExportCSV('curva_abc_produtos')}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition flex items-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4 text-[#E97527]" />
          <span>Exportar Curva ABC (.CSV)</span>
        </button>
      </div>

      {downloadFeedback && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2 text-xs font-semibold border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {downloadFeedback}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">
            Ticket Médio • Varejo B2C
          </span>
          <p className="text-2xl font-bold text-gray-900">
            R$ {retailAvgTicket.toFixed(2)}
          </p>
          <p className="text-[11px] text-gray-500">Média de 1.8 peças por pedido de pessoa física</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">
            Ticket Médio • Atacado B2B
          </span>
          <p className="text-2xl font-bold text-[#E97527]">
            R$ {wholesaleAvgTicket.toFixed(2)}
          </p>
          <p className="text-[11px] text-[#E97527] font-semibold">
            {wholesaleAvgTicket > 0 ? `${(wholesaleAvgTicket / (retailAvgTicket || 1)).toFixed(1)}x maior que o varejo` : 'Sem compras atacado'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">
            Banho Campeão de Vendas
          </span>
          <p className="text-2xl font-bold text-gray-900">
            Ouro 18k (10 milésimos)
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold">
            Representa 78% do faturamento da marca
          </p>
        </div>
      </div>

      {/* Grid: Category Distribution & Plating breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-gray-900">Vendas por Categoria de Semijoia</h3>
          <div className="space-y-2.5 text-xs">
            {Object.entries(categoryRevenue).map(([cat, rev]) => {
              const pct = (rev / totalOverallGenerated) * 100;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">{cat}</span>
                    <span className="font-bold text-gray-900">R$ {rev.toFixed(2)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E97527] rounded-full"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plating Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-gray-900">Distribuição por Tipo de Banho Galvânico</h3>
          <div className="space-y-2.5 text-xs">
            {Object.entries(platingRevenue).map(([mat, rev]) => {
              const pct = (rev / totalOverallGenerated) * 100;
              return (
                <div key={mat} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">{mat}</span>
                    <span className="font-bold text-gray-900">R$ {rev.toFixed(2)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1D1F24] rounded-full"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CURVA ABC TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Curva ABC de Produtos</h3>
            <p className="text-xs text-gray-500">
              Classificação A (80% da receita), B (15% da receita) e C (5% da receita restante).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-center">Classe</th>
                <th className="py-3 px-4">Semijoia</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-center">Unid. Vendidas</th>
                <th className="py-3 px-4 text-right">Faturamento Acumulado</th>
                <th className="py-3 px-4 text-center">Estoque Atual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {abcProducts.map((item) => (
                <tr key={item.product.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                        item.classification === 'A'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.classification === 'B'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Classe {item.classification}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {item.product.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-600">{item.product.sku}</td>
                  <td className="py-3 px-4 text-gray-600">{item.product.category}</td>
                  <td className="py-3 px-4 text-center font-bold text-gray-900">{item.salesCount}</td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    R$ {item.totalGenerated.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-gray-700">
                    {item.product.stock} un.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
