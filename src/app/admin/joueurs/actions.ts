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

// ─── Créer / mettre à jour un joueur ────────────────────────
export async function savePlayer(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  await requireRole(['admin', 'league_manager']);

  const id = String(formData.get('id') ?? '').trim();
  const team_id = String(formData.get('team_id') ?? '').trim();
  const first_name = String(formData.get('first_name') ?? '').trim();
  const last_initial = String(formData.get('last_initial') ?? '').trim() || null;
  const birth_date = String(formData.get('birth_date') ?? '').trim() || null;
  const jersey_number = formData.get('jersey_number') ? Number(formData.get('jersey_number')) : null;
  const position = String(formData.get('position') ?? '').trim() || null;
  const photo_url = String(formData.get('photo_url') ?? '').trim() || null;

  if (!team_id || !first_name) {
    return { error: 'L\'équipe et le prénom sont obligatoires.' };
  }

  if (position && !['GK', 'DF', 'MF', 'FW'].includes(position)) {
    return { error: 'Poste invalide.' };
  }

  const supabase = await createClient();
  const payload: any = {
    team_id,
    first_name,
    last_initial,
    birth_date,
    jersey_number,
    position,
    photo_url
  };

  if (id) {
    const { error } = await supabase.from('players').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('players').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/joueurs');
  revalidatePath('/[locale]/ecoles', 'layout');
  redirect('/admin/joueurs');
}

// ─── Supprimer un joueur ────────────────────────────────────
export async function deletePlayer(id: string) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/joueurs');
  revalidatePath('/[locale]/ecoles', 'layout');
}