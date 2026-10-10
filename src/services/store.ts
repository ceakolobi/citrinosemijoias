import { useState, useEffect, useMemo } from 'react';
import {
  Product,
  Category,
  Collection,
  Customer,
  Order,
  Receivable,
  Payable,
  Coupon,
  HomeBanner,
  AdminUser,
  CartItem,
  ShippingOption,
  AdminRole,
  OrderStatus,
  ReturnExchange
} from '../types';
import {
  INITIAL_COLLECTIONS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_RECEIVABLES,
  INITIAL_PAYABLES,
  INITIAL_COUPONS,
} from '../data/mockData';
import {
  useRemote,
  Result,
  saveProductDoc,
  deleteProductDoc,
  saveBannersDoc,
  saveContentDoc,
  loginAdmin as remoteLogin,
  logoutAdmin as remoteLogout,
} from './remote';

const STORAGE_KEYS = {
  COLLECTIONS: 'citrino_collections_v1',
  CUSTOMERS: 'citrino_customers_v1',
  ORDERS: 'citrino_orders_v1',
  RECEIVABLES: 'citrino_receivables_v1',
  PAYABLES: 'citrino_payables_v1',
  COUPONS: 'citrino_coupons_v1',
  CART: 'citrino_cart_v1',
  WISHLIST: 'citrino_wishlist_v1',
  CURRENT_USER: 'citrino_current_user_v2',
  ACTIVE_ROLE: 'citrino_active_role_v1',
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Local storage write error:', e);
  }
}

export interface CompanySettings {
  name: string;
  tradingName: string;
  cnpj: string;
  stateRegistration: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  instagram: string;
  freeShippingThreshold: number;
  shippingPacPrice: number;
  shippingPacDays: number;
  shippingSedexPrice: number;
  shippingSedexDays: number;
  shippingSedexOn: boolean;
  shippingJadlogPrice: number;
  shippingJadlogDays: number;
  shippingJadlogOn: boolean;
  mpPublicKey: string;
  mpAccessToken: string;
  pixKey: string;
}

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: 'Citrino Semijoias e Acessórios Finos LTDA',
  tradingName: 'Citrino Semijoias',
  cnpj: '48.910.382/0001-44',
  stateRegistration: '108.924.110.290',
  phone: '(11) 3450-8800',
  whatsapp: '(47) 9698-2679',
  email: 'contato@citrinosemijoias.com.br',
  address: 'Rua Oscar Freire, 920 - Cerqueira César',
  city: 'São Paulo',
  state: 'SP',
  cep: '01426-000',
  instagram: '@citrinosemijoias',
  freeShippingThreshold: 299.00,
  shippingPacPrice: 22.9,
  shippingPacDays: 5,
  shippingSedexPrice: 34.5,
  shippingSedexDays: 2,
  shippingSedexOn: true,
  shippingJadlogPrice: 19.9,
  shippingJadlogDays: 4,
  shippingJadlogOn: true,
  mpPublicKey: 'APP_USR-7819-test-citrino-public',
  mpAccessToken: 'APP_USR-7819-test-citrino-access-token',
  pixKey: 'pix@citrinosemijoias.com.br',
};

export function useCitrinoStore() {
  // State
  // Catálogo, banners, textos, contato da loja e sessão do painel vêm do Supabase (store compartilhado).
  const remote = useRemote();
  // Loja pública só enxerga produtos ativos; o painel usa allProducts (inclui inativos e preço de custo).
  const allProducts = remote.products;
  const products = useMemo(
    () => remote.products.filter((p) => p.active !== false && Number(p.stock) > 0),
    [remote.products]
  );
  const banners = remote.banners;
  const categories = useMemo<Category[]>(
    () => {
      const mapped = remote.categories.map((c) => ({
        ...c,
        itemCount: remote.products.filter((p) => p.active !== false && Number(p.stock) > 0 && p.category === c.name).length,
      }));
      // Garante que "Perfumes" sempre aparece (nova linha de produtos)
      if (!mapped.some((c) => c.name === 'Perfumes')) {
        mapped.push({
          id: 'cat-perfumes',
          name: 'Perfumes',
          slug: 'perfumes',
          icon: 'Wind',
          image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=800&auto=format&fit=crop',
          itemCount: remote.products.filter((p) => p.active !== false && Number(p.stock) > 0 && p.category === 'Perfumes').length,
        });
      }
      // Idem para "Piercings"
      if (!mapped.some((c) => c.name === 'Piercings')) {
        mapped.push({
          id: 'cat-piercings',
          name: 'Piercings',
          slug: 'piercings',
          icon: 'Sparkles',
          image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
          itemCount: remote.products.filter((p) => p.active !== false && Number(p.stock) > 0 && p.category === 'Piercings').length,
        });
      }
      return mapped;
    },
    [remote.categories, remote.products]
  );
  const [collections] = useState<Collection[]>(() => getLocal(STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS));
  const [customers, setCustomers] = useState<Customer[]>(() => getLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS));
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = getLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    if (!Array.isArray(saved)) return INITIAL_ORDERS;
    return saved.map((ord) => ({
      ...ord,
      items: ord.items.map((item) => {
        if (item.image?.includes('photo-1611591475824-7494f1c93a02')) {
          return {
            ...item,
            image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=900&auto=format&fit=crop',
          };
        }
        return item;
      }),
    }));
  });
  const [receivables, setReceivables] = useState<Receivable[]>(() => getLocal(STORAGE_KEYS.RECEIVABLES, INITIAL_RECEIVABLES));
  const [payables, setPayables] = useState<Payable[]>(() => getLocal(STORAGE_KEYS.PAYABLES, INITIAL_PAYABLES));
  const [coupons, setCoupons] = useState<Coupon[]>(() => getLocal(STORAGE_KEYS.COUPONS, INITIAL_COUPONS));
  const companySettings = useMemo<CompanySettings>(
    () => ({ ...DEFAULT_COMPANY_SETTINGS, ...remote.company }),
    [remote.company]
  );

  // E-commerce interactive state
  const [cart, setCart] = useState<CartItem[]>(() => getLocal<CartItem[]>(STORAGE_KEYS.CART, []));
  const [wishlist, setWishlist] = useState<string[]>(() => getLocal(STORAGE_KEYS.WISHLIST, [] as string[]));
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  
  // Auth state
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => getLocal(STORAGE_KEYS.CURRENT_USER, null));
  const [activeAdminRole, setActiveAdminRole] = useState<AdminRole>(() => getLocal(STORAGE_KEYS.ACTIVE_ROLE, 'admin'));
  const adminSession = useMemo<AdminUser | null>(
    () =>
      remote.session.user
        ? {
            id: remote.session.user.id,
            name: remote.session.user.name,
            email: remote.session.user.email,
            role: remote.session.user.role,
            active: true,
            lastLogin: '',
          }
        : null,
    [remote.session.user]
  );

  // Save to localStorage when state changes
  useEffect(() => { setLocal(STORAGE_KEYS.CUSTOMERS, customers); }, [customers]);
  useEffect(() => { setLocal(STORAGE_KEYS.ORDERS, orders); }, [orders]);
  useEffect(() => { setLocal(STORAGE_KEYS.RECEIVABLES, receivables); }, [receivables]);
  useEffect(() => { setLocal(STORAGE_KEYS.PAYABLES, payables); }, [payables]);
  useEffect(() => { setLocal(STORAGE_KEYS.COUPONS, coupons); }, [coupons]);
  useEffect(() => { setLocal(STORAGE_KEYS.CART, cart); }, [cart]);
  useEffect(() => { setLocal(STORAGE_KEYS.WISHLIST, wishlist); }, [wishlist]);
  useEffect(() => { setLocal(STORAGE_KEYS.CURRENT_USER, currentCustomer); }, [currentCustomer]);
  useEffect(() => { setLocal(STORAGE_KEYS.ACTIVE_ROLE, activeAdminRole); }, [activeAdminRole]);

  // Cart actions
  const addToCart = (
    product: Product, 
    quantity = 1, 
    selectedVariation?: string, 
    selectedWarranty: string = '6 meses'
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => 
          item.product.id === product.id && 
          item.selectedVariation === selectedVariation &&
          (item.selectedWarranty || '6 meses') === (selectedWarranty || '6 meses')
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, quantity, selectedVariation, selectedWarranty: selectedWarranty || '6 meses' }];
    });
  };

  const updateCartQuantity = (
    productId: string, 
    quantity: number, 
    variation?: string, 
    warranty?: string
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, variation, warranty);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        const match =
          item.product.id === productId &&
          item.selectedVariation === variation &&
          (warranty === undefined || (item.selectedWarranty || '6 meses') === warranty);
        return match ? { ...item, quantity } : item;
      })
    );
  };

  const updateCartWarranty = (
    productId: string,
    variation: string | undefined,
    oldWarranty: string,
    newWarranty: string
  ) => {
    setCart((prev) =>
      prev.map((item) => {
        const match =
          item.product.id === productId &&
          item.selectedVariation === variation &&
          (item.selectedWarranty || '6 meses') === oldWarranty;
        return match ? { ...item, selectedWarranty: newWarranty } : item;
      })
    );
  };

  const removeFromCart = (productId: string, variation?: string, warranty?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedVariation === variation &&
            (warranty === undefined || (item.selectedWarranty || '6 meses') === warranty)
          )
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist toggle
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => {
    const price = item.product.promoPrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountPct
      ? (cartSubtotal * appliedCoupon.discountPct) / 100
      : appliedCoupon.discountValue || 0
    : 0;

  const shippingPrice = selectedShipping ? selectedShipping.price : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingPrice);

  // Apply Coupon
  const applyCouponCode = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === clean && c.active);
    if (!found) {
      return { success: false, message: 'Cupom inválido ou expirado.' };
    }
    if (cartSubtotal < found.minPurchase) {
      return {
        success: false,
        message: `Este cupom exige compra mínima de R$ ${found.minPurchase.toFixed(2)}.`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Cupom ${found.code} aplicado com sucesso!` };
  };

  // Shipping simulation by CEP
  const calculateShippingByCep = (cep: string): ShippingOption[] => {
    const cleanCep = cep.replace(/\D/g, '');
    const isFreeEligible = cartSubtotal >= companySettings.freeShippingThreshold;

    if (cleanCep.length < 8) return [];

    return [
      {
        id: 'pac',
        name: 'Correios PAC',
        company: 'Correios',
        price: isFreeEligible ? 0 : 22.90,
        days: 5,
        freeShippingApplied: isFreeEligible,
      },
      {
        id: 'sedex',
        name: 'Correios SEDEX Express',
        company: 'Correios',
        price: isFreeEligible ? 12.00 : 34.50,
        days: 2,
        freeShippingApplied: false,
      },
      {
        id: 'jadlog',
        name: 'Jadlog Package',
        company: 'Jadlog',
        price: 19.90,
        days: 4,
        freeShippingApplied: false,
      },
    ];
  };

  // Place order
  const createOrder = (orderData: Partial<Order>): Order => {
    const orderNum = `#CIT-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      createdAt: dateStr,
      updatedAt: dateStr,
      customerName: orderData.customerName || 'Cliente Citrino',
      customerEmail: orderData.customerEmail || 'cliente@email.com',
      customerPhone: orderData.customerPhone || '(11) 99999-9999',
      customerCpf: orderData.customerCpf || '000.000.000-00',
      items: orderData.items || [],
      subtotal: orderData.subtotal || cartSubtotal,
      shippingPrice: orderData.shippingPrice || shippingPrice,
      shippingMethod: orderData.shippingMethod || (selectedShipping?.name || 'Correios PAC'),
      discountPrice: orderData.discountPrice || discountAmount,
      couponCode: appliedCoupon?.code,
      total: orderData.total || cartTotal,
      status: orderData.status || (orderData.paymentMethod === 'pix' ? 'aguardando' : 'pago'),
      paymentMethod: orderData.paymentMethod || 'pix',
      installments: orderData.installments || 1,
      pixCode: orderData.pixCode || `00020126580014br.gov.bcb.pix0136citrino-semijoias-${orderNum.replace('#', '')}5204000053039865405${(orderData.total || cartTotal).toFixed(2)}5802BR5920Citrino Semijoias6009Sao Paulo62070503***6304E8F2`,
      shippingAddress: orderData.shippingAddress || {
        cep: '01426-000',
        logradouro: 'Rua Oscar Freire',
        numero: '920',
        bairro: 'Cerqueira César',
        cidade: 'São Paulo',
        uf: 'SP',
      },
      trackingCode: orderData.trackingCode,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Create receivable entry
    const newReceivable: Receivable = {
      id: `rec-${Date.now()}`,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      description: `Pedido ${newOrder.orderNumber} - ${newOrder.items.length} item(s)`,
      amount: newOrder.total,
      dueDate: now.toISOString().split('T')[0],
      paid: newOrder.status === 'pago',
      paymentDate: newOrder.status === 'pago' ? now.toISOString().split('T')[0] : undefined,
      paymentMethod: newOrder.paymentMethod,
    };
    setReceivables((prev) => [newReceivable, ...prev]);

    // Update coupon uses if applied
    if (appliedCoupon) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === appliedCoupon.id ? { ...c, currentUses: c.currentUses + 1 } : c))
      );
    }

    clearCart();
    return newOrder;
  };

  // Order status update (Painel / Webhook)
  const updateOrderStatus = (orderId: string, status: OrderStatus, trackingCode?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated = {
            ...order,
            status,
            trackingCode: trackingCode || order.trackingCode,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          };

          // If paid, also mark receivable as paid
          if (status === 'pago') {
            setReceivables((rList) =>
              rList.map((r) =>
                r.orderId === orderId ? { ...r, paid: true, paymentDate: new Date().toISOString().split('T')[0] } : r
              )
            );
          }
          return updated;
        }
        return order;
      })
    );
  };

  // Product CRUD (grava no Supabase; só admin/operador passam pelo RLS)
  const saveProduct = (product: Product): Promise<Result> => saveProductDoc(product);

  const deleteProduct = (id: string): Promise<Result> => deleteProductDoc(id);

  // Customer CRUD
  const saveCustomer = (customer: Customer) => {
    setCustomers((prev) => {
      const idx = prev.findIndex((c) => c.id === customer.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = customer;
        return next;
      }
      return [customer, ...prev];
    });
  };

  // Financial CRUD
  const markReceivablePaid = (id: string) => {
    setReceivables((prev) =>
      prev.map((r) => (r.id === id ? { ...r, paid: true, paymentDate: new Date().toISOString().split('T')[0] } : r))
    );
  };

  const addPayable = (item: Omit<Payable, 'id'>) => {
    const newPayable: Payable = { ...item, id: `pay-${Date.now()}` };
    setPayables((prev) => [newPayable, ...prev]);
  };

  const markPayablePaid = (id: string) => {
    setPayables((prev) =>
      prev.map((p) => (p.id === id ? { ...p, paid: true, paymentDate: new Date().toISOString().split('T')[0] } : p))
    );
  };

  // Marketing Coupons CRUD
  const saveCoupon = (coupon: Coupon) => {
    setCoupons((prev) => {
      const idx = prev.findIndex((c) => c.id === coupon.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = coupon;
        return next;
      }
      return [coupon, ...prev];
    });
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const addProduct = (p: Omit<Product, 'id'>): Promise<Result> =>
    saveProductDoc({ ...p, id: `prod-${Date.now()}` });

  const updateProduct = (id: string, partial: Partial<Product>): Promise<Result> => {
    const current = allProducts.find((x) => x.id === id);
    if (!current) return Promise.resolve({ ok: false, error: 'Produto não encontrado.' } as Result);
    return saveProductDoc({ ...current, ...partial, id });
  };

  const addCustomer = (c: any) => {
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      type: c.type || 'PF',
      name: c.name,
      fantasyName: c.fantasyName,
      document: c.document,
      email: c.email,
      phone: c.phone,
      whatsapp: c.phone,
      address: c.address || {
        cep: '01426-000',
        logradouro: 'Rua Oscar Freire',
        numero: '100',
        bairro: 'Jardins',
        cidade: 'São Paulo',
        uf: 'SP',
      },
      totalOrders: 0,
      totalSpent: 0,
      isB2BWholesale: c.isB2BWholesale || false,
      customerTag: c.customerTag || 'varejo',
      orderCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const updateOrderTracking = (id: string, trackingCode: string) => {
    updateOrderStatus(id, 'enviado', trackingCode);
  };

  const addCoupon = (c: any) => {
    const newCoupon: Coupon = {
      id: `cup-${Date.now()}`,
      code: c.code,
      minPurchase: c.minOrderValue || 0,
      validUntil: c.expiryDate || '2025-12-31',
      active: true,
      maxUses: 1000,
      currentUses: 0,
      ...c,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
  };

  // Só dados públicos de contato vão pro banco; chaves de pagamento nunca.
  const PUBLIC_COMPANY_KEYS: (keyof CompanySettings)[] = [
    'name', 'tradingName', 'cnpj', 'stateRegistration', 'phone', 'whatsapp', 'email',
    'address', 'city', 'state', 'cep', 'instagram', 'freeShippingThreshold',
    'shippingPacPrice', 'shippingPacDays', 'shippingSedexPrice', 'shippingSedexDays', 'shippingSedexOn',
    'shippingJadlogPrice', 'shippingJadlogDays', 'shippingJadlogOn',
  ];
  const updateCompanySettings = (partial: Partial<CompanySettings>): Promise<Result> => {
    const merged: Record<string, any> = { ...companySettings, ...partial };
    const pub: Record<string, any> = {};
    PUBLIC_COMPANY_KEYS.forEach((k) => { pub[k] = merged[k]; });
    return saveContentDoc('company', pub);
  };

  const updateHomeBanners = (newBanners: HomeBanner[]): Promise<Result> => saveBannersDoc(newBanners);

  // Unified financial entries
  const financialEntries = [
    ...receivables.map((r) => ({
      id: r.id,
      description: r.description,
      amount: r.amount,
      type: 'receita' as const,
      category: 'Venda E-commerce',
      status: r.paid ? ('pago' as const) : ('pendente' as const),
      dueDate: r.dueDate,
    })),
    ...payables.map((p) => ({
      id: p.id,
      description: p.description,
      amount: p.amount,
      type: 'despesa' as const,
      category: p.category,
      status: p.paid ? ('pago' as const) : ('pendente' as const),
      dueDate: p.dueDate,
    })),
  ];

  const addFinancialEntry = (entry: any) => {
    if (entry.type === 'receita') {
      setReceivables((prev) => [
        {
          id: `rec-${Date.now()}`,
          description: entry.description,
          amount: entry.amount,
          customerName: 'Recebimento Diversos',
          dueDate: entry.dueDate,
          paid: entry.status === 'pago',
          paymentMethod: 'pix',
        },
        ...prev,
      ]);
    } else {
      setPayables((prev) => [
        {
          id: `pay-${Date.now()}`,
          description: entry.description,
          amount: entry.amount,
          category: entry.category || 'Outros',
          beneficiary: 'Fornecedor',
          dueDate: entry.dueDate,
          paid: entry.status === 'pago',
        },
        ...prev,
      ]);
    }
  };

  // Login do painel: Supabase Auth + checagem em citrino_admins (ver remote.ts)
  const loginAdmin = (email: string, password: string): Promise<Result> => remoteLogin(email, password);
  const logoutAdmin = (): Promise<void> => remoteLogout();

  const currentAdminUser = {
    id: adminSession?.id || 'anon',
    name: adminSession?.name || 'Visitante',
    email: adminSession?.email || '',
    role: (adminSession?.role || 'operador') as string,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  };

  // Reset dos dados de demonstração que ainda são locais (pedidos, clientes, financeiro)
  const resetToInitialData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setReceivables(INITIAL_RECEIVABLES);
    setPayables(INITIAL_PAYABLES);
    setCoupons(INITIAL_COUPONS);
    setCart([]);
  };

  return {
    // Data
    products,
    allProducts,
    categories,
    collections,
    customers,
    orders,
    receivables,
    payables,
    coupons,
    banners,
    homeBanners: banners,
    companySettings,
    cart,
    wishlist,
    appliedCoupon,
    selectedShipping,
    currentCustomer,
    activeAdminRole,
    financialEntries,
    currentAdminUser,
    // Calculations
    cartSubtotal,
    discountAmount,
    shippingPrice,
    cartTotal,
    // Methods
    addToCart,
    updateCartQuantity,
    updateCartWarranty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    applyCouponCode,
    setSelectedShipping,
    calculateShippingByCep,
    createOrder,
    updateOrderStatus,
    updateOrderTracking,
    saveProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    saveCustomer,
    addCustomer,
    markReceivablePaid,
    addPayable,
    markPayablePaid,
    addFinancialEntry,
    saveCoupon,
    addCoupon,
    deleteCoupon,
    updateCompanySettings,
    updateHomeBanners,
    setCurrentCustomer,
    setActiveAdminRole,
    resetToInitialData,
    adminSession,
    adminSessionStatus: remote.session.status,
    catalogStatus: remote.status,
    catalogHasData: remote.hasData,
    catalogError: remote.error,
    loginAdmin,
    logoutAdmin,
  };
}
