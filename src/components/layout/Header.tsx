'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/i18n/navigation';
import Logo from '@/components/ui/Logo';
import LocaleSwitcher from './LocaleSwitcher';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  labelKey: string;
  children?: { href: string; labelKey: string }[];
};

export default function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setOpenSub(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const links: NavItem[] = [
    { href: '/', labelKey: 'home' },
    { href: '/resa', labelKey: 'resa' },
    {
      href: '/ligue',
      labelKey: 'ligue',
        children: [
          { href: '/ligue',       labelKey: 'subOverview' },
          { href: '/competition', labelKey: 'subCompetition' },
          { href: '/ecoles',      labelKey: 'subSchools' }
        ]
    },
    { href: '/actualites', labelKey: 'actualites' },
    { href: '/sponsors',   labelKey: 'sponsors' }
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isLigueGroupActive = ['/ligue', '/competition', '/ecoles'].some((p) =>
    pathname.startsWith(p)
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/5 bg-resa-navy/95 backdrop-blur-md anim-fade-in">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <Logo size="md" className="transition-transform duration-300 group-hover:scale-105" />
            <div className="flex flex-col justify-center leading-none">
              <span className="font-display text-xl font-black tracking-tight text-white">
                RESA
              </span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-white/60">
                Sport Academy
              </span>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => {
              const active =
                l.href === '/ligue' && l.children ? isLigueGroupActive : isActive(l.href);
              return (
                <NavItemDesktop key={l.href} item={l} isActive={active} t={t} />
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <LocaleSwitcher />

            {/* Icône contact */}
            <Link
              href="/contact"
              title={t('contactTooltip')}
              aria-label={t('contactTooltip')}
              className={cn(
                'hidden h-9 w-9 place-items-center rounded-full border transition-all duration-300 sm:grid',
                isActive('/contact')
                  ? 'border-resa-red bg-resa-red text-white'
                  : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white hover:scale-105'
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 5L2 7" />
              </svg>
            </Link>

            {/* CTA */}
            <Link
              href="/inscriptions"
              className="hidden rounded-full bg-resa-red px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition-all duration-300 hover:bg-red-700 hover:scale-[1.05] hover:shadow-resa-lg sm:inline-flex md:px-5"
            >
              {t('inscrire')}
            </Link>

            {/* Burger */}
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

      {/* ─── Menu mobile ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm anim-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute right-0 top-0 flex h-full w-[85vw] max-w-sm flex-col bg-resa-navy text-white shadow-2xl anim-fade-left">
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
                  const isSubOpen = openSub === l.href;
                  const groupActive =
                    l.href === '/ligue' && hasChildren
                      ? isLigueGroupActive
                      : isActive(l.href);

                  return (
                    <li key={l.href}>
                      {hasChildren ? (
                        <>
                          <button
                            onClick={() => setOpenSub(isSubOpen ? null : l.href)}
                            className={cn(
                              'flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold transition',
                              groupActive
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
                              className={cn(
                                'h-4 w-4 transition-transform duration-300',
                                isSubOpen && 'rotate-180'
                              )}
                            >
                              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>

                          {isSubOpen && (
                            <ul className="mt-1 ml-3 space-y-0.5 border-l border-white/10 pl-3">
                              {l.children!.map((c) => (
                                <li key={c.labelKey}>
                                  <Link
                                    href={c.href as any}
                                    className="block rounded-lg px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                                  >
                                    {t(c.labelKey as any)}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link
                          href={l.href as any}
                          className={cn(
                            'block rounded-lg px-3 py-3 text-sm font-semibold transition',
                            isActive(l.href)
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

            <div className="border-t border-white/10 p-5">
              <Link
                href="/inscriptions"
                className="mb-3 flex w-full items-center justify-center rounded-full bg-resa-red px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa"
              >
                {t('inscrire')}
              </Link>
              <Link
                href="/contact"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/85 transition hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
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

// ─── NavItem desktop avec dropdown ──────────────────────────
function NavItemDesktop({
  item, isActive, t
}: {
  item: NavItem;
  isActive: boolean;
  t: any;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.children?.length;

  return (
    <div
      className="relative"
      onMouseEnter={() => hasChildren && setOpen(true)}
      onMouseLeave={() => hasChildren && setOpen(false)}
    >
      <Link
        href={item.href as any}
        className={cn(
          'group relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-300',
          isActive ? 'text-white' : 'text-white/70 hover:text-white'
        )}
      >
        <span className="relative inline-block">
          {t(item.labelKey as any)}
          <span
            className={cn(
              'absolute -bottom-1 left-0 h-px bg-resa-red transition-all duration-300',
              isActive ? 'w-full' : 'w-0 group-hover:w-full'
            )}
          />
        </span>
        {hasChildren && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={cn(
              'h-3 w-3 transition-transform duration-300',
              open && 'rotate-180'
            )}
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </Link>

      {hasChildren && open && (
        <div className="absolute left-0 top-full min-w-[240px] pt-2 anim-fade-up">
          <div className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-resa-lg">
            <div className="h-1 w-full bg-gradient-to-r from-resa-red via-resa-royal to-resa-navy" />
            <ul className="py-2">
              {item.children!.map((c) => (
                <li key={c.labelKey}>
                  <Link
                    href={c.href as any}
                    className="group flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-resa-navy transition-colors hover:bg-resa-gray hover:text-resa-red"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-resa-red/30 transition-colors group-hover:bg-resa-red" />
                    {t(c.labelKey as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}