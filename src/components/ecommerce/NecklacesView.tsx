import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Ruler, 
  Heart, 
  ShoppingBag, 
  Check, 
  Info, 
  Layers,
  Award,
  Gem
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Product } from '../../types';

interface NecklacesViewProps {
  onOpenProduct: (product: Product) => void;
  onNavigate: (view: string, extra?: any) => void;
  onOpenCart: () => void;
}

const NECKLACE_LENGTHS = [
  {
    id: 'choker',
    name: 'Choker / Gargantilha Curta',
    length: '35 a 40 cm',
    position: 'Rente à base do pescoço',
    bestFor: 'Decotes ombro a ombro, tomara que caia e base para qualquer mix',
    graphicTop: '18%',
  },
  {
    id: 'princesa',
    name: 'Colar Princesa (Clássico)',
    length: '45 cm (+ 5cm extensor)',
    position: 'Sobre a clavícula / saboneteira',
    bestFor: 'Decotes em V, camisas sociais e uso diário como ponto de luz',
    graphicTop: '32%',
  },
  {
    id: 'matine',
    name: 'Colar Matinê',
    length: '50 a 55 cm',
    position: 'Logo acima do busto',
    bestFor: 'Golas altas, decotes fechados e camadas intermediárias',
    graphicTop: '48%',
  },
  {
    id: 'opera',
    name: 'Colar Longo / Escapulário',
    length: '60 a 70 cm',
    position: 'Abaixo da linha do busto',
    bestFor: 'Alongamento da silhueta e visual dramático elegante',
    graphicTop: '65%',
  },
];

export const NecklacesView: React.FC<NecklacesViewProps> = ({
  onOpenProduct,
  onNavigate,
  onOpenCart,
}) => {
  const { products, addToCart, wishlist, toggleWishlist } = useCitrinoStore();

  // Filter states
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [platingFilter, setPlatingFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showLengthGuide, setShowLengthGuide] = useState<boolean>(false);
  const [selectedLengthId, setSelectedLengthId] = useState<string>('princesa');
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);

  // Filter products for necklaces & chokers
  const necklaceProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      const isNecklace = 
        p.category === 'Colares & Chokers' || 
        p.category === 'Conjuntos Finos' ||
        p.name.toLowerCase().includes('colar') || 
        p.name.toLowerCase().includes('choker') ||
        p.name.toLowerCase().includes('escapulário');
      if (!isNecklace) return false;

      // Style subfilters
      if (styleFilter === 'riviera' && !p.name.toLowerCase().includes('riviera')) return false;
      if (styleFilter === 'pontodeluz' && !p.name.toLowerCase().includes('ponto de luz')) return false;
      if (styleFilter === 'gravatinha' && !p.name.toLowerCase().includes('gravatinha')) return false;
      if (styleFilter === 'religioso' && !p.name.toLowerCase().includes('escapulário')) return false;
      if (styleFilter === 'perola' && !p.stone.toLowerCase().includes('pérola')) return false;

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
    addToCart(product, 1, product.variations?.[0]?.name ?? 'Tamanho Único');
    setAddedSuccessId(product.id);
    setTimeout(() => setAddedSuccessId(null), 2000);
  };

  const activeLength = NECKLACE_LENGTHS.find((l) => l.id === selectedLengthId) || NECKLACE_LENGTHS[1];

  return (
    <div className="bg-[#FAF8F4] min-h-screen pb-20">
      {/* Editorial Necklaces Hero Banner */}
      <section className="relative bg-[#1C1C1C] text-white py-16 sm:py-24 overflow-hidden border-b border-[#2E2E2E]">
        <div className="absolute inset-0 opacity-25 pointer-events-none mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1600&auto=format&fit=crop"
            alt="Colares e Chokers Citrino Semijoias"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[#C9A84C] tracking-widest uppercase mb-4">
              <button onClick={() => onNavigate('home')} className="hover:underline">Início</button>
              <span>/</span>
              <span className="text-white">Colares</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-[#2A2A2A] border border-[#C9A84C]/30 px-3.5 py-1 rounded-full text-xs text-[#E5D7A7] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>Alta Joalheria em Banho Nobre 10 Milésimos</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif-luxury font-medium tracking-tight text-[#FAF8F4] leading-tight">
              Colares, Chokers & Rivieras
            </h1>

            <p className="mt-4 text-sm sm:text-base text-[#B3AFA8] leading-relaxed font-light">
              Ilumine o colo com peças desenhadas para fluir com perfeição. Desde a clássica Choker Riviera flexível até pontos de luz solitários e gravatinhas em Y, todos com extensores e fechos joalheria de alta segurança.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowLengthGuide(true)}
                className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b5943b] text-[#1C1C1C] px-5 py-3 rounded text-xs font-semibold uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                <Ruler className="w-4 h-4" />
                Guia Visual de Comprimentos
              </button>

              <div className="flex items-center gap-4 text-xs text-[#C9A84C]">
                <span className="flex items-center gap-1.5 text-white/90">
                  <ShieldCheck className="w-4 h-4 text-[#C9A84C]" /> 1 Ano de Garantia
                </span>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-1.5 text-white/90">
                  <Layers className="w-4 h-4 text-[#C9A84C]" /> Ideal para Layering
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Visual Necklace Length Guide */}
      {showLengthGuide && (
        <section className="bg-white border-b border-[#E8E4DC] py-10 px-4 sm:px-6 animate-fadeIn">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FAF8F4] text-[#C9A84C] rounded-full">
                  <Ruler className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-2xl text-[#1C1C1C] font-medium">
                    Guia de Comprimentos de Colar
                  </h3>
                  <p className="text-xs text-[#7A766F] mt-0.5">
                    Entenda onde cada comprimento cai no colo e aprenda a criar o mix perfeito
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLengthGuide(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-medium p-2 cursor-pointer"
              >
                Fechar ✕
              </button>
            </div>

            {/* Interactive Selector & Visual Silhouette */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#FAF8F4] p-6 sm:p-8 rounded-xl border border-[#E8E4DC]">
              {/* Length Selector Cards */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#1C1C1C] mb-2">
                  Selecione o Estilo de Corrente:
                </h4>
                {NECKLACE_LENGTHS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLengthId(item.id)}
                    className={`w-full text-left p-4 rounded-lg border transition cursor-pointer flex items-start justify-between ${
                      selectedLengthId === item.id
                        ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] shadow-sm'
                        : 'bg-white text-gray-800 border-[#D5CFBF] hover:border-[#C9A84C]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs uppercase font-bold tracking-wider ${
                          selectedLengthId === item.id ? 'text-[#C9A84C]' : 'text-gray-500'
                        }`}>
                          {item.length}
                        </span>
                        <span className="font-semibold text-sm">{item.name}</span>
                      </div>
                      <p className={`text-xs mt-1 leading-snug ${
                        selectedLengthId === item.id ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {item.position}
                      </p>
                    </div>
                    {selectedLengthId === item.id && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C9A84C] shrink-0 mt-1" />
                    )}
                  </button>
                ))}
              </div>

              {/* Graphic Neckline Visualizer */}
              <div className="bg-white rounded-xl border border-[#E8E4DC] p-6 text-center shadow-xs flex flex-col items-center">
                <span className="text-[11px] uppercase tracking-widest text-[#C9A84C] font-semibold mb-2">
                  Posicionamento no Decote
                </span>

                {/* Illustrated Silhouette Box with Chain Layering */}
                <div className="relative w-64 h-64 bg-[#FAF8F4] rounded-lg border border-[#E8E4DC] overflow-hidden flex items-center justify-center">
                  {/* Stylized Neck and Collarbone Lines */}
                  <svg className="w-full h-full text-gray-200" viewBox="0 0 200 200" fill="none">
                    {/* Head / Chin outline */}
                    <path d="M70 0 C70 40, 130 40, 130 0" stroke="#DDD" strokeWidth="2" fill="#FAF8F4" />
                    {/* Neck sides */}
                    <path d="M78 20 L78 70 M122 20 L122 70" stroke="#DDD" strokeWidth="2" />
                    {/* Shoulders */}
                    <path d="M78 70 C50 78, 10 95, 0 140 M122 70 C150 78, 190 95, 200 140" stroke="#DDD" strokeWidth="2" />
                    {/* Clavicle bones */}
                    <path d="M80 80 Q100 88 120 80" stroke="#DDD" strokeWidth="1.5" strokeDasharray="3 3" />

                    {/* Dynamic Chain Overlay */}
                    {/* Choker (38cm) */}
                    <path
                      d="M80 60 Q100 78 120 60"
                      stroke={selectedLengthId === 'choker' ? '#C9A84C' : '#DDD'}
                      strokeWidth={selectedLengthId === 'choker' ? '4' : '1.5'}
                      fill="none"
                    />

                    {/* Princesa (45cm) */}
                    <path
                      d="M75 75 Q100 110 125 75"
                      stroke={selectedLengthId === 'princesa' ? '#C9A84C' : '#DDD'}
                      strokeWidth={selectedLengthId === 'princesa' ? '4' : '1.5'}
                      fill="none"
                    />

                    {/* Matine (55cm) */}
                    <path
                      d="M70 85 Q100 140 130 85"
                      stroke={selectedLengthId === 'matine' ? '#C9A84C' : '#DDD'}
                      strokeWidth={selectedLengthId === 'matine' ? '4' : '1.5'}
                      fill="none"
                    />

                    {/* Opera (65cm) */}
                    <path
                      d="M65 95 Q100 175 135 95"
                      stroke={selectedLengthId === 'opera' ? '#C9A84C' : '#DDD'}
                      strokeWidth={selectedLengthId === 'opera' ? '4' : '1.5'}
                      fill="none"
                    />
                  </svg>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded text-left w-full text-xs">
                  <span className="font-semibold text-gray-900 block mb-0.5">
                    {activeLength.name} ({activeLength.length}):
                  </span>
                  <span className="text-gray-600 leading-tight block">
                    {activeLength.bestFor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Filter Tabs Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#E8E4DC]">
          {/* Style Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Todos os Colares' },
              { id: 'riviera', label: 'Chokers & Rivieras' },
              { id: 'pontodeluz', label: 'Ponto de Luz Solitário' },
              { id: 'gravatinha', label: 'Gravatinhas em Y' },
              { id: 'religioso', label: 'Escapulários & Fé' },
              { id: 'perola', label: 'Pérolas Barrocas' },
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

          {/* Secondary Selectors */}
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
              <option value="featured">Destaques da Coleção</option>
              <option value="bestseller">Mais Vendidos</option>
              <option value="priceAsc">Menor Preço</option>
              <option value="priceDesc">Maior Preço</option>
            </select>
          </div>
        </div>

        {/* Count Bar */}
        <div className="py-4 flex items-center justify-between text-xs text-[#7A766F]">
          <span>Mostrando <strong>{necklaceProducts.length}</strong> colares e chokers exclusivos</span>
          <button
            onClick={() => setShowLengthGuide(!showLengthGuide)}
            className="text-[#C9A84C] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Ruler className="w-3.5 h-3.5" />
            {showLengthGuide ? 'Ocultar Guia de Comprimento' : 'Ver Guia de Comprimentos'}
          </button>
        </div>

        {/* Products Grid */}
        {necklaceProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-[#E8E4DC] p-8">
            <Gem className="w-12 h-12 text-[#C9A84C] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif-luxury text-xl text-[#1C1C1C]">Nenhum colar encontrado com estes filtros</h3>
            <p className="text-xs text-gray-500 mt-2">Clique no botão abaixo para restaurar o catálogo de colares.</p>
            <button
              onClick={() => { setStyleFilter('all'); setPlatingFilter('all'); }}
              className="mt-4 px-4 py-2 bg-[#1C1C1C] text-white rounded text-xs uppercase tracking-wider cursor-pointer"
            >
              Ver Todos os Colares
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {necklaceProducts.map((product) => {
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
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=900&auto=format&fit=crop';
                      }}
                    />

                    {product.images[1] && (
                      <img
                        src={product.images[1]}
                        alt={`${product.name} no colo`}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=900&auto=format&fit=crop';
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
                      {product.bestSeller && (
                        <span className="bg-[#C9A84C] text-[#1C1C1C] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          BEST-SELLER
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

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[#8C8880] mb-1">
                        <span>{product.plating}</span>
                        <span className="text-[#C9A84C] font-medium">{product.stone}</span>
                      </div>

                      <h3 className="font-serif-luxury text-base font-semibold text-[#1C1C1C] line-clamp-2 leading-snug group-hover:text-[#C9A84C] transition">
                        {product.name}
                      </h3>

                      {product.details && product.details[0] && (
                        <p className="text-[11px] text-gray-500 mt-2 line-clamp-1">
                          {product.details[0]}
                        </p>
                      )}
                    </div>

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

        {/* Editorial Guide: Necklace Layering */}
        <section className="mt-20 bg-white rounded-2xl border border-[#E8E4DC] p-8 sm:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold">
              Consultoria de Imagem Citrino
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-medium text-[#1C1C1C] mt-2 mb-4">
              A Arte do "Necklace Layering" (Mix de Colares)
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
              Montar um mix harmônico de colares não é segredo: basta seguir a regra das três alturas para um colo iluminado e sem nós:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="p-6 bg-[#FAF8F4] rounded-xl border border-[#E8E4DC]">
              <span className="w-7 h-7 rounded-full bg-[#1C1C1C] text-[#C9A84C] font-bold text-xs flex items-center justify-center mb-4">
                1
              </span>
              <h4 className="font-serif-luxury text-base font-semibold text-[#1C1C1C] mb-2">
                A Choker Estruturada (38cm)
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ela ancora o visual rente ao pescoço. A Choker Riviera com zircônias é a escolha perfeita para garantir o brilho inicial de impacto.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F4] rounded-xl border border-[#E8E4DC]">
              <span className="w-7 h-7 rounded-full bg-[#1C1C1C] text-[#C9A84C] font-bold text-xs flex items-center justify-center mb-4">
                2
              </span>
              <h4 className="font-serif-luxury text-base font-semibold text-[#1C1C1C] mb-2">
                O Ponto Focal Central (45cm)
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                O clássico Ponto de Luz ou pingente de Citrino descansa na saboneteira, criando um segundo patamar luminoso que guia o olhar.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F4] rounded-xl border border-[#E8E4DC]">
              <span className="w-7 h-7 rounded-full bg-[#1C1C1C] text-[#C9A84C] font-bold text-xs flex items-center justify-center mb-4">
                3
              </span>
              <h4 className="font-serif-luxury text-base font-semibold text-[#1C1C1C] mb-2">
                A Corrente de Alongamento (55-60cm)
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Um escapulário com medalha trabalhada ou uma gravatinha em Y fecha a composição, alongando visualmente a silhueta com extrema elegância.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
