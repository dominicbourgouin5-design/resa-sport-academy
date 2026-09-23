import LoginForm from './LoginForm';

export const metadata = { title: 'Connexion — Admin RESA' };

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return <LoginForm redirectTo={redirect ?? '/admin'} />;
}