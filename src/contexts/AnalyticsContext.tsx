import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Dashboard,
  DashboardWidget,
  AnalyticsFilter,
  TimeMetricData,
  SourceEffectiveness,
  CostData,
  DiversityMetric,
  RecruiterPerformance,
  PipelineVelocity,
  CustomReport,
  MetricPeriod,
  TimeMetric,
} from '../models/types';
import { announce } from '../components/ScreenReaderAnnouncer';

// Sample data
const defaultDashboards: Dashboard[] = [
  {
    id: '1',
    name: 'Recruiter Overview',
    description: 'Key metrics for recruiters',
    role: 'Recruiter',
    isDefault: true,
    widgets: [
      {
        id: '1',
        dashboardId: '1',
        type: 'KPI',
        title: 'Open Positions',
        metrics: ['openPositions'],
        dimensions: [],
        filters: [],
        settings: {
          period: 'Monthly',
          dateRange: {
            start: new Date(new Date().setDate(1)).toISOString(),
          },
          size: 'Small',
          position: {
            x: 0,
            y: 0,
            width: 1,
            height: 1,
          },
        },
      },
      {
        id: '2',
        dashboardId: '1',
        type: 'Chart',
        title: 'Applications by Source',
        metrics: ['applicationCount'],
        dimensions: ['source'],
        filters: [],
        settings: {
          chartType: 'Pie',
          period: 'Monthly',
          dateRange: {
            start: new Date(new Date().setDate(1)).toISOString(),
          },
          colorScheme: ['#1976d2', '#9c27b0', '#2196f3', '#4caf50', '#ff9800'],
          size: 'Medium',
          position: {
            x: 1,
            y: 0,
            width: 2,
            height: 2,
          },
        },
      },
      {
        id: '3',
        dashboardId: '1',
        type: 'Chart',
        title: 'Time to Fill',
        metrics: ['timeToFill'],
        dimensions: ['department'],
        filters: [],
        settings: {
          chartType: 'Bar',
          period: 'Monthly',
          dateRange: {
            start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(),
          },
          comparison: true,
          comparisonPeriod: 'Monthly',
          target: 30,
          size: 'Large',
          position: {
            x: 0,
            y: 2,
            width: 3,
            height: 2,
          },
        },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    sharedWith: [],
  },
  {
    id: '2',
    name: 'Executive Summary',
    description: 'High-level metrics for executives',
    role: 'Executive',
    isDefault: true,
    widgets: [
      {
        id: '4',
        dashboardId: '2',
        type: 'KPI',
        title: 'Time to Hire',
        metrics: ['timeToHire'],
        dimensions: [],
        filters: [],
        settings: {
          period: 'Quarterly',
          dateRange: {
            start: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
          },
          comparison: true,
          comparisonPeriod: 'Quarterly',
          target: 45,
          size: 'Medium',
          position: {
            x: 0,
            y: 0,
            width: 2,
            height: 1,
          },
        },
      },
      {
        id: '5',
        dashboardId: '2',
        type: 'KPI',
        title: 'Cost Per Hire',
        metrics: ['costPerHire'],
        dimensions: [],
        filters: [],
        settings: {
          period: 'Quarterly',
          dateRange: {
            start: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
          },
          comparison: true,
          comparisonPeriod: 'Quarterly',
          target: 5000,
          size: 'Medium',
          position: {
            x: 2,
            y: 0,
            width: 2,
            height: 1,
          },
        },
      },
      {
        id: '6',
        dashboardId: '2',
        type: 'Chart',
        title: 'Hiring Funnel',
        metrics: ['applicationToHire'],
        dimensions: ['stage'],
        filters: [],
        settings: {
          chartType: 'Funnel',
          period: 'Quarterly',
          dateRange: {
            start: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
          },
          size: 'Large',
          position: {
            x: 0,
            y: 1,
            width: 4,
            height: 2,
          },
        },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    sharedWith: [],
  },
];

// Sample time metrics
const defaultTimeMetrics: TimeMetricData[] = [
  {
    id: '1',
    metric: 'TimeToFill',
    jobId: '1',
    departmentId: '1',
    value: 45,
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
    endDate: new Date().toISOString(),
    breakdown: [
      { stage: 'Applied', days: 1 },
      { stage: 'Screening', days: 5 },
      { stage: 'First Interview', days: 10 },
      { stage: 'Technical Assessment', days: 14 },
      { stage: 'Team Interview', days: 8 },
      { stage: 'Offer', days: 7 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    metric: 'TimeToHire',
    jobId: '2',
    departmentId: '2',
    value: 52,
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
    endDate: new Date().toISOString(),
    breakdown: [
      { stage: 'Applied', days: 1 },
      { stage: 'Screening', days: 6 },
      { stage: 'First Interview', days: 12 },
      { stage: 'Technical Assessment', days: 15 },
      { stage: 'Team Interview', days: 10 },
      { stage: 'Offer', days: 8 },
    ],
    createdAt: new Date().toISOString(),
  },
];

// Sample source effectiveness
const defaultSourceEffectiveness: SourceEffectiveness[] = [
  {
    id: '1',
    source: 'LinkedIn',
    period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    metrics: {
      applicants: 120,
      qualifiedCandidates: 40,
      interviews: 25,
      offers: 12,
      hires: 8,
      conversionRate: 0.067,
      costPerApplicant: 25,
      costPerHire: 375,
      timeToHire: 42,
      qualityOfHire: 4.2,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    source: 'Referral',
    period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    metrics: {
      applicants: 30,
      qualifiedCandidates: 20,
      interviews: 15,
      offers: 10,
      hires: 8,
      conversionRate: 0.267,
      costPerApplicant: 50,
      costPerHire: 187.5,
      timeToHire: 35,
      qualityOfHire: 4.8,
    },
    createdAt: new Date().toISOString(),
  },
];

// Analytics Context type
interface AnalyticsContextType {
  // Dashboards
  dashboards: Dashboard[];
  getDashboard: (id: string) => Dashboard | undefined;
  getDashboardsByRole: (role: string) => Dashboard[];
  createDashboard: (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => Dashboard;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => Dashboard | null;
  deleteDashboard: (id: string) => boolean;

  // Widgets
  createWidget: (
    dashboardId: string,
    widget: Omit<DashboardWidget, 'id' | 'dashboardId'>
  ) => DashboardWidget | null;
  updateWidget: (
    dashboardId: string,
    widgetId: string,
    updates: Partial<DashboardWidget>
  ) => DashboardWidget | null;
  deleteWidget: (dashboardId: string, widgetId: string) => boolean;

  // Time Metrics
  timeMetrics: TimeMetricData[];
  getTimeMetrics: (metric: TimeMetric, filters?: AnalyticsFilter[]) => TimeMetricData[];
  addTimeMetric: (metric: Omit<TimeMetricData, 'id' | 'createdAt'>) => TimeMetricData;

  // Source Effectiveness
  sourceEffectiveness: SourceEffectiveness[];
  getSourceEffectiveness: (period: string, filters?: AnalyticsFilter[]) => SourceEffectiveness[];
  addSourceEffectiveness: (
    data: Omit<SourceEffectiveness, 'id' | 'createdAt'>
  ) => SourceEffectiveness;

  // Cost Data
  getCostData: (period: string, filters?: AnalyticsFilter[]) => CostData[];

  // Diversity Metrics
  getDiversityMetrics: (period: string, filters?: AnalyticsFilter[]) => DiversityMetric[];

  // Recruiter Performance
  getRecruiterPerformance: (
    recruiterId: string,
    period: string
  ) => RecruiterPerformance | undefined;

  // Pipeline Velocity
  getPipelineVelocity: (period: string, filters?: AnalyticsFilter[]) => PipelineVelocity[];

  // Custom Reports
  customReports: CustomReport[];
  getReport: (id: string) => CustomReport | undefined;
  createReport: (report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>) => CustomReport;
  updateReport: (id: string, updates: Partial<CustomReport>) => CustomReport | null;
  deleteReport: (id: string) => boolean;
  runReport: (id: string) => Promise<any[]>;
  scheduleReport: (id: string, schedule: CustomReport['schedule']) => boolean;

  // Data Analysis
  getMetricValue: (metric: string, period: MetricPeriod, filters?: AnalyticsFilter[]) => number;
  getMetricTimeSeries: (
    metric: string,
    period: MetricPeriod,
    dateRange: { start: string; end?: string },
    filters?: AnalyticsFilter[]
  ) => { date: string; value: number }[];
  compareMetrics: (
    metrics: string[],
    period: MetricPeriod,
    filters?: AnalyticsFilter[]
  ) => Record<string, number>;
}

// Create context
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Provider component
export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [dashboards, setDashboards] = useState<Dashboard[]>(defaultDashboards);
  const [timeMetrics, setTimeMetrics] = useState<TimeMetricData[]>(defaultTimeMetrics);
  const [sourceEffectiveness, setSourceEffectiveness] = useState<SourceEffectiveness[]>(
    defaultSourceEffectiveness
  );
  const [costData, setCostData] = useState<CostData[]>([]);
  const [diversityMetrics, setDiversityMetrics] = useState<DiversityMetric[]>([]);
  const [recruiterPerformance, setRecruiterPerformance] = useState<RecruiterPerformance[]>([]);
  const [pipelineVelocity, setPipelineVelocity] = useState<PipelineVelocity[]>([]);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);

  // Dashboard functions
  const getDashboard = (id: string) => {
    return dashboards.find((dashboard) => dashboard.id === id);
  };

  const getDashboardsByRole = (role: string) => {
    return dashboards.filter((dashboard) => dashboard.role === role);
  };

  const createDashboard = (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDashboard: Dashboard = {
      ...dashboard,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDashboards((prev) => [...prev, newDashboard]);
    announce(`Created dashboard: ${newDashboard.name}`);
    return newDashboard;
  };

  const updateDashboard = (id: string, updates: Partial<Dashboard>) => {
    let updatedDashboard: Dashboard | null = null;

    setDashboards((prev) => {
      const updatedDashboards = prev.map((dashboard) => {
        if (dashboard.id === id) {
          updatedDashboard = {
            ...dashboard,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return updatedDashboard;
        }
        return dashboard;
      });

      return updatedDashboards;
    });

    if (updatedDashboard) {
      announce(`Updated dashboard: ${updatedDashboard.name}`);
    }

    return updatedDashboard;
  };

  const deleteDashboard = (id: string) => {
    const dashboardToDelete = dashboards.find((d) => d.id === id);

    if (!dashboardToDelete) {
      return false;
    }

    setDashboards((prev) => prev.filter((d) => d.id !== id));
    announce(`Deleted dashboard: ${dashboardToDelete.name}`);
    return true;
  };

  // Widget functions
  const createWidget = (
    dashboardId: string,
    widget: Omit<DashboardWidget, 'id' | 'dashboardId'>
  ) => {
    const dashboard = dashboards.find((d) => d.id === dashboardId);

    if (!dashboard) {
      return null;
    }

    const newWidget: DashboardWidget = {
      ...widget,
      id: uuidv4(),
      dashboardId,
    };

    const updatedDashboard = updateDashboard(dashboardId, {
      widgets: [...dashboard.widgets, newWidget],
    });

    announce(`Added widget to dashboard: ${dashboard.name}`);
    return updatedDashboard ? newWidget : null;
  };

  const updateWidget = (
    dashboardId: string,
    widgetId: string,
    updates: Partial<DashboardWidget>
  ) => {
    const dashboard = dashboards.find((d) => d.id === dashboardId);

    if (!dashboard) {
      return null;
    }

    let updatedWidget: DashboardWidget | null = null;

    const updatedWidgets = dashboard.widgets.map((widget) => {
      if (widget.id === widgetId) {
        updatedWidget = { ...widget, ...updates };
        return updatedWidget;
      }
      return widget;
    });

    updateDashboard(dashboardId, { widgets: updatedWidgets });

    if (updatedWidget) {
      announce(`Updated widget: ${updatedWidget.title}`);
    }

    return updatedWidget;
  };

  const deleteWidget = (dashboardId: string, widgetId: string) => {
    const dashboard = dashboards.find((d) => d.id === dashboardId);

    if (!dashboard) {
      return false;
    }

    const widgetToDelete = dashboard.widgets.find((w) => w.id === widgetId);

    if (!widgetToDelete) {
      return false;
    }

    const updatedWidgets = dashboard.widgets.filter((widget) => widget.id !== widgetId);

    updateDashboard(dashboardId, { widgets: updatedWidgets });
    announce(`Deleted widget: ${widgetToDelete.title}`);
    return true;
  };

  // Time Metrics functions
  const getTimeMetrics = (metric: TimeMetric, filters?: AnalyticsFilter[]) => {
    let filteredMetrics = timeMetrics.filter((m) => m.metric === metric);

    if (filters && filters.length > 0) {
      filteredMetrics = applyFilters(filteredMetrics, filters);
    }

    return filteredMetrics;
  };

  const addTimeMetric = (metric: Omit<TimeMetricData, 'id' | 'createdAt'>) => {
    const newMetric: TimeMetricData = {
      ...metric,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    setTimeMetrics((prev) => [...prev, newMetric]);
    announce(`Added new time metric data for ${metric.metric}`);
    return newMetric;
  };

  // Source Effectiveness functions
  const getSourceEffectiveness = (period: string, filters?: AnalyticsFilter[]) => {
    let filteredData = sourceEffectiveness.filter((se) => se.period === period);

    if (filters && filters.length > 0) {
      filteredData = applyFilters(filteredData, filters);
    }

    return filteredData;
  };

  const addSourceEffectiveness = (data: Omit<SourceEffectiveness, 'id' | 'createdAt'>) => {
    const newData: SourceEffectiveness = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    setSourceEffectiveness((prev) => [...prev, newData]);
    announce(`Added new source effectiveness data for ${data.source}`);
    return newData;
  };

  // Cost Data functions
  const getCostData = (period: string, filters?: AnalyticsFilter[]) => {
    let filteredData = costData.filter((cd) => cd.period === period);

    if (filters && filters.length > 0) {
      filteredData = applyFilters(filteredData, filters);
    }

    return filteredData;
  };

  // Diversity Metrics functions
  const getDiversityMetrics = (period: string, filters?: AnalyticsFilter[]) => {
    let filteredData = diversityMetrics.filter((dm) => dm.period === period);

    if (filters && filters.length > 0) {
      filteredData = applyFilters(filteredData, filters);
    }

    return filteredData;
  };

  // Recruiter Performance functions
  const getRecruiterPerformance = (recruiterId: string, period: string) => {
    return recruiterPerformance.find(
      (rp) => rp.recruiterId === recruiterId && rp.period === period
    );
  };

  // Pipeline Velocity functions
  const getPipelineVelocity = (period: string, filters?: AnalyticsFilter[]) => {
    let filteredData = pipelineVelocity.filter((pv) => pv.period === period);

    if (filters && filters.length > 0) {
      filteredData = applyFilters(filteredData, filters);
    }

    return filteredData;
  };

  // Custom Reports functions
  const getReport = (id: string) => {
    return customReports.find((report) => report.id === id);
  };

  const createReport = (report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReport: CustomReport = {
      ...report,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomReports((prev) => [...prev, newReport]);
    announce(`Created custom report: ${newReport.name}`);
    return newReport;
  };

  const updateReport = (id: string, updates: Partial<CustomReport>) => {
    let updatedReport: CustomReport | null = null;

    setCustomReports((prev) => {
      const updatedReports = prev.map((report) => {
        if (report.id === id) {
          updatedReport = {
            ...report,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return updatedReport;
        }
        return report;
      });

      return updatedReports;
    });

    if (updatedReport) {
      announce(`Updated custom report: ${updatedReport.name}`);
    }

    return updatedReport;
  };

  const deleteReport = (id: string) => {
    const reportToDelete = customReports.find((r) => r.id === id);

    if (!reportToDelete) {
      return false;
    }

    setCustomReports((prev) => prev.filter((r) => r.id !== id));
    announce(`Deleted custom report: ${reportToDelete.name}`);
    return true;
  };

  const runReport = async (id: string) => {
    const report = customReports.find((r) => r.id === id);

    if (!report) {
      return [];
    }

    // In a real app, this would make an API call to run the report
    // For now, we'll just simulate a response
    announce(`Running custom report: ${report.name}`);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Sample Result 1', value: 42 },
          { id: 2, name: 'Sample Result 2', value: 85 },
          { id: 3, name: 'Sample Result 3', value: 63 },
        ]);
      }, 500);
    });
  };

  const scheduleReport = (id: string, schedule: CustomReport['schedule']) => {
    const report = customReports.find((r) => r.id === id);

    if (!report) {
      return false;
    }

    updateReport(id, { schedule });
    announce(`Scheduled custom report: ${report.name}`);
    return true;
  };

  // Data Analysis functions
  const getMetricValue = (metric: string, period: MetricPeriod, filters?: AnalyticsFilter[]) => {
    // In a real app, this would calculate the actual metric value
    // For now, return a random number for demonstration
    return Math.floor(Math.random() * 100);
  };

  const getMetricTimeSeries = (
    metric: string,
    period: MetricPeriod,
    dateRange: { start: string; end?: string },
    filters?: AnalyticsFilter[]
  ) => {
    // In a real app, this would calculate the time series data
    // For now, generate some random data
    const startDate = new Date(dateRange.start);
    const endDate = dateRange.end ? new Date(dateRange.end) : new Date();

    const data: { date: string; value: number }[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      data.push({
        date: currentDate.toISOString(),
        value: Math.floor(Math.random() * 100),
      });

      // Increment date based on period
      switch (period) {
        case 'Daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'Weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'Monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'Quarterly':
          currentDate.setMonth(currentDate.getMonth() + 3);
          break;
        case 'Yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        default:
          currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return data;
  };

  const compareMetrics = (metrics: string[], period: MetricPeriod, filters?: AnalyticsFilter[]) => {
    // In a real app, this would compare multiple metrics
    // For now, generate random values
    const result: Record<string, number> = {};

    metrics.forEach((metric) => {
      result[metric] = Math.floor(Math.random() * 100);
    });

    return result;
  };

  // Helper function to apply filters
  const applyFilters = <T extends object>(data: T[], filters: AnalyticsFilter[]): T[] => {
    return data.filter((item) => {
      return filters.every((filter) => {
        const itemValue = (item as any)[filter.field];

        switch (filter.operator) {
          case 'equals':
            return itemValue === filter.value;
          case 'notEquals':
            return itemValue !== filter.value;
          case 'contains':
            return typeof itemValue === 'string' && itemValue.includes(String(filter.value));
          case 'greaterThan':
            return typeof itemValue === 'number' && itemValue > filter.value;
          case 'lessThan':
            return typeof itemValue === 'number' && itemValue < filter.value;
          case 'in':
            return filter.values && filter.values.includes(itemValue);
          case 'between':
            return (
              filter.values &&
              filter.values.length === 2 &&
              typeof itemValue === 'number' &&
              itemValue >= filter.values[0] &&
              itemValue <= filter.values[1]
            );
          default:
            return true;
        }
      });
    });
  };

  // Context value
  const value = {
    // Dashboards
    dashboards,
    getDashboard,
    getDashboardsByRole,
    createDashboard,
    updateDashboard,
    deleteDashboard,

    // Widgets
    createWidget,
    updateWidget,
    deleteWidget,

    // Time Metrics
    timeMetrics,
    getTimeMetrics,
    addTimeMetric,

    // Source Effectiveness
    sourceEffectiveness,
    getSourceEffectiveness,
    addSourceEffectiveness,

    // Cost Data
    getCostData,

    // Diversity Metrics
    getDiversityMetrics,

    // Recruiter Performance
    getRecruiterPerformance,

    // Pipeline Velocity
    getPipelineVelocity,

    // Custom Reports
    customReports,
    getReport,
    createReport,
    updateReport,
    deleteReport,
    runReport,
    scheduleReport,

    // Data Analysis
    getMetricValue,
    getMetricTimeSeries,
    compareMetrics,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

// Custom hook to use the context
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
