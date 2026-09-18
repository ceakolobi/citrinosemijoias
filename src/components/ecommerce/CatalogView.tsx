import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Heart, 
  ShoppingBag, 
  Star,
  Check,
  ChevronDown
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Product } from '../../types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=900&auto=format&fit=crop';

interface CatalogViewProps {
  initialCategory?: string;
  initialSearch?: string;
  onOpenProduct: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialCategory,
  initialSearch = '',
  onOpenProduct,
}) => {
  const { products, categories, addToCart, toggleWishlist, wishlist } = useCitrinoStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedStone, setSelectedStone] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.active)
      .filter((p) => {
        // Category
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        // Material
        if (selectedMaterial !== 'all' && p.material !== selectedMaterial) return false;
        // Stone
        if (selectedStone !== 'all' && p.stone !== selectedStone) return false;
        // Price Range
        const effectivePrice = p.promoPrice || p.price;
        if (priceRange === 'under150' && effectivePrice >= 150) return false;
        if (priceRange === '150to250' && (effectivePrice < 150 || effectivePrice > 250)) return false;
        if (priceRange === 'over250' && effectivePrice <= 250) return false;
        // Search
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchDesc = p.description.toLowerCase().includes(query);
          const matchCat = p.category.toLowerCase().includes(query);
          const matchMat = p.material.toLowerCase().includes(query);
          if (!matchName && !matchDesc && !matchCat && !matchMat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.promoPrice || a.price;
        const priceB = b.promoPrice || b.price;
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'bestseller') return (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0);
        return 0; // default featured
      });
  }, [products, selectedCategory, selectedMaterial, selectedStone, priceRange, searchQuery, sortBy]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedMaterial('all');
    setSelectedStone('all');
    setPriceRange('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedMaterial !== 'all' || selectedStone !== 'all' || priceRange !== 'all' || searchQuery !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Breadcrumb */}
      <div className="border-b border-[#E8E4DC] pb-6 mb-8">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#C9A84C] font-semibold">
          Joalheria Contemporânea
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
          <h1 className="text-3xl sm:text-4xl font-serif-luxury text-[#1C1C1C] font-light">
            {selectedCategory === 'all' ? 'Catálogo Completo de Semijoias' : selectedCategory}
          </h1>
          <span className="text-xs text-[#777]">
            Mostrando {filteredProducts.length} de {products.length} peças
          </span>
        </div>
      </div>

      {/* Top Search & Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl border border-[#E8E4DC] shadow-xs">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Filtrar por nome, banho, pedra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F4] border border-[#D5CFBF] text-xs rounded-full py-2 pl-9 pr-8 focus:outline-none focus:border-[#C9A84C]"
          />
          <Search className="w-4 h-4 text-[#888] absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile filter toggle & Sort dropdown */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 bg-[#FAF8F4] border border-[#D5CFBF] px-4 py-2 rounded-lg text-xs font-medium text-[#1C1C1C]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#C9A84C]" />
            Filtros
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-[#777] hidden sm:inline">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#FAF8F4] border border-[#D5CFBF] text-xs rounded-lg px-3 py-2 text-[#1C1C1C] focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="featured">Destaques Citrino</option>
              <option value="bestseller">Mais Vendidos</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="rating">Melhor Avaliados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#1C1C1C] text-[#FAF8F4]'
              : 'bg-white text-[#555] border border-[#E8E4DC] hover:border-[#C9A84C]'
          }`}
        >
          Todas as Joias
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.name)}
            className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
              selectedCategory === c.name
                ? 'bg-[#1C1C1C] text-[#FAF8F4]'
                : 'bg-white text-[#555] border border-[#E8E4DC] hover:border-[#C9A84C]'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Layout Grid: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className={`md:block space-y-6 ${mobileFilterOpen ? 'block mb-6' : 'hidden'}`}>
          <div className="bg-white p-5 rounded-xl border border-[#E8E4DC] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#1C1C1C] flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#C9A84C]" />
                Filtrar Joias
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-[#E8705A] hover:underline font-semibold"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Material / Banho */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider block">
                Banho & Material
              </label>
              <div className="space-y-1.5 text-xs text-[#555]">
                {['all', 'Ouro 18k', 'Ródio Branco', 'Ródio Negro', 'Prata 925'].map((mat) => (
                  <button
                    key={mat}
                    onClick={() => setSelectedMaterial(mat)}
                    className={`flex items-center justify-between w-full py-1.5 px-2 rounded hover:bg-[#FAF8F4] transition text-left ${
                      selectedMaterial === mat ? 'text-[#C9A84C] font-semibold bg-[#FAF8F4]' : ''
                    }`}
                  >
                    <span>{mat === 'all' ? 'Todos os Banhos' : mat}</span>
                    {selectedMaterial === mat && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Pedra / Gemologia */}
            <div className="space-y-2 pt-3 border-t border-[#F2ECE1]">
              <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider block">
                Pedra & Cravação
              </label>
              <div className="space-y-1.5 text-xs text-[#555]">
                {['all', 'Citrino Natural', 'Zircônia Cristal', 'Fusion Esmeralda', 'Pérola Shell', 'Sem Pedra'].map(
                  (stone) => (
                    <button
                      key={stone}
                      onClick={() => setSelectedStone(stone)}
                      className={`flex items-center justify-between w-full py-1.5 px-2 rounded hover:bg-[#FAF8F4] transition text-left ${
                        selectedStone === stone ? 'text-[#C9A84C] font-semibold bg-[#FAF8F4]' : ''
                      }`}
                    >
                      <span>{stone === 'all' ? 'Todas as Pedras' : stone}</span>
                      {selectedStone === stone && <Check className="w-3.5 h-3.5" />}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Faixa de Preço */}
            <div className="space-y-2 pt-3 border-t border-[#F2ECE1]">
              <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider block">
                Faixa de Preço
              </label>
              <div className="space-y-1.5 text-xs text-[#555]">
                {[
                  { id: 'all', label: 'Qualquer Preço' },
                  { id: 'under150', label: 'Até R$ 150,00' },
                  { id: '150to250', label: 'R$ 150,00 a R$ 250,00' },
                  { id: 'over250', label: 'Acima de R$ 250,00' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPriceRange(item.id)}
                    className={`flex items-center justify-between w-full py-1.5 px-2 rounded hover:bg-[#FAF8F4] transition text-left ${
                      priceRange === item.id ? 'text-[#C9A84C] font-semibold bg-[#FAF8F4]' : ''
                    }`}
                  >
                    <span>{item.label}</span>
                    {priceRange === item.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Banner Atacado no Sidebar */}
            <div className="p-3.5 rounded-lg bg-[#FAF8F4] border border-[#E8E4DC] text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8705A] block">
                Atacado & Lojistas
              </span>
              <p className="text-[11px] text-[#666]">
                Descontos de até 35% para pedidos com CNPJ e compras no atacado.
              </p>
              <button
                onClick={() => setSelectedCategory('Atacado & Revenda (B2B)')}
                className="text-xs font-bold text-[#1C1C1C] hover:text-[#C9A84C] transition underline"
              >
                Conhecer Condições
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E8E4DC] p-12 text-center space-y-4">
              <Search className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-xl font-serif-luxury text-[#1C1C1C]">
                Nenhuma joia encontrada para os filtros selecionados.
              </h3>
              <p className="text-xs text-[#777] max-w-sm mx-auto">
                Tente desmarcar alguns filtros ou pesquisar com outros termos no campo de busca.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-[#1C1C1C] text-white text-xs px-6 py-2.5 rounded font-medium uppercase tracking-wider hover:bg-[#C9A84C] transition cursor-pointer"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const isWish = wishlist.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-lg border border-[#EBE7DF] overflow-hidden hover:border-[#C9A84C]/60 hover:shadow-lg transition flex flex-col"
                  >
                    {/* Image Area */}
                    <div
                      className="relative aspect-square overflow-hidden bg-[#FAF8F4] cursor-pointer"
                      onClick={() => onOpenProduct(product)}
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                      />
                      {product.images[1] && (
                        <img
                          src={product.images[1]}
                          alt={product.name}
                          className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                          }}
                        />
                      )}

                      {/* Floating Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                        {product.promoPrice && (
                          <span className="bg-[#E8705A] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                            Oferta
                          </span>
                        )}
                        {product.isNew && (
                          <span className="bg-[#C9A84C] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                            Novidade
                          </span>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 hover:bg-white text-[#1C1C1C] shadow-sm transition z-10"
                        aria-label="Favoritar"
                      >
                        <Heart className={`w-4 h-4 ${isWish ? 'fill-[#E8705A] text-[#E8705A]' : 'text-gray-600'}`} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#888] font-medium uppercase tracking-wider">
                          <span>{product.category}</span>
                          <span>{product.material}</span>
                        </div>
                        <h3
                          onClick={() => onOpenProduct(product)}
                          className="font-serif-luxury text-base text-[#1C1C1C] hover:text-[#C9A84C] cursor-pointer font-medium leading-snug line-clamp-2 transition"
                        >
                          {product.name}
                        </h3>
                      </div>

                      {/* Price & Installments */}
                      <div className="pt-2 border-t border-[#F2ECE1]">
                        <div className="flex items-baseline gap-2">
                          {product.promoPrice ? (
                            <>
                              <span className="text-base font-semibold text-[#1C1C1C]">
                                R$ {product.promoPrice.toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                R$ {product.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-base font-semibold text-[#1C1C1C]">
                              R$ {product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#666] mt-0.5">
                          10x de R$ {((product.promoPrice || product.price) / 10).toFixed(2)} sem juros
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => addToCart(product, 1, product.variations[0]?.name)}
                        className="w-full bg-[#1C1C1C] hover:bg-[#C9A84C] text-white py-2 rounded text-xs font-medium tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Comprar Agora
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
