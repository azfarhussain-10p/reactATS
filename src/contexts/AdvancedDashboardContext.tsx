import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// Types for dashboard widgets
export type WidgetType = 'chart' | 'metric' | 'table' | 'list';
export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';

export interface Widget {
  id: string;
  title: string;
  type: WidgetType;
  chartType?: ChartType;
  size: 'small' | 'medium' | 'large';
  dataSource: string;
  parameters?: Record<string, any>;
  position?: { x: number; y: number };
  refreshInterval?: number; // in minutes
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  isDefault?: boolean;
  allowedRoles: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: string[]; // For select type
}

export interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  allowedRoles: string[];
  parameters: ReportParameter[];
  dataSource: string;
  exportFormats: ('pdf' | 'csv' | 'excel')[];
}

interface AdvancedDashboardContextProps {
  // Dashboard state
  dashboards: Dashboard[];
  selectedDashboardId: string | null;
  setSelectedDashboardId: (id: string) => void;
  createDashboard: (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<Dashboard>;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => Promise<Dashboard>;
  deleteDashboard: (id: string) => Promise<void>;
  
  // Widget management
  addWidget: (dashboardId: string, widget: Omit<Widget, 'id'>) => Promise<Widget>;
  updateWidget: (dashboardId: string, widgetId: string, updates: Partial<Widget>) => Promise<Widget>;
  removeWidget: (dashboardId: string, widgetId: string) => Promise<void>;
  
  // Report management
  reports: Report[];
  getReportsForRole: (role: string) => Report[];
  runReport: (reportId: string, parameters?: Record<string, any>) => Promise<any[]>;
  exportReport: (reportId: string, format: 'pdf' | 'csv' | 'excel', parameters?: Record<string, any>) => Promise<Blob>;
  
  // User info
  userRole: string;
  canEdit: boolean;
  
  // Widget data
  fetchWidgetData: (widgetId: string, dashboardId: string) => Promise<any>;
  widgetData: Record<string, any>;
  refreshWidget: (widgetId: string, dashboardId: string) => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

// Create the context
const AdvancedDashboardContext = createContext<AdvancedDashboardContextProps | undefined>(undefined);

// Sample mock data for testing
const mockDashboards: Dashboard[] = [
  {
    id: 'dashboard-1',
    name: 'Recruitment Overview',
    description: 'Key recruitment metrics for the organization',
    widgets: [
      {
        id: 'widget-1',
        title: 'Time to Fill by Department',
        type: 'chart',
        chartType: 'bar',
        size: 'medium',
        dataSource: 'recruitment_metrics',
        parameters: { period: 'last_6_months' }
      },
      {
        id: 'widget-2',
        title: 'Open Positions',
        type: 'metric',
        size: 'small',
        dataSource: 'open_positions'
      },
      {
        id: 'widget-3',
        title: 'Applications by Source',
        type: 'chart',
        chartType: 'pie',
        size: 'medium',
        dataSource: 'application_sources'
      }
    ],
    isDefault: true,
    allowedRoles: ['admin', 'hr_manager', 'recruiter'],
    createdBy: 'admin',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-03-22')
  },
  {
    id: 'dashboard-2',
    name: 'Hiring Cost Analysis',
    description: 'Cost breakdowns for recruitment and hiring',
    widgets: [
      {
        id: 'widget-4',
        title: 'Average Cost per Hire',
        type: 'chart',
        chartType: 'line',
        size: 'large',
        dataSource: 'hiring_costs'
      },
      {
        id: 'widget-5',
        title: 'ROI by Recruitment Channel',
        type: 'table',
        size: 'medium',
        dataSource: 'recruitment_roi'
      }
    ],
    allowedRoles: ['admin', 'hr_manager', 'finance'],
    createdBy: 'admin',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-04-05')
  }
];

const mockReports: Report[] = [
  {
    id: 'report-1',
    name: 'Recruitment Performance Report',
    description: 'Detailed analysis of recruitment performance by department and position',
    category: 'Recruitment',
    allowedRoles: ['admin', 'hr_manager', 'recruiter'],
    parameters: [
      {
        name: 'startDate',
        type: 'date',
        required: true,
        defaultValue: '2023-01-01'
      },
      {
        name: 'endDate',
        type: 'date',
        required: true,
        defaultValue: '2023-12-31'
      },
      {
        name: 'department',
        type: 'select',
        required: false,
        options: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'All']
      }
    ],
    dataSource: 'recruitment_performance',
    exportFormats: ['pdf', 'csv', 'excel']
  },
  {
    id: 'report-2',
    name: 'Hiring Cost Analysis',
    description: 'Breakdown of costs associated with hiring processes',
    category: 'Finance',
    allowedRoles: ['admin', 'hr_manager', 'finance'],
    parameters: [
      {
        name: 'year',
        type: 'select',
        required: true,
        options: ['2021', '2022', '2023'],
        defaultValue: '2023'
      },
      {
        name: 'includeIndirectCosts',
        type: 'select',
        required: false,
        options: ['Yes', 'No'],
        defaultValue: 'Yes'
      }
    ],
    dataSource: 'hiring_costs',
    exportFormats: ['pdf', 'excel']
  },
  {
    id: 'report-3',
    name: 'Candidate Source Effectiveness',
    description: 'Analysis of candidate sources and their effectiveness',
    category: 'Recruitment',
    allowedRoles: ['admin', 'hr_manager', 'recruiter'],
    parameters: [
      {
        name: 'period',
        type: 'select',
        required: true,
        options: ['Last 30 days', 'Last 90 days', 'Last 6 months', 'Last year'],
        defaultValue: 'Last 90 days'
      }
    ],
    dataSource: 'candidate_sources',
    exportFormats: ['pdf', 'csv']
  }
];

// Mock widget data
const mockWidgetData: Record<string, any> = {
  'widget-1': [
    { department: 'Engineering', avg_time_to_fill: 45 },
    { department: 'Sales', avg_time_to_fill: 30 },
    { department: 'Marketing', avg_time_to_fill: 25 },
    { department: 'HR', avg_time_to_fill: 20 },
    { department: 'Finance', avg_time_to_fill: 35 }
  ],
  'widget-2': { count: 28, trend: '+12%' },
  'widget-3': [
    { source: 'LinkedIn', count: 145 },
    { source: 'Indeed', count: 98 },
    { source: 'Referrals', count: 64 },
    { source: 'Company Website', count: 42 },
    { source: 'Other', count: 23 }
  ],
  'widget-4': [
    { month: 'Jan', cost: 5200 },
    { month: 'Feb', cost: 4800 },
    { month: 'Mar', cost: 5100 },
    { month: 'Apr', cost: 4900 },
    { month: 'May', cost: 5300 },
    { month: 'Jun', cost: 5500 }
  ],
  'widget-5': [
    { channel: 'LinkedIn', cost_per_hire: 4200, quality_score: 8.2, roi: 3.4 },
    { channel: 'Indeed', cost_per_hire: 3800, quality_score: 7.5, roi: 2.8 },
    { channel: 'Referrals', cost_per_hire: 2100, quality_score: 9.1, roi: 5.2 },
    { channel: 'Job Fairs', cost_per_hire: 5600, quality_score: 7.8, roi: 1.9 }
  ]
};

// Mock report data
const mockReportData: Record<string, any[]> = {
  'report-1': [
    { department: 'Engineering', positions_filled: 12, avg_time_to_fill: 45.2, cost_per_hire: 5200, top_source: 'LinkedIn' },
    { department: 'Sales', positions_filled: 8, avg_time_to_fill: 30.5, cost_per_hire: 4100, top_source: 'Indeed' },
    { department: 'Marketing', positions_filled: 5, avg_time_to_fill: 25.3, cost_per_hire: 3800, top_source: 'Referrals' },
    { department: 'HR', positions_filled: 3, avg_time_to_fill: 20.1, cost_per_hire: 2900, top_source: 'Company Website' },
    { department: 'Finance', positions_filled: 4, avg_time_to_fill: 35.8, cost_per_hire: 4500, top_source: 'LinkedIn' }
  ],
  'report-2': [
    { department: 'Engineering', advertising_costs: 12000, agency_fees: 25000, internal_costs: 18000, total: 55000 },
    { department: 'Sales', advertising_costs: 8500, agency_fees: 15000, internal_costs: 12000, total: 35500 },
    { department: 'Marketing', advertising_costs: 7000, agency_fees: 12000, internal_costs: 9500, total: 28500 },
    { department: 'HR', advertising_costs: 4500, agency_fees: 8000, internal_costs: 6500, total: 19000 },
    { department: 'Finance', advertising_costs: 6000, agency_fees: 11000, internal_costs: 8000, total: 25000 }
  ],
  'report-3': [
    { source: 'LinkedIn', applicants: 245, interviews: 45, hires: 12, conversion_rate: '4.9%', cost_per_hire: 5200 },
    { source: 'Indeed', applicants: 188, interviews: 32, hires: 8, conversion_rate: '4.3%', cost_per_hire: 4100 },
    { source: 'Referrals', applicants: 64, interviews: 28, hires: 15, conversion_rate: '23.4%', cost_per_hire: 1800 },
    { source: 'Company Website', applicants: 112, interviews: 22, hires: 6, conversion_rate: '5.4%', cost_per_hire: 3200 },
    { source: 'Job Fairs', applicants: 45, interviews: 10, hires: 3, conversion_rate: '6.7%', cost_per_hire: 5800 }
  ]
};

// Provider component
export const AdvancedDashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dashboards, setDashboards] = useState<Dashboard[]>(mockDashboards);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(
    mockDashboards.find(d => d.isDefault)?.id || mockDashboards[0]?.id || null
  );
  const [widgetData, setWidgetData] = useState<Record<string, any>>(mockWidgetData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // For demo purposes, assuming a user role
  const userRole = 'hr_manager';
  const canEdit = ['admin', 'hr_manager'].includes(userRole);
  
  // Set default dashboard on first load
  useEffect(() => {
    const defaultDashboard = dashboards.find(d => d.isDefault && d.allowedRoles.includes(userRole));
    if (defaultDashboard) {
      setSelectedDashboardId(defaultDashboard.id);
    } else {
      // Find first dashboard user can access
      const firstAccessibleDashboard = dashboards.find(d => d.allowedRoles.includes(userRole));
      if (firstAccessibleDashboard) {
        setSelectedDashboardId(firstAccessibleDashboard.id);
      }
    }
  }, []);
  
  // Dashboard operations
  const createDashboard = useCallback(async (
    dashboardData: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ): Promise<Dashboard> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newDashboard: Dashboard = {
        ...dashboardData,
        id: `dashboard-${Date.now()}`,
        createdBy: userRole,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setDashboards(prev => [...prev, newDashboard]);
      return newDashboard;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create dashboard';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);
  
  const updateDashboard = useCallback(async (
    id: string,
    updates: Partial<Dashboard>
  ): Promise<Dashboard> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dashboardIndex = dashboards.findIndex(d => d.id === id);
      if (dashboardIndex === -1) {
        throw new Error('Dashboard not found');
      }
      
      const updatedDashboard = {
        ...dashboards[dashboardIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      const newDashboards = [...dashboards];
      newDashboards[dashboardIndex] = updatedDashboard;
      setDashboards(newDashboards);
      
      return updatedDashboard;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update dashboard';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dashboards]);
  
  const deleteDashboard = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dashboardIndex = dashboards.findIndex(d => d.id === id);
      if (dashboardIndex === -1) {
        throw new Error('Dashboard not found');
      }
      
      const newDashboards = dashboards.filter(d => d.id !== id);
      setDashboards(newDashboards);
      
      // If the deleted dashboard was selected, select another one
      if (selectedDashboardId === id) {
        const defaultDashboard = newDashboards.find(d => d.isDefault);
        if (defaultDashboard) {
          setSelectedDashboardId(defaultDashboard.id);
        } else if (newDashboards.length > 0) {
          setSelectedDashboardId(newDashboards[0].id);
        } else {
          setSelectedDashboardId(null);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete dashboard';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dashboards, selectedDashboardId]);
  
  // Widget operations
  const addWidget = useCallback(async (
    dashboardId: string,
    widgetData: Omit<Widget, 'id'>
  ): Promise<Widget> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dashboardIndex = dashboards.findIndex(d => d.id === dashboardId);
      if (dashboardIndex === -1) {
        throw new Error('Dashboard not found');
      }
      
      const newWidget: Widget = {
        ...widgetData,
        id: `widget-${Date.now()}`
      };
      
      const updatedDashboard = {
        ...dashboards[dashboardIndex],
        widgets: [...dashboards[dashboardIndex].widgets, newWidget],
        updatedAt: new Date()
      };
      
      const newDashboards = [...dashboards];
      newDashboards[dashboardIndex] = updatedDashboard;
      setDashboards(newDashboards);
      
      return newWidget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add widget';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dashboards]);
  
  const updateWidget = useCallback(async (
    dashboardId: string,
    widgetId: string,
    updates: Partial<Widget>
  ): Promise<Widget> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dashboardIndex = dashboards.findIndex(d => d.id === dashboardId);
      if (dashboardIndex === -1) {
        throw new Error('Dashboard not found');
      }
      
      const widgetIndex = dashboards[dashboardIndex].widgets.findIndex(w => w.id === widgetId);
      if (widgetIndex === -1) {
        throw new Error('Widget not found');
      }
      
      const updatedWidget = {
        ...dashboards[dashboardIndex].widgets[widgetIndex],
        ...updates
      };
      
      const updatedWidgets = [...dashboards[dashboardIndex].widgets];
      updatedWidgets[widgetIndex] = updatedWidget;
      
      const updatedDashboard = {
        ...dashboards[dashboardIndex],
        widgets: updatedWidgets,
        updatedAt: new Date()
      };
      
      const newDashboards = [...dashboards];
      newDashboards[dashboardIndex] = updatedDashboard;
      setDashboards(newDashboards);
      
      return updatedWidget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update widget';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dashboards]);
  
  const removeWidget = useCallback(async (
    dashboardId: string,
    widgetId: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dashboardIndex = dashboards.findIndex(d => d.id === dashboardId);
      if (dashboardIndex === -1) {
        throw new Error('Dashboard not found');
      }
      
      const updatedWidgets = dashboards[dashboardIndex].widgets.filter(w => w.id !== widgetId);
      
      const updatedDashboard = {
        ...dashboards[dashboardIndex],
        widgets: updatedWidgets,
        updatedAt: new Date()
      };
      
      const newDashboards = [...dashboards];
      newDashboards[dashboardIndex] = updatedDashboard;
      setDashboards(newDashboards);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove widget';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dashboards]);
  
  // Report operations
  const getReportsForRole = useCallback((role: string): Report[] => {
    return reports.filter(report => report.allowedRoles.includes(role));
  }, [reports]);
  
  const runReport = useCallback(async (
    reportId: string,
    parameters?: Record<string, any>
  ): Promise<any[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Validate parameters
      const missingRequiredParams = report.parameters
        .filter(p => p.required && (!parameters || parameters[p.name] === undefined))
        .map(p => p.name);
      
      if (missingRequiredParams.length > 0) {
        throw new Error(`Missing required parameters: ${missingRequiredParams.join(', ')}`);
      }
      
      // Return mock data for the report
      return mockReportData[reportId] || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run report';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [reports]);
  
  const exportReport = useCallback(async (
    reportId: string,
    format: 'pdf' | 'csv' | 'excel',
    parameters?: Record<string, any>
  ): Promise<Blob> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Check if format is supported
      if (!report.exportFormats.includes(format)) {
        throw new Error(`Export format ${format} not supported for this report`);
      }
      
      // Validate parameters
      const missingRequiredParams = report.parameters
        .filter(p => p.required && (!parameters || parameters[p.name] === undefined))
        .map(p => p.name);
      
      if (missingRequiredParams.length > 0) {
        throw new Error(`Missing required parameters: ${missingRequiredParams.join(', ')}`);
      }
      
      // Create a mock blob for the exported file
      // In a real application, this would call an API endpoint that returns the file
      const data = JSON.stringify(mockReportData[reportId] || []);
      const mimeType = format === 'pdf' 
        ? 'application/pdf' 
        : format === 'csv'
          ? 'text/csv'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      return new Blob([data], { type: mimeType });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export report';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [reports]);
  
  // Widget data operations
  const fetchWidgetData = useCallback(async (
    widgetId: string,
    dashboardId: string
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find the dashboard and widget
      const dashboard = dashboards.find(d => d.id === dashboardId);
      if (!dashboard) {
        throw new Error('Dashboard not found');
      }
      
      const widget = dashboard.widgets.find(w => w.id === widgetId);
      if (!widget) {
        throw new Error('Widget not found');
      }
      
      // Return mock data for the widget
      const data = mockWidgetData[widgetId];
      if (!data) {
        throw new Error('No data available for this widget');
      }
      
      // Update the widget data in state
      setWidgetData(prev => ({
        ...prev,
        [widgetId]: data
      }));
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch widget data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dashboards]);
  
  const refreshWidget = useCallback(async (
    widgetId: string,
    dashboardId: string
  ): Promise<void> => {
    try {
      await fetchWidgetData(widgetId, dashboardId);
    } catch (err) {
      // Error is already handled in fetchWidgetData
      console.error('Failed to refresh widget', err);
    }
  }, [fetchWidgetData]);
  
  const contextValue: AdvancedDashboardContextProps = {
    dashboards,
    selectedDashboardId,
    setSelectedDashboardId,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    
    addWidget,
    updateWidget,
    removeWidget,
    
    reports,
    getReportsForRole,
    runReport,
    exportReport,
    
    userRole,
    canEdit,
    
    fetchWidgetData,
    widgetData,
    refreshWidget,
    
    isLoading,
    error
  };
  
  return (
    <AdvancedDashboardContext.Provider value={contextValue}>
      {children}
    </AdvancedDashboardContext.Provider>
  );
};

// Custom hook for using the context
export const useAdvancedDashboard = (): AdvancedDashboardContextProps => {
  const context = useContext(AdvancedDashboardContext);
  
  if (context === undefined) {
    throw new Error('useAdvancedDashboard must be used within an AdvancedDashboardProvider');
  }
  
  return context;
};

export default AdvancedDashboardContext; 