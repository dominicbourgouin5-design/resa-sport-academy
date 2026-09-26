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

  // ✅ Metadata à propager sur TOUS les objets Stripe
  // (session, payment_intent, charge) pour que les webhooks
  // `charge.failed` et `payment_intent.payment_failed` puissent
  // identifier la demande (training/camp) concernée.
  const sharedMetadata = {
    requestId: params.requestId,
    requestType: params.requestType,
    clientName: params.customerName
  };

  const session = await stripe.checkout.sessions.create({
    customer_email: params.customerEmail,
    client_reference_id: params.requestId,
    // ⚠️ Désactive Managed Payments : indispensable pour les événements/formations en présentiel
    // Permet d'éviter l'obligation d'un tax_code digital
    managed_payments: { enabled: false } as any,
    metadata: sharedMetadata,
    // ✅ AJOUT : propage les metadata au PaymentIntent + au Charge
    payment_intent_data: {
      metadata: sharedMetadata
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