import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Check, 
  X, 
  Upload, 
  Image as ImageIcon,
  DollarSign,
  Tag,
  Layers,
  Scale,
  Sparkles
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Product, ProductVariation } from '../../types';

export const AdminProducts: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useCitrinoStore();

  const [search, setSearch] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPlating, setFilterPlating] = useState<string>('all');
  const [filterStockStatus, setFilterStockStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [formName, setFormName] = useState<string>('');
  const [formSku, setFormSku] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Anéis');
  const [formMaterial, setFormMaterial] = useState<string>('Ouro 18k');
  const [formPlating, setFormPlating] = useState<string>('Banho de Ouro 18k (10 milésimos)');
  const [formStone, setFormStone] = useState<string>('Citrino Natural');
  const [formWeight, setFormWeight] = useState<number>(4.2);
  const [formCostPrice, setFormCostPrice] = useState<number>(45.00);
  const [formPrice, setFormPrice] = useState<number>(189.90);
  const [formPromoPrice, setFormPromoPrice] = useState<string>('159.90');
  const [formWholesalePrice, setFormWholesalePrice] = useState<number>(110.00);
  const [formStock, setFormStock] = useState<number>(15);
  const [formMinStock, setFormMinStock] = useState<number>(3);
  const [formDescription, setFormDescription] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop');
  const [formVariations, setFormVariations] = useState<ProductVariation[]>([
    { id: 'v1', name: 'Aro 16', stock: 5 },
    { id: 'v2', name: 'Aro 18', stock: 5 },
    { id: 'v3', name: 'Aro 20', stock: 5 },
  ]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku(`CIT-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormCategory('Anéis');
    setFormMaterial('Ouro 18k');
    setFormPlating('Banho de Ouro 18k (10 milésimos)');
    setFormStone('Citrino Natural');
    setFormWeight(3.5);
    setFormCostPrice(40.00);
    setFormPrice(179.90);
    setFormPromoPrice('');
    setFormWholesalePrice(105.00);
    setFormStock(12);
    setFormMinStock(3);
    setFormDescription('Peça exclusiva desenvolvida com altíssimo padrão de acabamento joalheiro.');
    setFormImageUrl('https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop');
    setFormVariations([
      { id: 'v1', name: 'Aro 16', stock: 4 },
      { id: 'v2', name: 'Aro 18', stock: 4 },
      { id: 'v3', name: 'Aro 20', stock: 4 },
    ]);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormCategory(p.category);
    setFormMaterial(p.material);
    setFormPlating(p.plating);
    setFormStone(p.stone);
    setFormWeight(p.weightGrams);
    setFormCostPrice(p.costPrice);
    setFormPrice(p.price);
    setFormPromoPrice(p.promoPrice ? String(p.promoPrice) : '');
    setFormWholesalePrice(p.wholesalePrice);
    setFormStock(p.stock);
    setFormMinStock(p.minStock);
    setFormDescription(p.description);
    setFormImageUrl(p.images[0] || '');
    setFormVariations(p.variations || []);
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const productData: Omit<Product, 'id'> = {
      name: formName,
      sku: formSku,
      category: formCategory,
      material: formMaterial,
      plating: formPlating,
      stone: formStone,
      weightGrams: Number(formWeight),
      costPrice: Number(formCostPrice),
      price: Number(formPrice),
      promoPrice: formPromoPrice ? Number(formPromoPrice) : undefined,
      wholesalePrice: Number(formWholesalePrice),
      stock: Number(formStock),
      minStock: Number(formMinStock),
      active: true,
      images: [formImageUrl],
      description: formDescription,
      details: [
        `Peso aproximado: ${formWeight}g`,
        `Banho de alta resistência com verniz Diamond`,
        `Livre de níquel e cádmio`,
      ],
      variations: formVariations,
      rating: 5.0,
      reviewCount: 1,
      warranty: '1 ano no banho nobre e cravação',
      isNew: true,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    setIsModalOpen(false);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (filterPlating !== 'all' && !p.plating.toLowerCase().includes(filterPlating.toLowerCase())) return false;
    if (filterStockStatus === 'low' && p.stock > p.minStock) return false;
    if (filterStockStatus === 'zero' && p.stock > 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Catálogo & Estoque de Semijoias
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Cadastro técnico completo, variações de aro/corrente e controle de reposição no polo de Limeira.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-[#E97527] hover:bg-[#D5651B] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Semijoia</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Buscar por nome da peça, SKU ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F4F5F7] border border-gray-200 rounded-lg text-xs py-2 pl-9 pr-3 focus:outline-none focus:border-[#E97527]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#F4F5F7] border border-gray-200 text-xs rounded-lg px-3 py-2 text-gray-700 focus:outline-none"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterStockStatus}
            onChange={(e) => setFilterStockStatus(e.target.value)}
            className="bg-[#F4F5F7] border border-gray-200 text-xs rounded-lg px-3 py-2 text-gray-700 focus:outline-none"
          >
            <option value="all">Todo o Estoque</option>
            <option value="low">Estoque Baixo (&le; Mínimo)</option>
            <option value="zero">Estoque Esgotado (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Foto & Semijoia</th>
                <th className="py-3 px-4">SKU / Cód.</th>
                <th className="py-3 px-4">Categoria / Banho</th>
                <th className="py-3 px-4">Custo / Venda / Atacado</th>
                <th className="py-3 px-4 text-center">Estoque Atual</th>
                <th className="py-3 px-4 text-center">Variações</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const isLow = product.stock <= product.minStock;
                const margin = ((product.price - product.costPrice) / product.price) * 100;

                return (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition">
                    {/* Photo + Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-11 h-11 rounded-lg object-cover border border-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <span className="text-[11px] text-gray-400">
                            {product.stone} • {product.weightGrams}g
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-4 font-mono text-gray-600 font-semibold">
                      {product.sku}
                    </td>

                    {/* Category & Plating */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-800 block">{product.category}</span>
                      <span className="text-[11px] text-gray-400 truncate max-w-[140px] block">
                        {product.plating}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="py-3 px-4 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          R$ {product.price.toFixed(2)}
                        </span>
                        {product.promoPrice && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.2 rounded">
                            Promo: R$ {product.promoPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 flex gap-2">
                        <span>Custo: R$ {product.costPrice.toFixed(2)}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">
                          Margem: {margin.toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    {/* Stock status badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isLow && <AlertTriangle className="w-3 h-3" />}
                        <span>{product.stock} un.</span>
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        Mín: {product.minStock}
                      </span>
                    </td>

                    {/* Variations count */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-gray-600 font-semibold">
                        {product.variations?.length || 1} tam.
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 text-gray-500 hover:text-[#E97527] hover:bg-orange-50 rounded transition"
                          title="Editar Cadastro"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir permanentemente "${product.name}"?`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Excluir Produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E97527]">
                  Citrino Gestão Joalheira
                </span>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Editar Semijoia' : 'Cadastrar Nova Semijoia'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-gray-700">Nome da Semijoia *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Anel Solitário Citrino Ouro 18k"
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded-lg p-2.5 focus:border-[#E97527] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">SKU / Código *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded-lg p-2.5 focus:border-[#E97527] focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Categoria *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded-lg p-2.5 focus:border-[#E97527] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Banho / Camada *</label>
                  <input
                    type="text"
                    required
                    value={formPlating}
                    onChange={(e) => setFormPlating(e.target.value)}
                    placeholder="Banho de Ouro 18k (10 milésimos)"
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded-lg p-2.5 focus:border-[#E97527] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Pedra Principal</label>
                  <input
                    type="text"
                    value={formStone}
                    onChange={(e) => setFormStone(e.target.value)}
                    placeholder="Citrino Natural, Zircônia..."
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded-lg p-2.5 focus:border-[#E97527] focus:outline-none"
                  />
                </div>
              </div>

              {/* Pricing & Costs */}
              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-200 space-y-3">
                <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px] block">
                  Precificação & Margens
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Preço de Custo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formCostPrice}
                      onChange={(e) => setFormCostPrice(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 rounded p-2 focus:border-[#E97527] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-900">Preço Venda (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 rounded p-2 focus:border-[#E97527] focus:outline-none font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Promoção (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formPromoPrice}
                      onChange={(e) => setFormPromoPrice(e.target.value)}
                      placeholder="Opcional"
                      className="w-full bg-white border border-gray-300 rounded p-2 focus:border-[#E97527] focus:outline-none text-emerald-700 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Atacado B2B (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formWholesalePrice}
                      onChange={(e) => setFormWholesalePrice(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 rounded p-2 focus:border-[#E97527] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Stock & Technical */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Estoque Atual *</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded-lg p-2.5 focus:border-[#E97527] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Estoque Mínimo (Alerta) *</label>
                  <input
                    type="number"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded-lg p-2.5 focus:border-[#E97527] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Peso Estimado (gramas)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded-lg p-2.5 focus:border-[#E97527] focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">URL da Foto Principal</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="flex-1 bg-[#F4F5F7] border border-gray-200 rounded-lg p-2.5 focus:border-[#E97527] focus:outline-none"
                  />
                  {formImageUrl && (
                    <img
                      src={formImageUrl}
                      alt="Prévia"
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Descrição Comercial para o E-commerce</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#F4F5F7] border border-gray-200 rounded-lg p-2.5 focus:border-[#E97527] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#E97527] hover:bg-[#D5651B] text-white font-bold uppercase tracking-wider rounded-lg transition"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
