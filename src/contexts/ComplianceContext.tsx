import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { announce } from '../components/ScreenReaderAnnouncer';

// Data retention policies by data category
export const DATA_RETENTION_POLICIES = {
  CANDIDATE_RECORDS: {
    defaultPeriod: 365, // days
    description: 'Candidate applications and personal information',
    minPeriod: 90, // days (minimum required by some regulations)
    maxPeriod: 730, // days (maximum allowed by some regulations)
  },
  INTERVIEW_NOTES: {
    defaultPeriod: 180, // days
    description: 'Notes and evaluations from interviews',
    minPeriod: 90,
    maxPeriod: 365,
  },
  RESUME_DATA: {
    defaultPeriod: 365,
    description: 'Parsed resume information',
    minPeriod: 90,
    maxPeriod: 730,
  },
  COMMUNICATION_LOGS: {
    defaultPeriod: 180,
    description: 'Email and message communication logs',
    minPeriod: 60,
    maxPeriod: 365,
  },
  ASSESSMENT_RESULTS: {
    defaultPeriod: 365,
    description: 'Skills assessment and test results',
    minPeriod: 90,
    maxPeriod: 730,
  },
  REJECTION_RECORDS: {
    defaultPeriod: 365,
    description: 'Records of rejected applications',
    minPeriod: 180,
    maxPeriod: 1095, // 3 years for potential legal claims
  },
};

// Compliance regions and their requirements
export const COMPLIANCE_REGIONS = {
  EU: {
    name: 'European Union',
    dataProtectionLaw: 'GDPR',
    requiresConsent: true,
    requiresDataAccessRequest: true,
    requiresRightToErasure: true,
    requiresDataPortability: true,
    requiresBreachNotification: true,
    defaultDataRetentionPeriod: 365,
  },
  CALIFORNIA: {
    name: 'California',
    dataProtectionLaw: 'CCPA',
    requiresConsent: true,
    requiresDataAccessRequest: true,
    requiresRightToErasure: true,
    requiresDataPortability: true,
    requiresBreachNotification: true,
    defaultDataRetentionPeriod: 365,
  },
  CANADA: {
    name: 'Canada',
    dataProtectionLaw: 'PIPEDA',
    requiresConsent: true,
    requiresDataAccessRequest: true,
    requiresRightToErasure: true,
    requiresDataPortability: false,
    requiresBreachNotification: true,
    defaultDataRetentionPeriod: 365,
  },
  UK: {
    name: 'United Kingdom',
    dataProtectionLaw: 'UK-GDPR',
    requiresConsent: true,
    requiresDataAccessRequest: true,
    requiresRightToErasure: true,
    requiresDataPortability: true,
    requiresBreachNotification: true,
    defaultDataRetentionPeriod: 365,
  },
  BRAZIL: {
    name: 'Brazil',
    dataProtectionLaw: 'LGPD',
    requiresConsent: true,
    requiresDataAccessRequest: true,
    requiresRightToErasure: true,
    requiresDataPortability: true,
    requiresBreachNotification: true,
    defaultDataRetentionPeriod: 365,
  },
  GLOBAL: {
    name: 'Global',
    dataProtectionLaw: 'Multiple',
    requiresConsent: true,
    requiresDataAccessRequest: true,
    requiresRightToErasure: true,
    requiresDataPortability: true,
    requiresBreachNotification: true,
    defaultDataRetentionPeriod: 365,
  },
};

// Consent types for candidate data
export enum ConsentType {
  GENERAL_DATA_PROCESSING = 'general_data_processing',
  ASSESSMENT = 'assessment_processing',
  BACKGROUND_CHECK = 'background_check',
  THIRD_PARTY_SHARING = 'third_party_sharing',
  COMMUNICATION = 'communication',
  RETENTION = 'data_retention',
}

// Consent record interface
interface ConsentRecord {
  id: string;
  candidateId: number;
  consentType: ConsentType;
  consentGiven: boolean;
  timestamp: string;
  expiryDate?: string;
  ipAddress?: string;
  userAgent?: string;
  additionalNotes?: string;
}

// Data access/deletion request interface
interface DataRequest {
  id: string;
  requestType: 'access' | 'deletion' | 'correction' | 'portability';
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  requestDate: string;
  status: 'pending' | 'processing' | 'completed' | 'denied';
  completionDate?: string;
  requestNotes?: string;
  processingNotes?: string;
  verificationMethod?: string;
  handledBy?: string;
}

// EEO tracking data interface
interface EEORecord {
  id: string;
  jobId: number;
  demographicData: {
    gender?: string;
    race?: string;
    disability?: string;
    veteranStatus?: string;
  };
  applicationDate: string;
  anonymousId: string; // Used to track while keeping identity separate
}

// Compliance audit log entry
interface ComplianceAuditLog {
  id: string;
  eventType: string;
  timestamp: string;
  userId?: string;
  description: string;
  affectedData?: string;
  ipAddress?: string;
  userAgent?: string;
  relatedRecordId?: string;
}

// Context type definition
interface ComplianceContextType {
  // Current application settings
  currentRegion: keyof typeof COMPLIANCE_REGIONS;
  setCurrentRegion: (region: keyof typeof COMPLIANCE_REGIONS) => void;

  // Data retention
  getRetentionPeriod: (dataType: keyof typeof DATA_RETENTION_POLICIES) => number;
  setRetentionPeriod: (dataType: keyof typeof DATA_RETENTION_POLICIES, days: number) => void;
  checkDataRetention: (
    dataType: keyof typeof DATA_RETENTION_POLICIES,
    dateCreated: string
  ) => boolean;

  // Consent management
  consentRecords: ConsentRecord[];
  recordConsent: (
    candidateId: number,
    consentType: ConsentType,
    consentGiven: boolean,
    additionalNotes?: string
  ) => ConsentRecord;
  checkConsent: (candidateId: number, consentType: ConsentType) => boolean;
  withdrawConsent: (candidateId: number, consentType: ConsentType) => boolean;

  // Data subject requests
  dataRequests: DataRequest[];
  createDataRequest: (
    requestType: 'access' | 'deletion' | 'correction' | 'portability',
    candidateId: number,
    candidateName: string,
    candidateEmail: string,
    requestNotes?: string
  ) => DataRequest;
  updateDataRequestStatus: (
    requestId: string,
    status: 'pending' | 'processing' | 'completed' | 'denied',
    processingNotes?: string
  ) => DataRequest | null;
  getDataRequestById: (requestId: string) => DataRequest | null;
  getDataRequestsByCandidate: (candidateId: number) => DataRequest[];

  // EEO tracking
  eeoRecords: EEORecord[];
  recordEEOData: (jobId: number, demographicData: any) => EEORecord;
  getEEOStatsByJob: (jobId: number) => any;

  // Anonymization
  anonymizeCandidate: (candidateId: number) => boolean;
  createAnonymizedView: (candidateIds: number[]) => any[];

  // Geolocation compliance
  detectUserRegion: () => Promise<keyof typeof COMPLIANCE_REGIONS>;
  checkRegionRequirements: (region: keyof typeof COMPLIANCE_REGIONS) => any;

  // Audit logging
  auditLogs: ComplianceAuditLog[];
  addAuditLog: (eventType: string, description: string, metadata?: any) => ComplianceAuditLog;
  getAuditLogsByDateRange: (startDate: string, endDate: string) => ComplianceAuditLog[];
  getAuditLogsByType: (eventType: string) => ComplianceAuditLog[];

  // Compliance reporting
  generateComplianceReport: (startDate: string, endDate: string) => any;
}

// Create context
const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

// Mock data for retention periods - in a real app this would be in a database
const mockRetentionPeriods: Record<string, number> = {
  CANDIDATE_RECORDS: 365,
  INTERVIEW_NOTES: 180,
  RESUME_DATA: 365,
  COMMUNICATION_LOGS: 180,
  ASSESSMENT_RESULTS: 365,
  REJECTION_RECORDS: 365,
};

// Provider component
export const ComplianceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for current region
  const [currentRegion, setCurrentRegion] = useState<keyof typeof COMPLIANCE_REGIONS>('GLOBAL');

  // State for data retention periods
  const [retentionPeriods, setRetentionPeriods] =
    useState<Record<string, number>>(mockRetentionPeriods);

  // State for consent records
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);

  // State for data requests
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);

  // State for EEO records
  const [eeoRecords, setEEORecords] = useState<EEORecord[]>([]);

  // State for audit logs
  const [auditLogs, setAuditLogs] = useState<ComplianceAuditLog[]>([]);

  // Initialize region based on user's location
  useEffect(() => {
    const initRegion = async () => {
      try {
        const detectedRegion = await detectUserRegion();
        setCurrentRegion(detectedRegion);
      } catch (error) {
        console.warn('Could not detect user region:', error);
        // Default to global compliance for maximum safety
        setCurrentRegion('GLOBAL');
      }
    };

    initRegion();
  }, []);

  // Get retention period for a data type
  const getRetentionPeriod = (dataType: keyof typeof DATA_RETENTION_POLICIES): number => {
    return retentionPeriods[dataType] || DATA_RETENTION_POLICIES[dataType].defaultPeriod;
  };

  // Set retention period for a data type
  const setRetentionPeriod = (
    dataType: keyof typeof DATA_RETENTION_POLICIES,
    days: number
  ): void => {
    const policy = DATA_RETENTION_POLICIES[dataType];

    // Ensure days is within allowed range
    const validatedDays = Math.max(policy.minPeriod, Math.min(days, policy.maxPeriod));

    setRetentionPeriods((prev) => ({
      ...prev,
      [dataType]: validatedDays,
    }));

    // Log the change
    addAuditLog(
      'RETENTION_PERIOD_CHANGED',
      `Retention period for ${dataType} changed to ${validatedDays} days`,
      { dataType, previousValue: retentionPeriods[dataType], newValue: validatedDays }
    );
  };

  // Check if data should be retained based on creation date and retention policy
  const checkDataRetention = (
    dataType: keyof typeof DATA_RETENTION_POLICIES,
    dateCreated: string
  ): boolean => {
    const retentionPeriod = getRetentionPeriod(dataType);
    const creationDate = new Date(dateCreated);
    const retentionEndDate = new Date(creationDate);
    retentionEndDate.setDate(retentionEndDate.getDate() + retentionPeriod);

    return new Date() <= retentionEndDate;
  };

  // Record consent for a candidate
  const recordConsent = (
    candidateId: number,
    consentType: ConsentType,
    consentGiven: boolean,
    additionalNotes?: string
  ): ConsentRecord => {
    // Create new consent record
    const newRecord: ConsentRecord = {
      id: uuidv4(),
      candidateId,
      consentType,
      consentGiven,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1', // In a real app, this would be the actual IP
      userAgent: navigator.userAgent,
      additionalNotes,
    };

    // Update state
    setConsentRecords((prev) => [...prev, newRecord]);

    // Log the consent action
    addAuditLog(
      consentGiven ? 'CONSENT_GIVEN' : 'CONSENT_DENIED',
      `Candidate #${candidateId} ${consentGiven ? 'gave' : 'denied'} consent for ${consentType}`,
      { candidateId, consentType, consentGiven }
    );

    return newRecord;
  };

  // Check if a candidate has given consent for a specific purpose
  const checkConsent = (candidateId: number, consentType: ConsentType): boolean => {
    // Get the most recent consent record for this candidate and type
    const relevantRecords = consentRecords
      .filter((record) => record.candidateId === candidateId && record.consentType === consentType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Return the consent status from the most recent record, or false if no records exist
    return relevantRecords.length > 0 ? relevantRecords[0].consentGiven : false;
  };

  // Withdraw consent for a candidate
  const withdrawConsent = (candidateId: number, consentType: ConsentType): boolean => {
    // Record the withdrawal of consent
    recordConsent(candidateId, consentType, false, 'Consent withdrawn');

    // Log the withdrawal
    addAuditLog(
      'CONSENT_WITHDRAWN',
      `Candidate #${candidateId} withdrew consent for ${consentType}`,
      { candidateId, consentType }
    );

    return true;
  };

  // Create a new data request (access, deletion, etc.)
  const createDataRequest = (
    requestType: 'access' | 'deletion' | 'correction' | 'portability',
    candidateId: number,
    candidateName: string,
    candidateEmail: string,
    requestNotes?: string
  ): DataRequest => {
    // Create new request
    const newRequest: DataRequest = {
      id: uuidv4(),
      requestType,
      candidateId,
      candidateName,
      candidateEmail,
      requestDate: new Date().toISOString(),
      status: 'pending',
      requestNotes,
      verificationMethod: 'email', // Default verification method
    };

    // Update state
    setDataRequests((prev) => [...prev, newRequest]);

    // Log the request
    addAuditLog(
      `DATA_${requestType.toUpperCase()}_REQUESTED`,
      `Candidate #${candidateId} (${candidateName}) requested ${requestType} of their data`,
      { candidateId, requestType }
    );

    // Announce for accessibility
    announce(`Data ${requestType} request created for ${candidateName}`);

    return newRequest;
  };

  // Update the status of a data request
  const updateDataRequestStatus = (
    requestId: string,
    status: 'pending' | 'processing' | 'completed' | 'denied',
    processingNotes?: string
  ): DataRequest | null => {
    // Find the request
    const requestIndex = dataRequests.findIndex((req) => req.id === requestId);
    if (requestIndex === -1) return null;

    // Create updated request
    const updatedRequest: DataRequest = {
      ...dataRequests[requestIndex],
      status,
      processingNotes: processingNotes || dataRequests[requestIndex].processingNotes,
      ...(status === 'completed' || status === 'denied'
        ? { completionDate: new Date().toISOString() }
        : {}),
    };

    // Update state
    const newDataRequests = [...dataRequests];
    newDataRequests[requestIndex] = updatedRequest;
    setDataRequests(newDataRequests);

    // Log the update
    addAuditLog(
      `DATA_REQUEST_${status.toUpperCase()}`,
      `Data request #${requestId} for candidate #${updatedRequest.candidateId} changed to ${status}`,
      { requestId, candidateId: updatedRequest.candidateId, status }
    );

    return updatedRequest;
  };

  // Get a data request by ID
  const getDataRequestById = (requestId: string): DataRequest | null => {
    return dataRequests.find((req) => req.id === requestId) || null;
  };

  // Get all data requests for a candidate
  const getDataRequestsByCandidate = (candidateId: number): DataRequest[] => {
    return dataRequests.filter((req) => req.candidateId === candidateId);
  };

  // Record EEO data for job applications (anonymized)
  const recordEEOData = (jobId: number, demographicData: any): EEORecord => {
    const newRecord: EEORecord = {
      id: uuidv4(),
      jobId,
      demographicData,
      applicationDate: new Date().toISOString(),
      anonymousId: uuidv4(), // Generate an anonymous ID that can't be traced back to the candidate
    };

    // Update state
    setEEORecords((prev) => [...prev, newRecord]);

    // Log the recording (without PII)
    addAuditLog('EEO_DATA_RECORDED', `EEO data recorded for job #${jobId}`, { jobId });

    return newRecord;
  };

  // Get EEO statistics for a job
  const getEEOStatsByJob = (jobId: number): any => {
    // Filter records for the job
    const jobRecords = eeoRecords.filter((record) => record.jobId === jobId);

    // Calculate statistics
    const stats = {
      totalRecords: jobRecords.length,
      gender: {} as Record<string, number>,
      race: {} as Record<string, number>,
      disability: {} as Record<string, number>,
      veteranStatus: {} as Record<string, number>,
    };

    // Count demographics
    jobRecords.forEach((record) => {
      // Gender stats
      if (record.demographicData.gender) {
        stats.gender[record.demographicData.gender] =
          (stats.gender[record.demographicData.gender] || 0) + 1;
      }

      // Race stats
      if (record.demographicData.race) {
        stats.race[record.demographicData.race] =
          (stats.race[record.demographicData.race] || 0) + 1;
      }

      // Disability stats
      if (record.demographicData.disability) {
        stats.disability[record.demographicData.disability] =
          (stats.disability[record.demographicData.disability] || 0) + 1;
      }

      // Veteran status stats
      if (record.demographicData.veteranStatus) {
        stats.veteranStatus[record.demographicData.veteranStatus] =
          (stats.veteranStatus[record.demographicData.veteranStatus] || 0) + 1;
      }
    });

    return stats;
  };

  // Anonymize a candidate's data
  const anonymizeCandidate = (candidateId: number): boolean => {
    // In a real implementation, this would replace PII with anonymized data
    // while maintaining the structure for analytical purposes

    // Log the anonymization
    addAuditLog('CANDIDATE_ANONYMIZED', `Candidate #${candidateId} data was anonymized`, {
      candidateId,
    });

    return true;
  };

  // Create an anonymized view of candidates for reviewing
  const createAnonymizedView = (candidateIds: number[]): any[] => {
    // In a real implementation, this would return candidate data with PII removed
    // For this demo, we'll just return placeholder data
    return candidateIds.map((id) => ({
      anonymizedId: `ANON-${id}`,
      skills: ['JavaScript', 'React', 'Node.js'],
      experienceYears: 5,
      educationLevel: "Bachelor's Degree",
      qualifications: 'Qualified',
    }));
  };

  // Detect user's region based on IP address
  const detectUserRegion = async (): Promise<keyof typeof COMPLIANCE_REGIONS> => {
    // In a real implementation, this would call a geolocation service
    // For this demo, we'll just return a random region
    const regions = Object.keys(COMPLIANCE_REGIONS) as Array<keyof typeof COMPLIANCE_REGIONS>;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(regions[Math.floor(Math.random() * regions.length)]);
      }, 500);
    });
  };

  // Get compliance requirements for a region
  const checkRegionRequirements = (region: keyof typeof COMPLIANCE_REGIONS): any => {
    return COMPLIANCE_REGIONS[region];
  };

  // Add entry to compliance audit log
  const addAuditLog = (
    eventType: string,
    description: string,
    metadata?: any
  ): ComplianceAuditLog => {
    const newLog: ComplianceAuditLog = {
      id: uuidv4(),
      eventType,
      timestamp: new Date().toISOString(),
      description,
      ipAddress: '127.0.0.1', // In a real app, this would be the actual IP
      userAgent: navigator.userAgent,
      ...(metadata?.relatedRecordId ? { relatedRecordId: metadata.relatedRecordId } : {}),
      ...(metadata?.userId ? { userId: metadata.userId } : {}),
    };

    // Update state
    setAuditLogs((prev) => [...prev, newLog]);

    return newLog;
  };

  // Get audit logs within a date range
  const getAuditLogsByDateRange = (startDate: string, endDate: string): ComplianceAuditLog[] => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return auditLogs.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= start && logTime <= end;
    });
  };

  // Get audit logs by event type
  const getAuditLogsByType = (eventType: string): ComplianceAuditLog[] => {
    return auditLogs.filter((log) => log.eventType === eventType);
  };

  // Generate a compliance report
  const generateComplianceReport = (startDate: string, endDate: string): any => {
    // Get logs for the date range
    const logs = getAuditLogsByDateRange(startDate, endDate);

    // Count events by type
    const eventCounts: Record<string, number> = {};
    logs.forEach((log) => {
      eventCounts[log.eventType] = (eventCounts[log.eventType] || 0) + 1;
    });

    // Create the report
    return {
      reportId: uuidv4(),
      startDate,
      endDate,
      generatedAt: new Date().toISOString(),
      totalEvents: logs.length,
      eventBreakdown: eventCounts,
      consentStats: {
        totalConsentRecords: consentRecords.length,
        consentGiven: consentRecords.filter((r) => r.consentGiven).length,
        consentDenied: consentRecords.filter((r) => !r.consentGiven).length,
      },
      dataRequestStats: {
        totalRequests: dataRequests.length,
        byType: {
          access: dataRequests.filter((r) => r.requestType === 'access').length,
          deletion: dataRequests.filter((r) => r.requestType === 'deletion').length,
          correction: dataRequests.filter((r) => r.requestType === 'correction').length,
          portability: dataRequests.filter((r) => r.requestType === 'portability').length,
        },
        byStatus: {
          pending: dataRequests.filter((r) => r.status === 'pending').length,
          processing: dataRequests.filter((r) => r.status === 'processing').length,
          completed: dataRequests.filter((r) => r.status === 'completed').length,
          denied: dataRequests.filter((r) => r.status === 'denied').length,
        },
      },
      retentionPolicies: retentionPeriods,
    };
  };

  // Context value
  const value: ComplianceContextType = {
    currentRegion,
    setCurrentRegion,
    getRetentionPeriod,
    setRetentionPeriod,
    checkDataRetention,
    consentRecords,
    recordConsent,
    checkConsent,
    withdrawConsent,
    dataRequests,
    createDataRequest,
    updateDataRequestStatus,
    getDataRequestById,
    getDataRequestsByCandidate,
    eeoRecords,
    recordEEOData,
    getEEOStatsByJob,
    anonymizeCandidate,
    createAnonymizedView,
    detectUserRegion,
    checkRegionRequirements,
    auditLogs,
    addAuditLog,
    getAuditLogsByDateRange,
    getAuditLogsByType,
    generateComplianceReport,
  };

  return <ComplianceContext.Provider value={value}>{children}</ComplianceContext.Provider>;
};

// Custom hook for using the compliance context
export const useCompliance = (): ComplianceContextType => {
  const context = useContext(ComplianceContext);

  if (context === undefined) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }

  return context;
};
