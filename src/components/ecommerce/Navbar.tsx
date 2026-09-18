import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles, 
  SlidersHorizontal,
  LayoutDashboard,
  Truck
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, extra?: any) => void;
  onOpenCart: () => void;
  onSwitchToAdmin: () => void;
}

export const EcommerceNavbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCart,
  onSwitchToAdmin,
}) => {
  const { cart, wishlist, currentCustomer, categories } = useCitrinoStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('catalog', { search: searchQuery.trim() });
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4DC] transition-all">
      {/* Top Luxury Announcement Bar */}
      <div className="bg-[#1C1C1C] text-[#FAF8F4] text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-4 text-[11px] font-medium text-[#D1CECB]">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#C9A84C]" /> Frete Grátis acima de R$ 299
            </span>
            <span className="text-[#555]">•</span>
            <span>10x Sem Juros no Cartão</span>
            <span className="text-[#555]">•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" /> 1 Ano de Garantia no Banho
            </span>
          </div>

          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 text-[11px]">
            <span className="text-[#C9A84C] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Semijoias Finas Banhadas a Ouro 18k
            </span>
            {/* Direct Switcher to Citrino ERP Panel */}
            <button
              onClick={onSwitchToAdmin}
              className="flex items-center gap-1.5 bg-[#e97527] hover:bg-[#d8661b] text-white px-2.5 py-0.5 rounded font-semibold text-[11px] tracking-wide transition shadow-sm ml-2 cursor-pointer"
              title="Acessar painel de gestão administrativa Citrino"
            >
              <LayoutDashboard className="w-3 h-3" />
              Painel ERP Citrino
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1C1C1C] hover:text-[#C9A84C] focus:outline-none"
              aria-label="Menu Principal"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Left Desktop Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className={`text-xs tracking-[0.18em] uppercase transition font-medium ${
                currentView === 'home' ? 'text-[#C9A84C] font-semibold' : 'text-[#333] hover:text-[#C9A84C]'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className={`text-xs tracking-[0.18em] uppercase transition font-medium ${
                currentView === 'catalog' ? 'text-[#C9A84C] font-semibold' : 'text-[#333] hover:text-[#C9A84C]'
              }`}
            >
              Coleção Completa
            </button>
            <button
              onClick={() => onNavigate('aneis')}
              className={`text-xs tracking-[0.18em] uppercase transition font-medium ${
                currentView === 'aneis' ? 'text-[#C9A84C] font-semibold' : 'text-[#333] hover:text-[#C9A84C]'
              }`}
            >
              Anéis
            </button>
            <button
              onClick={() => onNavigate('colares')}
              className={`text-xs tracking-[0.18em] uppercase transition font-medium ${
                currentView === 'colares' ? 'text-[#C9A84C] font-semibold' : 'text-[#333] hover:text-[#C9A84C]'
              }`}
            >
              Colares
            </button>
            <button
              onClick={() => onNavigate('revendedora')}
              className={`text-xs tracking-[0.18em] uppercase transition font-semibold flex items-center gap-1 ${
                currentView === 'revendedora' ? 'text-[#C9A84C]' : 'text-[#E8705A] hover:text-[#c75540]'
              }`}
            >
              Seja Revendedora
            </button>
          </nav>

          {/* Center Brand Identity with Official Logo */}
          <div 
            className="flex-1 md:flex-initial flex items-center justify-center gap-2.5 sm:gap-3.5 cursor-pointer group py-1" 
            onClick={() => onNavigate('home')}
          >
            <div className="relative">
              <img
                src="/citrino-icon.jpg"
                alt="Logo Citrino Semijoias"
                className="w-11 h-11 sm:w-13 sm:h-13 object-cover rounded-full border border-[#C9A84C]/50 shadow-xs group-hover:scale-105 group-hover:border-[#C9A84C] transition duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#C9A84C] rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-bold">
                ✓
              </span>
            </div>
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl lg:text-[26px] font-serif-luxury tracking-[0.2em] font-medium text-[#1C1C1C] uppercase leading-none group-hover:text-[#C9A84C] transition">
                CITRINO
              </h1>
              <p className="text-[8px] sm:text-[9px] tracking-[0.38em] text-[#C9A84C] uppercase mt-1 font-semibold">
                SEMIJOIAS FINAS
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1 text-[#1C1C1C] hover:text-[#C9A84C] transition relative"
              aria-label="Buscar produtos"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account / Login */}
            <button
              onClick={() => onNavigate('account')}
              className="hidden sm:flex items-center gap-1 text-[#1C1C1C] hover:text-[#C9A84C] transition text-xs font-medium"
              title="Minha Conta"
            >
              <User className="w-5 h-5" />
              <span className="hidden lg:inline text-[11px] tracking-wider uppercase">
                {currentCustomer ? currentCustomer.name.split(' ')[0] : 'Entrar'}
              </span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('account', { tab: 'wishlist' })}
              className="p-1 text-[#1C1C1C] hover:text-[#C9A84C] transition relative"
              aria-label="Lista de Desejos"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#C9A84C] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-[#FAF8F4] hover:bg-[#F2ECE1] border border-[#E8E4DC] px-3 py-2 rounded-full transition text-[#1C1C1C]"
              aria-label="Abrir Sacola de Compras"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#1C1C1C]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#C9A84C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium tracking-wider hidden sm:inline">
                Sacola
              </span>
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="py-3 px-2 border-t border-[#E8E4DC] animate-in fade-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto flex items-center">
              <input
                type="text"
                placeholder="Buscar por anel, colar riviera, ouro 18k, citrino..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-[#FAF8F4] border border-[#D5CFBF] text-sm rounded-full py-2.5 pl-11 pr-24 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]"
              />
              <Search className="w-4 h-4 text-[#888] absolute left-4" />
              <button
                type="submit"
                className="absolute right-1.5 bg-[#C9A84C] hover:bg-[#b5943b] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition"
              >
                Buscar
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E8E4DC] px-6 py-6 space-y-4">
          {/* Mobile Menu Brand Header with Logo */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <img
              src="/citrino-icon.jpg"
              alt="Citrino Semijoias"
              className="w-11 h-11 object-cover rounded-full border border-[#C9A84C]/40 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-serif-luxury text-lg font-semibold tracking-wider text-[#1C1C1C] block">
                CITRINO
              </span>
              <span className="text-[9px] tracking-widest text-[#C9A84C] uppercase font-semibold">
                SEMIJOIAS FINAS
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-3 font-medium text-sm">
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className="text-left py-2 border-b border-gray-100 text-[#1C1C1C]"
            >
              Página Inicial
            </button>
            <button
              onClick={() => { onNavigate('catalog'); setMobileMenuOpen(false); }}
              className="text-left py-2 border-b border-gray-100 text-[#1C1C1C]"
            >
              Catálogo Completo
            </button>
            <button
              onClick={() => { onNavigate('aneis'); setMobileMenuOpen(false); }}
              className="text-left py-2 border-b border-gray-100 text-[#1C1C1C] flex items-center justify-between"
            >
              <span>Anéis & Solitários</span>
              <span className="text-[10px] bg-[#FAF8F4] text-[#C9A84C] border border-[#E8E4DC] px-2 py-0.5 rounded font-medium">Guia de Aros</span>
            </button>
            <button
              onClick={() => { onNavigate('colares'); setMobileMenuOpen(false); }}
              className="text-left py-2 border-b border-gray-100 text-[#1C1C1C] flex items-center justify-between"
            >
              <span>Colares, Chokers & Rivieras</span>
              <span className="text-[10px] bg-[#FAF8F4] text-[#C9A84C] border border-[#E8E4DC] px-2 py-0.5 rounded font-medium">Comprimentos</span>
            </button>
            <button
              onClick={() => { onNavigate('revendedora'); setMobileMenuOpen(false); }}
              className="text-left py-2 border-b border-gray-100 text-[#E8705A] font-semibold flex items-center justify-between"
            >
              <span>Seja Revendedora (Atacado)</span>
              <span className="text-[10px] bg-[#E8705A]/10 text-[#E8705A] px-2 py-0.5 rounded font-bold">100% Lucro</span>
            </button>
            <button
              onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
              className="text-left py-2 border-b border-gray-100 text-[#1C1C1C]"
            >
              Sobre a Marca & Garantia
            </button>
            <button
              onClick={() => { onNavigate('tracking'); setMobileMenuOpen(false); }}
              className="text-left py-2 border-b border-gray-100 text-[#1C1C1C]"
            >
              Rastrear Meu Pedido
            </button>
            <button
              onClick={() => { onNavigate('account'); setMobileMenuOpen(false); }}
              className="text-left py-2 border-b border-gray-100 text-[#1C1C1C]"
            >
              Minha Conta & Pedidos
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => { onSwitchToAdmin(); setMobileMenuOpen(false); }}
              className="w-full bg-[#1d1f24] hover:bg-[#111317] text-white py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold border-l-4 border-[#e97527]"
            >
              <LayoutDashboard className="w-4 h-4 text-[#e97527]" />
              Painel ERP Citrino (Back-office)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
