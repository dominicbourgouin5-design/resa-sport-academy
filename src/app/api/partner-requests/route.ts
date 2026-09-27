import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import {
  sendPartnerRequestConfirmationEmail,
  sendPartnerRequestAdminNotification
} from '@/lib/partner-request-emails';

function createServerClient() {
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation
    if (!body.company_name?.trim()) {
      return NextResponse.json({ error: 'Nom de l\'organisation obligatoire.' }, { status: 400 });
    }
    if (!body.contact_name?.trim()) {
      return NextResponse.json({ error: 'Nom du contact obligatoire.' }, { status: 400 });
    }
    if (!body.contact_email?.trim() || !/^\S+@\S+\.\S+$/.test(body.contact_email)) {
      return NextResponse.json({ error: 'Email valide obligatoire.' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('sponsor_requests')
      .insert({
        company_name: body.company_name.trim(),
        sector: body.sector?.trim() || null,
        contact_name: body.contact_name.trim(),
        contact_email: body.contact_email.trim().toLowerCase(),
        contact_phone: body.contact_phone?.trim() || null,
        country: body.country?.trim() || null,
        website_url: body.website_url?.trim() || null,
        partnership_type: body.partnership_type?.trim() || null,
        message: body.message?.trim() || null,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('[API /partner-requests] Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Emails + notifs (non bloquants)
    try {
      await sendPartnerRequestConfirmationEmail(data.id);
    } catch (err) {
      console.error('[API /partner-requests] Confirmation email error:', err);
    }

    try {
      await sendPartnerRequestAdminNotification(data.id);
    } catch (err) {
      console.error('[API /partner-requests] Admin notif error:', err);
    }

    return NextResponse.json({ ok: true, id: data.id });

  } catch (err: any) {
    console.error('[API /partner-requests] Global error:', err);
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}