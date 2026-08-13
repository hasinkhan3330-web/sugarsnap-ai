import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Target, Ruler, LogOut, Shield, Download, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import type { Goal, Units } from '@/types';

const GOALS: { value: Goal; label: string }[] = [
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'gain_weight', label: 'Gain weight' },
  { value: 'reduce_sugar', label: 'Reduce sugar' },
];

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [sugarGoalG, setSugarGoalG] = useState(25);
  const [goal, setGoal] = useState<Goal>('reduce_sugar');
  const [units, setUnits] = useState<Units>('metric');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setCalorieGoal(profile.calorie_goal ?? 2000);
      setSugarGoalG(profile.sugar_goal_g ?? 25);
      setGoal((profile.goal as Goal) ?? 'reduce_sugar');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        input: { full_name: fullName, calorie_goal: calorieGoal, sugar_goal_g: sugarGoalG, goal },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // error handled by mutation
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center pt-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="page-container space-y-5">
      <h1 className="text-xl font-bold text-foreground">Profile</h1>

      {/* User info */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light">
            <User className="h-6 w-6 text-brand" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{fullName || 'Your name'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold text-foreground">Goals & targets</h2>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-xs font-medium text-muted-foreground mb-1.5">Name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-input bg-card py-2.5 px-3 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Goal</label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`rounded-xl border-2 px-3 py-2.5 text-xs font-medium transition-all ${
                  goal === g.value ? 'border-brand bg-brand-light text-brand' : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="calorieGoal" className="block text-xs font-medium text-muted-foreground mb-1.5">Daily calorie target (kcal)</label>
          <input
            id="calorieGoal"
            type="number"
            value={calorieGoal}
            onChange={(e) => setCalorieGoal(parseInt(e.target.value) || 0)}
            className="w-full rounded-xl border border-input bg-card py-2.5 px-3 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <label htmlFor="sugarGoal" className="block text-xs font-medium text-muted-foreground mb-1.5">Daily sugar target (g)</label>
          <input
            id="sugarGoal"
            type="number"
            value={sugarGoalG}
            onChange={(e) => setSugarGoalG(parseInt(e.target.value) || 0)}
            className="w-full rounded-xl border border-input bg-card py-2.5 px-3 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <><Check className="h-4 w-4" /> Saved!</> : 'Save changes'}
        </button>
      </div>

      {/* Units */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Ruler className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Units</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setUnits('metric')}
            className={`rounded-xl border-2 px-3 py-2.5 text-xs font-medium transition-all ${
              units === 'metric' ? 'border-brand bg-brand-light text-brand' : 'border-border bg-card text-muted-foreground'
            }`}
          >
            Metric (kg, cm)
          </button>
          <button
            onClick={() => setUnits('imperial')}
            className={`rounded-xl border-2 px-3 py-2.5 text-xs font-medium transition-all ${
              units === 'imperial' ? 'border-brand bg-brand-light text-brand' : 'border-border bg-card text-muted-foreground'
            }`}
          >
            Imperial (lb, ft)
          </button>
        </div>
      </div>

      {/* Privacy & data export */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Privacy & data</h2>
        </div>
        <p className="text-xs text-muted-foreground">Your food logs, photos, and profile are private. Only you can see your data.</p>
        <button
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground"
        >
          <Download className="h-3.5 w-3.5" />
          Export my data (coming soon)
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleSignOut}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-3.5 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>

      <p className="text-center text-xs text-muted-foreground pb-4">SugarSnap AI · This app provides estimates and is not medical advice.</p>
    </div>
  );
}
