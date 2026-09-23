'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permissions insuffisantes');
  }
  return profile;
}

// ─── Changer le rôle d'un utilisateur ───────────────────────
export async function updateUserRole(
  userId: string,
  role: 'admin' | 'league_manager' | 'result_entry' | 'content_editor'
) {
  const me = await requireAdmin();

  if (me.id === userId && role !== 'admin') {
    throw new Error('Vous ne pouvez pas retirer votre propre rôle administrateur.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/utilisateurs');
}

// ─── Activer / désactiver un utilisateur ────────────────────
export async function toggleUserActive(userId: string, current: boolean) {
  const me = await requireAdmin();

  if (me.id === userId && current) {
    throw new Error('Vous ne pouvez pas désactiver votre propre compte.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: !current })
    .eq('id', userId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/utilisateurs');
}

// ─── Mettre à jour le nom complet ───────────────────────────
export async function updateUserName(userId: string, fullName: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', userId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/utilisateurs');
}