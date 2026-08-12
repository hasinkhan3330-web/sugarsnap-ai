import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/use-auth';
import { PublicLayout } from '@/components/PublicLayout';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { LandingPage } from '@/pages/Landing';
import { LoginPage } from '@/pages/Login';
import { OnboardingPage } from '@/pages/Onboarding';
import { TodayPage } from '@/pages/Today';
import { ScanPage } from '@/pages/Scan';
import { AnalysisPage } from '@/pages/Analysis';
import { DiaryPage } from '@/pages/Diary';
import { ProgressPage } from '@/pages/Progress';
import { ProfilePage } from '@/pages/Profile';

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
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Onboarding (auth required but no onboarding check) */}
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/today" element={<TodayPage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/diary" element={<DiaryPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
