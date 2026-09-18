// Supabase Edge Function: enviar-email
// Envia confirmação de pedido, código de rastreio e comprovante de compra

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order, type } = await req.json();

    if (!order || !order.customerEmail) {
      throw new Error('Dados do pedido incompletos.');
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const emailHtml = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #1c1c1c; background: #FAF8F4; padding: 32px; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #C9A84C; padding-bottom: 20px;">
          <h1 style="color: #C9A84C; letter-spacing: 2px; margin: 0; font-size: 28px;">CITRINO SEMIJOIAS</h1>
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-top: 6px;">Joalheria Contemporânea & Sofisticação</p>
        </div>

        <div style="padding: 24px 0;">
          <h2 style="font-size: 20px; color: #1c1c1c;">Olá, ${order.customerName}!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #444;">
            ${type === 'tracking' 
              ? `Seu pedido <strong>${order.orderNumber}</strong> foi despachado! Código de rastreio: <strong>${order.trackingCode || 'Disponível em breve'}</strong>.`
              : `Recebemos com sucesso o seu pedido <strong>${order.orderNumber}</strong>. Nossas artesãs já estão preparando suas joias com todo o carinho e cuidado.`}
          </p>

          <div style="background: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #eee; margin: 20px 0;">
            <h3 style="margin-top: 0; font-size: 16px; color: #C9A84C;">Resumo do Pedido (${order.orderNumber})</h3>
            <ul style="padding-left: 20px; color: #555; font-size: 14px;">
              ${order.items.map((item: any) => `<li>${item.quantity}x ${item.name} ${item.variation ? `(${item.variation})` : ''} - R$ ${Number(item.price * item.quantity).toFixed(2)}</li>`).join('')}
            </ul>
            <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
            <p style="margin: 4px 0; font-size: 14px;"><strong>Subtotal:</strong> R$ ${Number(order.subtotal).toFixed(2)}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Frete (${order.shippingMethod}):</strong> R$ ${Number(order.shippingPrice).toFixed(2)}</p>
            ${order.discountPrice > 0 ? `<p style="margin: 4px 0; font-size: 14px; color: #E8705A;"><strong>Desconto:</strong> - R$ ${Number(order.discountPrice).toFixed(2)}</p>` : ''}
            <p style="margin: 10px 0 0 0; font-size: 18px; color: #1c1c1c;"><strong>Total: R$ ${Number(order.total).toFixed(2)}</strong></p>
          </div>

          <p style="font-size: 13px; color: #777;">
            <strong>Endereço de Entrega:</strong><br>
            ${order.shippingAddress?.logradouro}, ${order.shippingAddress?.numero} - ${order.shippingAddress?.bairro}<br>
            ${order.shippingAddress?.cidade}/${order.shippingAddress?.uf} - CEP: ${order.shippingAddress?.cep}
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://wa.me/5511999998888?text=Ola,%20gostaria%20de%20tirar%20uma%20duvida%20sobre%20meu%20pedido%20${order.orderNumber}" 
               style="background: #C9A84C; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block;">
               Falar no WhatsApp
            </a>
          </div>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 12px; color: #999;">
          Citrino Semijoias &copy; Todos os direitos reservados.<br>
          Garantia de 1 ano no banho de ouro 18k e prata 925. Níquel free e hipoalergênico.
        </div>
      </div>
    `;

    // Se chave do Resend estiver configurada, dispara email real
    if (resendApiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Citrino Semijoias <pedidos@citrinosemijoias.com.br>',
          to: [order.customerEmail],
          subject: type === 'tracking' ? `Seu pedido ${order.orderNumber} está a caminho!` : `Confirmação do Pedido ${order.orderNumber} - Citrino Semijoias`,
          html: emailHtml,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true, simulated: !resendApiKey }), {
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
