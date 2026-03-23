import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/auth/AuthGuard';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { OnboardingPage } from './components/auth/OnboardingPage';
import { CollectionPage } from './pages/CollectionPage';
import { ScanPage } from './pages/ScanPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<AuthGuard><OnboardingPage /></AuthGuard>} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <Layout>
                  <CollectionPage />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/scan"
            element={
              <AuthGuard>
                <Layout>
                  <ScanPage />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <Layout>
                  <SettingsPage />
                </Layout>
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
