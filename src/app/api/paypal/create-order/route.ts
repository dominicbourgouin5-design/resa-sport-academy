import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/payments/paypal';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, id, amount, currency, description } = body;

    if (!type || !id || !amount || !description) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const returnUrl = `${siteUrl}/fr/paiement/paypal/${type}/${id}`;
    const cancelUrl = `${siteUrl}/fr/paiement/paypal/${type}/${id}?cancelled=1`;

    const order = await createPayPalOrder({
      amount: Number(amount),
      currency: currency ?? 'USD',
      description,
      referenceId: id,
      returnUrl,
      cancelUrl
    });

    // Sauvegarder l'orderId en DB
    const supabase = createAdminClient();
    const table = type === 'camp' ? 'camp_registrations' : 'training_requests';
    await supabase
      .from(table)
      .update({
        payment_provider_id: order.id,
        payment_method: 'paypal'
      })
      .eq('id', id);

    return NextResponse.json({ orderId: order.id, approveUrl: order.approveUrl });
  } catch (err: any) {
    console.error('[PayPal create-order] Error:', err);
    return NextResponse.json(
      { error: err.message ?? 'Erreur serveur' },
      { status: 500 }
    );
  }
}