'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`rounded px-2 py-1 uppercase transition ${
            l === locale
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}