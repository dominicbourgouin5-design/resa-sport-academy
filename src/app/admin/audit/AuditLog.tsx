'use client';

import { useState, useMemo } from 'react';

const ACTION_CONFIG: Record<string, {
  label: string;
  icon: string;
  color: string;
  bg: string;
}> = {
  match_score_updated: { label: 'Score modifié',   icon: '⚽', color: 'text-resa-red',    bg: 'bg-resa-red/10' },
  school_deleted:      { label: 'École supprimée', icon: '🏫', color: 'text-red-700',     bg: 'bg-red-100' },
  rules_changed:       { label: 'Règles modifiées',icon: '⚙️', color: 'text-resa-royal',  bg: 'bg-resa-royal/10' },
  role_changed:        { label: 'Rôle modifié',    icon: '👥', color: 'text-amber-700',   bg: 'bg-amber-100' }
};

function getActionConfig(action: string) {
  return ACTION_CONFIG[action] ?? {
    label: action,
    icon: '📋',
    color: 'text-resa-navy',
    bg: 'bg-resa-navy/10'
  };
}

export default function AuditLog({ logs }: { logs: any[] }) {
  const [q, setQ] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [detail, setDetail] = useState<any>(null);

  // Actions uniques + utilisateurs uniques
  const actions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => l.action && set.add(l.action));
    return Array.from(set).sort();
  }, [logs]);

  const users = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => l.user_email && set.add(l.user_email));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const term = q.toLowerCase();
      const matchText =
        (l.action ?? '').toLowerCase().includes(term) ||
        (l.user_email ?? '').toLowerCase().includes(term) ||
        (l.entity_type ?? '').toLowerCase().includes(term);
      const matchAction = actionFilter === 'all' ? true : l.action === actionFilter;
      const matchUser = userFilter === 'all' ? true : l.user_email === userFilter;
      return matchText && matchAction && matchUser;
    });
  }, [logs, q, actionFilter, userFilter]);

  // Grouper par jour
  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const l of filtered) {
      const day = new Date(l.created_at).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      (groups[day] ??= []).push(l);
    }
    return Object.entries(groups);
  }, [filtered]);

  return (
    <>
      {/* Barre de filtres */}
      <div className="mb-6 space-y-3 rounded-xl border border-black/5 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche */}
          <div className="relative min-w-[200px] flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-resa-text/30">
              🔍
            </span>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par action, utilisateur, entité…"
              className="w-full rounded-lg border border-black/10 bg-resa-gray/50 py-2 pl-9 pr-3 text-[12px] outline-none transition focus:border-resa-navy/30 focus:bg-white focus:ring-2 focus:ring-resa-navy/10"
            />
          </div>

          {/* Compteur */}
          <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
            {filtered.length} / {logs.length}
          </div>
        </div>

        {/* Filtres rapides */}
        <div className="flex flex-wrap gap-3">
          {/* Actions */}
          <div className="flex flex-wrap gap-1 rounded-full border border-black/5 bg-resa-gray p-1">
            <button
              onClick={() => setActionFilter('all')}
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                actionFilter === 'all'
                  ? 'bg-white text-resa-navy shadow-sm'
                  : 'text-resa-text/50 hover:text-resa-navy'
              }`}
            >
              Toutes
            </button>
            {actions.map((a) => {
              const cfg = getActionConfig(a);
              return (
                <button
                  key={a}
                  onClick={() => setActionFilter(a)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                    actionFilter === a
                      ? 'bg-white text-resa-navy shadow-sm'
                      : 'text-resa-text/50 hover:text-resa-navy'
                  }`}
                >
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Utilisateurs */}
          {users.length > 1 && (
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="rounded-full border border-black/5 bg-white px-3 py-1.5 text-[11px] font-bold text-resa-navy outline-none transition focus:border-resa-navy/30 focus:ring-2 focus:ring-resa-navy/10"
            >
              <option value="all">Tous les utilisateurs</option>
              {users.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Timeline groupée par jour */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-black/5 bg-white p-12 text-center shadow-sm">
          <div className="mb-3 text-4xl">📭</div>
          <p className="text-sm text-resa-text/60">
            Aucune entrée dans le journal d'audit.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, items]) => (
            <section key={day}>
              <div className="mb-3 flex items-center gap-3">
                <div className="h-1 w-6 rounded-full bg-resa-red" />
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-resa-navy">
                  {day}
                </h2>
                <div className="text-[10px] text-resa-text/40">
                  {items.length} entrée(s)
                </div>
                <div className="h-px flex-1 bg-black/5" />
              </div>

              <div className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
                <ul className="divide-y divide-black/5">
                  {items.map((l) => {
                    const cfg = getActionConfig(l.action);
                    const time = new Date(l.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <li
                        key={l.id}
                        onClick={() => setDetail(l)}
                        className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-resa-gray/40"
                      >
                        {/* Heure */}
                        <div className="w-12 shrink-0 text-[11px] font-bold text-resa-text/40">
                          {time}
                        </div>

                        {/* Icône */}
                        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base ${cfg.bg}`}>
                          {cfg.icon}
                        </div>

                        {/* Contenu */}
                        <div className="min-w-0 flex-1">
                          <div className={`truncate text-[13px] font-semibold ${cfg.color}`}>
                            {cfg.label}
                          </div>
                          <div className="truncate text-[11px] text-resa-text/50">
                            {l.user_email ?? 'Système'}
                            {l.entity_type && ` · ${l.entity_type}`}
                          </div>
                        </div>

                        {/* Chevron */}
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4 shrink-0 text-resa-text/20 transition group-hover:text-resa-red"
                        >
                          <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Modal détail */}
      {detail && (
        <DetailModal log={detail} onClose={() => setDetail(null)} />
      )}
    </>
  );
}

// ─── Modal détail d'une entrée d'audit ──────────────────────
function DetailModal({ log, onClose }: { log: any; onClose: () => void }) {
  const cfg = getActionConfig(log.action);

  const formatJSON = (data: any) => {
    if (!data) return null;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm anim-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl anim-fade-up">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg ${cfg.bg}`}>
              {cfg.icon}
            </div>
            <div>
              <div className={`text-[13px] font-bold ${cfg.color}`}>
                {cfg.label}
              </div>
              <div className="text-[11px] text-resa-text/50">
                {new Date(log.created_at).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-resa-text/40 transition hover:bg-resa-gray"
          >
            ✕
          </button>
        </div>

        {/* Contenu */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {/* Métadonnées */}
          <section className="mb-5">
            <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-resa-text/40">
              Métadonnées
            </h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Info label="Utilisateur"   value={log.user_email ?? 'Système'} />
              <Info label="Action"        value={log.action} />
              <Info label="Type d'entité" value={log.entity_type} />
              <Info label="ID entité"     value={log.entity_id?.slice(0, 12) ?? '—'} mono />
              {log.ip_address && (
                <Info label="Adresse IP" value={log.ip_address} />
              )}
            </dl>
          </section>

          {/* Avant */}
          {log.before_data && (
            <section className="mb-5 border-t border-black/5 pt-5">
              <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Avant modification
              </h3>
              <pre className="overflow-x-auto rounded-lg bg-red-50 p-4 text-[11px] leading-relaxed text-red-900">
                {formatJSON(log.before_data)}
              </pre>
            </section>
          )}

          {/* Après */}
          {log.after_data && (
            <section className="border-t border-black/5 pt-5">
              <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Après modification
              </h3>
              <pre className="overflow-x-auto rounded-lg bg-emerald-50 p-4 text-[11px] leading-relaxed text-emerald-900">
                {formatJSON(log.after_data)}
              </pre>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-black/5 bg-resa-gray/30 px-6 py-3">
          <div className="text-[10px] uppercase tracking-widest text-resa-text/40">
            ID : {log.id.slice(0, 8)}
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-black/5 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-black/5 bg-resa-gray/30 p-3">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
        {label}
      </dt>
      <dd className={`mt-0.5 text-[12px] font-medium text-resa-navy ${mono ? 'font-mono' : ''}`}>
        {value}
      </dd>
    </div>
  );
}