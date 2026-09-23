import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function Logo({
  size = 'md',
  className
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeMap = {
    sm: { w: 32, h: 32 },
    md: { w: 44, h: 44 },
    lg: { w: 56, h: 56 },
    xl: { w: 80, h: 80 }
  };

  const dim = sizeMap[size];

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: dim.w, height: dim.h }}>
      <Image
        src="/images/brand/resa-logo.png"
        alt="RESA Sport Academy"
        width={dim.w}
        height={dim.h}
        className="h-full w-full object-contain"
        priority
      />
    </div>
  );
}