import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  TalentPool,
  TalentPoolCategory,
  CandidateRelationship,
  NurtureCampaign,
  NurtureStep,
  EngagementLevel,
  RecruitmentEvent,
  Referral,
  ReferralProgram,
  AlumniNetwork,
} from '../models/types';
import { useCandidateContext } from './CandidateContext';
import { announce } from '../components/ScreenReaderAnnouncer';

// Sample data
const defaultTalentPools: TalentPool[] = [
  {
    id: '1',
    name: 'Software Engineers',
    description: 'Pool of software engineering candidates',
    category: 'Passive Candidate',
    tags: ['JavaScript', 'React', 'Node.js'],
    filters: [
      {
        id: '1',
        field: 'skills',
        operator: 'in',
        values: ['JavaScript', 'React', 'Node.js'],
      },
    ],
    candidateIds: ['1', '3', '5'],
    campaignIds: ['1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true,
    color: '#1976d2',
  },
  {
    id: '2',
    name: 'Former Employees',
    description: 'Previous employees who left in good standing',
    category: 'Former Employee',
    tags: ['Alumni', 'Rehire'],
    filters: [],
    candidateIds: ['2', '4'],
    campaignIds: ['2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true,
    color: '#9c27b0',
  },
];

const defaultNurtureCampaigns: NurtureCampaign[] = [
  {
    id: '1',
    name: 'Tech Talent Engagement',
    description: 'Keep software engineers engaged with our brand',
    talentPoolIds: ['1'],
    steps: [
      {
        id: '1',
        campaignId: '1',
        order: 0,
        type: 'Email',
        templateId: '1',
        delayDays: 0,
        active: true,
      },
      {
        id: '2',
        campaignId: '1',
        order: 1,
        type: 'Email',
        templateId: '2',
        delayDays: 7,
        condition: {
          previousStepOutcome: 'Opened',
        },
        active: true,
      },
    ],
    active: true,
    stats: {
      totalCandidates: 3,
      engagement: 0.75,
      responses: 0.5,
      conversions: 0.25,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Alumni Network',
    description: 'Keep in touch with former employees',
    talentPoolIds: ['2'],
    steps: [
      {
        id: '3',
        campaignId: '2',
        order: 0,
        type: 'Email',
        templateId: '3',
        delayDays: 0,
        active: true,
      },
    ],
    active: true,
    stats: {
      totalCandidates: 2,
      engagement: 1.0,
      responses: 0.5,
      conversions: 0.0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// CRM types
interface TalentPool {
  id: string;
  name: string;
  description: string;
  criteria: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  candidateCount: number;
}

interface CandidateInteraction {
  id: string;
  candidateId: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'event' | 'assessment';
  description: string;
  date: Date;
  outcome?: string;
  nextSteps?: string;
  score?: number; // Engagement score impact
}

interface NurtureCampaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetAudience: {
    talentPoolIds?: string[];
    criteria?: Record<string, any>;
  };
  steps: Array<{
    id: string;
    type: 'email' | 'task' | 'notification';
    content: string;
    delayDays: number;
    condition?: string;
  }>;
  metrics: {
    candidatesEnrolled: number;
    completionRate: number;
    engagementRate: number;
    conversionRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface RecruitmentEvent {
  id: string;
  name: string;
  description: string;
  type: 'career_fair' | 'webinar' | 'workshop' | 'interview_day' | 'networking';
  location: string;
  virtual: boolean;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  registeredCandidates: string[]; // candidateIds
  attendees: string[]; // candidateIds of those who attended
  budget?: number;
  actualCost?: number;
  metrics: {
    registrationCount: number;
    attendanceCount: number;
    hiringConversions: number;
  };
}

interface Referral {
  id: string;
  referrerId: string; // Employee ID who referred
  referrerName: string;
  candidateId: string;
  candidateName: string;
  jobId?: string;
  jobTitle?: string;
  status: 'pending' | 'contacted' | 'interviewing' | 'hired' | 'rejected';
  dateReferred: Date;
  notes?: string;
  reward?: {
    type: 'monetary' | 'points' | 'gift' | 'other';
    value: number;
    status: 'pending' | 'approved' | 'paid';
  };
}

interface AlumnusProfile {
  id: string;
  candidateId: string;
  name: string;
  email: string;
  phone?: string;
  previousRole: string;
  department: string;
  employmentPeriod: {
    startDate: Date;
    endDate: Date;
  };
  reasonForLeaving?: string;
  rehireEligible: boolean;
  currentCompany?: string;
  currentRole?: string;
  linkedin?: string;
  lastContactDate?: Date;
  relationships: CandidateInteraction[];
  engagementScore: number;
  tags: string[];
}

interface ExternalCRMIntegration {
  id: string;
  name: string;
  type: 'salesforce' | 'hubspot' | 'zoho' | 'custom';
  status: 'active' | 'inactive' | 'error';
  lastSync: Date;
  settings: Record<string, any>;
  mappedFields: Record<string, string>;
}

// Context state type
interface CRMContextType {
  // State
  talentPools: TalentPool[];
  candidateInteractions: CandidateInteraction[];
  nurtureCampaigns: NurtureCampaign[];
  recruitmentEvents: RecruitmentEvent[];
  referrals: Referral[];
  alumniNetwork: AlumnusProfile[];
  externalIntegrations: ExternalCRMIntegration[];

  // Talent Pool Management
  createTalentPool: (
    pool: Omit<TalentPool, 'id' | 'createdAt' | 'updatedAt' | 'candidateCount'>
  ) => TalentPool;
  updateTalentPool: (id: string, updates: Partial<TalentPool>) => TalentPool | null;
  deleteTalentPool: (id: string) => boolean;
  getPoolCandidates: (poolId: string) => Array<{ id: string; name: string }>;
  addCandidateToPool: (poolId: string, candidateId: string) => boolean;
  removeCandidateFromPool: (poolId: string, candidateId: string) => boolean;

  // Candidate Interactions
  recordInteraction: (
    interaction: Omit<CandidateInteraction, 'id' | 'date'>
  ) => CandidateInteraction;
  getCandidateInteractions: (candidateId: string) => CandidateInteraction[];
  updateInteraction: (
    id: string,
    updates: Partial<CandidateInteraction>
  ) => CandidateInteraction | null;
  deleteInteraction: (id: string) => boolean;

  // Nurture Campaigns
  createCampaign: (
    campaign: Omit<NurtureCampaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>
  ) => NurtureCampaign;
  updateCampaign: (id: string, updates: Partial<NurtureCampaign>) => NurtureCampaign | null;
  deleteCampaign: (id: string) => boolean;
  launchCampaign: (id: string) => boolean;
  pauseCampaign: (id: string) => boolean;
  getCampaignStats: (id: string) => NurtureCampaign['metrics'];

  // Event Management
  createEvent: (
    event: Omit<RecruitmentEvent, 'id' | 'registeredCandidates' | 'attendees' | 'metrics'>
  ) => RecruitmentEvent;
  updateEvent: (id: string, updates: Partial<RecruitmentEvent>) => RecruitmentEvent | null;
  deleteEvent: (id: string) => boolean;
  registerCandidateForEvent: (eventId: string, candidateId: string) => boolean;
  recordEventAttendance: (eventId: string, candidateId: string) => boolean;
  getEventStats: (id: string) => RecruitmentEvent['metrics'];

  // Referral Program
  createReferral: (referral: Omit<Referral, 'id' | 'dateReferred'>) => Referral;
  updateReferralStatus: (id: string, status: Referral['status']) => Referral | null;
  approveReferralReward: (id: string) => Referral | null;
  payReferralReward: (id: string) => Referral | null;
  getReferralsByEmployee: (employeeId: string) => Referral[];
  getReferralsByJob: (jobId: string) => Referral[];

  // Alumni Network
  addAlumnus: (
    alumnus: Omit<AlumnusProfile, 'id' | 'relationships' | 'engagementScore'>
  ) => AlumnusProfile;
  updateAlumnusProfile: (id: string, updates: Partial<AlumnusProfile>) => AlumnusProfile | null;
  trackAlumnusInteraction: (
    id: string,
    interaction: Omit<CandidateInteraction, 'id' | 'candidateId' | 'date'>
  ) => CandidateInteraction;
  getAlumniByDepartment: (department: string) => AlumnusProfile[];

  // External Integrations
  configureExternalIntegration: (
    integration: Omit<ExternalCRMIntegration, 'id' | 'lastSync'>
  ) => ExternalCRMIntegration;
  updateIntegrationSettings: (
    id: string,
    settings: Record<string, any>
  ) => ExternalCRMIntegration | null;
  syncWithExternalCRM: (id: string) => Promise<{ success: boolean; message: string }>;
}

// Create the context with default values
const CRMContext = createContext<CRMContextType | null>(null);

// Provider component
export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const candidateContext = useCandidateContext();

  // State
  const [talentPools, setTalentPools] = useState<TalentPool[]>(defaultTalentPools);
  const [nurtureCampaigns, setNurtureCampaigns] =
    useState<NurtureCampaign[]>(defaultNurtureCampaigns);
  const [relationships, setRelationships] = useState<CandidateRelationship[]>([]);
  const [events, setEvents] = useState<RecruitmentEvent[]>([]);
  const [referralPrograms, setReferralPrograms] = useState<ReferralProgram[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [alumniNetworks, setAlumniNetworks] = useState<AlumniNetwork[]>([]);
  const [candidateInteractions, setCandidateInteractions] = useState<CandidateInteraction[]>([]);
  const [recruitmentEvents, setRecruitmentEvents] = useState<RecruitmentEvent[]>([]);
  const [externalIntegrations, setExternalIntegrations] = useState<ExternalCRMIntegration[]>([]);

  // Talent Pool functions
  const createTalentPool = (
    pool: Omit<TalentPool, 'id' | 'createdAt' | 'updatedAt' | 'candidateCount'>
  ) => {
    const newPool: TalentPool = {
      ...pool,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      candidateCount: 0,
    };

    setTalentPools((prev) => [...prev, newPool]);
    announce(`Created talent pool: ${newPool.name}`);
    return newPool;
  };

  const updateTalentPool = (id: string, updates: Partial<TalentPool>) => {
    let updatedPool: TalentPool | null = null;

    setTalentPools((prev) => {
      const updatedPools = prev.map((pool) => {
        if (pool.id === id) {
          updatedPool = {
            ...pool,
            ...updates,
            updatedAt: new Date(),
          };
          return updatedPool;
        }
        return pool;
      });

      return updatedPools;
    });

    if (updatedPool) {
      announce(`Updated talent pool: ${updatedPool.name}`);
    }

    return updatedPool;
  };

  const deleteTalentPool = (id: string) => {
    const poolToDelete = talentPools.find((pool) => pool.id === id);

    if (!poolToDelete) {
      return false;
    }

    setTalentPools((prev) => prev.filter((pool) => pool.id !== id));
    announce(`Deleted talent pool: ${poolToDelete.name}`);
    return true;
  };

  const getPoolCandidates = (poolId: string) => {
    const pool = talentPools.find((p) => p.id === poolId);

    if (!pool || !candidateContext) {
      return [];
    }

    return pool.candidateIds
      .map((id) => candidateContext.candidates.find((c) => c.id.toString() === id))
      .filter(Boolean)
      .map((candidate) => ({ id: candidate.id.toString(), name: candidate.name }));
  };

  const addCandidateToPool = (poolId: string, candidateId: string) => {
    const pool = talentPools.find((p) => p.id === poolId);

    if (!pool) {
      return false;
    }

    if (pool.candidateIds.includes(candidateId)) {
      return true; // Already in pool
    }

    updateTalentPool(poolId, {
      candidateIds: [...pool.candidateIds, candidateId],
    });

    announce(`Added candidate to talent pool: ${pool.name}`);
    return true;
  };

  const removeCandidateFromPool = (poolId: string, candidateId: string) => {
    const pool = talentPools.find((p) => p.id === poolId);

    if (!pool) {
      return false;
    }

    updateTalentPool(poolId, {
      candidateIds: pool.candidateIds.filter((id) => id !== candidateId),
    });

    announce(`Removed candidate from talent pool: ${pool.name}`);
    return true;
  };

  // Nurture Campaign functions
  const createNurtureCampaign = (
    campaign: Omit<NurtureCampaign, 'id' | 'createdAt' | 'updatedAt' | 'stats'>
  ) => {
    const newCampaign: NurtureCampaign = {
      ...campaign,
      id: uuidv4(),
      stats: {
        totalCandidates: 0,
        engagement: 0,
        responses: 0,
        conversions: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNurtureCampaigns((prev) => [...prev, newCampaign]);
    announce(`Created nurture campaign: ${newCampaign.name}`);
    return newCampaign;
  };

  const updateNurtureCampaign = (id: string, updates: Partial<NurtureCampaign>) => {
    let updatedCampaign: NurtureCampaign | null = null;

    setNurtureCampaigns((prev) => {
      const updatedCampaigns = prev.map((campaign) => {
        if (campaign.id === id) {
          updatedCampaign = {
            ...campaign,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return updatedCampaign;
        }
        return campaign;
      });

      return updatedCampaigns;
    });

    if (updatedCampaign) {
      announce(`Updated nurture campaign: ${updatedCampaign.name}`);
    }

    return updatedCampaign;
  };

  const deleteNurtureCampaign = (id: string) => {
    const campaignToDelete = nurtureCampaigns.find((c) => c.id === id);

    if (!campaignToDelete) {
      return false;
    }

    setNurtureCampaigns((prev) => prev.filter((c) => c.id !== id));
    announce(`Deleted nurture campaign: ${campaignToDelete.name}`);
    return true;
  };

  const getNurtureCampaignById = (id: string) => {
    return nurtureCampaigns.find((c) => c.id === id);
  };

  const addStepToCampaign = (campaignId: string, step: Omit<NurtureStep, 'id' | 'campaignId'>) => {
    const campaign = nurtureCampaigns.find((c) => c.id === campaignId);

    if (!campaign) {
      return null;
    }

    const newStep: NurtureStep = {
      ...step,
      id: uuidv4(),
      campaignId,
    };

    const updatedCampaign = updateNurtureCampaign(campaignId, {
      steps: [...campaign.steps, newStep],
    });

    announce(`Added step to campaign: ${campaign.name}`);
    return updatedCampaign ? newStep : null;
  };

  const updateCampaignStep = (
    campaignId: string,
    stepId: string,
    updates: Partial<NurtureStep>
  ) => {
    const campaign = nurtureCampaigns.find((c) => c.id === campaignId);

    if (!campaign) {
      return null;
    }

    let updatedStep: NurtureStep | null = null;

    const updatedSteps = campaign.steps.map((step) => {
      if (step.id === stepId) {
        updatedStep = { ...step, ...updates };
        return updatedStep;
      }
      return step;
    });

    updateNurtureCampaign(campaignId, { steps: updatedSteps });

    if (updatedStep) {
      announce(`Updated campaign step`);
    }

    return updatedStep;
  };

  const deleteCampaignStep = (campaignId: string, stepId: string) => {
    const campaign = nurtureCampaigns.find((c) => c.id === campaignId);

    if (!campaign) {
      return false;
    }

    const updatedSteps = campaign.steps.filter((step) => step.id !== stepId);

    updateNurtureCampaign(campaignId, { steps: updatedSteps });
    announce(`Deleted campaign step`);
    return true;
  };

  const activateCampaign = (id: string) => {
    const result = updateNurtureCampaign(id, { active: true });
    announce(`Activated campaign`);
    return !!result;
  };

  const deactivateCampaign = (id: string) => {
    const result = updateNurtureCampaign(id, { active: false });
    announce(`Deactivated campaign`);
    return !!result;
  };

  // Relationship functions
  const getCandidateRelationship = (candidateId: string) => {
    return relationships.find((r) => r.candidateId === candidateId) || null;
  };

  const updateEngagementLevel = (candidateId: string, level: EngagementLevel) => {
    const relationship = relationships.find((r) => r.candidateId === candidateId);

    if (!relationship) {
      // Create new relationship
      const newRelationship: CandidateRelationship = {
        id: uuidv4(),
        candidateId,
        talentPoolIds: [],
        contactHistory: [],
        touchPoints: [],
        engagementLevel: level,
        engagementScore: getScoreForEngagementLevel(level),
        lastContact: new Date().toISOString(),
        notes: '',
        responseRate: 0,
        preferredContactMethod: 'Email',
        leadSource: 'Direct',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setRelationships((prev) => [...prev, newRelationship]);
      announce(`Updated candidate engagement level to ${level}`);
      return true;
    }

    // Update existing relationship
    setRelationships((prev) =>
      prev.map((r) => {
        if (r.id === relationship.id) {
          return {
            ...r,
            engagementLevel: level,
            engagementScore: getScoreForEngagementLevel(level),
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );

    announce(`Updated candidate engagement level to ${level}`);
    return true;
  };

  const getScoreForEngagementLevel = (level: EngagementLevel): number => {
    switch (level) {
      case 'Very Hot':
        return 100;
      case 'Hot':
        return 75;
      case 'Warm':
        return 50;
      case 'Cold':
        return 25;
      case 'Not Interested':
        return 0;
      default:
        return 0;
    }
  };

  const logContactWithCandidate = (candidateId: string, contactData: any) => {
    const relationship = relationships.find((r) => r.candidateId === candidateId);

    if (!relationship) {
      // Create new relationship with contact history
      const newRelationship: CandidateRelationship = {
        id: uuidv4(),
        candidateId,
        talentPoolIds: [],
        contactHistory: [
          {
            id: uuidv4(),
            date: new Date().toISOString(),
            type: contactData.type || 'Other',
            direction: contactData.direction || 'Outbound',
            subject: contactData.subject || '',
            notes: contactData.notes || '',
            outcome: contactData.outcome || 'Neutral',
            followUpRequired: contactData.followUpRequired || false,
            followUpDate: contactData.followUpDate,
            createdBy: contactData.createdBy || 'system',
          },
        ],
        touchPoints: [],
        engagementLevel: 'Cold',
        engagementScore: getScoreForEngagementLevel('Cold'),
        lastContact: new Date().toISOString(),
        notes: '',
        responseRate: 0,
        preferredContactMethod: 'Email',
        leadSource: 'Direct',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setRelationships((prev) => [...prev, newRelationship]);
      announce(`Logged new contact with candidate`);
      return true;
    }

    // Update existing relationship with new contact
    setRelationships((prev) =>
      prev.map((r) => {
        if (r.id === relationship.id) {
          return {
            ...r,
            contactHistory: [
              ...r.contactHistory,
              {
                id: uuidv4(),
                date: new Date().toISOString(),
                type: contactData.type || 'Other',
                direction: contactData.direction || 'Outbound',
                subject: contactData.subject || '',
                notes: contactData.notes || '',
                outcome: contactData.outcome || 'Neutral',
                followUpRequired: contactData.followUpRequired || false,
                followUpDate: contactData.followUpDate,
                createdBy: contactData.createdBy || 'system',
              },
            ],
            lastContact: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );

    announce(`Logged new contact with candidate`);
    return true;
  };

  // Events, Referrals, and Alumni stub functions
  const getUpcomingEvents = () => {
    return events.filter((e) => new Date(e.startDate) > new Date());
  };

  const getReferralPrograms = () => {
    return referralPrograms;
  };

  const getActiveReferrals = () => {
    return referrals.filter((r) => r.status !== 'Rejected' && r.status !== 'Withdrawn');
  };

  const getAlumniNetworks = () => {
    return alumniNetworks;
  };

  // Candidate Interactions
  const recordInteraction = (
    interaction: Omit<CandidateInteraction, 'id' | 'date'>
  ): CandidateInteraction => {
    const newInteraction: CandidateInteraction = {
      ...interaction,
      id: uuidv4(),
      date: new Date(),
    };
    setCandidateInteractions((prev) => [...prev, newInteraction]);
    return newInteraction;
  };

  const getCandidateInteractions = (candidateId: string): CandidateInteraction[] => {
    return candidateInteractions.filter((interaction) => interaction.candidateId === candidateId);
  };

  // External Integrations
  const syncWithExternalCRM = async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    // Simulate API call to external CRM
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update the integration's last sync time
    const index = externalIntegrations.findIndex((integration) => integration.id === id);
    if (index === -1) return { success: false, message: 'Integration not found' };

    const updatedIntegration = {
      ...externalIntegrations[index],
      lastSync: new Date(),
      status: 'active' as const,
    };

    setExternalIntegrations((prev) => {
      const updatedIntegrations = [...prev];
      updatedIntegrations[index] = updatedIntegration;
      return updatedIntegrations;
    });

    return { success: true, message: 'Successfully synchronized with external CRM' };
  };

  // Context value
  const value: CRMContextType = {
    // State
    talentPools,
    candidateInteractions,
    nurtureCampaigns,
    recruitmentEvents,
    referrals,
    alumniNetworks,
    externalIntegrations,

    // Functions
    createTalentPool,
    updateTalentPool,
    deleteTalentPool,
    getPoolCandidates,
    addCandidateToPool,
    removeCandidateFromPool,

    recordInteraction,
    getCandidateInteractions,
    updateInteraction: (id, updates) => null,
    deleteInteraction: (id) => false,

    createNurtureCampaign,
    updateNurtureCampaign,
    deleteNurtureCampaign,
    getNurtureCampaignById,
    addStepToCampaign,
    updateCampaignStep,
    deleteCampaignStep,
    activateCampaign,
    deactivateCampaign,

    getUpcomingEvents,

    getReferralPrograms,
    getActiveReferrals,

    getAlumniNetworks,

    createCampaign,
    updateCampaign: (id, updates) => null,
    deleteCampaign: (id) => false,
    launchCampaign: (id) => false,
    pauseCampaign: (id) => false,
    getCampaignStats: (id) =>
      nurtureCampaigns.find((c) => c.id === id)?.metrics || {
        candidatesEnrolled: 0,
        completionRate: 0,
        engagementRate: 0,
        conversionRate: 0,
      },

    createEvent,
    updateEvent: (id, updates) => null,
    deleteEvent: (id) => false,
    registerCandidateForEvent: (eventId, candidateId) => false,
    recordEventAttendance: (eventId, candidateId) => false,
    getEventStats: (id) =>
      recruitmentEvents.find((e) => e.id === id)?.metrics || {
        registrationCount: 0,
        attendanceCount: 0,
        hiringConversions: 0,
      },

    createReferral: (referral) => ({ ...referral, id: uuidv4(), dateReferred: new Date() }),
    updateReferralStatus: (id, status) => null,
    approveReferralReward: (id) => null,
    payReferralReward: (id) => null,
    getReferralsByEmployee: (employeeId) => [],
    getReferralsByJob: (jobId) => [],

    addAlumnus: (alumnus) => ({
      ...alumnus,
      id: uuidv4(),
      relationships: [],
      engagementScore: 0,
    }),
    updateAlumnusProfile: (id, updates) => null,
    trackAlumnusInteraction: (id, interaction) => ({
      ...interaction,
      id: uuidv4(),
      candidateId: id,
      date: new Date(),
    }),
    getAlumniByDepartment: (department) => [],

    configureExternalIntegration: (integration) => ({
      ...integration,
      id: uuidv4(),
      lastSync: new Date(),
    }),
    updateIntegrationSettings: (id, settings) => null,
    syncWithExternalCRM,
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
};

// Custom hook for using CRM context
export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
