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

// Admin Components (Citrino ERP)
import { AdminLayout, AdminModule } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminCustomers } from './components/admin/AdminCustomers';
import { AdminFinancial } from './components/admin/AdminFinancial';
import { AdminMarketing } from './components/admin/AdminMarketing';
import { AdminReports } from './components/admin/AdminReports';
import { AdminSettings } from './components/admin/AdminSettings';

export default function App() {
  const { products } = useCitrinoStore();

  // Primary Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
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
    return (
      <AdminLayout
        currentModule={adminModule}
        onSelectModule={(mod) => setAdminModule(mod)}
        onExitAdmin={() => setCurrentView('home')}
      >
        {adminModule === 'dashboard' && (
          <AdminDashboard onNavigateModule={(mod) => setAdminModule(mod)} />
        )}
        {adminModule === 'products' && <AdminProducts />}
        {adminModule === 'orders' && <AdminOrders />}
        {adminModule === 'customers' && <AdminCustomers />}
        {adminModule === 'financial' && <AdminFinancial />}
        {adminModule === 'marketing' && <AdminMarketing />}
        {adminModule === 'reports' && <AdminReports />}
        {adminModule === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
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
