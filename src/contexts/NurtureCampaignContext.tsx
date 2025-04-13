import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  NurtureCampaign, 
  NurtureStep, 
  CandidateRelationship 
} from '../models/types';
import { useTalentPool } from './TalentPoolContext';

// Context interface
interface NurtureCampaignContextType {
  // State
  campaigns: NurtureCampaign[];
  isLoading: boolean;
  error: string | null;
  
  // Campaign operations
  createCampaign: (campaign: Omit<NurtureCampaign, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) => Promise<NurtureCampaign>;
  updateCampaign: (id: string, updates: Partial<NurtureCampaign>) => Promise<NurtureCampaign>;
  deleteCampaign: (id: string) => Promise<boolean>;
  
  // Step operations
  addStepToCampaign: (campaignId: string, step: Omit<NurtureStep, 'id' | 'campaignId'>) => Promise<NurtureStep>;
  updateStep: (campaignId: string, stepId: string, updates: Partial<NurtureStep>) => Promise<NurtureStep>;
  removeStep: (campaignId: string, stepId: string) => Promise<boolean>;
  
  // Campaign execution
  activateCampaign: (id: string) => Promise<boolean>;
  deactivateCampaign: (id: string) => Promise<boolean>;
  assignCampaignToTalentPool: (campaignId: string, talentPoolId: string) => Promise<boolean>;
  unassignCampaignFromTalentPool: (campaignId: string, talentPoolId: string) => Promise<boolean>;
  
  // Analytics
  getCampaignStats: (id: string) => Promise<NurtureCampaign['stats']>;
  getCampaignsByTalentPool: (talentPoolId: string) => NurtureCampaign[];
  
  // Campaign preview and testing
  previewCampaignStep: (stepId: string, campaignId: string) => Promise<{ subject?: string; content: string; }>;
  sendTestMessage: (stepId: string, campaignId: string, recipientEmail: string) => Promise<boolean>;
}

// Sample data
const sampleCampaigns: NurtureCampaign[] = [
  {
    id: 'campaign-1',
    name: 'Software Engineer Nurture',
    description: 'Nurture campaign for software engineering candidates',
    talentPoolIds: ['pool-1'],
    steps: [
      {
        id: 'step-1',
        campaignId: 'campaign-1',
        order: 1,
        type: 'Email',
        templateId: 'template-1',
        subject: 'Exciting opportunities at our company',
        content: 'Hi {{candidate.firstName}},\n\nWe have some exciting opportunities for software engineers at our company. We noticed your impressive background in {{candidate.skills}} and thought you might be interested.\n\nBest regards,\nThe Recruiting Team',
        delayDays: 0,
        active: true
      },
      {
        id: 'step-2',
        campaignId: 'campaign-1',
        order: 2,
        type: 'Email',
        templateId: 'template-2',
        subject: 'Follow-up on career opportunities',
        content: 'Hi {{candidate.firstName}},\n\nI wanted to follow up on my previous email about opportunities at our company. We're currently looking for experienced software engineers to join our team.\n\nWould you be interested in having a quick chat?\n\nBest regards,\nThe Recruiting Team',
        delayDays: 7,
        condition: {
          previousStepOutcome: 'None'
        },
        active: true
      },
      {
        id: 'step-3',
        campaignId: 'campaign-1',
        order: 3,
        type: 'LinkedIn',
        content: 'Hi {{candidate.firstName}}, I noticed your profile and wanted to connect regarding opportunities at our company.',
        delayDays: 14,
        condition: {
          previousStepOutcome: 'None'
        },
        active: true
      }
    ],
    active: true,
    stats: {
      totalCandidates: 4,
      engagement: 0.5,
      responses: 2,
      conversions: 1
    },
    createdAt: new Date('2023-05-01').toISOString(),
    updatedAt: new Date('2023-05-15').toISOString()
  },
  {
    id: 'campaign-2',
    name: 'Previous Applicant Re-engagement',
    description: 'Campaign to re-engage with strong candidates from previous openings',
    talentPoolIds: ['pool-2'],
    steps: [
      {
        id: 'step-4',
        campaignId: 'campaign-2',
        order: 1,
        type: 'Email',
        templateId: 'template-3',
        subject: 'Reconnecting about new opportunities',
        content: 'Hi {{candidate.firstName}},\n\nIt's been a while since we last connected when you applied for the {{candidate.lastJobApplied}} position. We have some new openings that might be a better fit for your skills in {{candidate.skills}}.\n\nWould you be open to discussing these opportunities?\n\nBest regards,\nThe Recruiting Team',
        delayDays: 0,
        active: true
      },
      {
        id: 'step-5',
        campaignId: 'campaign-2',
        order: 2,
        type: 'Email',
        templateId: 'template-4',
        subject: 'New positions that match your profile',
        content: 'Hi {{candidate.firstName}},\n\nI wanted to share some specific openings that match your background:\n\n{{matchedJobs}}\n\nIf any of these interest you, please let me know!\n\nBest regards,\nThe Recruiting Team',
        delayDays: 10,
        condition: {
          previousStepOutcome: 'Opened'
        },
        active: true
      }
    ],
    active: true,
    stats: {
      totalCandidates: 3,
      engagement: 0.33,
      responses: 1,
      conversions: 0
    },
    createdAt: new Date('2023-06-01').toISOString(),
    updatedAt: new Date('2023-06-10').toISOString()
  }
];

// Create the context
const NurtureCampaignContext = createContext<NurtureCampaignContextType | undefined>(undefined);

// Provider component
export const NurtureCampaignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<NurtureCampaign[]>(sampleCampaigns);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { talentPools } = useTalentPool();

  // Campaign operations
  const createCampaign = useCallback(async (
    campaign: Omit<NurtureCampaign, 'id' | 'createdAt' | 'updatedAt' | 'stats'>
  ): Promise<NurtureCampaign> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newCampaign: NurtureCampaign = {
        ...campaign,
        id: `campaign-${Date.now()}`,
        stats: {
          totalCandidates: 0,
          engagement: 0,
          responses: 0,
          conversions: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCampaigns(prev => [...prev, newCampaign]);
      return newCampaign;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create nurture campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCampaign = useCallback(async (
    id: string,
    updates: Partial<NurtureCampaign>
  ): Promise<NurtureCampaign> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const index = campaigns.findIndex(campaign => campaign.id === id);
      if (index === -1) {
        throw new Error('Campaign not found');
      }

      const updatedCampaign = {
        ...campaigns[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const newCampaigns = [...campaigns];
      newCampaigns[index] = updatedCampaign;
      setCampaigns(newCampaigns);

      return updatedCampaign;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update nurture campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaigns]);

  const deleteCampaign = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const index = campaigns.findIndex(campaign => campaign.id === id);
      if (index === -1) {
        throw new Error('Campaign not found');
      }

      setCampaigns(campaigns.filter(campaign => campaign.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete nurture campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaigns]);

  // Step operations
  const addStepToCampaign = useCallback(async (
    campaignId: string,
    step: Omit<NurtureStep, 'id' | 'campaignId'>
  ): Promise<NurtureStep> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));

      const campaignIndex = campaigns.findIndex(campaign => campaign.id === campaignId);
      if (campaignIndex === -1) {
        throw new Error('Campaign not found');
      }

      const newStep: NurtureStep = {
        ...step,
        id: `step-${Date.now()}`,
        campaignId
      };

      const updatedSteps = [...campaigns[campaignIndex].steps, newStep];
      // Sort steps by order
      updatedSteps.sort((a, b) => a.order - b.order);

      const updatedCampaign = {
        ...campaigns[campaignIndex],
        steps: updatedSteps,
        updatedAt: new Date().toISOString()
      };

      const newCampaigns = [...campaigns];
      newCampaigns[campaignIndex] = updatedCampaign;
      setCampaigns(newCampaigns);

      return newStep;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add step to campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaigns]);

  const updateStep = useCallback(async (
    campaignId: string,
    stepId: string,
    updates: Partial<NurtureStep>
  ): Promise<NurtureStep> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));

      const campaignIndex = campaigns.findIndex(campaign => campaign.id === campaignId);
      if (campaignIndex === -1) {
        throw new Error('Campaign not found');
      }

      const stepIndex = campaigns[campaignIndex].steps.findIndex(step => step.id === stepId);
      if (stepIndex === -1) {
        throw new Error('Step not found');
      }

      const updatedStep = {
        ...campaigns[campaignIndex].steps[stepIndex],
        ...updates
      };

      const updatedSteps = [...campaigns[campaignIndex].steps];
      updatedSteps[stepIndex] = updatedStep;
      
      // Sort steps by order if the order was updated
      if (updates.order) {
        updatedSteps.sort((a, b) => a.order - b.order);
      }

      const updatedCampaign = {
        ...campaigns[campaignIndex],
        steps: updatedSteps,
        updatedAt: new Date().toISOString()
      };

      const newCampaigns = [...campaigns];
      newCampaigns[campaignIndex] = updatedCampaign;
      setCampaigns(newCampaigns);

      return updatedStep;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update step';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaigns]);

  const removeStep = useCallback(async (
    campaignId: string,
    stepId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));

      const campaignIndex = campaigns.findIndex(campaign => campaign.id === campaignId);
      if (campaignIndex === -1) {
        throw new Error('Campaign not found');
      }

      const stepIndex = campaigns[campaignIndex].steps.findIndex(step => step.id === stepId);
      if (stepIndex === -1) {
        throw new Error('Step not found');
      }

      const updatedSteps = campaigns[campaignIndex].steps.filter(step => step.id !== stepId);
      const updatedCampaign = {
        ...campaigns[campaignIndex],
        steps: updatedSteps,
        updatedAt: new Date().toISOString()
      };

      const newCampaigns = [...campaigns];
      newCampaigns[campaignIndex] = updatedCampaign;
      setCampaigns(newCampaigns);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove step';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaigns]);

  // Campaign execution
  const activateCampaign = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const campaignIndex = campaigns.findIndex(campaign => campaign.id === id);
      if (campaignIndex === -1) {
        throw new Error('Campaign not found');
      }

      const updatedCampaign = {
        ...campaigns[campaignIndex],
        active: true,
        updatedAt: new Date().toISOString()
      };

      const newCampaigns = [...campaigns];
      newCampaigns[campaignIndex] = updatedCampaign;
      setCampaigns(newCampaigns);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaigns]);

  const deactivateCampaign = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const campaignIndex = campaigns.findIndex(campaign => campaign.id === id);
      if (campaignIndex === -1) {
        throw new Error('Campaign not found');
      }

      const updatedCampaign = {
        ...campaigns[campaignIndex],
        active: false,
        updatedAt: new Date().toISOString()
      };

      const newCampaigns = [...campaigns];
      newCampaigns[campaignIndex] = updatedCampaign;
      setCampaigns(newCampaigns);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaigns]);

  const assignCampaignToTalentPool = useCallback(async (
    campaignId: string,
    talentPoolId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));

      const campaignIndex = campaigns.findIndex(campaign => campaign.id === campaignId);
      if (campaignIndex === -1) {
        throw new Error('Campaign not found');
      }

      // Check if talent pool exists
      const talentPoolExists = talentPools.some(pool => pool.id === talentPoolId);
      if (!talentPoolExists) {
        throw new Error('Talent pool not found');
      }

      // Check if already assigned
      if (campaigns[campaignIndex].talentPoolIds.includes(talentPoolId)) {
        return true; // Already assigned
      }

      const updatedCampaign = {
        ...campaigns[campaignIndex],
        talentPoolIds: [...campaigns[campaignIndex].talentPoolIds, talentPoolId],
        updatedAt: new Date().toISOString()
      };

      // Update stats based on number of candidates in the talent pool
      const candidatesInPool = talentPools.find(pool => pool.id === talentPoolId)?.candidateIds.length || 0;
      updatedCampaign.stats = {
        ...updatedCampaign.stats,
        totalCandidates: updatedCampaign.stats.totalCandidates + candidatesInPool
      };

      const newCampaigns = [...campaigns];
      newCampaigns[campaignIndex] = updatedCampaign;
      setCampaigns(newCampaigns);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign campaign to talent pool';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaigns, talentPools]);

  const unassignCampaignFromTalentPool = useCallback(async (
    campaignId: string,
    talentPoolId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));

      const campaignIndex = campaigns.findIndex(campaign => campaign.id === campaignId);
      if (campaignIndex === -1) {
        throw new Error('Campaign not found');
      }

      // Check if assigned
      if (!campaigns[campaignIndex].talentPoolIds.includes(talentPoolId)) {
        return true; // Not assigned, so nothing to do
      }

      // Update the campaign
      const updatedCampaign = {
        ...campaigns[campaignIndex],
        talentPoolIds: campaigns[campaignIndex].talentPoolIds.filter(id => id !== talentPoolId),
        updatedAt: new Date().toISOString()
      };

      // Update stats - approximation for demo purposes
      const candidatesInPool = talentPools.find(pool => pool.id === talentPoolId)?.candidateIds.length || 0;
      updatedCampaign.stats = {
        ...updatedCampaign.stats,
        totalCandidates: Math.max(0, updatedCampaign.stats.totalCandidates - candidatesInPool)
      };

      const newCampaigns = [...campaigns];
      newCampaigns[campaignIndex] = updatedCampaign;
      setCampaigns(newCampaigns);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unassign campaign from talent pool';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaigns, talentPools]);

  // Analytics
  const getCampaignStats = useCallback(async (id: string): Promise<NurtureCampaign['stats']> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const campaign = campaigns.find(c => c.id === id);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      return campaign.stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get campaign stats';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaigns]);

  const getCampaignsByTalentPool = useCallback((talentPoolId: string): NurtureCampaign[] => {
    return campaigns.filter(campaign => campaign.talentPoolIds.includes(talentPoolId));
  }, [campaigns]);

  // Campaign preview and testing
  const previewCampaignStep = useCallback(async (
    stepId: string,
    campaignId: string
  ): Promise<{ subject?: string; content: string; }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const step = campaign.steps.find(s => s.id === stepId);
      if (!step) {
        throw new Error('Step not found');
      }

      // Replace placeholder variables with example values
      const processContent = (content: string) => {
        return content
          .replace(/{{candidate\.firstName}}/g, 'John')
          .replace(/{{candidate\.lastName}}/g, 'Doe')
          .replace(/{{candidate\.skills}}/g, 'JavaScript, React, Node.js')
          .replace(/{{candidate\.lastJobApplied}}/g, 'Senior Developer')
          .replace(/{{matchedJobs}}/g, '- Senior Frontend Developer\n- Full Stack Engineer\n- React Developer');
      };

      return {
        subject: step.subject ? processContent(step.subject) : undefined,
        content: processContent(step.content || '')
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to preview campaign step';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaigns]);

  const sendTestMessage = useCallback(async (
    stepId: string,
    campaignId: string,
    recipientEmail: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));

      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const step = campaign.steps.find(s => s.id === stepId);
      if (!step) {
        throw new Error('Step not found');
      }

      // In a real implementation, this would send an actual email
      console.log(`Test message sent to ${recipientEmail} for step ${stepId} of campaign ${campaignId}`);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test message';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaigns]);

  // Context value
  const contextValue: NurtureCampaignContextType = {
    campaigns,
    isLoading,
    error,
    
    createCampaign,
    updateCampaign,
    deleteCampaign,
    
    addStepToCampaign,
    updateStep,
    removeStep,
    
    activateCampaign,
    deactivateCampaign,
    assignCampaignToTalentPool,
    unassignCampaignFromTalentPool,
    
    getCampaignStats,
    getCampaignsByTalentPool,
    
    previewCampaignStep,
    sendTestMessage
  };

  return (
    <NurtureCampaignContext.Provider value={contextValue}>
      {children}
    </NurtureCampaignContext.Provider>
  );
};

// Custom hook for using the context
export const useNurtureCampaign = () => {
  const context = useContext(NurtureCampaignContext);
  
  if (context === undefined) {
    throw new Error('useNurtureCampaign must be used within a NurtureCampaignProvider');
  }
  
  return context;
};

export default NurtureCampaignContext; 