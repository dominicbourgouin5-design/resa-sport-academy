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

export async function saveNews(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  const me = await requireRole(['admin', 'league_manager', 'content_editor']);

  const id = String(formData.get('id') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  const title_fr = String(formData.get('title_fr') ?? '').trim();
  const title_en = String(formData.get('title_en') ?? '').trim() || null;
  const excerpt_fr = String(formData.get('excerpt_fr') ?? '').trim() || null;
  const excerpt_en = String(formData.get('excerpt_en') ?? '').trim() || null;
  const body_fr = String(formData.get('body_fr') ?? '').trim();
  const body_en = String(formData.get('body_en') ?? '').trim() || null;
  const cover_image_url = String(formData.get('cover_image_url') ?? '').trim() || null;
  const is_published = formData.get('is_published') === 'on';

  if (!slug || !title_fr || !body_fr) {
    return { error: 'Titre (FR), slug et corps (FR) sont obligatoires.' };
  }

  const supabase = await createClient();
  const payload: any = {
    slug, title_fr, title_en, excerpt_fr, excerpt_en, body_fr, body_en,
    cover_image_url,
    is_published,
    published_at: is_published ? new Date().toISOString() : null
  };

  if (id) {
    const { error } = await supabase.from('news').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    payload.author_id = me.id;
    const { error } = await supabase.from('news').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/actualites');
  revalidatePath('/[locale]/actualites', 'layout');
  return { ok: true };
}

export async function toggleNewsPublished(id: string, current: boolean) {
  await requireRole(['admin', 'league_manager', 'content_editor']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('news')
    .update({
      is_published: !current,
      published_at: !current ? new Date().toISOString() : null
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/actualites');
  revalidatePath('/[locale]/actualites', 'layout');
}

export async function deleteNews(id: string) {
  await requireRole(['admin', 'league_manager', 'content_editor']);
  const supabase = await createClient();
  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/actualites');
  revalidatePath('/[locale]/actualites', 'layout');
}