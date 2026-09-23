import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import LoginForm from './LoginForm';

export const metadata = { title: 'Connexion — Admin RESA' };

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  // Si déjà connecté → redirection auto vers /admin
  const profile = await getCurrentProfile();
  if (profile && profile.is_active) {
    redirect('/admin');
  }

  const { redirect: redirectTo } = await searchParams;
  return <LoginForm redirectTo={redirectTo ?? '/admin'} />;
}