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

// ─── Ajouter un événement ───────────────────────────────────
export async function addMatchEvent(
  matchId: string,
  teamId: string,
  playerId: string,
  eventType: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'mvp',
  minute?: number
) {
  await requireRole(['admin', 'league_manager', 'result_entry']);

  const supabase = await createClient();
  const { error } = await supabase
    .from('match_events')
    .insert({
      match_id: matchId,
      team_id: teamId,
      player_id: playerId,
      event_type: eventType,
      minute: minute ?? null
    });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/matchs/${matchId}/evenements`);
  revalidatePath('/[locale]/competition', 'layout');
}

// ─── Supprimer un événement ─────────────────────────────────
export async function deleteMatchEvent(eventId: string, matchId: string) {
  await requireRole(['admin', 'league_manager', 'result_entry']);
  const supabase = await createClient();
  const { error } = await supabase.from('match_events').delete().eq('id', eventId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/matchs/${matchId}/evenements`);
  revalidatePath('/[locale]/competition', 'layout');
}