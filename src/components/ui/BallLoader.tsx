'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export default function BallLoader({
  label = 'Chargement…',
  size = 'md',
  className
}: {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const config = {
    sm: {
      wrapper: 'max-w-[300px]',
      fieldH: 'h-14',
      ballSize: 'h-4 w-4',           // 16px
      goalSize: 'h-10 w-10',         // 40px
      jumpH: '20px',
      fontSize: 'text-[9px]'
    },
    md: {
      wrapper: 'max-w-[400px]',
      fieldH: 'h-18',
      ballSize: 'h-5 w-5',           // 20px
      goalSize: 'h-12 w-12',         // 48px
      jumpH: '28px',
      fontSize: 'text-[11px]'
    },
    lg: {
      wrapper: 'max-w-[480px]',
      fieldH: 'h-22',
      ballSize: 'h-6 w-6',           // 24px
      goalSize: 'h-14 w-14',         // 56px
      jumpH: '36px',
      fontSize: 'text-xs'
    }
  }[size];

  return (
    <div className={cn('flex w-full flex-col items-center justify-center gap-3 py-2 select-none', className)}>
      {/* ─── Piste de Stade ─── */}
      <div className={cn('relative w-full', config.wrapper)}>
        
        {/* Halo d'ambiance */}
        <div className="absolute -top-6 left-1/2 h-14 w-3/4 -translate-x-1/2 bg-gradient-to-b from-emerald-400/20 to-transparent blur-xl pointer-events-none" />

        {/* Pelouse de stade */}
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-2xl border border-black/5',
            'bg-gradient-to-r from-emerald-950/5 via-emerald-900/10 to-emerald-950/5 p-2',
            'shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_8px_20px_-4px_rgba(10,31,68,0.08)]',
            config.fieldH
          )}
        >
          {/* Tonte en bandes */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #10b981 0px, #10b981 25px, #059669 25px, #059669 50px)'
            }}
          />

          {/* Ligne de touche en craie */}
          <div className="absolute inset-x-3 bottom-2 h-px bg-gradient-to-r from-black/5 via-black/20 to-black/5" />

          {/* Rond central */}
          <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10" />
          <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/20" />
          <div className="absolute left-1/2 inset-y-2 w-px bg-black/10" />

          {/* ══════════════════════════════════════════════════════ */}
          {/* COUCHE 1 (Arrière-plan z-0) : Filet arrière          */}
          {/* ══════════════════════════════════════════════════════ */}
          <div className="anim-goal-bulge pointer-events-none absolute right-3 bottom-1.5 z-0 origin-bottom-right">
            <svg viewBox="0 0 48 48" fill="none" className={cn('drop-shadow-sm', config.goalSize)}>
              <polygon points="10,6 44,4 44,42 10,44" fill="#0A1F44" fillOpacity="0.16" />

              {/* Maillage horizontal */}
              <line x1="10" y1="13" x2="44" y2="11" stroke="#0A1F44" strokeWidth="1" strokeOpacity="0.45" />
              <line x1="10" y1="21" x2="44" y2="19" stroke="#0A1F44" strokeWidth="1" strokeOpacity="0.45" />
              <line x1="10" y1="29" x2="44" y2="27" stroke="#0A1F44" strokeWidth="1" strokeOpacity="0.45" />
              <line x1="10" y1="37" x2="44" y2="35" stroke="#0A1F44" strokeWidth="1" strokeOpacity="0.45" />

              {/* Maillage vertical */}
              <line x1="18" y1="5" x2="18" y2="43" stroke="#0A1F44" strokeWidth="1" strokeOpacity="0.45" />
              <line x1="27" y1="4" x2="27" y2="43" stroke="#0A1F44" strokeWidth="1" strokeOpacity="0.45" />
              <line x1="36" y1="4" x2="36" y2="42" stroke="#0A1F44" strokeWidth="1" strokeOpacity="0.45" />

              {/* Poteau et barre de fond */}
              <line x1="44" y1="4" x2="44" y2="42" stroke="#0A1F44" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.75" />
              <line x1="10" y1="44" x2="44" y2="42" stroke="#0A1F44" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.75" />
            </svg>
          </div>

          {/* ══════════════════════════════════════════════════════ */}
          {/* COUCHE 2 (Plan intermédiaire z-10) : Ballon           */}
          {/* ══════════════════════════════════════════════════════ */}
          <div
            className="anim-ball-progress absolute bottom-2.5 z-10 -translate-x-1/2"
            style={{ '--jump-h': config.jumpH } as React.CSSProperties}
          >
            <div className="anim-ball-bounce relative">
              {/* Ombre synchronisée */}
              <div className="anim-ball-shadow absolute -bottom-[4px] left-1/2 h-1.5 w-5 -translate-x-1/2 rounded-full bg-resa-navy/40" />

              {/* Ballon de football HD */}
              <div className={cn('relative', config.ballSize)}>
                <svg viewBox="0 0 100 100" className="anim-ball-spin h-full w-full drop-shadow-sm">
                  <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#0A1F44" strokeWidth="3" />
                  <polygon points="50,32 66,44 60,63 40,63 34,44" fill="#0A1F44" />

                  <polygon points="50,15 58,2 42,2" fill="#0A1F44" />
                  <polygon points="78,35 94,28 88,14" fill="#0A1F44" />
                  <polygon points="82,65 96,68 94,82" fill="#0A1F44" />
                  <polygon points="50,85 58,98 42,98" fill="#0A1F44" />
                  <polygon points="18,65 4,68 6,82" fill="#0A1F44" />
                  <polygon points="22,35 6,28 12,14" fill="#0A1F44" />

                  <line x1="50" y1="32" x2="50" y2="15" stroke="#0A1F44" strokeWidth="2.5" />
                  <line x1="66" y1="44" x2="78" y2="35" stroke="#0A1F44" strokeWidth="2.5" />
                  <line x1="60" y1="63" x2="82" y2="65" stroke="#0A1F44" strokeWidth="2.5" />
                  <line x1="40" y1="63" x2="18" y2="65" stroke="#0A1F44" strokeWidth="2.5" />
                  <line x1="34" y1="44" x2="22" y2="35" stroke="#0A1F44" strokeWidth="2.5" />

                  <ellipse cx="38" cy="30" rx="18" ry="10" fill="white" opacity="0.45" transform="rotate(-30 38 30)" />
                </svg>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════ */}
          {/* COUCHE 3 (Premier plan z-20) : Poteau avant & barre  */}
          {/* ══════════════════════════════════════════════════════ */}
          <div className="pointer-events-none absolute right-3 bottom-1.5 z-20">
            <svg viewBox="0 0 48 48" fill="none" className={cn('drop-shadow-sm', config.goalSize)}>
              <line x1="10" y1="43" x2="10" y2="47" stroke="#FFFFFF" strokeWidth="2.5" />

              {/* Poteau avant blanc laqué */}
              <line x1="10" y1="5" x2="10" y2="45" stroke="#0A1F44" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="10" y1="5" x2="10" y2="45" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

              {/* Barre transversale rouge */}
              <line x1="10" y1="6" x2="44" y2="4" stroke="#0A1F44" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="10" y1="6" x2="44" y2="4" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />

              {/* Lucarne */}
              <circle cx="10" cy="6" r="2.8" fill="#DC2626" stroke="#0A1F44" strokeWidth="1" />
            </svg>
          </div>

          {/* ══════════════════════════════════════════════════════ */}
          {/* COUCHE 4 (Impact z-30) : Onde PING ROUGE               */}
          {/* ══════════════════════════════════════════════════════ */}
          <div className="anim-goal-ping pointer-events-none absolute right-5 bottom-3 h-8 w-8 -translate-y-1/2 z-30">
            <span className="absolute inline-flex h-full w-full rounded-full border-2 border-resa-red bg-resa-red/40 shadow-[0_0_16px_rgba(220,38,38,1)]" />
          </div>

        </div>

        {/* Ombre sous la piste */}
        <div className="mx-auto h-2 w-4/5 rounded-full bg-resa-navy/5 blur-sm" />
      </div>

      {/* ─── Typographie ─── */}
      {label && (
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-resa-red/80" />
          <span className={cn('font-sans font-bold uppercase tracking-[0.22em] text-resa-navy/70', config.fontSize)}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
}