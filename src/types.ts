export type ProductMaterial = 'Ouro 18k' | 'Prata 925' | 'Ródio Branco' | 'Ródio Negro' | 'Ouro Rosé';
export type ProductStone = 'Citrino Natural' | 'Zircônia Cristal' | 'Pérola Shell' | 'Fusion Esmeralda' | 'Zircônia Negra' | 'Sem Pedra';

export interface ProductVariation {
  id: string;
  name: string; // Ex: Aro 14, Aro 16, 45cm, 60cm
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  details: string[];
  price: number;
  promoPrice?: number;
  stock: number;
  category: string;
  collection?: string;
  material: ProductMaterial;
  stone: ProductStone;
  plating: string; // Ex: 10 milésimos de ouro 18k
  warranty: string; // Ex: 1 ano de garantia no banho
  images: string[];
  variations: ProductVariation[];
  featured?: boolean;
  isNew?: boolean;
  bestSeller?: boolean;
  active: boolean;
  rating: number;
  reviewCount: number;
  weightGrams?: number;
  costPrice?: number;
  wholesalePrice?: number;
  minStock?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  itemCount: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  bannerImage?: string;
  tag: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariation?: string;
  selectedWarranty?: string; // Ex: '6 meses' | '1 ano'
}

export type OrderStatus = 'aguardando' | 'pago' | 'separacao' | 'enviado' | 'entregue' | 'cancelado';
export type PaymentMethod = 'pix' | 'cartao' | 'boleto';

export interface ShippingAddress {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  company: string;
  price: number;
  days: number;
  freeShippingApplied?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  variation?: string;
  warranty?: string; // Ex: '6 meses' | '1 ano'
}

export interface Order {
  id: string;
  orderNumber: string; // Ex: #CIT-8201
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  items: OrderItem[];
  subtotal: number;
  shippingPrice: number;
  shippingMethod: string;
  discountPrice: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  installments?: number;
  pixCode?: string;
  pixQrCode?: string;
  trackingCode?: string;
  shippingAddress: ShippingAddress;
  notes?: string;
}

export type CustomerType = 'PF' | 'PJ';

export interface Customer {
  id: string;
  type: CustomerType;
  name: string; // or Razão Social
  fantasyName?: string;
  document: string; // CPF or CNPJ
  stateRegistration?: string; // Inscrição Estadual (PJ)
  email: string;
  phone: string;
  whatsapp: string;
  address: ShippingAddress;
  totalOrders: number;
  totalSpent: number;
  isB2BWholesale: boolean;
  b2bDiscountPct?: number;
  creditLimit?: number;
  createdAt: string;
  notes?: string;
  customerTag?: 'varejo' | 'atacado' | 'vip';
  orderCount?: number;
}

export interface FinancialEntry {
  id: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  status: 'pendente' | 'pago';
  dueDate: string;
}

export interface Receivable {
  id: string;
  orderId?: string;
  orderNumber?: string;
  customerName: string;
  description: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
}

export interface Payable {
  id: string;
  description: string;
  category: 'Fornecedor Banho' | 'Embalagens' | 'Matéria Prima' | 'Frete' | 'Marketing' | 'Impostos' | 'Aluguel' | 'Outros';
  beneficiary: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  paymentDate?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPct?: number;
  discountValue?: number;
  discountType?: 'percentage' | 'fixed';
  minPurchase: number;
  minOrderValue?: number;
  validUntil: string;
  expiryDate?: string;
  active: boolean;
  maxUses: number;
  currentUses: number;
  usedCount?: number;
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  tag: string;
  active: boolean;
  order: number;
}

export type AdminRole = 'admin' | 'financeiro' | 'operador';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  lastLogin: string;
}

export interface ReturnExchange {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  type: 'Troca' | 'Devolução';
  reason: string;
  status: 'Pendente' | 'Aprovado' | 'Recusado' | 'Concluído';
}
