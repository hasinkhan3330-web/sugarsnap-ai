import { Flame, Beef, Wheat, Droplet, Leaf } from 'lucide-react';
import type { NutritionSummary } from '@/types';
import { cn } from '@/lib/utils';

interface NutritionSummaryProps {
  summary: NutritionSummary;
  className?: string;
}

const items = [
  { key: 'calories', label: 'Calories', unit: 'kcal', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
  { key: 'protein_g', label: 'Protein', unit: 'g', icon: Beef, color: 'text-blue-500', bg: 'bg-blue-50' },
  { key: 'carbs_g', label: 'Carbs', unit: 'g', icon: Wheat, color: 'text-amber-500', bg: 'bg-amber-50' },
  { key: 'fat_g', label: 'Fat', unit: 'g', icon: Droplet, color: 'text-purple-500', bg: 'bg-purple-50' },
  { key: 'fiber_g', label: 'Fiber', unit: 'g', icon: Leaf, color: 'text-green-500', bg: 'bg-green-50' },
] as const;

export function NutritionSummaryRow({ summary, className }: NutritionSummaryProps) {
  return (
    <div className={cn('grid grid-cols-5 gap-2', className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const value = summary[item.key as keyof NutritionSummary];
        return (
          <div
            key={item.key}
            className="flex flex-col items-center gap-1 rounded-xl bg-card p-2 text-center"
          >
            <div className={cn('flex h-7 w-7 items-center justify-center rounded-full', item.bg)}>
              <Icon className={cn('h-3.5 w-3.5', item.color)} />
            </div>
            <span className="text-sm font-bold text-foreground">{Math.round(value)}</span>
            <span className="text-[9px] text-muted-foreground">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
