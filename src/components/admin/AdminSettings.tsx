import React, { useState } from 'react';
import { 
  Building2, 
  Truck, 
  CreditCard, 
  Mail, 
  Users, 
  ShieldCheck, 
  Key, 
  Save, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';

export const AdminSettings: React.FC = () => {
  const { companySettings, updateCompanySettings } = useCitrinoStore();

  const [activeTab, setActiveTab] = useState<'company' | 'shipping' | 'payments' | 'team'>('company');
  const [feedback, setFeedback] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState(companySettings.name);
  const [cnpj, setCnpj] = useState(companySettings.cnpj);
  const [ie, setIe] = useState(companySettings.stateRegistration);
  const [email, setEmail] = useState(companySettings.email);
  const [phone, setPhone] = useState(companySettings.phone);
  const [whatsapp, setWhatsapp] = useState(companySettings.whatsapp);
  const [address, setAddress] = useState(companySettings.address);
  const [city, setCity] = useState(companySettings.city);
  const [state, setState] = useState(companySettings.state);
  const [freeShipping, setFreeShipping] = useState(companySettings.freeShippingThreshold);

  // Payment credentials
  const [mpPublicKey, setMpPublicKey] = useState('APP_USR-78291029-4820-41a2-b912-892182910283');
  const [mpAccessToken, setMpAccessToken] = useState('APP_USR-••••••••••••••••••••••••••••••••');
  const [resendApiKey, setResendApiKey] = useState('re_92a8B10293_••••••••••••');

  // Team users state
  const [teamMembers, setTeamMembers] = useState([
    { id: 'u1', name: 'Juliana Camargo', email: 'admin@citrinosemijoias.com.br', role: 'Administrador Geral', active: true },
    { id: 'u2', name: 'Mariana Duarte', email: 'vendas@citrinosemijoias.com.br', role: 'Vendedora / Consultora B2B', active: true },
    { id: 'u3', name: 'Carlos Eduardo', email: 'expedicao@citrinosemijoias.com.br', role: 'Estoquista / Expedição', active: true },
  ]);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings({
      name,
      cnpj,
      stateRegistration: ie,
      email,
      phone,
      whatsapp,
      address,
      city,
      state,
      freeShippingThreshold: Number(freeShipping),
    });
    setFeedback(true);
    setTimeout(() => setFeedback(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Configurações do Sistema Citrino
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Dados fiscais da joalheria em Limeira, integrações de API e permissões de acesso ao sistema Citrino.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="bg-[#E97527] hover:bg-[#D5651B] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2 text-xs font-semibold border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Configurações da empresa atualizadas e persistidas com sucesso!
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('company')}
          className={`pb-3 border-b-2 uppercase tracking-wider transition ${
            activeTab === 'company'
              ? 'border-[#E97527] text-[#E97527] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Dados da Empresa (Limeira-SP)
        </button>
        <button
          onClick={() => setActiveTab('shipping')}
          className={`pb-3 border-b-2 uppercase tracking-wider transition ${
            activeTab === 'shipping'
              ? 'border-[#E97527] text-[#E97527] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Regras de Frete & Correios
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 border-b-2 uppercase tracking-wider transition ${
            activeTab === 'payments'
              ? 'border-[#E97527] text-[#E97527] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Integrações (Mercado Pago & Resend)
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`pb-3 border-b-2 uppercase tracking-wider transition ${
            activeTab === 'team'
              ? 'border-[#E97527] text-[#E97527] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Equipe & Perfis de Acesso
        </button>
      </div>

      {/* TAB 1: COMPANY INFO */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl text-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#E97527]" />
              Identificação Fiscal & Endereço do Showroom
            </h3>
            <p className="text-gray-500">
              Estes dados são exibidos no rodapé do e-commerce, nas notas fiscais e nas etiquetas de envio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-gray-700">Razão Social *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2.5 focus:border-[#E97527] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">CNPJ *</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2.5 font-mono focus:border-[#E97527] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Inscrição Estadual (IE)</label>
              <input
                type="text"
                value={ie}
                onChange={(e) => setIe(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2.5 font-mono focus:border-[#E97527] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">E-mail Principal</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2.5 focus:border-[#E97527] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">WhatsApp Oficial de Vendas</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2.5 focus:border-[#E97527] focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-gray-700">Endereço (Rua e Número)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2.5 focus:border-[#E97527] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Cidade (Polo Joalheiro)</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2.5 focus:border-[#E97527] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Estado (UF)</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2.5 focus:border-[#E97527] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SHIPPING RULES */}
      {activeTab === 'shipping' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl text-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#E97527]" />
              Políticas de Frete & Despacho
            </h3>
            <p className="text-gray-500">
              Configure o valor mínimo para Frete Grátis e métodos de transporte padrão.
            </p>
          </div>

          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-200 space-y-3">
            <label className="font-bold text-gray-800 uppercase tracking-wider text-[11px] block">
              Gatilho de Frete Grátis na Sacola (R$)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={freeShipping}
                onChange={(e) => setFreeShipping(Number(e.target.value))}
                className="w-48 bg-white border border-gray-300 rounded p-2.5 font-bold text-sm focus:border-[#E97527] focus:outline-none"
              />
              <span className="text-gray-500">
                Pedidos com valor superior a R$ {freeShipping} recebem frete PAC sem custo para o cliente.
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
              Transportadoras Ativas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <strong className="block text-gray-900">Correios (PAC & SEDEX)</strong>
                  <span className="text-[11px] text-gray-400">Contrato Sigep Web Ativo</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>

              <div className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <strong className="block text-gray-900">Jadlog Express</strong>
                  <span className="text-[11px] text-gray-400">Integração Melhor Envio</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENTS INTEGRATION */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl text-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#E97527]" />
              Credenciais da API Mercado Pago (Brasil)
            </h3>
            <p className="text-gray-500">
              Configurações para processamento seguro de PIX com QR code dinâmico e Cartão de Crédito.
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Atenção à Segurança:</strong> As chaves de produção ficam protegidas no backend via variáveis de ambiente e Edge Functions do Supabase.
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Public Key (Mercado Pago):</label>
              <input
                type="text"
                value={mpPublicKey}
                onChange={(e) => setMpPublicKey(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2.5 font-mono text-gray-700 focus:outline-none focus:border-[#E97527]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Access Token (Produção):</label>
              <input
                type="password"
                value={mpAccessToken}
                onChange={(e) => setMpAccessToken(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2.5 font-mono text-gray-700 focus:outline-none focus:border-[#E97527]"
              />
            </div>

            <div className="space-y-1 pt-2 border-t border-gray-100">
              <label className="font-semibold text-gray-700">Resend API Key (Notificações de E-mail):</label>
              <input
                type="password"
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2.5 font-mono text-gray-700 focus:outline-none focus:border-[#E97527]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEAM USERS */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl text-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E97527]" />
              Usuários do Painel Citrino & Níveis de Acesso
            </h3>
            <p className="text-gray-500">
              Perfis de Administrador, Vendedor e Operador de Expedição.
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                  <span className="text-gray-500">{member.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-orange-50 text-[#E97527] font-bold px-2.5 py-1 rounded-full text-[10px] uppercase">
                    {member.role}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Ativo" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
