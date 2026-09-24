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

// ─── Créer / mettre à jour un sponsor ───────────────────────
export async function saveSponsor(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  await requireRole(['admin', 'content_editor']);

  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  const tier = String(formData.get('tier') ?? 'official');
  const website_url = String(formData.get('website_url') ?? '').trim() || null;
  const description_fr = String(formData.get('description_fr') ?? '').trim() || null;
  const description_en = String(formData.get('description_en') ?? '').trim() || null;
  const logo_url = String(formData.get('logo_url') ?? '').trim() || null;
  const sort_order = Number(formData.get('sort_order') ?? 99);
  const is_active = formData.get('is_active') === 'on';

  if (!name || !slug) {
    return { error: 'Le nom et le slug sont obligatoires.' };
  }

  const validTiers = ['platinum', 'gold', 'silver', 'official'];
  if (!validTiers.includes(tier)) {
    return { error: 'Niveau invalide.' };
  }

  const supabase = await createClient();

const payload: any = {
  name,
  slug,
  tier,
  logo_url: String(formData.get('logo_url') ?? '').trim() || null,
  website_url: String(formData.get('website_url') ?? '').trim() || null,
  description_fr: String(formData.get('description_fr') ?? '').trim() || null,
  description_en: String(formData.get('description_en') ?? '').trim() || null,

  // ─── Nouveaux champs ───
  long_description_fr: String(formData.get('long_description_fr') ?? '').trim() || null,
  long_description_en: String(formData.get('long_description_en') ?? '').trim() || null,
  sector_fr: String(formData.get('sector_fr') ?? '').trim() || null,
  sector_en: String(formData.get('sector_en') ?? '').trim() || null,
  since_year: formData.get('since_year') ? Number(formData.get('since_year')) : null,
  social_linkedin: String(formData.get('social_linkedin') ?? '').trim() || null,
  social_instagram: String(formData.get('social_instagram') ?? '').trim() || null,
  social_facebook: String(formData.get('social_facebook') ?? '').trim() || null,
  social_twitter: String(formData.get('social_twitter') ?? '').trim() || null,

  sort_order: formData.get('sort_order') ? Number(formData.get('sort_order')) : 99,
  is_active: formData.get('is_active') === 'on'
};

  if (id) {
    const { error } = await supabase.from('sponsors').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('sponsors').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/sponsors');
  revalidatePath('/[locale]/sponsors', 'layout');
  redirect('/admin/sponsors');
}

// ─── Supprimer un sponsor ───────────────────────────────────
export async function deleteSponsor(id: string) {
  await requireRole(['admin', 'content_editor']);
  const supabase = await createClient();
  const { error } = await supabase.from('sponsors').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/sponsors');
  revalidatePath('/[locale]/sponsors', 'layout');
}

// ─── Activer / désactiver ───────────────────────────────────
export async function toggleSponsorActive(id: string, current: boolean) {
  await requireRole(['admin', 'content_editor']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('sponsors')
    .update({ is_active: !current })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/sponsors');
  revalidatePath('/[locale]/sponsors', 'layout');
}