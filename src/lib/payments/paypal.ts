// src/lib/payments/paypal.ts
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  CheckoutPaymentIntent
} from '@paypal/paypal-server-sdk';

const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET ?? '';
const ENV = process.env.PAYPAL_ENV ?? 'sandbox';

function getClient() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('PayPal credentials manquantes dans .env.local');
  }
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: CLIENT_ID,
      oAuthClientSecret: CLIENT_SECRET
    },
    environment: ENV === 'live' ? Environment.Production : Environment.Sandbox,
    timeout: 0,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: { logBody: true },
      logResponse: { logHeaders: true }
    }
  });
}

// ─── Créer une commande PayPal ──────────────────────────────
export async function createPayPalOrder(params: {
  amount: number;
  currency: string;
  description: string;
  referenceId: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; approveUrl: string }> {
  const client = getClient();
  const ordersController = new OrdersController(client);

  const { result } = await ordersController.createOrder({
    prefer: 'return=representation',
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          referenceId: params.referenceId,
          description: params.description,
          amount: {
            currencyCode: params.currency,
            value: params.amount.toFixed(2)
          }
        }
      ],
      paymentSource: {
        paypal: {
          experienceContext: {
            returnUrl: params.returnUrl,
            cancelUrl: params.cancelUrl,
            brandName: 'RESA Sport Academy'
          }
        }
      }
    }
  });

  const approveLink = result.links?.find(
    (l) => l.rel === 'approve' || l.rel === 'payer-action'
  );

  if (!approveLink?.href) {
    throw new Error("URL d'approbation PayPal introuvable");
  }

  return {
    id: result.id!,
    approveUrl: approveLink.href
  };
}

// ─── Capturer une commande PayPal ───────────────────────────
export async function capturePayPalOrder(orderId: string): Promise<{
  status: string;
  captureId?: string;
  referenceId?: string;
}> {
  const client = getClient();
  const ordersController = new OrdersController(client);

  const { result } = await ordersController.captureOrder({
    id: orderId,
    prefer: 'return=representation'
  });

  const capture = result.purchaseUnits?.[0]?.payments?.captures?.[0];

  return {
    status: result.status ?? 'unknown',
    captureId: capture?.id,
    referenceId: result.purchaseUnits?.[0]?.referenceId
  };
}