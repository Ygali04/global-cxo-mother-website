import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserTier } from '@/portal/data/mock/types';
import { useAuth } from '@/portal/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredTier?: UserTier[];
}

function AccessDenied(): React.ReactElement {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
      <p className="max-w-md text-muted-foreground">
        Your account tier does not have permission to view this page. Contact an
        administrator if you believe this is an error.
      </p>
    </div>
  );
}

export function ProtectedRoute({
  children,
  requiredTier,
}: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated, currentUser, authHydrated } = useAuth();
  const location = useLocation();

  if (!authHydrated) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-sm">Loading session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (requiredTier && currentUser) {
    const hasAccess =
      currentUser.tier === 'dev' || requiredTier.includes(currentUser.tier);
    if (!hasAccess) {
      return <AccessDenied />;
    }
  }

  return <>{children}</>;
}
