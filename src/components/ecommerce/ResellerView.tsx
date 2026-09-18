import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Gift, 
  RotateCcw, 
  CheckCircle2, 
  DollarSign, 
  Phone, 
  MessageCircle, 
  ChevronDown, 
  ShoppingBag,
  HeartHandshake,
  Award,
  Send,
  ArrowRight,
  Package
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Product } from '../../types';

interface ResellerViewProps {
  onNavigate: (view: string, extra?: any) => void;
  onOpenProduct: (product: Product) => void;
  onOpenCart: () => void;
}

export const ResellerView: React.FC<ResellerViewProps> = ({
  onNavigate,
  onOpenProduct,
  onOpenCart,
}) => {
  const { companySettings, addToCart, setCurrentCustomer, currentCustomer } = useCitrinoStore();

  // Profit Simulator State
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);

  // Form State
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    document: '',
    city: '',
    uf: 'SP',
    experience: 'iniciante',
    investmentTier: '1000',
  });

  // Active FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Simulator Calculations
  // 35% wholesale discount from MSRP
  const discountRate = investmentAmount >= 2000 ? 0.45 : investmentAmount >= 1000 ? 0.40 : 0.35;
  const estimatedRevenue = investmentAmount / (1 - discountRate) * 1.35; // typical markup 100% to 150%
  const estimatedProfit = estimatedRevenue - investmentAmount;
  const estimatedPieces = Math.round(investmentAmount / 45); // avg wholesale price R$ 45

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp) return;

    // Upgrade current user to B2B wholesale
    if (currentCustomer) {
      setCurrentCustomer({
        ...currentCustomer,
        name: formData.name,
        email: formData.email || currentCustomer.email,
        whatsapp: formData.whatsapp,
        isB2BWholesale: true,
      });
    }

    setFormSubmitted(true);
  };

  const handleAddKitToCart = (kitTitle: string, price: number, pieces: number) => {
    // Create a virtual product representing the reseller kit
    const kitProduct: Product = {
      id: `kit-${Date.now()}`,
      sku: 'KIT-REV-01',
      name: kitTitle,
      description: `Kit completo de revenda com ${pieces} semijoias selecionadas, mostruário de veludo e certificados de garantia.`,
      details: [
        `${pieces} Semijoias banhadas a 10 milésimos de ouro 18k`,
        'Mostruário executivo de veludo para atendimento',
        'Certificados físicos de garantia de 1 ano',
        'Material fotográfico para divulgação no WhatsApp e Instagram',
      ],
      price: price * 1.6,
      promoPrice: price,
      wholesalePrice: price,
      stock: 10,
      category: 'Atacado & Revenda (B2B)',
      material: 'Ouro 18k',
      stone: 'Zircônia Cristal',
      plating: '10 milésimos Ouro 18k',
      warranty: '1 ano oficial no banho',
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=900&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=900&auto=format&fit=crop'
      ],
      variations: [{ id: 'k1', name: 'Kit Completo', stock: 10 }],
      featured: true,
      isNew: true,
      bestSeller: true,
      active: true,
      rating: 5.0,
      reviewCount: 42,
    };

    addToCart(kitProduct, 1, 'Kit Completo');
    onOpenCart();
  };

  return (
    <div className="bg-[#FAF8F4] min-h-screen pb-24 text-[#1C1C1C]">
      {/* Hero Section */}
      <section className="relative bg-[#161616] text-white py-20 sm:py-28 overflow-hidden border-b border-[#2C2C2C]">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1600&auto=format&fit=crop"
            alt="Revendedora de Semijoias Citrino"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#262626] border border-[#C9A84C]/40 px-3.5 py-1.5 rounded-full text-xs text-[#E5D7A7] mb-6">
              <Briefcase className="w-4 h-4 text-[#C9A84C]" />
              <span className="font-semibold tracking-wide">Programa Oficial de Revenda & Atacado B2B</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury font-medium tracking-tight text-white leading-tight">
              Conquiste sua Independência com as Semijoias Mais Desejadas
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#B5B1A8] font-light leading-relaxed max-w-2xl">
              Lucre de <strong>100% a 200%</strong> revendendo peças com acabamento de alta joalheria, banho de 10 milésimos de ouro 18k, garantia de 1 ano e suporte integral de vendas.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#cadastro"
                className="bg-[#C9A84C] hover:bg-[#b89539] text-[#1C1C1C] px-6 py-3.5 rounded font-semibold text-xs uppercase tracking-wider transition shadow-lg inline-flex items-center gap-2 cursor-pointer"
              >
                Quero Ser Revendedora
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#simulador"
                className="bg-[#242424] hover:bg-[#303030] text-white border border-[#444] px-5 py-3.5 rounded font-semibold text-xs uppercase tracking-wider transition inline-flex items-center gap-2 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-[#C9A84C]" />
                Simular Meus Ganhos
              </a>

              <a
                href={`https://wa.me/55${companySettings.whatsapp.replace(/\D/g, '')}?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20como%20ser%20uma%20revendedora%20Citrino.`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] hover:bg-[#20b858] text-white px-5 py-3.5 rounded font-semibold text-xs uppercase tracking-wider transition inline-flex items-center gap-2 shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com Consultora
              </a>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-12 pt-8 border-t border-[#333] grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
              <div>
                <span className="block text-2xl font-serif-luxury font-bold text-[#C9A84C]">100% a 200%</span>
                <span className="text-gray-400">Margem de Lucro</span>
              </div>
              <div>
                <span className="block text-2xl font-serif-luxury font-bold text-white">10 Milésimos</span>
                <span className="text-gray-400">Banho em Ouro 18k</span>
              </div>
              <div>
                <span className="block text-2xl font-serif-luxury font-bold text-[#C9A84C]">1 Ano</span>
                <span className="text-gray-400">Garantia no Certificado</span>
              </div>
              <div>
                <span className="block text-2xl font-serif-luxury font-bold text-white">10x Sem Juros</span>
                <span className="text-gray-400">No Cartão de Crédito</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Profit Simulator Section */}
      <section id="simulador" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-10 shadow-xl">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Simulador Financeiro de Lucro
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-medium text-[#1C1C1C] mt-2 mb-2">
              Quanto Você Quer Ganhar por Mês?
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
              Arraste a barra para escolher quanto deseja investir no seu pedido inicial com desconto de fábrica e veja a projeção do seu retorno.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Slider Column */}
            <div className="lg:col-span-6 bg-[#FAF8F4] p-6 sm:p-8 rounded-xl border border-[#E8E4DC]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-semibold text-gray-500">Seu Investimento Inicial:</span>
                <span className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
                  R$ {investmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <input
                type="range"
                min="500"
                max="5000"
                step="250"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="w-full h-2.5 bg-[#E8E4DC] rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
              />

              <div className="flex justify-between text-[11px] text-gray-400 mt-2 font-medium">
                <span>R$ 500 (Kit Start)</span>
                <span>R$ 2.500</span>
                <span>R$ 5.000 (Showroom)</span>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Desconto Atacado Aplicado:</span>
                  <span className="font-bold text-emerald-700">{(discountRate * 100).toFixed(0)}% OFF direto de fábrica</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantidade média de semijoias:</span>
                  <span className="font-semibold text-gray-900">~{estimatedPieces} peças finas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giro médio estimado:</span>
                  <span className="text-gray-700 font-medium">20 a 35 dias de vendas</span>
                </div>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#1C1C1C] text-white p-6 rounded-xl border border-[#333] shadow-md">
                <span className="text-[11px] uppercase tracking-wider text-gray-400 block mb-1">
                  Faturamento Bruto Projetado
                </span>
                <span className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white block">
                  R$ {estimatedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-gray-400 mt-2 block leading-relaxed">
                  Valor total ao revender as peças com preço de tabela sugerido.
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl shadow-xs">
                <span className="text-[11px] uppercase tracking-wider text-emerald-800 font-semibold block mb-1">
                  Seu Lucro Líquido no Bolso
                </span>
                <span className="text-2xl sm:text-3xl font-serif-luxury font-bold text-emerald-700 block">
                  R$ {estimatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium mt-2 block leading-relaxed">
                  + de 100% de retorno real sobre seu capital investido.
                </span>
              </div>

              <div className="sm:col-span-2 p-4 bg-[#FAF8F4] rounded-lg border border-[#E8E4DC] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-[#C9A84C] shrink-0" />
                  <div>
                    <strong className="text-gray-900 block">Bônus Especial para Primeiro Pedido:</strong>
                    <span className="text-gray-600">Mostruário executivo de veludo preto + certificados de garantia incluídos grátis.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Advantages Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold">
            Por que Escolher a Citrino
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-medium text-[#1C1C1C] mt-2 mb-4">
            Vantagens que Garantem o Sucesso das Nossas Revendedoras
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
            Oferecemos uma estrutura completa de apoio para que você só precise se preocupar em encantar suas clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-xl border border-[#E8E4DC] hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F4] text-[#C9A84C] flex items-center justify-center mb-5 border border-[#E8E4DC]">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-lg font-semibold text-[#1C1C1C] mb-2">
              Margem de 100% a 200%
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Comprando direto de fábrica sem atravessadores, você tem a melhor margem do mercado joalheiro para multiplicar sua renda.
            </p>
          </div>

          <div className="bg-white p-7 rounded-xl border border-[#E8E4DC] hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F4] text-[#C9A84C] flex items-center justify-center mb-5 border border-[#E8E4DC]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-lg font-semibold text-[#1C1C1C] mb-2">
              1 Ano de Garantia com Certificado
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Você recebe cartelas e certificados oficiais impressos para carimbar com seu nome e entregar às suas clientes, transmitindo credibilidade total.
            </p>
          </div>

          <div className="bg-white p-7 rounded-xl border border-[#E8E4DC] hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F4] text-[#C9A84C] flex items-center justify-center mb-5 border border-[#E8E4DC]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-lg font-semibold text-[#1C1C1C] mb-2">
              Garantia de Troca de 20%
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ficou com alguma peça parada? No seu primeiro pedido, você pode trocar até 20% dos itens não vendidos em até 30 dias por outras novidades.
            </p>
          </div>

          <div className="bg-white p-7 rounded-xl border border-[#E8E4DC] hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F4] text-[#C9A84C] flex items-center justify-center mb-5 border border-[#E8E4DC]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-lg font-semibold text-[#1C1C1C] mb-2">
              10 Milésimos & Hipoalergênico
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Acabamento em ouro 18k e ródio com tecnologia 100% livre de níquel. Suas clientes nunca terão problemas com alergias ou irritações na pele.
            </p>
          </div>

          <div className="bg-white p-7 rounded-xl border border-[#E8E4DC] hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F4] text-[#C9A84C] flex items-center justify-center mb-5 border border-[#E8E4DC]">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-lg font-semibold text-[#1C1C1C] mb-2">
              Material de Apoio e Marketing
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Acesso a fotos em estúdio de alta definição, vídeos em alta resolução e catálogo digital em PDF para você compartilhar nas suas redes sociais e WhatsApp.
            </p>
          </div>

          <div className="bg-white p-7 rounded-xl border border-[#E8E4DC] hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F4] text-[#C9A84C] flex items-center justify-center mb-5 border border-[#E8E4DC]">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-lg font-semibold text-[#1C1C1C] mb-2">
              Consultora Exclusiva no WhatsApp
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Você terá o contato direto de uma gerente de expansão para tirar dúvidas sobre reposição, tendências de moda e dicas de precificação.
            </p>
          </div>
        </div>
      </section>

      {/* Ready-to-Sell Starter Kits Showcase */}
      <section className="bg-[#1C1C1C] text-white py-20 border-y border-[#333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold">
              Kits Promocionais de Entrada
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-medium text-white mt-2 mb-3">
              Comece Hoje com Nossos Kits Campeões de Venda
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-light">
              Seleções prontas com as peças que mais vendem no Brasil, incluindo embalagens e mostruário.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Kit Start */}
            <div className="bg-[#242424] rounded-2xl border border-[#383838] p-7 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Kit Básico</span>
                <h3 className="font-serif-luxury text-2xl font-bold text-white mt-1">Kit Start Revenda</h3>
                <p className="text-xs text-gray-400 mt-2">
                  Ideal para quem deseja testar com amigas, familiares e colegas de trabalho.
                </p>

                <div className="mt-6 pb-6 border-b border-[#383838]">
                  <span className="text-xs text-gray-400 block">Investimento no Atacado:</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-serif-luxury font-bold text-[#C9A84C]">R$ 499,00</span>
                    <span className="text-xs text-gray-400">ou 10x de R$ 49,90</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium block mt-1">
                    Retorno estimado: R$ 1.100,00 (Lucro ~R$ 601,00)
                  </span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> 10 Semijoias clássicas mais vendidas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> 1 Rolo de veludo porta-joias brinde
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> 15 Certificados de garantia impressos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> Material de divulgação digital
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleAddKitToCart('Kit Start Revenda Citrino (10 Peças)', 499, 10)}
                className="mt-8 w-full bg-[#C9A84C] hover:bg-[#b5943b] text-[#1C1C1C] py-3 rounded text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Adicionar Kit à Sacola
              </button>
            </div>

            {/* Kit Empreendedora (Featured) */}
            <div className="bg-[#2A2A2A] rounded-2xl border-2 border-[#C9A84C] p-7 flex flex-col justify-between relative shadow-2xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C9A84C] text-[#1C1C1C] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Mais Escolhido
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#C9A84C] font-semibold">Kit Intermediário</span>
                <h3 className="font-serif-luxury text-2xl font-bold text-white mt-1">Kit Empreendedora Prata</h3>
                <p className="text-xs text-gray-300 mt-2">
                  Mix completo e equilibrado para iniciar suas vendas com variedade atraente e maleta de luxo.
                </p>

                <div className="mt-6 pb-6 border-b border-[#444]">
                  <span className="text-xs text-gray-400 block">Investimento no Atacado:</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-serif-luxury font-bold text-[#C9A84C]">R$ 999,00</span>
                    <span className="text-xs text-gray-400">ou 10x de R$ 99,90</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium block mt-1">
                    Retorno estimado: R$ 2.400,00 (Lucro ~R$ 1.401,00)
                  </span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-gray-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> 24 Semijoias (anéis, colares, brincos e pulseiras)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> 1 Maleta Executiva de veludo com chave
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> 30 Sacolas de presente exclusivas Citrino
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> Troca garantida de até 20% das peças
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleAddKitToCart('Kit Empreendedora Prata Citrino (24 Peças + Maleta)', 999, 24)}
                className="mt-8 w-full bg-[#C9A84C] hover:bg-[#b5943b] text-[#1C1C1C] py-3.5 rounded text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                Comprar Kit Empreendedora
              </button>
            </div>

            {/* Kit Showroom Ouro */}
            <div className="bg-[#242424] rounded-2xl border border-[#383838] p-7 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Kit Avançado</span>
                <h3 className="font-serif-luxury text-2xl font-bold text-white mt-1">Kit Showroom Ouro</h3>
                <p className="text-xs text-gray-400 mt-2">
                  Para quem deseja montar um showroom residencial ou atendimento vip com grande acervo.
                </p>

                <div className="mt-6 pb-6 border-b border-[#383838]">
                  <span className="text-xs text-gray-400 block">Investimento no Atacado:</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-serif-luxury font-bold text-[#C9A84C]">R$ 1.890,00</span>
                    <span className="text-xs text-gray-400">ou 10x de R$ 189,00</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium block mt-1">
                    Retorno estimado: R$ 4.800,00 (Lucro ~R$ 2.910,00)
                  </span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> 48 Semijoias premium incluindo pedras nobres
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> Maleta grande luxo + mostrador de anéis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> 50 Embalagens e flanelas mágicas de limpeza
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> Consultoria individual de vendas no WhatsApp
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleAddKitToCart('Kit Showroom Ouro Citrino (48 Peças + Mostradores)', 1890, 48)}
                className="mt-8 w-full bg-[#C9A84C] hover:bg-[#b5943b] text-[#1C1C1C] py-3 rounded text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Adicionar Kit à Sacola
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section id="cadastro" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-8 sm:p-12 shadow-sm">
          {formSubmitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#1C1C1C] font-semibold">
                Parabéns, {formData.name || 'Revendedora'}!
              </h3>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
                Seu pré-cadastro foi aprovado com sucesso. Sua conta foi habilitada com condição de <strong>35% de desconto de atacado</strong> em todo o catálogo da loja.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => onNavigate('catalog')}
                  className="bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] text-white px-6 py-3 rounded text-xs uppercase font-semibold tracking-wider transition cursor-pointer"
                >
                  Explorar Catálogo com Preços de Atacado
                </button>

                <a
                  href={`https://wa.me/55${companySettings.whatsapp.replace(/\D/g, '')}?text=Olá!%20Acabei%20de%20me%20cadastrar%20como%20revendedora%20Citrino%20(${formData.name})%20e%20quero%20falar%20com%20minha%20consultora.`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#25D366] text-white px-6 py-3 rounded text-xs uppercase font-semibold tracking-wider transition flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Conversar no WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold">
                  Faça Parte do Time
                </span>
                <h2 className="font-serif-luxury text-3xl font-medium text-[#1C1C1C] mt-1 mb-2">
                  Pré-Cadastro de Revendedora Citrino
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed font-light">
                  Preencha o formulário abaixo para ter acesso à tabela de atacado e receber o contato de uma especialista da nossa equipe. Não exigimos CNPJ.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Amanda Silveira"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5CFBF] rounded focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      WhatsApp com DDD *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(11) 98765-4321"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5CFBF] rounded focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      E-mail de Contato
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="amanda@email.com"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5CFBF] rounded focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      CPF ou CNPJ (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.document}
                      onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5CFBF] rounded focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Sua Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Ex: Campinas"
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5CFBF] rounded focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Estado (UF)
                    </label>
                    <select
                      value={formData.uf}
                      onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5CFBF] rounded focus:outline-none focus:border-[#C9A84C]"
                    >
                      {['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'GO', 'DF', 'BA', 'PE', 'CE', 'ES', 'MT', 'MS'].map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Você já vende semijoias ou cosméticos?
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5CFBF] rounded focus:outline-none focus:border-[#C9A84C]"
                    >
                      <option value="iniciante">Nunca vendi, quero começar do zero</option>
                      <option value="ja_vendo">Já revendo semijoias e quero trocar de marca</option>
                      <option value="loja_fisica">Tenho loja física ou salão de beleza</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Previsão de Investimento Inicial
                    </label>
                    <select
                      value={formData.investmentTier}
                      onChange={(e) => setFormData({ ...formData, investmentTier: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5CFBF] rounded focus:outline-none focus:border-[#C9A84C]"
                    >
                      <option value="500">De R$ 500 a R$ 1.000 (Kit Inicial)</option>
                      <option value="1000">De R$ 1.000 a R$ 2.000 (Kit Empreendedora)</option>
                      <option value="3000">Mais de R$ 2.500 (Showroom Completo)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-[#1C1C1C] hover:bg-[#C9A84C] hover:text-[#1C1C1C] text-white py-3.5 rounded text-xs uppercase font-semibold tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Meu Pré-Cadastro e Liberar Atacado
                  </button>
                  <p className="text-[11px] text-gray-500 text-center mt-2.5">
                    🔒 Seus dados estão 100% seguros. Não compartilhamos informações com terceiros.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials from Resellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#E8E4DC]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold">
            Histórias Reais
          </span>
          <h2 className="font-serif-luxury text-3xl font-medium text-[#1C1C1C] mt-1 mb-2">
            Quem Já Revende Citrino
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-[#E8E4DC] shadow-xs">
            <p className="text-xs text-gray-600 italic leading-relaxed">
              "Comecei com o Kit de R$ 999 no meu salão de beleza. Em duas semanas vendi todas as peças e faturei R$ 2.400. As clientes amam a durabilidade do banho e o brilho do citrino."
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
                alt="Luciana S."
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <strong className="text-xs font-semibold text-gray-900 block">Luciana Silveira</strong>
                <span className="text-[11px] text-[#C9A84C]">Campinas / SP • Renda Extra R$ 3.800/mês</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8E4DC] shadow-xs">
            <p className="text-xs text-gray-600 italic leading-relaxed">
              "O diferencial para mim foi o certificado de 1 ano e o mostruário de veludo. As clientes sentem confiança na hora da compra. Hoje já tenho revendedoras na minha equipe."
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
                alt="Renata M."
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <strong className="text-xs font-semibold text-gray-900 block">Renata Mesquita</strong>
                <span className="text-[11px] text-[#C9A84C]">Goiânia / GO • Showroom Próprio</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8E4DC] shadow-xs">
            <p className="text-xs text-gray-600 italic leading-relaxed">
              "Fiquei com medo de comprar semijoia pela internet, mas o atendimento no WhatsApp foi impecável. As peças são ainda mais lindas pessoalmente do que nas fotos."
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120"
                alt="Carolina B."
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <strong className="text-xs font-semibold text-gray-900 block">Carolina Barbosa</strong>
                <span className="text-[11px] text-[#C9A84C]">Belo Horizonte / MG • Revendedora Ativa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C9A84C] font-semibold">
            Dúvidas Frequentes
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-medium text-[#1C1C1C] mt-1">
            Perguntas Comuns sobre a Revenda
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Preciso ter CNPJ para ser revendedora?',
              a: 'Não! Você pode iniciar seu cadastro tanto como Pessoa Física (CPF) quanto como Pessoa Jurídica (CNPJ ou MEI). As condições de desconto e garantia são idênticas.',
            },
            {
              q: 'Qual é o pedido mínimo para compras de atacado?',
              a: 'Nosso pedido mínimo para ativar a tabela de revenda com 35% de desconto é de apenas R$ 499,00 (que equivale a aproximadamente 10 a 12 peças). Acima de R$ 1.000 o desconto sobe para 40% e o frete é gratuito.',
            },
            {
              q: 'Como funciona a garantia de 1 ano para minhas clientes?',
              a: 'Todas as peças acompanham certificados impressos timbrados. Se alguma cliente tiver qualquer questão com o banho ou cravação em até 1 ano, nós fazemos a reposição da peça para você sem burocracia.',
            },
            {
              q: 'Posso parcelar meu pedido de revenda?',
              a: 'Sim! Parcelamos em até 10x sem juros em todos os cartões de crédito, ou você ganha 5% de desconto adicional para pagamento à vista via PIX.',
            },
            {
              q: 'Como funciona a troca de peças que não venderem?',
              a: 'No seu primeiro pedido, garantimos a troca de até 20% do valor total das peças que você não conseguir girar nos primeiros 30 dias. Assim, você não corre risco de ficar com estoque parado.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-[#E8E4DC] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-900 hover:bg-[#FAF8F4] transition cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                    openFaq === idx ? 'rotate-180 text-[#C9A84C]' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
