// Supabase Edge Function: citrino-checkout
// Cria o pedido real e o link de pagamento da InfinitePay.
//
// Segurança (protocolo Antum):
// - Preço, estoque, frete e total são calculados AQUI, a partir do banco. O navegador só manda
//   "quais produtos e quantos"; qualquer preço enviado por ele é ignorado.
// - Entrada validada campo a campo, tamanho do corpo limitado, CORS só para o domínio da loja.
// - Limite de 5 pedidos por IP a cada 10 minutos (contra abuso/spam de pedidos).
// - O pedido nasce "aguardando"; só a função citrino-pagamento, depois de conferir na
//   InfinitePay, marca como pago.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SITE_URL = Deno.env.get('CITRINO_SITE_URL') || 'https://citrinosemijoias.com.br';
const HANDLE = Deno.env.get('CITRINO_INFINITEPAY_HANDLE') || 'maria-daniel-4xs';
const IP_SALT = Deno.env.get('CITRINO_IP_SALT') || 'citrino';
const ALLOWED_ORIGINS = new Set([
  'https://citrinosemijoias.com.br',
  'https://www.citrinosemijoias.com.br',
  'http://localhost:3000',
  'http://localhost:5173',
]);

function cors(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.has(origin) ? origin : SITE_URL,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

class Bad extends Error {
  constructor(msg: string, public status = 400) { super(msg); }
}

const str = (v: unknown, field: string, min: number, max: number): string => {
  if (typeof v !== 'string') throw new Bad(`Campo inválido: ${field}`);
  const s = v.trim().replace(/[\u0000-\u001f\u007f<>]/g, '');
  if (s.length < min || s.length > max) throw new Bad(`Campo inválido: ${field}`);
  return s;
};
const digits = (v: unknown) => (typeof v === 'string' ? v.replace(/\D/g, '') : '');

function validCpf(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const len of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const d = ((sum * 10) % 11) % 10;
    if (d !== Number(cpf[len])) return false;
  }
  return true;
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function orderNsu() {
  const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const rnd = crypto.getRandomValues(new Uint8Array(6));
  const tail = Array.from(rnd).map((b) => alphabet[b % alphabet.length]).join('');
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  return `CIT${ymd}-${tail}`;
}

// Valores configurados pela loja em Configurações → Frete (citrino_docs content/company).
// Validados aqui: valor fora da faixa volta ao padrão.
const num = (v: any, def: number, min: number, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : def;
};
const SHIPPING = (subtotalCents: number, cs: Record<string, any> = {}) => {
  const freeFromCents = Math.round(num(cs.freeShippingThreshold, 299, 0, 100000) * 100);
  const free = freeFromCents > 0 && subtotalCents >= freeFromCents;
  const cents = (v: any, def: number) => Math.round(num(v, def, 0, 500) * 100);
  const out: Record<string, { id: string; name: string; cents: number; days: number }> = {
    pac: { id: 'pac', name: 'Correios PAC', cents: free ? 0 : cents(cs.shippingPacPrice, 22.9), days: num(cs.shippingPacDays, 5, 1, 60) },
  };
  if (cs.shippingSedexOn !== false) out.sedex = { id: 'sedex', name: 'Correios SEDEX', cents: cents(cs.shippingSedexPrice, 34.5), days: num(cs.shippingSedexDays, 2, 1, 60) };
  if (cs.shippingJadlogOn !== false) out.jadlog = { id: 'jadlog', name: 'Jadlog', cents: cents(cs.shippingJadlogPrice, 19.9), days: num(cs.shippingJadlogDays, 4, 1, 60) };
  return out;
};

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = { ...cors(origin), 'Content-Type': 'application/json' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405, headers });

  try {
    const raw = await req.text();
    if (raw.length > 20_000) throw new Bad('Pedido grande demais.', 413);
    let body: any;
    try { body = JSON.parse(raw); } catch { throw new Bad('JSON inválido.'); }

    // ---------- validação de entrada ----------
    const c = body?.customer || {};
    const name = str(c.name, 'nome', 3, 120);
    if (!/\s/.test(name)) throw new Bad('Informe nome e sobrenome.');
    const email = str(c.email, 'e-mail', 5, 120).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) throw new Bad('E-mail inválido.');
    const phone = digits(c.phone);
    if (phone.length < 10 || phone.length > 11) throw new Bad('Telefone inválido. Use DDD + número.');
    const cpf = digits(c.cpf);
    if (!validCpf(cpf)) throw new Bad('CPF inválido.');

    const a = body?.address || {};
    const cep = digits(a.cep);
    if (cep.length !== 8) throw new Bad('CEP inválido.');
    const address = {
      cep,
      logradouro: str(a.logradouro, 'endereço', 2, 120),
      numero: str(a.numero, 'número', 1, 10),
      complemento: a.complemento ? str(a.complemento, 'complemento', 0, 60) : '',
      bairro: str(a.bairro, 'bairro', 2, 80),
      cidade: str(a.cidade, 'cidade', 2, 80),
      uf: str(a.uf, 'UF', 2, 2).toUpperCase(),
    };
    if (!/^[A-Z]{2}$/.test(address.uf)) throw new Bad('UF inválida.');

    const shippingId = typeof body?.shippingId === 'string' ? body.shippingId : '';
    const reqItems = Array.isArray(body?.items) ? body.items : [];
    if (reqItems.length < 1 || reqItems.length > 30) throw new Bad('Carrinho vazio ou grande demais.');

    const wanted = reqItems.map((it: any, i: number) => {
      const productId = typeof it?.productId === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(it.productId) ? it.productId : null;
      const quantity = Number(it?.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Bad(`Item ${i + 1} inválido.`);
      const warranty = it?.warranty === '1 ano' ? '1 ano' : '6 meses';
      const variation = it?.variation ? str(it.variation, 'variação', 1, 60) : undefined;
      return { productId, quantity, warranty, variation };
    });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false },
    });

    // ---------- limite de abuso por IP ----------
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'desconhecido';
    const ipHash = await sha256(`${IP_SALT}:${ip}`);
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('citrino_pedidos')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since);
    if ((count || 0) >= 5) throw new Bad('Muitas tentativas. Aguarde alguns minutos e tente de novo.', 429);

    // ---------- preço e estoque vêm do banco ----------
    const ids = [...new Set(wanted.map((w: any) => w.productId))];
    const { data: rows, error: prodErr } = await supabase
      .from('citrino_docs')
      .select('id,data')
      .eq('collection', 'products')
      .in('id', ids);
    if (prodErr) throw new Error('Falha ao ler o catálogo.');
    const byId = new Map((rows || []).map((r: any) => [r.id, r.data]));

    const qtyPerProduct = new Map<string, number>();
    const items = wanted.map((w: any) => {
      const p = byId.get(w.productId);
      if (!p || String(p.active) === 'false') throw new Bad('Um dos produtos não está mais disponível. Atualize o carrinho.');
      const unit = Number(p.promoPrice) > 0 ? Number(p.promoPrice) : Number(p.price);
      if (!Number.isFinite(unit) || unit <= 0) throw new Bad(`Produto sem preço: ${p.name}`);
      if (w.variation && Array.isArray(p.variations) && p.variations.length > 0 &&
          !p.variations.some((v: any) => v?.name === w.variation)) {
        throw new Bad(`Variação inválida para ${p.name}.`);
      }
      qtyPerProduct.set(w.productId, (qtyPerProduct.get(w.productId) || 0) + w.quantity);
      return {
        productId: w.productId,
        name: String(p.name || 'Peça').slice(0, 120),
        sku: String(p.sku || '').slice(0, 40),
        image: Array.isArray(p.images) ? String(p.images[0] || '') : '',
        unit_cents: Math.round(unit * 100),
        quantity: w.quantity,
        variation: w.variation || null,
        warranty: w.warranty,
      };
    });
    for (const [pid, q] of qtyPerProduct) {
      const stock = Number(byId.get(pid)?.stock);
      if (Number.isFinite(stock) && q > stock) {
        throw new Bad(`Estoque insuficiente para ${byId.get(pid)?.name}. Disponível: ${Math.max(0, stock)}.`);
      }
    }

    const subtotal = items.reduce((s: number, it: any) => s + it.unit_cents * it.quantity, 0);
    const { data: company } = await supabase
      .from('citrino_docs').select('data').eq('collection', 'content').eq('id', 'company').maybeSingle();
    const ship = SHIPPING(subtotal, company?.data || {})[shippingId];
    if (!ship) throw new Bad('Escolha uma forma de envio.');
    const total = subtotal + ship.cents;

    // ---------- grava o pedido ----------
    const nsu = orderNsu();
    const { data: order, error: insErr } = await supabase
      .from('citrino_pedidos')
      .insert({
        order_nsu: nsu,
        customer: { name, email, phone, cpf },
        address,
        shipping: { id: ship.id, name: ship.name, cents: ship.cents, days: ship.days },
        items,
        subtotal_cents: subtotal,
        shipping_cents: ship.cents,
        total_cents: total,
        ip_hash: ipHash,
      })
      .select('id')
      .single();
    if (insErr || !order) throw new Error('Falha ao registrar o pedido.');

    // ---------- link de pagamento InfinitePay ----------
    const ipItems = items.map((it: any) => ({
      quantity: it.quantity,
      price: it.unit_cents,
      description: `${it.name}${it.variation ? ` (${it.variation})` : ''} - garantia ${it.warranty}`.slice(0, 100),
    }));
    if (ship.cents > 0) ipItems.push({ quantity: 1, price: ship.cents, description: `Frete - ${ship.name}` });

    const ipRes = await fetch('https://api.checkout.infinitepay.io/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle: HANDLE,
        order_nsu: nsu,
        redirect_url: `${SITE_URL}/pedido/retorno`,
        webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/citrino-pagamento`,
        items: ipItems,
        customer: { name, email, phone_number: `+55${phone}` },
        address: { cep, number: address.numero, complement: address.complemento || undefined },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const ipJson: any = await ipRes.json().catch(() => ({}));
    const url = typeof ipJson?.url === 'string' ? ipJson.url : '';
    if (!ipRes.ok || !url.startsWith('https://checkout.infinitepay.com.br/')) {
      console.error('InfinitePay links falhou', ipRes.status, JSON.stringify(ipJson).slice(0, 300));
      await supabase.from('citrino_pedidos').update({ status: 'cancelado', notes: 'Falha ao gerar link InfinitePay' }).eq('id', order.id);
      throw new Bad('Não foi possível gerar o pagamento agora. Tente de novo em instantes ou fale com a loja no WhatsApp.', 502);
    }
    await supabase.from('citrino_pedidos').update({ checkout_url: url }).eq('id', order.id);

    return new Response(JSON.stringify({ order_nsu: nsu, url, total_cents: total }), { status: 200, headers });
  } catch (e: any) {
    const status = e instanceof Bad ? e.status : 500;
    if (!(e instanceof Bad)) console.error('citrino-checkout erro', e?.message);
    const message = e instanceof Bad ? e.message : 'Erro inesperado. Tente novamente.';
    return new Response(JSON.stringify({ error: message }), { status, headers });
  }
});
