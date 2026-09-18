import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Plus, 
  Building2, 
  User, 
  Star, 
  ShoppingBag, 
  DollarSign, 
  X,
  MessageCircle,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';
import { Customer } from '../../types';

export const AdminCustomers: React.FC = () => {
  const { customers, orders, addCustomer } = useCitrinoStore();

  const [search, setSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');

  // Customer Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New Customer Modal
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [formType, setFormType] = useState<'PF' | 'PJ'>('PF');
  const [formName, setFormName] = useState<string>('');
  const [formFantasy, setFormFantasy] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formDoc, setFormDoc] = useState<string>('');
  const [formTag, setFormTag] = useState<'varejo' | 'atacado' | 'vip'>('varejo');
  const [formCep, setFormCep] = useState<string>('01426-000');
  const [formLogradouro, setFormLogradouro] = useState<string>('Rua Oscar Freire');
  const [formNumero, setFormNumero] = useState<string>('100');
  const [formBairro, setFormBairro] = useState<string>('Jardins');
  const [formCidade, setFormCidade] = useState<string>('São Paulo');
  const [formUf, setFormUf] = useState<string>('SP');

  const filteredCustomers = customers.filter((c) => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterTag !== 'all' && c.customerTag !== filterTag) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.fantasyName && c.fantasyName.toLowerCase().includes(q)) ||
        c.document.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }
    return true;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer({
      type: formType,
      name: formName,
      fantasyName: formType === 'PJ' ? formFantasy : undefined,
      email: formEmail,
      phone: formPhone,
      document: formDoc,
      customerTag: formTag,
      totalSpent: 0,
      orderCount: 0,
      isB2BWholesale: formTag === 'atacado',
      b2bDiscountPct: formTag === 'atacado' ? 35 : 0,
      address: {
        cep: formCep,
        logradouro: formLogradouro,
        numero: formNumero,
        bairro: formBairro,
        cidade: formCidade,
        uf: formUf,
      },
    });

    setIsCreateOpen(false);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormDoc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Gestão de Clientes & Revendedoras B2B
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Base unificada de compradores varejo (PF), lojistas e revendedoras atacadistas (PJ).
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#E97527] hover:bg-[#D5651B] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Buscar por nome, razão social, CPF/CNPJ, WhatsApp ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F4F5F7] border border-gray-200 rounded-lg text-xs py-2 pl-9 pr-3 focus:outline-none focus:border-[#E97527]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#F4F5F7] border border-gray-200 text-xs rounded-lg px-3 py-2 text-gray-700 focus:outline-none"
          >
            <option value="all">Todos os Tipos (PF / PJ)</option>
            <option value="PF">Pessoa Física (PF)</option>
            <option value="PJ">Pessoa Jurídica (PJ)</option>
          </select>

          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="bg-[#F4F5F7] border border-gray-200 text-xs rounded-lg px-3 py-2 text-gray-700 focus:outline-none"
          >
            <option value="all">Todas as Tags</option>
            <option value="varejo">Varejo B2C</option>
            <option value="atacado">Atacado / Revenda B2B</option>
            <option value="vip">Cliente VIP</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Cliente / Razão Social</th>
                <th className="py-3 px-4">Documento (CPF/CNPJ)</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4">Segmentação / Tag</th>
                <th className="py-3 px-4 text-center">Pedidos / Total Gasto</th>
                <th className="py-3 px-4 text-center">Ticket Médio</th>
                <th className="py-3 px-4 text-right">Contato Rápido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((cust) => {
                const totalSpent = cust.totalSpent ?? 0;
                const orderCount = cust.orderCount ?? 0;
                const ticketMedio = orderCount > 0 ? totalSpent / orderCount : 0;
                const phoneClean = cust.phone.replace(/\D/g, '');

                return (
                  <tr key={cust.id} className="hover:bg-gray-50/80 transition">
                    {/* Name & Type */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          cust.type === 'PJ' ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {cust.type === 'PJ' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 block truncate max-w-[180px]">
                            {cust.fantasyName || cust.name}
                          </span>
                          <span className="text-[11px] text-gray-400">{cust.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Document */}
                    <td className="py-3 px-4 font-mono text-gray-700">
                      {cust.document}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-gray-600">
                      {cust.address.cidade}/{cust.address.uf}
                    </td>

                    {/* Tag */}
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          cust.customerTag === 'atacado'
                            ? 'bg-orange-100 text-[#E97527]'
                            : cust.customerTag === 'vip'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {cust.customerTag === 'atacado' ? 'Revenda B2B' : cust.customerTag === 'vip' ? 'Cliente VIP' : 'Varejo'}
                      </span>
                    </td>

                    {/* Orders & Total */}
                    <td className="py-3 px-4 text-center">
                      <strong className="text-gray-900 block">R$ {totalSpent.toFixed(2)}</strong>
                      <span className="text-[10px] text-gray-500">{orderCount} pedido(s)</span>
                    </td>

                    {/* Ticket Médio */}
                    <td className="py-3 px-4 text-center font-bold text-gray-800">
                      R$ {ticketMedio.toFixed(2)}
                    </td>

                    {/* Action WhatsApp */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://wa.me/55${phoneClean}?text=Ol%C3%A1%20${cust.name.split(' ')[0]}!%20Equipe%20Citrino%20Semijoias.`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition inline-flex items-center gap-1 text-[11px] font-semibold"
                          title="Falar no WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>

                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1.5 rounded-lg text-[11px] font-semibold transition"
                        >
                          Ficha
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER PROFILE MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E97527]">
                  Prontuário do Cliente Citrino
                </span>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCustomer.name}
                </h2>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F8F9FA] rounded-xl space-y-2 border border-gray-200">
                <strong className="text-gray-900 uppercase tracking-wider text-[11px] block">
                  Identificação & Contato
                </strong>
                <p><strong>Tipo:</strong> {selectedCustomer.type === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}</p>
                <p><strong>Documento:</strong> {selectedCustomer.document}</p>
                <p><strong>E-mail:</strong> {selectedCustomer.email}</p>
                <p><strong>Telefone:</strong> {selectedCustomer.phone}</p>
                <p><strong>Segmento:</strong> {selectedCustomer.customerTag.toUpperCase()}</p>
              </div>

              <div className="p-4 bg-[#F8F9FA] rounded-xl space-y-2 border border-gray-200">
                <strong className="text-gray-900 uppercase tracking-wider text-[11px] block">
                  Endereço Cadastrado
                </strong>
                <p>{selectedCustomer.address.logradouro}, {selectedCustomer.address.numero}</p>
                <p>{selectedCustomer.address.bairro} - {selectedCustomer.address.cidade}/{selectedCustomer.address.uf}</p>
                <p>CEP: {selectedCustomer.address.cep}</p>
              </div>
            </div>

            {/* Financial History with this customer */}
            <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl flex items-center justify-around text-center">
              <div>
                <span className="text-[11px] text-gray-500 block">Total Comprado</span>
                <strong className="text-base text-gray-900">R$ {(selectedCustomer.totalSpent ?? 0).toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 block">Qtd. Pedidos</span>
                <strong className="text-base text-gray-900">{selectedCustomer.orderCount ?? 0}</strong>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 block">Ticket Médio</span>
                <strong className="text-base text-gray-900">
                  R$ {((selectedCustomer.orderCount ?? 0) > 0 ? (selectedCustomer.totalSpent ?? 0) / (selectedCustomer.orderCount ?? 1) : 0).toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="bg-gray-900 text-white font-bold px-5 py-2 rounded-lg"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CUSTOMER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-gray-900">Cadastrar Novo Cliente</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    checked={formType === 'PF'}
                    onChange={() => setFormType('PF')}
                  />
                  Pessoa Física (PF)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    checked={formType === 'PJ'}
                    onChange={() => setFormType('PJ')}
                  />
                  Pessoa Jurídica / Lojista (PJ)
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-gray-700">Nome Completo / Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:border-[#E97527] focus:outline-none"
                  />
                </div>

                {formType === 'PJ' && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-gray-700">Nome Fantasia da Loja</label>
                    <input
                      type="text"
                      value={formFantasy}
                      onChange={(e) => setFormFantasy(e.target.value)}
                      className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:border-[#E97527] focus:outline-none"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">CPF ou CNPJ *</label>
                  <input
                    type="text"
                    required
                    value={formDoc}
                    onChange={(e) => setFormDoc(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:border-[#E97527] focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:border-[#E97527] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-gray-700">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:border-[#E97527] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Segmentação (Tag)</label>
                  <select
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value as any)}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:border-[#E97527] focus:outline-none"
                  >
                    <option value="varejo">Varejo</option>
                    <option value="atacado">Atacado / Revendedora (35% OFF)</option>
                    <option value="vip">Cliente VIP</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">CEP</label>
                  <input
                    type="text"
                    value={formCep}
                    onChange={(e) => setFormCep(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-gray-200 rounded p-2 focus:border-[#E97527] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E97527] hover:bg-[#D5651B] text-white font-bold rounded"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
