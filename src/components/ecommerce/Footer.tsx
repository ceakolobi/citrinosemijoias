import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  QrCode, 
  Instagram, 
  Phone, 
  Mail, 
  MapPin,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';

interface FooterProps {
  onNavigate: (view: string, extra?: any) => void;
  onSwitchToAdmin: () => void;
}

export const EcommerceFooter: React.FC<FooterProps> = ({ onNavigate, onSwitchToAdmin }) => {
  const { companySettings } = useCitrinoStore();

  return (
    <footer className="bg-[#161616] text-[#FAF8F4] border-t border-[#2A2A2A] pt-16 pb-12">
      {/* Guarantees Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 border-b border-[#2A2A2A]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#242424] rounded-full text-[#C9A84C]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-luxury text-lg text-white font-medium">Banho Nobre 10 Milésimos</h4>
              <p className="text-xs text-[#9E9B97] mt-1 leading-relaxed">
                Tripla camada de ouro 18k e verniz Diamond para brilho espelhado e durabilidade máxima.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#242424] rounded-full text-[#C9A84C]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-luxury text-lg text-white font-medium">1 Ano de Garantia</h4>
              <p className="text-xs text-[#9E9B97] mt-1 leading-relaxed">
                Certificado oficial acompanha todas as peças com garantia no banho e cravação.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#242424] rounded-full text-[#C9A84C]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-luxury text-lg text-white font-medium">Envio Seguro para o Brasil</h4>
              <p className="text-xs text-[#9E9B97] mt-1 leading-relaxed">
                Frete grátis para compras acima de R$ 299 com seguro postal incluso e rastreamento.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#242424] rounded-full text-[#C9A84C]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-luxury text-lg text-white font-medium">Primeira Troca Grátis</h4>
              <p className="text-xs text-[#9E9B97] mt-1 leading-relaxed">
                Até 7 dias após o recebimento para troca fácil ou devolução sem complicações.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info with Official Logo */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/citrino-icon.jpg"
                alt="Logo Citrino Semijoias"
                className="w-12 h-12 object-cover rounded-full border border-[#C9A84C]/50 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="font-serif-luxury text-2xl tracking-[0.2em] text-[#C9A84C] font-semibold leading-none">
                  CITRINO
                </h3>
                <p className="text-[9px] tracking-[0.35em] text-[#FAF8F4]/80 uppercase mt-1 font-semibold">
                  SEMIJOIAS FINAS
                </p>
              </div>
            </div>
            <p className="text-xs text-[#A8A49E] leading-relaxed max-w-sm">
              Criamos semijoias atemporais inspiradas na alta joalheria mundial. Cada detalhe é concebido para exaltar a elegância feminina com qualidade premium e acabamento artesanal em Limeira/SP.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-[#A8A49E]">
              <span className="flex items-center gap-1.5 bg-[#222] px-3 py-1.5 rounded-full border border-[#333]">
                <Lock className="w-3.5 h-3.5 text-[#C9A84C]" /> Compra 100% Segura
              </span>
              <span className="bg-[#222] px-3 py-1.5 rounded-full border border-[#333]">
                100% Hipoalergênico
              </span>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FAF8F4] mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A8A49E]">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-[#C9A84C] transition">
                  Página Inicial
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-[#C9A84C] transition">
                  Coleção Completa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('aneis')} className="hover:text-[#C9A84C] transition">
                  Anéis & Solitários
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('colares')} className="hover:text-[#C9A84C] transition">
                  Colares Riviera & Chokers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('revendedora')} className="text-[#E8705A] hover:underline transition font-semibold">
                  Seja Revendedora (Atacado B2B)
                </button>
              </li>
            </ul>
          </div>

          {/* Ajuda & Institucional */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FAF8F4] mb-4">
              Ajuda & Suporte
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A8A49E]">
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-[#C9A84C] transition">
                  Rastrear Pedido
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#C9A84C] transition">
                  Sobre Nós & Ateliê
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about', { section: 'garantia' })} className="hover:text-[#C9A84C] transition">
                  Termo de Garantia 1 Ano
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about', { section: 'cuidados' })} className="hover:text-[#C9A84C] transition">
                  Cuidados com a Semijoia
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-[#C9A84C] transition">
                  Minha Conta de Cliente
                </button>
              </li>
            </ul>
          </div>

          {/* Atendimento & Back-office */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FAF8F4] mb-4">
              Atendimento VIP
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A8A49E]">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>{companySettings.whatsapp}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>{companySettings.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 mt-0.5" />
                <span>{companySettings.address}, {companySettings.city} - {companySettings.state}</span>
              </li>
              <li className="pt-2">
                <a 
                  href={`https://instagram.com/${companySettings.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-white hover:text-[#C9A84C] transition text-xs"
                >
                  <Instagram className="w-4 h-4" /> {companySettings.instagram}
                </a>
              </li>
            </ul>

            {/* Direct Link to Citrino ERP */}
            <div className="mt-6 pt-4 border-t border-[#2A2A2A]">
              <button
                onClick={onSwitchToAdmin}
                className="w-full flex items-center justify-between bg-[#1d1f24] hover:bg-[#25282e] border-l-4 border-[#e97527] px-3 py-2 rounded text-xs text-white transition font-medium cursor-pointer"
              >
                <span>Acesso Painel Gestão Citrino</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#e97527]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Badges & Legal Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#2A2A2A]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#7A7772]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[#A8A49E]">Formas de Pagamento:</span>
            <span className="flex items-center gap-1 bg-[#222] px-2.5 py-1 rounded text-white text-[11px]">
              <QrCode className="w-3.5 h-3.5 text-emerald-400" /> PIX (5% OFF)
            </span>
            <span className="flex items-center gap-1 bg-[#222] px-2.5 py-1 rounded text-white text-[11px]">
              <CreditCard className="w-3.5 h-3.5 text-sky-400" /> Cartão até 10x
            </span>
            <span className="bg-[#222] px-2.5 py-1 rounded text-white text-[11px]">
              Mercado Pago Integrado
            </span>
          </div>

          <div className="text-center md:text-right text-[11px] text-[#666]">
            &copy; {new Date().getFullYear()} {companySettings.name}. CNPJ: {companySettings.cnpj}. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};
