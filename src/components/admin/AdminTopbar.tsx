'use client';

import { useState } from 'react';
import { logout } from '@/app/admin/login/actions';
import { ROLE_LABELS } from '@/lib/roles';
import { useAdminSidebar } from './AdminShell';

export default function AdminTopbar({ profile }: { profile: any }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { setMobileOpen } = useAdminSidebar();
  const initial = (profile.full_name ?? profile.email ?? '?').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-black/5 bg-white px-3 py-2.5 sm:px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {/* Burger mobile */}
        <button
          onClick={() => setMobileOpen(true)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-resa-navy transition hover:bg-resa-gray lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>

        {/* Logo compact mobile */}
        <div className="lg:hidden">
          <span className="font-display text-lg font-black text-resa-navy">
            RESA<span className="text-resa-red">.</span>
          </span>
        </div>

        {/* Info desktop */}
        <div className="hidden text-xs text-resa-text/50 lg:block">
          Connecté en tant que{' '}
          <span className="font-medium text-resa-text/60">
            {ROLE_LABELS[profile.role] ?? profile.role}
          </span>
        </div>
      </div>

      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-resa-gray sm:gap-2.5 sm:pr-2.5"
        >
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-resa-navy text-[10px] font-bold text-white">
            {initial}
          </div>
          <div className="hidden text-left sm:block">
            <div className="max-w-[140px] truncate text-[11px] font-semibold leading-tight text-resa-navy">
              {profile.full_name ?? profile.email}
            </div>
            <div className="text-[9px] uppercase tracking-wider text-resa-text/40">
              {ROLE_LABELS[profile.role] ?? profile.role}
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden h-3 w-3 text-resa-text/40 sm:block">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-lg border border-black/5 bg-white shadow-lg">
              <div className="border-b border-black/5 px-4 py-3">
                <div className="truncate text-[11px] font-semibold text-resa-navy">
                  {profile.full_name ?? profile.email}
                </div>
                <div className="truncate text-[10px] text-resa-text/40">{profile.email}</div>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full px-4 py-3 text-left text-[12px] font-medium text-red-600 transition hover:bg-red-50"
                >
                  Se déconnecter
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </header>
  );
}