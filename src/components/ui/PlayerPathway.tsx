'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type PathwayStep = {
  n: string;
  icon: string;
  title: string;
  text: string;
};

type IconPos = { x: number; y: number; radius: number };

export default function PlayerPathway({ steps }: { steps: PathwayStep[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);

  const [progress, setProgress] = useState(0);
  const [icons, setIcons] = useState<IconPos[]>([]);
  const [pathD, setPathD] = useState('');
  const [totalLength, setTotalLength] = useState(0);
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });
  const [isVertical, setIsVertical] = useState(false);

  // ─── Mesure des positions d'icônes ───
  useEffect(() => {
    const measure = () => {
      if (!listRef.current) return;
      const listRect = listRef.current.getBoundingClientRect();
      const vertical = window.innerWidth < 768;
      setIsVertical(vertical);

      const measured: IconPos[] = [];
      iconRefs.current.forEach((el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        measured.push({
          x: r.left - listRect.left + r.width / 2,
          y: r.top - listRect.top + r.height / 2,
          radius: r.width / 2
        });
      });
      setIcons(measured);
    };

    measure();
    const t1 = setTimeout(measure, 200);
    const t2 = setTimeout(measure, 800);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [steps.length]);

  // ─── Construction du path SVG ───
  useEffect(() => {
    if (icons.length < 2) return;

    const orbitR = icons[0].radius + 8;

    if (!isVertical) {
      // HORIZONTAL : arc PAR LE HAUT des icônes intermédiaires
      let d = `M ${icons[0].x} ${icons[0].y}`;
      for (let i = 1; i < icons.length - 1; i++) {
        const ic = icons[i];
        d += ` L ${ic.x - orbitR} ${ic.y}`;
        d += ` A ${orbitR} ${orbitR} 0 0 1 ${ic.x + orbitR} ${ic.y}`;
      }
      const last = icons[icons.length - 1];
      d += ` L ${last.x} ${last.y}`;
      setPathD(d);
    } else {
      // VERTICAL (mobile) : arc PAR LA DROITE (sweep = 1)
      let d = `M ${icons[0].x} ${icons[0].y}`;
      for (let i = 1; i < icons.length - 1; i++) {
        const ic = icons[i];
        d += ` L ${ic.x} ${ic.y - orbitR}`;
        d += ` A ${orbitR} ${orbitR} 0 0 1 ${ic.x} ${ic.y + orbitR}`;
      }
      const last = icons[icons.length - 1];
      d += ` L ${last.x} ${last.y}`;
      setPathD(d);
    }
  }, [icons, isVertical]);

  // ─── Mesure de la longueur du path ───
  useEffect(() => {
    if (pathRef.current && pathD) {
      try {
        setTotalLength(pathRef.current.getTotalLength());
      } catch {
        setTotalLength(0);
      }
    }
  }, [pathD]);

  // ─── Progression au scroll ───
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const vh = window.innerHeight;
        const startTop = vh * 0.9;
        const endTop = -rect.height + vh * 0.2;
        const range = startTop - endTop;
        const p = range <= 0 ? 1 : (startTop - rect.top) / range;
        setProgress(Math.max(0, Math.min(1, p)));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ─── Position du ballon le long du path ───
  useEffect(() => {
    if (!pathRef.current || totalLength === 0) return;
    try {
      const pt = pathRef.current.getPointAtLength(progress * totalLength);
      setBallPos({ x: pt.x, y: pt.y });
    } catch {
      if (icons.length >= 2) {
        const s = icons[0];
        const e = icons[icons.length - 1];
        setBallPos({
          x: s.x + (e.x - s.x) * progress,
          y: s.y + (e.y - s.y) * progress
        });
      }
    }
  }, [progress, totalLength, icons]);

  const activeIndex = progress * (steps.length - 1);

  return (
    <div ref={sectionRef} className="relative">
      <div ref={listRef} className="relative">

        {/* ─── SVG invisible : mesure du path ─── */}
        {pathD && (
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          >
            <path ref={pathRef} d={pathD} fill="none" stroke="none" />
          </svg>
        )}

        {/* ─── Ligne droite visible + segment rouge ─── */}
        {icons.length >= 2 && (
          <div
            aria-hidden
            className={cn(
              'absolute bg-white/10',
              isVertical ? 'left-6 w-0.5' : 'top-6 h-0.5'
            )}
            style={
              isVertical
                ? {
                    top: icons[0].y,
                    height: icons[icons.length - 1].y - icons[0].y
                  }
                : {
                    left: icons[0].x,
                    width: icons[icons.length - 1].x - icons[0].x
                  }
            }
          >
            <div
              aria-hidden
              className={cn(
                'absolute left-0 top-0 bg-resa-red',
                isVertical ? 'w-full' : 'h-full'
              )}
              style={
                isVertical
                  ? {
                      height:
                        (icons[icons.length - 1].y - icons[0].y) * progress
                    }
                  : {
                      width:
                        (icons[icons.length - 1].x - icons[0].x) * progress
                    }
              }
            />
          </div>
        )}

        {/* ─── Ballon ─── */}
        {totalLength > 0 && (
          <div
            aria-hidden
            className="absolute grid h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 place-items-center sm:h-4 sm:w-4 md:h-7 md:w-7"
            style={{ left: ballPos.x, top: ballPos.y }}
          >
            <BallIcon />
          </div>
        )}

        {/* ─── Grille des étapes ─── */}
        <div className="relative grid gap-10 md:grid-cols-5 md:gap-4">
          {steps.map((step, i) => {
            const illuminated = activeIndex >= i - 0.15;
            return (
              <div key={step.n} className="relative">
                {/* gap-5 sur mobile (20px) → place pour le ballon */}
                <div className="flex items-start gap-5 md:flex-col md:items-center md:gap-4 md:text-center">
                  <div
                    ref={(el) => {
                      iconRefs.current[i] = el;
                    }}
                    className={cn(
                      'grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 bg-resa-navy text-2xl transition-all duration-500',
                      illuminated
                        ? 'scale-110 border-resa-red ring-4 ring-resa-red/20'
                        : 'border-white/20 ring-4 ring-resa-navy/50'
                    )}
                  >
                    {step.icon}
                  </div>

                  <div className="min-w-0 md:mt-3">
                    <div
                      className={cn(
                        'text-[10px] font-black uppercase tracking-widest transition-colors duration-500',
                        illuminated ? 'text-resa-red' : 'text-white/40'
                      )}
                    >
                      {step.n}
                    </div>
                    <div
                      className={cn(
                        'mt-1 font-display text-lg font-black leading-tight transition-colors duration-500 md:mt-0',
                        illuminated ? 'text-white' : 'text-white/60'
                      )}
                    >
                      {step.title}
                    </div>
                    <p
                      className={cn(
                        'mt-2 text-sm leading-relaxed transition-colors duration-500 md:mt-2',
                        illuminated ? 'text-white/70' : 'text-white/40'
                      )}
                    >
                      {step.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Mini ballon SVG ─── */
function BallIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-full w-full drop-shadow-[0_3px_8px_rgba(220,38,38,0.55)]"
    >
      <defs>
        <radialGradient id="ballGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E5E7EB" />
        </radialGradient>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="14"
        fill="url(#ballGrad)"
        stroke="#DC2626"
        strokeWidth="2.5"
      />
      <polygon points="16,9 20,12 18.5,17 13.5,17 12,12" fill="#0A1F44" />
      <polygon
        points="12,12 8.5,10.5 7,15 10,17 13.5,17"
        fill="#0A1F44"
        opacity="0.85"
      />
      <polygon
        points="20,12 23.5,10.5 25,15 22,17 18.5,17"
        fill="#0A1F44"
        opacity="0.85"
      />
      <polygon
        points="10,17 7,19 8.5,23 12,24 14,20"
        fill="#0A1F44"
        opacity="0.7"
      />
      <polygon
        points="22,17 25,19 23.5,23 20,24 18,20"
        fill="#0A1F44"
        opacity="0.7"
      />
    </svg>
  );
}