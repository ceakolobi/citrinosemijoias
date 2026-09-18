import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Ruler, 
  Heart, 
  ShoppingBag, 
  Check, 
  Info, 
  SlidersHorizontal,
  ArrowRight,
  HelpCircle,
  Gem,
  Award
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Product } from '../../types';

interface RingsViewProps {
  onOpenProduct: (product: Product) => void;
  onNavigate: (view: string, extra?: any) => void;
  onOpenCart: () => void;
}

const RING_SIZES = [
  { size: 14, mm: 15.0, circMm: 47.1 },
  { size: 16, mm: 15.6, circMm: 49.0 },
  { size: 18, mm: 16.2, circMm: 50.9 },
  { size: 20, mm: 16.8, circMm: 52.8 },
  { size: 22, mm: 17.5, circMm: 55.0 },
  { size: 24, mm: 18.2, circMm: 57.2 },
];

export const RingsView: React.FC<RingsViewProps> = ({
  onOpenProduct,
  onNavigate,
  onOpenCart,
}) => {
  const { products, addToCart, wishlist, toggleWishlist } = useCitrinoStore();

  // Filters
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [platingFilter, setPlatingFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [interactiveAro, setInteractiveAro] = useState<number>(16);

  // Selected variation for quick add per product
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);

  // Filter only rings
  const ringProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      const isRing = p.category === 'Anéis' || p.name.toLowerCase().includes('anel');
      if (!isRing) return false;

      // Style filter
      if (styleFilter === 'solitario' && !p.name.toLowerCase().includes('solitário')) return false;
      if (styleFilter === 'aparador' && !p.name.toLowerCase().includes('aparador')) return false;
      if (styleFilter === 'riviera' && !p.name.toLowerCase().includes('riviera')) return false;
      if (styleFilter === 'regulavel' && !p.name.toLowerCase().includes('regulável')) return false;
      if (styleFilter === 'citrino' && !p.stone.toLowerCase().includes('citrino')) return false;

      // Plating filter
      if (platingFilter !== 'all' && p.material !== platingFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priceAsc') return (a.promoPrice || a.price) - (b.promoPrice || b.price);
      if (sortBy === 'priceDesc') return (b.promoPrice || b.price) - (a.promoPrice || a.price);
      if (sortBy === 'bestseller') return (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, styleFilter, platingFilter, sortBy]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const variationName = selectedVariations[product.id] || (product.variations?.[0]?.name ?? 'Aro 16');
    addToCart(product, 1, variationName);
    setAddedSuccessId(product.id);
    setTimeout(() => setAddedSuccessId(null), 2000);
  };

  const currentSizeObj = RING_SIZES.find((s) => s.size === interactiveAro) || RING_SIZES[1];

  return (
    <div className="bg-[#FAF8F4] min-h-screen pb-20">
      {/* Editorial Rings Hero Banner */}
      <section className="relative bg-[#1C1C1C] text-white py-16 sm:py-24 overflow-hidden border-b border-[#2E2E2E]">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1600&auto=format&fit=crop"
            alt="Anéis e Solitários Citrino Semijoias"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[#C9A84C] tracking-widest uppercase mb-4">
              <button onClick={() => onNavigate('home')} className="hover:underline">Início</button>
              <span>/</span>
              <span className="text-white">Anéis</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-[#2A2A2A] border border-[#C9A84C]/30 px-3.5 py-1 rounded-full text-xs text-[#E5D7A7] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>Alta Joalheria em 10 Milésimos de Ouro 18k</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif-luxury font-medium tracking-tight text-[#FAF8F4] leading-tight">
              Anéis, Solitários & Aparadores
            </h1>

            <p className="mt-4 text-sm sm:text-base text-[#B3AFA8] leading-relaxed font-light">
              Projetados para abraçar o dedo com conforto anatômico absoluto. Cravações delicadas de microzircônias 5A, pedras citrino imperial lapidadas e tripla proteção de verniz Diamond hipoalergênico.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowSizeGuide(true)}
                className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b5943b] text-[#1C1C1C] px-5 py-3 rounded text-xs font-semibold uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                <Ruler className="w-4 h-4" />
                Guia Interativo de Aros
              </button>

              <div className="flex items-center gap-4 text-xs text-[#C9A84C]">
                <span className="flex items-center gap-1.5 text-white/90">
                  <ShieldCheck className="w-4 h-4 text-[#C9A84C]" /> 1 Ano de Garantia
                </span>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-1.5 text-white/90">
                  <Award className="w-4 h-4 text-[#C9A84C]" /> 100% Níquel Free
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Size Guide Drawer/Section */}
      {showSizeGuide && (
        <section className="bg-white border-b border-[#E8E4DC] py-10 px-4 sm:px-6 animate-fadeIn">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FAF8F4] text-[#C9A84C] rounded-full">
                  <Ruler className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-2xl text-[#1C1C1C] font-medium">
                    Guia de Medidas & Tabela de Aros Citrino
                  </h3>
                  <p className="text-xs text-[#7A766F] mt-0.5">
                    Descubra com precisão o tamanho ideal para o seu dedo ou para presentear
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-medium p-2 cursor-pointer"
              >
                Fechar ✕
              </button>
            </div>

            {/* Interactive Selector & Visual Ring Preview */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#FAF8F4] p-6 sm:p-8 rounded-xl border border-[#E8E4DC]">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#1C1C1C] mb-2">
                  1. Selecione o Aro para Visualizar o Diâmetro
                </h4>
                <p className="text-xs text-[#7A766F] mb-6 leading-relaxed">
                  Coloque um anel que você já possui sobre a tela ou meça a parte interna com uma régua escolar.
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {RING_SIZES.map((item) => (
                    <button
                      key={item.size}
                      onClick={() => setInteractiveAro(item.size)}
                      className={`py-2.5 px-2 text-center rounded border transition cursor-pointer ${
                        interactiveAro === item.size
                          ? 'bg-[#1C1C1C] text-[#C9A84C] border-[#1C1C1C] font-bold shadow-xs'
                          : 'bg-white text-gray-700 border-[#D5CFBF] hover:border-[#C9A84C]'
                      }`}
                    >
                      <span className="block text-xs uppercase text-gray-400">Aro</span>
                      <span className="block text-base font-serif-luxury font-bold">{item.size}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg border border-[#E8E4DC] text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Diâmetro Interno:</span>
                    <span className="font-semibold text-gray-900">{currentSizeObj.mm} mm ({currentSizeObj.mm / 10} cm)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Circunferência do Dedo:</span>
                    <span className="font-semibold text-[#C9A84C]">{currentSizeObj.circMm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dedo mais comum:</span>
                    <span className="text-gray-700">
                      {interactiveAro <= 14 ? 'Dedos Finos / Mínimo' : interactiveAro <= 18 ? 'Anelar Médio (Padrão Brasil)' : 'Médio / Polegar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Ring Visualizer */}
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-[#E8E4DC] text-center shadow-xs">
                <span className="text-[11px] uppercase tracking-widest text-[#C9A84C] font-semibold mb-3">
                  Simulação de Aro Real
                </span>

                {/* Scaled Ring Graphic */}
                <div
                  style={{
                    width: `${currentSizeObj.mm * 6}px`,
                    height: `${currentSizeObj.mm * 6}px`,
                    maxWidth: '180px',
                    maxHeight: '180px',
                  }}
                  className="rounded-full border-4 border-[#C9A84C] bg-[#FAF8F4] flex items-center justify-center shadow-md transition-all duration-300 relative"
                >
                  <div className="w-3/4 h-3/4 rounded-full border border-dashed border-[#C9A84C]/50 flex items-center justify-center">
                    <span className="font-serif-luxury text-lg sm:text-xl font-bold text-[#1C1C1C]">
                      Aro {interactiveAro}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 mt-4 max-w-xs leading-relaxed">
                  Posicione o centro interno da sua aliança sobre o círculo dourado. A linha deve coincidir com a borda de dentro do seu anel.
                </p>
              </div>
            </div>

            {/* Practical Measurement Tips */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3">
                <Info className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <p>
                  <strong>Dúvida entre dois tamanhos?</strong> Recomendamos sempre optar pelo tamanho maior para garantir que a passagem pelas articulações do dedo seja suave e confortável.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <p>
                  <strong>Para presentear sem errar:</strong> Nossos anéis reguláveis vestem do aro 14 ao 22 automaticamente com ajuste manual flexível.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter and Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Filter Tabs Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#E8E4DC]">
          {/* Style Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Todos os Anéis' },
              { id: 'solitario', label: 'Solitários' },
              { id: 'aparador', label: 'Aparadores de Aliança' },
              { id: 'riviera', label: 'Rivieras & Pavê' },
              { id: 'regulavel', label: 'Anéis Reguláveis' },
              { id: 'citrino', label: 'Pedra Citrino' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStyleFilter(tab.id)}
                className={`text-xs px-4 py-2 rounded-full whitespace-nowrap transition cursor-pointer font-medium ${
                  styleFilter === tab.id
                    ? 'bg-[#1C1C1C] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-[#F2EFE9] border border-[#E8E4DC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Secondary Selectors (Plating & Sort) */}
          <div className="flex items-center gap-3">
            <select
              value={platingFilter}
              onChange={(e) => setPlatingFilter(e.target.value)}
              className="text-xs bg-white border border-[#D5CFBF] rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-[#C9A84C] cursor-pointer"
            >
              <option value="all">Banho: Todos</option>
              <option value="Ouro 18k">Ouro 18k (10 milésimos)</option>
              <option value="Ródio Branco">Ródio Branco Nobre</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-white border border-[#D5CFBF] rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-[#C9A84C] cursor-pointer"
            >
              <option value="featured">Destaques da Joalheria</option>
              <option value="bestseller">Mais Vendidos</option>
              <option value="priceAsc">Menor Preço</option>
              <option value="priceDesc">Maior Preço</option>
            </select>
          </div>
        </div>

        {/* Ring Products Count */}
        <div className="py-4 flex items-center justify-between text-xs text-[#7A766F]">
          <span>Mostrando <strong>{ringProducts.length}</strong> modelos de anéis disponíveis</span>
          <button
            onClick={() => setShowSizeGuide(!showSizeGuide)}
            className="text-[#C9A84C] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Ruler className="w-3.5 h-3.5" />
            {showSizeGuide ? 'Ocultar Guia de Aros' : 'Como saber meu aro?'}
          </button>
        </div>

        {/* Products Grid */}
        {ringProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-[#E8E4DC] p-8">
            <Gem className="w-12 h-12 text-[#C9A84C] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif-luxury text-xl text-[#1C1C1C]">Nenhum anel encontrado com os filtros selecionados</h3>
            <p className="text-xs text-gray-500 mt-2">Experimente selecionar "Todos os Anéis" para ver o catálogo completo.</p>
            <button
              onClick={() => { setStyleFilter('all'); setPlatingFilter('all'); }}
              className="mt-4 px-4 py-2 bg-[#1C1C1C] text-white rounded text-xs uppercase tracking-wider cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ringProducts.map((product) => {
              const currentVar = selectedVariations[product.id] || (product.variations?.[0]?.name ?? 'Aro 16');
              const isFav = wishlist.includes(product.id);
              const isAdded = addedSuccessId === product.id;

              return (
                <div
                  key={product.id}
                  onClick={() => onOpenProduct(product)}
                  className="group bg-white rounded-lg border border-[#E8E4DC] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-[#F5F2EC]">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=900&auto=format&fit=crop';
                      }}
                    />

                    {/* Secondary Image on Hover */}
                    {product.images[1] && (
                      <img
                        src={product.images[1]}
                        alt={`${product.name} detalhe`}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=900&auto=format&fit=crop';
                        }}
                      />
                    )}

                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      {product.promoPrice && (
                        <span className="bg-[#1C1C1C] text-[#C9A84C] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          OFERTA
                        </span>
                      )}
                      {product.isNew && (
                        <span className="bg-[#C9A84C] text-[#1C1C1C] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          NOVO
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className={`absolute top-2.5 right-2.5 p-2 rounded-full transition ${
                        isFav ? 'bg-red-50 text-red-500' : 'bg-white/80 text-gray-600 hover:text-red-500'
                      }`}
                      aria-label="Adicionar aos Favoritos"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[#8C8880] mb-1">
                        <span>{product.plating}</span>
                        <span className="text-[#C9A84C] font-medium">{product.stone}</span>
                      </div>

                      <h3 className="font-serif-luxury text-base font-semibold text-[#1C1C1C] line-clamp-2 leading-snug group-hover:text-[#C9A84C] transition">
                        {product.name}
                      </h3>
                    </div>

                    {/* Ring Variations (Aros) Selector */}
                    {product.variations && product.variations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1.5">
                          Selecione o Aro:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {product.variations.map((v) => (
                            <button
                              key={v.id}
                              onClick={() =>
                                setSelectedVariations((prev) => ({ ...prev, [product.id]: v.name }))
                              }
                              className={`text-[11px] px-2 py-1 rounded border transition cursor-pointer ${
                                currentVar === v.name
                                  ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] font-semibold'
                                  : 'bg-[#FAF8F4] text-gray-700 border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              {v.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pricing & Add to Cart */}
                    <div className="mt-4 pt-3 border-t border-[#E8E4DC] flex items-center justify-between">
                      <div>
                        {product.promoPrice ? (
                          <div className="flex flex-col">
                            <span className="text-[11px] text-gray-400 line-through leading-none">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-base font-serif-luxury font-bold text-[#1C1C1C]">
                              R$ {product.promoPrice.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-base font-serif-luxury font-bold text-[#1C1C1C]">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                        <span className="block text-[10px] text-emerald-700 font-medium">
                          5% OFF no PIX
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className={`p-2.5 rounded transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] text-white'
                        }`}
                        title="Adicionar à sacola"
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span className="hidden sm:inline">Adicionado</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span className="hidden sm:inline">Comprar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Editorial Section: Ring Stacking Tips */}
        <section className="mt-20 bg-white rounded-2xl border border-[#E8E4DC] p-8 sm:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold">
              Guia de Estilo Citrino
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-medium text-[#1C1C1C] mt-2 mb-4">
              A Arte do "Ring Stacking" (Mix de Anéis)
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
              Sobrepor anéis de diferentes larguras e cravações é a forma mais autêntica de expressar sua personalidade. Confira três conselhos de nossas especialistas:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="p-6 bg-[#FAF8F4] rounded-xl border border-[#E8E4DC]">
              <span className="w-7 h-7 rounded-full bg-[#1C1C1C] text-[#C9A84C] font-bold text-xs flex items-center justify-center mb-4">
                1
              </span>
              <h4 className="font-serif-luxury text-base font-semibold text-[#1C1C1C] mb-2">
                Comece por um Anel de Destaque
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Escolha uma peça central com presença marcante — como o nosso Solitário Citrino Imperial ou um Anel Riviera com cravação brilhante.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F4] rounded-xl border border-[#E8E4DC]">
              <span className="w-7 h-7 rounded-full bg-[#1C1C1C] text-[#C9A84C] font-bold text-xs flex items-center justify-center mb-4">
                2
              </span>
              <h4 className="font-serif-luxury text-base font-semibold text-[#1C1C1C] mb-2">
                Harmonize com Aparadores Finos
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Os aparadores duplos ou aros lisos anatômicos abraçam anéis solitários e alianças, criando uma composição fluida e requintada.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F4] rounded-xl border border-[#E8E4DC]">
              <span className="w-7 h-7 rounded-full bg-[#1C1C1C] text-[#C9A84C] font-bold text-xs flex items-center justify-center mb-4">
                3
              </span>
              <h4 className="font-serif-luxury text-base font-semibold text-[#1C1C1C] mb-2">
                Equilíbrio Entre os Dedos
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Distribua as peças entre o dedo anelar, médio e indicador. Complete com um anel de falange para criar ritmo e leveza visual.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
