import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, Check, Info } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import type { AgeRange, ActivityLevel, Goal } from '@/types';

const STEPS = ['name', 'age', 'body', 'activity', 'goal', 'targets', 'disclaimer'] as const;
type Step = (typeof STEPS)[number];

const AGE_RANGES: AgeRange[] = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'light', label: 'Light', desc: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderate', desc: 'Exercise 3-5 days/week' },
  { value: 'active', label: 'Active', desc: 'Exercise 6-7 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Hard exercise daily' },
];

const GOALS: { value: Goal; label: string; desc: string }[] = [
  { value: 'lose_weight', label: 'Lose weight', desc: 'Reduce calories gradually' },
  { value: 'maintain', label: 'Maintain', desc: 'Keep current weight' },
  { value: 'gain_weight', label: 'Gain weight', desc: 'Add healthy calories' },
  { value: 'reduce_sugar', label: 'Reduce sugar', desc: 'Focus on lowering sugar intake' },
];

export function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const [stepIndex, setStepIndex] = useState(0);
  const [fullName, setFullName] = useState('');
  const [ageRange, setAgeRange] = useState<AgeRange | ''>('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>('');
  const [goal, setGoal] = useState<Goal | ''>('');
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [sugarGoalG, setSugarGoalG] = useState(25);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const handleNext = () => {
    setError(null);
    if (step === 'name' && !fullName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (step === 'age' && !ageRange) {
      setError('Please select your age range');
      return;
    }
    if (step === 'body' && (!heightCm || !weightKg)) {
      setError('Please enter your height and weight');
      return;
    }
    if (step === 'activity' && !activityLevel) {
      setError('Please select your activity level');
      return;
    }
    if (step === 'goal' && !goal) {
      setError('Please select a goal');
      return;
    }

    if (goal && step === 'goal') {
      const baseCalorie =
        goal === 'lose_weight' ? 1700 : goal === 'gain_weight' ? 2400 : 2000;
      setCalorieGoal(baseCalorie);
      setSugarGoalG(goal === 'reduce_sugar' ? 20 : 25);
    }

    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const handleFinish = async () => {
    if (!user) return;
    setError(null);
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        input: {
          full_name: fullName,
          age_range: ageRange || null,
          height_cm: heightCm ? parseFloat(heightCm) : null,
          weight_kg: weightKg ? parseFloat(weightKg) : null,
          activity_level: activityLevel || null,
          goal: goal || null,
          calorie_goal: calorieGoal,
          sugar_goal_g: sugarGoalG,
          onboarding_completed: true,
        },
      });
      navigate('/today');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  };

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm safe-top">
        <div className="mx-auto max-w-md px-6 pt-6 pb-3">
          <div className="flex items-center gap-3">
            {stepIndex > 0 && (
              <button onClick={handleBack} aria-label="Go back" className="p-1 -ml-1">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {stepIndex + 1}/{STEPS.length}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 pt-4 pb-16">
        {/* Step: Name */}
        {step === 'name' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">What should we call you?</h2>
            <p className="mt-1 text-sm text-muted-foreground">We'll use this to greet you.</p>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="mt-6 w-full rounded-xl border border-input bg-card py-3.5 px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              autoFocus
            />
          </div>
        )}

        {/* Step: Age */}
        {step === 'age' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">What's your age range?</h2>
            <p className="mt-1 text-sm text-muted-foreground">This helps us tailor your targets.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {AGE_RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => setAgeRange(range)}
                  className={`rounded-2xl border-2 px-4 py-5 text-center transition-all ${
                    ageRange === range
                      ? 'border-brand bg-brand-light text-brand'
                      : 'border-border bg-card text-foreground hover:border-brand/30'
                  }`}
                >
                  <span className="text-lg font-semibold">{range}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Body */}
        {step === 'body' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">Your height and weight</h2>
            <p className="mt-1 text-sm text-muted-foreground">Used to estimate your daily targets.</p>
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-foreground mb-1.5">
                  Height (cm)
                </label>
                <input
                  id="height"
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="170"
                  className="w-full rounded-xl border border-input bg-card py-3.5 px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-foreground mb-1.5">
                  Weight (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="70"
                  className="w-full rounded-xl border border-input bg-card py-3.5 px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step: Activity */}
        {step === 'activity' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">How active are you?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Be honest — we'll adjust your calorie target.</p>
            <div className="mt-6 space-y-3">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setActivityLevel(level.value)}
                  className={`w-full rounded-2xl border-2 px-4 py-4 text-left transition-all ${
                    activityLevel === level.value
                      ? 'border-brand bg-brand-light'
                      : 'border-border bg-card hover:border-brand/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-foreground">{level.label}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{level.desc}</p>
                    </div>
                    {activityLevel === level.value && (
                      <Check className="h-5 w-5 text-brand" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Goal */}
        {step === 'goal' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">What's your goal?</h2>
            <p className="mt-1 text-sm text-muted-foreground">You can change this later.</p>
            <div className="mt-6 space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`w-full rounded-2xl border-2 px-4 py-4 text-left transition-all ${
                    goal === g.value
                      ? 'border-brand bg-brand-light'
                      : 'border-border bg-card hover:border-brand/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-foreground">{g.label}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{g.desc}</p>
                    </div>
                    {goal === g.value && <Check className="h-5 w-5 text-brand" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Targets */}
        {step === 'targets' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">Your daily targets</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We've suggested these based on your profile. Adjust if needed.
            </p>
            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="calorieGoal" className="block text-sm font-medium text-foreground mb-1.5">
                  Daily calorie target
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCalorieGoal((v) => Math.max(1200, v - 50))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-lg font-bold text-foreground"
                  >
                    −
                  </button>
                  <input
                    id="calorieGoal"
                    type="number"
                    value={calorieGoal}
                    onChange={(e) => setCalorieGoal(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-input bg-card py-3 px-4 text-center text-lg font-bold text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <button
                    onClick={() => setCalorieGoal((v) => Math.min(5000, v + 50))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-lg font-bold text-foreground"
                  >
                    +
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">kcal per day</p>
              </div>
              <div>
                <label htmlFor="sugarGoal" className="block text-sm font-medium text-foreground mb-1.5">
                  Daily sugar target
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSugarGoalG((v) => Math.max(5, v - 5))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-lg font-bold text-foreground"
                  >
                    −
                  </button>
                  <input
                    id="sugarGoal"
                    type="number"
                    value={sugarGoalG}
                    onChange={(e) => setSugarGoalG(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-input bg-card py-3 px-4 text-center text-lg font-bold text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <button
                    onClick={() => setSugarGoalG((v) => Math.min(100, v + 5))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-lg font-bold text-foreground"
                  >
                    +
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  grams per day (WHO recommends under 25g added sugar)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step: Disclaimer */}
        {step === 'disclaimer' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">Before you begin</h2>
            <p className="mt-1 text-sm text-muted-foreground">Please read and acknowledge.</p>
            <div className="mt-6 rounded-2xl border border-amber/30 bg-amber/5 p-5">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 shrink-0 text-amber mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Medical disclaimer</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    This app provides estimates and is not medical advice. SugarSnap AI gives
                    nutritional approximations to support awareness. Always consult a qualified
                    health professional before making dietary changes.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              By continuing, you acknowledge that SugarSnap AI provides estimates and is not a
              substitute for professional medical advice.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8">
          {!isLastStep ? (
            <button
              onClick={handleNext}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={updateProfile.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {updateProfile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Start tracking
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
