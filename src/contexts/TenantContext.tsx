import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { tenantService } from '../services/tenant.service';
import { Tenant, TenantContextType, UserRole } from '../types';
import { useAuth } from './AuthContext';
import { logger } from '../utils/logger';
import { detectBrowserTimezone } from '../utils/dateUtils';

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [userTenants, setUserTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  // Fix the Infinite Render Bug
  const refreshTenants = useCallback(async () => {
      if (!user) {
        setUserTenants([]);
        setCurrentTenant(null);
        return;
      }
      try {
        const tenants = await tenantService.getUserTenants(user.id);
        setUserTenants(tenants);
        // Preserve current selection logic
        setCurrentTenant(prev => tenants.find(t => t.id === prev?.id) || tenants[0] || null);
      } catch (error) {
        logger.error('Failed to refresh tenants', error);
        setUserTenants([]);
        setCurrentTenant(null);
      }
  }, [user]);

  // NEW: Allow updating local state immediately after an action
  const updateTenantLocally = (tenantId: string, updates: Partial<Tenant>) => {
      setUserTenants(prev => prev.map(t => t.id === tenantId ? { ...t, ...updates } : t));
      if (currentTenant?.id === tenantId) {
          setCurrentTenant(prev => prev ? { ...prev, ...updates } : null);
      }
  };

  useEffect(() => {
    const loadTenants = async () => {
      setLoading(true);
      try {
        await refreshTenants();
      } finally {
        setLoading(false);
      }
    };

    loadTenants();
  }, [user, refreshTenants]);

  const switchTenant = (tenantId: string) => {
    const tenant = userTenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      localStorage.setItem('currentTenantId', tenantId);
    }
  };

  const createTenant = async (name: string): Promise<string> => {
    if (!user) throw new Error('No user signed in');

    // Smart default: auto-detect browser timezone
    const detectedTimezone = detectBrowserTimezone();

    const tenantId = await tenantService.createTenant(name, user.id);

    // Immediately set timezone after creation
    await tenantService.updateTenant(tenantId, {
      timezone: detectedTimezone,
    });

    const newTenant = await tenantService.getTenant(tenantId);
    if (newTenant) {
      setUserTenants(prev => [...prev, newTenant]);
      setCurrentTenant(newTenant);
      localStorage.setItem('currentTenantId', tenantId);
    }

    return tenantId;
  };

  const updateTenant = async (tenantId: string, data: Partial<Tenant>) => {
    await tenantService.updateTenant(tenantId, data);

    const updatedTenant = await tenantService.getTenant(tenantId);
    if (updatedTenant) {
      setUserTenants(prev =>
        prev.map(t => (t.id === tenantId ? updatedTenant : t))
      );

      if (currentTenant?.id === tenantId) {
        setCurrentTenant(updatedTenant);
      }
    }
  };

  const inviteUserToTenant = async (email: string, role: UserRole) => {
    if (!user || !currentTenant) throw new Error('No user or tenant selected');

    await tenantService.inviteUserToTenant(email, currentTenant.id, role, user.id);
  };

  const value: TenantContextType = {
    currentTenant,
    userTenants,
    loading,
    switchTenant,
    createTenant,
    updateTenant,
    inviteUserToTenant,
    refreshTenants,
    updateTenantLocally,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};
