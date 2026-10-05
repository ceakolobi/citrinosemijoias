// Supabase Edge Function: citrino-pagamento
// Recebe (1) o webhook da InfinitePay e (2) a confirmação da página de retorno da loja.
//
// Segurança (protocolo Antum):
// - NUNCA confia no conteúdo recebido. Para qualquer chamada, consulta a API oficial
//   /payment_check da InfinitePay com handle + order_nsu + transaction_nsu + slug.
//   Só se ela responder paid=true, e o valor pago cobrir o total do pedido, o pedido vira "pago".
// - A confirmação no banco é atômica e idempotente (citrino_confirmar_pagamento):
//   webhook + página de retorno chegando juntos não duplicam estoque nem certificado.
// - Códigos de certificado só são devolvidos para quem apresenta o mesmo transaction_nsu
//   do pagamento confirmado (dado que só o comprador recebe no redirecionamento).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const HANDLE = Deno.env.get('CITRINO_INFINITEPAY_HANDLE') || 'maria-daniel-4xs';
const SITE_URL = Deno.env.get('CITRINO_SITE_URL') || 'https://citrinosemijoias.com.br';
const ALLOWED_ORIGINS = new Set([
  'https://citrinosemijoias.com.br',
  'https://www.citrinosemijoias.com.br',
  'http://localhost:3000',
  'http://localhost:5173',
]);

const NSU_RE = /^CIT\d{6}-[2-9A-HJ-NP-Z]{6}$/;
const TOKEN_RE = /^[A-Za-z0-9_.:-]{1,100}$/;

function cors(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.has(origin) ? origin : SITE_URL,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function safeReceipt(u: unknown): string | null {
  if (typeof u !== 'string' || u.length > 300) return null;
  try {
    const url = new URL(u);
    return url.protocol === 'https:' && /(^|\.)infinitepay\.io$|(^|\.)infinitepay\.com\.br$/.test(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = { ...cors(origin), 'Content-Type': 'application/json' };
  const reply = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), { status, headers });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if (req.method !== 'POST') return reply(405, { success: false, message: 'Método não permitido' });

  try {
    const raw = await req.text();
    if (raw.length > 50_000) return reply(413, { success: false, message: 'payload grande demais' });
    let body: any;
    try { body = JSON.parse(raw); } catch { return reply(400, { success: false, message: 'JSON inválido' }); }

    const orderNsu = String(body?.order_nsu || '');
    const transactionNsu = String(body?.transaction_nsu || '');
    const slug = String(body?.slug || body?.invoice_slug || '');
    if (!NSU_RE.test(orderNsu) || !TOKEN_RE.test(transactionNsu) || !TOKEN_RE.test(slug)) {
      return reply(400, { success: false, message: 'parâmetros inválidos' });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false },
    });

    const { data: order } = await supabase
      .from('citrino_pedidos')
      .select('id,status,paid_at,payment,total_cents')
      .eq('order_nsu', orderNsu)
      .maybeSingle();
    if (!order) return reply(404, { success: false, message: 'pedido não encontrado' });

    const certsFor = async () => {
      const { data } = await supabase
        .from('citrino_certificados').select('code,warranty').eq('pedido_id', order.id).order('warranty');
      return (data || []).map((c: any) => c.code);
    };

    // Já confirmado antes: responde sem consultar de novo
    if (order.paid_at) {
      const sameTx = order.payment?.transaction_nsu === transactionNsu;
      return reply(200, { success: true, message: null, status: order.status, certificados: sameTx ? await certsFor() : [] });
    }

    // Fonte da verdade: API oficial da InfinitePay
    const check = await fetch('https://api.checkout.infinitepay.io/payment_check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: HANDLE, order_nsu: orderNsu, transaction_nsu: transactionNsu, slug }),
      signal: AbortSignal.timeout(15_000),
    });
    const result: any = await check.json().catch(() => ({}));

    if (!check.ok || result?.success !== true || result?.paid !== true) {
      // 400 faz a InfinitePay tentar o webhook de novo mais tarde
      return reply(400, { success: false, message: 'pagamento não confirmado', status: 'aguardando' });
    }

    const paidCents = Number(result.paid_amount ?? result.amount);
    const payment = {
      transaction_nsu: transactionNsu,
      slug,
      capture_method: typeof result.capture_method === 'string' ? result.capture_method.slice(0, 20) : null,
      installments: Number.isInteger(result.installments) ? result.installments : null,
      amount: Number(result.amount) || null,
      paid_amount: paidCents || null,
      receipt_url: safeReceipt(body?.receipt_url),
      confirmed_via: body?.invoice_slug ? 'webhook' : 'retorno',
    };

    const { data: conf, error } = await supabase.rpc('citrino_confirmar_pagamento', {
      p_order_nsu: orderNsu,
      p_payment: payment,
      p_paid_cents: paidCents,
    });
    if (error) {
      console.error('confirmar_pagamento falhou', orderNsu, error.message);
      return reply(400, { success: false, message: 'divergência no pagamento; verificação manual necessária' });
    }
    const row = Array.isArray(conf) ? conf[0] : conf;
    return reply(200, { success: true, message: null, status: row?.status || 'pago', certificados: row?.codigos || [] });
  } catch (e: any) {
    console.error('citrino-pagamento erro', e?.message);
    return reply(500, { success: false, message: 'erro interno' });
  }
});
