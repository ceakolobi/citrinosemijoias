import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Heart, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Award, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Product } from '../../types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=900&auto=format&fit=crop';

interface HomeViewProps {
  onNavigate: (view: string, extra?: any) => void;
  onOpenProduct: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenProduct }) => {
  const { products, categories, collections, banners, addToCart, toggleWishlist, wishlist } = useCitrinoStore();

  const activeBanner = banners.find((b) => b.active) || banners[0];
  const featuredProducts = products.filter((p) => p.featured && p.active).slice(0, 4);
  const bestSellers = products.filter((p) => p.bestSeller && p.active).slice(0, 4);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#1C1C1C] text-white min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden">
        {/* Background Image with luxury dark gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeBanner.image}
            alt={activeBanner.title}
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition duration-1000"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1C] via-[#1C1C1C]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              {activeBanner.tag || 'ALTA JOALHERIA CONTEMPORÂNEA'}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury font-light tracking-tight leading-[1.1] text-white">
              {activeBanner.title}
            </h1>

            <p className="text-sm sm:text-base text-[#D1CECB] font-light leading-relaxed max-w-xl">
              {activeBanner.subtitle}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('catalog')}
                className="bg-[#C9A84C] hover:bg-[#B5943B] text-white px-8 py-3.5 rounded font-medium text-xs tracking-[0.2em] uppercase transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>{activeBanner.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('about')}
                className="bg-transparent hover:bg-white/10 text-[#FAF8F4] border border-white/30 px-6 py-3.5 rounded font-medium text-xs tracking-[0.2em] uppercase transition"
              >
                Nossa Garantia 1 Ano
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES ROW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] text-[#C9A84C] uppercase">
            Navegue por Categoria
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury text-[#1C1C1C] mt-1">
            Joias Feitas Para Encantar
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category) => {
            const handleClick = () => {
              if (category.name === 'Anéis') {
                onNavigate('aneis');
              } else if (category.name === 'Colares & Chokers') {
                onNavigate('colares');
              } else if (category.name.includes('Atacado') || category.name.includes('Revenda')) {
                onNavigate('revendedora');
              } else {
                onNavigate('catalog', { category: category.name });
              }
            };

            return (
              <div
                key={category.id}
                onClick={handleClick}
                className="group cursor-pointer text-center space-y-3 p-4 rounded-xl bg-white border border-[#EBE7DF] hover:border-[#C9A84C] transition duration-300 shadow-xs hover:shadow-md"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-[#FAF8F4] relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] group-hover:text-[#C9A84C] transition">
                    {category.name}
                  </h3>
                  <span className="text-[11px] text-[#888]">
                    {category.itemCount} peças
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS (Destaques) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C9A84C] uppercase">
              Coleção Especial
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury text-[#1C1C1C] mt-1">
              Destaques da Joalheria
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#1C1C1C] hover:text-[#C9A84C] transition"
          >
            Ver Todas as Peças <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => {
            const isWish = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                className="group bg-white rounded-lg border border-[#EBE7DF] overflow-hidden hover:border-[#C9A84C]/50 hover:shadow-lg transition duration-300 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-[#FAF8F4] cursor-pointer" onClick={() => onOpenProduct(product)}>
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

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                    {product.promoPrice && (
                      <span className="bg-[#E8705A] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                        Oferta
                      </span>
                    )}
                    {product.bestSeller && (
                      <span className="bg-[#1C1C1C] text-[#C9A84C] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                        Best-Seller
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

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-[#888] font-medium">
                      {product.category} • {product.material}
                    </p>
                    <h3
                      onClick={() => onOpenProduct(product)}
                      className="font-serif-luxury text-base text-[#1C1C1C] hover:text-[#C9A84C] cursor-pointer font-medium leading-snug line-clamp-2 transition"
                    >
                      {product.name}
                    </h3>
                  </div>

                  {/* Prices & Installments */}
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
                      ou 10x de R$ {((product.promoPrice || product.price) / 10).toFixed(2)} sem juros
                    </p>
                  </div>

                  {/* Add button */}
                  <button
                    onClick={() => addToCart(product, 1, product.variations[0]?.name)}
                    className="w-full bg-[#1C1C1C] hover:bg-[#C9A84C] text-white py-2 rounded text-xs font-medium tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Adicionar à Sacola
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. LUXURY EDITORIAL BANNER (Coleção Citrino Imperial) */}
      <section className="bg-[#F4EFE6] border-y border-[#E8E0D2] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A84C]">
                Manifesto da Marca
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif-luxury font-light text-[#1C1C1C] leading-tight">
                O Ouro Que Te Acompanha Em Cada Conquista
              </h2>
              <p className="text-sm text-[#555] leading-relaxed">
                Cada semijoia Citrino passa por um rigoroso processo de galvanoplastia em Limeira, polo joalheiro de excelência nacional. Aplicamos 10 milésimos de ouro 18k e selamento em nanotecnologia Diamond, garantindo que o brilho permaneça intacto por anos.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1C1C]">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> 100% Níquel Free
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1C1C]">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> Cravação Joalheira
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1C1C]">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> Verniz Antialérgico
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1C1C]">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> Troca sem Custo
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('revendedora')}
                  className="bg-[#1C1C1C] hover:bg-[#333] text-white px-6 py-3 rounded text-xs tracking-widest uppercase font-medium transition cursor-pointer"
                >
                  Quero Revender Citrino (B2B)
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white border border-[#E8E0D2] shadow-md p-6 flex flex-col items-center justify-center text-center group hover:border-[#C9A84C] transition duration-300">
                <div className="w-48 h-48 rounded-xl overflow-hidden bg-[#FAF8F4] border border-[#E8E4DC] p-2 mb-4 shadow-inner">
                  <img
                    src="/citrino-logo.jpg"
                    alt="Brasão Oficial Citrino Semijoias"
                    className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] tracking-[0.25em] text-[#C9A84C] uppercase font-bold">
                  Identidade Visual Exclusiva
                </span>
                <h4 className="font-serif-luxury text-lg text-[#1C1C1C] mt-1 font-semibold">
                  A Arte do Citrino Nobre
                </h4>
                <p className="text-[11px] text-[#666] mt-1 leading-relaxed">
                  Monograma dourado com esmaltação verde sálvia e pedra citrino lapidada em alta joalheria.
                </p>
              </div>
              <img
                src={collections[0].image}
                alt="Coleção Citrino"
                className="w-full h-full min-h-[320px] object-cover rounded-2xl shadow-md"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C9A84C] uppercase">
            As Mais Desejadas
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury text-[#1C1C1C] mt-1">
            Favoritas das Nossas Clientes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <div
              key={product.id}
              onClick={() => onOpenProduct(product)}
              className="group cursor-pointer bg-white rounded-lg border border-[#EBE7DF] overflow-hidden hover:border-[#C9A84C]/50 hover:shadow-md transition p-3 space-y-3"
            >
              <div className="aspect-square bg-[#FAF8F4] rounded overflow-hidden relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                />
                <span className="absolute top-2 left-2 bg-[#C9A84C] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Top Escolha
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1 text-[#C9A84C] text-xs">
                  <Star className="w-3.5 h-3.5 fill-[#C9A84C]" />
                  <span className="font-semibold text-[#1C1C1C]">{product.rating}</span>
                  <span className="text-[#888] text-[11px]">({product.reviewCount})</span>
                </div>
                <h4 className="font-serif-luxury text-base text-[#1C1C1C] font-medium mt-1 line-clamp-1 group-hover:text-[#C9A84C] transition">
                  {product.name}
                </h4>
                <p className="text-sm font-semibold text-[#1C1C1C] mt-1">
                  R$ {(product.promoPrice || product.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CLIENT TESTIMONIALS */}
      <section className="bg-white border-t border-[#EBE7DF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C9A84C] uppercase">
              Depoimentos Reais
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury text-[#1C1C1C] mt-1">
              O Que Dizem Nossas Clientes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-[#FAF8F4] border border-[#E8E4DC] space-y-4">
              <div className="flex text-[#C9A84C]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C9A84C]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#444] italic leading-relaxed">
                "A Choker Riviera superou todas as minhas expectativas! O fecho é idêntico ao de uma joia maciça e o brilho das zircônias é surreal. Uso há 6 meses e continua como no dia que chegou."
              </p>
              <div className="pt-2 border-t border-[#E8E4DC]">
                <p className="text-xs font-semibold text-[#1C1C1C]">Beatriz Alcantara</p>
                <p className="text-[11px] text-[#888]">São Paulo - SP • Compra Verificada</p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#FAF8F4] border border-[#E8E4DC] space-y-4">
              <div className="flex text-[#C9A84C]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C9A84C]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#444] italic leading-relaxed">
                "Sou revendedora há 2 anos e as semijoias da Citrino são as que mais vendem no meu showroom. A caixinha de veludo, a garantia de 1 ano e o acabamento impecável dão muita credibilidade."
              </p>
              <div className="pt-2 border-t border-[#E8E4DC]">
                <p className="text-xs font-semibold text-[#1C1C1C]">Carla Menezes</p>
                <p className="text-[11px] text-[#888]">Belo Horizonte - MG • Revendedora B2B</p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#FAF8F4] border border-[#E8E4DC] space-y-4">
              <div className="flex text-[#C9A84C]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C9A84C]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#444] italic leading-relaxed">
                "Tenho muita alergia a níquel e nunca conseguia usar brincos por muito tempo. Os da Citrino foram os primeiros que não me causaram irritação alguma. Estou apaixonada!"
              </p>
              <div className="pt-2 border-t border-[#E8E4DC]">
                <p className="text-xs font-semibold text-[#1C1C1C]">Fernanda Guimarães</p>
                <p className="text-[11px] text-[#888]">Curitiba - PR • Compra Verificada</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
