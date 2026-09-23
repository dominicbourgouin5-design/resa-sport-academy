import { getCurrentProfile } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';
import ServiceWorkerRegister from '@/components/admin/ServiceWorkerRegister';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import '../globals.css';

export const metadata = {
  title: 'Admin — RESA Sport Academy'
};

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  // Pas connecté (ex. sur /admin/login) → pas de sidebar, pas de topbar
  if (!profile) {
    return (
      <html lang="fr">
        <body className="min-h-screen">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="fr">
      <body className="min-h-screen bg-resa-gray">
        <AdminShell>
          <ServiceWorkerRegister />
          <div className="min-h-screen">
          <AdminSidebar role={profile.role} />
          <div className="flex min-h-screen flex-col lg:pl-60">
            <AdminTopbar profile={profile} />
            <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
        </AdminShell>
      </body>
    </html>
  );
}