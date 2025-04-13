import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  EmailTemplate, 
  EmailTemplateCategory, 
  ScheduledCommunication, 
  CommunicationLog,
  CommunicationPreferences,
  Candidate
} from '../models/types';
import { useCandidateContext } from './CandidateContext';
import { announce } from '../components/ScreenReaderAnnouncer';

// Mock data for email templates
const mockEmailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Application Received',
    subject: 'We received your application for {{jobTitle}}',
    body: '<p>Dear {{firstName}},</p><p>Thank you for applying to the {{jobTitle}} position at our company. We appreciate your interest in joining our team.</p><p>Our hiring team is currently reviewing applications and we will be in touch with you soon regarding the status of your application.</p><p>Best regards,<br/>The Recruitment Team</p>',
    category: 'Application Confirmation',
    variables: ['firstName', 'jobTitle', 'companyName'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: '2',
    name: 'Interview Invitation',
    subject: 'Interview Invitation for {{jobTitle}} position',
    body: '<p>Dear {{firstName}},</p><p>We were impressed with your application and would like to invite you for an interview for the {{jobTitle}} position.</p><p>Please use the link below to select a time that works for you:</p><p>{{interviewLink}}</p><p>If you have any questions, please don\'t hesitate to reach out.</p><p>Best regards,<br/>{{recruiterName}}<br/>{{companyName}}</p>',
    category: 'Interview Invitation',
    variables: ['firstName', 'jobTitle', 'interviewLink', 'recruiterName', 'companyName'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: '3',
    name: 'Interview Reminder',
    subject: 'Reminder: Your interview for {{jobTitle}} is tomorrow',
    body: '<p>Dear {{firstName}},</p><p>This is a friendly reminder that your interview for the {{jobTitle}} position is scheduled for tomorrow, {{interviewDate}} at {{interviewTime}}.</p><p><strong>Interview details:</strong></p><p>{{interviewDetails}}</p><p>Please let us know if you need to reschedule or have any questions.</p><p>Best regards,<br/>{{recruiterName}}<br/>{{companyName}}</p>',
    category: 'Interview Reminder',
    variables: ['firstName', 'jobTitle', 'interviewDate', 'interviewTime', 'interviewDetails', 'recruiterName', 'companyName'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: '4',
    name: 'Rejection Letter',
    subject: 'Regarding your application for {{jobTitle}}',
    body: '<p>Dear {{firstName}},</p><p>Thank you for your interest in the {{jobTitle}} position and for taking the time to go through our application process.</p><p>After careful consideration, we have decided to move forward with other candidates whose qualifications better meet our current needs.</p><p>We appreciate your interest in our company and wish you the best in your job search.</p><p>Best regards,<br/>The Recruitment Team<br/>{{companyName}}</p>',
    category: 'Rejection',
    variables: ['firstName', 'jobTitle', 'companyName'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: '5',
    name: 'Offer Letter',
    subject: 'Job Offer: {{jobTitle}} at {{companyName}}',
    body: '<p>Dear {{firstName}},</p><p>We are pleased to offer you the position of {{jobTitle}} at {{companyName}}. Based on your experience, skills, and performance during the interview process, we believe you would be a valuable addition to our team.</p><p><strong>Position Details:</strong></p><p>Title: {{jobTitle}}<br/>Department: {{department}}<br/>Start Date: {{startDate}}<br/>Salary: {{salary}}</p><p>Please review the attached formal offer letter for complete details about the position, benefits, and terms of employment.</p><p>To accept this offer, please sign the attached document and return it by {{responseDeadline}}.</p><p>We look forward to welcoming you to our team!</p><p>Best regards,<br/>{{hiringManagerName}}<br/>{{companyName}}</p>',
    category: 'Offer Letter',
    variables: ['firstName', 'jobTitle', 'companyName', 'department', 'startDate', 'salary', 'responseDeadline', 'hiringManagerName'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  }
];

// Mock data for scheduled communications
const mockScheduledCommunications: ScheduledCommunication[] = [
  {
    id: '1',
    templateId: '3', // Interview Reminder
    candidateId: '1',
    scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: 'Pending',
    channel: 'Email',
    data: {
      firstName: 'John',
      jobTitle: 'Senior Frontend Developer',
      interviewDate: new Date(Date.now() + 86400000).toLocaleDateString(),
      interviewTime: '10:00 AM',
      interviewDetails: 'Video call via Zoom. Link will be sent 30 minutes before the interview.',
      recruiterName: 'Jane Smith',
      companyName: 'Tech Innovations Inc.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    templateId: '3', // Interview Reminder
    candidateId: '2',
    scheduledDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    status: 'Pending',
    channel: 'Email',
    data: {
      firstName: 'Emily',
      jobTitle: 'UX Designer',
      interviewDate: new Date(Date.now() + 172800000).toLocaleDateString(),
      interviewTime: '2:00 PM',
      interviewDetails: 'In-person at our headquarters. Please bring a photo ID for check-in.',
      recruiterName: 'Jane Smith',
      companyName: 'Tech Innovations Inc.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock data for communication logs
const mockCommunicationLogs: CommunicationLog[] = [
  {
    id: '1',
    candidateId: '1',
    templateId: '1',
    subject: 'We received your application for Senior Frontend Developer',
    body: 'Thank you for applying to the Senior Frontend Developer position...',
    sentAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
    channel: 'Email',
    direction: 'Outbound',
    status: 'Delivered',
    metadata: {
      openedAt: new Date(Date.now() - 518400000).toISOString(),
      clickedAt: new Date(Date.now() - 518300000).toISOString()
    }
  },
  {
    id: '2',
    candidateId: '1',
    templateId: '2',
    subject: 'Interview Invitation for Senior Frontend Developer position',
    body: 'We were impressed with your application and would like to invite you for an interview...',
    sentAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    channel: 'Email',
    direction: 'Outbound',
    status: 'Opened',
    metadata: {
      openedAt: new Date(Date.now() - 345000000).toISOString()
    }
  },
  {
    id: '3',
    candidateId: '2',
    templateId: '1',
    subject: 'We received your application for UX Designer',
    body: 'Thank you for applying to the UX Designer position...',
    sentAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    channel: 'Email',
    direction: 'Outbound',
    status: 'Delivered',
    metadata: {}
  }
];

// Context interface
interface CommunicationContextType {
  emailTemplates: EmailTemplate[];
  scheduledCommunications: ScheduledCommunication[];
  communicationLogs: CommunicationLog[];
  
  // Email template methods
  getTemplateById: (id: string) => EmailTemplate | undefined;
  getTemplatesByCategory: (category: EmailTemplateCategory) => EmailTemplate[];
  createEmailTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => EmailTemplate;
  updateEmailTemplate: (id: string, template: Partial<EmailTemplate>) => EmailTemplate | undefined;
  deleteEmailTemplate: (id: string) => boolean;
  
  // Scheduled communication methods
  scheduleCommunication: (communication: Omit<ScheduledCommunication, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => ScheduledCommunication;
  cancelScheduledCommunication: (id: string) => boolean;
  getScheduledCommunicationsForCandidate: (candidateId: string) => ScheduledCommunication[];
  
  // Communication log methods
  getCommunicationLogsForCandidate: (candidateId: string) => CommunicationLog[];
  logCommunication: (log: Omit<CommunicationLog, 'id' | 'sentAt'>) => CommunicationLog;
  
  // Bulk operations
  sendBulkCommunication: (templateId: string, candidateIds: string[], data: Record<string, any>) => CommunicationLog[];
  
  // Message preview and sending
  previewMessage: (templateId: string, data: Record<string, any>) => { subject: string; body: string };
  sendMessage: (templateId: string, candidateId: string, data: Record<string, any>) => CommunicationLog;
  
  // Utility functions
  getTemplateVariables: (templateId: string) => string[];
  
  // SMS functionality
  sendSMS: (candidateId: string, message: string) => Promise<boolean>;
}

// Create the context
const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

// Provider component
export const CommunicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [scheduledCommunications, setScheduledCommunications] = useState<ScheduledCommunication[]>(mockScheduledCommunications);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(mockCommunicationLogs);
  
  const candidateContext = useCandidateContext();
  
  // Check scheduled communications regularly
  useEffect(() => {
    const checkScheduledCommunications = () => {
      const now = new Date();
      const updatedCommunications: ScheduledCommunication[] = [];
      const newLogs: CommunicationLog[] = [];
      
      scheduledCommunications.forEach(comm => {
        if (comm.status === 'Pending' && new Date(comm.scheduledDate) <= now) {
          // This communication is due to be sent
          const template = emailTemplates.find(t => t.id === comm.templateId);
          
          if (template) {
            // Create a new log entry
            const newLog: CommunicationLog = {
              id: uuidv4(),
              candidateId: comm.candidateId,
              templateId: comm.templateId,
              subject: processTemplate(template.subject, comm.data),
              body: processTemplate(template.body, comm.data),
              sentAt: now.toISOString(),
              channel: comm.channel === 'Both' ? 'Email' : comm.channel,
              direction: 'Outbound',
              status: 'Delivered',
              metadata: {}
            };
            
            newLogs.push(newLog);
            
            // Mark as sent
            updatedCommunications.push({
              ...comm,
              status: 'Sent',
              updatedAt: now.toISOString()
            });
            
            // If 'Both' was selected, create an SMS log as well
            if (comm.channel === 'Both') {
              newLogs.push({
                id: uuidv4(),
                candidateId: comm.candidateId,
                templateId: comm.templateId,
                subject: '',
                body: processTemplate(template.body, comm.data, true),
                sentAt: now.toISOString(),
                channel: 'SMS',
                direction: 'Outbound',
                status: 'Delivered',
                metadata: {}
              });
            }
          }
        } else {
          updatedCommunications.push(comm);
        }
      });
      
      // Update state with sent communications and new logs
      if (updatedCommunications.length !== scheduledCommunications.length) {
        setScheduledCommunications(updatedCommunications);
        setCommunicationLogs(prev => [...prev, ...newLogs]);
      }
    };
    
    // Run initially
    checkScheduledCommunications();
    
    // Set up interval (every minute)
    const intervalId = setInterval(checkScheduledCommunications, 60000);
    
    return () => clearInterval(intervalId);
  }, [scheduledCommunications, emailTemplates]);
  
  // Process template with data
  const processTemplate = (template: string, data: Record<string, any>, plainText = false): string => {
    let result = template;
    
    // Replace variables
    Object.entries(data).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    
    // Convert to plain text if needed (for SMS)
    if (plainText) {
      // Simple HTML to plain text conversion
      result = result
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]*>/g, '') // Remove all remaining HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    }
    
    return result;
  };
  
  // Email template methods
  const getTemplateById = (id: string): EmailTemplate | undefined => {
    return emailTemplates.find(template => template.id === id);
  };
  
  const getTemplatesByCategory = (category: EmailTemplateCategory): EmailTemplate[] => {
    return emailTemplates.filter(template => template.category === category);
  };
  
  const createEmailTemplate = (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): EmailTemplate => {
    const now = new Date().toISOString();
    const newTemplate: EmailTemplate = {
      ...template,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    setEmailTemplates(prev => [...prev, newTemplate]);
    announce(`Email template "${template.name}" created`);
    return newTemplate;
  };
  
  const updateEmailTemplate = (id: string, template: Partial<EmailTemplate>): EmailTemplate | undefined => {
    let updatedTemplate: EmailTemplate | undefined;
    
    setEmailTemplates(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          updatedTemplate = {
            ...t,
            ...template,
            updatedAt: new Date().toISOString()
          };
          return updatedTemplate;
        }
        return t;
      });
      return updated;
    });
    
    if (updatedTemplate) {
      announce(`Email template "${updatedTemplate.name}" updated`);
    }
    
    return updatedTemplate;
  };
  
  const deleteEmailTemplate = (id: string): boolean => {
    const templateToDelete = emailTemplates.find(t => t.id === id);
    
    if (!templateToDelete) {
      return false;
    }
    
    setEmailTemplates(prev => prev.filter(t => t.id !== id));
    announce(`Email template "${templateToDelete.name}" deleted`);
    return true;
  };
  
  // Scheduled communication methods
  const scheduleCommunication = (communication: Omit<ScheduledCommunication, 'id' | 'createdAt' | 'updatedAt' | 'status'>): ScheduledCommunication => {
    const now = new Date().toISOString();
    const newCommunication: ScheduledCommunication = {
      ...communication,
      id: uuidv4(),
      status: 'Pending',
      createdAt: now,
      updatedAt: now
    };
    
    setScheduledCommunications(prev => [...prev, newCommunication]);
    announce(`Communication scheduled for ${new Date(communication.scheduledDate).toLocaleDateString()}`);
    return newCommunication;
  };
  
  const cancelScheduledCommunication = (id: string): boolean => {
    const commToCancel = scheduledCommunications.find(c => c.id === id);
    
    if (!commToCancel || commToCancel.status !== 'Pending') {
      return false;
    }
    
    setScheduledCommunications(prev => 
      prev.map(c => c.id === id 
        ? { ...c, status: 'Cancelled', updatedAt: new Date().toISOString() } 
        : c
      )
    );
    
    announce('Scheduled communication cancelled');
    return true;
  };
  
  const getScheduledCommunicationsForCandidate = (candidateId: string): ScheduledCommunication[] => {
    return scheduledCommunications.filter(c => c.candidateId === candidateId);
  };
  
  // Communication log methods
  const getCommunicationLogsForCandidate = (candidateId: string): CommunicationLog[] => {
    return communicationLogs.filter(log => log.candidateId === candidateId);
  };
  
  const logCommunication = (log: Omit<CommunicationLog, 'id' | 'sentAt'>): CommunicationLog => {
    const newLog: CommunicationLog = {
      ...log,
      id: uuidv4(),
      sentAt: new Date().toISOString()
    };
    
    setCommunicationLogs(prev => [...prev, newLog]);
    return newLog;
  };
  
  // Bulk operations
  const sendBulkCommunication = (templateId: string, candidateIds: string[], data: Record<string, any>): CommunicationLog[] => {
    const template = emailTemplates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    const now = new Date().toISOString();
    const newLogs: CommunicationLog[] = candidateIds.map(candidateId => {
      // Get candidate-specific data
      const candidate = candidateContext?.candidates.find(c => c.id.toString() === candidateId);
      const candidateData = {
        firstName: candidate?.personalInfo.firstName || 'Candidate',
        lastName: candidate?.personalInfo.lastName || '',
        email: candidate?.personalInfo.email || '',
        ...data
      };
      
      return {
        id: uuidv4(),
        candidateId,
        templateId,
        subject: processTemplate(template.subject, candidateData),
        body: processTemplate(template.body, candidateData),
        sentAt: now,
        channel: 'Email',
        direction: 'Outbound',
        status: 'Delivered',
        metadata: {}
      };
    });
    
    setCommunicationLogs(prev => [...prev, ...newLogs]);
    announce(`Sent bulk communication to ${candidateIds.length} candidates`);
    return newLogs;
  };
  
  // Message preview and sending
  const previewMessage = (templateId: string, data: Record<string, any>): { subject: string; body: string } => {
    const template = emailTemplates.find(t => t.id === templateId);
    
    if (!template) {
      return { subject: '', body: '' };
    }
    
    return {
      subject: processTemplate(template.subject, data),
      body: processTemplate(template.body, data)
    };
  };
  
  const sendMessage = (templateId: string, candidateId: string, data: Record<string, any>): CommunicationLog => {
    const template = emailTemplates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    const { subject, body } = previewMessage(templateId, data);
    
    const newLog: CommunicationLog = {
      id: uuidv4(),
      candidateId,
      templateId,
      subject,
      body,
      sentAt: new Date().toISOString(),
      channel: 'Email',
      direction: 'Outbound',
      status: 'Delivered',
      metadata: {}
    };
    
    setCommunicationLogs(prev => [...prev, newLog]);
    announce('Message sent');
    return newLog;
  };
  
  // Utility functions
  const getTemplateVariables = (templateId: string): string[] => {
    const template = emailTemplates.find(t => t.id === templateId);
    return template?.variables || [];
  };
  
  // SMS functionality
  const sendSMS = async (candidateId: string, message: string): Promise<boolean> => {
    // Simulate sending SMS
    return new Promise(resolve => {
      setTimeout(() => {
        const newLog: CommunicationLog = {
          id: uuidv4(),
          candidateId,
          subject: '',
          body: message,
          sentAt: new Date().toISOString(),
          channel: 'SMS',
          direction: 'Outbound',
          status: 'Delivered',
          metadata: {}
        };
        
        setCommunicationLogs(prev => [...prev, newLog]);
        announce('SMS sent');
        resolve(true);
      }, 1000);
    });
  };
  
  const value = {
    emailTemplates,
    scheduledCommunications,
    communicationLogs,
    getTemplateById,
    getTemplatesByCategory,
    createEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
    scheduleCommunication,
    cancelScheduledCommunication,
    getScheduledCommunicationsForCandidate,
    getCommunicationLogsForCandidate,
    logCommunication,
    sendBulkCommunication,
    previewMessage,
    sendMessage,
    getTemplateVariables,
    sendSMS
  };

  return (
    <CommunicationContext.Provider value={value}>
      {children}
    </CommunicationContext.Provider>
  );
};

// Hook to use the communication context
export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
}; 