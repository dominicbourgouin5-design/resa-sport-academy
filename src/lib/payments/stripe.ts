// src/lib/payments/stripe.ts
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY ?? '';

export const stripe = new Stripe(secretKey);

// ─── Créer une session Stripe Checkout ──────────────────────
export async function createStripeSession(params: {
  amount: number;
  currency: string;               // 'XOF' | 'USD' | 'EUR'
  title: string;
  customerEmail: string;
  customerName: string;
  requestId: string;
  requestType: 'camp' | 'training';
  returnUrl: string;
  cancelUrl: string;
}) {
  // Stripe ne supporte pas XOF → on convertit en USD
  const isXOF = params.currency.toUpperCase() === 'XOF';
  const currency = isXOF ? 'usd' : params.currency.toLowerCase();
  const amountValue = isXOF
    ? Math.max(1, Math.round((params.amount / 600) * 100) / 100)
    : params.amount;

  const session = await stripe.checkout.sessions.create({
    // ⚠️ payment_method_types retiré : Managed Payments Stripe gère les méthodes
    customer_email: params.customerEmail,
    client_reference_id: params.requestId,
    metadata: {
      requestId: params.requestId,
      requestType: params.requestType,
      clientName: params.customerName
    },
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: params.title,
            description: `RESA Sport Academy — ${params.customerName}`
          },
          unit_amount: Math.round(amountValue * 100)
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${params.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: params.cancelUrl
  });

  return {
    sessionId: session.id,
    url: session.url
  };
}