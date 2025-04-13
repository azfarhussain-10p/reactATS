import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Candidate } from '../models/types';

// Advanced analytics types
interface PredictiveModel {
  id: string;
  name: string;
  description: string;
  type: 'hiring-success' | 'time-to-hire' | 'candidate-quality' | 'custom';
  accuracy: number;
  lastTrainedAt: Date;
  parameters: Record<string, any>;
}

interface DataVisualization {
  id: string;
  name: string;
  type: 'scatter' | 'heatmap' | 'sankey' | 'network' | 'bubble' | 'custom';
  config: Record<string, any>;
  dataSource: string;
}

interface CorrelationAnalysis {
  id: string;
  name: string;
  factorA: string;
  factorB: string;
  coefficient: number;
  significance: number;
  sampleSize: number;
  createdAt: Date;
}

interface TrendAnalysis {
  id: string;
  name: string;
  metric: string;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  data: Array<{ date: Date; value: number }>;
  growthRate: number;
  seasonalityIndex?: Record<string, number>;
}

interface SegmentAnalysis {
  id: string;
  name: string;
  segmentBy: string;
  segments: Array<{
    name: string;
    count: number;
    metrics: Record<string, number>;
  }>;
  createdAt: Date;
}

interface CohortAnalysis {
  id: string;
  name: string;
  cohortDefinition: string;
  periods: string[];
  metrics: string[];
  data: Record<string, Record<string, number>>;
}

// Context state type
interface AdvancedAnalyticsContextType {
  // State
  predictiveModels: PredictiveModel[];
  visualizations: DataVisualization[];
  correlations: CorrelationAnalysis[];
  trends: TrendAnalysis[];
  segments: SegmentAnalysis[];
  cohorts: CohortAnalysis[];
  
  // Predictive model functions
  createPredictiveModel: (model: Omit<PredictiveModel, 'id'>) => PredictiveModel;
  updatePredictiveModel: (id: string, updates: Partial<PredictiveModel>) => PredictiveModel | null;
  deletePredictiveModel: (id: string) => boolean;
  trainModel: (id: string) => Promise<PredictiveModel | null>;
  predictOutcome: (modelId: string, data: any) => Promise<any>;
  
  // Visualization functions
  createVisualization: (viz: Omit<DataVisualization, 'id'>) => DataVisualization;
  updateVisualization: (id: string, updates: Partial<DataVisualization>) => DataVisualization | null;
  deleteVisualization: (id: string) => boolean;
  
  // Analysis functions
  runCorrelationAnalysis: (factorA: string, factorB: string) => Promise<CorrelationAnalysis>;
  runTrendAnalysis: (metric: string, period: TrendAnalysis['period']) => Promise<TrendAnalysis>;
  runSegmentAnalysis: (segmentBy: string) => Promise<SegmentAnalysis>;
  runCohortAnalysis: (cohortDefinition: string, periods: string[], metrics: string[]) => Promise<CohortAnalysis>;
  
  // Data export/import
  exportAnalysis: (analysisId: string, type: string) => Promise<Blob>;
  importExternalData: (data: any, type: string) => Promise<boolean>;
}

// Create the context with default values
const AdvancedAnalyticsContext = createContext<AdvancedAnalyticsContextType | null>(null);

// Sample data
const samplePredictiveModels: PredictiveModel[] = [
  {
    id: "model-1",
    name: "Hiring Success Predictor",
    description: "Predicts probability of successful hire based on resume and interview data",
    type: "hiring-success",
    accuracy: 0.87,
    lastTrainedAt: new Date("2023-05-15"),
    parameters: {
      features: ["experience", "education", "skills", "interview_score"],
      algorithm: "random_forest",
      hyperparameters: { trees: 100, depth: 8 }
    }
  },
  {
    id: "model-2",
    name: "Time-to-Hire Estimator",
    description: "Estimates days to hire based on role and department",
    type: "time-to-hire",
    accuracy: 0.79,
    lastTrainedAt: new Date("2023-06-02"),
    parameters: {
      features: ["job_level", "department", "location", "required_skills"],
      algorithm: "gradient_boosting",
      hyperparameters: { iterations: 150, learning_rate: 0.1 }
    }
  }
];

const sampleVisualizations: DataVisualization[] = [
  {
    id: "viz-1",
    name: "Skills Distribution Network",
    type: "network",
    config: {
      nodeSize: "candidate_count",
      edgeWidth: "correlation",
      colorBy: "department"
    },
    dataSource: "candidate_skills"
  },
  {
    id: "viz-2",
    name: "Hiring Funnel Sankey",
    type: "sankey",
    config: {
      flows: ["application", "screening", "interview", "offer", "hire"],
      colorScheme: "blue-green",
      showLabels: true
    },
    dataSource: "pipeline_stages"
  }
];

// Provider component
export const AdvancedAnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>(samplePredictiveModels);
  const [visualizations, setVisualizations] = useState<DataVisualization[]>(sampleVisualizations);
  const [correlations, setCorrelations] = useState<CorrelationAnalysis[]>([]);
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [segments, setSegments] = useState<SegmentAnalysis[]>([]);
  const [cohorts, setCohorts] = useState<CohortAnalysis[]>([]);
  
  // Predictive model functions
  const createPredictiveModel = (model: Omit<PredictiveModel, 'id'>): PredictiveModel => {
    const newModel: PredictiveModel = {
      ...model,
      id: `model-${Date.now()}`
    };
    setPredictiveModels([...predictiveModels, newModel]);
    return newModel;
  };
  
  const updatePredictiveModel = (id: string, updates: Partial<PredictiveModel>): PredictiveModel | null => {
    const index = predictiveModels.findIndex(model => model.id === id);
    if (index === -1) return null;
    
    const updatedModel = { ...predictiveModels[index], ...updates };
    const updatedModels = [...predictiveModels];
    updatedModels[index] = updatedModel;
    setPredictiveModels(updatedModels);
    
    return updatedModel;
  };
  
  const deletePredictiveModel = (id: string): boolean => {
    const index = predictiveModels.findIndex(model => model.id === id);
    if (index === -1) return false;
    
    const updatedModels = [...predictiveModels];
    updatedModels.splice(index, 1);
    setPredictiveModels(updatedModels);
    
    return true;
  };
  
  const trainModel = async (id: string): Promise<PredictiveModel | null> => {
    // Simulation of model training
    const index = predictiveModels.findIndex(model => model.id === id);
    if (index === -1) return null;
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate training time
    
    const updatedModel = { 
      ...predictiveModels[index],
      lastTrainedAt: new Date(),
      accuracy: Math.min(0.98, predictiveModels[index].accuracy + Math.random() * 0.05)
    };
    
    const updatedModels = [...predictiveModels];
    updatedModels[index] = updatedModel;
    setPredictiveModels(updatedModels);
    
    return updatedModel;
  };
  
  const predictOutcome = async (modelId: string, data: any): Promise<any> => {
    const model = predictiveModels.find(m => m.id === modelId);
    if (!model) throw new Error("Model not found");
    
    // Simulate prediction calculation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock response based on model type
    switch (model.type) {
      case 'hiring-success':
        return { probability: 0.75 + Math.random() * 0.2, confidence: 0.82 };
      case 'time-to-hire':
        return { days: Math.floor(15 + Math.random() * 30), rangeMin: 12, rangeMax: 45 };
      case 'candidate-quality':
        return { score: 7.5 + Math.random() * 2, topSkills: ["javascript", "react", "typescript"] };
      default:
        return { result: Math.random() };
    }
  };
  
  // Visualization functions
  const createVisualization = (viz: Omit<DataVisualization, 'id'>): DataVisualization => {
    const newViz: DataVisualization = {
      ...viz,
      id: `viz-${Date.now()}`
    };
    setVisualizations([...visualizations, newViz]);
    return newViz;
  };
  
  const updateVisualization = (id: string, updates: Partial<DataVisualization>): DataVisualization | null => {
    const index = visualizations.findIndex(viz => viz.id === id);
    if (index === -1) return null;
    
    const updatedViz = { ...visualizations[index], ...updates };
    const updatedVisualizations = [...visualizations];
    updatedVisualizations[index] = updatedViz;
    setVisualizations(updatedVisualizations);
    
    return updatedViz;
  };
  
  const deleteVisualization = (id: string): boolean => {
    const index = visualizations.findIndex(viz => viz.id === id);
    if (index === -1) return false;
    
    const updatedVisualizations = [...visualizations];
    updatedVisualizations.splice(index, 1);
    setVisualizations(updatedVisualizations);
    
    return true;
  };
  
  // Analysis functions
  const runCorrelationAnalysis = async (factorA: string, factorB: string): Promise<CorrelationAnalysis> => {
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newAnalysis: CorrelationAnalysis = {
      id: `corr-${Date.now()}`,
      name: `Correlation: ${factorA} vs ${factorB}`,
      factorA,
      factorB,
      coefficient: (Math.random() * 2 - 1).toFixed(2) as unknown as number,
      significance: Math.random().toFixed(3) as unknown as number,
      sampleSize: Math.floor(50 + Math.random() * 200),
      createdAt: new Date()
    };
    
    setCorrelations([...correlations, newAnalysis]);
    return newAnalysis;
  };
  
  const runTrendAnalysis = async (metric: string, period: TrendAnalysis['period']): Promise<TrendAnalysis> => {
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Generate trend data
    const data = [];
    const now = new Date();
    const points = period === 'weekly' ? 12 : period === 'monthly' ? 12 : period === 'quarterly' ? 8 : 5;
    
    let baseline = 50 + Math.random() * 50;
    const trend = Math.random() * 0.1 - 0.05; // -5% to +5% trend
    
    for (let i = 0; i < points; i++) {
      const date = new Date(now);
      
      switch (period) {
        case 'weekly':
          date.setDate(date.getDate() - (points - i) * 7);
          break;
        case 'monthly':
          date.setMonth(date.getMonth() - (points - i));
          break;
        case 'quarterly':
          date.setMonth(date.getMonth() - (points - i) * 3);
          break;
        case 'yearly':
          date.setFullYear(date.getFullYear() - (points - i));
          break;
      }
      
      baseline *= (1 + trend);
      const noise = baseline * (Math.random() * 0.2 - 0.1);
      data.push({
        date,
        value: Math.max(0, baseline + noise)
      });
    }
    
    const newAnalysis: TrendAnalysis = {
      id: `trend-${Date.now()}`,
      name: `${metric} ${period} Trend Analysis`,
      metric,
      period,
      data,
      growthRate: trend * points,
    };
    
    setTrends([...trends, newAnalysis]);
    return newAnalysis;
  };
  
  const runSegmentAnalysis = async (segmentBy: string): Promise<SegmentAnalysis> => {
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate segment data
    const segments = [];
    const segmentNames = 
      segmentBy === 'department' ? ['Engineering', 'Marketing', 'Sales', 'Operations', 'HR'] :
      segmentBy === 'seniority' ? ['Junior', 'Mid-level', 'Senior', 'Lead', 'Executive'] :
      segmentBy === 'location' ? ['Remote', 'US', 'Europe', 'Asia', 'Other'] :
      ['Segment A', 'Segment B', 'Segment C', 'Segment D'];
    
    const totalCandidates = 250 + Math.floor(Math.random() * 500);
    let remainingCandidates = totalCandidates;
    
    for (let i = 0; i < segmentNames.length; i++) {
      // Last segment gets remaining candidates
      const count = i === segmentNames.length - 1 
        ? remainingCandidates 
        : Math.floor(remainingCandidates * (0.1 + Math.random() * 0.4));
      
      remainingCandidates -= count;
      
      segments.push({
        name: segmentNames[i],
        count,
        metrics: {
          'avg_time_to_hire': Math.floor(15 + Math.random() * 30),
          'conversion_rate': Math.round(Math.random() * 100) / 100,
          'offer_acceptance': Math.round(50 + Math.random() * 50) / 100,
        }
      });
    }
    
    const newAnalysis: SegmentAnalysis = {
      id: `segment-${Date.now()}`,
      name: `${segmentBy} Segment Analysis`,
      segmentBy,
      segments,
      createdAt: new Date()
    };
    
    setSegments([...segments, newAnalysis]);
    return newAnalysis;
  };
  
  const runCohortAnalysis = async (
    cohortDefinition: string, 
    periods: string[], 
    metrics: string[]
  ): Promise<CohortAnalysis> => {
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate cohort data
    const data: Record<string, Record<string, number>> = {};
    
    // For each period, generate metrics
    periods.forEach(period => {
      data[period] = {};
      metrics.forEach(metric => {
        data[period][metric] = Math.round(Math.random() * 100) / 100;
      });
    });
    
    const newAnalysis: CohortAnalysis = {
      id: `cohort-${Date.now()}`,
      name: `${cohortDefinition} Cohort Analysis`,
      cohortDefinition,
      periods,
      metrics,
      data
    };
    
    setCohorts([...cohorts, newAnalysis]);
    return newAnalysis;
  };
  
  // Data export/import
  const exportAnalysis = async (analysisId: string, type: string): Promise<Blob> => {
    // Find the requested analysis
    let analysisData: any = null;
    
    if (type === 'correlation') {
      analysisData = correlations.find(a => a.id === analysisId);
    } else if (type === 'trend') {
      analysisData = trends.find(a => a.id === analysisId);
    } else if (type === 'segment') {
      analysisData = segments.find(a => a.id === analysisId);
    } else if (type === 'cohort') {
      analysisData = cohorts.find(a => a.id === analysisId);
    } else if (type === 'model') {
      analysisData = predictiveModels.find(a => a.id === analysisId);
    } else if (type === 'visualization') {
      analysisData = visualizations.find(a => a.id === analysisId);
    }
    
    if (!analysisData) {
      throw new Error("Analysis not found");
    }
    
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a JSON blob
    const jsonString = JSON.stringify(analysisData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  };
  
  const importExternalData = async (data: any, type: string): Promise<boolean> => {
    // Simulate validation and processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Depending on the type, store in the appropriate state
    try {
      if (type === 'model' && data.name && data.type) {
        createPredictiveModel(data);
        return true;
      } else if (type === 'visualization' && data.name && data.type) {
        createVisualization(data);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Import error:", error);
      return false;
    }
  };
  
  // Context value
  const contextValue: AdvancedAnalyticsContextType = {
    predictiveModels,
    visualizations,
    correlations,
    trends,
    segments,
    cohorts,
    
    createPredictiveModel,
    updatePredictiveModel,
    deletePredictiveModel,
    trainModel,
    predictOutcome,
    
    createVisualization,
    updateVisualization,
    deleteVisualization,
    
    runCorrelationAnalysis,
    runTrendAnalysis,
    runSegmentAnalysis,
    runCohortAnalysis,
    
    exportAnalysis,
    importExternalData
  };
  
  return (
    <AdvancedAnalyticsContext.Provider value={contextValue}>
      {children}
    </AdvancedAnalyticsContext.Provider>
  );
};

// Custom hook for using analytics context
export const useAdvancedAnalytics = () => {
  const context = useContext(AdvancedAnalyticsContext);
  if (!context) {
    throw new Error("useAdvancedAnalytics must be used within an AdvancedAnalyticsProvider");
  }
  return context;
}; 