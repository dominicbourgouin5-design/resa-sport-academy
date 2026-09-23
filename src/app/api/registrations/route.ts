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

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}