import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Megaphone, 
  BarChart3, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Search, 
  Bell, 
  Menu, 
  X, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';

export type AdminModule = 
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'financial'
  | 'marketing'
  | 'reports'
  | 'settings';

interface AdminLayoutProps {
  currentModule: AdminModule;
  onSelectModule: (module: AdminModule) => void;
  onExitAdmin: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentModule,
  onSelectModule,
  onExitAdmin,
  onLogout,
  children,
}) => {
  const { currentAdminUser, orders, products } = useCitrinoStore();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const pendingOrdersCount = orders.filter((o) => o.status === 'aguardando' || o.status === 'pago').length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'orders', label: 'Gestão de Pedidos', icon: ShoppingCart, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null },
    { id: 'products', label: 'Catálogo & Estoque', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} alertas` : null, badgeAlert: true },
    { id: 'customers', label: 'Clientes & B2B', icon: Users, badge: null },
    { id: 'financial', label: 'Financeiro & DRE', icon: DollarSign, badge: null },
    { id: 'marketing', label: 'Marketing & Cupons', icon: Megaphone, badge: null },
    { id: 'reports', label: 'Relatórios & Curva ABC', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Configurações', icon: Settings, badge: null },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex font-sans text-gray-800">
      {/* Citrino ERP Dark Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-[#1D1F24] text-[#E0E2E6] flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#2A2D34]">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/citrino-icon.jpg"
              alt="Citrino Semijoias"
              className="w-9 h-9 rounded-lg object-cover border border-[#C9A84C]/60 shrink-0 shadow-xs"
              referrerPolicy="no-referrer"
            />
            {sidebarOpen && (
              <div className="leading-none">
                <span className="font-serif-luxury text-base font-bold text-white tracking-wide block">
                  CITRINO
                </span>
                <span className="text-[10px] text-[#C9A84C] uppercase tracking-wider font-semibold">
                  Gestão Joalheira
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Badge Profile */}
        <div className="p-4 border-b border-[#2A2D34] bg-[#17181C]">
          <div className="flex items-center gap-3">
            <img
              src={currentAdminUser.avatar}
              alt={currentAdminUser.name}
              className="w-9 h-9 rounded-full object-cover border border-[#E97527]"
            />
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentAdminUser.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">
                    {currentAdminUser.role}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id as AdminModule);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-[#E97527] text-white font-semibold shadow-xs'
                    : 'text-gray-300 hover:bg-[#2A2D34] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {sidebarOpen && <span>{item.label}</span>}
                </div>

                {sidebarOpen && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeAlert
                        ? 'bg-red-500 text-white'
                        : isActive
                        ? 'bg-white text-[#E97527]'
                        : 'bg-[#E97527] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Quick View Store & Logout */}
        <div className="p-3 border-t border-[#2A2D34] space-y-1">
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-[#E97527] bg-[#E97527]/10 hover:bg-[#E97527]/20 transition cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Ver Loja Virtual</span>}
          </button>

          <button
            onClick={onLogout || onExitAdmin}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sair / Encerrar Sessão</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-gray-600 hover:text-black p-1"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop toggle collapse sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex text-gray-500 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100"
              title="Expandir/Recolher Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <span className="text-xs text-gray-400 font-medium hidden sm:inline">
              Módulo Atual:
            </span>
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded">
              {currentModule}
            </span>
          </div>

          {/* Quick Global Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block w-64">
              <input
                type="text"
                placeholder="Busca rápida (SKU, Pedido, Cliente)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-gray-200 text-xs rounded-lg py-1.5 pl-8 pr-3 focus:outline-none focus:border-[#E97527]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
            </div>

            {/* Notifications Alert Bell */}
            <div className="relative">
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 relative">
                <Bell className="w-4 h-4" />
                {lowStockCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            </div>

            {/* Quick Switch to Storefront */}
            <button
              onClick={onExitAdmin}
              className="bg-[#1D1F24] hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#E97527]" />
              <span className="hidden sm:inline">Loja Pública</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
