import type { SugarLevel } from '@/types';

export const SUGAR_LEVEL_RANGES = {
  low: { max: 5, label: 'Low', color: '#14B87A' },
  moderate: { max: 15, label: 'Moderate', color: '#F59E0B' },
  high: { max: Infinity, label: 'High', color: '#E53935' },
} as const;

export function getSugarLevel(grams: number): SugarLevel {
  if (grams <= 5) return 'low';
  if (grams <= 15) return 'moderate';
  return 'high';
}

export function getSugarLevelInfo(grams: number) {
  const level = getSugarLevel(grams);
  return {
    level,
    label: SUGAR_LEVEL_RANGES[level].label,
    color: SUGAR_LEVEL_RANGES[level].color,
  };
}

export function getSugarStatus(
  consumed: number,
  target: number
): { level: SugarLevel; label: string; color: string; remaining: number; percent: number } {
  const remaining = Math.max(0, target - consumed);
  const percent = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  let level: SugarLevel = 'low';
  if (percent >= 100) level = 'high';
  else if (percent >= 70) level = 'moderate';
  return {
    level,
    label: SUGAR_LEVEL_RANGES[level].label,
    color: SUGAR_LEVEL_RANGES[level].color,
    remaining,
    percent,
  };
}
