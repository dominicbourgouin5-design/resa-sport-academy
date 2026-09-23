'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export default function Dropdown({
  trigger,
  children,
  align = 'right'
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuWidth = 200;
      const top = rect.bottom + 6;
      const left = align === 'right'
        ? Math.max(8, rect.right - menuWidth)
        : rect.left;

      setPos({ top, left });
    }
    setOpen((v) => !v);
  };

  // Fermer au scroll / resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <div ref={btnRef} className="inline-block">
        {trigger({ open, toggle })}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[100] w-52 overflow-hidden rounded-lg border border-black/5 bg-white shadow-xl anim-fade-up"
            style={{ top: pos.top, left: pos.left }}
          >
            {children}
          </div>
        </>
      )}
    </>
  );
}