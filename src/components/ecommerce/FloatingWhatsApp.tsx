import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useCitrinoStore } from '../../services/store';

export const FloatingWhatsApp: React.FC = () => {
  const { companySettings } = useCitrinoStore();
  const phoneClean = companySettings.whatsapp.replace(/\D/g, '');

  return (
    <aside aria-label="Suporte WhatsApp" className="fixed bottom-6 right-6 z-40 flex items-center group">
      {/* Floating Tooltip bubble */}
      <div className="mr-3 hidden sm:flex items-center bg-white border border-[#E8E4DC] text-[#1C1C1C] px-3.5 py-2 rounded-full shadow-lg text-xs font-medium opacity-90 group-hover:opacity-100 transition animate-bounce">
        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 inline-block" />
        Dúvidas? Fale com a Consultora
      </div>

      {/* WhatsApp Action Button */}
      <a
        href={`https://wa.me/55${phoneClean}?text=Ol%C3%A1!%20Estou%20no%20site%20da%20Citrino%20Semijoias%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida.`}
        target="_blank"
        rel="noreferrer"
        className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none"
        aria-label="Atendimento via WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </aside>
  );
};
