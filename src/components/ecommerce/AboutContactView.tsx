import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  Instagram, 
  HelpCircle,
  Gem
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';

interface AboutContactViewProps {
  initialSection?: string;
  onNavigateCatalog: () => void;
}

export const AboutContactView: React.FC<AboutContactViewProps> = ({
  initialSection = 'about',
  onNavigateCatalog,
}) => {
  const { companySettings } = useCitrinoStore();
  const [sentMessage, setSentMessage] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Dúvidas sobre Pedido',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSentMessage(true);
    setTimeout(() => setSentMessage(false), 5000);
    setFormData({ name: '', email: '', phone: '', subject: 'Dúvidas sobre Pedido', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Brand Origin Story */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A84C]">
            Sobre a Citrino Semijoias
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-luxury text-[#1C1C1C] leading-tight">
            Nascida da Paixão pelo Ouro e pela Joalheria Fina
          </h1>
          <p className="text-xs sm:text-sm text-[#555] leading-relaxed">
            A <strong>Citrino Semijoias</strong> nasceu com o propósito de democratizar o luxo e a sofisticação da alta joalheria. Inspirada no brilho solar do citrino — pedra que simboliza prosperidade, energia e elegância atemporal —, nossa marca desenvolve coleções contemporâneas com padrão joalheiro de acabamento.
          </p>
          <p className="text-xs sm:text-sm text-[#555] leading-relaxed">
            Produzidas no renomado polo de Limeira (São Paulo), nossas peças recebem até 10 milésimos de ouro 18k, camada de ródio nobre e selamento com verniz nanotecnológico Diamond. O resultado são semijoias com o mesmo peso visual, brilho e textura do ouro maciço, 100% livres de níquel e hipoalergênicas.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={onNavigateCatalog}
              className="bg-[#C9A84C] hover:bg-[#B5943B] text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-lg transition"
            >
              Conhecer Nossas Joias
            </button>
            <a
              href={`https://wa.me/5511987654321?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20as%20pe%C3%A7as%20da%20Citrino.`}
              target="_blank"
              rel="noreferrer"
              className="border border-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white text-[#1C1C1C] text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-lg transition flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" /> Falar no WhatsApp
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-2 gap-4 items-center">
          <div className="bg-[#FAF8F4] border border-[#E8E4DC] rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-md">
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-white p-2 border border-[#E8E4DC] shadow-inner mb-3">
              <img
                src="/citrino-logo.jpg"
                alt="Brasão Citrino Semijoias"
                className="w-full h-full object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[10px] tracking-[0.2em] font-bold text-[#C9A84C] uppercase">
              Marca Registrada
            </span>
            <span className="text-xs font-serif-luxury text-[#1C1C1C] font-semibold mt-0.5">
              Citrino Semijoias Finas
            </span>
          </div>
          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"
            alt="Colares Riviera Citrino"
            className="w-full h-72 sm:h-80 object-cover rounded-xl shadow-md"
          />
        </div>
      </section>

      {/* Quality Pillars */}
      <section className="bg-white rounded-2xl border border-[#E8E4DC] p-8 sm:p-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
            O Padrão Citrino
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury text-[#1C1C1C] mt-1">
            4 Pilares de Excelência
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-[#FAF8F4] rounded-xl space-y-2 border border-[#E8E4DC]">
            <div className="w-10 h-10 rounded-full bg-[#1C1C1C] text-[#C9A84C] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif-luxury text-base font-semibold text-[#1C1C1C]">Banho 10 Milésimos</h3>
            <p className="text-xs text-[#666] leading-relaxed">
              Ouro 18k legítimo aplicado em múltiplas camadas térmicas para resistência real ao uso cotidiano.
            </p>
          </div>

          <div className="p-5 bg-[#FAF8F4] rounded-xl space-y-2 border border-[#E8E4DC]">
            <div className="w-10 h-10 rounded-full bg-[#1C1C1C] text-[#C9A84C] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif-luxury text-base font-semibold text-[#1C1C1C]">100% Antialérgico</h3>
            <p className="text-xs text-[#666] leading-relaxed">
              Processo produtivo sem adição de níquel ou cádmio, testado para peles extremamente sensíveis.
            </p>
          </div>

          <div className="p-5 bg-[#FAF8F4] rounded-xl space-y-2 border border-[#E8E4DC]">
            <div className="w-10 h-10 rounded-full bg-[#1C1C1C] text-[#C9A84C] flex items-center justify-center">
              <Gem className="w-5 h-5" />
            </div>
            <h3 className="font-serif-luxury text-base font-semibold text-[#1C1C1C]">Pedrarias 5A</h3>
            <p className="text-xs text-[#666] leading-relaxed">
              Zircônias cúbicas em lapidação brilhante e pedras fusion com transparência e refração de diamante.
            </p>
          </div>

          <div className="p-5 bg-[#FAF8F4] rounded-xl space-y-2 border border-[#E8E4DC]">
            <div className="w-10 h-10 rounded-full bg-[#1C1C1C] text-[#C9A84C] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-serif-luxury text-base font-semibold text-[#1C1C1C]">Garantia 1 Ano</h3>
            <p className="text-xs text-[#666] leading-relaxed">
              Certificado oficial assinado com cobertura total sobre o banho de ouro e assistência ágil.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
            Dúvidas Frequentes
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury text-[#1C1C1C]">
            Perguntas & Respostas
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'As semijoias da Citrino escurecem com o tempo?',
              a: 'Nossas semijoias contam com 10 milésimos de ouro 18k e banho protetor Diamond, o que impede a oxidação prematura. Seguindo as recomendações simples de cuidados (evitar perfumes diretos e produtos químicos), suas peças mantêm o brilho original por anos.',
            },
            {
              q: 'Qual é o prazo de envio e de entrega?',
              a: 'Após a aprovação do pagamento, seu pedido é cuidadosamente embalado no nosso estojo de veludo e postado em até 24 horas úteis. O prazo dos Correios varia de 2 a 5 dias úteis para a maior parte do Brasil.',
            },
            {
              q: 'Como funciona a garantia de 1 ano?',
              a: 'Todas as peças acompanham um certificado nominal. Caso ocorra desprendimento do banho ou defeito de fabricação no período de 12 meses, você tem direito ao rebanho gratuito ou substituição da semijoia.',
            },
            {
              q: 'Posso comprar no atacado para revenda?',
              a: 'Sim! Temos condições exclusivas para revendedoras com descontos de até 35%, faturamento facilitado para CNPJ e kit completo de mostruário e embalagens.',
            },
          ].map((item, idx) => (
            <details
              key={idx}
              className="group bg-white p-5 rounded-xl border border-[#E8E4DC] [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-sm font-semibold text-[#1C1C1C]">
                <span>{item.q}</span>
                <span className="shrink-0 transition duration-300 group-open:-rotate-180 text-[#C9A84C]">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-xs text-[#555] leading-relaxed border-t border-gray-100 pt-3">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact Form & Coordinates */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-8 sm:p-12 rounded-2xl border border-[#E8E4DC]">
        <div className="lg:col-span-5 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
            Fale Conosco
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury text-[#1C1C1C]">
            Atendimento Exclusivo
          </h2>
          <p className="text-xs text-[#666] leading-relaxed">
            Nossa equipe de consultoras está pronta para te atender de segunda a sexta, das 09h às 18h.
          </p>

          <div className="space-y-4 text-xs text-[#444]">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#C9A84C]" />
              <span>WhatsApp: <strong>{companySettings.whatsapp}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#C9A84C]" />
              <span>E-mail: <strong>{companySettings.email}</strong></span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
              <span>Showroom & Ateliê: {companySettings.address}, {companySettings.city} - {companySettings.state}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {sentMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2 text-xs font-semibold border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Mensagem enviada com sucesso! Nossa equipe responderá em até 2 horas.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#333]">Seu Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#333]">Seu E-mail *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#333]">WhatsApp / Telefone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#333]">Assunto</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:outline-none focus:border-[#C9A84C]"
                >
                  <option value="Dúvidas sobre Pedido">Dúvidas sobre Pedido</option>
                  <option value="Revenda e Atacado B2B">Revenda e Atacado B2B</option>
                  <option value="Acionar Garantia ou Troca">Acionar Garantia ou Troca</option>
                  <option value="Parcerias e Imprensa">Parcerias e Imprensa</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#333]">Sua Mensagem *</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Como podemos te ajudar hoje?"
                className="w-full bg-[#FAF8F4] border border-[#D5CFBF] rounded-lg p-2.5 focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <button
              type="submit"
              className="bg-[#1C1C1C] hover:bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Enviar Mensagem
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
