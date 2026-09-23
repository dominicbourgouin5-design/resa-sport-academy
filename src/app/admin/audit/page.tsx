import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AuditLog from './AuditLog';

export default async function AdminAuditPage() {
  const me = await getCurrentProfile();
  if (!me || me.role !== 'admin') {
    redirect('/admin');
  }

  const supabase = await createClient();

  const { data: logs } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  const list = (logs ?? []) as any[];

  return (
    <div className="mx-auto max-w-6xl">

      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
          Administration
        </div>
        <h1 className="font-display text-3xl font-black text-resa-navy">
          Journal d'audit
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          Historique des {list.length} dernière(s) action(s) enregistrée(s)
        </p>
      </div>

      <AuditLog logs={list} />
    </div>
  );
}