import { getSugarLevelInfo } from '@/lib/sugar';
import { cn } from '@/lib/utils';

interface SugarBadgeProps {
  grams: number;
  className?: string;
}

export function SugarBadge({ grams, className }: SugarBadgeProps) {
  const info = getSugarLevelInfo(grams);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        className
      )}
      style={{
        backgroundColor: `${info.color}15`,
        color: info.color,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: info.color }} />
      {info.label}
    </span>
  );
}
