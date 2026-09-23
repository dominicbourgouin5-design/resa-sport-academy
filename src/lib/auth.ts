import { createClient } from './supabase/server';

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getCurrentProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active')
      .eq('id', user.id)
      .single();

    return data;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const profile = await getCurrentProfile();
  if (!profile || !profile.is_active) {
    throw new Error('Unauthorized');
  }
  return profile;
}

export async function requireAdmin() {
  const profile = await requireAuth();
  if (profile.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return profile;
}

export { ROLE_LABELS, ROLE_DESCRIPTIONS } from './roles';