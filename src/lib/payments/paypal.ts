// src/lib/payments/paypal.ts
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  CheckoutPaymentIntent,
  PaypalExperienceLandingPage,
  PaypalExperienceUserAction
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

  // ⚠️ PayPal ne supporte pas le Franc CFA (XOF).
  // Si le montant fourni est en XOF, on le convertit automatiquement en EUR.
  const isXOF = params.currency.toUpperCase() === 'XOF';
  const currencyCode = isXOF ? 'EUR' : params.currency.toUpperCase();
  const amountValue = isXOF
    ? Math.max(1, Math.round((params.amount / 655.957) * 100) / 100).toFixed(2)
    : params.amount.toFixed(2);

  // Options pour forcer le paiement par carte sans compte (Guest Checkout)
  const landingPage =
    (PaypalExperienceLandingPage as any)?.GUEST_CHECKOUT ??
    (PaypalExperienceLandingPage as any)?.GuestCheckout ??
    'GUEST_CHECKOUT';

  const userAction =
    (PaypalExperienceUserAction as any)?.PAY_NOW ??
    (PaypalExperienceUserAction as any)?.PayNow ??
    'PAY_NOW';

  const { result } = await ordersController.createOrder({
    prefer: 'return=representation',
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          referenceId: params.referenceId,
          description: params.description,
          amount: {
            currencyCode,
            value: amountValue
          }
        }
      ],
      paymentSource: {
        paypal: {
          experienceContext: {
            returnUrl: params.returnUrl,
            cancelUrl: params.cancelUrl,
            brandName: 'RESA Sport Academy',
            locale: 'fr-FR',
            landingPage: landingPage as any,
            userAction: userAction as any
          }
        }
      }
    }
  });

  const approveLink = result.links?.find(
    (l) => l.rel === 'approve' || l.rel === 'payer-action'
  );

  if (!approveLink?.href) {
    throw new Error("URL d'approbation PayPal introuvable dans la réponse");
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