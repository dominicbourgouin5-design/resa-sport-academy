import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

const base = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary:   'bg-resa-royal text-white hover:bg-resa-navy',
  secondary: 'bg-resa-red   text-white hover:bg-red-700',
  outline:   'border-2 border-current text-current hover:bg-current/10',
  ghost:     'text-resa-navy hover:bg-resa-gray'
};

export function Button({
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function LinkButton({
  href,
  variant = 'primary',
  className,
  children
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}