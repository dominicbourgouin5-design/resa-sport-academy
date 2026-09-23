import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function Logo({
  size = 'md',
  className,
  variant = 'default'
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'white';
}) {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20'
  };

  const src = variant === 'white'
    ? '/images/brand/resa-logo-white.png'
    : '/images/brand/resa-logo.png';

  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-full bg-white', sizeMap[size], className)}>
      <Image
        src={src}
        alt="RESA Sport Academy"
        fill
        className="object-contain p-1"
        priority
      />
    </div>
  );
}