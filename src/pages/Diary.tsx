import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Trash2, Coffee, Sun, Moon, Cookie, Camera, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFoodLogs, useDeleteFoodLog } from '@/hooks/use-food-logs';
import { useProfile } from '@/hooks/use-profile';
import { ListSkeleton, CardSkeleton } from '@/components/Skeletons';
import { ErrorState, EmptyState } from '@/components/EmptyState';
import { getDemoDiaryForToday } from '@/lib/demo-data';
import type { FoodLog, MealType, NutritionSummary } from '@/types';

const MEAL_ICONS: Record<MealType, typeof Coffee> = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snacks: Cookie,
};

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

export function DiaryPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: logs, isLoading, isError } = useFoodLogs(user?.id, selectedDate);
  const deleteLog = useDeleteFoodLog();

  const hasRealLogs = (logs?.length ?? 0) > 0;
  const isToday = isSameDay(selectedDate, new Date());
  const demoDiary = isToday ? getDemoDiaryForToday() : [];

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  const summary: NutritionSummary = hasRealLogs
    ? logs!.reduce(
        (acc, log) => ({
          calories: acc.calories + Number(log.total_calories),
          protein_g: acc.protein_g + Number(log.total_protein_g),
          carbs_g: acc.carbs_g + Number(log.total_carbs_g),
          fat_g: acc.fat_g + Number(log.total_fat_g),
          fiber_g: acc.fiber_g + Number(log.total_fiber_g),
          sugar_g: acc.sugar_g + Number(log.total_sugar_g),
          added_sugar_g: acc.added_sugar_g + Number(log.total_added_sugar_g),
        }),
        { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, added_sugar_g: 0 }
      )
    : demoDiary.reduce(
        (acc, entry) => {
          entry.items.forEach((item) => {
            acc.calories += item.calories;
            acc.protein_g += item.protein_g;
            acc.carbs_g += item.carbs_g;
            acc.fat_g += item.fat_g;
            acc.fiber_g += item.fiber_g;
            acc.sugar_g += item.sugar_g;
            acc.added_sugar_g += item.added_sugar_g;
          });
          return acc;
        },
        { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, added_sugar_g: 0 }
      );

  const sugarTarget = profile?.sugar_goal_g ?? 25;
  const calorieTarget = profile?.calorie_goal ?? 2000;

  return (
    <div className="page-container space-y-5">
      <h1 className="text-xl font-bold text-foreground">Diary</h1>

      {/* Date picker */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3">
        <button onClick={() => shiftDate(-1)} aria-label="Previous day" className="p-2">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p className="text-xs text-muted-foreground">
            {isToday ? 'Today' : selectedDate.toLocaleDateString('en-IN', { weekday: 'long' })}
          </p>
        </div>
        <button onClick={() => shiftDate(1)} aria-label="Next day" className="p-2">
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Daily totals */}
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <div className="rounded-2xl border border-sugar/20 bg-sugar/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Daily totals</h2>
            {!hasRealLogs && isToday && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Example
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TotalCard label="Sugar" value={`${summary.sugar_g.toFixed(0)}g`} target={`${sugarTarget}g`} color="#E53935" />
            <TotalCard label="Calories" value={`${summary.calories.toFixed(0)}`} target={`${calorieTarget} kcal`} color="#14B87A" />
            <TotalCard label="Protein" value={`${summary.protein_g.toFixed(0)}g`} target="" color="#3B82F6" />
            <TotalCard label="Carbs" value={`${summary.carbs_g.toFixed(0)}g`} target="" color="#F59E0B" />
          </div>
        </div>
      )}

      {/* Meal sections */}
      {isLoading ? (
        <ListSkeleton items={4} />
      ) : isError ? (
        <ErrorState message="Couldn't load your diary." />
      ) : (
        (['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map((mealType) => {
          const Icon = MEAL_ICONS[mealType];
          const realMealLogs = hasRealLogs ? logs!.filter((l) => l.meal_type === mealType) : [];
          const demoMeal = demoDiary.find((d) => d.meal_type === mealType);

          return (
            <div key={mealType} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground">{MEAL_LABELS[mealType]}</span>
              </div>

              {realMealLogs.length > 0 ? (
                <div className="space-y-2">
                  {realMealLogs.map((log) => (
                    <LogItem
                      key={log.id}
                      log={log}
                      onDelete={() => deleteLog.mutate(log.id)}
                      deleting={deleteLog.isPending}
                    />
                  ))}
                </div>
              ) : demoMeal && demoMeal.items.length > 0 ? (
                <div className="space-y-2">
                  {demoMeal.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl bg-muted/30 p-2.5">
                      <div>
                        <p className="text-xs font-medium text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.serving_label}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-foreground">{item.calories} kcal</p>
                        <p className="text-[10px]" style={{ color: item.sugar_g > 15 ? '#E53935' : '#6b7280' }}>
                          {item.sugar_g}g sugar
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground pl-12">No items logged</p>
              )}
            </div>
          );
        })
      )}

      {/* Add food CTA */}
      <Link
        to="/scan"
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-3.5 text-sm font-semibold text-muted-foreground transition-all hover:border-brand/30 hover:text-brand"
      >
        <Plus className="h-4 w-4" />
        Add food
      </Link>
    </div>
  );
}

function TotalCard({ label, value, target, color }: { label: string; value: string; target: string; color: string }) {
  return (
    <div className="rounded-xl bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>
        {value}
      </p>
      {target && <p className="text-[10px] text-muted-foreground">of {target}</p>}
    </div>
  );
}

function LogItem({ log, onDelete, deleting }: { log: FoodLog; onDelete: () => void; deleting: boolean }) {
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-destructive/5 p-2.5">
        <span className="text-xs text-destructive">Delete this entry?</span>
        <div className="flex gap-2">
          <button onClick={() => setConfirm(false)} className="text-xs font-medium text-muted-foreground">
            Cancel
          </button>
          <button onClick={onDelete} disabled={deleting} className="text-xs font-semibold text-destructive">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-muted/30 p-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card">
        {log.source === 'scan' ? <Camera className="h-3.5 w-3.5 text-brand" /> : <Plus className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-foreground">
          {log.food_log_items?.[0]?.name ?? 'Food entry'}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {Number(log.total_calories).toFixed(0)} kcal · {Number(log.total_sugar_g).toFixed(0)}g sugar
        </p>
      </div>
      <button onClick={() => setConfirm(true)} aria-label="Delete entry" className="p-1.5">
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
