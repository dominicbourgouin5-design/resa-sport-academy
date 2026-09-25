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

// ─── Supprimer une école ────────────────────────────────────
export async function deleteSchool(id: string) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase.from('schools').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/ecoles');
  revalidatePath('/[locale]/ecoles', 'layout');
}

// ─── Activer / désactiver ───────────────────────────────────
export async function toggleSchoolActive(id: string, current: boolean) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('schools')
    .update({ is_active: !current })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/ecoles');
}

// ─── Créer / mettre à jour une école ────────────────────────
export async function saveSchool(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  const profile = await getCurrentProfile();
  if (!profile || !['admin', 'league_manager'].includes(profile.role)) {
    return { error: 'Permissions insuffisantes.' };
  }

  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  const city = String(formData.get('city') ?? '').trim() || null;
  const district = String(formData.get('district') ?? '').trim() || null;
  const contact_name = String(formData.get('contact_name') ?? '').trim() || null;
  const contact_phone = String(formData.get('contact_phone') ?? '').trim() || null;
  const contact_email = String(formData.get('contact_email') ?? '').trim() || null;
  const description_fr = String(formData.get('description_fr') ?? '').trim() || null;
  const description_en = String(formData.get('description_en') ?? '').trim() || null;
  const logo_url = String(formData.get('logo_url') ?? '').trim() || null;
  const is_active = formData.get('is_active') === 'on';

  if (!name || !slug) {
    return { error: 'Le nom et le slug sont obligatoires.' };
  }

  const supabase = await createClient();
  const payload: any = {
    name, slug, city, district,
    contact_name, contact_phone, contact_email,
    description_fr, description_en,
    logo_url,
    is_active
  };

  if (id) {
    const { error } = await supabase.from('schools').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('schools').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/ecoles');
  revalidatePath('/[locale]/ecoles', 'layout');
  redirect('/admin/ecoles');
}



// ═══════════════════════════════════════════════════════════
// FORFAIT GÉNÉRAL — Règle des 3 forfaits
// ═══════════════════════════════════════════════════════════
export async function declareGeneralForfeit(
  schoolId: string,
  seasonId: string
): Promise<{ ok?: boolean; matches_affected?: number; error?: string }> {
  try {
    await requireRole(['admin']);

    const supabase = await createClient();

    // Appel de la fonction SQL (SECURITY DEFINER)
    const { data, error } = await supabase.rpc('declare_general_forfeit', {
      p_school_id: schoolId,
      p_season_id: seasonId
    });

    if (error) {
      console.error('[Forfait général] RPC error:', error);
      return { error: error.message };
    }

    // Le retour est un jsonb { ok, matches_affected, categories_recalculated }
    const result: any = data;

    if (!result?.ok) {
      return { error: result?.error ?? 'Erreur lors du forfait général.' };
    }

    revalidatePath('/admin/ecoles');
    revalidatePath('/[locale]/ecoles', 'layout');
    revalidatePath('/[locale]/competition', 'layout');

    return {
      ok: true,
      matches_affected: result.matches_affected ?? 0
    };
  } catch (err: any) {
    return { error: err.message ?? 'Erreur inconnue' };
  }
}