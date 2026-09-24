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

// ─── Supprimer un coach ─────────────────────────────────────
export async function deleteCoach(id: string) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase.from('coaches').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/coachs');
  revalidatePath('/[locale]/coaches', 'layout');
}

// ─── Toggle actif ───────────────────────────────────────────
export async function toggleCoachActive(id: string, current: boolean) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('coaches')
    .update({ is_active: !current })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/coachs');
  revalidatePath('/[locale]/coaches', 'layout');
}

// ─── Toggle vedette ─────────────────────────────────────────
export async function toggleCoachFeatured(id: string, current: boolean) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('coaches')
    .update({ is_featured: !current })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/coachs');
  revalidatePath('/[locale]/coaches', 'layout');
}

// ─── Créer / Mettre à jour ──────────────────────────────────
export async function saveCoach(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  const profile = await getCurrentProfile();
  if (!profile || !['admin', 'league_manager'].includes(profile.role)) {
    return { error: 'Permissions insuffisantes.' };
  }

  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const slug = String(formData.get('slug') ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  if (!name || !slug) {
    return { error: 'Le nom et le slug sont obligatoires.' };
  }

  let career: any[] = [];
  try {
    career = JSON.parse(String(formData.get('career') ?? '[]'));
  } catch {
    career = [];
  }

  const payload: any = {
    name,
    slug,
    initials: String(formData.get('initials') ?? '').trim() || null,
    flag: String(formData.get('flag') ?? '').trim() || null,
    location: String(formData.get('location') ?? '').trim() || null,
    nationality_fr: String(formData.get('nationality_fr') ?? '').trim() || null,
    nationality_en: String(formData.get('nationality_en') ?? '').trim() || null,
    email: String(formData.get('email') ?? '').trim() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    whatsapp: String(formData.get('whatsapp') ?? '').trim() || null,
    role_fr: String(formData.get('role_fr') ?? '').trim() || null,
    role_en: String(formData.get('role_en') ?? '').trim() || null,
    specialties_fr: csv(formData.get('specialties_fr')),
    specialties_en: csv(formData.get('specialties_en')),
    bio_short_fr: String(formData.get('bio_short_fr') ?? '').trim() || null,
    bio_short_en: String(formData.get('bio_short_en') ?? '').trim() || null,
    bio_long_fr: String(formData.get('bio_long_fr') ?? '').trim() || null,
    bio_long_en: String(formData.get('bio_long_en') ?? '').trim() || null,
    philosophy_fr: String(formData.get('philosophy_fr') ?? '').trim() || null,
    philosophy_en: String(formData.get('philosophy_en') ?? '').trim() || null,
    experience_years: formData.get('experience_years')
      ? Number(formData.get('experience_years'))
      : null,
    certifications: csv(formData.get('certifications')),
    languages: csv(formData.get('languages')),
    career,
    social_instagram: String(formData.get('social_instagram') ?? '').trim() || null,
    social_linkedin: String(formData.get('social_linkedin') ?? '').trim() || null,
    social_twitter: String(formData.get('social_twitter') ?? '').trim() || null,
    photo_url: String(formData.get('photo_url') ?? '').trim() || null,
    cover_url: String(formData.get('cover_url') ?? '').trim() || null,
    is_featured: formData.get('is_featured') === 'on',
    is_active: formData.get('is_active') === 'on',
    region: String(formData.get('region') ?? 'both'),
    display_order: formData.get('display_order')
      ? Number(formData.get('display_order'))
      : 100
  };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from('coaches').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('coaches').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/coachs');
  revalidatePath('/[locale]/coaches', 'layout');
  redirect('/admin/coachs');
}