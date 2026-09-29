import React, { useState, useEffect } from 'react';
import { useCitrinoStore } from './services/store';
import { Product } from './types';

// Storefront Components
import { EcommerceNavbar } from './components/ecommerce/Navbar';
import { EcommerceFooter } from './components/ecommerce/Footer';
import { HomeView } from './components/ecommerce/HomeView';
import { CatalogView } from './components/ecommerce/CatalogView';
import { ProductDetailView } from './components/ecommerce/ProductDetailView';
import { CheckoutView } from './components/ecommerce/CheckoutView';
import { AccountView } from './components/ecommerce/AccountView';
import { OrderTrackingView } from './components/ecommerce/OrderTrackingView';
import { AboutContactView } from './components/ecommerce/AboutContactView';
import { CartDrawer } from './components/ecommerce/CartDrawer';
import { FloatingWhatsApp } from './components/ecommerce/FloatingWhatsApp';
import { RingsView } from './components/ecommerce/RingsView';
import { NecklacesView } from './components/ecommerce/NecklacesView';
import { ResellerView } from './components/ecommerce/ResellerView';
import { PerfumesView } from './components/ecommerce/PerfumesView';

// Admin Components (Citrino ERP)
import { AdminLayout, AdminModule } from './components/admin/AdminLayout';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminErrorBoundary } from './components/admin/AdminErrorBoundary';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminCustomers } from './components/admin/AdminCustomers';
import { AdminFinancial } from './components/admin/AdminFinancial';
import { AdminMarketing } from './components/admin/AdminMarketing';
import { AdminReports } from './components/admin/AdminReports';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminContent } from './components/admin/AdminContent';

function SplashScreen({
  message,
  action,
}: {
  message: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center gap-5 p-6 text-center">
      <img src="/citrino-logo.jpg" alt="Citrino Semijoias" className="w-24 h-24 object-contain rounded-xl" />
      <p className="text-sm text-[#555]">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-[#1C1C1C] hover:bg-[#C9A84C] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-lg transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default function App() {
  const {
    products,
    adminSession,
    adminSessionStatus,
    catalogHasData,
    catalogStatus,
    catalogError,
    logoutAdmin,
    loginAdmin,
  } = useCitrinoStore();

  // Primary Navigation State
  const [currentView, setCurrentView] = useState<string>(() =>
    typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '').startsWith('/admin')
      ? 'admin'
      : 'home'
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>('');
  const [aboutSection, setAboutSection] = useState<string>('about');
  const [accountTab, setAccountTab] = useState<string>('orders');

  // Admin Module State
  const [adminModule, setAdminModule] = useState<AdminModule>('dashboard');

  // Cart Drawer State
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Mantém o endereço /admin em sincronia com a tela do painel (dá pra favoritar)
  useEffect(() => {
    const onAdminPath = window.location.pathname.replace(/\/+$/, '').startsWith('/admin');
    if (currentView === 'admin' && !onAdminPath) {
      window.history.replaceState(null, '', '/admin');
    } else if (currentView !== 'admin' && onAdminPath) {
      window.history.replaceState(null, '', '/');
    }
  }, [currentView]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProduct, adminModule]);

  // Navigate handler for Storefront
  const handleNavigate = (view: string, extra?: any) => {
    if (view === 'catalog') {
      if (extra?.category) setCatalogCategory(extra.category);
      else if (!extra?.search) setCatalogCategory('all');
      if (extra?.search) setCatalogSearch(extra.search);
      else setCatalogSearch('');
    } else if (view === 'tracking') {
      if (extra?.orderNumber) setTrackingOrderNumber(extra.orderNumber);
    } else if (view === 'account') {
      if (extra?.tab) setAccountTab(extra.tab);
    } else if (view === 'about') {
      if (extra?.section) setAboutSection(extra.section);
    } else if (view === 'product-detail' && extra?.product) {
      setSelectedProduct(extra.product);
    }

    setCurrentView(view);
  };

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
  };

  // If inside Admin Panel
  if (currentView === 'admin') {
    // Ainda conferindo se já existe login salvo neste navegador
    if (adminSessionStatus === 'loading') {
      return <SplashScreen message="Verificando acesso..." />;
    }
    // Show login page if not authenticated
    if (!adminSession) {
      return (
        <AdminLoginPage
          onLogin={loginAdmin}
          onSuccess={() => { /* adminSession set in App's store instance — re-render happens automatically */ }}
          onBackToStore={() => setCurrentView('home')}
        />
      );
    }

    // Role guard: redirect to dashboard if current module is not allowed for this role
    const role = adminSession.role;
    const ROLE_MODULES: Record<string, AdminModule[]> = {
      admin:      ['dashboard','products','content','orders','customers','financial','marketing','reports','settings'],
      financeiro: ['dashboard','orders','financial','reports'],
      operador:   ['dashboard','orders','products'],
    };
    const allowed = ROLE_MODULES[role] || ['dashboard'];
    const safeModule: AdminModule = allowed.includes(adminModule) ? adminModule : 'dashboard';

    return (
      <AdminLayout
        currentModule={safeModule}
        onSelectModule={(mod) => setAdminModule(mod)}
        onExitAdmin={() => setCurrentView('home')}
        onLogout={async () => {
          await logoutAdmin();
          setCurrentView('home');
        }}
      >
        <AdminErrorBoundary moduleName={safeModule}>
          {safeModule === 'dashboard' && (
            <AdminDashboard onNavigateModule={(mod) => setAdminModule(mod)} />
          )}
          {safeModule === 'products' && <AdminProducts />}
          {safeModule === 'content' && <AdminContent />}
          {safeModule === 'orders' && <AdminOrders />}
          {safeModule === 'customers' && <AdminCustomers />}
          {safeModule === 'financial' && <AdminFinancial />}
          {safeModule === 'marketing' && <AdminMarketing />}
          {safeModule === 'reports' && <AdminReports />}
          {safeModule === 'settings' && <AdminSettings />}
        </AdminErrorBoundary>
      </AdminLayout>
    );
  }

  // Loja: espera o catálogo real chegar (nunca mostra produto de demonstração)
  if (!catalogHasData) {
    if (catalogStatus === 'error') {
      return (
        <SplashScreen
          message={catalogError || 'Não foi possível carregar a loja agora.'}
          action={{ label: 'Tentar novamente', onClick: () => window.location.reload() }}
        />
      );
    }
    return <SplashScreen message="Carregando..." />;
  }

  // Storefront Layout
  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1C1C1C] flex flex-col font-sans selection:bg-[#C9A84C]/20 selection:text-[#1C1C1C]">
      {/* Top Navigation */}
      <EcommerceNavbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
        onSwitchToAdmin={() => setCurrentView('admin')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenProduct={handleOpenProduct}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogView
            initialCategory={catalogCategory}
            initialSearch={catalogSearch}
            onOpenProduct={handleOpenProduct}
          />
        )}

        {currentView === 'product-detail' && (
          <ProductDetailView
            product={selectedProduct || products[0]}
            onBack={() => setCurrentView('catalog')}
            onNavigate={handleNavigate}
            onOpenProduct={handleOpenProduct}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            onBackToCatalog={() => setCurrentView('catalog')}
            onNavigateTracking={(orderNumber) => {
              setTrackingOrderNumber(orderNumber);
              setCurrentView('tracking');
            }}
          />
        )}

        {currentView === 'account' && (
          <AccountView
            initialTab={accountTab}
            onNavigateTracking={(orderNumber) => {
              setTrackingOrderNumber(orderNumber);
              setCurrentView('tracking');
            }}
            onOpenProduct={handleOpenProduct}
          />
        )}

        {currentView === 'tracking' && (
          <OrderTrackingView
            initialOrderNumber={trackingOrderNumber}
            onBackToCatalog={() => setCurrentView('catalog')}
          />
        )}

        {currentView === 'about' && (
          <AboutContactView
            initialSection={aboutSection}
            onNavigateCatalog={() => setCurrentView('catalog')}
          />
        )}

        {(currentView === 'aneis' || currentView === 'rings') && (
          <RingsView
            onOpenProduct={handleOpenProduct}
            onNavigate={handleNavigate}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {(currentView === 'colares' || currentView === 'necklaces') && (
          <NecklacesView
            onOpenProduct={handleOpenProduct}
            onNavigate={handleNavigate}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {(currentView === 'revendedora' || currentView === 'reseller' || currentView === 'atacado') && (
          <ResellerView
            onNavigate={handleNavigate}
            onOpenProduct={handleOpenProduct}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {currentView === 'perfumes' && (
          <PerfumesView
            onNavigate={handleNavigate}
            onOpenProduct={handleOpenProduct}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}
      </main>

      {/* Cart Drawer Slide-over */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onGoToCheckout={() => {
          setIsCartOpen(false);
          setCurrentView('checkout');
        }}
        onNavigateCatalog={() => {
          setIsCartOpen(false);
          setCurrentView('catalog');
        }}
      />

      {/* Floating Support WhatsApp */}
      <FloatingWhatsApp />

      {/* Luxury Footer */}
      <EcommerceFooter
        onNavigate={handleNavigate}
        onSwitchToAdmin={() => setCurrentView('admin')}
      />
    </div>
  );
}
