'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireRole(allowed: string[]) {
  const profile = await getCurrentProfile();
  if (!profile || !allowed.includes(profile.role)) {
    throw new Error('Permissions insuffisantes');
  }
  return profile;
}

// ─── Supprimer ──────────────────────────────────────────────
export async function deleteTestimonial(id: string, coachId: string) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('coach_testimonials')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/coachs/${coachId}/temoignages`);
  revalidatePath('/[locale]/roger-sampah', 'layout');
  revalidatePath('/[locale]/coaches', 'layout');
}

// ─── Toggle featured ────────────────────────────────────────
export async function toggleTestimonialFeatured(
  id: string,
  current: boolean,
  coachId: string
) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('coach_testimonials')
    .update({ is_featured: !current })
    .eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/coachs/${coachId}/temoignages`);
  revalidatePath('/[locale]/roger-sampah', 'layout');
}

// ─── Créer / Mettre à jour ──────────────────────────────────
export async function saveTestimonial(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  const profile = await getCurrentProfile();
  if (!profile || !['admin', 'league_manager'].includes(profile.role)) {
    return { error: 'Permissions insuffisantes.' };
  }

  const id        = String(formData.get('id') ?? '').trim();
  const coach_id  = String(formData.get('coach_id') ?? '').trim();
  const author_name = String(formData.get('author_name') ?? '').trim();
  const content_fr  = String(formData.get('content_fr') ?? '').trim();

  if (!coach_id || !author_name || !content_fr) {
    return { error: 'Auteur et contenu FR sont obligatoires.' };
  }

  const payload: any = {
    coach_id,
    author_name,
    author_role_fr: String(formData.get('author_role_fr') ?? '').trim() || null,
    author_role_en: String(formData.get('author_role_en') ?? '').trim() || null,
    author_photo_url: String(formData.get('author_photo_url') ?? '').trim() || null,
    content_fr,
    content_en: String(formData.get('content_en') ?? '').trim() || null,
    rating: formData.get('rating') ? Number(formData.get('rating')) : null,
    is_featured: formData.get('is_featured') === 'on',
    display_order: formData.get('display_order')
      ? Number(formData.get('display_order'))
      : 100,
    is_active: formData.get('is_active') === 'on'
  };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase
      .from('coach_testimonials')
      .update(payload)
      .eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('coach_testimonials').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath(`/admin/coachs/${coach_id}/temoignages`);
  revalidatePath('/[locale]/roger-sampah', 'layout');
  revalidatePath('/[locale]/coaches', 'layout');
  return { ok: true };
}