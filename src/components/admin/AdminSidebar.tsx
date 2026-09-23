'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAdminSidebar } from './AdminShell';

type SubItem = { href: string; label: string };
type Section = {
  label: string;
  items: { label: string; icon: string; href?: string; children?: SubItem[] }[];
};

const SECTIONS: Section[] = [
  { label: 'Pilotage', items: [{ label: 'Tableau de bord', icon: 'home', href: '/admin' }] },
  {
    label: 'Compétition',
    items: [
      {
        label: 'Matchs', icon: 'match',
        children: [
          { href: '/admin/matchs',         label: 'Tous les matchs' },
          { href: '/admin/matchs/nouveau', label: 'Créer un match' }
        ]
      },
      {
        label: 'Équipes', icon: 'team',
        children: [{ href: '/admin/equipes', label: 'Toutes les équipes' }]
      },
      {
        label: 'Joueurs', icon: 'player',
        children: [
          { href: '/admin/joueurs',         label: 'Tous les joueurs' },
          { href: '/admin/joueurs/nouveau', label: 'Ajouter un joueur' }
        ]
      }
    ]
  },
  {
    label: 'Établissements',
    items: [
      {
        label: 'Écoles', icon: 'school',
        children: [
          { href: '/admin/ecoles',         label: 'Toutes les écoles' },
          { href: '/admin/ecoles/nouveau', label: 'Ajouter une école' }
        ]
      },
      {
        label: 'Inscriptions', icon: 'inbox',
        children: [{ href: '/admin/inscriptions', label: 'Demandes reçues' }]
      }
    ]
  },
  {
    label: 'Contenu',
    items: [
      {
        label: 'Actualités', icon: 'news',
        children: [
          { href: '/admin/actualites',         label: 'Toutes les actualités' },
          { href: '/admin/actualites/nouveau', label: 'Publier une actualité' }
        ]
      },
      {
        label: 'Sponsors', icon: 'sponsor',
        children: [{ href: '/admin/sponsors', label: 'Tous les partenaires' }]
      }
    ]
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'Utilisateurs', icon: 'users',
        children: [{ href: '/admin/utilisateurs', label: 'Comptes & rôles' }]
      },
      { label: "Journal d'audit", icon: 'audit', href: '/admin/audit' }
    ]
  }
];

export default function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const { mobileOpen, setMobileOpen } = useAdminSidebar();

  // Ferme le drawer mobile au changement de page
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isGroupActive = (item: any) =>
    item.href
      ? isActive(item.href)
      : item.children?.some((c: SubItem) => pathname.startsWith(c.href));

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          // Base
          'flex h-screen w-60 shrink-0 flex-col border-r border-white/5 bg-resa-navy text-white',
          // Toujours en fixed (mobile et desktop)
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out',
          // Mobile : caché par défaut, glisse quand ouvert
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop : toujours visible
          'lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <Link href="/admin" className="flex flex-col">
            <span className="font-display text-xl font-black tracking-tight">
              RESA<span className="text-resa-red">.</span>
            </span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.28em] text-white/40">
              Administration
            </span>
          </Link>

          {/* Bouton fermer mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Fermer le menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4
                     [&::-webkit-scrollbar]:w-1
                     [&::-webkit-scrollbar-track]:bg-transparent
                     [&::-webkit-scrollbar-thumb]:bg-white/10
                     [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {SECTIONS.map((section, sIdx) => {
            if (section.label === 'Administration' && role !== 'admin') return null;

            return (
              <div key={section.label} className={sIdx > 0 ? 'mt-4' : ''}>
                <div className="mb-1 px-3 text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
                  {section.label}
                </div>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const groupActive = isGroupActive(item);
                    const hasChildren = !!item.children?.length;
                    const isOpen = open[item.label];

                    if (!hasChildren && item.href) {
                      return (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className={cn(
                              'group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition',
                              isActive(item.href)
                                ? 'bg-white/10 text-white'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                            )}
                          >
                            <Icon name={item.icon} active={isActive(item.href)} />
                            {item.label}
                          </Link>
                        </li>
                      );
                    }

                    return (
                      <li key={item.label}>
                        <button
                          onClick={() => setOpen((o) => ({ ...o, [item.label]: !o[item.label] }))}
                          className={cn(
                            'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition',
                            groupActive
                              ? 'text-white'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          )}
                        >
                          <Icon name={item.icon} active={groupActive} />
                          <span className="flex-1 text-left">{item.label}</span>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={cn(
                              'h-3 w-3 transition-transform duration-200',
                              isOpen && 'rotate-90'
                            )}
                          >
                            <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>

                        {isOpen && (
                          <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                            {item.children!.map((c) => (
                              <li key={c.href}>
                                <Link
                                  href={c.href}
                                  className={cn(
                                    'block rounded-md px-3 py-1.5 text-[12px] transition',
                                    isActive(c.href)
                                      ? 'bg-white/5 font-semibold text-white'
                                      : 'text-white/50 hover:bg-white/5 hover:text-white/90'
                                  )}
                                >
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Retour site */}
        <div className="border-t border-white/5 p-3">
          <Link
            href="/fr"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-[12px] font-medium text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour au site
          </Link>
        </div>
      </aside>
    </>
  );
}

function Icon({ name, active }: { name: string; active?: boolean }) {
  const cls = cn(
    'h-4 w-4 shrink-0 transition-colors',
    active ? 'text-resa-red' : 'text-white/40 group-hover:text-white/70'
  );

  const paths: Record<string, React.ReactNode> = {
    home:    <path d="M3 12l9-9 9 9M5 10v10h14V10" />,
    match:   <><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18" /></>,
    team:    <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></>,
    player:  <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2" /></>,
    school:  <><path d="M22 10v6M2 10l10-6 10 6-10 6z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>,
    inbox:   <><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
    news:    <><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" /></>,
    sponsor: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
    users:   <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    audit:   <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" className={cls}>
      {paths[name] ?? paths.home}
    </svg>
  );
}