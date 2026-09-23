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

// ─── Créer / mettre à jour une équipe ───────────────────────
export async function saveTeam(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  await requireRole(['admin', 'league_manager']);

  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim() || null;
  const group_name = String(formData.get('group_name') ?? '').trim() || null;
  const coach_name = String(formData.get('coach_name') ?? '').trim() || null;
  const logo_url = String(formData.get('logo_url') ?? '').trim() || null;
  const is_active = formData.get('is_active') === 'on';

  if (!id) return { error: 'ID équipe manquant.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('teams')
    .update({ name, group_name, coach_name, logo_url, is_active })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/equipes');
  revalidatePath('/[locale]/ecoles', 'layout');
  redirect('/admin/equipes');
}

// ─── Supprimer une équipe ───────────────────────────────────
export async function deleteTeam(id: string) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase.from('teams').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/equipes');
  revalidatePath('/[locale]/ecoles', 'layout');
}

// ─── Activer / désactiver ───────────────────────────────────
export async function toggleTeamActive(id: string, current: boolean) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('teams')
    .update({ is_active: !current })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/equipes');
}