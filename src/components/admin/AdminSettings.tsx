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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

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
  const [ship, setShip] = useState({
    pacPrice: companySettings.shippingPacPrice, pacDays: companySettings.shippingPacDays,
    sedexPrice: companySettings.shippingSedexPrice, sedexDays: companySettings.shippingSedexDays, sedexOn: companySettings.shippingSedexOn !== false,
    jadlogPrice: companySettings.shippingJadlogPrice, jadlogDays: companySettings.shippingJadlogDays, jadlogOn: companySettings.shippingJadlogOn !== false,
  });
  const setShipField = (k: keyof typeof ship, v: number | boolean) => setShip((prev) => ({ ...prev, [k]: v }));
  const [instagram, setInstagram] = useState(companySettings.instagram);

  // Payment credentials

  // Team users state
  const [teamMembers, setTeamMembers] = useState([
    { id: 'u1', name: 'Juliana Camargo', email: 'admin@citrinosemijoias.com.br', role: 'Administrador Geral', active: true },
    { id: 'u2', name: 'Mariana Duarte', email: 'vendas@citrinosemijoias.com.br', role: 'Vendedora / Consultora B2B', active: true },
    { id: 'u3', name: 'Carlos Eduardo', email: 'expedicao@citrinosemijoias.com.br', role: 'Estoquista / Expedição', active: true },
  ]);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaving(true);
    try {
      const res = await updateCompanySettings({
        name,
        cnpj,
        stateRegistration: ie,
        email,
        phone,
        whatsapp,
        address,
        city,
        state,
        instagram,
        freeShippingThreshold: Math.max(0, Number(freeShipping) || 0),
        shippingPacPrice: Math.max(0, Number(ship.pacPrice) || 0),
        shippingPacDays: Math.max(1, Math.round(Number(ship.pacDays) || 1)),
        shippingSedexPrice: Math.max(0, Number(ship.sedexPrice) || 0),
        shippingSedexDays: Math.max(1, Math.round(Number(ship.sedexDays) || 1)),
        shippingSedexOn: ship.sedexOn,
        shippingJadlogPrice: Math.max(0, Number(ship.jadlogPrice) || 0),
        shippingJadlogDays: Math.max(1, Math.round(Number(ship.jadlogDays) || 1)),
        shippingJadlogOn: ship.jadlogOn,
      });
      if (res.ok === true) {
        setFeedback(true);
        setTimeout(() => setFeedback(false), 3000);
      } else {
        setSaveError((res as { error: string }).error);
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Não foi possível salvar agora.');
    } finally {
      setSaving(false);
    }
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
          <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {saveError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-semibold border border-red-200">
          {saveError}
        </div>
      )}

      {feedback && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2 text-xs font-semibold border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Dados da empresa salvos! Já aparecem no rodapé e na página de contato da loja.
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
          Pagamento (InfinitePay)
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

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Instagram (ex.: @citrinosemijoias)</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
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
              Frete do site
            </h3>
            <p className="text-gray-500">
              Esses valores aparecem no checkout e são os mesmos que o servidor cobra. Depois de mudar, clique em <strong>Salvar Alterações</strong> (no topo).
            </p>
          </div>

          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-200 space-y-3">
            <label className="font-bold text-gray-800 uppercase tracking-wider text-[11px] block">Frete grátis (PAC) a partir de (R$)</label>
            <div className="flex flex-wrap items-center gap-3">
              <input type="number" min={0} step="0.01" value={freeShipping} onChange={(e) => setFreeShipping(Number(e.target.value))}
                className="w-40 bg-white border border-gray-300 rounded p-2.5 font-bold text-sm focus:border-[#E97527] focus:outline-none" />
              <span className="text-gray-500">
                {Number(freeShipping) > 0 ? `Compras a partir de R$ ${Number(freeShipping).toFixed(2)} ganham PAC grátis.` : 'Com 0, não existe frete grátis.'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">Formas de envio</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-[11px] text-gray-500 uppercase">
                  <tr><th className="text-left p-2">Envio</th><th className="text-left p-2">Ativo</th><th className="text-left p-2">Preço (R$)</th><th className="text-left p-2">Prazo (dias úteis)</th></tr>
                </thead>
                <tbody className="divide-y">
                  {([
                    ['Correios PAC', null, 'pacPrice', 'pacDays'],
                    ['Correios SEDEX', 'sedexOn', 'sedexPrice', 'sedexDays'],
                    ['Jadlog', 'jadlogOn', 'jadlogPrice', 'jadlogDays'],
                  ] as const).map(([label, onKey, priceKey, daysKey]) => (
                    <tr key={label}>
                      <td className="p-2 font-semibold text-gray-800">{label}</td>
                      <td className="p-2">
                        {onKey ? (
                          <input type="checkbox" checked={Boolean(ship[onKey])} onChange={(e) => setShipField(onKey, e.target.checked)} className="w-4 h-4 accent-[#E97527]" />
                        ) : (
                          <span className="text-gray-400">sempre</span>
                        )}
                      </td>
                      <td className="p-2">
                        <input type="number" min={0} max={500} step="0.01" value={Number(ship[priceKey])} onChange={(e) => setShipField(priceKey, Number(e.target.value))}
                          className="w-28 border border-gray-300 rounded p-2 focus:border-[#E97527] focus:outline-none" />
                      </td>
                      <td className="p-2">
                        <input type="number" min={1} max={60} step="1" value={Number(ship[daysKey])} onChange={(e) => setShipField(daysKey, Number(e.target.value))}
                          className="w-20 border border-gray-300 rounded p-2 focus:border-[#E97527] focus:outline-none" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-400">Preço máximo R$ 500 e prazo máximo 60 dias. Valores fora disso voltam ao padrão.</p>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENTS (InfinitePay) */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-5 shadow-xs max-w-3xl text-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#E97527]" />
              Pagamento pela InfinitePay
            </h3>
            <p className="text-gray-500">O cliente paga por PIX ou cartão na página oficial da InfinitePay. O dinheiro cai direto na sua conta.</p>
          </div>
          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-gray-200 space-y-1">
            <p className="text-gray-500">Conta que recebe</p>
            <p className="text-sm font-bold text-gray-900">$maria-daniel-4xs</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-gray-800">Para o site conseguir cobrar, o Checkout Integrado precisa estar ativado:</p>
            <ol className="list-decimal pl-5 space-y-1 text-gray-600">
              <li>Entre em <a href="https://app.infinitepay.io" target="_blank" rel="noopener noreferrer" className="text-[#E97527] underline">app.infinitepay.io</a> com o login do app.</li>
              <li>Abra <strong>Checkout externo</strong> (ou Checkout Integrado / Link Integrado).</li>
              <li>Em <strong>Configurações</strong>, deixe <strong>ativado</strong> e salve.</li>
            </ol>
          </div>
          <p className="flex items-start gap-2 text-gray-500"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> Nenhuma senha ou chave da InfinitePay fica guardada no site. O pagamento só é marcado como pago depois que o sistema confere direto com a InfinitePay.</p>
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
