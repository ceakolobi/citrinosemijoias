import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Heart,
  ShoppingBag,
  Check,
  SlidersHorizontal,
  ArrowRight,
  Wind,
  Droplets,
  Star,
  Search,
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Product } from '../../types';

interface PerfumesViewProps {
  onOpenProduct: (product: Product) => void;
  onNavigate: (view: string, extra?: any) => void;
  onOpenCart: () => void;
}

// Famílias olfativas para filtro
const FRAGRANCE_FAMILIES = [
  { id: 'all', label: 'Todas as Famílias' },
  { id: 'floral', label: 'Floral' },
  { id: 'frutal', label: 'Frutal' },
  { id: 'amadeirado', label: 'Amadeirado' },
  { id: 'oriental', label: 'Oriental' },
  { id: 'citrico', label: 'Cítrico' },
  { id: 'aquatico', label: 'Aquático' },
  { id: 'gourmand', label: 'Gourmand' },
];

// Concentrações
const CONCENTRATIONS = [
  { id: 'all', label: 'Todas as Concentrações' },
  { id: 'parfum', label: 'Parfum (EDP +30%)' },
  { id: 'edp', label: 'Eau de Parfum (EDP)' },
  { id: 'edt', label: 'Eau de Toilette (EDT)' },
  { id: 'splash', label: 'Body Splash' },
  { id: 'oleo', label: 'Óleo Perfumado' },
];

export const PerfumesView: React.FC<PerfumesViewProps> = ({
  onOpenProduct,
  onNavigate,
  onOpenCart,
}) => {
  const { products, addToCart, wishlist, toggleWishlist } = useCitrinoStore();

  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [concentrationFilter, setConcentrationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);

  // Filtra apenas produtos da categoria Perfumes
  const perfumeProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      const isPerfume =
        p.category === 'Perfumes' ||
        p.name.toLowerCase().includes('perfume') ||
        p.name.toLowerCase().includes('fragr') ||
        p.name.toLowerCase().includes('deo') ||
        p.name.toLowerCase().includes('body splash');
      if (!isPerfume) return false;

      // Busca textual
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q)
        )
          return false;
      }

      // Família olfativa
      if (familyFilter !== 'all') {
        const desc = (p.description + ' ' + p.name + ' ' + (p.details?.join(' ') || '')).toLowerCase();
        if (!desc.includes(familyFilter)) return false;
      }

      // Concentração
      if (concentrationFilter !== 'all') {
        const desc = (p.description + ' ' + p.name + ' ' + (p.details?.join(' ') || '')).toLowerCase();
        const concMap: Record<string, string[]> = {
          parfum: ['parfum', 'edp+', 'extrait'],
          edp: ['eau de parfum', 'edp'],
          edt: ['eau de toilette', 'edt'],
          splash: ['body splash', 'splash'],
          oleo: ['óleo', 'oleo', 'oil'],
        };
        const terms = concMap[concentrationFilter] || [];
        if (!terms.some((t) => desc.includes(t))) return false;
      }

      return true;
    });
  }, [products, familyFilter, concentrationFilter, searchQuery]);

  // Ordenação
  const sortedProducts = useMemo(() => {
    const arr = [...perfumeProducts];
    switch (sortBy) {
      case 'price-asc':
        return arr.sort((a, b) => (a.promoPrice ?? a.price) - (b.promoPrice ?? b.price));
      case 'price-desc':
        return arr.sort((a, b) => (b.promoPrice ?? b.price) - (a.promoPrice ?? a.price));
      case 'rating':
        return arr.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return arr.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      default:
        return arr.sort((a, b) => {
          const scoreA = (a.featured ? 2 : 0) + (a.bestSeller ? 1 : 0);
          const scoreB = (b.featured ? 2 : 0) + (b.bestSeller ? 1 : 0);
          return scoreB - scoreA;
        });
    }
  }, [perfumeProducts, sortBy]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedSuccessId(product.id);
    setTimeout(() => setAddedSuccessId(null), 1500);
  };

  const isEmpty = sortedProducts.length === 0;

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* ── HERO BANNER ── */}
      <section className="relative bg-gradient-to-br from-[#1C1C1C] via-[#2a1f3d] to-[#3d1a1a] overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#C9A84C]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-purple-900/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-semibold tracking-[0.22em] uppercase px-4 py-1.5 rounded-full mb-5 border border-[#C9A84C]/30">
            <Wind className="w-3.5 h-3.5" />
            Nova Linha
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury font-medium text-white tracking-[0.12em] uppercase leading-tight mb-4">
            Perfumes
          </h1>
          <p className="text-base sm:text-lg text-[#D1CECB] max-w-xl leading-relaxed mb-8">
            Fragrâncias exclusivas que traduzem elegância, feminilidade e sofisticação. Cada essência
            foi pensada para acompanhar você do primeiro ao último traço do dia.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#C9A84C]">
            <span className="flex items-center gap-2">
              <Droplets className="w-4 h-4" /> Essências Selecionadas
            </span>
            <span className="text-[#555]">•</span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Alta Fixação
            </span>
            <span className="text-[#555]">•</span>
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4" /> Exclusividade Citrino
            </span>
          </div>
        </div>
      </section>

      {/* ── CONTEÚDO ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Barra de busca + filtros + ordem */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
            <input
              type="text"
              placeholder="Buscar perfumes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E0DBD0] rounded-lg text-sm bg-white focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]"
            />
          </div>

          {/* Botão filtros mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-2 border border-[#E0DBD0] px-4 py-2.5 rounded-lg text-sm font-medium text-[#333] bg-white"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </button>

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-[#E0DBD0] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#C9A84C] text-[#555]"
          >
            <option value="featured">Destaques</option>
            <option value="newest">Lançamentos</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
            <option value="rating">Melhor Avaliados</option>
          </select>
        </div>

        <div className="flex gap-8">
          {/* ── SIDEBAR de filtros (desktop) ── */}
          <aside className={`${showFilters ? 'block' : 'hidden'} sm:block w-full sm:w-56 shrink-0`}>
            <div className="bg-white border border-[#E8E4DC] rounded-xl p-5 space-y-6 sticky top-24">
              {/* Família olfativa */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#888] mb-3">
                  Família Olfativa
                </h3>
                <div className="space-y-2">
                  {FRAGRANCE_FAMILIES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFamilyFilter(f.id)}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition ${
                        familyFilter === f.id
                          ? 'bg-[#C9A84C] text-white font-semibold'
                          : 'text-[#444] hover:bg-[#F5F2EC]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Concentração */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#888] mb-3">
                  Concentração
                </h3>
                <div className="space-y-2">
                  {CONCENTRATIONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setConcentrationFilter(c.id)}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition ${
                        concentrationFilter === c.id
                          ? 'bg-[#C9A84C] text-white font-semibold'
                          : 'text-[#444] hover:bg-[#F5F2EC]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Limpar filtros */}
              {(familyFilter !== 'all' || concentrationFilter !== 'all') && (
                <button
                  onClick={() => {
                    setFamilyFilter('all');
                    setConcentrationFilter('all');
                  }}
                  className="w-full text-xs text-[#C9A84C] hover:underline font-medium"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </aside>

          {/* ── GRID de produtos ── */}
          <div className="flex-1">
            {isEmpty ? (
              /* ── Estado vazio ── */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-[#F5F0E8] rounded-full flex items-center justify-center mb-5">
                  <Wind className="w-9 h-9 text-[#C9A84C]" />
                </div>
                <h2 className="text-xl font-serif-luxury font-semibold text-[#1C1C1C] mb-2">
                  Em breve — nossa linha de Perfumes
                </h2>
                <p className="text-sm text-[#777] max-w-sm mb-6">
                  Os primeiros produtos dessa coleção especial estão a caminho. Acesse o{' '}
                  <strong>Painel ERP Citrino</strong> para adicionar os perfumes e eles aparecerão
                  automaticamente aqui.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="inline-flex items-center gap-2 border border-[#E0DBD0] text-[#333] text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#F5F2EC] transition"
                  >
                    Ver Coleção Completa
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#999] mb-4">
                  {sortedProducts.length} produto{sortedProducts.length !== 1 ? 's' : ''} encontrado
                  {sortedProducts.length !== 1 ? 's' : ''}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {sortedProducts.map((product) => {
                    const inWishlist = wishlist.includes(product.id);
                    const price = product.promoPrice ?? product.price;
                    const hasPromo = product.promoPrice && product.promoPrice < product.price;
                    const added = addedSuccessId === product.id;

                    return (
                      <div
                        key={product.id}
                        className="group bg-white border border-[#EDE9E0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        {/* Imagem */}
                        <div
                          className="relative aspect-square overflow-hidden cursor-pointer bg-[#F5F2EC]"
                          onClick={() => onOpenProduct(product)}
                        >
                          {product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Wind className="w-12 h-12 text-[#C9A84C]/40" />
                            </div>
                          )}

                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {product.isNew && (
                              <span className="bg-[#1C1C1C] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                Novo
                              </span>
                            )}
                            {product.bestSeller && (
                              <span className="bg-[#C9A84C] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                Best Seller
                              </span>
                            )}
                            {hasPromo && (
                              <span className="bg-[#E8705A] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                -{Math.round(((product.price - product.promoPrice!) / product.price) * 100)}%
                              </span>
                            )}
                          </div>

                          {/* Wishlist */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Heart
                              className={`w-4 h-4 ${inWishlist ? 'fill-[#E8705A] text-[#E8705A]' : 'text-[#333]'}`}
                            />
                          </button>
                        </div>

                        {/* Info */}
                        <div className="p-3 sm:p-4">
                          <p className="text-[10px] tracking-wider uppercase text-[#C9A84C] font-semibold mb-1">
                            Perfume
                          </p>
                          <h3
                            className="text-sm font-medium text-[#1C1C1C] leading-snug mb-2 cursor-pointer hover:text-[#C9A84C] transition line-clamp-2"
                            onClick={() => onOpenProduct(product)}
                          >
                            {product.name}
                          </h3>

                          {/* Avaliação */}
                          {product.reviewCount > 0 && (
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.round(product.rating)
                                      ? 'fill-[#C9A84C] text-[#C9A84C]'
                                      : 'text-[#DDD]'
                                  }`}
                                />
                              ))}
                              <span className="text-[10px] text-[#999] ml-0.5">
                                ({product.reviewCount})
                              </span>
                            </div>
                          )}

                          {/* Preço */}
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-base font-bold text-[#1C1C1C]">
                              R$ {price.toFixed(2).replace('.', ',')}
                            </span>
                            {hasPromo && (
                              <span className="text-xs line-through text-[#AAA]">
                                R$ {product.price.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>

                          {/* Parcelas */}
                          <p className="text-[10px] text-[#777] mb-3">
                            ou 10x de R$ {(price / 10).toFixed(2).replace('.', ',')} sem juros
                          </p>

                          {/* Botão */}
                          <button
                            onClick={() => handleAddToCart(product)}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition ${
                              added
                                ? 'bg-green-500 text-white'
                                : 'bg-[#1C1C1C] hover:bg-[#C9A84C] text-white'
                            }`}
                          >
                            {added ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Adicionado!
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" /> Adicionar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── CTA — Conhecer mais ── */}
        <div className="mt-16 bg-gradient-to-r from-[#1C1C1C] to-[#2a1f3d] rounded-2xl p-8 sm:p-12 text-center">
          <Sparkles className="w-8 h-8 text-[#C9A84C] mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-white tracking-wide mb-3">
            Combinações Exclusivas
          </h2>
          <p className="text-[#D1CECB] text-sm sm:text-base max-w-md mx-auto mb-6">
            Crie o seu look completo — perfume + semijoia Citrino. Uma combinação que vai além do
            visual e toca os sentidos.
          </p>
          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b5943b] text-white text-sm font-semibold uppercase tracking-widest px-8 py-3 rounded-full transition"
          >
            Ver Semijoias <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
