'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permissions insuffisantes');
  }
  return profile;
}

// ─── Changer le rôle ────────────────────────────────────────
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

// ─── Activer / désactiver ───────────────────────────────────
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

// ─── Créer un nouveau compte utilisateur ────────────────────
export async function createUser(
  _prev: { error?: string; ok?: boolean; userId?: string } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean; userId?: string } | null> {
  try {
    await requireAdmin();

    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const full_name = String(formData.get('full_name') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();
    const role = String(formData.get('role') ?? 'content_editor');

    // Validations
    if (!email || !full_name || !password) {
      return { error: 'Email, nom complet et mot de passe obligatoires.' };
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return { error: 'Adresse email invalide.' };
    }
    if (password.length < 6) {
      return { error: 'Le mot de passe doit contenir au moins 6 caractères.' };
    }
    if (!['admin', 'league_manager', 'result_entry', 'content_editor'].includes(role)) {
      return { error: 'Rôle invalide.' };
    }

    // Création via service_role → API admin Supabase
    const admin = createAdminClient();
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ← auto-confirmé (pas d'email à valider)
      user_metadata: { full_name }
    });

    if (authError) {
      // Message plus clair si l'email existe déjà
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        return { error: 'Cet email est déjà utilisé par un autre compte.' };
      }
      return { error: authError.message };
    }

    const newUserId = authData.user?.id;
    if (!newUserId) {
      return { error: 'Erreur : ID utilisateur non généré.' };
    }

    // Le trigger handle_new_user() crée automatiquement le profil,
    // mais on force le rôle + nom (le trigger met content_editor par défaut)
    const supabase = await createClient();
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role, full_name })
      .eq('id', newUserId);

    if (profileError) {
      console.error('createUser profile update error:', profileError);
      // Le compte existe déjà dans auth.users, on continue quand même
    }

    revalidatePath('/admin/utilisateurs');
    return { ok: true, userId: newUserId };
  } catch (err: any) {
    console.error('createUser error:', err);
    return { error: err.message ?? 'Erreur inconnue.' };
  }
}