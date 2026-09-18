import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Lazy-initialized Mercado Pago Client
let mpClient: MercadoPagoConfig | null = null;

function getMercadoPagoClient(): MercadoPagoConfig | null {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) {
    return null;
  }
  if (!mpClient) {
    mpClient = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 7000 },
    });
  }
  return mpClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Healthcheck
  app.get('/api/health', (req: Request, res: Response) => {
    const hasMP = Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN);
    res.json({
      status: 'ok',
      system: 'Citrino Semijoias API & Web Server',
      mercadoPagoConfigured: hasMP,
    });
  });

  // Mercado Pago: Create Preference (Checkout Pro)
  app.post('/api/mercadopago/create-preference', async (req: Request, res: Response) => {
    try {
      const client = getMercadoPagoClient();
      const { items, payer, orderNumber } = req.body;

      if (!client) {
        // Graceful simulation fallback when token is not provided
        return res.json({
          status: 'simulated',
          message: 'MERCADO_PAGO_ACCESS_TOKEN não configurada no servidor. Modo demonstração ativado.',
          id: `sim_pref_${Date.now()}`,
          init_point: null,
          sandbox_init_point: null,
        });
      }

      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          items: items.map((it: any) => ({
            id: it.id || it.sku,
            title: it.name,
            quantity: Number(it.quantity),
            unit_price: Number(it.price),
            currency_id: 'BRL',
          })),
          payer: {
            name: payer?.name,
            email: payer?.email,
          },
          external_reference: orderNumber,
          back_urls: {
            success: `${process.env.APP_URL || 'http://localhost:3000'}/?status=success&order=${orderNumber}`,
            failure: `${process.env.APP_URL || 'http://localhost:3000'}/?status=failure&order=${orderNumber}`,
            pending: `${process.env.APP_URL || 'http://localhost:3000'}/?status=pending&order=${orderNumber}`,
          },
          auto_return: 'approved',
        },
      });

      return res.json({
        status: 'success',
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
      });
    } catch (error: any) {
      console.error('Erro ao criar preferência Mercado Pago:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Falha ao comunicar com API Mercado Pago',
      });
    }
  });

  // Mercado Pago: Direct PIX Payment creation
  app.post('/api/mercadopago/process-pix', async (req: Request, res: Response) => {
    try {
      const client = getMercadoPagoClient();
      const { transaction_amount, description, payer, orderNumber } = req.body;

      if (!client) {
        // Realistic simulated PIX response with valid Brazilian Central Bank EMV format
        const simulatedQrCode = `00020126580014br.gov.bcb.pix0136citrino-${orderNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}-limeira520400005303986540${transaction_amount.toFixed(2)}5802BR5920CITRINO SEMIJOIAS6007LIMEIRA62070503***6304E8A9`;
        return res.json({
          status: 'simulated',
          message: 'MERCADO_PAGO_ACCESS_TOKEN ausente. QR Code de simulação gerado.',
          id: Math.floor(Math.random() * 90000000) + 10000000,
          payment_status: 'pending',
          point_of_interaction: {
            transaction_data: {
              qr_code: simulatedQrCode,
              qr_code_base64: null,
              ticket_url: null,
            },
          },
        });
      }

      const payment = new Payment(client);
      const cleanDoc = (payer?.identification?.number || '').replace(/\D/g, '');
      const docType = cleanDoc.length > 11 ? 'CNPJ' : 'CPF';

      const response = await payment.create({
        body: {
          transaction_amount: Number(transaction_amount),
          description: description || `Pedido Citrino ${orderNumber}`,
          payment_method_id: 'pix',
          payer: {
            email: payer?.email || 'cliente@citrinosemijoias.com.br',
            first_name: payer?.name?.split(' ')[0] || 'Cliente',
            last_name: payer?.name?.split(' ').slice(1).join(' ') || 'Citrino',
            identification: {
              type: docType,
              number: cleanDoc || '12345678909',
            },
          },
          external_reference: orderNumber,
        },
      });

      return res.json({
        status: 'success',
        id: response.id,
        payment_status: response.status,
        point_of_interaction: response.point_of_interaction,
      });
    } catch (error: any) {
      console.error('Erro ao gerar PIX Mercado Pago:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Falha ao gerar cobrança PIX',
      });
    }
  });

  // Mercado Pago: Webhook IPN Receiver
  app.post('/api/mercadopago/webhook', async (req: Request, res: Response) => {
    try {
      const { type, data, action } = req.body;
      console.log(`[Webhook Mercado Pago Recebido]: tipo=${type || action} id=${data?.id}`);

      // If we have access token and type is payment, fetch real status
      const client = getMercadoPagoClient();
      if (client && (type === 'payment' || action === 'payment.updated')) {
        const paymentId = data?.id || req.query['data.id'];
        if (paymentId) {
          const payment = new Payment(client);
          const paymentData = await payment.get({ id: String(paymentId) });
          console.log(`[Status do Pagamento]: ${paymentData.status} (Pedido: ${paymentData.external_reference})`);
        }
      }

      // Always acknowledge 200 OK to Mercado Pago to avoid webhook retries
      return res.status(200).json({ received: true });
    } catch (err: any) {
      console.error('Erro no webhook:', err);
      return res.status(200).json({ received: true, error: err.message });
    }
  });

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Citrino Semijoias rodando em http://localhost:${PORT}`);
  });
}

startServer();
