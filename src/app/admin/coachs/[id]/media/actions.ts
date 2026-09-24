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

export async function deleteMedia(id: string, coachId: string) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase.from('coach_media').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/coachs/${coachId}/media`);
  revalidatePath('/[locale]/roger-sampah', 'layout');
}

export async function saveMedia(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  const profile = await getCurrentProfile();
  if (!profile || !['admin', 'league_manager'].includes(profile.role)) {
    return { error: 'Permissions insuffisantes.' };
  }

  const id         = String(formData.get('id') ?? '').trim();
  const coach_id   = String(formData.get('coach_id') ?? '').trim();
  const media_type = String(formData.get('media_type') ?? 'photo');
  const url        = String(formData.get('url') ?? '').trim();

  if (!coach_id || !url) {
    return { error: 'Le fichier / URL est obligatoire.' };
  }

  const payload: any = {
    coach_id,
    media_type,
    url,
    thumbnail_url: String(formData.get('thumbnail_url') ?? '').trim() || null,
    caption_fr: String(formData.get('caption_fr') ?? '').trim() || null,
    caption_en: String(formData.get('caption_en') ?? '').trim() || null,
    display_order: formData.get('display_order')
      ? Number(formData.get('display_order'))
      : 100,
    is_active: formData.get('is_active') === 'on'
  };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from('coach_media').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('coach_media').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath(`/admin/coachs/${coach_id}/media`);
  revalidatePath('/[locale]/roger-sampah', 'layout');
  return { ok: true };
}