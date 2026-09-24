'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function requireRole(allowed: string[]) {
  const profile = await getCurrentProfile();
  if (!profile || !allowed.includes(profile.role)) {
    throw new Error('Permissions insuffisantes');
  }
  return profile;
}

// ─── Supprimer ──────────────────────────────────────────────
export async function deleteCamp(id: string) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase.from('camps').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/camps');
  revalidatePath('/[locale]/camps', 'layout');
}

// ─── Toggle actif ───────────────────────────────────────────
export async function toggleCampActive(id: string, current: boolean) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('camps')
    .update({ is_active: !current })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/camps');
  revalidatePath('/[locale]/camps', 'layout');
}

// ─── Créer / mettre à jour ──────────────────────────────────
export async function saveCamp(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  const profile = await getCurrentProfile();
  if (!profile || !['admin', 'league_manager'].includes(profile.role)) {
    return { error: 'Permissions insuffisantes.' };
  }

  const id = String(formData.get('id') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  const title_fr = String(formData.get('title_fr') ?? '').trim();
  const title_en = String(formData.get('title_en') ?? '').trim();
  const date_start = String(formData.get('date_start') ?? '').trim();

  if (!slug || !title_fr || !title_en || !date_start) {
    return { error: 'Slug, titre FR, titre EN et date de début sont obligatoires.' };
  }

  const payload: any = {
    slug,
    type: String(formData.get('type') ?? 'camp'),
    title_fr,
    title_en,
    description_fr: String(formData.get('description_fr') ?? '').trim() || null,
    description_en: String(formData.get('description_en') ?? '').trim() || null,
    long_description_fr: String(formData.get('long_description_fr') ?? '').trim() || null,
    long_description_en: String(formData.get('long_description_en') ?? '').trim() || null,
    image_url: String(formData.get('image_url') ?? '').trim() || null,
    date_start,
    date_end: String(formData.get('date_end') ?? '').trim() || date_start,
    time_start: String(formData.get('time_start') ?? '').trim() || null,
    time_end: String(formData.get('time_end') ?? '').trim() || null,
    location: String(formData.get('location') ?? '').trim() || null,
    age_min: formData.get('age_min') ? Number(formData.get('age_min')) : null,
    age_max: formData.get('age_max') ? Number(formData.get('age_max')) : null,
    capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
    price_fr: String(formData.get('price_fr') ?? '').trim() || null,
    price_en: String(formData.get('price_en') ?? '').trim() || null,
    price_amount: formData.get('price_amount')
      ? Number(formData.get('price_amount'))
      : null,
    program_slug: String(formData.get('program_slug') ?? '').trim() || null,
    status: String(formData.get('status') ?? 'open'),
    region: String(formData.get('region') ?? 'both'),
    is_active: formData.get('is_active') === 'on',
    display_order: formData.get('display_order')
      ? Number(formData.get('display_order'))
      : 100
  };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from('camps').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('camps').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/camps');
  revalidatePath('/[locale]/camps', 'layout');
  redirect('/admin/camps');
}

// ─── Admin : mise à jour d'une inscription ──────────────────
export async function updateCampRegistration(
  id: string,
  patch: {
    status?: 'new' | 'contacted' | 'confirmed' | 'cancelled';
    payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
    admin_notes?: string;
  }
) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const payload: any = { ...patch };
  if (patch.payment_status === 'paid') {
    payload.paid_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from('camp_registrations')
    .update(payload)
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/camps');
}

// ─── Admin : suppression inscription ────────────────────────
export async function deleteCampRegistration(id: string) {
  await requireRole(['admin']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('camp_registrations')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/camps');
}