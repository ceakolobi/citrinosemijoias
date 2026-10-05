// Checkout real (InfinitePay) e certificados de garantia.
// O navegador só envia "o quê e quantos"; preço, frete e total são calculados no servidor.
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient';
import type { CartItem, ShippingAddress } from '../types';

export const SHIPPING_OPTIONS = (subtotal: number, freeFrom: number) => {
  const free = subtotal >= freeFrom;
  return [
    { id: 'pac', name: 'Correios PAC', price: free ? 0 : 22.9, days: 5, free },
    { id: 'sedex', name: 'Correios SEDEX Express', price: free ? 12 : 34.5, days: 2, free: false },
    { id: 'jadlog', name: 'Jadlog Package', price: 19.9, days: 4, free: false },
  ];
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
}

export const CERT_CODE_RE = /^CIT-[2-9A-HJ-NP-Z]{5}-[2-9A-HJ-NP-Z]{5}$/;

export async function verifyCertificate(code: string): Promise<PublicCertificate | null> {
  const clean = code.trim().toUpperCase();
  if (!CERT_CODE_RE.test(clean)) return null;
  const { data, error } = await supabase.rpc('citrino_verificar_certificado', { p_code: clean });
  if (error) throw new Error('Não foi possível consultar agora. Tente de novo.');
  const row = Array.isArray(data) ? data[0] : data;
  return (row as PublicCertificate) || null;
}

export const certificateUrl = (code: string) =>
  `${typeof window !== 'undefined' ? window.location.origin : 'https://citrinosemijoias.com.br'}/garantia/${encodeURIComponent(code)}`;

export const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatDateBR = (iso: string) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
};
