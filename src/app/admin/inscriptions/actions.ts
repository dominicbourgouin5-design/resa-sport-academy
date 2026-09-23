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

// ─── Changer le statut d'une inscription ────────────────────
export async function updateRegistrationStatus(
  id: string,
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
) {
  await requireRole(['admin', 'league_manager']);

  const supabase = await createClient();
  const { error } = await supabase
    .from('registrations')
    .update({
      status,
      reviewed_by: (await getCurrentProfile())?.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/inscriptions');
}

// ─── Supprimer une inscription ──────────────────────────────
export async function deleteRegistration(id: string) {
  await requireRole(['admin']);
  const supabase = await createClient();
  const { error } = await supabase.from('registrations').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/inscriptions');
}

// ─── Ajouter une note admin ─────────────────────────────────
export async function saveAdminNotes(id: string, notes: string) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('registrations')
    .update({ admin_notes: notes })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/inscriptions');
}