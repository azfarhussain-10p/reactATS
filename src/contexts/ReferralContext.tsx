import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ReferralProgram, Referral } from '../models/types';

// Context interface
interface ReferralContextType {
  // State
  programs: ReferralProgram[];
  referrals: Referral[];
  isLoading: boolean;
  error: string | null;

  // Program operations
  createProgram: (
    program: Omit<ReferralProgram, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<ReferralProgram>;
  updateProgram: (id: string, updates: Partial<ReferralProgram>) => Promise<ReferralProgram>;
  deleteProgram: (id: string) => Promise<boolean>;
  toggleProgramActive: (id: string) => Promise<ReferralProgram>;

  // Referral operations
  createReferral: (
    referral: Omit<Referral, 'id' | 'submissionDate' | 'updatedAt' | 'rewardsIssued'>
  ) => Promise<Referral>;
  updateReferralStatus: (
    id: string,
    status: Referral['status'],
    notes?: string
  ) => Promise<Referral>;
  addReferralReward: (id: string, milestone: string, amount: number) => Promise<Referral>;

  // Analytics and reporting
  getReferralsByProgram: (programId: string) => Referral[];
  getReferralsByReferrer: (referrerId: string) => Referral[];
  getReferralStats: () => {
    totalReferrals: number;
    activeReferrals: number;
    hiredReferrals: number;
    totalRewardsIssued: number;
    conversionRate: number;
  };
  getReferralProgramStats: (programId: string) => {
    totalReferrals: number;
    activeReferrals: number;
    hiredReferrals: number;
    totalRewardsIssued: number;
    conversionRate: number;
  };
}

// Sample data
const samplePrograms: ReferralProgram[] = [
  {
    id: 'program-1',
    name: 'Standard Referral Program',
    description: 'Our standard employee referral program for all positions',
    active: true,
    rewards: {
      initialSubmission: 50,
      interview: 100,
      hire: 1000,
      retention30Days: 250,
      retention90Days: 500,
    },
    eligibility: {
      allEmployees: true,
    },
    createdAt: new Date('2023-01-01').toISOString(),
    updatedAt: new Date('2023-03-15').toISOString(),
  },
  {
    id: 'program-2',
    name: 'Engineering Excellence',
    description: 'Special referral program for hard-to-fill engineering roles',
    active: true,
    rewards: {
      initialSubmission: 100,
      interview: 200,
      hire: 2000,
      retention30Days: 500,
      retention90Days: 1000,
    },
    jobIds: ['job-123', 'job-124', 'job-125'],
    eligibility: {
      allEmployees: false,
      departments: ['Engineering', 'Product', 'Design'],
      minimumTenure: 3,
    },
    createdAt: new Date('2023-02-15').toISOString(),
    updatedAt: new Date('2023-02-15').toISOString(),
  },
  {
    id: 'program-3',
    name: 'Executive Search',
    description: 'Referral program for director-level and above positions',
    active: false,
    rewards: {
      interview: 500,
      hire: 5000,
      retention90Days: 2500,
      customMilestones: {
        '6 Month Retention': 2500,
        '1 Year Retention': 5000,
      },
    },
    eligibility: {
      allEmployees: false,
      departments: ['Executive', 'HR'],
      minimumTenure: 12,
    },
    createdAt: new Date('2023-04-01').toISOString(),
    updatedAt: new Date('2023-04-01').toISOString(),
  },
];

const sampleReferrals: Referral[] = [
  {
    id: 'referral-1',
    programId: 'program-1',
    referrerId: 'emp-101',
    referrerName: 'Jane Smith',
    referrerEmail: 'jane.smith@company.com',
    referrerDepartment: 'Marketing',
    candidateId: 'cand-201',
    candidateName: 'John Doe',
    candidateEmail: 'john.doe@example.com',
    candidatePhone: '555-123-4567',
    resumeUrl: 'https://storage.example.com/resumes/johndoe.pdf',
    jobId: 'job-301',
    jobTitle: 'Marketing Specialist',
    status: 'Interviewing',
    notes: 'Candidate has 5 years of experience in digital marketing',
    submissionDate: new Date('2023-05-10').toISOString(),
    rewardsIssued: [
      {
        milestone: 'initialSubmission',
        amount: 50,
        issueDate: new Date('2023-05-11').toISOString(),
      },
      {
        milestone: 'interview',
        amount: 100,
        issueDate: new Date('2023-05-18').toISOString(),
      },
    ],
    updatedAt: new Date('2023-05-18').toISOString(),
  },
  {
    id: 'referral-2',
    programId: 'program-2',
    referrerId: 'emp-102',
    referrerName: 'Mike Johnson',
    referrerEmail: 'mike.johnson@company.com',
    referrerDepartment: 'Engineering',
    candidateId: 'cand-202',
    candidateName: 'Sarah Williams',
    candidateEmail: 'sarah.williams@example.com',
    resumeUrl: 'https://storage.example.com/resumes/sarahwilliams.pdf',
    jobId: 'job-123',
    jobTitle: 'Senior Software Engineer',
    status: 'Hired',
    notes: 'Excellent candidate, strong technical skills',
    submissionDate: new Date('2023-04-15').toISOString(),
    hireDate: new Date('2023-05-20').toISOString(),
    rewardsIssued: [
      {
        milestone: 'initialSubmission',
        amount: 100,
        issueDate: new Date('2023-04-16').toISOString(),
      },
      {
        milestone: 'interview',
        amount: 200,
        issueDate: new Date('2023-04-25').toISOString(),
      },
      {
        milestone: 'hire',
        amount: 2000,
        issueDate: new Date('2023-05-21').toISOString(),
      },
    ],
    updatedAt: new Date('2023-05-21').toISOString(),
  },
  {
    id: 'referral-3',
    programId: 'program-1',
    referrerId: 'emp-103',
    referrerName: 'David Brown',
    referrerEmail: 'david.brown@company.com',
    referrerDepartment: 'Sales',
    candidateName: 'Emily Davis',
    candidateEmail: 'emily.davis@example.com',
    candidatePhone: '555-987-6543',
    jobId: 'job-302',
    jobTitle: 'Sales Representative',
    status: 'Submitted',
    notes: 'Former colleague of David, 3 years of sales experience',
    submissionDate: new Date('2023-06-01').toISOString(),
    rewardsIssued: [
      {
        milestone: 'initialSubmission',
        amount: 50,
        issueDate: new Date('2023-06-02').toISOString(),
      },
    ],
    updatedAt: new Date('2023-06-02').toISOString(),
  },
];

// Create the context
const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

// Provider component
export const ReferralProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [programs, setPrograms] = useState<ReferralProgram[]>(samplePrograms);
  const [referrals, setReferrals] = useState<Referral[]>(sampleReferrals);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Program operations
  const createProgram = useCallback(
    async (
      program: Omit<ReferralProgram, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<ReferralProgram> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newProgram: ReferralProgram = {
          ...program,
          id: `program-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setPrograms((prev) => [...prev, newProgram]);
        return newProgram;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create referral program';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateProgram = useCallback(
    async (id: string, updates: Partial<ReferralProgram>): Promise<ReferralProgram> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const index = programs.findIndex((program) => program.id === id);
        if (index === -1) {
          throw new Error('Referral program not found');
        }

        const updatedProgram = {
          ...programs[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const newPrograms = [...programs];
        newPrograms[index] = updatedProgram;
        setPrograms(newPrograms);

        return updatedProgram;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update referral program';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [programs]
  );

  const deleteProgram = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const index = programs.findIndex((program) => program.id === id);
        if (index === -1) {
          throw new Error('Referral program not found');
        }

        // Check if there are active referrals for this program
        const activeReferrals = referrals.some(
          (referral) =>
            referral.programId === id &&
            ['Submitted', 'Reviewing', 'Contacting', 'Interviewing'].includes(referral.status)
        );

        if (activeReferrals) {
          throw new Error('Cannot delete program with active referrals');
        }

        setPrograms(programs.filter((program) => program.id !== id));
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete referral program';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [programs, referrals]
  );

  const toggleProgramActive = useCallback(
    async (id: string): Promise<ReferralProgram> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        const index = programs.findIndex((program) => program.id === id);
        if (index === -1) {
          throw new Error('Referral program not found');
        }

        const updatedProgram = {
          ...programs[index],
          active: !programs[index].active,
          updatedAt: new Date().toISOString(),
        };

        const newPrograms = [...programs];
        newPrograms[index] = updatedProgram;
        setPrograms(newPrograms);

        return updatedProgram;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to toggle program status';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [programs]
  );

  // Referral operations
  const createReferral = useCallback(
    async (
      referral: Omit<Referral, 'id' | 'submissionDate' | 'updatedAt' | 'rewardsIssued'>
    ): Promise<Referral> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Validate the program
        const program = programs.find((p) => p.id === referral.programId);
        if (!program) {
          throw new Error('Referral program not found');
        }

        if (!program.active) {
          throw new Error('Referral program is not active');
        }

        // Create new referral
        const now = new Date().toISOString();
        const newReferral: Referral = {
          ...referral,
          id: `referral-${Date.now()}`,
          submissionDate: now,
          rewardsIssued: [],
          updatedAt: now,
        };

        // If the program has an initialSubmission reward, add it
        if (program.rewards.initialSubmission) {
          newReferral.rewardsIssued.push({
            milestone: 'initialSubmission',
            amount: program.rewards.initialSubmission,
            issueDate: now,
          });
        }

        setReferrals((prev) => [...prev, newReferral]);
        return newReferral;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create referral';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [programs]
  );

  const updateReferralStatus = useCallback(
    async (id: string, status: Referral['status'], notes?: string): Promise<Referral> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 400));

        const referralIndex = referrals.findIndex((r) => r.id === id);
        if (referralIndex === -1) {
          throw new Error('Referral not found');
        }

        const referral = referrals[referralIndex];
        const program = programs.find((p) => p.id === referral.programId);

        if (!program) {
          throw new Error('Referral program not found');
        }

        const updatedReferral = {
          ...referral,
          status,
          updatedAt: new Date().toISOString(),
        };

        // Add notes if provided
        if (notes) {
          updatedReferral.notes = notes;
        }

        // Add hireDate if status is 'Hired'
        if (status === 'Hired' && !referral.hireDate) {
          updatedReferral.hireDate = new Date().toISOString();

          // Add hire reward if applicable
          if (program.rewards.hire && !referral.rewardsIssued.some((r) => r.milestone === 'hire')) {
            updatedReferral.rewardsIssued.push({
              milestone: 'hire',
              amount: program.rewards.hire,
              issueDate: new Date().toISOString(),
            });
          }
        }

        // Add interview reward if applicable
        if (
          status === 'Interviewing' &&
          program.rewards.interview &&
          !referral.rewardsIssued.some((r) => r.milestone === 'interview')
        ) {
          updatedReferral.rewardsIssued.push({
            milestone: 'interview',
            amount: program.rewards.interview,
            issueDate: new Date().toISOString(),
          });
        }

        const newReferrals = [...referrals];
        newReferrals[referralIndex] = updatedReferral;
        setReferrals(newReferrals);

        return updatedReferral;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update referral status';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [referrals, programs]
  );

  const addReferralReward = useCallback(
    async (id: string, milestone: string, amount: number): Promise<Referral> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 400));

        const referralIndex = referrals.findIndex((r) => r.id === id);
        if (referralIndex === -1) {
          throw new Error('Referral not found');
        }

        const referral = referrals[referralIndex];

        // Check if this milestone reward has already been issued
        if (referral.rewardsIssued.some((r) => r.milestone === milestone)) {
          throw new Error(`Reward for milestone "${milestone}" has already been issued`);
        }

        const updatedReferral = {
          ...referral,
          rewardsIssued: [
            ...referral.rewardsIssued,
            {
              milestone,
              amount,
              issueDate: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        };

        const newReferrals = [...referrals];
        newReferrals[referralIndex] = updatedReferral;
        setReferrals(newReferrals);

        return updatedReferral;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add referral reward';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [referrals]
  );

  // Analytics and reporting
  const getReferralsByProgram = useCallback(
    (programId: string): Referral[] => {
      return referrals.filter((referral) => referral.programId === programId);
    },
    [referrals]
  );

  const getReferralsByReferrer = useCallback(
    (referrerId: string): Referral[] => {
      return referrals.filter((referral) => referral.referrerId === referrerId);
    },
    [referrals]
  );

  const getReferralStats = useCallback(() => {
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter((r) =>
      ['Submitted', 'Reviewing', 'Contacting', 'Interviewing'].includes(r.status)
    ).length;
    const hiredReferrals = referrals.filter((r) => r.status === 'Hired').length;

    const totalRewardsIssued = referrals.reduce((total, referral) => {
      const referralTotal = referral.rewardsIssued.reduce((sum, reward) => sum + reward.amount, 0);
      return total + referralTotal;
    }, 0);

    const conversionRate = totalReferrals > 0 ? hiredReferrals / totalReferrals : 0;

    return {
      totalReferrals,
      activeReferrals,
      hiredReferrals,
      totalRewardsIssued,
      conversionRate,
    };
  }, [referrals]);

  const getReferralProgramStats = useCallback(
    (programId: string) => {
      const programReferrals = referrals.filter((r) => r.programId === programId);

      const totalReferrals = programReferrals.length;
      const activeReferrals = programReferrals.filter((r) =>
        ['Submitted', 'Reviewing', 'Contacting', 'Interviewing'].includes(r.status)
      ).length;
      const hiredReferrals = programReferrals.filter((r) => r.status === 'Hired').length;

      const totalRewardsIssued = programReferrals.reduce((total, referral) => {
        const referralTotal = referral.rewardsIssued.reduce(
          (sum, reward) => sum + reward.amount,
          0
        );
        return total + referralTotal;
      }, 0);

      const conversionRate = totalReferrals > 0 ? hiredReferrals / totalReferrals : 0;

      return {
        totalReferrals,
        activeReferrals,
        hiredReferrals,
        totalRewardsIssued,
        conversionRate,
      };
    },
    [referrals]
  );

  // Context value
  const contextValue: ReferralContextType = {
    programs,
    referrals,
    isLoading,
    error,

    createProgram,
    updateProgram,
    deleteProgram,
    toggleProgramActive,

    createReferral,
    updateReferralStatus,
    addReferralReward,

    getReferralsByProgram,
    getReferralsByReferrer,
    getReferralStats,
    getReferralProgramStats,
  };

  return <ReferralContext.Provider value={contextValue}>{children}</ReferralContext.Provider>;
};

// Custom hook for using the context
export const useReferral = () => {
  const context = useContext(ReferralContext);

  if (context === undefined) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }

  return context;
};

export default ReferralContext;
