import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { api } from '../services/ApiService';

// Define tenant interface
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
  plan: 'basic' | 'professional' | 'enterprise';
  features: string[];
  settings: {
    dataRetentionDays: number;
    maxUsers: number;
    maxStorage: number; // in MB
    allowCustomFields: boolean;
    customDomain?: string;
    customizations: Record<string, any>;
  };
  createdAt: string;
  updatedAt: string;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
  setCurrentTenant: (tenant: Tenant) => void;
  switchTenant: (tenantId: string) => Promise<boolean>;
  refreshTenantData: () => Promise<boolean>;
  isTenantAdmin: boolean;
  canAccessFeature: (featureName: string) => boolean;
  getTenantSettings: <T>(key: string, defaultValue?: T) => T;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const DEFAULT_TENANT: Tenant = {
  id: 'default',
  name: 'Default Organization',
  domain: 'default',
  isActive: true,
  plan: 'basic',
  features: ['candidates', 'jobs', 'basic_analytics'],
  settings: {
    dataRetentionDays: 90,
    maxUsers: 5,
    maxStorage: 1000,
    allowCustomFields: false,
    customizations: {}
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const TenantProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTenantAdmin, setIsTenantAdmin] = useState<boolean>(false);

  // Load tenant info on mount
  useEffect(() => {
    const initializeTenant = async () => {
      try {
        setLoading(true);
        // Try to fetch from local storage first for quick loading
        const storedTenant = localStorage.getItem('current_tenant');
        
        if (storedTenant) {
          setCurrentTenant(JSON.parse(storedTenant));
        }
        
        // Then fetch latest from API
        await refreshTenantData();
      } catch (err) {
        console.error('Error loading tenant data:', err);
        setError('Failed to load organization data');
        
        // Fall back to default tenant if we couldn't load
        setCurrentTenant(DEFAULT_TENANT);
      } finally {
        setLoading(false);
      }
    };

    initializeTenant();
  }, []);

  // Update API headers and storage when tenant changes
  useEffect(() => {
    if (currentTenant) {
      // Set headers for API requests
      api.setHeaders({
        'X-Tenant-ID': currentTenant.id
      });
      
      // Store in localStorage for persistence
      localStorage.setItem('current_tenant', JSON.stringify(currentTenant));
      
      // Set specific tenant theme variables
      if (currentTenant.primaryColor) {
        document.documentElement.style.setProperty(
          '--tenant-primary-color', 
          currentTenant.primaryColor
        );
      }
      
      if (currentTenant.secondaryColor) {
        document.documentElement.style.setProperty(
          '--tenant-secondary-color', 
          currentTenant.secondaryColor
        );
      }
      
      // Check if user is a tenant admin
      checkTenantAdminStatus();
    }
  }, [currentTenant]);

  const refreshTenantData = async (): Promise<boolean> => {
    try {
      // Get all tenants the user has access to
      const tenantsResponse = await api.get<Tenant[]>('/tenants');
      setTenants(tenantsResponse || []);
      
      // If we don't have a current tenant yet, use the first one
      if (tenantsResponse && tenantsResponse.length > 0) {
        if (!currentTenant) {
          setCurrentTenant(tenantsResponse[0]);
        } else {
          // Update current tenant data if it exists in the list
          const updatedCurrentTenant = tenantsResponse.find(t => t.id === currentTenant.id);
          if (updatedCurrentTenant) {
            setCurrentTenant(updatedCurrentTenant);
          }
        }
        return true;
      } else {
        // If user has no tenants, set default
        setCurrentTenant(DEFAULT_TENANT);
        return false;
      }
    } catch (err) {
      console.error('Error refreshing tenant data:', err);
      setError('Failed to refresh organization data');
      return false;
    }
  };

  const switchTenant = async (tenantId: string): Promise<boolean> => {
    try {
      // Find tenant in our list
      const tenant = tenants.find(t => t.id === tenantId);
      
      if (!tenant) {
        throw new Error('Tenant not found');
      }
      
      if (!tenant.isActive) {
        throw new Error('This organization account is inactive');
      }
      
      // Set the current tenant
      setCurrentTenant(tenant);
      
      // Update user's last accessed tenant in the API
      await api.post('/users/me/preferences', {
        lastTenantId: tenantId
      });
      
      // Reload key data for the new tenant
      // This would trigger refetching of candidates, jobs, etc.
      window.dispatchEvent(new CustomEvent('tenant-changed', {
        detail: { tenantId }
      }));
      
      return true;
    } catch (err) {
      console.error('Error switching tenant:', err);
      setError('Failed to switch organization');
      return false;
    }
  };

  const checkTenantAdminStatus = async () => {
    try {
      if (!currentTenant) return;
      
      // This would be a real API call in production
      const userRoles = await api.get(`/tenants/${currentTenant.id}/my-roles`);
      setIsTenantAdmin(userRoles?.includes('tenant_admin') || false);
    } catch (err) {
      console.error('Error checking tenant admin status:', err);
      setIsTenantAdmin(false);
    }
  };

  const canAccessFeature = (featureName: string): boolean => {
    if (!currentTenant) return false;
    
    // Check if the feature is in the tenant's features list
    return currentTenant.features.includes(featureName);
  };

  const getTenantSettings = <T,>(key: string, defaultValue?: T): T => {
    if (!currentTenant) return defaultValue as T;
    
    // Get nested keys using dot notation (e.g., 'customizations.theme')
    const keys = key.split('.');
    let value: any = currentTenant.settings;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue as T;
      }
    }
    
    return (value as T) ?? defaultValue as T;
  };

  const value: TenantContextType = {
    currentTenant,
    tenants,
    loading,
    error,
    setCurrentTenant,
    switchTenant,
    refreshTenantData,
    isTenantAdmin,
    canAccessFeature,
    getTenantSettings
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  
  return context;
};

export default TenantContext; 