import { TrendingUp, Award, Target, Flame } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { getDemoWeeklyProgress } from '@/lib/demo-data';
import { useProfile } from '@/hooks/use-profile';
import { useAuth } from '@/hooks/use-auth';

export function ProgressPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const weeklyData = getDemoWeeklyProgress();
  const sugarTarget = profile?.sugar_goal_g ?? 25;
  const calorieTarget = profile?.calorie_goal ?? 2000;

  const underTargetDays = weeklyData.filter((d) => d.sugar_g <= sugarTarget).length;
  const streak = 3;

  return (
    <div className="page-container space-y-5">
      <h1 className="text-xl font-bold text-foreground">Progress</h1>

      <div className="flex items-center gap-2 rounded-xl border border-amber/30 bg-amber/5 px-4 py-2.5">
        <span className="text-xs text-muted-foreground">Example data shown — real tracking starts when you log meals.</span>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Target className="h-5 w-5 text-brand" />}
          label="Under target days"
          value={`${underTargetDays}/7`}
          subtitle={`Sugar ≤ ${sugarTarget}g`}
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-sugar" />}
          label="Sugar streak"
          value={`${streak} days`}
          subtitle="Under target"
        />
      </div>

      {/* Weekly sugar trend */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-sugar" />
          <h2 className="text-sm font-semibold text-foreground">Weekly sugar trend</h2>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              formatter={(value: number) => [`${value}g`, 'Sugar']}
            />
            <Line
              type="monotone"
              dataKey="sugar_g"
              stroke="#E53935"
              strokeWidth={2.5}
              dot={{ fill: '#E53935', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Target: {sugarTarget}g/day</span>
        </div>
      </div>

      {/* Weekly calorie trend */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold text-foreground">Weekly calorie trend</h2>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              formatter={(value: number) => [`${value} kcal`, 'Calories']}
            />
            <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
              {weeklyData.map((entry, idx) => (
                <Cell key={idx} fill={entry.calories <= calorieTarget ? '#14B87A' : '#F59E0B'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Target: {calorieTarget} kcal/day</span>
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-4 w-4 text-amber" />
          <h2 className="text-sm font-semibold text-foreground">This week</h2>
        </div>
        <div className="space-y-2">
          <AchievementRow label="Days under sugar target" value={`${underTargetDays}/7`} color={underTargetDays >= 4 ? '#14B87A' : '#F59E0B'} />
          <AchievementRow label="Best sugar day" value={`${Math.min(...weeklyData.map((d) => d.sugar_g))}g`} color="#14B87A" />
          <AchievementRow label="Avg daily sugar" value={`${(weeklyData.reduce((a, d) => a + d.sugar_g, 0) / weeklyData.length).toFixed(0)}g`} color="#E53935" />
          <AchievementRow label="Avg daily calories" value={`${(weeklyData.reduce((a, d) => a + d.calories, 0) / weeklyData.length).toFixed(0)} kcal`} color="#F59E0B" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle }: { icon: React.ReactNode; label: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted mb-2">{icon}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function AchievementRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
