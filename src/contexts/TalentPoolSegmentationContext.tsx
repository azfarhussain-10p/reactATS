import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { announce } from '../components/ScreenReaderAnnouncer';

// Types
export interface TalentSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  color: string;
  isActive: boolean;
  candidateCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentCriteria {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'between';
  value: any;
  valueType: 'string' | 'number' | 'date' | 'array' | 'boolean';
}

export interface SegmentRule {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  isTemplate: boolean;
}

export interface SegmentationMetric {
  segmentId: string;
  totalCandidates: number;
  activeEngagement: number;
  responseRate: number;
  conversionRate: number;
  avgTimeToHire: number;
}

interface TalentPoolSegmentationContextType {
  // State
  segments: TalentSegment[];
  segmentRules: SegmentRule[];
  segmentMetrics: Record<string, SegmentationMetric>;

  // Segment CRUD operations
  createSegment: (
    segment: Omit<TalentSegment, 'id' | 'createdAt' | 'updatedAt' | 'candidateCount'>
  ) => TalentSegment;
  updateSegment: (id: string, updates: Partial<TalentSegment>) => TalentSegment | null;
  deleteSegment: (id: string) => boolean;

  // Segment management
  getSegmentCandidates: (segmentId: string) => string[]; // Returns candidate IDs
  getSegmentMetrics: (segmentId: string) => SegmentationMetric | null;
  mergeSegments: (segmentIds: string[], newSegmentName: string) => TalentSegment | null;

  // Segment rules
  createSegmentRule: (rule: Omit<SegmentRule, 'id'>) => SegmentRule;
  updateSegmentRule: (id: string, updates: Partial<SegmentRule>) => SegmentRule | null;
  deleteSegmentRule: (id: string) => boolean;
  applySegmentRule: (ruleId: string, segmentName: string) => TalentSegment | null;

  // Advanced operations
  analyzeSegmentPerformance: (segmentId: string) => Promise<Record<string, any>>;
  compareSegments: (segmentIds: string[]) => Promise<Record<string, any>[]>;
  forecastSegmentGrowth: (
    segmentId: string,
    months: number
  ) => Promise<{ date: string; count: number }[]>;
}

// Sample data
const sampleSegments: TalentSegment[] = [
  {
    id: '1',
    name: 'Senior Engineers',
    description: 'Software engineers with 5+ years experience',
    criteria: [
      {
        id: '1',
        field: 'skills',
        operator: 'in',
        value: ['React', 'Node.js', 'TypeScript'],
        valueType: 'array',
      },
      {
        id: '2',
        field: 'experience',
        operator: 'greater_than',
        value: 5,
        valueType: 'number',
      },
    ],
    color: '#1976d2',
    isActive: true,
    candidateCount: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Remote Candidates',
    description: 'Candidates interested in remote work',
    criteria: [
      {
        id: '3',
        field: 'preferences.remote',
        operator: 'equals',
        value: true,
        valueType: 'boolean',
      },
    ],
    color: '#9c27b0',
    isActive: true,
    candidateCount: 127,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sampleSegmentRules: SegmentRule[] = [
  {
    id: '1',
    name: 'High Experience Tech',
    description: 'Technical candidates with significant experience',
    criteria: [
      {
        id: '1',
        field: 'skills',
        operator: 'in',
        value: ['React', 'Angular', 'Vue', 'Node.js'],
        valueType: 'array',
      },
      {
        id: '2',
        field: 'experience',
        operator: 'greater_than',
        value: 5,
        valueType: 'number',
      },
    ],
    isTemplate: true,
  },
];

const sampleSegmentMetrics: Record<string, SegmentationMetric> = {
  '1': {
    segmentId: '1',
    totalCandidates: 45,
    activeEngagement: 28,
    responseRate: 0.72,
    conversionRate: 0.18,
    avgTimeToHire: 35,
  },
  '2': {
    segmentId: '2',
    totalCandidates: 127,
    activeEngagement: 95,
    responseRate: 0.81,
    conversionRate: 0.12,
    avgTimeToHire: 42,
  },
};

// Create context
const TalentPoolSegmentationContext = createContext<TalentPoolSegmentationContextType | undefined>(
  undefined
);

// Provider component
export const TalentPoolSegmentationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [segments, setSegments] = useState<TalentSegment[]>(sampleSegments);
  const [segmentRules, setSegmentRules] = useState<SegmentRule[]>(sampleSegmentRules);
  const [segmentMetrics, setSegmentMetrics] =
    useState<Record<string, SegmentationMetric>>(sampleSegmentMetrics);

  // Create a new segment
  const createSegment = (
    segmentData: Omit<TalentSegment, 'id' | 'createdAt' | 'updatedAt' | 'candidateCount'>
  ): TalentSegment => {
    const timestamp = new Date().toISOString();
    const newSegment: TalentSegment = {
      ...segmentData,
      id: uuidv4(),
      candidateCount: 0, // Initially empty
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setSegments([...segments, newSegment]);
    announce(`Created new talent segment: ${newSegment.name}`);
    return newSegment;
  };

  // Update existing segment
  const updateSegment = (id: string, updates: Partial<TalentSegment>): TalentSegment | null => {
    const index = segments.findIndex((segment) => segment.id === id);
    if (index === -1) return null;

    const updatedSegment = {
      ...segments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedSegments = [...segments];
    updatedSegments[index] = updatedSegment;
    setSegments(updatedSegments);

    announce(`Updated talent segment: ${updatedSegment.name}`);
    return updatedSegment;
  };

  // Delete a segment
  const deleteSegment = (id: string): boolean => {
    const index = segments.findIndex((segment) => segment.id === id);
    if (index === -1) return false;

    const segmentName = segments[index].name;
    const updatedSegments = segments.filter((segment) => segment.id !== id);
    setSegments(updatedSegments);

    announce(`Deleted talent segment: ${segmentName}`);
    return true;
  };

  // Get candidates in a segment (mock implementation)
  const getSegmentCandidates = (segmentId: string): string[] => {
    // In a real implementation, this would query candidates based on segment criteria
    // Mock data for demonstration
    return Array.from({ length: Math.floor(Math.random() * 50) + 10 }, () => uuidv4());
  };

  // Get metrics for a segment
  const getSegmentMetrics = (segmentId: string): SegmentationMetric | null => {
    return segmentMetrics[segmentId] || null;
  };

  // Merge multiple segments into a new one
  const mergeSegments = (segmentIds: string[], newSegmentName: string): TalentSegment | null => {
    const segmentsToMerge = segments.filter((segment) => segmentIds.includes(segment.id));
    if (segmentsToMerge.length !== segmentIds.length) return null;

    // Combine criteria from all segments
    const allCriteria: SegmentCriteria[] = [];
    segmentsToMerge.forEach((segment) => {
      segment.criteria.forEach((criteria) => {
        if (
          !allCriteria.some((c) => c.field === criteria.field && c.operator === criteria.operator)
        ) {
          allCriteria.push({ ...criteria, id: uuidv4() });
        }
      });
    });

    // Calculate total candidate count (this is simplified)
    const totalCandidates = segmentsToMerge.reduce(
      (total, segment) => total + segment.candidateCount,
      0
    );

    const timestamp = new Date().toISOString();
    const newSegment: TalentSegment = {
      id: uuidv4(),
      name: newSegmentName,
      description: `Merged segment from ${segmentsToMerge.map((s) => s.name).join(', ')}`,
      criteria: allCriteria,
      color: segmentsToMerge[0].color,
      isActive: true,
      candidateCount: totalCandidates,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setSegments([...segments, newSegment]);
    announce(
      `Created merged talent segment: ${newSegment.name} with ${totalCandidates} candidates`
    );
    return newSegment;
  };

  // Create a segment rule
  const createSegmentRule = (rule: Omit<SegmentRule, 'id'>): SegmentRule => {
    const newRule: SegmentRule = {
      ...rule,
      id: uuidv4(),
    };

    setSegmentRules([...segmentRules, newRule]);
    announce(`Created new segment rule: ${newRule.name}`);
    return newRule;
  };

  // Update an existing segment rule
  const updateSegmentRule = (id: string, updates: Partial<SegmentRule>): SegmentRule | null => {
    const index = segmentRules.findIndex((rule) => rule.id === id);
    if (index === -1) return null;

    const updatedRule = {
      ...segmentRules[index],
      ...updates,
    };

    const updatedRules = [...segmentRules];
    updatedRules[index] = updatedRule;
    setSegmentRules(updatedRules);

    announce(`Updated segment rule: ${updatedRule.name}`);
    return updatedRule;
  };

  // Delete a segment rule
  const deleteSegmentRule = (id: string): boolean => {
    const index = segmentRules.findIndex((rule) => rule.id === id);
    if (index === -1) return false;

    const ruleName = segmentRules[index].name;
    const updatedRules = segmentRules.filter((rule) => rule.id !== id);
    setSegmentRules(updatedRules);

    announce(`Deleted segment rule: ${ruleName}`);
    return true;
  };

  // Apply a segment rule to create a new segment
  const applySegmentRule = (ruleId: string, segmentName: string): TalentSegment | null => {
    const rule = segmentRules.find((r) => r.id === ruleId);
    if (!rule) return null;

    const timestamp = new Date().toISOString();
    const newSegment: TalentSegment = {
      id: uuidv4(),
      name: segmentName,
      description: `Created from rule: ${rule.name}`,
      criteria: [...rule.criteria],
      color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
      isActive: true,
      candidateCount: Math.floor(Math.random() * 100) + 10, // Mock count
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setSegments([...segments, newSegment]);
    announce(`Created new segment from rule: ${segmentName}`);
    return newSegment;
  };

  // Analyze segment performance (mock implementation)
  const analyzeSegmentPerformance = async (segmentId: string): Promise<Record<string, any>> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      engagementTrend: [
        { month: 'Jan', rate: 0.65 },
        { month: 'Feb', rate: 0.68 },
        { month: 'Mar', rate: 0.72 },
        { month: 'Apr', rate: 0.74 },
        { month: 'May', rate: 0.71 },
        { month: 'Jun', rate: 0.75 },
      ],
      conversionTrend: [
        { month: 'Jan', rate: 0.12 },
        { month: 'Feb', rate: 0.14 },
        { month: 'Mar', rate: 0.15 },
        { month: 'Apr', rate: 0.17 },
        { month: 'May', rate: 0.16 },
        { month: 'Jun', rate: 0.18 },
      ],
      topPerformingChannels: [
        { channel: 'LinkedIn', effectiveness: 0.22 },
        { channel: 'Employee Referral', effectiveness: 0.18 },
        { channel: 'Job Board', effectiveness: 0.14 },
      ],
    };
  };

  // Compare multiple segments
  const compareSegments = async (segmentIds: string[]): Promise<Record<string, any>[]> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return segmentIds.map((id) => {
      const segment = segments.find((s) => s.id === id);
      const metrics = segmentMetrics[id];

      return {
        id,
        name: segment?.name || 'Unknown Segment',
        metrics: metrics || {
          totalCandidates: 0,
          activeEngagement: 0,
          responseRate: 0,
          conversionRate: 0,
          avgTimeToHire: 0,
        },
        performanceIndex: Math.random() * 10,
      };
    });
  };

  // Forecast segment growth
  const forecastSegmentGrowth = async (
    segmentId: string,
    months: number
  ): Promise<{ date: string; count: number }[]> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const segment = segments.find((s) => s.id === segmentId);
    if (!segment) return [];

    const result: { date: string; count: number }[] = [];
    let currentCount = segment.candidateCount;

    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i + 1);

      // Simple growth model with some randomness
      const growthRate = 0.05 + (Math.random() * 0.1 - 0.05); // 0-10% growth with variation
      currentCount = Math.floor(currentCount * (1 + growthRate));

      result.push({
        date: date.toISOString().split('T')[0],
        count: currentCount,
      });
    }

    return result;
  };

  const value: TalentPoolSegmentationContextType = {
    segments,
    segmentRules,
    segmentMetrics,
    createSegment,
    updateSegment,
    deleteSegment,
    getSegmentCandidates,
    getSegmentMetrics,
    mergeSegments,
    createSegmentRule,
    updateSegmentRule,
    deleteSegmentRule,
    applySegmentRule,
    analyzeSegmentPerformance,
    compareSegments,
    forecastSegmentGrowth,
  };

  return (
    <TalentPoolSegmentationContext.Provider value={value}>
      {children}
    </TalentPoolSegmentationContext.Provider>
  );
};

// Custom hook for consuming the context
export const useTalentPoolSegmentation = () => {
  const context = useContext(TalentPoolSegmentationContext);
  if (context === undefined) {
    throw new Error(
      'useTalentPoolSegmentation must be used within a TalentPoolSegmentationProvider'
    );
  }
  return context;
};
