import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  TalentPool,
  TalentPoolCategory,
  TalentPoolFilter,
  CandidateRelationship,
  EngagementLevel,
  ContactHistoryItem,
  TouchPoint,
  Candidate
} from '../models/types';

// Context interface
interface TalentPoolContextType {
  // State
  talentPools: TalentPool[];
  relationships: CandidateRelationship[];
  isLoading: boolean;
  error: string | null;
  
  // Talent Pool operations
  createTalentPool: (pool: Omit<TalentPool, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TalentPool>;
  updateTalentPool: (id: string, updates: Partial<TalentPool>) => Promise<TalentPool>;
  deleteTalentPool: (id: string) => Promise<boolean>;
  
  // Filter operations
  addFilterToPool: (poolId: string, filter: Omit<TalentPoolFilter, 'id'>) => Promise<TalentPool>;
  removeFilterFromPool: (poolId: string, filterId: string) => Promise<TalentPool>;
  
  // Candidate operations
  addCandidateToPool: (poolId: string, candidateId: string) => Promise<boolean>;
  removeCandidateFromPool: (poolId: string, candidateId: string) => Promise<boolean>;
  getCandidatesInPool: (poolId: string) => Promise<string[]>;
  
  // Relationship management
  getRelationship: (candidateId: string) => CandidateRelationship | null;
  updateRelationship: (id: string, updates: Partial<CandidateRelationship>) => Promise<CandidateRelationship>;
  addContactHistory: (relationshipId: string, contact: Omit<ContactHistoryItem, 'id'>) => Promise<ContactHistoryItem>;
  addTouchPoint: (relationshipId: string, touchPoint: Omit<TouchPoint, 'id'>) => Promise<TouchPoint>;
  updateEngagementScore: (relationshipId: string) => Promise<number>;
}

// Sample data
const sampleTalentPools: TalentPool[] = [
  {
    id: 'pool-1',
    name: 'Software Engineers',
    description: 'Qualified software engineers for technical roles',
    category: 'Active Candidate',
    tags: ['engineering', 'high-priority', 'technical'],
    filters: [
      {
        id: 'filter-1',
        field: 'skills',
        operator: 'in',
        values: ['JavaScript', 'React', 'Node.js']
      },
      {
        id: 'filter-2',
        field: 'totalYearsOfExperience',
        operator: 'greaterThan',
        value: 3
      }
    ],
    candidateIds: ['1', '2', '5', '8'],
    campaignIds: ['campaign-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: false,
    color: '#3498db'
  },
  {
    id: 'pool-2',
    name: 'Previous Applicants',
    description: 'Strong candidates from previous openings',
    category: 'Previous Applicant',
    tags: ['silver-medalist', 'reengagement'],
    filters: [
      {
        id: 'filter-3',
        field: 'status',
        operator: 'in',
        values: ['Rejected', 'Withdrawn']
      },
      {
        id: 'filter-4',
        field: 'rating',
        operator: 'greaterThan',
        value: 3
      }
    ],
    candidateIds: ['3', '4', '7'],
    campaignIds: ['campaign-2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: false,
    color: '#e74c3c'
  },
  {
    id: 'pool-3',
    name: 'Leadership Potentials',
    description: 'Candidates with leadership potential',
    category: 'Passive Candidate',
    tags: ['leadership', 'executive', 'management'],
    filters: [
      {
        id: 'filter-5',
        field: 'title',
        operator: 'contains',
        value: 'Lead'
      },
      {
        id: 'filter-6',
        field: 'totalYearsOfExperience',
        operator: 'greaterThan',
        value: 7
      }
    ],
    candidateIds: ['6', '9'],
    campaignIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: false,
    color: '#9b59b6'
  }
];

const sampleRelationships: CandidateRelationship[] = [
  {
    id: 'rel-1',
    candidateId: '1',
    talentPoolIds: ['pool-1'],
    contactHistory: [
      {
        id: 'contact-1',
        date: new Date('2023-06-15').toISOString(),
        type: 'Email',
        direction: 'Outbound',
        subject: 'Introduction to our company',
        notes: 'Sent initial outreach about open engineering positions',
        outcome: 'Positive',
        response: 'Showed interest and wants to learn more',
        followUpRequired: true,
        followUpDate: new Date('2023-06-22').toISOString(),
        createdBy: 'recruiter1'
      },
      {
        id: 'contact-2',
        date: new Date('2023-06-23').toISOString(),
        type: 'Phone',
        direction: 'Outbound',
        subject: 'Initial phone screening',
        notes: 'Discussed background and experience, seemed very qualified',
        outcome: 'Positive',
        response: 'Eager to proceed to technical interview',
        followUpRequired: true,
        followUpDate: new Date('2023-06-30').toISOString(),
        createdBy: 'recruiter1'
      }
    ],
    touchPoints: [
      {
        id: 'touch-1',
        type: 'Work Anniversary',
        date: new Date('2023-07-15').toISOString(),
        title: '5 Years at Current Company',
        description: 'Congratulate on 5-year work anniversary at current employer',
        status: 'Pending',
        notes: 'Good time to re-engage about new opportunities'
      }
    ],
    engagementLevel: 'Hot',
    engagementScore: 85,
    lastContact: new Date('2023-06-23').toISOString(),
    nextContactDate: new Date('2023-06-30').toISOString(),
    notes: 'Very promising candidate, potentially a great fit for senior role',
    responseRate: 1.0,
    preferredContactMethod: 'Email',
    preferredContactTime: 'Morning',
    leadSource: 'LinkedIn',
    assignedTo: 'recruiter1',
    createdAt: new Date('2023-06-15').toISOString(),
    updatedAt: new Date('2023-06-23').toISOString()
  },
  {
    id: 'rel-2',
    candidateId: '3',
    talentPoolIds: ['pool-2'],
    contactHistory: [
      {
        id: 'contact-3',
        date: new Date('2023-05-10').toISOString(),
        type: 'Email',
        direction: 'Outbound',
        subject: 'Thank you for your application',
        notes: 'Sent rejection but noted strong candidacy for future roles',
        outcome: 'Neutral',
        response: 'Understood and expressed interest in future opportunities',
        followUpRequired: true,
        followUpDate: new Date('2023-08-10').toISOString(),
        createdBy: 'recruiter2'
      }
    ],
    touchPoints: [],
    engagementLevel: 'Warm',
    engagementScore: 60,
    lastContact: new Date('2023-05-10').toISOString(),
    nextContactDate: new Date('2023-08-10').toISOString(),
    notes: 'Good candidate, not right for last role but worth keeping in touch',
    responseRate: 0.8,
    preferredContactMethod: 'Email',
    leadSource: 'Indeed',
    createdAt: new Date('2023-05-10').toISOString(),
    updatedAt: new Date('2023-05-10').toISOString()
  }
];

// Create the context
const TalentPoolContext = createContext<TalentPoolContextType | undefined>(undefined);

// Provider component
export const TalentPoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [talentPools, setTalentPools] = useState<TalentPool[]>(sampleTalentPools);
  const [relationships, setRelationships] = useState<CandidateRelationship[]>(sampleRelationships);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Talent Pool operations
  const createTalentPool = useCallback(async (
    pool: Omit<TalentPool, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TalentPool> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newPool: TalentPool = {
        ...pool,
        id: `pool-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTalentPools(prev => [...prev, newPool]);
      return newPool;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create talent pool';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTalentPool = useCallback(async (
    id: string,
    updates: Partial<TalentPool>
  ): Promise<TalentPool> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const index = talentPools.findIndex(pool => pool.id === id);
      if (index === -1) {
        throw new Error('Talent pool not found');
      }

      const updatedPool = {
        ...talentPools[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const newPools = [...talentPools];
      newPools[index] = updatedPool;
      setTalentPools(newPools);

      return updatedPool;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update talent pool';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [talentPools]);

  const deleteTalentPool = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const index = talentPools.findIndex(pool => pool.id === id);
      if (index === -1) {
        throw new Error('Talent pool not found');
      }

      // Remove pool from relationships
      const updatedRelationships = relationships.map(rel => {
        if (rel.talentPoolIds.includes(id)) {
          return {
            ...rel,
            talentPoolIds: rel.talentPoolIds.filter(poolId => poolId !== id),
            updatedAt: new Date().toISOString()
          };
        }
        return rel;
      });

      setRelationships(updatedRelationships);
      setTalentPools(talentPools.filter(pool => pool.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete talent pool';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [talentPools, relationships]);

  // Filter operations
  const addFilterToPool = useCallback(async (
    poolId: string,
    filter: Omit<TalentPoolFilter, 'id'>
  ): Promise<TalentPool> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const poolIndex = talentPools.findIndex(pool => pool.id === poolId);
      if (poolIndex === -1) {
        throw new Error('Talent pool not found');
      }

      const newFilter: TalentPoolFilter = {
        ...filter,
        id: `filter-${Date.now()}`
      };

      const updatedPool = {
        ...talentPools[poolIndex],
        filters: [...talentPools[poolIndex].filters, newFilter],
        updatedAt: new Date().toISOString()
      };

      const newPools = [...talentPools];
      newPools[poolIndex] = updatedPool;
      setTalentPools(newPools);

      return updatedPool;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add filter';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [talentPools]);

  const removeFilterFromPool = useCallback(async (
    poolId: string,
    filterId: string
  ): Promise<TalentPool> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const poolIndex = talentPools.findIndex(pool => pool.id === poolId);
      if (poolIndex === -1) {
        throw new Error('Talent pool not found');
      }

      const updatedPool = {
        ...talentPools[poolIndex],
        filters: talentPools[poolIndex].filters.filter(f => f.id !== filterId),
        updatedAt: new Date().toISOString()
      };

      const newPools = [...talentPools];
      newPools[poolIndex] = updatedPool;
      setTalentPools(newPools);

      return updatedPool;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove filter';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [talentPools]);

  // Candidate operations
  const addCandidateToPool = useCallback(async (
    poolId: string,
    candidateId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const poolIndex = talentPools.findIndex(pool => pool.id === poolId);
      if (poolIndex === -1) {
        throw new Error('Talent pool not found');
      }

      // Check if candidate is already in the pool
      if (talentPools[poolIndex].candidateIds.includes(candidateId)) {
        return true; // Already in pool
      }

      const updatedPool = {
        ...talentPools[poolIndex],
        candidateIds: [...talentPools[poolIndex].candidateIds, candidateId],
        updatedAt: new Date().toISOString()
      };

      const newPools = [...talentPools];
      newPools[poolIndex] = updatedPool;
      setTalentPools(newPools);

      // Update or create candidate relationship
      const relationshipIndex = relationships.findIndex(rel => rel.candidateId === candidateId);
      if (relationshipIndex !== -1) {
        // Update existing relationship
        const updatedRelationship = {
          ...relationships[relationshipIndex],
          talentPoolIds: [...relationships[relationshipIndex].talentPoolIds, poolId],
          updatedAt: new Date().toISOString()
        };

        const newRelationships = [...relationships];
        newRelationships[relationshipIndex] = updatedRelationship;
        setRelationships(newRelationships);
      } else {
        // Create a new relationship
        const newRelationship: CandidateRelationship = {
          id: `rel-${Date.now()}`,
          candidateId,
          talentPoolIds: [poolId],
          contactHistory: [],
          touchPoints: [],
          engagementLevel: 'Cold',
          engagementScore: 0,
          lastContact: '',
          notes: '',
          responseRate: 0,
          preferredContactMethod: 'Email',
          leadSource: 'Manual Addition',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setRelationships([...relationships, newRelationship]);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add candidate to pool';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [talentPools, relationships]);

  const removeCandidateFromPool = useCallback(async (
    poolId: string,
    candidateId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const poolIndex = talentPools.findIndex(pool => pool.id === poolId);
      if (poolIndex === -1) {
        throw new Error('Talent pool not found');
      }

      const updatedPool = {
        ...talentPools[poolIndex],
        candidateIds: talentPools[poolIndex].candidateIds.filter(id => id !== candidateId),
        updatedAt: new Date().toISOString()
      };

      const newPools = [...talentPools];
      newPools[poolIndex] = updatedPool;
      setTalentPools(newPools);

      // Update candidate relationship
      const relationshipIndex = relationships.findIndex(rel => rel.candidateId === candidateId);
      if (relationshipIndex !== -1) {
        const updatedRelationship = {
          ...relationships[relationshipIndex],
          talentPoolIds: relationships[relationshipIndex].talentPoolIds.filter(id => id !== poolId),
          updatedAt: new Date().toISOString()
        };

        const newRelationships = [...relationships];
        newRelationships[relationshipIndex] = updatedRelationship;
        setRelationships(newRelationships);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove candidate from pool';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [talentPools, relationships]);

  const getCandidatesInPool = useCallback(async (poolId: string): Promise<string[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const pool = talentPools.find(p => p.id === poolId);
      if (!pool) {
        throw new Error('Talent pool not found');
      }

      return pool.candidateIds;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get candidates in pool';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [talentPools]);

  // Relationship management
  const getRelationship = useCallback((candidateId: string): CandidateRelationship | null => {
    return relationships.find(rel => rel.candidateId === candidateId) || null;
  }, [relationships]);

  const updateRelationship = useCallback(async (
    id: string,
    updates: Partial<CandidateRelationship>
  ): Promise<CandidateRelationship> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));

      const index = relationships.findIndex(rel => rel.id === id);
      if (index === -1) {
        throw new Error('Relationship not found');
      }

      const updatedRelationship = {
        ...relationships[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const newRelationships = [...relationships];
      newRelationships[index] = updatedRelationship;
      setRelationships(newRelationships);

      return updatedRelationship;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update relationship';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [relationships]);

  const addContactHistory = useCallback(async (
    relationshipId: string,
    contact: Omit<ContactHistoryItem, 'id'>
  ): Promise<ContactHistoryItem> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const relationshipIndex = relationships.findIndex(rel => rel.id === relationshipId);
      if (relationshipIndex === -1) {
        throw new Error('Relationship not found');
      }

      const newContact: ContactHistoryItem = {
        ...contact,
        id: `contact-${Date.now()}`
      };

      const updatedRelationship = {
        ...relationships[relationshipIndex],
        contactHistory: [newContact, ...relationships[relationshipIndex].contactHistory],
        lastContact: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newRelationships = [...relationships];
      newRelationships[relationshipIndex] = updatedRelationship;
      setRelationships(newRelationships);

      // Update engagement score after adding contact
      updateEngagementScore(relationshipId);

      return newContact;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add contact history';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [relationships]);

  const addTouchPoint = useCallback(async (
    relationshipId: string,
    touchPoint: Omit<TouchPoint, 'id'>
  ): Promise<TouchPoint> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const relationshipIndex = relationships.findIndex(rel => rel.id === relationshipId);
      if (relationshipIndex === -1) {
        throw new Error('Relationship not found');
      }

      const newTouchPoint: TouchPoint = {
        ...touchPoint,
        id: `touch-${Date.now()}`
      };

      const updatedRelationship = {
        ...relationships[relationshipIndex],
        touchPoints: [...relationships[relationshipIndex].touchPoints, newTouchPoint],
        updatedAt: new Date().toISOString()
      };

      const newRelationships = [...relationships];
      newRelationships[relationshipIndex] = updatedRelationship;
      setRelationships(newRelationships);

      return newTouchPoint;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add touch point';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [relationships]);

  const updateEngagementScore = useCallback(async (relationshipId: string): Promise<number> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));

      const relationshipIndex = relationships.findIndex(rel => rel.id === relationshipId);
      if (relationshipIndex === -1) {
        throw new Error('Relationship not found');
      }

      const relationship = relationships[relationshipIndex];
      
      // Calculate engagement score based on various factors
      // This is a simplified algorithm for demo purposes
      let score = 0;
      
      // Recent contact increases score
      const lastContactDate = new Date(relationship.lastContact);
      const daysSinceLastContact = (new Date().getTime() - lastContactDate.getTime()) / (1000 * 3600 * 24);
      
      if (daysSinceLastContact < 7) {
        score += 20;
      } else if (daysSinceLastContact < 30) {
        score += 10;
      } else if (daysSinceLastContact < 90) {
        score += 5;
      }
      
      // Response rate contributes to score
      score += Math.round(relationship.responseRate * 20);
      
      // Number of contacts contributes to score
      score += Math.min(20, relationship.contactHistory.length * 2);
      
      // Positive outcomes contribute to score
      const positiveOutcomes = relationship.contactHistory.filter(c => c.outcome === 'Positive').length;
      score += positiveOutcomes * 5;
      
      // Normalize to 0-100 range
      score = Math.min(100, Math.max(0, score));
      
      // Determine engagement level based on score
      let engagementLevel: EngagementLevel;
      if (score >= 80) {
        engagementLevel = 'Very Hot';
      } else if (score >= 60) {
        engagementLevel = 'Hot';
      } else if (score >= 40) {
        engagementLevel = 'Warm';
      } else if (score >= 20) {
        engagementLevel = 'Cold';
      } else {
        engagementLevel = 'Not Interested';
      }
      
      // Update the relationship
      const updatedRelationship = {
        ...relationship,
        engagementScore: score,
        engagementLevel,
        updatedAt: new Date().toISOString()
      };
      
      const newRelationships = [...relationships];
      newRelationships[relationshipIndex] = updatedRelationship;
      setRelationships(newRelationships);
      
      return score;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update engagement score';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [relationships]);

  // Context value
  const contextValue: TalentPoolContextType = {
    talentPools,
    relationships,
    isLoading,
    error,
    
    createTalentPool,
    updateTalentPool,
    deleteTalentPool,
    
    addFilterToPool,
    removeFilterFromPool,
    
    addCandidateToPool,
    removeCandidateFromPool,
    getCandidatesInPool,
    
    getRelationship,
    updateRelationship,
    addContactHistory,
    addTouchPoint,
    updateEngagementScore
  };

  return (
    <TalentPoolContext.Provider value={contextValue}>
      {children}
    </TalentPoolContext.Provider>
  );
};

// Custom hook for using the context
export const useTalentPool = () => {
  const context = useContext(TalentPoolContext);
  
  if (context === undefined) {
    throw new Error('useTalentPool must be used within a TalentPoolProvider');
  }
  
  return context;
};

export default TalentPoolContext; 