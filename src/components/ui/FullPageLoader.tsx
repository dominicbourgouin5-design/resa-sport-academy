'use client';

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
      field: 'h-8',
      ball: 'h-4 w-4',
      goal: 'h-6 w-1',
      fieldPadding: 'px-3'
    },
    md: {
      field: 'h-11',
      ball: 'h-6 w-6',
      goal: 'h-8 w-1.5',
      fieldPadding: 'px-4'
    },
    lg: {
      field: 'h-16',
      ball: 'h-9 w-9',
      goal: 'h-12 w-2',
      fieldPadding: 'px-5'
    }
  }[size];

  return (
    <div className={cn('flex w-full flex-col items-center justify-center gap-5', className)}>
      {/* ─── Terrain 3D ─── */}
      <div className="relative w-full max-w-md">
        {/* Ombre sous le terrain (perspective) */}
        <div className="absolute inset-x-4 -bottom-2 h-4 rounded-full bg-resa-navy/10 blur-md" />

        {/* Terrain */}
        <div className={cn(
          'relative overflow-hidden rounded-2xl',
          'bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40',
          'ring-2 ring-resa-navy/10',
          'shadow-lg shadow-resa-navy/5',
          config.field
        )}>
          {/* Motif pelouse défilant */}
          <div
            className={cn('absolute inset-0 opacity-25 ball-loader-field', config.fieldPadding)}
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(16,185,129,.35) 0 20px, transparent 20px 40px)',
              backgroundSize: '40px 100%'
            }}
          />

          {/* Points de pelouse */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(10,31,68,.18) 1px, transparent 1px)',
              backgroundSize: '8px 8px'
            }}
          />

          {/* Ligne médiane */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-resa-navy/15" />

          {/* Cercle central */}
          <div className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-resa-navy/10" />

          {/* Petite zone centrale */}
          <div className="absolute left-1/2 top-1/2 h-1/3 w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-resa-navy/15" />

          {/* Cage gauche (point de départ) */}
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
            <div className={cn(
              'rounded-sm bg-gradient-to-b from-resa-navy to-resa-navy/70 shadow-sm',
              config.goal
            )} />
          </div>

          {/* Cage droite (but à atteindre) */}
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            <div className={cn(
              'rounded-sm bg-gradient-to-b from-resa-red to-red-700 shadow-sm ball-loader-goal',
              config.goal
            )} />
          </div>
        </div>

        {/* ─── Ballon ─── */}
        <div className="pointer-events-none absolute inset-0">
          <div className={cn(
            'absolute top-1/2 ball-loader-mover',
            size === 'sm' ? '-mt-2' : size === 'lg' ? '-mt-[18px]' : '-mt-3'
          )}>
            {/* Ombre au sol */}
            <div className={cn(
              'absolute left-1/2 bottom-[-6px] rounded-full bg-black/40 blur-[3px] ball-loader-shadow',
              size === 'sm' ? 'h-1 w-4' :
              size === 'lg' ? 'h-2 w-8' :
                              'h-1.5 w-6'
            )} />

            {/* Ballon avec rotation */}
            <div className={cn(
              'relative rounded-full',
              'bg-gradient-to-br from-white via-white to-gray-100',
              'shadow-md shadow-resa-navy/30',
              'ring-1 ring-resa-navy/60',
              config.ball
            )}>
              <div className="h-full w-full ball-loader-spin">
                {/* Pentagone central */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-resa-navy"
                  style={{
                    width: '40%',
                    height: '40%',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  }}
                />
                {/* Motifs noirs autour */}
                <div className="absolute left-[12%] top-[18%] h-[16%] w-[16%] rounded-full bg-resa-navy/70" />
                <div className="absolute right-[12%] top-[18%] h-[16%] w-[16%] rounded-full bg-resa-navy/70" />
                <div className="absolute left-1/2 top-[6%] h-[14%] w-[14%] -translate-x-1/2 rounded-full bg-resa-navy/70" />
                <div className="absolute left-1/2 bottom-[6%] h-[14%] w-[14%] -translate-x-1/2 rounded-full bg-resa-navy/70" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Particules à l'arrivée ─── */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <div className="h-1 w-1 rounded-full bg-resa-red" style={{ animation: 'ping 2.6s ease-out infinite' }} />
        </div>
      </div>

      {/* ─── Texte ─── */}
      {label && (
        <div className="flex items-center gap-3">
          <div className="h-px w-6 bg-resa-navy/20" />
          <span className={cn(
            'text-[10px] font-black uppercase text-resa-navy/60 ball-loader-text',
            size === 'lg' ? 'text-xs' : 'text-[10px]'
          )}>
            {label}
          </span>
          <div className="h-px w-6 bg-resa-navy/20" />
        </div>
      )}
    </div>
  );
}