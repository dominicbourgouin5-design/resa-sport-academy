import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-resa-navy text-white/80">      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <div className="font-display text-2xl font-bold text-white">RESA</div>
          <p className="mt-2 text-sm">{t('tagline')}</p>
        </div>

        <div>
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-white/60">
            {t('quickLinks')}
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/resa"   className="hover:text-white">{tn('resa')}</Link></li>
            <li><Link href="/ligue"  className="hover:text-white">{tn('ligue')}</Link></li>
            <li><Link href="/ecoles" className="hover:text-white">{tn('ecoles')}</Link></li>
            <li><Link href="/sponsors" className="hover:text-white">{tn('sponsors')}</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-white/60">
            {t('contactTitle')}
          </div>
          <p className="text-sm">Abidjan, Côte d'Ivoire</p>
          <p className="text-sm">contact@resasportacademy.ci</p>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {year} RESA Sport Academy — {t('rights')}
      </div>
    </footer>
  );
}