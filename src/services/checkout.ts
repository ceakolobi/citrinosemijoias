// Checkout real (InfinitePay) e certificados de garantia.
// O navegador só envia "o quê e quantos"; preço, frete e total são calculados no servidor.
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient';
import type { CartItem, ShippingAddress } from '../types';

// Mesmas regras do servidor (citrino-checkout). Valores vêm de Configurações → Frete no painel.
const num = (v: any, def: number, min: number, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : def;
};
export const SHIPPING_OPTIONS = (subtotal: number, cs: Record<string, any> = {}) => {
  const freeFrom = num(cs.freeShippingThreshold, 299, 0, 100000);
  const free = freeFrom > 0 && subtotal >= freeFrom;
  const list = [
    { id: 'pac', name: 'Correios PAC', price: free ? 0 : num(cs.shippingPacPrice, 22.9, 0, 500), days: num(cs.shippingPacDays, 5, 1, 60), free, on: true },
    { id: 'sedex', name: 'Correios SEDEX', price: num(cs.shippingSedexPrice, 34.5, 0, 500), days: num(cs.shippingSedexDays, 2, 1, 60), free: false, on: cs.shippingSedexOn !== false },
    { id: 'jadlog', name: 'Jadlog', price: num(cs.shippingJadlogPrice, 19.9, 0, 500), days: num(cs.shippingJadlogDays, 4, 1, 60), free: false, on: cs.shippingJadlogOn !== false },
  ];
  return list.filter((o) => o.on);
};

async function callFunction<T>(name: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Sem conexão com o servidor. Confira a internet e tente de novo.');
  }
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json?.error || json?.message || 'Erro inesperado.'), { status: res.status, body: json });
  return json as T;
}

export interface CheckoutInput {
  customer: { name: string; email: string; phone: string; cpf: string };
  address: ShippingAddress;
  shippingId: string;
  cart: CartItem[];
}

export async function startCheckout(input: CheckoutInput) {
  return callFunction<{ order_nsu: string; url: string; total_cents: number }>('citrino-checkout', {
    customer: input.customer,
    address: input.address,
    shippingId: input.shippingId,
    items: input.cart.map((c) => ({
      productId: c.product.id,
      quantity: c.quantity,
      variation: c.selectedVariation || undefined,
      warranty: c.selectedWarranty === '1 ano' ? '1 ano' : '6 meses',
    })),
  });
}

export type PaymentResult = { success: boolean; status?: string; certificados?: string[]; message?: string | null };

export async function confirmPayment(params: { order_nsu: string; transaction_nsu: string; slug: string; receipt_url?: string }) {
  try {
    return await callFunction<PaymentResult>('citrino-pagamento', params);
  } catch (e: any) {
    if (e?.status === 400 && e?.body?.status === 'aguardando') {
      return { success: false, status: 'aguardando' } as PaymentResult;
    }
    throw e;
  }
}

export interface PublicCertificate {
  code: string;
  cliente: string;
  itens: string[];
  garantia: string;
  data_compra: string;
  valido_ate: string;
  situacao: 'valido' | 'expirado' | 'cancelado';
  pecas?: PublicPiece[];
}

export interface PublicPiece {
  name: string;
  variation?: string | null;
  quantity: number;
  image?: string | null;
  unit_cents?: number | null;
}

export const CERT_CODE_RE = /^CIT-[2-9A-HJ-NP-Z]{5}-[2-9A-HJ-NP-Z]{5}$/;

export async function verifyCertificate(code: string): Promise<PublicCertificate | null> {
  const clean = code.trim().toUpperCase();
  if (!CERT_CODE_RE.test(clean)) return null;
  const { data, error } = await supabase.rpc('citrino_verificar_certificado', { p_code: clean });
  if (error) throw new Error('Não foi possível consultar agora. Tente de novo.');
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  // Foto e preço das peças (se falhar, a página continua mostrando só os nomes)
  let pecas: PublicPiece[] | undefined;
  try {
    const r = await supabase.rpc('citrino_certificado_pecas', { p_code: clean });
    if (!r.error && Array.isArray(r.data)) pecas = r.data as PublicPiece[];
  } catch { /* segue sem fotos */ }
  return { ...(row as PublicCertificate), pecas };
}

export const certificateUrl = (code: string) =>
  `${typeof window !== 'undefined' ? window.location.origin : 'https://citrinosemijoias.com.br'}/garantia/${encodeURIComponent(code)}`;

export const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatDateBR = (iso: string) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
};
