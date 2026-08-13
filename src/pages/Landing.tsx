import { Link } from 'react-router-dom';
import { Camera, ShieldCheck, Sparkles, ArrowRight, Leaf, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function LandingPage() {
  const { user } = useAuth();
  const ctaTo = user ? '/today' : '/login';

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-light via-background to-background">
      {/* Hero */}
      <div className="mx-auto max-w-md px-6 pt-16 pb-8">
        <div className="flex items-center gap-2 mb-8 animate-fade-in">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand">
            <Camera className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-foreground">SugarSnap AI</span>
        </div>

        <h1 className="text-4xl font-bold leading-tight text-foreground animate-fade-in">
          Snap it.
          <br />
          <span className="text-brand">Know your sugar.</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed animate-fade-in">
          India's first sugar-first nutrition tracker. Snap a photo of your meal and instantly
          see total sugar, added sugar, and hidden sugar — with healthier swaps for everyday
          Indian food.
        </p>

        <Link
          to={ctaTo}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:scale-[1.02] active:scale-[0.98] animate-scale-in"
        >
          {user ? 'Go to Today' : "Get started — it's free"}
          <ArrowRight className="h-5 w-5" />
        </Link>

        {user && (
          <Link
            to="/login"
            className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Use a different account
          </Link>
        )}
      </div>

      {/* Feature cards */}
      <div className="mx-auto max-w-md px-6 space-y-4 pb-8">
        <FeatureCard
          icon={<Camera className="h-6 w-6 text-sugar" />}
          title="Snap any meal"
          description="Take a photo of your food. We identify the dish, portion, and sugar content — no manual entry needed."
        />
        <FeatureCard
          icon={<AlertCircle className="h-6 w-6 text-sugar" />}
          title="Sugar is the hero, not calories"
          description="See total sugar, added sugar, and hidden sugar at a glance. Clear low, moderate, and high labels for every food."
          highlight
        />
        <FeatureCard
          icon={<Leaf className="h-6 w-6 text-brand" />}
          title="Smarter swaps"
          description="High-sugar result? Get a healthier alternative instantly — tailored to Indian meals and portions you know."
        />
        <FeatureCard
          icon={<ShieldCheck className="h-6 w-6 text-brand" />}
          title="Private by default"
          description="Your food logs and photos stay yours. Nothing is shared publicly."
        />
      </div>

      {/* How it works */}
      <div className="mx-auto max-w-md px-6 pb-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          How it works
        </h2>
        <div className="space-y-3">
          <StepCard step={1} title="Snap your food" description="Open the scanner and point at any meal or snack." />
          <StepCard step={2} title="See sugar first" description="Get instant sugar breakdown with a clear low, moderate, or high label." />
          <StepCard step={3} title="Track and improve" description="Log to your diary, watch your weekly trend, and build a sugar streak." />
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 pb-12">
        <div className="flex items-start gap-2 rounded-2xl border border-border bg-card p-4">
          <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-amber" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            SugarSnap AI provides estimates and is not medical advice. Always consult a qualified
            health professional for dietary guidance.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 pb-16 text-center">
        <p className="text-xs text-muted-foreground">
          Made in India for Indian meals — katori, roti, chai, lassi, and more.
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all hover:shadow-md ${
        highlight
          ? 'border-sugar/30 bg-sugar/5'
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white text-sm font-bold">
        {step}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
