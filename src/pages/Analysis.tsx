import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Check, Loader2, Sparkles, Info, ArrowRightLeft } from 'lucide-react';
import { getDemoFood, scaleNutrition, demoFoodToLogItem } from '@/lib/demo-data';
import { getSugarLevelInfo } from '@/lib/sugar';
import { SugarBadge } from '@/components/SugarBadge';
import { useAuth } from '@/hooks/use-auth';
import { useCreateFoodLog } from '@/hooks/use-food-logs';
import type { MealType } from '@/types';

export function AnalysisPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const createLog = useCreateFoodLog();

  const demoId = searchParams.get('demo') ?? 'masala-chai-sugar';
  const food = getDemoFood(demoId) ?? getDemoFood('masala-chai-sugar')!;

  const [quantity, setQuantity] = useState(food.base_quantity);
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType());
  const [added, setAdded] = useState(false);

  const nutrition = useMemo(() => scaleNutrition(food, quantity), [food, quantity]);
  const sugarInfo = getSugarLevelInfo(nutrition.sugar_g);

  const handleAdd = async () => {
    if (!user) return;
    setAdded(true);
    try {
      await createLog.mutateAsync({
        input: {
          logged_at: new Date().toISOString(),
          meal_type: mealType,
          source: 'scan',
          total_calories: nutrition.calories,
          total_protein_g: nutrition.protein_g,
          total_carbs_g: nutrition.carbs_g,
          total_fat_g: nutrition.fat_g,
          total_fiber_g: nutrition.fiber_g,
          total_sugar_g: nutrition.sugar_g,
          total_added_sugar_g: nutrition.added_sugar_g,
          ai_confidence: 0.85,
        },
        items: [demoFoodToLogItem(food, quantity)],
      });
      setTimeout(() => navigate('/today'), 800);
    } catch {
      setAdded(false);
    }
  };

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="p-1 -ml-1">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Food analysis</h1>
      </div>

      {/* AI estimate notice */}
      <div className="flex items-start gap-2 rounded-xl border border-amber/30 bg-amber/5 px-4 py-3">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber" />
        <p className="text-xs text-muted-foreground">
          AI estimate — confirm food and portion for best accuracy.
        </p>
      </div>

      {/* Food header */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-3xl">
            {food.emoji}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{food.name}</h2>
            <p className="text-sm text-muted-foreground">{food.serving_label}</p>
            <div className="mt-1.5">
              <SugarBadge grams={nutrition.sugar_g} />
            </div>
          </div>
        </div>
      </div>

      {/* SUGAR CARD — biggest, red */}
      <div
        className="rounded-2xl border-2 p-5"
        style={{ borderColor: `${sugarInfo.color}40`, backgroundColor: `${sugarInfo.color}08` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Sugar</p>
            <p className="text-4xl font-bold" style={{ color: sugarInfo.color }}>
              {nutrition.sugar_g.toFixed(1)}g
            </p>
          </div>
          <div className="text-right">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-white"
              style={{ backgroundColor: sugarInfo.color }}
            >
              {sugarInfo.label}
            </span>
            <p className="text-xs text-muted-foreground mt-1.5">
              Added: {nutrition.added_sugar_g.toFixed(1)}g
            </p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-sugar/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (nutrition.sugar_g / 25) * 100)}%`,
              backgroundColor: sugarInfo.color,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {nutrition.sugar_g <= 5
            ? 'Low sugar — great choice!'
            : nutrition.sugar_g <= 15
            ? 'Moderate sugar — keep an eye on portions.'
            : 'High sugar — consider a healthier swap below.'}
        </p>
      </div>

      {/* Quantity stepper */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground mb-3">Quantity</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity((q) => Math.max(0.5, q - 0.5))}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-lg font-bold text-foreground active:scale-95"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-2xl font-bold text-foreground">{quantity}</span>
            <span className="text-sm text-muted-foreground ml-1">{food.unit}{quantity > 1 ? 's' : ''}</span>
          </div>
          <button
            onClick={() => setQuantity((q) => q + 0.5)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-lg font-bold text-foreground active:scale-95"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Full nutrition */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Nutrition breakdown</h3>
        <div className="space-y-2.5">
          <NutritionRow label="Calories" value={`${nutrition.calories.toFixed(0)} kcal`} />
          <NutritionRow label="Protein" value={`${nutrition.protein_g.toFixed(1)} g`} />
          <NutritionRow label="Carbs" value={`${nutrition.carbs_g.toFixed(1)} g`} />
          <NutritionRow label="Fat" value={`${nutrition.fat_g.toFixed(1)} g`} />
          <NutritionRow label="Fiber" value={`${nutrition.fiber_g.toFixed(1)} g`} />
          <NutritionRow label="Total Sugar" value={`${nutrition.sugar_g.toFixed(1)} g`} highlight />
          <NutritionRow label="Added Sugar" value={`${nutrition.added_sugar_g.toFixed(1)} g`} highlight />
        </div>
      </div>

      {/* Meal selector */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground mb-3">Log as</p>
        <div className="grid grid-cols-4 gap-2">
          {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map((meal) => (
            <button
              key={meal}
              onClick={() => setMealType(meal)}
              className={`rounded-xl border-2 px-2 py-2.5 text-xs font-medium capitalize transition-all ${
                mealType === meal
                  ? 'border-brand bg-brand-light text-brand'
                  : 'border-border bg-card text-muted-foreground'
              }`}
            >
              {meal}
            </button>
          ))}
        </div>
      </div>

      {/* Better swaps */}
      {food.swaps && food.swaps.length > 0 && nutrition.sugar_g > 15 && (
        <div className="rounded-2xl border border-brand/20 bg-brand-light/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRightLeft className="h-4 w-4 text-brand" />
            <h3 className="text-sm font-semibold text-foreground">Better swaps</h3>
          </div>
          <div className="space-y-2">
            {food.swaps.map((swap, idx) => (
              <div key={idx} className="flex items-start gap-2 rounded-xl bg-card p-3">
                <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-brand" />
                <p className="text-xs text-foreground">{swap}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add to diary */}
      <button
        onClick={handleAdd}
        disabled={added || createLog.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Added to diary!
          </>
        ) : createLog.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Plus className="h-5 w-5" strokeWidth={2.5} />
            Add to Diary
          </>
        )}
      </button>

      <Link to="/scan" className="block text-center text-sm text-muted-foreground hover:text-foreground">
        Scan another food
      </Link>
    </div>
  );
}

function NutritionRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${highlight ? 'font-semibold text-sugar' : 'text-muted-foreground'}`}>
        {label}
      </span>
      <span className={`text-sm font-semibold ${highlight ? 'text-sugar' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}

function getDefaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 18) return 'snacks';
  return 'dinner';
}
