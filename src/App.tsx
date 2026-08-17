import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/use-auth';
import { PublicLayout } from '@/components/PublicLayout';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { LandingPage } from '@/pages/Landing';
import { Skeleton } from '@/components/ui/skeleton';

const LoginPage = lazy(() => import('@/pages/Login').then(m => ({ default: m.LoginPage })));
const OnboardingPage = lazy(() => import('@/pages/Onboarding').then(m => ({ default: m.OnboardingPage })));
const TodayPage = lazy(() => import('@/pages/Today').then(m => ({ default: m.TodayPage })));
const ScanPage = lazy(() => import('@/pages/Scan').then(m => ({ default: m.ScanPage })));
const AnalysisPage = lazy(() => import('@/pages/Analysis').then(m => ({ default: m.AnalysisPage })));
const DiaryPage = lazy(() => import('@/pages/Diary').then(m => ({ default: m.DiaryPage })));
const ProgressPage = lazy(() => import('@/pages/Progress').then(m => ({ default: m.ProgressPage })));
const ProfilePage = lazy(() => import('@/pages/Profile').then(m => ({ default: m.ProfilePage })));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
            </Route>

            {/* Onboarding (auth required but no onboarding check) */}
            <Route path="/onboarding" element={<Suspense fallback={<PageLoader />}><OnboardingPage /></Suspense>} />

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/today" element={<Suspense fallback={<PageLoader />}><TodayPage /></Suspense>} />
              <Route path="/scan" element={<Suspense fallback={<PageLoader />}><ScanPage /></Suspense>} />
              <Route path="/analysis" element={<Suspense fallback={<PageLoader />}><AnalysisPage /></Suspense>} />
              <Route path="/diary" element={<Suspense fallback={<PageLoader />}><DiaryPage /></Suspense>} />
              <Route path="/progress" element={<Suspense fallback={<PageLoader />}><ProgressPage /></Suspense>} />
              <Route path="/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
