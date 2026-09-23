import { getAllNotifications } from '@/lib/queries';
import DiagnosticPush from './DiagnosticPush';
import { getCurrentProfile } from '@/lib/auth';
import NotificationsList from './NotificationsList';
import PushToggle from '@/components/admin/PushToggle';

export default async function AdminNotificationsPage() {
  const notifications = (await getAllNotifications(50)) ?? [];
  const me = await getCurrentProfile();

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
            Administration
          </div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            Vos {notifications.length} dernière(s) notification(s)
          </p>
        </div>

        <a
          href="/admin/notifications/envoyer"
          className="inline-flex items-center gap-2 rounded-full bg-resa-red px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700"
        >
          + Envoyer un message
        </a>
      </header>

       {/* ─── Bloc Push Web ─── */}
      {me && (
        <div className="mb-6 space-y-4">
          <PushToggle userId={me.id} />
          <DiagnosticPush userId={me.id} />
        </div>
      )}

      <NotificationsList notifications={notifications} />
    </div>
  );
}