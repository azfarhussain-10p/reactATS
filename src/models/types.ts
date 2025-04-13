// Candidate Profile Management Types

// Candidate source options
export type CandidateSource = 
  | 'Job Board' 
  | 'Referral' 
  | 'LinkedIn' 
  | 'Company Website' 
  | 'Recruitment Agency' 
  | 'Career Fair' 
  | 'Other Social Media'
  | 'Direct Application'
  | 'Other';

// Candidate status options
export type CandidateStatus = 
  | 'New' 
  | 'Screening' 
  | 'Interview' 
  | 'Assessment' 
  | 'Offer' 
  | 'Hired' 
  | 'Rejected'
  | 'Withdrawn'
  | 'On Hold';

// Pipeline stage type for kanban board
export type PipelineStage = 
  | 'Applied'
  | 'Screening'
  | 'First Interview'
  | 'Technical Assessment'
  | 'Team Interview'
  | 'Final Interview'
  | 'Reference Check'
  | 'Offer'
  | 'Hired'
  | 'Rejected'
  | 'Withdrawn';

// Collaborative Tools Types

// User role types for collaborative features
export type UserRole = {
  id: string;
  name: string;
  permissions: string[];
};

// Collaborative note type
export type CollaborativeNote = {
  id: string;
  candidateId: string;
  content: string;
  createdBy: string; // TeamMember id
  createdAt: string;
  updatedAt: string;
  mentions: string[]; // Array of TeamMember ids
  isPrivate: boolean;
  visibility?: string[]; // Array of TeamMember ids who can see this note
};

// Message type for in-app messaging
export type Message = {
  id: string;
  conversationId: string;
  content: string;
  sender: string; // TeamMember id
  timestamp: string;
  isRead: boolean;
  mentions: string[]; // Array of TeamMember ids
  attachments?: string[]; // Array of attachment urls or ids
};

// Team member for collaborative features
export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
};

// Notification preferences
export interface NotificationPreference {
  type: 'mention' | 'message' | 'task' | 'note' | 'candidate_update' | 'interview_feedback' | 'decision';
  channel: 'email' | 'in_app' | 'both' | 'none';
}

// Task type for task assignment
export type Task = {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // TeamMember id
  assignedBy: string; // TeamMember id
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  candidateId?: string; // Optional reference to a candidate
};

// Hiring decision vote
export type DecisionVote = {
  id: string;
  candidateId: string;
  voterId: string; // TeamMember id
  decision: 'hire' | 'reject' | 'consider' | 'need-more-info';
  reasoning: string;
  timestamp: string;
  isAnonymous: boolean;
};

// Shared document for collaboration
export type SharedDocument = {
  id: string;
  title: string;
  url: string;
  type: 'resume' | 'cover-letter' | 'portfolio' | 'reference' | 'offer' | 'other';
  uploadedBy: string; // TeamMember id
  uploadedAt: string;
  lastModified: string;
  candidateId: string;
  permissions: {
    canView: string[]; // Array of TeamMember ids
    canEdit: string[]; // Array of TeamMember ids
  };
  version: number;
  previousVersions?: string[]; // Array of document version ids
};

// Structured Interview Kit Types
export interface QuestionCategory {
  id: string;
  name: string;
  description: string;
}

export interface DifficultyLevel {
  id: string;
  name: string;
  description: string;
}

export interface ScoringCriteria {
  id: string;
  name: string;
  description: string;
}

export interface RubricItem {
  id: string;
  criteriaId: string;
  score: number;
  description: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  expectedAnswer: string;
  categoryId: string;
  difficultyLevelId: string;
  rubricItems: string[]; // IDs of associated rubric items
  timeGuidelineMinutes: number;
  followUpQuestions?: string[];
}

export interface KitQuestion {
  id: string;
  questionId: string;
  order: number;
  isRequired: boolean;
}

export interface InterviewKit {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  difficultyLevelId: string;
  questions: KitQuestion[];
  totalTimeMinutes: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewStage {
  id: string;
  name: string;
  description: string;
  order: number;
  durationMinutes: number;
  kitId: string | null; // ID of associated interview kit, if any
  isOptional: boolean;
}

export interface InterviewScheduleTemplate {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  stages: InterviewStage[];
  totalDurationMinutes: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewScorecard {
  id: string;
  candidateId: string;
  interviewerId: string;
  kitId: string;
  date: string;
  questionScores: {
    questionId: string;
    score: number;
    notes: string;
  }[];
  overallScore: number;
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
  strengths: string;
  weaknesses: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Recruitment pipeline for job positions
export interface RecruitmentPipeline {
  id: string;
  name: string;
  jobId?: number;
  stages: {
    id: PipelineStage;
    name: string;
    order: number;
    daysToComplete?: number;
    requiredTasks: string[];
    autoProgressionEnabled?: boolean;
  }[];
  defaultPipeline: boolean;
}

// Evaluation form type
export interface EvaluationForm {
  id: string;
  name: string;
  jobId?: number;
  isDefault: boolean;
  sections: {
    id: string;
    title: string;
    description?: string;
    weight: number;
    criteria: {
      id: string;
      name: string;
      description?: string;
      type: 'rating' | 'text' | 'boolean' | 'select';
      options?: string[];
      required: boolean;
      weight: number;
    }[];
  }[];
}

// Evaluation response
export interface EvaluationResponse {
  id: string;
  formId: string;
  candidateId: number;
  interviewerId: string;
  interviewDate: string;
  submissionDate: string;
  responses: {
    criteriaId: string;
    value: number | string | boolean;
  }[];
  scores: {
    sectionId: string;
    score: number;
  }[];
  overallScore: number;
  recommendation: 'Strong Hire' | 'Hire' | 'Neutral' | 'Reject' | 'Strong Reject';
  strengths: string;
  improvements: string;
  notes: string;
  isComplete: boolean;
  reminderSent: boolean;
}

// Education level options
export type EducationLevel = 
  | 'High School' 
  | 'Associate Degree' 
  | 'Bachelor\'s Degree' 
  | 'Master\'s Degree' 
  | 'Doctorate' 
  | 'Professional Certification'
  | 'Other';

// Education history entry
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  level: EducationLevel;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  gpa?: string;
}

// Experience history entry
export interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

// Skill with proficiency level
export interface Skill {
  id: string;
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience?: number;
  endorsed: boolean;
}

// Document type (resume, cover letter, etc.)
export interface Document {
  id: string;
  name: string;
  type: 'Resume' | 'Cover Letter' | 'Portfolio' | 'Certification' | 'Reference' | 'Other';
  fileUrl: string;
  uploadDate: string;
  notes?: string;
}

// Communication record
export interface Communication {
  id: string;
  date: string;
  type: 'Email' | 'Phone' | 'Interview' | 'Note' | 'Other';
  subject: string;
  content: string;
  sender: string;
  recipient?: string;
}

// Job application
export interface JobApplication {
  id: string;
  jobId: number;
  jobTitle: string;
  applicationDate: string;
  status: CandidateStatus;
  stage: PipelineStage;
  pipelineId?: string;
  stageHistory: {
    stage: PipelineStage;
    enteredAt: string;
    exitedAt?: string;
    daysInStage?: number;
    completedTasks: string[];
    notes?: string;
  }[];
  notes?: string;
  interviewScheduled?: boolean;
  interviews?: {
    id: string;
    date: string;
    interviewType: string;
    interviewers: string[];
    feedback?: string;
    rating?: number;
  }[];
  flagged?: boolean;
  flagReason?: string;
}

// Complete candidate profile
export interface Candidate {
  id: number;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    profileImage?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    willingToRelocate?: boolean;
    visaStatus?: string;
  };
  professionalInfo: {
    title: string;
    summary: string;
    totalYearsOfExperience: number;
    currentEmployer?: string;
    currentSalary?: string;
    expectedSalary?: string;
    noticePeriod?: string;
    skills: Skill[];
    tags: string[];
  };
  education: Education[];
  experience: Experience[];
  documents: Document[];
  source: CandidateSource;
  sourceDetails?: string;
  status: CandidateStatus;
  communications: Communication[];
  jobApplications: JobApplication[];
  notes: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

// Job Posting Integration Types
export type JobPlatform = 
  | 'Indeed' 
  | 'LinkedIn' 
  | 'Glassdoor' 
  | 'ZipRecruiter' 
  | 'Monster'
  | 'CareerBuilder'
  | 'Facebook'
  | 'Twitter'
  | 'CompanyWebsite'
  | 'Other';

export interface JobPostingMetrics {
  id: string;
  jobId: number;
  platform: JobPlatform;
  views: number;
  clicks: number;
  applications: number;
  conversionRate: number;
  costPerClick?: number;
  costPerApplication?: number;
  postingDate: string;
  expirationDate: string;
  isActive: boolean;
  customUrl: string;
  lastUpdated: string;
}

export interface ExternalJobPosting {
  id: string;
  jobId: number;
  platform: JobPlatform;
  externalId?: string;
  title: string;
  status: 'Draft' | 'Published' | 'Expired' | 'Paused';
  autoRepost: boolean;
  repostThreshold: number; // days before auto-reposting
  lastPostedDate: string;
  platformSpecificData?: Record<string, any>;
  metrics: JobPostingMetrics;
  errors?: string[];
}

// Resume Parsing and Screening Types
export interface ParsedResume {
  id: string;
  candidateId?: number;
  rawText: string;
  parsedData: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    skills: string[];
    experience: {
      company: string;
      title: string;
      duration: string;
      startDate?: string;
      endDate?: string;
      description: string;
    }[];
    education: {
      institution: string;
      degree: string;
      field: string;
      graduationDate?: string;
    }[];
    certifications: string[];
    languages: string[];
    websites: string[];
  };
  uploadDate: string;
  status: 'Pending' | 'Processed' | 'Error';
  confidence: number;
}

export interface ScreeningResult {
  id: string;
  candidateId: number;
  jobId: number;
  parsedResumeId: string;
  overallScore: number;
  skillMatch: {
    score: number;
    requiredSkillsFound: string[];
    requiredSkillsMissing: string[];
    preferredSkillsFound: string[];
  };
  experienceMatch: {
    score: number;
    yearsOfRelevantExperience: number;
    relevantCompanies: string[];
    relevantRoles: string[];
  };
  educationMatch: {
    score: number;
    requiredEducationMet: boolean;
    relevantDegrees: string[];
    relevantFields: string[];
  };
  employmentGaps: {
    hasGaps: boolean;
    gapPeriods: string[];
    totalGapMonths: number;
  };
  keywordMatch: {
    score: number;
    keywordsFound: Record<string, number>; // keyword and count
  };
  screened: boolean;
  qualified: boolean;
  disqualificationReasons?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScreeningQuestionnaire {
  id: string;
  jobId: number;
  title: string;
  questions: {
    id: string;
    text: string;
    type: 'MultipleChoice' | 'YesNo' | 'Text' | 'Range';
    options?: string[];
    isRequired: boolean;
    isDisqualifying: boolean;
    correctAnswer?: string | boolean | number;
  }[];
  passingScore: number;
  isActive: boolean;
}

export interface QuestionnaireResponse {
  id: string;
  candidateId: number;
  questionnaireId: string;
  jobId: number;
  answers: {
    questionId: string;
    answer: string | boolean | number;
  }[];
  score: number;
  passed: boolean;
  submittedAt: string;
}

// Email Campaign Automation Types
export type EmailTrigger = 
  | 'ApplicationReceived'
  | 'StageChange'
  | 'SpecificStage'
  | 'DaysInStage'
  | 'InterviewScheduled'
  | 'InterviewCompleted'
  | 'FeedbackReceived'
  | 'OfferExtended'
  | 'Manual'
  | 'Custom';

export type EmailTemplateType =
  | 'ApplicationConfirmation'
  | 'InterviewInvitation'
  | 'InterviewReminder'
  | 'InterviewFollowUp'
  | 'OfferLetter'
  | 'RejectionLetter'
  | 'OnboardingInstructions'
  | 'Custom';

export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
  variables: string[]; // Available template variables like {{candidateName}}, {{jobTitle}}, etc.
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  jobId?: number; // If campaign is tied to a specific job
  active: boolean;
  steps: EmailCampaignStep[];
  createdAt: string;
  updatedAt: string;
  stats: {
    totalSent: number;
    opens: number;
    clicks: number;
    responses: number;
  };
}

export interface EmailCampaignStep {
  id: string;
  campaignId: string;
  order: number;
  trigger: EmailTrigger;
  triggerSpecifics?: {
    stage?: PipelineStage;
    daysInStage?: number;
    delayDays?: number; // days to wait after trigger before sending
  };
  templateId: string;
  active: boolean;
  personalized: boolean; // Whether this email is personalized for each candidate
  condition?: { // Optional condition to filter which candidates receive this email
    status?: CandidateStatus[];
    stage?: PipelineStage[];
    tags?: string[];
    scoreAbove?: number;
    custom?: string; // Custom condition logic
  };
}

export interface EmailLog {
  id: string;
  campaignId?: string;
  stepId?: string;
  templateId: string;
  candidateId: number;
  jobId?: number;
  subject: string;
  body: string;
  sentAt: string;
  status: 'Queued' | 'Sent' | 'Failed' | 'Opened' | 'Clicked' | 'Responded' | 'Bounced';
  openedAt?: string;
  clickedAt?: string;
  respondedAt?: string;
  errorMessage?: string;
}

// Customizable Application Forms
export type FormFieldType = 
  | 'ShortText'
  | 'LongText'
  | 'Email'
  | 'Phone'
  | 'Number'
  | 'Date'
  | 'SingleSelect'
  | 'MultiSelect'
  | 'Checkbox'
  | 'RadioGroup'
  | 'FileUpload'
  | 'Address'
  | 'Name'
  | 'Rating'
  | 'Heading'
  | 'Divider';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  order: number;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
    acceptedFileTypes?: string[];
    maxFileSize?: number;
  };
  isInternal?: boolean; // Fields only visible to recruiters, not candidates
  width?: 'full' | 'half' | 'third';
  conditionId?: string; // Reference to a condition that determines if this field is shown
}

export interface FormCondition {
  id: string;
  fieldId: string; // Field that triggers this condition
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isAnyOf';
  value: any; // Value to compare against
  values?: any[]; // For isAnyOf operator
}

// First FormPage interface for CustomApplicationForm
export interface ApplicationFormPage {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FormField[];
}

export interface CustomApplicationForm {
  id: string;
  name: string;
  description?: string;
  jobId?: number; // Optional link to a specific job
  isDefault: boolean;
  pages: ApplicationFormPage[];
  conditions: FormCondition[];
  settings: {
    saveProgress: boolean;
    autoSaveInterval?: number;
    confirmationMessage: string;
    redirectUrl?: string;
    allowFileAttachments: boolean;
    maxAttachmentSize?: number;
    branding?: {
      primaryColor?: string;
      logo?: string;
      fontFamily?: string;
    };
    storeSubmissions?: boolean;
    notifyOnSubmission?: boolean;
    notificationEmails?: string;
    defaultSubmissionStatus?: string;
  };
  submissions?: FormSubmission[];
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  candidateId?: number; // May be null if candidate doesn't exist yet
  jobId?: number;
  values: Record<string, any>; // Field ID to value mapping
  attachments?: {
    id: string;
    fieldId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }[];
  partiallyCompleted: boolean;
  lastUpdated: string;
  submittedAt?: string;
  ipAddress?: string;
  browserInfo?: string;
}

export interface SMSTemplate {
  id: string;
  name: string;
  body: string;
  variables: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SMSLog {
  id: string;
  templateId?: string;
  candidateId: number;
  phone: string;
  body: string;
  sentAt: string;
  status: 'Queued' | 'Sent' | 'Failed' | 'Delivered';
  deliveredAt?: string;
  errorMessage?: string;
}

// Email Template Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: EmailTemplateCategory;
  variables: string[];
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

export type EmailTemplateCategory = 
  | 'Application Confirmation' 
  | 'Interview Invitation' 
  | 'Interview Confirmation'
  | 'Interview Reminder'
  | 'Interview Follow-up'
  | 'Offer Letter'
  | 'Rejection'
  | 'General Update'
  | 'Request for Information'
  | 'Welcome Onboard'
  | 'Custom';

export interface ScheduledCommunication {
  id: string;
  templateId: string;
  candidateId: string;
  scheduledDate: string;
  status: 'Pending' | 'Sent' | 'Failed' | 'Cancelled';
  channel: 'Email' | 'SMS' | 'Both';
  data: Record<string, any>; // Data to populate template variables
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLog {
  id: string;
  candidateId: string;
  templateId?: string;
  subject: string;
  body: string;
  sentAt: string;
  channel: 'Email' | 'SMS';
  direction: 'Outbound' | 'Inbound';
  status: 'Delivered' | 'Opened' | 'Clicked' | 'Failed' | 'Bounced';
  failureReason?: string;
  metadata: Record<string, any>;
}

export interface CommunicationPreferences {
  candidateId: string;
  preferredChannel: 'Email' | 'SMS' | 'Both';
  emailOptIn: boolean;
  smsOptIn: boolean;
  frequency: 'Immediate' | 'Daily Digest' | 'Weekly Digest';
  unsubscribed: boolean;
  unsubscribedAt?: string;
}

// Custom Application Form Types
export interface CustomForm {
  id: string;
  name: string;
  description: string;
  jobId?: string; // If associated with a specific job
  isDefault: boolean;
  pages: FormPage[];
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
  status: 'Draft' | 'Active' | 'Archived';
}

// FormPage for CustomForm
export interface FormPage {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: CustomFormField[];
  conditionalDisplay?: ConditionalRule;
}

export interface CustomFormField {
  id: string;
  type: CustomFormFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  order: number;
  options?: CustomFormFieldOption[];
  validation?: CustomValidationRule[];
  conditionalDisplay?: ConditionalRule;
  settings: CustomFormFieldSettings;
}

export type CustomFormFieldType = 
  | 'ShortText' 
  | 'LongText' 
  | 'SingleSelect' 
  | 'MultiSelect'
  | 'Checkbox' 
  | 'RadioGroup' 
  | 'Date' 
  | 'Time' 
  | 'DateTime'
  | 'FileUpload' 
  | 'Address' 
  | 'Phone' 
  | 'Email'
  | 'Number' 
  | 'URL' 
  | 'Rating' 
  | 'Heading'
  | 'Paragraph' 
  | 'Divider';

export interface CustomFormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface CustomValidationRule {
  type: 'Required' | 'Email' | 'Phone' | 'URL' | 'MinLength' | 'MaxLength' | 'Pattern' | 'Custom';
  value?: string | number;
  message: string;
}

export interface ConditionalRule {
  logicOperator: 'AND' | 'OR';
  conditions: Condition[];
}

export interface Condition {
  fieldId: string;
  operator: 'Equals' | 'NotEquals' | 'Contains' | 'NotContains' | 'GreaterThan' | 'LessThan' | 'IsEmpty' | 'IsNotEmpty';
  value?: string | number | boolean;
}

export interface CustomFormFieldSettings {
  width: 'Full' | 'Half' | 'Third';
  minLength?: number;
  maxLength?: number;
  multiple?: boolean; // For file uploads
  allowedFileTypes?: string[]; // For file uploads
  maxFileSize?: number; // In MB
  rows?: number; // For text areas
  autofill?: string; // Autofill hint for browsers
  mask?: string; // For formatting input
}

export interface FormSettings {
  allowSave: boolean;
  redirectUrl?: string;
  submitButtonText: string;
  showProgressBar: boolean;
  enableAnalytics: boolean;
  captchaEnabled: boolean;
  formExpiry?: string;
  thankYouMessage: string;
  customCss?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  candidateId?: string;
  jobId?: string;
  data: Record<string, any>;
  status: 'Complete' | 'Incomplete' | 'In Progress';
  startedAt: string;
  completedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  meta: {
    timeToComplete?: number; // In seconds
    pageTimings?: Record<string, number>;
    source?: string;
    utm?: Record<string, string>;
  }
}

// CRM Functionality

export type TalentPoolCategory = 
  | 'Active Candidate'
  | 'Passive Candidate'
  | 'Former Employee'
  | 'Referral'
  | 'Previous Applicant'
  | 'Event Attendee'
  | 'Silver Medalist'
  | 'Custom';

export type EngagementLevel =
  | 'Cold'
  | 'Warm'
  | 'Hot'
  | 'Very Hot'
  | 'Not Interested';

export interface TalentPool {
  id: string;
  name: string;
  description: string;
  category: TalentPoolCategory;
  tags: string[];
  filters: TalentPoolFilter[];
  candidateIds: string[];
  campaignIds: string[];
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  color?: string;
}

export interface TalentPoolFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'in' | 'notIn';
  value: any;
  values?: any[];
}

export interface CandidateRelationship {
  id: string;
  candidateId: string;
  talentPoolIds: string[];
  contactHistory: ContactHistoryItem[];
  touchPoints: TouchPoint[];
  engagementLevel: EngagementLevel;
  engagementScore: number;
  lastContact: string;
  nextContactDate?: string;
  notes: string;
  responseRate: number;
  preferredContactMethod: 'Email' | 'Phone' | 'LinkedIn' | 'SMS';
  preferredContactTime?: 'Morning' | 'Afternoon' | 'Evening';
  leadSource: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactHistoryItem {
  id: string;
  date: string;
  type: 'Email' | 'Phone' | 'Meeting' | 'LinkedIn' | 'Event' | 'SMS' | 'Other';
  direction: 'Outbound' | 'Inbound';
  subject: string;
  notes: string;
  outcome: 'Positive' | 'Neutral' | 'Negative' | 'No Response';
  response?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  createdBy: string;
}

export interface TouchPoint {
  id: string;
  type: 'Birthday' | 'Work Anniversary' | 'Industry Event' | 'Company News' | 'Personal Achievement' | 'Custom';
  date: string;
  title: string;
  description: string;
  status: 'Pending' | 'Completed' | 'Skipped';
  notes?: string;
}

export interface NurtureCampaign {
  id: string;
  name: string;
  description: string;
  talentPoolIds: string[];
  steps: NurtureStep[];
  active: boolean;
  stats: {
    totalCandidates: number;
    engagement: number;
    responses: number;
    conversions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NurtureStep {
  id: string;
  campaignId: string;
  order: number;
  type: 'Email' | 'SMS' | 'LinkedIn' | 'Phone' | 'Custom';
  templateId?: string;
  content?: string;
  subject?: string;
  delayDays: number;
  condition?: {
    previousStepOutcome?: 'Responded' | 'Clicked' | 'Opened' | 'None';
    engagementLevel?: EngagementLevel[];
    custom?: string;
  };
  active: boolean;
}

export interface RecruitmentEvent {
  id: string;
  name: string;
  type: 'Career Fair' | 'Networking' | 'Conference' | 'Workshop' | 'Webinar' | 'Open House' | 'Custom';
  startDate: string;
  endDate: string;
  location: string;
  virtual: boolean;
  virtualLink?: string;
  description: string;
  budget?: number;
  expectedAttendees?: number;
  actualAttendees?: number;
  registrations: EventRegistration[];
  team: string[];
  status: 'Planned' | 'Active' | 'Completed' | 'Cancelled';
  materials: EventMaterial[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  candidateId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  registrationDate: string;
  attended: boolean;
  notes?: string;
  resumeUploaded?: boolean;
  resumeUrl?: string;
  talentPoolAssigned?: string;
  campaignAssigned?: string;
  followUpStatus?: 'Pending' | 'Contacted' | 'Responded' | 'Not Interested';
}

export interface EventMaterial {
  id: string;
  eventId: string;
  name: string;
  type: 'Handout' | 'Presentation' | 'Banner' | 'Swag' | 'Other';
  url?: string;
  quantity?: number;
  cost?: number;
  notes?: string;
}

export interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  active: boolean;
  rewards: {
    initialSubmission?: number;
    interview?: number;
    hire?: number;
    retention30Days?: number;
    retention90Days?: number;
    customMilestones?: Record<string, number>;
  };
  jobIds?: string[]; // Specific jobs or all if empty
  eligibility: {
    allEmployees: boolean;
    departments?: string[];
    locations?: string[];
    minimumTenure?: number; // in months
  };
  createdAt: string;
  updatedAt: string;
}

export interface Referral {
  id: string;
  programId: string;
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  referrerDepartment?: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeUrl?: string;
  jobId?: string;
  jobTitle?: string;
  status: 'Submitted' | 'Reviewing' | 'Contacting' | 'Interviewing' | 'Hired' | 'Rejected' | 'Withdrawn';
  notes: string;
  submissionDate: string;
  hireDate?: string;
  rewardsIssued: {
    milestone: string;
    amount: number;
    issueDate: string;
  }[];
  updatedAt: string;
}

export interface AlumniNetwork {
  id: string;
  name: string;
  description: string;
  members: AlumniMember[];
  events: string[]; // Event IDs
  campaigns: string[]; // Campaign IDs
  createdAt: string;
  updatedAt: string;
}

export interface AlumniMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedIn?: string;
  formerDepartment: string;
  formerPosition: string;
  startDate: string;
  endDate: string;
  currentCompany?: string;
  currentPosition?: string;
  rehireEligible: boolean;
  reasonForLeaving?: string;
  exitInterviewNotes?: string;
  willingness: 'High' | 'Medium' | 'Low' | 'Unknown';
  engagementLevel: EngagementLevel;
  referrals: string[]; // Referral IDs
  notes: string;
  contactHistory: ContactHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ExternalCRMIntegration {
  id: string;
  provider: 'Salesforce' | 'HubSpot' | 'Zoho' | 'Microsoft Dynamics' | 'Custom';
  name: string;
  apiKey?: string;
  webhook?: string;
  mappings: {
    atsField: string;
    crmField: string;
    direction: 'ATS to CRM' | 'CRM to ATS' | 'Bidirectional';
  }[];
  syncSchedule: 'RealTime' | 'Hourly' | 'Daily' | 'Weekly' | 'Manual';
  lastSyncedAt?: string;
  status: 'Active' | 'Paused' | 'Error' | 'Setup';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// Advanced Analytics and Reporting

export type MetricPeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' | 'Custom';

export type TimeMetric = 'TimeToFill' | 'TimeToHire' | 'TimeInStage' | 'TimeToOffer' | 'TimeToAccept';

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  role: 'Admin' | 'Recruiter' | 'Hiring Manager' | 'Executive' | 'Custom';
  isDefault: boolean;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  sharedWith: string[];
}

export interface DashboardWidget {
  id: string;
  dashboardId: string;
  type: 'Chart' | 'KPI' | 'Table' | 'Pipeline' | 'Timeline' | 'Map' | 'Custom';
  title: string;
  metrics: string[];
  dimensions: string[];
  filters: AnalyticsFilter[];
  settings: {
    chartType?: 'Bar' | 'Line' | 'Pie' | 'Area' | 'Scatter' | 'Funnel';
    period?: MetricPeriod;
    dateRange?: {
      start: string;
      end?: string;
    };
    comparison?: boolean;
    comparisonPeriod?: MetricPeriod;
    target?: number;
    colorScheme?: string[];
    size: 'Small' | 'Medium' | 'Large';
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  refreshRate?: number; // minutes
  lastRefreshed?: string;
}

export interface AnalyticsFilter {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'in' | 'between';
  value?: any;
  values?: any[];
}

export interface TimeMetricData {
  id: string;
  metric: TimeMetric;
  jobId?: string;
  departmentId?: string;
  recruiterId?: string;
  hiringManagerId?: string;
  locationId?: string;
  value: number; // days
  startDate: string;
  endDate?: string;
  breakdown?: {
    stage: string;
    days: number;
  }[];
  createdAt: string;
}

export interface SourceEffectiveness {
  id: string;
  source: CandidateSource;
  jobId?: string;
  departmentId?: string;
  period: string; // YYYY-MM for monthly
  metrics: {
    applicants: number;
    qualifiedCandidates: number;
    interviews: number;
    offers: number;
    hires: number;
    conversionRate: number;
    costPerApplicant?: number;
    costPerHire?: number;
    timeToHire?: number;
    qualityOfHire?: number;
  };
  createdAt: string;
}

export interface CostData {
  id: string;
  jobId?: string;
  departmentId?: string;
  locationId?: string;
  period: string; // YYYY-MM for monthly
  costs: {
    jobBoards: number;
    agency: number;
    referralBonuses: number;
    events: number;
    advertising: number;
    assessment: number;
    relocation: number;
    other: number;
  };
  metrics: {
    costPerApplicant: number;
    costPerQualifiedCandidate: number;
    costPerInterview: number;
    costPerOffer: number;
    costPerHire: number;
  };
  createdAt: string;
}

export interface DiversityMetric {
  id: string;
  jobId?: string;
  departmentId?: string;
  locationId?: string;
  period: string; // YYYY-MM for monthly
  stage: 'Applied' | 'Screened' | 'Interviewed' | 'Offered' | 'Hired' | 'All';
  demographics: {
    gender?: Record<string, number>;
    ethnicity?: Record<string, number>;
    age?: Record<string, number>;
    disability?: Record<string, number>;
    veteran?: Record<string, number>;
    other?: Record<string, number>;
  };
  ratios: {
    genderRatio?: number;
    ethnicityRatio?: number;
    ageRatio?: number;
    disabilityRatio?: number;
    veteranRatio?: number;
  };
  goals: {
    gender?: Record<string, number>;
    ethnicity?: Record<string, number>;
    age?: Record<string, number>;
    disability?: Record<string, number>;
    veteran?: Record<string, number>;
  };
  createdAt: string;
}

export interface RecruiterPerformance {
  id: string;
  recruiterId: string;
  recruiterName: string;
  period: string; // YYYY-MM for monthly
  metrics: {
    openRequisitions: number;
    newRequisitions: number;
    closedRequisitions: number;
    timeToFill: number;
    timeToHire: number;
    candidatesSourced: number;
    candidatesScreened: number;
    interviewsScheduled: number;
    offersExtended: number;
    offersAccepted: number;
    offerAcceptanceRate: number;
    hires: number;
    fallOffs: number;
    fallOffRate: number;
  };
  workload: {
    activeCandidates: number;
    averageCandidatesPerReq: number;
    overdueTasks: number;
    responseTime: number; // hours
  };
  createdAt: string;
}

export interface PipelineVelocity {
  id: string;
  jobId?: string;
  departmentId?: string;
  recruiterId?: string;
  period: string; // YYYY-MM for monthly
  overallVelocity: number; // days from application to hire
  stageVelocity: {
    stage: string;
    averageDays: number;
    minimumDays: number;
    maximumDays: number;
    candidateVolume: number;
    bottleneck: boolean;
  }[];
  dropOffRates: {
    stage: string;
    dropOffRate: number;
    previousPeriodChange: number;
  }[];
  createdAt: string;
}

export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  metrics: string[];
  dimensions: string[];
  filters: AnalyticsFilter[];
  sortBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  dateRange?: {
    start: string;
    end?: string;
    compare?: boolean;
    comparePeriod?: string;
  };
  visualization?: {
    type: 'Table' | 'Chart';
    chartType?: 'Bar' | 'Line' | 'Pie' | 'Area' | 'Scatter';
    colorScheme?: string[];
  };
  schedule?: {
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
    day?: number;
    time?: string;
    recipients: string[];
    format: 'PDF' | 'Excel' | 'CSV';
    lastSent?: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
} 