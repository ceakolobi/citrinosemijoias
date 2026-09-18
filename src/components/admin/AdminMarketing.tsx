import React, { useState } from 'react';
import { 
  Megaphone, 
  Tag, 
  Send, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Mail, 
  MessageCircle,
  Image as ImageIcon,
  Calendar,
  X
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Coupon } from '../../types';

export const AdminMarketing: React.FC = () => {
  const { coupons, addCoupon, deleteCoupon, homeBanners, updateHomeBanners } = useCitrinoStore();

  const [activeTab, setActiveTab] = useState<'coupons' | 'campaigns' | 'banners'>('coupons');

  // Coupon state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(150);
  const [expiry, setExpiry] = useState<string>('2025-12-31');

  // Campaign simulator
  const [campaignType, setCampaignType] = useState<string>('carrinho');
  const [campaignChannel, setCampaignChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [sendingSimulation, setSendingSimulation] = useState<boolean>(false);
  const [campaignSuccess, setCampaignSuccess] = useState<string | null>(null);

  // Home Banners state
  const [bannersList, setBannersList] = useState(homeBanners);
  const [bannerSaveFeedback, setBannerSaveFeedback] = useState<boolean>(false);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    addCoupon({
      code: couponCode.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrder),
      expiryDate: expiry,
      active: true,
      usedCount: 0,
    });

    setIsCouponModalOpen(false);
    setCouponCode('');
  };

  const handleTriggerCampaign = () => {
    setSendingSimulation(true);
    setTimeout(() => {
      setSendingSimulation(false);
      setCampaignSuccess(
        `✓ Disparo de ${campaignChannel === 'whatsapp' ? 'WhatsApp' : 'E-mail'} concluído com sucesso para 142 clientes segmentados!`
      );
      setTimeout(() => setCampaignSuccess(null), 4000);
    }, 1200);
  };

  const handleSaveBanners = () => {
    updateHomeBanners(bannersList);
    setBannerSaveFeedback(true);
    setTimeout(() => setBannerSaveFeedback(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Marketing, Cupons & Campanhas
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Criação de cupons promocionais, réguas de relacionamento WhatsApp/E-mail e banners da loja.
          </p>
        </div>

        {activeTab === 'coupons' && (
          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="bg-[#E97527] hover:bg-[#D5651B] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Cupom</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 border-b-2 uppercase tracking-wider transition ${
            activeTab === 'coupons'
              ? 'border-[#E97527] text-[#E97527] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Cupons de Desconto
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3 border-b-2 uppercase tracking-wider transition ${
            activeTab === 'campaigns'
              ? 'border-[#E97527] text-[#E97527] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Disparos Automáticos (WhatsApp & E-mail)
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`pb-3 border-b-2 uppercase tracking-wider transition ${
            activeTab === 'banners'
              ? 'border-[#E97527] text-[#E97527] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Banners da Home
        </button>
      </div>

      {/* TAB 1: CUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Código do Cupom</th>
                  <th className="py-3 px-4">Desconto</th>
                  <th className="py-3 px-4">Pedido Mínimo</th>
                  <th className="py-3 px-4">Validade</th>
                  <th className="py-3 px-4 text-center">Usos</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-sm text-[#E97527] bg-orange-50 px-2.5 py-1 rounded border border-orange-200">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `R$ ${c.discountValue.toFixed(2)} OFF`}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {c.minOrderValue ? `R$ ${c.minOrderValue.toFixed(2)}` : 'Sem mínimo'}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {c.expiryDate}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-gray-800">
                      {c.usedCount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteCoupon(c.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded"
                        title="Excluir cupom"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DISPAROS AUTOMÁTICOS */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">
              Automação de Mensagens & Recuperação de Vendas
            </h3>
            <p className="text-xs text-gray-500">
              Disparo em massa ou gatilhos automáticos de eventos para clientes e revendedoras.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Canal de Envio:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCampaignChannel('whatsapp')}
                  className={`flex-1 py-2 rounded-lg font-bold border flex items-center justify-center gap-1.5 transition ${
                    campaignChannel === 'whatsapp'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setCampaignChannel('email')}
                  className={`flex-1 py-2 rounded-lg font-bold border flex items-center justify-center gap-1.5 transition ${
                    campaignChannel === 'email'
                      ? 'border-sky-600 bg-sky-50 text-sky-800'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <Mail className="w-4 h-4 text-sky-600" /> E-mail (Resend)
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Modelo de Mensagem (Template):</label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-gray-200 rounded-lg p-2 focus:border-[#E97527] focus:outline-none"
              >
                <option value="carrinho">Recuperação de Carrinho Abandonado (10% OFF)</option>
                <option value="rastreio">Aviso de Pedido Despachado com Link de Rastreio</option>
                <option value="aniversario">Aniversariante do Mês (Mimo Exclusivo)</option>
                <option value="b2b">Lançamento de Nova Coleção para Revendedoras B2B</option>
              </select>
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-200 space-y-2 text-xs">
            <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px] block">
              Pré-visualização da Mensagem Enviada:
            </span>
            <div className="bg-white p-3 rounded-lg border border-gray-200 font-sans text-gray-800 leading-relaxed">
              {campaignType === 'carrinho' && (
                <p>
                  "Olá, [Nome do Cliente]! 💎 Notamos que você deixou suas semijoias favoritas na sacola da <strong>Citrino Semijoias</strong>. Para garantir suas peças com frete expresso e 10% de desconto especial, utilize o cupom <strong>VOLTA10</strong> no checkout: [Link da Sacola]"
                </p>
              )}
              {campaignType === 'rastreio' && (
                <p>
                  "Boas notícias, [Nome]! ✨ Seu pedido [#CIT-8201] acabou de ser cuidadosamente embalado em veludo e despachado nos Correios. Acompanhe o rastreamento em tempo real pelo código [QB123456789BR]: [Link de Rastreio]"
                </p>
              )}
              {campaignType === 'aniversario' && (
                <p>
                  "Parabéns pelo seu dia, [Nome]! 🥂 A Citrino preparou um presente especial: R$ 50 de crédito para você escolher sua próxima joia em ouro 18k neste mês. Use o código [ANIVERSARIO50]."
                </p>
              )}
              {campaignType === 'b2b' && (
                <p>
                  "Prezada revendedora! 🌟 A nova Coleção Royal Citrino já está liberada no nosso catálogo B2B com 35% de desconto e condições em até 6x para faturamento no CNPJ. Acesse agora antes do esgotamento."
                </p>
              )}
            </div>
          </div>

          {campaignSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2 text-xs font-semibold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {campaignSuccess}
            </div>
          )}

          <button
            onClick={handleTriggerCampaign}
            disabled={sendingSimulation}
            className="bg-[#E97527] hover:bg-[#D5651B] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{sendingSimulation ? 'Disparando Mensagens...' : 'Simular Disparo da Campanha Agora'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: BANNERS DA HOME */}
      {activeTab === 'banners' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-xs max-w-3xl">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">
              Gestão dos Banners Rotativos da Home
            </h3>
            <p className="text-xs text-gray-500">
              Edite títulos, fotos e chamadas para ação que aparecem no topo da loja virtual.
            </p>
          </div>

          <div className="space-y-6">
            {bannersList.map((banner, idx) => (
              <div key={banner.id} className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 uppercase text-[11px]">
                    Banner #{idx + 1}
                  </span>
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-16 h-10 rounded object-cover border"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">Subtítulo / Eyebrow</label>
                    <input
                      type="text"
                      value={banner.subtitle}
                      onChange={(e) => {
                        const copy = [...bannersList];
                        copy[idx].subtitle = e.target.value;
                        setBannersList(copy);
                      }}
                      className="w-full bg-white border border-gray-300 rounded p-2 focus:outline-none focus:border-[#E97527]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">Título Principal</label>
                    <input
                      type="text"
                      value={banner.title}
                      onChange={(e) => {
                        const copy = [...bannersList];
                        copy[idx].title = e.target.value;
                        setBannersList(copy);
                      }}
                      className="w-full bg-white border border-gray-300 rounded p-2 focus:outline-none focus:border-[#E97527]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-gray-700">URL da Imagem de Fundo</label>
                    <input
                      type="text"
                      value={banner.image}
                      onChange={(e) => {
                        const copy = [...bannersList];
                        copy[idx].image = e.target.value;
                        setBannersList(copy);
                      }}
                      className="w-full bg-white border border-gray-300 rounded p-2 focus:outline-none focus:border-[#E97527]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {bannerSaveFeedback && (
            <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              ✓ Banners da Home salvos com sucesso e atualizados na loja virtual!
            </p>
          )}

          <div className="pt-2">
            <button
              onClick={handleSaveBanners}
              className="bg-[#E97527] hover:bg-[#D5651B] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg transition"
            >
              Salvar Alterações nos Banners
            </button>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-gray-900">Cadastrar Cupom de Desconto</h3>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Código do Cupom (Letras maiúsculas) *</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Ex: OURO15"
                  className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 uppercase font-mono font-bold focus:border-[#E97527] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Tipo de Desconto</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:border-[#E97527] focus:outline-none"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Valor do Desconto *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:border-[#E97527] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Pedido Mínimo (R$)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:border-[#E97527] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Data de Expiração</label>
                  <input
                    type="date"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:border-[#E97527] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E97527] hover:bg-[#D5651B] text-white font-bold rounded"
                >
                  Salvar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
