import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { Logo } from './Logo';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: tenantLoading, currentTenant } = useTenant();

  if (authLoading || (user && (tenantLoading || !currentTenant))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gray-50">
        <Logo variant="guest-hero" className="animate-pulse" />
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600/50"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
