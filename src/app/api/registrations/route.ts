import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Client serveur sécurisé (utilise le service_role s'il existe, sinon la clé anon)
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
  console.log('[API /registrations] POST reçu');

  try {
    const body = await req.json();
    console.log('[API /registrations] Body:', {
      type: body.type,
      contact_name: body.contact_name,
      contact_email: body.contact_email,
      school_name: body.school_name
    });

    // Validation
    const type = body.type;
    if (!['school', 'individual'].includes(type)) {
      console.error('[API /registrations] Type invalide:', type);
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (!body.contact_name || !body.contact_phone) {
      console.error('[API /registrations] Champs obligatoires manquants');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'school' && (!body.school_name || !body.school_city)) {
      console.error('[API /registrations] Infos école manquantes');
      return NextResponse.json({ error: 'Missing school info' }, { status: 400 });
    }

    if (type === 'individual' && !body.player_first_name) {
      console.error('[API /registrations] Infos joueur manquantes');
      return NextResponse.json({ error: 'Missing player info' }, { status: 400 });
    }

    const supabase = createServerClient();
    console.log('[API /registrations] Insertion dans Supabase...');

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        type,
        status: 'pending',
        contact_name: body.contact_name,
        contact_phone: body.contact_phone,
        contact_email: body.contact_email || null,
        message: body.message || null,
        school_name: body.school_name || null,
        school_city: body.school_city || null,
        category_codes: body.category_codes && body.category_codes.length > 0 ? body.category_codes : null,
        player_first_name: body.player_first_name || null,
        player_birth_date: body.player_birth_date || null,
        player_position: body.player_position || null
      })
      .select()
      .single();

    if (error) {
      console.error('[API /registrations] ❌ Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API /registrations] ✅ Inscription créée avec succès, ID:', data.id);

    // 📧 Envoi des emails
    try {
      console.log('[API /registrations] Début envoi emails...');

      const { sendEmail } = await import('@/lib/email');
      const {
        schoolRegistrationConfirmation,
        individualRegistrationConfirmation,
        adminNewRegistrationNotification
      } = await import('@/lib/email-templates');

      // 1. Email de confirmation au demandeur
      if (body.contact_email) {
        console.log('[API /registrations] Envoi confirmation à:', body.contact_email);

        const template = type === 'school'
          ? schoolRegistrationConfirmation({
              contactName: body.contact_name,
              schoolName: body.school_name,
              categories: body.category_codes ?? []
            })
          : individualRegistrationConfirmation({
              contactName: body.contact_name,
              playerName: body.player_first_name,
              position: body.player_position
            });

        await sendEmail({
          to: [{ email: body.contact_email, name: body.contact_name }],
          subject: template.subject,
          htmlContent: template.htmlContent
        });
      }

      // 2. Notification admin
      const adminEmail = process.env.BREVO_SENDER_EMAIL;
      if (adminEmail) {
        console.log('[API /registrations] Envoi notification admin à:', adminEmail);

        const adminTemplate = adminNewRegistrationNotification({
          type,
          contactName: body.contact_name,
          contactPhone: body.contact_phone,
          contactEmail: body.contact_email,
          schoolName: body.school_name,
          playerName: body.player_first_name
        });

        await sendEmail({
          to: [{ email: adminEmail, name: 'Administration RESA' }],
          subject: adminTemplate.subject,
          htmlContent: adminTemplate.htmlContent
        });
      }
    } catch (emailErr: any) {
      console.error('[API /registrations] ⚠️ Erreur lors de l\'envoi de l\'email:', emailErr);
    }

    return NextResponse.json({ ok: true, id: data.id });

  } catch (err: any) {
    console.error('[API /registrations] ❌❌ Erreur globale:', err);
    return NextResponse.json({
      error: err.message ?? 'Unknown error'
    }, { status: 500 });
  }
}