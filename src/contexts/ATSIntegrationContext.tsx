import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { announce } from '../components/ScreenReaderAnnouncer';

// Types of ATS components that can be integrated
type ATSComponentType = 
  | 'analytics' 
  | 'dashboard' 
  | 'candidates' 
  | 'jobs' 
  | 'interviews' 
  | 'reports';

// Integration context interface
interface ATSIntegrationContextType {
  // Navigation functions
  navigateTo: (component: ATSComponentType, params?: Record<string, any>) => void;
  
  // Cross-component data sharing
  shareDataWith: (sourceComponent: ATSComponentType, targetComponent: ATSComponentType, data: any) => void;
  getSharedData: (fromComponent: ATSComponentType, forComponent: ATSComponentType) => any;
  
  // Status tracking
  lastComponentAccessed: ATSComponentType | null;
  
  // Cross-component integration state
  integrationState: Record<string, any>;
  updateIntegrationState: (key: string, value: any) => void;
}

// Create context
const ATSIntegrationContext = createContext<ATSIntegrationContextType | undefined>(undefined);

// Provider component
export const ATSIntegrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Create a safe version of navigate that won't throw errors
  let navigateFunction: (path: string) => void;
  
  try {
    const navigate = useNavigate();
    navigateFunction = navigate;
  } catch (error) {
    console.warn("Router context not available for ATSIntegrationProvider. Navigation will be limited.");
    // Fallback navigate function
    navigateFunction = (path: string) => {
      console.warn(`ATSIntegration attempted to navigate to ${path}, but no router is available.`);
      if (typeof window !== 'undefined') {
        window.location.href = path; // Fallback to direct location change
      }
    };
  }
  
  const [lastComponentAccessed, setLastComponentAccessed] = useState<ATSComponentType | null>(null);
  const [sharedData, setSharedData] = useState<Record<string, Record<string, any>>>({});
  const [integrationState, setIntegrationState] = useState<Record<string, any>>({
    analyticsEnabled: true,
    dashboardIntegrated: true,
    candidatesLinked: true,
    jobsConnected: true,
    interviewsTracked: true,
    reportsGenerated: true
  });

  // Component route mapping
  const routeMap: Record<ATSComponentType, string> = {
    analytics: '/analytics',
    dashboard: '/dashboard',
    candidates: '/candidates',
    jobs: '/job-openings',
    interviews: '/interviews',
    reports: '/reports'
  };

  // Navigate to specific component
  const navigateTo = (component: ATSComponentType, params?: Record<string, any>) => {
    let path = routeMap[component];
    
    // Handle any parameters
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      path += `?${queryParams.toString()}`;
    }
    
    // Update last accessed component
    setLastComponentAccessed(component);
    
    // Announce navigation for accessibility
    try {
      announce(`Navigating to ${component}`);
    } catch (error) {
      console.warn("Screen reader announcer not available:", error);
    }
    
    // Navigate to component
    navigateFunction(path);
  };

  // Share data between components
  const shareDataWith = (sourceComponent: ATSComponentType, targetComponent: ATSComponentType, data: any) => {
    setSharedData(prev => {
      const newData = { ...prev };
      if (!newData[sourceComponent]) {
        newData[sourceComponent] = {};
      }
      newData[sourceComponent][targetComponent] = data;
      return newData;
    });
  };

  // Get shared data
  const getSharedData = (fromComponent: ATSComponentType, forComponent: ATSComponentType) => {
    return sharedData[fromComponent]?.[forComponent] || null;
  };

  // Update integration state
  const updateIntegrationState = (key: string, value: any) => {
    setIntegrationState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Context value
  const value: ATSIntegrationContextType = {
    navigateTo,
    shareDataWith,
    getSharedData,
    lastComponentAccessed,
    integrationState,
    updateIntegrationState
  };

  return (
    <ATSIntegrationContext.Provider value={value}>
      {children}
    </ATSIntegrationContext.Provider>
  );
};

// Custom hook for using the context
export const useATSIntegration = () => {
  const context = useContext(ATSIntegrationContext);
  if (context === undefined) {
    throw new Error('useATSIntegration must be used within an ATSIntegrationProvider');
  }
  return context;
};

export default ATSIntegrationProvider; 