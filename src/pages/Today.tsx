import { Link } from 'react-router-dom';
import { Camera, Coffee, Sun, Moon, Cookie, Plus, Info } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { useFoodLogs } from '@/hooks/use-food-logs';
import { SugarRing } from '@/components/SugarRing';
import { NutritionSummaryRow } from '@/components/NutritionSummaryRow';
import { CardSkeleton, NutritionSkeleton, ListSkeleton } from '@/components/Skeletons';
import { ErrorState } from '@/components/EmptyState';
import { getSugarStatus } from '@/lib/sugar';
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

export function TodayPage() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading, isError: profileError } = useProfile(user?.id);
  const { data: logs, isLoading: logsLoading, isError: logsError } = useFoodLogs(user?.id, new Date());

  if (profileLoading || logsLoading) {
    return (
      <div className="page-container space-y-4">
        <CardSkeleton />
        <NutritionSkeleton />
        <ListSkeleton items={3} />
      </div>
    );
  }

  if (profileError || logsError) {
    return (
      <div className="page-container">
        <ErrorState message="Couldn't load your dashboard. Please try again." />
      </div>
    );
  }

  const hasRealLogs = (logs?.length ?? 0) > 0;
  const demoDiary = getDemoDiaryForToday();

  const sugarTarget = profile?.sugar_goal_g ?? 25;
  const calorieTarget = profile?.calorie_goal ?? 2000;

  let summary: NutritionSummary;
  let mealLogs: { meal_type: MealType; items: { name: string; serving_label: string; sugar_g: number; calories: number }[] }[];

  if (hasRealLogs) {
    summary = logs!.reduce(
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
    );
    mealLogs = groupByMeal(logs!);
  } else {
    summary = demoDiary.reduce(
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
    mealLogs = demoDiary.map((d) => ({
      meal_type: d.meal_type,
      items: d.items.map((i) => ({ name: i.name, serving_label: i.serving_label, sugar_g: i.sugar_g, calories: i.calories })),
    }));
  }

  const sugarStatus = getSugarStatus(summary.sugar_g, sugarTarget);
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="page-container space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs text-muted-foreground">{dateStr}</p>
        <h1 className="text-xl font-bold text-foreground">{greeting}, {firstName}</h1>
      </div>

      {/* Sugar Today card */}
      <div className="rounded-2xl border border-sugar/20 bg-gradient-to-br from-sugar/5 to-sugar/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Sugar Today</h2>
            <p className="text-xs text-muted-foreground">Total sugar consumed</p>
          </div>
          {!hasRealLogs && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Example
            </span>
          )}
        </div>
        <div className="flex items-center gap-5">
          <SugarRing consumed={summary.sugar_g} target={sugarTarget} size={130} strokeWidth={12} />
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-lg font-bold" style={{ color: sugarStatus.color }}>
                {sugarStatus.remaining.toFixed(0)}g
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Added sugar</p>
              <p className="text-sm font-semibold text-foreground">{summary.added_sugar_g.toFixed(1)}g</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="text-sm font-semibold text-foreground">{sugarTarget}g/day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calories */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Calories consumed</p>
            <p className="text-xl font-bold text-foreground">
              {summary.calories.toFixed(0)}
              <span className="text-sm font-normal text-muted-foreground"> / {calorieTarget} kcal</span>
            </p>
          </div>
          <div className="flex-1 ml-4">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${Math.min(100, (summary.calories / calorieTarget) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition summary */}
      <div>
        <NutritionSummaryRow summary={summary} />
      </div>

      {/* Scan CTA */}
      <Link
        to="/scan"
        className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Camera className="h-5 w-5" strokeWidth={2.5} />
        Scan food
      </Link>

      {/* Meal timeline */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Today's meals</h2>
        {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map((mealType) => {
          const meal = mealLogs.find((m) => m.meal_type === mealType);
          const Icon = MEAL_ICONS[mealType];
          const mealSugar = meal?.items.reduce((sum, i) => sum + i.sugar_g, 0) ?? 0;
          return (
            <div key={mealType} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-foreground">{MEAL_LABELS[mealType]}</span>
                </div>
                {meal && (
                  <span className="text-xs font-medium" style={{ color: mealSugar > 15 ? '#E53935' : mealSugar > 5 ? '#F59E0B' : '#14B87A' }}>
                    {mealSugar.toFixed(0)}g sugar
                  </span>
                )}
              </div>
              {meal && meal.items.length > 0 ? (
                <div className="space-y-1.5 pl-12">
                  {meal.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{item.name} · {item.serving_label}</span>
                      <span className="text-muted-foreground">{item.calories} kcal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pl-12">
                  <p className="text-xs text-muted-foreground">No items logged</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent logs */}
      {hasRealLogs && logs && logs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Recent logs</h2>
          {logs.slice(0, 5).map((log) => (
            <RecentLogItem key={log.id} log={log} />
          ))}
        </div>
      )}

      {!hasRealLogs && (
        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            These are example entries. Scan your first meal to start tracking your real sugar intake.
          </p>
        </div>
      )}
    </div>
  );
}

function RecentLogItem({ log }: { log: FoodLog }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
        {log.source === 'scan' ? (
          <Camera className="h-4 w-4 text-brand" />
        ) : (
          <Plus className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground capitalize">{log.meal_type}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(log.logged_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">{Number(log.total_calories).toFixed(0)} kcal</p>
        <p className="text-xs" style={{ color: Number(log.total_sugar_g) > 15 ? '#E53935' : '#6b7280' }}>
          {Number(log.total_sugar_g).toFixed(0)}g sugar
        </p>
      </div>
    </div>
  );
}

function groupByMeal(logs: FoodLog[]) {
  return logs.map((log) => ({
    meal_type: log.meal_type,
    items: (log.food_log_items ?? []).map((item) => ({
      name: item.name,
      serving_label: item.serving_label ?? '',
      sugar_g: Number(item.sugar_g),
      calories: Number(item.calories),
    })),
  }));
}
