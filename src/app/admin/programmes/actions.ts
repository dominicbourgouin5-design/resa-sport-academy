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

const csv = (v: any) =>
  String(v ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export async function deleteProgram(id: string) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase.from('training_programs').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/programmes');
  revalidatePath('/[locale]/private-training', 'layout');
}

export async function toggleProgramActive(id: string, current: boolean) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('training_programs')
    .update({ is_active: !current })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/programmes');
  revalidatePath('/[locale]/private-training', 'layout');
}

export async function saveProgram(
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

  if (!slug || !title_fr || !title_en) {
    return { error: 'Le slug, le titre FR et le titre EN sont obligatoires.' };
  }

  // Parse rates (JSON)
  let rates: any[] = [];
  try {
    rates = JSON.parse(String(formData.get('rates') ?? '[]'));
  } catch {
    rates = [];
  }

  const payload: any = {
    slug,
    title_fr,
    title_en,
    description_fr: String(formData.get('description_fr') ?? '').trim() || null,
    description_en: String(formData.get('description_en') ?? '').trim() || null,
    long_description_fr: String(formData.get('long_description_fr') ?? '').trim() || null,
    long_description_en: String(formData.get('long_description_en') ?? '').trim() || null,
    icon: String(formData.get('icon') ?? '').trim() || null,
    accent: String(formData.get('accent') ?? '').trim() || 'from-resa-navy to-resa-royal',
    duration_min: formData.get('duration_min') ? Number(formData.get('duration_min')) : null,
    group_size_min: formData.get('group_size_min') ? Number(formData.get('group_size_min')) : null,
    group_size_max: formData.get('group_size_max') ? Number(formData.get('group_size_max')) : null,
    price_fr: String(formData.get('price_fr') ?? '').trim() || null,
    price_en: String(formData.get('price_en') ?? '').trim() || null,
    highlights_fr: csv(formData.get('highlights_fr')),
    highlights_en: csv(formData.get('highlights_en')),
    rates,                          // ← NOUVEAU
    region: String(formData.get('region') ?? 'both'),
    display_order: formData.get('display_order') ? Number(formData.get('display_order')) : 100,
    is_active: formData.get('is_active') === 'on'
  };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from('training_programs').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('training_programs').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/programmes');
  revalidatePath('/[locale]/private-training', 'layout');
  redirect('/admin/programmes');
}