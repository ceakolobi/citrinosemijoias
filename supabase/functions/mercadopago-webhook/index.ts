// Supabase Edge Function: mercadopago-webhook
// Recebe notificações IPN/Webhook do Mercado Pago e atualiza status do pedido e financeiro

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')!;

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    // ID do pagamento recebido na notificação
    const paymentId = body?.data?.id || url.searchParams.get('id') || body?.id;

    if (!paymentId) {
      return new Response(JSON.stringify({ message: 'No payment ID provided' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Consulta status real na API do Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${mpAccessToken}`,
      },
    });

    if (!mpResponse.ok) {
      throw new Error(`Mercado Pago error: ${mpResponse.statusText}`);
    }

    const paymentData = await mpResponse.json();
    const externalReference = paymentData.external_reference; // Ex: #CIT-8201
    const status = paymentData.status; // 'approved', 'pending', 'rejected', etc.

    if (externalReference) {
      let orderStatus = 'aguardando';
      let isPaid = false;

      if (status === 'approved') {
        orderStatus = 'pago';
        isPaid = true;
      } else if (status === 'cancelled' || status === 'rejected') {
        orderStatus = 'cancelado';
      }

      // 1. Atualiza o status do pedido
      const { data: updatedOrder, error: orderErr } = await supabase
        .from('pedidos')
        .update({
          status: orderStatus,
          dados_pagamento: paymentData,
          updated_at: new Date().toISOString(),
        })
        .eq('numero_pedido', externalReference)
        .select()
        .single();

      if (orderErr) console.error('Erro ao atualizar pedido:', orderErr);

      // 2. Se aprovado, lança/baixa em contas a receber
      if (isPaid && updatedOrder) {
        await supabase
          .from('contas_receber')
          .update({
            pago: true,
            data_pagamento: new Date().toISOString().split('T')[0],
          })
          .eq('pedido_id', updatedOrder.id);
      }
    }

    return new Response(JSON.stringify({ success: true, paymentId, status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
