import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { announce } from '../components/ScreenReaderAnnouncer';

// Types
export interface RecruiterPerformanceMetrics {
  id: string;
  recruiterId: string;
  recruiterName: string;
  period: string; // 'YYYY-MM' format for monthly, 'YYYY-QQ' for quarterly
  metrics: {
    totalSubmittals: number;
    qualifiedCandidates: number;
    interviews: number;
    offers: number;
    hires: number;
    fallOffs: number;
    timeToFill: number; // Average days
    timeToHire: number; // Average days
    candidateNPS: number; // -100 to 100
    hiringManagerNPS: number; // -100 to 100
    offerAcceptanceRate: number; // 0-1
    costPerHire: number;
  };
  targets: {
    totalSubmittals: number;
    hires: number;
    timeToFill: number;
    offerAcceptanceRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterActivity {
  id: string;
  recruiterId: string;
  date: string;
  activities: {
    proactiveOutreach: number;
    screeningCalls: number;
    interviewsScheduled: number;
    offersSent: number;
    applicationReviews: number;
    followUps: number;
    adminTasks: number;
  };
  timeAllocation: {
    sourcing: number; // Minutes
    screening: number;
    coordination: number;
    clientMeetings: number;
    administration: number;
    training: number;
  };
}

export interface RecruiterComparison {
  period: string;
  metrics: string[]; // Which metrics to compare
  recruiters: {
    id: string;
    name: string;
    values: Record<string, number>;
    rank: number;
    percentile: number;
  }[];
}

export interface PerformanceTrend {
  recruiterId: string;
  metric: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  data: Array<{
    date: string;
    value: number;
    target?: number;
    industry?: number; // Industry benchmark if available
  }>;
}

export interface RecruiterEfficiencyAnalysis {
  recruiterId: string;
  period: string;
  timeToConversion: {
    sourcingToScreening: number; // Average days
    screeningToInterview: number;
    interviewToOffer: number;
    offerToAcceptance: number;
  };
  conversionRates: {
    outreachToResponse: number; // 0-1
    screeningToInterview: number;
    interviewToOffer: number;
    offerToAcceptance: number;
  };
  qualityMetrics: {
    candidateQualityScore: number; // 0-100
    hiringManagerSatisfaction: number; // 0-100
    candidateSatisfaction: number; // 0-100
    retentionRate: number; // 0-1, for hired candidates after 90 days
  };
}

export interface PerformanceInsight {
  id: string;
  recruiterId: string;
  date: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'risk';
  metric: string;
  description: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  acknowledged: boolean;
  resolved: boolean;
}

interface RecruiterPerformanceAnalyticsContextType {
  // State
  recruiterMetrics: RecruiterPerformanceMetrics[];
  recruiterActivities: RecruiterActivity[];
  performanceInsights: PerformanceInsight[];
  
  // Basic operations
  getRecruiterMetrics: (recruiterId: string, period: string) => RecruiterPerformanceMetrics | null;
  addRecruiterMetrics: (metrics: Omit<RecruiterPerformanceMetrics, 'id' | 'createdAt' | 'updatedAt'>) => RecruiterPerformanceMetrics;
  updateRecruiterMetrics: (id: string, updates: Partial<RecruiterPerformanceMetrics>) => RecruiterPerformanceMetrics | null;
  recordRecruiterActivity: (activity: Omit<RecruiterActivity, 'id'>) => RecruiterActivity;
  
  // Analysis operations
  compareRecruiters: (recruiterIds: string[], metrics: string[], period: string) => Promise<RecruiterComparison>;
  getPerformanceTrend: (recruiterId: string, metric: string, period: 'daily' | 'weekly' | 'monthly' | 'quarterly', range: { start: string, end?: string }) => Promise<PerformanceTrend>;
  analyzeRecruiterEfficiency: (recruiterId: string, period: string) => Promise<RecruiterEfficiencyAnalysis>;
  
  // Insights
  generatePerformanceInsights: (recruiterId: string) => Promise<PerformanceInsight[]>;
  acknowledgeInsight: (insightId: string) => boolean;
  resolveInsight: (insightId: string, resolution?: string) => boolean;
  
  // Reporting
  exportRecruiterPerformanceReport: (recruiterId: string, period: string, format: 'pdf' | 'csv' | 'excel') => Promise<Blob>;
  getTeamPerformanceSummary: (period: string) => Promise<Record<string, any>>;
}

// Sample data
const sampleRecruiterMetrics: RecruiterPerformanceMetrics[] = [
  {
    id: '1',
    recruiterId: 'r1',
    recruiterName: 'Sarah Johnson',
    period: '2023-11',
    metrics: {
      totalSubmittals: 42,
      qualifiedCandidates: 28,
      interviews: 18,
      offers: 8,
      hires: 6,
      fallOffs: 1,
      timeToFill: 32,
      timeToHire: 28,
      candidateNPS: 65,
      hiringManagerNPS: 78,
      offerAcceptanceRate: 0.75,
      costPerHire: 4250
    },
    targets: {
      totalSubmittals: 40,
      hires: 5,
      timeToFill: 30,
      offerAcceptanceRate: 0.7
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    recruiterId: 'r2',
    recruiterName: 'Michael Chen',
    period: '2023-11',
    metrics: {
      totalSubmittals: 38,
      qualifiedCandidates: 25,
      interviews: 16,
      offers: 7,
      hires: 5,
      fallOffs: 0,
      timeToFill: 34,
      timeToHire: 30,
      candidateNPS: 72,
      hiringManagerNPS: 70,
      offerAcceptanceRate: 0.71,
      costPerHire: 4500
    },
    targets: {
      totalSubmittals: 40,
      hires: 5,
      timeToFill: 30,
      offerAcceptanceRate: 0.7
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const sampleRecruiterActivities: RecruiterActivity[] = [
  {
    id: '1',
    recruiterId: 'r1',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    activities: {
      proactiveOutreach: 15,
      screeningCalls: 5,
      interviewsScheduled: 3,
      offersSent: 1,
      applicationReviews: 20,
      followUps: 8,
      adminTasks: 4
    },
    timeAllocation: {
      sourcing: 120,
      screening: 150,
      coordination: 90,
      clientMeetings: 60,
      administration: 60,
      training: 30
    }
  }
];

const samplePerformanceInsights: PerformanceInsight[] = [
  {
    id: '1',
    recruiterId: 'r1',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'strength',
    metric: 'offerAcceptanceRate',
    description: 'Your offer acceptance rate of 75% is above target and in the top quartile of the organization.',
    recommendation: 'Share your approach in the next team meeting to help others improve their rates.',
    impact: 'high',
    acknowledged: true,
    resolved: false
  },
  {
    id: '2',
    recruiterId: 'r1',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'opportunity',
    metric: 'timeToFill',
    description: 'Your time to fill is slightly above target at 32 days. The screening to interview stage seems to take the longest.',
    recommendation: 'Consider streamlining your interview coordination process or implementing automated scheduling.',
    impact: 'medium',
    acknowledged: false,
    resolved: false
  }
];

// Create context
const RecruiterPerformanceAnalyticsContext = createContext<RecruiterPerformanceAnalyticsContextType | undefined>(undefined);

// Provider component
export const RecruiterPerformanceAnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recruiterMetrics, setRecruiterMetrics] = useState<RecruiterPerformanceMetrics[]>(sampleRecruiterMetrics);
  const [recruiterActivities, setRecruiterActivities] = useState<RecruiterActivity[]>(sampleRecruiterActivities);
  const [performanceInsights, setPerformanceInsights] = useState<PerformanceInsight[]>(samplePerformanceInsights);

  // Get metrics for a recruiter in a specific period
  const getRecruiterMetrics = (recruiterId: string, period: string): RecruiterPerformanceMetrics | null => {
    return recruiterMetrics.find(metrics => metrics.recruiterId === recruiterId && metrics.period === period) || null;
  };

  // Add new recruiter metrics
  const addRecruiterMetrics = (metrics: Omit<RecruiterPerformanceMetrics, 'id' | 'createdAt' | 'updatedAt'>): RecruiterPerformanceMetrics => {
    const timestamp = new Date().toISOString();
    const newMetrics: RecruiterPerformanceMetrics = {
      ...metrics,
      id: uuidv4(),
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    setRecruiterMetrics([...recruiterMetrics, newMetrics]);
    announce(`Added performance metrics for ${metrics.recruiterName} for period ${metrics.period}`);
    return newMetrics;
  };

  // Update existing recruiter metrics
  const updateRecruiterMetrics = (id: string, updates: Partial<RecruiterPerformanceMetrics>): RecruiterPerformanceMetrics | null => {
    const index = recruiterMetrics.findIndex(metrics => metrics.id === id);
    if (index === -1) return null;
    
    const updatedMetrics = {
      ...recruiterMetrics[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const updatedRecruiterMetrics = [...recruiterMetrics];
    updatedRecruiterMetrics[index] = updatedMetrics;
    setRecruiterMetrics(updatedRecruiterMetrics);
    
    announce(`Updated performance metrics for ${updatedMetrics.recruiterName}`);
    return updatedMetrics;
  };

  // Record recruiter activity
  const recordRecruiterActivity = (activity: Omit<RecruiterActivity, 'id'>): RecruiterActivity => {
    const newActivity: RecruiterActivity = {
      ...activity,
      id: uuidv4()
    };
    
    setRecruiterActivities([...recruiterActivities, newActivity]);
    announce(`Recorded activity for recruiter ID ${activity.recruiterId}`);
    return newActivity;
  };

  // Compare recruiters based on selected metrics
  const compareRecruiters = async (
    recruiterIds: string[], 
    metricNames: string[], 
    period: string
  ): Promise<RecruiterComparison> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const relevantMetrics = recruiterMetrics.filter(
      metrics => recruiterIds.includes(metrics.recruiterId) && metrics.period === period
    );
    
    const recruitersData = relevantMetrics.map(metrics => {
      const values: Record<string, number> = {};
      
      // Extract requested metrics
      metricNames.forEach(metricName => {
        // @ts-ignore - Dynamic access to nested properties
        values[metricName] = metrics.metrics[metricName] || 0;
      });
      
      return {
        id: metrics.recruiterId,
        name: metrics.recruiterName,
        values,
        rank: 0, // Will be calculated
        percentile: 0 // Will be calculated
      };
    });
    
    // Calculate ranks for each metric
    metricNames.forEach(metricName => {
      const metricValues = recruitersData.map(r => ({ id: r.id, value: r.values[metricName] }));
      
      // Sort based on whether higher is better (most metrics) or lower is better (like time to fill)
      const isLowerBetter = metricName.includes('time') || metricName.includes('cost') || metricName.includes('fallOff');
      
      metricValues.sort((a, b) => isLowerBetter 
        ? a.value - b.value 
        : b.value - a.value
      );
      
      // Assign ranks
      metricValues.forEach((item, index) => {
        const recruiter = recruitersData.find(r => r.id === item.id);
        if (recruiter) {
          recruiter.rank += index + 1;
          
          // Calculate percentile (higher is better)
          recruiter.percentile = Math.round(
            ((metricValues.length - index) / metricValues.length) * 100
          );
        }
      });
    });
    
    // Overall ranking - sort by average rank
    recruitersData.sort((a, b) => a.rank - b.rank);
    
    return {
      period,
      metrics: metricNames,
      recruiters: recruitersData
    };
  };

  // Get performance trend for a specific metric
  const getPerformanceTrend = async (
    recruiterId: string,
    metric: string,
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    range: { start: string, end?: string }
  ): Promise<PerformanceTrend> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Mock data generation based on period
    const data: Array<{ date: string, value: number, target?: number, industry?: number }> = [];
    const startDate = new Date(range.start);
    const endDate = range.end ? new Date(range.end) : new Date();
    
    let current = new Date(startDate);
    
    // Generate time series based on period type
    while (current <= endDate) {
      let dateStr: string;
      
      // Format date based on period
      switch (period) {
        case 'daily':
          dateStr = current.toISOString().split('T')[0];
          current.setDate(current.getDate() + 1);
          break;
        case 'weekly':
          dateStr = `${current.getFullYear()}-W${Math.ceil((current.getDate() + current.getDay()) / 7)}`;
          current.setDate(current.getDate() + 7);
          break;
        case 'monthly':
          dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarterly':
          const quarter = Math.floor(current.getMonth() / 3) + 1;
          dateStr = `${current.getFullYear()}-Q${quarter}`;
          current.setMonth(current.getMonth() + 3);
          break;
      }
      
      // Base value with some randomness
      const baseValue = getBaseValueForMetric(metric);
      const variance = baseValue * 0.2; // 20% variance
      const value = baseValue + (Math.random() * variance) - (variance / 2);
      
      // Add target and industry benchmark for some metrics
      const target = getTargetForMetric(metric);
      const industry = Math.random() > 0.3 ? getIndustryBenchmarkForMetric(metric) : undefined;
      
      data.push({
        date: dateStr,
        value: Number(value.toFixed(2)),
        target,
        industry
      });
    }
    
    return {
      recruiterId,
      metric,
      period,
      data
    };
  };

  // Helper functions for mock data
  const getBaseValueForMetric = (metric: string): number => {
    // Return reasonable base values for different metrics
    switch (metric) {
      case 'totalSubmittals': return 40;
      case 'qualifiedCandidates': return 25;
      case 'interviews': return 15;
      case 'offers': return 8;
      case 'hires': return 5;
      case 'timeToFill': return 32;
      case 'timeToHire': return 28;
      case 'candidateNPS': return 65;
      case 'hiringManagerNPS': return 70;
      case 'offerAcceptanceRate': return 0.75;
      case 'costPerHire': return 4500;
      default: return 50;
    }
  };
  
  const getTargetForMetric = (metric: string): number | undefined => {
    // Return target values for metrics that typically have targets
    switch (metric) {
      case 'totalSubmittals': return 40;
      case 'hires': return 5;
      case 'timeToFill': return 30;
      case 'timeToHire': return 25;
      case 'offerAcceptanceRate': return 0.7;
      case 'costPerHire': return 5000;
      default: return undefined;
    }
  };
  
  const getIndustryBenchmarkForMetric = (metric: string): number | undefined => {
    // Return industry benchmark values for some metrics
    switch (metric) {
      case 'timeToFill': return 42;
      case 'timeToHire': return 35;
      case 'candidateNPS': return 55;
      case 'hiringManagerNPS': return 60;
      case 'offerAcceptanceRate': return 0.65;
      case 'costPerHire': return 5200;
      default: return undefined;
    }
  };

  // Analyze recruiter efficiency
  const analyzeRecruiterEfficiency = async (recruiterId: string, period: string): Promise<RecruiterEfficiencyAnalysis> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 900));
    
    // Mock efficiency analysis
    return {
      recruiterId,
      period,
      timeToConversion: {
        sourcingToScreening: 2.5,
        screeningToInterview: 5.2,
        interviewToOffer: 7.8,
        offerToAcceptance: 3.1
      },
      conversionRates: {
        outreachToResponse: 0.28,
        screeningToInterview: 0.65,
        interviewToOffer: 0.42,
        offerToAcceptance: 0.78
      },
      qualityMetrics: {
        candidateQualityScore: 78,
        hiringManagerSatisfaction: 82,
        candidateSatisfaction: 85,
        retentionRate: 0.92
      }
    };
  };

  // Generate performance insights
  const generatePerformanceInsights = async (recruiterId: string): Promise<PerformanceInsight[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get all metrics for the recruiter
    const recruiterData = recruiterMetrics.filter(metrics => metrics.recruiterId === recruiterId);
    if (!recruiterData.length) return [];
    
    // Mock insights generation
    const insights: PerformanceInsight[] = [];
    const timestamp = new Date().toISOString();
    
    // Sample insights based on the most recent metrics
    const latestMetrics = recruiterData.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
    
    // Check if metrics exceed targets
    if (latestMetrics.metrics.hires > latestMetrics.targets.hires) {
      insights.push({
        id: uuidv4(),
        recruiterId,
        date: timestamp,
        type: 'strength',
        metric: 'hires',
        description: `You've exceeded your hiring target with ${latestMetrics.metrics.hires} hires against a target of ${latestMetrics.targets.hires}.`,
        recommendation: 'Share your successful strategies with the team.',
        impact: 'high',
        acknowledged: false,
        resolved: false
      });
    }
    
    // Check if metrics are below targets
    if (latestMetrics.metrics.timeToFill > latestMetrics.targets.timeToFill) {
      insights.push({
        id: uuidv4(),
        recruiterId,
        date: timestamp,
        type: 'weakness',
        metric: 'timeToFill',
        description: `Your average time to fill of ${latestMetrics.metrics.timeToFill} days is above the target of ${latestMetrics.targets.timeToFill} days.`,
        recommendation: 'Review your process for potential bottlenecks, especially in the interview coordination phase.',
        impact: 'medium',
        acknowledged: false,
        resolved: false
      });
    }
    
    // Add opportunity insight
    if (latestMetrics.metrics.candidateNPS < 70) {
      insights.push({
        id: uuidv4(),
        recruiterId,
        date: timestamp,
        type: 'opportunity',
        metric: 'candidateNPS',
        description: `Your candidate NPS score of ${latestMetrics.metrics.candidateNPS} has room for improvement.`,
        recommendation: 'Consider enhancing candidate communication and feedback practices.',
        impact: 'medium',
        acknowledged: false,
        resolved: false
      });
    }
    
    return insights;
  };

  // Acknowledge an insight
  const acknowledgeInsight = (insightId: string): boolean => {
    const index = performanceInsights.findIndex(insight => insight.id === insightId);
    if (index === -1) return false;
    
    const updatedInsight = {
      ...performanceInsights[index],
      acknowledged: true
    };
    
    const updatedInsights = [...performanceInsights];
    updatedInsights[index] = updatedInsight;
    setPerformanceInsights(updatedInsights);
    
    announce(`Insight acknowledged`);
    return true;
  };

  // Resolve an insight
  const resolveInsight = (insightId: string, resolution?: string): boolean => {
    const index = performanceInsights.findIndex(insight => insight.id === insightId);
    if (index === -1) return false;
    
    const updatedInsight = {
      ...performanceInsights[index],
      acknowledged: true,
      resolved: true,
      description: resolution 
        ? `${performanceInsights[index].description}\n\nResolution: ${resolution}`
        : performanceInsights[index].description
    };
    
    const updatedInsights = [...performanceInsights];
    updatedInsights[index] = updatedInsight;
    setPerformanceInsights(updatedInsights);
    
    announce(`Insight resolved`);
    return true;
  };

  // Export recruiter performance report
  const exportRecruiterPerformanceReport = async (
    recruiterId: string, 
    period: string, 
    format: 'pdf' | 'csv' | 'excel'
  ): Promise<Blob> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // This would generate a report in the requested format
    // For now, just return a mock blob
    return new Blob(['Mock report data'], { type: `application/${format}` });
  };

  // Get team performance summary
  const getTeamPerformanceSummary = async (period: string): Promise<Record<string, any>> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter metrics for the specified period
    const periodMetrics = recruiterMetrics.filter(metrics => metrics.period === period);
    
    // Calculate averages across all recruiters
    const teamSummary = {
      totalRecruiters: periodMetrics.length,
      averages: {
        totalSubmittals: 0,
        qualifiedCandidates: 0,
        interviews: 0,
        offers: 0,
        hires: 0,
        timeToFill: 0,
        timeToHire: 0,
        candidateNPS: 0,
        hiringManagerNPS: 0,
        offerAcceptanceRate: 0,
        costPerHire: 0
      },
      performance: {
        aboveTarget: 0,
        meetingTarget: 0,
        belowTarget: 0
      },
      topPerformer: {
        name: '',
        metric: '',
        value: 0
      }
    };
    
    if (periodMetrics.length > 0) {
      // Calculate averages
      Object.keys(teamSummary.averages).forEach(key => {
        // @ts-ignore - Dynamic access
        const total = periodMetrics.reduce((sum, metrics) => sum + metrics.metrics[key], 0);
        // @ts-ignore - Dynamic assignment
        teamSummary.averages[key] = Number((total / periodMetrics.length).toFixed(2));
      });
      
      // Calculate performance against targets
      periodMetrics.forEach(metrics => {
        let meetsTarget = 0;
        let exceedsTarget = 0;
        let belowTarget = 0;
        
        Object.keys(metrics.targets).forEach(key => {
          // @ts-ignore - Dynamic access
          const value = metrics.metrics[key];
          // @ts-ignore - Dynamic access
          const target = metrics.targets[key];
          
          // For "lower is better" metrics like time to fill
          const isLowerBetter = key.includes('time') || key.includes('cost');
          
          if (isLowerBetter) {
            if (value < target * 0.9) exceedsTarget++;
            else if (value <= target) meetsTarget++;
            else belowTarget++;
          } else {
            if (value > target * 1.1) exceedsTarget++;
            else if (value >= target) meetsTarget++;
            else belowTarget++;
          }
        });
        
        // Count overall performance
        if (exceedsTarget > belowTarget) teamSummary.performance.aboveTarget++;
        else if (belowTarget > meetsTarget + exceedsTarget) teamSummary.performance.belowTarget++;
        else teamSummary.performance.meetingTarget++;
      });
      
      // Find top performer (simple heuristic - most hires)
      const topHires = Math.max(...periodMetrics.map(m => m.metrics.hires));
      const topPerformer = periodMetrics.find(m => m.metrics.hires === topHires);
      
      if (topPerformer) {
        teamSummary.topPerformer = {
          name: topPerformer.recruiterName,
          metric: 'hires',
          value: topHires
        };
      }
    }
    
    return teamSummary;
  };

  const value: RecruiterPerformanceAnalyticsContextType = {
    recruiterMetrics,
    recruiterActivities,
    performanceInsights,
    getRecruiterMetrics,
    addRecruiterMetrics,
    updateRecruiterMetrics,
    recordRecruiterActivity,
    compareRecruiters,
    getPerformanceTrend,
    analyzeRecruiterEfficiency,
    generatePerformanceInsights,
    acknowledgeInsight,
    resolveInsight,
    exportRecruiterPerformanceReport,
    getTeamPerformanceSummary
  };

  return (
    <RecruiterPerformanceAnalyticsContext.Provider value={value}>
      {children}
    </RecruiterPerformanceAnalyticsContext.Provider>
  );
};

// Custom hook for consuming the context
export const useRecruiterPerformanceAnalytics = () => {
  const context = useContext(RecruiterPerformanceAnalyticsContext);
  if (context === undefined) {
    throw new Error('useRecruiterPerformanceAnalytics must be used within a RecruiterPerformanceAnalyticsProvider');
  }
  return context;
}; 