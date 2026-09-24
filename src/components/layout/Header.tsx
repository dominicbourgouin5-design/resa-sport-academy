'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/i18n/navigation';

import LocaleRegionSelector from './LocaleRegionSelector';
import ActionsMenu from './ActionsMenu';

import { cn } from '@/lib/utils';

type NavLink = {
  href: string;
  labelKey: string;
  descKey?: string;
  children?: NavLink[];
};

type NavItem = {
  href: string;
  labelKey: string;
  children?: NavLink[];
};

export default function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMobileOpen(false);
    setOpenKeys({});
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const toggleKey = (key: string) =>
    setOpenKeys((o) => ({ ...o, [key]: !o[key] }));

  // ─── Menu principal ───
  const links: NavItem[] = [
    { href: '/',     labelKey: 'home' },
    { href: '/resa', labelKey: 'about' },
    {
      href: '/programs',
      labelKey: 'ecosystem',
      children: [
        { href: '/programs', labelKey: 'allPrograms', descKey: 'subAllPrograms' },
        { href: '/academy',  labelKey: 'academy',     descKey: 'subAcademy' },
        {
          href: '/ligue',
          labelKey: 'leagueGroup',
          descKey: 'subLeagueGroup',
            children: [
              { href: '/ligue',       labelKey: 'leaguePresentation', descKey: 'subLeaguePresentation' },
              { href: '/ecoles',      labelKey: 'schools',            descKey: 'subSchools' },
              { href: '/competition', labelKey: 'competition',        descKey: 'subCompetition' }
            ]
        },
        { href: '/private-training', labelKey: 'training', descKey: 'subTraining' },
        { href: '/coaches',          labelKey: 'coaches',  descKey: 'subCoaches' }
      ]
    },
    { href: '/roger-sampah', labelKey: 'coachRoger' },
    { href: '/actualites',   labelKey: 'news' },
    { href: '/sponsors',     labelKey: 'partners' }
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const isGroupActive = (item: NavItem) =>
    item.href === '/programs'
      ? ['/programs', '/academy', '/ligue', '/competition', '/ecoles', '/private-training', '/coaches'].some((p) => pathname.startsWith(p))
      : isActive(item.href);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/5 bg-resa-navy/95 backdrop-blur-md anim-fade-in">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <img
              src="/images/brand/resa-logo.png"
              alt="RESA"
              className="h-9 w-9 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-lg font-black tracking-tight text-white">
                RESA
              </span>
              <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.28em] text-white/50">
                Sport Academy
              </span>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <NavItemDesktop
                key={l.href}
                item={l}
                active={isGroupActive(l)}
                t={t}
                pathname={pathname}
              />
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <LocaleRegionSelector />
            <ActionsMenu />

            <Link
              href="/inscriptions"
              className="hidden items-center gap-2 rounded-full bg-resa-red px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white shadow-resa transition-all duration-300 hover:bg-red-700 hover:scale-[1.04] hover:shadow-resa-lg md:inline-flex xl:px-4"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>{t('register')}</span>
            </Link>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label={t('menu')}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white lg:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════ MENU MOBILE ═══════════════ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm anim-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute right-0 top-0 flex h-full w-[88vw] max-w-sm flex-col bg-resa-navy text-white shadow-2xl anim-fade-left">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="font-display text-xl font-black">
                RESA<span className="text-resa-red">.</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label={t('close')}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-6">
              <ul className="space-y-1">
                {links.map((l) => {
                  const hasChildren = !!l.children?.length;
                  const isOpen = !!openKeys[l.href];
                  const active = isGroupActive(l);

                  return (
                    <li key={l.href}>
                      {hasChildren ? (
                        <>
                          <button
                            onClick={() => toggleKey(l.href)}
                            className={cn(
                              'flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold transition',
                              active
                                ? 'bg-white/10 text-white'
                                : 'text-white/85 hover:bg-white/5 hover:text-white'
                            )}
                          >
                            <span>{t(l.labelKey as any)}</span>
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className={cn('h-4 w-4 transition-transform duration-300', isOpen && 'rotate-180')}
                            >
                              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>

                          {isOpen && (
                            <ul className="mt-1 ml-3 space-y-0.5 border-l border-white/10 pl-3">
                              {l.children!.map((c) => {
                                const cHasChildren = !!c.children?.length;
                                const cIsOpen = !!openKeys[c.href];

                                return (
                                  <li key={c.labelKey}>
                                    {cHasChildren ? (
                                      <>
                                        <button
                                          onClick={() => toggleKey(c.href)}
                                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                                        >
                                          <span>{t(c.labelKey as any)}</span>
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className={cn('h-3.5 w-3.5 transition-transform duration-300', cIsOpen && 'rotate-180')}
                                          >
                                            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        </button>

                                        {cIsOpen && (
                                          <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-white/10 pl-3">
                                            {c.children!.map((sc) => (
                                              <li key={sc.href}>
                                                <Link
                                                  href={sc.href as any}
                                                  className="block rounded-lg px-3 py-2 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
                                                >
                                                  {t(sc.labelKey as any)}
                                                </Link>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </>
                                    ) : (
                                      <Link
                                        href={c.href as any}
                                        className="block rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                                      >
                                        {t(c.labelKey as any)}
                                      </Link>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link
                          href={l.href as any}
                          className={cn(
                            'block rounded-lg px-3 py-3 text-sm font-semibold transition',
                            active
                              ? 'bg-white/10 text-white'
                              : 'text-white/85 hover:bg-white/5 hover:text-white'
                          )}
                        >
                          {t(l.labelKey as any)}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="space-y-2 border-t border-white/10 p-5">
              <Link
                href="/inscriptions"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-resa-red px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-3.5 w-3.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {t('register')}
              </Link>
              <Link
                href="/private-training"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/85 transition hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
                  <path d="M8 2v4M16 2v4M3 10h18" />
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                </svg>
                {t('bookCoach')}
              </Link>
              <Link
                href="/contact"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/85 transition hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 5L2 7" />
                </svg>
                {t('contactTooltip')}
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// NavItem desktop avec dropdown + accordéon vertical
// ═══════════════════════════════════════════════════════════
function NavItemDesktop({
  item,
  active,
  t,
  pathname
}: {
  item: NavItem;
  active: boolean;
  t: any;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const [openSubKey, setOpenSubKey] = useState<string | null>(null);
  const hasChildren = !!item.children?.length;

  // ─── Icônes SVG par route ───
  const ICONS: Record<string, React.ReactNode> = {
    '/programs': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    '/academy': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-6 10 6-10 6z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    '/ligue': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0z" />
      </svg>
    ),
    '/competition': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    '/ecoles': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
      </svg>
    ),
    '/private-training': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    '/coaches': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => {
        if (!hasChildren) return;
        setOpen(false);
        setOpenSubKey(null);
      }}
    >
      {hasChildren ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'group relative inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-semibold transition-colors duration-300',
            active ? 'text-white' : 'text-white/75 hover:text-white'
          )}
        >
          <span className="relative inline-block">
            {t(item.labelKey as any)}
            <span
              className={cn(
                'absolute -bottom-1 left-0 h-px bg-resa-red transition-all duration-300',
                active ? 'w-full' : 'w-0 group-hover:w-full'
              )}
            />
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={cn('h-2.5 w-2.5 transition-transform duration-300', open && 'rotate-180')}
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <Link
          href={item.href as any}
          className={cn(
            'group relative inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-semibold transition-colors duration-300',
            active ? 'text-white' : 'text-white/75 hover:text-white'
          )}
        >
          <span className="relative inline-block">
            {t(item.labelKey as any)}
            <span
              className={cn(
                'absolute -bottom-1 left-0 h-px bg-resa-red transition-all duration-300',
                active ? 'w-full' : 'w-0 group-hover:w-full'
              )}
            />
          </span>
        </Link>
      )}

      {hasChildren && open && (
        <div className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-3">
          <div className="dropdown-panel dropdown-enter">
            <div className="relative py-2">
              {item.children!.map((c, i) => {
                const isCurrent = pathname.startsWith(c.href);
                const cHasChildren = !!c.children?.length;
                const isSubOpen = openSubKey === c.labelKey;

                return (
                  <div key={c.labelKey}>
                    {i > 0 && <div className="dropdown-divider" />}

                    {cHasChildren ? (
                      /* ─── Groupe avec accordéon vertical ─── */
                      <div
                        onMouseEnter={() => setOpenSubKey(c.labelKey)}
                        onMouseLeave={() => setOpenSubKey(null)}
                      >
                        <button
                          type="button"
                          className={cn(
                            'dropdown-item w-full',
                            (isCurrent || isSubOpen) && 'is-active'
                          )}
                        >
                          <span className="dropdown-item-icon">
                            {ICONS[c.href] ?? ICONS['/academy']}
                          </span>
                          <div className="min-w-0 flex-1 text-left">
                            <div className="text-[13px] font-semibold tracking-tight">
                              {t(c.labelKey as any)}
                            </div>
                            {c.descKey && (
                              <div className="mt-0.5 text-[11px] text-white/45">
                                {t(c.descKey as any)}
                              </div>
                            )}
                          </div>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className={cn(
                              'h-3 w-3 shrink-0 text-white/40 transition-transform duration-300',
                              isSubOpen && 'rotate-180'
                            )}
                          >
                            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>

                        {/* Accordéon vertical (sous-menu en dessous) */}
                        <div
                          className={cn(
                            'grid overflow-hidden transition-all duration-300 ease-out',
                            isSubOpen
                              ? 'grid-rows-[1fr] opacity-100'
                              : 'grid-rows-[0fr] opacity-0'
                          )}
                        >
                          <div className="min-h-0">
                            <ul className="mx-3 my-1 space-y-0.5 border-l-2 border-resa-red/40 pl-3">
                              {c.children!.map((sc) => {
                                const scIsCurrent = pathname.startsWith(sc.href);
                                return (
                                  <li key={sc.labelKey}>
                                    <Link
                                      href={sc.href as any}
                                      className={cn(
                                        'group/sub flex items-center gap-2 rounded-md px-3 py-2 text-[12px] transition',
                                        scIsCurrent
                                          ? 'bg-white/10 text-white'
                                          : 'text-white/65 hover:bg-white/5 hover:text-white'
                                      )}
                                    >
                                      <span className="h-1 w-1 rounded-full bg-resa-red opacity-60 group-hover/sub:opacity-100" />
                                      <span className="flex-1 font-medium">
                                        {t(sc.labelKey as any)}
                                      </span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ─── Item simple ─── */
                      <Link
                        href={c.href as any}
                        className={cn('dropdown-item', isCurrent && 'is-active')}
                      >
                        <span className="dropdown-item-icon">
                          {ICONS[c.href] ?? ICONS['/academy']}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold tracking-tight">
                            {t(c.labelKey as any)}
                          </div>
                          {c.descKey && (
                            <div className="mt-0.5 text-[11px] text-white/45">
                              {t(c.descKey as any)}
                            </div>
                          )}
                        </div>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}