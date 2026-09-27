'use client';

export default function ScrollButton({
  targetId,
  className,
  children
}: {
  targetId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const handleClick = () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}