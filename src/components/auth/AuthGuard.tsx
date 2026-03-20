import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user && profile && !profile.householdId) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}
