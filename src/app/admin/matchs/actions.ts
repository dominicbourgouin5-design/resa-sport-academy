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

// ─── Créer / mettre à jour un match ─────────────────────────
export async function saveMatch(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  await requireRole(['admin', 'league_manager']);

  const id = String(formData.get('id') ?? '').trim();
  const season_id = String(formData.get('season_id') ?? '').trim();
  const category_id = String(formData.get('category_id') ?? '').trim();
  const home_team_id = String(formData.get('home_team_id') ?? '').trim();
  const away_team_id = String(formData.get('away_team_id') ?? '').trim();
  const match_date = String(formData.get('match_date') ?? '').trim();
  const venue = String(formData.get('venue') ?? '').trim() || null;
  const status = String(formData.get('status') ?? 'scheduled');

  if (!season_id || !category_id || !home_team_id || !away_team_id || !match_date) {
    return { error: 'Tous les champs obligatoires doivent être remplis.' };
  }

  if (home_team_id === away_team_id) {
    return { error: 'Les deux équipes doivent être différentes.' };
  }

  const supabase = await createClient();

  const payload: any = {
    season_id, category_id, home_team_id, away_team_id,
    match_date: new Date(match_date).toISOString(),
    venue, status
  };

  if (id) {
    const { error } = await supabase.from('matches').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('matches').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/matchs');
  revalidatePath('/[locale]/competition', 'layout');
  redirect('/admin/matchs');
}

// ─── Saisir / corriger un score (saisie résultats) ──────────
export async function saveScore(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  // ⚠️ Autorisé à result_entry aussi
  await requireRole(['admin', 'league_manager', 'result_entry']);

  const id = String(formData.get('id') ?? '').trim();
  const home_score = Number(formData.get('home_score'));
  const away_score = Number(formData.get('away_score'));
  const status = String(formData.get('status') ?? 'played');

  if (!id) return { error: 'ID manquant.' };
  if (isNaN(home_score) || isNaN(away_score)) {
    return { error: 'Scores invalides.' };
  }

  const supabase = await createClient();

  // 1. Mettre à jour le match
  const { error: matchError } = await supabase
    .from('matches')
    .update({
      home_score,
      away_score,
      status
    })
    .eq('id', id);

  if (matchError) return { error: matchError.message };

  // 2. Recalculer les classements pour cette catégorie
  const { data: match } = await supabase
    .from('matches')
    .select('season_id, category_id')
    .eq('id', id)
    .single();

  if (match) {
    await supabase.rpc('recalculate_standings', {
      p_season_id: match.season_id,
      p_category_id: match.category_id
    });
  }

  revalidatePath('/admin/matchs');
  revalidatePath('/[locale]/competition', 'layout');
  return { ok: true };
}

// ─── Supprimer un match ─────────────────────────────────────
export async function deleteMatch(id: string) {
  await requireRole(['admin', 'league_manager']);

  const supabase = await createClient();
  const { error } = await supabase.from('matches').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/matchs');
  revalidatePath('/[locale]/competition', 'layout');
}