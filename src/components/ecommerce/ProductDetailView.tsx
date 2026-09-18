import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  RotateCcw, 
  Star, 
  Check,
  CreditCard,
  QrCode,
  Share2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  X,
  Award
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Product, ShippingOption } from '../../types';

const FALLBACK_JEWELRY_IMAGE = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=900&auto=format&fit=crop';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onNavigate: (view: string, extra?: any) => void;
  onOpenProduct: (product: Product) => void;
  onOpenCart: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onBack,
  onNavigate,
  onOpenProduct,
  onOpenCart,
}) => {
  const { addToCart, toggleWishlist, wishlist, products, calculateShippingByCep } = useCitrinoStore();

  const [selectedImage, setSelectedImage] = useState<string>(product.images[0] || FALLBACK_JEWELRY_IMAGE);
  const [selectedVariation, setSelectedVariation] = useState<string>(
    product.variations[0]?.name || 'Padrão'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedWarranty, setSelectedWarranty] = useState<string>('6 meses');
  const [cepInput, setCepInput] = useState<string>('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[] | null>(null);
  const [shippingLoading, setShippingLoading] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care' | 'warranty'>('desc');
  const [showCertModal, setShowCertModal] = useState<boolean>(false);

  // Keep selectedImage synchronized whenever the product changes
  useEffect(() => {
    setSelectedImage(product.images[0] || FALLBACK_JEWELRY_IMAGE);
    setSelectedVariation(product.variations[0]?.name || 'Padrão');
    setQuantity(1);
    setSelectedWarranty('6 meses');
  }, [product.id, product.images]);

  const isWish = wishlist.includes(product.id);
  const price = product.promoPrice || product.price;
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id && p.active)
    .slice(0, 4);

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (cepInput.trim().length >= 8) {
      setShippingLoading(true);
      setTimeout(() => {
        const results = calculateShippingByCep(cepInput);
        setShippingOptions(results);
        setShippingLoading(false);
      }, 300);
    }
  };

  const handleAddToCart = (directToCheckout = false) => {
    addToCart(product, quantity, selectedVariation, selectedWarranty);
    if (directToCheckout) {
      onNavigate('checkout');
    } else {
      onOpenCart();
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Top back breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#555] hover:text-[#C9A84C] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
        </button>

        <div className="flex items-center gap-4 text-xs text-[#777]">
          <span>SKU: <strong className="text-[#1C1C1C]">{product.sku}</strong></span>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 hover:text-[#C9A84C] transition"
            title="Compartilhar link"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{copiedLink ? 'Link Copiado!' : 'Compartilhar'}</span>
          </button>
        </div>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Photos Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[500px]">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                  selectedImage === img ? 'border-[#C9A84C]' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} foto ${idx}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_JEWELRY_IMAGE;
                  }}
                />
              </button>
            ))}
          </div>

          {/* Main Large Image */}
          <div className="flex-1 aspect-square rounded-2xl overflow-hidden bg-white border border-[#E8E4DC] relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-zoom-in"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_JEWELRY_IMAGE;
              }}
            />
            {product.promoPrice && (
              <span className="absolute top-4 left-4 bg-[#E8705A] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Oferta Especial
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 hover:bg-white text-[#1C1C1C] shadow-md transition"
              aria-label="Favoritar"
            >
              <Heart className={`w-5 h-5 ${isWish ? 'fill-[#E8705A] text-[#E8705A]' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                {product.category}
              </span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1 text-[#C9A84C] text-xs">
                <Star className="w-3.5 h-3.5 fill-[#C9A84C]" />
                <span className="font-bold text-[#1C1C1C]">{product.rating}</span>
                <span className="text-[#888]">({product.reviewCount} avaliações)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif-luxury text-[#1C1C1C] font-normal leading-tight">
              {product.name}
            </h1>

            <p className="text-xs text-[#666] leading-relaxed">
              {product.plating} • {product.stone} • Hipoalergênico
            </p>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E8E4DC] space-y-2">
            <div className="flex items-baseline gap-3">
              {product.promoPrice ? (
                <>
                  <span className="text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
                    R$ {product.promoPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    R$ {product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
                  R$ {product.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs text-[#555]">
              <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <QrCode className="w-4 h-4" /> 5% de desconto no PIX: R$ {(price * 0.95).toFixed(2)}
              </p>
              <p className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#C9A84C]" /> ou em até 10x de R$ {(price / 10).toFixed(2)} sem juros no cartão
              </p>
            </div>
          </div>

          {/* Variations (Aros / Tamanhos) */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1C1C1C]">
                  Selecione o Tamanho / Aro:
                </label>
                <span className="text-[11px] text-[#C9A84C] underline cursor-pointer">
                  Guia de Medidas
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariation(v.name)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      selectedVariation === v.name
                        ? 'border-[#C9A84C] bg-[#C9A84C] text-white shadow-xs'
                        : 'border-[#D5CFBF] bg-white text-[#1C1C1C] hover:border-[#C9A84C]'
                    }`}
                  >
                    {v.name}
                    {v.stock <= 3 && (
                      <span className="ml-1.5 text-[9px] opacity-80">(restam {v.stock})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Opção de Garantia na Hora da Compra */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
                Opção de Garantia:
              </label>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full font-semibold">
                Certificado Físico Incluso
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Opção 6 Meses */}
              <button
                type="button"
                onClick={() => setSelectedWarranty('6 meses')}
                className={`p-3 rounded-xl border text-left transition relative cursor-pointer ${
                  selectedWarranty === '6 meses'
                    ? 'border-[#C9A84C] bg-[#FAF8F4] ring-1 ring-[#C9A84C] shadow-xs'
                    : 'border-[#E8E4DC] bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-[#1C1C1C] flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        selectedWarranty === '6 meses' ? 'text-[#C9A84C]' : 'text-gray-300'
                      }`}
                    />
                    Garantia 6 Meses
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                    Inclusa
                  </span>
                </div>
                <p className="text-[11px] text-[#666] leading-tight">
                  Proteção oficial no banho de ouro 18k e cravação de pedras por 6 meses.
                </p>
              </button>

              {/* Opção 1 Ano (12 Meses) */}
              <button
                type="button"
                onClick={() => setSelectedWarranty('1 ano')}
                className={`p-3 rounded-xl border text-left transition relative cursor-pointer ${
                  selectedWarranty === '1 ano'
                    ? 'border-[#C9A84C] bg-[#FAF8F4] ring-1 ring-[#C9A84C] shadow-xs'
                    : 'border-[#E8E4DC] bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-[#1C1C1C] flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        selectedWarranty === '1 ano' ? 'text-[#C9A84C]' : 'text-gray-300'
                      }`}
                    />
                    Garantia 1 Ano
                  </span>
                  <span className="text-[10px] font-bold text-[#C9A84C] bg-[#FAF8F4] border border-[#C9A84C]/40 px-1.5 py-0.5 rounded">
                    Estendida
                  </span>
                </div>
                <p className="text-[11px] text-[#666] leading-tight">
                  12 meses de cobertura total com verniz Diamond e suporte prioritário Citrino.
                </p>
              </button>
            </div>

            {/* Link para ver espelho do certificado */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowCertModal(true)}
                className="inline-flex items-center gap-1.5 text-[#C9A84C] hover:text-[#9E7D2E] font-medium transition cursor-pointer hover:underline"
              >
                <FileText className="w-3.5 h-3.5" />
                Visualizar Espelho do Certificado Oficial
              </button>
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#C9A84C]" /> 10 Milésimos Ouro 18k
              </span>
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#D5CFBF] rounded-lg bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-sm font-bold text-[#555] hover:text-[#1C1C1C]"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-bold min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-sm font-bold text-[#555] hover:text-[#1C1C1C]"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => handleAddToCart(false)}
                className="flex-1 bg-white hover:bg-[#FAF8F4] border-2 border-[#1C1C1C] text-[#1C1C1C] py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Adicionar à Sacola
              </button>
            </div>

            <button
              onClick={() => handleAddToCart(true)}
              className="w-full bg-[#C9A84C] hover:bg-[#B5943B] text-white py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              Comprar Agora
            </button>
          </div>

          {/* Shipping Calculation Widget */}
          <div className="p-4 rounded-xl bg-white border border-[#E8E4DC] space-y-3">
            <label className="text-xs font-semibold text-[#1C1C1C] flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#C9A84C]" />
              Calcular Frete e Prazo de Entrega:
            </label>

            <form onSubmit={handleCalculateShipping} className="flex gap-2">
              <input
                type="text"
                placeholder="Digite seu CEP (ex: 01426-000)"
                value={cepInput}
                onChange={(e) => setCepInput(e.target.value)}
                maxLength={9}
                className="flex-1 bg-[#FAF8F4] border border-[#D5CFBF] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
              />
              <button
                type="submit"
                className="bg-[#1C1C1C] hover:bg-[#333] text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                {shippingLoading ? 'Calculando...' : 'Calcular'}
              </button>
            </form>

            {shippingOptions && (
              <div className="space-y-1.5 pt-2 text-xs border-t border-gray-100 animate-in fade-in duration-200">
                {shippingOptions.map((opt) => (
                  <div key={opt.id} className="flex items-center justify-between py-1 text-[#444]">
                    <span>
                      {opt.name} ({opt.days} dias úteis)
                    </span>
                    <span className="font-bold text-[#1C1C1C]">
                      {opt.price === 0 ? (
                        <span className="text-emerald-600 uppercase font-semibold">Grátis</span>
                      ) : (
                        `R$ ${opt.price.toFixed(2)}`
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-[#444] p-2.5 bg-[#FAF8F4] rounded-lg">
              <ShieldCheck className="w-4 h-4 text-[#C9A84C] shrink-0" />
              <span>Garantia oficial (6 meses a 1 ano)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#444] p-2.5 bg-[#FAF8F4] rounded-lg">
              <RotateCcw className="w-4 h-4 text-[#C9A84C] shrink-0" />
              <span>7 dias para troca grátis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications, Care, Warranty */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-8 space-y-6">
        <div className="flex border-b border-[#E8E4DC] gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'desc', label: 'Descrição da Peça' },
            { id: 'specs', label: 'Especificações Técnicas' },
            { id: 'care', label: 'Cuidados com a Semijoia' },
            { id: 'warranty', label: 'Termo de Garantia' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs uppercase tracking-widest font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#C9A84C] text-[#1C1C1C]'
                  : 'border-transparent text-[#777] hover:text-[#1C1C1C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs sm:text-sm text-[#555] leading-relaxed max-w-3xl">
          {activeTab === 'desc' && (
            <div className="space-y-4">
              <p>{product.description}</p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#444]">
                {product.details?.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-[#FAF8F4] rounded-lg">
                <span className="text-[#888] block text-[11px] uppercase font-bold">Banho de Ouro</span>
                <span className="text-[#1C1C1C] font-medium">{product.plating}</span>
              </div>
              <div className="p-3 bg-[#FAF8F4] rounded-lg">
                <span className="text-[#888] block text-[11px] uppercase font-bold">Pedraria</span>
                <span className="text-[#1C1C1C] font-medium">{product.stone}</span>
              </div>
              <div className="p-3 bg-[#FAF8F4] rounded-lg">
                <span className="text-[#888] block text-[11px] uppercase font-bold">Antialérgico</span>
                <span className="text-[#1C1C1C] font-medium">100% Níquel Free (Livre de metais pesados)</span>
              </div>
              <div className="p-3 bg-[#FAF8F4] rounded-lg">
                <span className="text-[#888] block text-[11px] uppercase font-bold">Origem</span>
                <span className="text-[#1C1C1C] font-medium">Polo Joalheiro de Limeira - SP (Brasil)</span>
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3">
              <p className="font-semibold text-[#1C1C1C]">Para manter sua semijoia Citrino sempre radiante:</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>Evite o contato direto com perfumes, cremes hidratantes, álcool em gel e produtos químicos.</li>
                <li>Retire suas peças antes do banho de chuveiro, piscina ou mar.</li>
                <li>Guarde individualmente em saquinhos de veludo para evitar atrito entre as peças.</li>
                <li>Para limpeza rápida, utilize apenas flanela mágica seca e macia.</li>
              </ul>
            </div>
          )}

          {activeTab === 'warranty' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FAF8F4] rounded-xl border border-[#E8E4DC] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#1C1C1C] text-xs uppercase tracking-wider">
                    Certificado Físico Citrino Semijoias
                  </h4>
                  <p className="text-xs text-[#555] mt-1 leading-relaxed">
                    Todas as peças incluem a opção de <strong>Garantia Oficial de 6 Meses</strong> (ou Estendida de 1 Ano) acompanhada de certificado nominal com a data do pedido e instruções de preservação.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-[#E8E4DC] rounded-lg">
                  <span className="font-bold text-[#1C1C1C] block text-xs mb-1">
                    ✓ Garantia Oficial de 6 Meses
                  </span>
                  <p className="text-[#666] leading-relaxed">
                    Cobre desprendimento total ou parcial do banho de ouro 18k e ródio branco, além de cravação de zircônias e pedras naturais por 180 dias.
                  </p>
                </div>
                <div className="p-3 bg-white border border-[#E8E4DC] rounded-lg">
                  <span className="font-bold text-[#1C1C1C] block text-xs mb-1">
                    ✓ Garantia Estendida de 1 Ano
                  </span>
                  <p className="text-[#666] leading-relaxed">
                    Cobre 365 dias de proteção premium com nanotecnologia Diamond e atendimento joalheiro prioritário em nosso ateliê.
                  </p>
                </div>
              </div>

              <p className="text-[#777] text-xs leading-relaxed">
                * A garantia não se aplica a peças raspadas em superfícies ásperas, amassadas, arrebentadas por tração, expostas a produtos químicos abrasivos ou com perda de pedras por impacto.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
              Combine com sua escolha
            </span>
            <h3 className="text-2xl font-serif-luxury text-[#1C1C1C] mt-1">
              Você Também Pode Gostar
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => {
                  onOpenProduct(rel);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group cursor-pointer bg-white rounded-lg border border-[#EBE7DF] overflow-hidden hover:border-[#C9A84C]/50 transition p-3 space-y-2"
              >
                <div className="aspect-square bg-[#FAF8F4] rounded overflow-hidden">
                  <img
                    src={rel.images[0]}
                    alt={rel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_JEWELRY_IMAGE;
                    }}
                  />
                </div>
                <h4 className="font-serif-luxury text-sm font-medium text-[#1C1C1C] line-clamp-1 group-hover:text-[#C9A84C]">
                  {rel.name}
                </h4>
                <p className="text-xs font-bold text-[#1C1C1C]">
                  R$ {(rel.promoPrice || rel.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Modal de Espelho do Certificado de Garantia */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8E0D2] relative p-6 sm:p-8 space-y-6">
            {/* Fechar */}
            <button
              onClick={() => setShowCertModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-[#1C1C1C] hover:bg-gray-100 transition"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificado Timbrado Citrino */}
            <div className="border-2 border-[#C9A84C] p-6 rounded-xl bg-[#FAF8F4] relative overflow-hidden text-center space-y-4">
              {/* Marca d'água de fundo */}
              <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
                <img src="/citrino-logo.jpg" alt="" className="w-96 h-96 object-contain" />
              </div>

              {/* Cabeçalho do Certificado */}
              <div className="space-y-1">
                <div className="w-16 h-16 mx-auto rounded-full bg-white p-2 border border-[#C9A84C]/40 shadow-xs flex items-center justify-center mb-2">
                  <img src="/citrino-logo.jpg" alt="Citrino" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-serif-luxury text-xl font-bold text-[#1C1C1C] tracking-wide">
                  CITRINO SEMIJOIAS
                </h3>
                <p className="text-[10px] tracking-[0.25em] text-[#C9A84C] uppercase font-semibold">
                  Certificado Oficial de Garantia & Autenticidade
                </p>
              </div>

              <div className="w-24 h-[1px] bg-[#C9A84C]/60 mx-auto" />

              {/* Informações da Peça */}
              <div className="text-left bg-white/80 p-3.5 rounded-lg border border-[#E8E4DC] text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Peça:</span>
                  <span className="font-bold text-[#1C1C1C] text-right truncate max-w-[240px]">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Referência (SKU):</span>
                  <span className="font-mono text-[#1C1C1C]">{product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Banho Nobre:</span>
                  <span className="font-semibold text-[#C9A84C]">{product.plating || '10 Milésimos Ouro 18k'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Vigência da Garantia:</span>
                  <span className="font-bold text-emerald-800 uppercase">
                    {selectedWarranty === '1 ano' ? '12 Meses (Estendida)' : '6 Meses (Oficial)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Tecnologia:</span>
                  <span className="text-gray-700">Antialérgica (Nickel Free) + Verniz Diamond</span>
                </div>
              </div>

              {/* Termo de Garantia */}
              <div className="text-left text-[11px] text-gray-600 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-gray-800">Termos de Cobertura:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                  <li>Cobertura integral contra defeitos de fabricação e desprendimento do banho no período contratado.</li>
                  <li>Manutenção de pedras e cravações originais.</li>
                  <li>Substituição da peça ou rebanho imediato em nossa fábrica sem burocracia.</li>
                </ul>
              </div>

              {/* Rodapé e Carimbo */}
              <div className="pt-2 border-t border-[#E8E4DC] flex items-center justify-between text-[9px] text-gray-400">
                <span>Certificado ID: CIT-CERT-{product.sku.replace('CIT-', '')}</span>
                <span className="font-serif-luxury italic text-[#C9A84C]">Alta Joalheria Contemporânea</span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 rounded-xl border border-[#C9A84C] text-[#C9A84C] hover:bg-[#FAF8F4] font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir Certificado
              </button>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1C1C1C] text-white hover:bg-black font-medium text-xs flex items-center justify-center transition cursor-pointer"
              >
                Entendi, Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
