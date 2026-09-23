import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation minimale
    const type = body.type;
    if (!['school', 'individual'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (!body.contact_name || !body.contact_phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'school' && (!body.school_name || !body.school_city)) {
      return NextResponse.json({ error: 'Missing school info' }, { status: 400 });
    }

    if (type === 'individual' && !body.player_first_name) {
      return NextResponse.json({ error: 'Missing player info' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        type,
        status: 'pending',
        contact_name: body.contact_name,
        contact_phone: body.contact_phone,
        contact_email: body.contact_email ?? null,
        message: body.message ?? null,
        school_name: body.school_name ?? null,
        school_city: body.school_city ?? null,
        category_codes: body.category_codes ?? null,
        player_first_name: body.player_first_name ?? null,
        player_birth_date: body.player_birth_date ?? null,
        player_position: body.player_position ?? null
      })
      .select()
      .single();


          if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 📧 Envoi des emails (asynchrone, ne bloque pas la réponse)
    try {
      const { sendEmail } = await import('@/lib/email');
      const {
        schoolRegistrationConfirmation,
        individualRegistrationConfirmation,
        adminNewRegistrationNotification
      } = await import('@/lib/email-templates');

      // 1. Email de confirmation au demandeur (si email fourni)
      if (body.contact_email) {
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

      // 2. Notification admin (à l'adresse admin définie)
      const adminEmail = process.env.BREVO_SENDER_EMAIL;
      if (adminEmail) {
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
    } catch (emailErr) {
      console.error('Email error:', emailErr);
      // On ne bloque pas la réponse si l'email échoue
    }

    return NextResponse.json({ ok: true, id: data.id });

  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}