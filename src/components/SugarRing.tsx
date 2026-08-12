import { getSugarStatus } from '@/lib/sugar';

interface SugarRingProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function SugarRing({
  consumed,
  target,
  size = 180,
  strokeWidth = 14,
  showLabel = true,
}: SugarRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const status = getSugarStatus(consumed, target);
  const offset = circumference - (status.percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FFE0E0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={status.color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{consumed.toFixed(0)}</span>
          <span className="text-xs text-muted-foreground">of {target}g sugar</span>
          <span
            className="mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
            style={{ backgroundColor: status.color }}
          >
            {status.label}
          </span>
        </div>
      )}
    </div>
  );
}
