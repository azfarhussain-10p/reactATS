import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  EmailTemplate,
  EmailCampaign,
  EmailCampaignStep,
  EmailLog,
  PipelineStage,
  CandidateStatus,
  EmailTrigger,
  Candidate,
} from '../models/types';

interface EmailCampaignContextType {
  // Templates
  templates: EmailTemplate[];
  getTemplateById: (id: string) => EmailTemplate | undefined;
  createTemplate: (
    template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ) => EmailTemplate;
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => EmailTemplate | undefined;
  deleteTemplate: (id: string) => boolean;

  // Campaigns
  campaigns: EmailCampaign[];
  getCampaignById: (id: string) => EmailCampaign | undefined;
  createCampaign: (
    campaign: Omit<EmailCampaign, 'id' | 'steps' | 'createdAt' | 'updatedAt' | 'stats'>
  ) => EmailCampaign;
  updateCampaign: (id: string, updates: Partial<EmailCampaign>) => EmailCampaign | undefined;
  deleteCampaign: (id: string) => boolean;
  activateCampaign: (id: string) => boolean;
  deactivateCampaign: (id: string) => boolean;

  // Campaign Steps
  getCampaignSteps: (campaignId: string) => EmailCampaignStep[];
  addCampaignStep: (
    campaignId: string,
    step: Omit<EmailCampaignStep, 'id' | 'campaignId'>
  ) => EmailCampaignStep;
  updateCampaignStep: (
    stepId: string,
    updates: Partial<EmailCampaignStep>
  ) => EmailCampaignStep | undefined;
  deleteCampaignStep: (stepId: string) => boolean;
  reorderCampaignSteps: (campaignId: string, stepIds: string[]) => boolean;

  // Email Logs
  emailLogs: EmailLog[];
  getEmailLogsByCampaign: (campaignId: string) => EmailLog[];
  getEmailLogsByCandidate: (candidateId: number) => EmailLog[];
  createEmailLog: (log: Omit<EmailLog, 'id'>) => EmailLog;
  updateEmailLogStatus: (
    id: string,
    status: EmailLog['status'],
    details?: Partial<EmailLog>
  ) => EmailLog | undefined;

  // Email Operations
  previewEmail: (
    templateId: string,
    candidateId: number,
    jobId?: number
  ) => { subject: string; body: string };
  sendTestEmail: (
    templateId: string,
    to: string,
    candidateId?: number,
    jobId?: number
  ) => Promise<boolean>;
  processEmailTriggers: (
    trigger: EmailTrigger,
    candidateId: number,
    specifics?: any
  ) => Promise<number>; // Returns number of emails sent

  // Analytics
  getCampaignPerformance: (campaignId: string) => {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    responseRate: number;
    stepPerformance: {
      stepId: string;
      name: string;
      sent: number;
      opened: number;
      clicked: number;
      responded: number;
    }[];
  };
}

const EmailCampaignContext = createContext<EmailCampaignContextType | undefined>(undefined);

// Sample default templates
const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Application Confirmation',
    type: 'ApplicationConfirmation',
    subject: 'Thank you for your application to {{jobTitle}}',
    body: `
      <p>Dear {{candidateName}},</p>
      <p>Thank you for applying to the {{jobTitle}} position at our company. We appreciate your interest in joining our team.</p>
      <p>We are currently reviewing your application and will be in touch soon if your qualifications match our requirements.</p>
      <p>Best regards,<br>{{recruiterName}}<br>{{companyName}}</p>
    `,
    variables: ['candidateName', 'jobTitle', 'recruiterName', 'companyName'],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Interview Invitation',
    type: 'InterviewInvitation',
    subject: 'Interview Invitation for {{jobTitle}} position',
    body: `
      <p>Dear {{candidateName}},</p>
      <p>We're pleased to invite you to an interview for the {{jobTitle}} position. We were impressed with your qualifications and would like to learn more about your experience.</p>
      <p>Please click the link below to schedule your interview at a time that works for you:</p>
      <p><a href="{{schedulingLink}}">Schedule your interview</a></p>
      <p>Looking forward to speaking with you!</p>
      <p>Best regards,<br>{{recruiterName}}<br>{{companyName}}</p>
    `,
    variables: ['candidateName', 'jobTitle', 'schedulingLink', 'recruiterName', 'companyName'],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Rejection Template',
    type: 'RejectionLetter',
    subject: 'Update on your application for {{jobTitle}}',
    body: `
      <p>Dear {{candidateName}},</p>
      <p>Thank you for your interest in the {{jobTitle}} position and for taking the time to go through our application process.</p>
      <p>After careful consideration, we have decided to move forward with other candidates whose qualifications better match our current needs. We appreciate your interest in our company and encourage you to apply for future positions that match your skills and experience.</p>
      <p>We wish you success in your job search and professional endeavors.</p>
      <p>Best regards,<br>{{recruiterName}}<br>{{companyName}}</p>
    `,
    variables: ['candidateName', 'jobTitle', 'recruiterName', 'companyName'],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Sample default campaigns
const defaultCampaigns: EmailCampaign[] = [
  {
    id: '1',
    name: 'Standard Recruitment Process',
    description: 'Standard email sequence for all job applicants',
    active: true,
    steps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      totalSent: 0,
      opens: 0,
      clicks: 0,
      responses: 0,
    },
  },
];

// Default campaign steps
const defaultCampaignSteps: EmailCampaignStep[] = [
  {
    id: '1',
    campaignId: '1',
    order: 1,
    trigger: 'ApplicationReceived',
    templateId: '1',
    active: true,
    personalized: false,
  },
  {
    id: '2',
    campaignId: '1',
    order: 2,
    trigger: 'SpecificStage',
    triggerSpecifics: {
      stage: 'Screening',
      delayDays: 1,
    },
    templateId: '2',
    active: true,
    personalized: true,
  },
];

export const EmailCampaignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(defaultCampaigns);
  const [campaignSteps, setCampaignSteps] = useState<EmailCampaignStep[]>(defaultCampaignSteps);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  // Initialize campaigns with their steps
  useEffect(() => {
    const updatedCampaigns = campaigns.map((campaign) => {
      const steps = campaignSteps
        .filter((step) => step.campaignId === campaign.id)
        .sort((a, b) => a.order - b.order);
      return { ...campaign, steps };
    });

    setCampaigns(updatedCampaigns);
  }, [campaignSteps]);

  // Template operations
  const getTemplateById = (id: string) => {
    return templates.find((template) => template.id === id);
  };

  const createTemplate = (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (id: string, updates: Partial<EmailTemplate>) => {
    const templateIndex = templates.findIndex((template) => template.id === id);
    if (templateIndex === -1) return undefined;

    const updatedTemplate = {
      ...templates[templateIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const newTemplates = [...templates];
    newTemplates[templateIndex] = updatedTemplate;

    setTemplates(newTemplates);
    return updatedTemplate;
  };

  const deleteTemplate = (id: string) => {
    // Check if template is in use by any campaign steps
    const inUse = campaignSteps.some((step) => step.templateId === id);
    if (inUse) return false;

    setTemplates((prev) => prev.filter((template) => template.id !== id));
    return true;
  };

  // Campaign operations
  const getCampaignById = (id: string) => {
    return campaigns.find((campaign) => campaign.id === id);
  };

  const createCampaign = (
    campaign: Omit<EmailCampaign, 'id' | 'steps' | 'createdAt' | 'updatedAt' | 'stats'>
  ) => {
    const newCampaign: EmailCampaign = {
      ...campaign,
      id: uuidv4(),
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalSent: 0,
        opens: 0,
        clicks: 0,
        responses: 0,
      },
    };

    setCampaigns((prev) => [...prev, newCampaign]);
    return newCampaign;
  };

  const updateCampaign = (id: string, updates: Partial<EmailCampaign>) => {
    const campaignIndex = campaigns.findIndex((campaign) => campaign.id === id);
    if (campaignIndex === -1) return undefined;

    const updatedCampaign = {
      ...campaigns[campaignIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const newCampaigns = [...campaigns];
    newCampaigns[campaignIndex] = updatedCampaign;

    setCampaigns(newCampaigns);
    return updatedCampaign;
  };

  const deleteCampaign = (id: string) => {
    // Delete all steps associated with this campaign
    setCampaignSteps((prev) => prev.filter((step) => step.campaignId !== id));

    // Delete the campaign
    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
    return true;
  };

  const activateCampaign = (id: string) => {
    return Boolean(updateCampaign(id, { active: true }));
  };

  const deactivateCampaign = (id: string) => {
    return Boolean(updateCampaign(id, { active: false }));
  };

  // Campaign step operations
  const getCampaignSteps = (campaignId: string) => {
    return campaignSteps
      .filter((step) => step.campaignId === campaignId)
      .sort((a, b) => a.order - b.order);
  };

  const addCampaignStep = (
    campaignId: string,
    step: Omit<EmailCampaignStep, 'id' | 'campaignId'>
  ) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) throw new Error(`Campaign with ID ${campaignId} not found`);

    const existingSteps = getCampaignSteps(campaignId);
    const order = step.order || existingSteps.length + 1;

    // If inserting in the middle, reorder existing steps
    if (order <= existingSteps.length) {
      setCampaignSteps((prev) =>
        prev.map((s) =>
          s.campaignId === campaignId && s.order >= order ? { ...s, order: s.order + 1 } : s
        )
      );
    }

    const newStep: EmailCampaignStep = {
      ...step,
      id: uuidv4(),
      campaignId,
      order,
    };

    setCampaignSteps((prev) => [...prev, newStep]);

    // Update the campaign with the new step
    updateCampaign(campaignId, {
      updatedAt: new Date().toISOString(),
    });

    return newStep;
  };

  const updateCampaignStep = (stepId: string, updates: Partial<EmailCampaignStep>) => {
    const stepIndex = campaignSteps.findIndex((step) => step.id === stepId);
    if (stepIndex === -1) return undefined;

    const updatedStep = {
      ...campaignSteps[stepIndex],
      ...updates,
    };

    const newSteps = [...campaignSteps];
    newSteps[stepIndex] = updatedStep;

    setCampaignSteps(newSteps);

    // Update the campaign updatedAt
    updateCampaign(updatedStep.campaignId, {
      updatedAt: new Date().toISOString(),
    });

    return updatedStep;
  };

  const deleteCampaignStep = (stepId: string) => {
    const step = campaignSteps.find((s) => s.id === stepId);
    if (!step) return false;

    // Get all steps for this campaign to reorder
    const campaignId = step.campaignId;
    const affectedSteps = campaignSteps.filter(
      (s) => s.campaignId === campaignId && s.order > step.order
    );

    // Remove the step
    setCampaignSteps((prev) => prev.filter((s) => s.id !== stepId));

    // Reorder remaining steps
    if (affectedSteps.length > 0) {
      setCampaignSteps((prev) =>
        prev.map((s) =>
          s.campaignId === campaignId && s.order > step.order ? { ...s, order: s.order - 1 } : s
        )
      );
    }

    // Update the campaign
    updateCampaign(campaignId, {
      updatedAt: new Date().toISOString(),
    });

    return true;
  };

  const reorderCampaignSteps = (campaignId: string, stepIds: string[]) => {
    const stepsForCampaign = campaignSteps.filter((step) => step.campaignId === campaignId);

    // Validate that all IDs belong to this campaign
    if (stepIds.length !== stepsForCampaign.length) return false;
    if (!stepIds.every((id) => stepsForCampaign.some((step) => step.id === id))) return false;

    // Update order for each step
    const updatedSteps = [...campaignSteps];

    stepIds.forEach((id, index) => {
      const stepIndex = updatedSteps.findIndex((step) => step.id === id);
      if (stepIndex !== -1) {
        updatedSteps[stepIndex] = {
          ...updatedSteps[stepIndex],
          order: index + 1,
        };
      }
    });

    setCampaignSteps(updatedSteps);

    // Update campaign
    updateCampaign(campaignId, {
      updatedAt: new Date().toISOString(),
    });

    return true;
  };

  // Email logs operations
  const getEmailLogsByCampaign = (campaignId: string) => {
    return emailLogs.filter((log) => log.campaignId === campaignId);
  };

  const getEmailLogsByCandidate = (candidateId: number) => {
    return emailLogs.filter((log) => log.candidateId === candidateId);
  };

  const createEmailLog = (log: Omit<EmailLog, 'id'>) => {
    const newLog: EmailLog = {
      ...log,
      id: uuidv4(),
    };

    setEmailLogs((prev) => [...prev, newLog]);

    // Update campaign stats if this is part of a campaign
    if (log.campaignId) {
      const campaign = getCampaignById(log.campaignId);
      if (campaign) {
        updateCampaign(log.campaignId, {
          stats: {
            ...campaign.stats,
            totalSent: campaign.stats.totalSent + 1,
          },
        });
      }
    }

    return newLog;
  };

  const updateEmailLogStatus = (
    id: string,
    status: EmailLog['status'],
    details?: Partial<EmailLog>
  ) => {
    const logIndex = emailLogs.findIndex((log) => log.id === id);
    if (logIndex === -1) return undefined;

    const oldLog = emailLogs[logIndex];
    const updatedLog: EmailLog = {
      ...oldLog,
      status,
      ...(details || {}),
    };

    const newLogs = [...emailLogs];
    newLogs[logIndex] = updatedLog;

    setEmailLogs(newLogs);

    // Update campaign stats if this is part of a campaign
    if (oldLog.campaignId) {
      const campaign = getCampaignById(oldLog.campaignId);
      if (campaign) {
        const stats = { ...campaign.stats };

        // Update appropriate stat based on status change
        if (status === 'Opened' && !oldLog.openedAt) {
          stats.opens += 1;
        } else if (status === 'Clicked' && !oldLog.clickedAt) {
          stats.clicks += 1;
        } else if (status === 'Responded' && !oldLog.respondedAt) {
          stats.responses += 1;
        }

        updateCampaign(oldLog.campaignId, { stats });
      }
    }

    return updatedLog;
  };

  // Email operations
  const previewEmail = (templateId: string, candidateId: number, jobId?: number) => {
    // In a real app, you would:
    // 1. Get the template
    // 2. Get candidate data
    // 3. Get job data if jobId provided
    // 4. Replace variables with actual data

    const template = getTemplateById(templateId);
    if (!template) {
      return {
        subject: 'Template not found',
        body: 'The requested email template could not be found.',
      };
    }

    // For this demo, we'll just show the template with placeholders
    return {
      subject: template.subject,
      body: template.body,
    };
  };

  const sendTestEmail = async (
    templateId: string,
    to: string,
    candidateId?: number,
    jobId?: number
  ) => {
    // In a real app, you would:
    // 1. Preview the email (get subject and body with variables replaced)
    // 2. Send the email to the provided address
    // 3. Return success/failure

    // For this demo, we'll just simulate sending
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // 90% success rate for demo
        const success = Math.random() < 0.9;
        resolve(success);
      }, 1000);
    });
  };

  const processEmailTriggers = async (
    trigger: EmailTrigger,
    candidateId: number,
    specifics?: any
  ) => {
    // In a real app, you would:
    // 1. Find all active campaigns
    // 2. Find steps that match this trigger and specifics
    // 3. Check conditions for each step
    // 4. Send emails for matching steps
    // 5. Create email logs

    // For this demo, we'll just simulate processing
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        // Simulate 0-3 emails sent
        const emailsSent = Math.floor(Math.random() * 4);
        resolve(emailsSent);
      }, 1000);
    });
  };

  // Analytics
  const getCampaignPerformance = (campaignId: string) => {
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
      return {
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        responseRate: 0,
        stepPerformance: [],
      };
    }

    const logs = getEmailLogsByCampaign(campaignId);
    const totalSent = logs.length;

    if (totalSent === 0) {
      return {
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        responseRate: 0,
        stepPerformance: [],
      };
    }

    const delivered = logs.filter((log) =>
      ['Sent', 'Opened', 'Clicked', 'Responded'].includes(log.status)
    ).length;

    const opened = logs.filter((log) => log.openedAt).length;
    const clicked = logs.filter((log) => log.clickedAt).length;
    const responded = logs.filter((log) => log.respondedAt).length;

    // Calculate step performance
    const stepPerformance = campaign.steps.map((step) => {
      const stepLogs = logs.filter((log) => log.stepId === step.id);
      const stepSent = stepLogs.length;
      const stepOpened = stepLogs.filter((log) => log.openedAt).length;
      const stepClicked = stepLogs.filter((log) => log.clickedAt).length;
      const stepResponded = stepLogs.filter((log) => log.respondedAt).length;

      return {
        stepId: step.id,
        name: `Step ${step.order}`,
        sent: stepSent,
        opened: stepOpened,
        clicked: stepClicked,
        responded: stepResponded,
      };
    });

    return {
      deliveryRate: delivered / totalSent,
      openRate: opened / totalSent,
      clickRate: clicked / totalSent,
      responseRate: responded / totalSent,
      stepPerformance,
    };
  };

  const value = {
    // Templates
    templates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // Campaigns
    campaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    activateCampaign,
    deactivateCampaign,

    // Campaign Steps
    getCampaignSteps,
    addCampaignStep,
    updateCampaignStep,
    deleteCampaignStep,
    reorderCampaignSteps,

    // Email Logs
    emailLogs,
    getEmailLogsByCampaign,
    getEmailLogsByCandidate,
    createEmailLog,
    updateEmailLogStatus,

    // Email Operations
    previewEmail,
    sendTestEmail,
    processEmailTriggers,

    // Analytics
    getCampaignPerformance,
  };

  return <EmailCampaignContext.Provider value={value}>{children}</EmailCampaignContext.Provider>;
};

export const useEmailCampaign = () => {
  const context = useContext(EmailCampaignContext);
  if (context === undefined) {
    throw new Error('useEmailCampaign must be used within an EmailCampaignProvider');
  }
  return context;
};

export default EmailCampaignContext;
