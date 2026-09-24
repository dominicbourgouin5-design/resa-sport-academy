import Link from 'next/link';
import UserForm from './UserForm';

export default function NewUserPage() {
  return (
    <div className="mx-auto max-w-3xl">

      {/* Breadcrumb */}
      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/utilisateurs" className="hover:text-resa-red">
          Utilisateurs
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">Nouveau compte</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-resa-navy">
          Créer un nouveau compte
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          Le compte est activé immédiatement — l'utilisateur peut se connecter dès la création.
        </p>
      </div>

      <UserForm />
    </div>
  );
}