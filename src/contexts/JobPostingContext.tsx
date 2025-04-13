import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  JobPlatform, 
  ExternalJobPosting, 
  JobPostingMetrics 
} from '../models/types';

// Sample API endpoints for job platforms (would be actual API endpoints in production)
const PLATFORM_ENDPOINTS = {
  Indeed: 'https://api.indeed.com/v2/jobs',
  LinkedIn: 'https://api.linkedin.com/v2/jobs',
  Glassdoor: 'https://api.glassdoor.com/v1/jobs',
  ZipRecruiter: 'https://api.ziprecruiter.com/jobs',
  Monster: 'https://api.monster.com/jobs',
  CareerBuilder: 'https://api.careerbuilder.com/v1/jobs',
  Facebook: 'https://graph.facebook.com/v15.0/jobs',
  Twitter: 'https://api.twitter.com/2/tweets',
  CompanyWebsite: '/api/company/jobs',
  Other: '/api/external/jobs'
};

// Sample mock job postings data
const mockJobPostings: ExternalJobPosting[] = [
  {
    id: uuidv4(),
    jobId: 1,
    platform: 'LinkedIn',
    externalId: 'ln-123456',
    title: 'Senior Frontend Developer',
    status: 'Published',
    autoRepost: true,
    repostThreshold: 30,
    lastPostedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    platformSpecificData: {
      premium: true,
      sponsoredLevel: 'standard',
      locationId: 'us-ca-san-francisco'
    },
    metrics: {
      id: uuidv4(),
      jobId: 1,
      platform: 'LinkedIn',
      views: 342,
      clicks: 87,
      applications: 23,
      conversionRate: 26.4,
      costPerClick: 1.25,
      costPerApplication: 4.72,
      postingDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      customUrl: 'https://linkedin.com/jobs/company/senior-frontend-dev?src=ats',
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: uuidv4(),
    jobId: 1,
    platform: 'Indeed',
    externalId: 'ind-789012',
    title: 'Senior Frontend Developer',
    status: 'Published',
    autoRepost: false,
    repostThreshold: 0,
    lastPostedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    platformSpecificData: {
      sponsored: true,
      visibility: 'high',
      companyRating: 4.2
    },
    metrics: {
      id: uuidv4(),
      jobId: 1,
      platform: 'Indeed',
      views: 521,
      clicks: 145,
      applications: 38,
      conversionRate: 26.2,
      costPerClick: 0.95,
      costPerApplication: 3.63,
      postingDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      expirationDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      customUrl: 'https://indeed.com/viewjob?jk=abc123&from=ats',
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: uuidv4(),
    jobId: 1,
    platform: 'Glassdoor',
    externalId: 'gd-345678',
    title: 'Senior Frontend Developer',
    status: 'Published',
    autoRepost: true,
    repostThreshold: 14,
    lastPostedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    platformSpecificData: {
      enhanced: true,
      branding: 'standard',
      audienceTarget: 'tech_professionals'
    },
    metrics: {
      id: uuidv4(),
      jobId: 1,
      platform: 'Glassdoor',
      views: 287,
      clicks: 62,
      applications: 19,
      conversionRate: 30.6,
      costPerClick: 1.42,
      costPerApplication: 4.64,
      postingDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      expirationDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      customUrl: 'https://glassdoor.com/job-listing/senior-frontend-developer?src=ats',
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: uuidv4(),
    jobId: 2,
    platform: 'LinkedIn',
    externalId: 'ln-234567',
    title: 'UX Designer',
    status: 'Published',
    autoRepost: true,
    repostThreshold: 30,
    lastPostedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    platformSpecificData: {
      premium: false,
      sponsoredLevel: 'basic',
      locationId: 'us-ca-san-francisco'
    },
    metrics: {
      id: uuidv4(),
      jobId: 2,
      platform: 'LinkedIn',
      views: 203,
      clicks: 45,
      applications: 15,
      conversionRate: 33.3,
      costPerClick: 1.05,
      costPerApplication: 3.15,
      postingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expirationDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      customUrl: 'https://linkedin.com/jobs/company/ux-designer?src=ats',
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: uuidv4(),
    jobId: 3,
    platform: 'CompanyWebsite',
    externalId: 'internal-123',
    title: 'Full Stack Developer',
    status: 'Published',
    autoRepost: false,
    repostThreshold: 0,
    lastPostedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    metrics: {
      id: uuidv4(),
      jobId: 3,
      platform: 'CompanyWebsite',
      views: 175,
      clicks: 54,
      applications: 12,
      conversionRate: 22.2,
      postingDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      expirationDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      customUrl: 'https://company.com/careers/full-stack-developer',
      lastUpdated: new Date().toISOString()
    }
  }
];

// Define the context interface
interface JobPostingContextType {
  jobPostings: ExternalJobPosting[];
  getPlatformPostings: (jobId: number, platform?: JobPlatform) => ExternalJobPosting[];
  createJobPosting: (jobId: number, platform: JobPlatform, title: string) => ExternalJobPosting;
  publishJobPosting: (postingId: string) => Promise<boolean>;
  pauseJobPosting: (postingId: string) => Promise<boolean>;
  deleteJobPosting: (postingId: string) => Promise<boolean>;
  updateJobPosting: (postingId: string, updates: Partial<ExternalJobPosting>) => Promise<ExternalJobPosting | null>;
  getJobPostingMetrics: (jobId: number) => JobPostingMetrics[];
  getPostingMetricsByPlatform: () => Record<JobPlatform, number>;
  getAggregatedMetrics: (jobId?: number) => {
    totalViews: number;
    totalClicks: number;
    totalApplications: number;
    avgConversionRate: number;
    avgCostPerApplication: number;
    platformBreakdown: Record<JobPlatform, { applications: number, percentage: number }>;
  };
  isPostedOnPlatform: (jobId: number, platform: JobPlatform) => boolean;
  getStalePostings: (thresholdDays: number) => ExternalJobPosting[];
  repostExpiredJobs: () => Promise<number>;
  generateTrackingUrl: (jobId: number, platform: JobPlatform) => string;
}

// Extend the existing JobPostingContext or add the necessary interfaces
interface JobPostingContextExtended {
  // Existing context properties
  // ...

  // Job Distribution
  externalPostings: ExternalJobPosting[];
  platformMetrics: Record<JobPlatform, JobPostingMetrics[]>;
  
  // Platform Integration Methods
  distributeJobPosting: (jobId: number, platforms: JobPlatform[], customDescription?: string) => Promise<ExternalJobPosting[]>;
  updateExternalPosting: (postingId: string, status: ExternalJobPosting['status']) => Promise<ExternalJobPosting>;
  getPostingsByJobId: (jobId: number) => ExternalJobPosting[];
  getMetricsByJobId: (jobId: number) => JobPostingMetrics[];
  
  // Social Media Integration
  shareToSocialMedia: (jobId: number, platforms: ('Facebook' | 'Twitter' | 'LinkedIn')[]) => Promise<boolean>;
  
  // Reposting Automation
  scheduleRepost: (postingId: string, threshold: number, autoRepost: boolean) => Promise<ExternalJobPosting>;
  checkAndRepostStaleListings: () => Promise<number>; // Returns number of reposted listings
  
  // Tracking and Analytics
  generateAdvancedTrackingUrl: (postingId: string, source?: string, campaign?: string) => string;
  recordPostingView: (postingId: string) => void;
  recordPostingClick: (postingId: string) => void;
  recordPostingApplication: (postingId: string) => void;
}

interface PlatformCredentials {
  indeed: {
    apiKey: string;
    employerId: string;
  };
  linkedin: {
    clientId: string;
    clientSecret: string;
  };
  glassdoor: {
    partnerId: string;
    apiKey: string;
  };
  facebook: {
    pageId: string;
    accessToken: string;
  };
  twitter: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
  };
}

// Simulated API connection functions for job boards
const platformAPIs = {
  postToIndeed: async (jobData: any, credentials: any): Promise<{id: string, status: string}> => {
    // Simulate API call to Indeed
    console.log('Posting to Indeed:', jobData);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id: `indeed-${Date.now()}`, status: 'Published' };
  },
  
  postToLinkedIn: async (jobData: any, credentials: any): Promise<{id: string, status: string}> => {
    // Simulate API call to LinkedIn
    console.log('Posting to LinkedIn:', jobData);
    await new Promise(resolve => setTimeout(resolve, 600));
    return { id: `linkedin-${Date.now()}`, status: 'Published' };
  },
  
  postToGlassdoor: async (jobData: any, credentials: any): Promise<{id: string, status: string}> => {
    // Simulate API call to Glassdoor
    console.log('Posting to Glassdoor:', jobData);
    await new Promise(resolve => setTimeout(resolve, 700));
    return { id: `glassdoor-${Date.now()}`, status: 'Published' };
  },
  
  postToFacebook: async (jobData: any, credentials: any): Promise<{id: string, status: string}> => {
    // Simulate API call to Facebook
    console.log('Posting to Facebook:', jobData);
    await new Promise(resolve => setTimeout(resolve, 400));
    return { id: `fb-${Date.now()}`, status: 'Published' };
  },
  
  postToTwitter: async (jobData: any, credentials: any): Promise<{id: string, status: string}> => {
    // Simulate API call to Twitter
    console.log('Posting to Twitter:', jobData);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id: `twitter-${Date.now()}`, status: 'Published' };
  },
  
  updatePosting: async (platform: string, externalId: string, data: any, credentials: any): Promise<{status: string}> => {
    // Simulate API call to update posting
    console.log(`Updating posting on ${platform}:`, externalId, data);
    await new Promise(resolve => setTimeout(resolve, 400));
    return { status: data.status };
  }
};

// Sample platform credentials - in a real app, these would be stored securely and loaded from environment variables
const sampleCredentials: PlatformCredentials = {
  indeed: {
    apiKey: 'sample-indeed-api-key',
    employerId: 'sample-employer-id',
  },
  linkedin: {
    clientId: 'sample-linkedin-client-id',
    clientSecret: 'sample-linkedin-client-secret',
  },
  glassdoor: {
    partnerId: 'sample-glassdoor-partner-id',
    apiKey: 'sample-glassdoor-api-key',
  },
  facebook: {
    pageId: 'sample-facebook-page-id',
    accessToken: 'sample-facebook-access-token',
  },
  twitter: {
    apiKey: 'sample-twitter-api-key',
    apiSecret: 'sample-twitter-api-secret',
    accessToken: 'sample-twitter-access-token',
  }
};

// Create the context
const JobPostingContext = createContext<JobPostingContextExtended | undefined>(undefined);

// Provider component
export const JobPostingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobPostings, setJobPostings] = useState<ExternalJobPosting[]>(mockJobPostings);

  // Add new state for job distribution
  const [externalPostings, setExternalPostings] = useState<ExternalJobPosting[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<Record<JobPlatform, JobPostingMetrics[]>>({} as Record<JobPlatform, JobPostingMetrics[]>);

  // Initialize platform metrics state
  useEffect(() => {
    const platforms: JobPlatform[] = [
      'Indeed', 'LinkedIn', 'Glassdoor', 'ZipRecruiter', 'Monster',
      'CareerBuilder', 'Facebook', 'Twitter', 'CompanyWebsite', 'Other'
    ];
    
    const initialMetrics: Record<JobPlatform, JobPostingMetrics[]> = {} as Record<JobPlatform, JobPostingMetrics[]>;
    platforms.forEach(platform => {
      initialMetrics[platform] = [];
    });
    
    setPlatformMetrics(initialMetrics);
  }, []);

  // Get all postings for a specific job (optionally filtered by platform)
  const getPlatformPostings = (jobId: number, platform?: JobPlatform) => {
    if (platform) {
      return jobPostings.filter(posting => posting.jobId === jobId && posting.platform === platform);
    }
    return jobPostings.filter(posting => posting.jobId === jobId);
  };

  // Create a new job posting
  const createJobPosting = (jobId: number, platform: JobPlatform, title: string) => {
    const now = new Date().toISOString();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // Default 30 day expiration
    
    const metrics: JobPostingMetrics = {
      id: uuidv4(),
      jobId,
      platform,
      views: 0,
      clicks: 0,
      applications: 0,
      conversionRate: 0,
      postingDate: now,
      expirationDate: expirationDate.toISOString(),
      isActive: false,
      customUrl: generateTrackingUrl(jobId, platform),
      lastUpdated: now
    };
    
    const newPosting: ExternalJobPosting = {
      id: uuidv4(),
      jobId,
      platform,
      title,
      status: 'Draft',
      autoRepost: platform !== 'CompanyWebsite',
      repostThreshold: 30,
      lastPostedDate: now,
      metrics
    };
    
    setJobPostings(prev => [...prev, newPosting]);
    return newPosting;
  };

  // Publish a job posting to its platform
  const publishJobPosting = async (postingId: string): Promise<boolean> => {
    try {
      // Simulate API call to publish
      const posting = jobPostings.find(p => p.id === postingId);
      if (!posting) return false;
      
      // In a real app, this would be an API call to the actual platform
      // await fetch(PLATFORM_ENDPOINTS[posting.platform], {
      //   method: 'POST',
      //   body: JSON.stringify(posting)
      // });
      
      // Update status to published
      setJobPostings(prev => prev.map(p => {
        if (p.id === postingId) {
          return {
            ...p,
            status: 'Published',
            lastPostedDate: new Date().toISOString(),
            metrics: {
              ...p.metrics,
              isActive: true,
              lastUpdated: new Date().toISOString()
            }
          };
        }
        return p;
      }));
      
      return true;
    } catch (error) {
      console.error('Error publishing job posting:', error);
      return false;
    }
  };

  // Pause a job posting
  const pauseJobPosting = async (postingId: string): Promise<boolean> => {
    try {
      const posting = jobPostings.find(p => p.id === postingId);
      if (!posting) return false;
      
      // In a real app, this would be an API call to the actual platform
      
      // Update status to paused
      setJobPostings(prev => prev.map(p => {
        if (p.id === postingId) {
          return {
            ...p,
            status: 'Paused',
            metrics: {
              ...p.metrics,
              isActive: false,
              lastUpdated: new Date().toISOString()
            }
          };
        }
        return p;
      }));
      
      return true;
    } catch (error) {
      console.error('Error pausing job posting:', error);
      return false;
    }
  };

  // Delete a job posting
  const deleteJobPosting = async (postingId: string): Promise<boolean> => {
    try {
      const posting = jobPostings.find(p => p.id === postingId);
      if (!posting) return false;
      
      // In a real app, this would be an API call to the actual platform
      
      // Remove the posting
      setJobPostings(prev => prev.filter(p => p.id !== postingId));
      
      return true;
    } catch (error) {
      console.error('Error deleting job posting:', error);
      return false;
    }
  };

  // Update a job posting
  const updateJobPosting = async (postingId: string, updates: Partial<ExternalJobPosting>): Promise<ExternalJobPosting | null> => {
    try {
      let updatedPosting: ExternalJobPosting | null = null;
      
      setJobPostings(prev => {
        const updated = prev.map(p => {
          if (p.id === postingId) {
            updatedPosting = {
              ...p,
              ...updates,
              metrics: {
                ...p.metrics,
                lastUpdated: new Date().toISOString()
              }
            };
            return updatedPosting;
          }
          return p;
        });
        
        return updated;
      });
      
      return updatedPosting;
    } catch (error) {
      console.error('Error updating job posting:', error);
      return null;
    }
  };

  // Get metrics for a specific job across all platforms
  const getJobPostingMetrics = (jobId: number): JobPostingMetrics[] => {
    return jobPostings
      .filter(posting => posting.jobId === jobId)
      .map(posting => posting.metrics);
  };

  // Get metrics by platform (count of postings)
  const getPostingMetricsByPlatform = (): Record<JobPlatform, number> => {
    const result: Partial<Record<JobPlatform, number>> = {};
    
    jobPostings.forEach(posting => {
      if (!result[posting.platform]) {
        result[posting.platform] = 0;
      }
      result[posting.platform]!++;
    });
    
    return result as Record<JobPlatform, number>;
  };

  // Get aggregated metrics across all platforms
  const getAggregatedMetrics = (jobId?: number) => {
    const relevantPostings = jobId 
      ? jobPostings.filter(p => p.jobId === jobId) 
      : jobPostings;
    
    if (relevantPostings.length === 0) {
      return {
        totalViews: 0,
        totalClicks: 0,
        totalApplications: 0,
        avgConversionRate: 0,
        avgCostPerApplication: 0,
        platformBreakdown: {} as Record<JobPlatform, { applications: number, percentage: number }>
      };
    }
    
    const totalViews = relevantPostings.reduce((sum, p) => sum + p.metrics.views, 0);
    const totalClicks = relevantPostings.reduce((sum, p) => sum + p.metrics.clicks, 0);
    const totalApplications = relevantPostings.reduce((sum, p) => sum + p.metrics.applications, 0);
    
    // Calculate platform breakdown
    const platformBreakdown: Record<string, { applications: number, percentage: number }> = {};
    relevantPostings.forEach(p => {
      if (!platformBreakdown[p.platform]) {
        platformBreakdown[p.platform] = { applications: 0, percentage: 0 };
      }
      platformBreakdown[p.platform].applications += p.metrics.applications;
    });
    
    // Calculate percentages
    Object.keys(platformBreakdown).forEach(platform => {
      platformBreakdown[platform].percentage = totalApplications > 0
        ? (platformBreakdown[platform].applications / totalApplications) * 100
        : 0;
    });
    
    return {
      totalViews,
      totalClicks,
      totalApplications,
      avgConversionRate: totalClicks > 0 
        ? (totalApplications / totalClicks) * 100 
        : 0,
      avgCostPerApplication: relevantPostings
        .filter(p => p.metrics.costPerApplication !== undefined)
        .reduce((sum, p) => sum + (p.metrics.costPerApplication || 0), 0) / 
        relevantPostings.filter(p => p.metrics.costPerApplication !== undefined).length,
      platformBreakdown: platformBreakdown as Record<JobPlatform, { applications: number, percentage: number }>
    };
  };

  // Check if a job is posted on a specific platform
  const isPostedOnPlatform = (jobId: number, platform: JobPlatform): boolean => {
    return jobPostings.some(p => 
      p.jobId === jobId && 
      p.platform === platform && 
      p.status === 'Published' && 
      p.metrics.isActive
    );
  };

  // Get stale postings that need reposting
  const getStalePostings = (thresholdDays: number): ExternalJobPosting[] => {
    const now = new Date();
    const threshold = new Date(now.getTime() - thresholdDays * 24 * 60 * 60 * 1000);
    
    return jobPostings.filter(posting => {
      const lastPostedDate = new Date(posting.lastPostedDate);
      return (
        posting.autoRepost &&
        posting.status === 'Published' &&
        lastPostedDate < threshold &&
        posting.metrics.isActive
      );
    });
  };

  // Automatically repost expired jobs
  const repostExpiredJobs = async (): Promise<number> => {
    let repostedCount = 0;
    
    const staleJobs = jobPostings.filter(p => {
      if (!p.autoRepost) return false;
      
      const expiration = new Date(p.metrics.expirationDate);
      const now = new Date();
      return expiration < now && p.status !== 'Expired';
    });
    
    for (const job of staleJobs) {
      try {
        // In a real app, this would be an API call to the actual platform
        
        // Update the job posting
        await updateJobPosting(job.id, {
          lastPostedDate: new Date().toISOString(),
          status: 'Published',
          metrics: {
            ...job.metrics,
            postingDate: new Date().toISOString(),
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true
          }
        });
        
        repostedCount++;
      } catch (error) {
        console.error(`Error reposting job ${job.id}:`, error);
      }
    }
    
    return repostedCount;
  };

  // Generate a tracking URL for source attribution
  const generateTrackingUrl = (jobId: number, platform: JobPlatform): string => {
    const baseUrl = 'https://company.com/careers/jobs/';
    const trackingParam = `source=${platform.toLowerCase()}&utm_medium=job_board&utm_campaign=ats_tracking`;
    return `${baseUrl}${jobId}?${trackingParam}`;
  };

  // Effect to check for jobs that need reposting (in a real app this would be a cron job)
  useEffect(() => {
    const checkForStaleJobs = async () => {
      const staleJobs = getStalePostings(30); // Check for jobs older than 30 days
      if (staleJobs.length > 0) {
        console.log(`Found ${staleJobs.length} stale job postings`);
        await repostExpiredJobs();
      }
    };
    
    // Run once on load
    checkForStaleJobs();
    
    // And set up an interval to check periodically
    const interval = setInterval(checkForStaleJobs, 24 * 60 * 60 * 1000); // Once a day
    
    return () => clearInterval(interval);
  }, []);

  // Platform Integration Methods
  const distributeJobPosting = async (
    jobId: number, 
    platforms: JobPlatform[], 
    customDescription?: string
  ): Promise<ExternalJobPosting[]> => {
    // Get job details from your state
    const job = {}; // Replace with actual job data lookup
    
    const newPostings: ExternalJobPosting[] = [];
    const postingPromises: Promise<ExternalJobPosting>[] = [];
    
    // Create a posting for each selected platform
    for (const platform of platforms) {
      const postingPromise = createExternalPosting(jobId, platform, customDescription);
      postingPromises.push(postingPromise);
    }
    
    // Wait for all postings to complete
    const results = await Promise.all(postingPromises);
    newPostings.push(...results);
    
    // Update state with new postings
    setExternalPostings(prev => [...prev, ...newPostings]);
    
    return newPostings;
  };

  // Create an external posting on a specific platform
  const createExternalPosting = async (
    jobId: number,
    platform: JobPlatform,
    customDescription?: string
  ): Promise<ExternalJobPosting> => {
    // Get job details - this would be from your job state
    const job = { 
      id: jobId,
      title: "Sample Job Title",
      description: customDescription || "Sample job description"
    };
    
    // Prepare job data for API
    const jobData = {
      title: job.title,
      description: job.description,
      // Add other necessary job fields
    };
    
    // Post to appropriate platform
    let externalPostingResult;
    switch (platform) {
      case 'Indeed':
        externalPostingResult = await platformAPIs.postToIndeed(jobData, sampleCredentials.indeed);
        break;
      case 'LinkedIn':
        externalPostingResult = await platformAPIs.postToLinkedIn(jobData, sampleCredentials.linkedin);
        break;
      case 'Glassdoor':
        externalPostingResult = await platformAPIs.postToGlassdoor(jobData, sampleCredentials.glassdoor);
        break;
      case 'Facebook':
        externalPostingResult = await platformAPIs.postToFacebook(jobData, sampleCredentials.facebook);
        break;
      case 'Twitter':
        externalPostingResult = await platformAPIs.postToTwitter(jobData, sampleCredentials.twitter);
        break;
      default:
        // For other platforms, just create a local record
        externalPostingResult = { id: `${platform.toLowerCase()}-${Date.now()}`, status: 'Published' };
    }
    
    // Create metrics for this posting
    const metricId = uuidv4();
    const now = new Date().toISOString();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // 30 day default expiration
    
    const newMetrics: JobPostingMetrics = {
      id: metricId,
      jobId,
      platform,
      views: 0,
      clicks: 0,
      applications: 0,
      conversionRate: 0,
      postingDate: now,
      expirationDate: expirationDate.toISOString(),
      isActive: true,
      customUrl: generateTrackingUrl(jobId, platform),
      lastUpdated: now
    };
    
    // Update metrics state
    setPlatformMetrics(prev => {
      const updatedMetrics = { ...prev };
      if (!updatedMetrics[platform]) {
        updatedMetrics[platform] = [];
      }
      updatedMetrics[platform] = [...updatedMetrics[platform], newMetrics];
      return updatedMetrics;
    });
    
    // Create the external posting record
    const newPosting: ExternalJobPosting = {
      id: uuidv4(),
      jobId,
      platform,
      externalId: externalPostingResult.id,
      title: job.title,
      status: externalPostingResult.status as ExternalJobPosting['status'],
      autoRepost: false,
      repostThreshold: 30, // Default to 30 days
      lastPostedDate: now,
      metrics: newMetrics
    };
    
    return newPosting;
  };

  // Update an existing external posting
  const updateExternalPosting = async (
    postingId: string,
    status: ExternalJobPosting['status']
  ): Promise<ExternalJobPosting> => {
    // Find the posting to update
    const postingIndex = externalPostings.findIndex(p => p.id === postingId);
    if (postingIndex === -1) {
      throw new Error(`Posting with ID ${postingId} not found`);
    }
    
    const posting = externalPostings[postingIndex];
    
    // Update via platform API
    if (posting.externalId) {
      let platform: string;
      switch (posting.platform) {
        case 'Indeed':
          platform = 'indeed';
          break;
        case 'LinkedIn':
          platform = 'linkedin';
          break;
        case 'Glassdoor':
          platform = 'glassdoor';
          break;
        case 'Facebook':
          platform = 'facebook';
          break;
        case 'Twitter':
          platform = 'twitter';
          break;
        default:
          platform = posting.platform.toLowerCase();
      }
      
      const credentials = (sampleCredentials as any)[platform] || {};
      const updateResult = await platformAPIs.updatePosting(
        platform,
        posting.externalId,
        { status },
        credentials
      );
      
      // Update local state
      const updatedPosting = {
        ...posting,
        status: updateResult.status as ExternalJobPosting['status'],
        lastPostedDate: new Date().toISOString()
      };
      
      const updatedPostings = [...externalPostings];
      updatedPostings[postingIndex] = updatedPosting;
      setExternalPostings(updatedPostings);
      
      // Update metrics too
      if (posting.metrics) {
        const metricsCopy = { ...platformMetrics };
        const metricIndex = metricsCopy[posting.platform].findIndex(m => m.id === posting.metrics.id);
        if (metricIndex !== -1) {
          metricsCopy[posting.platform][metricIndex] = {
            ...metricsCopy[posting.platform][metricIndex],
            isActive: status === 'Published',
            lastUpdated: new Date().toISOString()
          };
          setPlatformMetrics(metricsCopy);
        }
      }
      
      return updatedPosting;
    } else {
      throw new Error('Posting has no external ID');
    }
  };

  // Get postings for a specific job
  const getPostingsByJobId = (jobId: number): ExternalJobPosting[] => {
    return externalPostings.filter(posting => posting.jobId === jobId);
  };

  // Get metrics for a specific job
  const getMetricsByJobId = (jobId: number): JobPostingMetrics[] => {
    const result: JobPostingMetrics[] = [];
    Object.values(platformMetrics).forEach(metricsArray => {
      const jobMetrics = metricsArray.filter(metric => metric.jobId === jobId);
      result.push(...jobMetrics);
    });
    return result;
  };

  // Social Media Integration
  const shareToSocialMedia = async (
    jobId: number,
    platforms: ('Facebook' | 'Twitter' | 'LinkedIn')[]
  ): Promise<boolean> => {
    try {
      // Convert social media platforms to job platforms format
      const jobPlatforms: JobPlatform[] = platforms.map(p => p as JobPlatform);
      
      // Use the existing distribute function
      await distributeJobPosting(jobId, jobPlatforms);
      return true;
    } catch (error) {
      console.error('Error sharing to social media:', error);
      return false;
    }
  };

  // Reposting Automation
  const scheduleRepost = async (
    postingId: string,
    threshold: number,
    autoRepost: boolean
  ): Promise<ExternalJobPosting> => {
    const postingIndex = externalPostings.findIndex(p => p.id === postingId);
    if (postingIndex === -1) {
      throw new Error(`Posting with ID ${postingId} not found`);
    }
    
    // Update the posting with new repost settings
    const updatedPosting = {
      ...externalPostings[postingIndex],
      autoRepost,
      repostThreshold: threshold
    };
    
    const updatedPostings = [...externalPostings];
    updatedPostings[postingIndex] = updatedPosting;
    setExternalPostings(updatedPostings);
    
    return updatedPosting;
  };

  const checkAndRepostStaleListings = async (): Promise<number> => {
    const now = new Date();
    let repostedCount = 0;
    
    // Find all postings that need to be reposted
    const stalePostings = externalPostings.filter(posting => {
      if (!posting.autoRepost || posting.status !== 'Published') {
        return false;
      }
      
      const lastPostedDate = new Date(posting.lastPostedDate);
      const daysSincePosted = (now.getTime() - lastPostedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysSincePosted >= posting.repostThreshold;
    });
    
    // Repost each stale posting
    for (const posting of stalePostings) {
      try {
        // First pause the current posting
        await updateExternalPosting(posting.id, 'Paused');
        
        // Then create a new posting
        await createExternalPosting(posting.jobId, posting.platform);
        
        repostedCount++;
      } catch (error) {
        console.error(`Error reposting ${posting.id}:`, error);
      }
    }
    
    return repostedCount;
  };

  // Tracking and Analytics
  const generateAdvancedTrackingUrl = (postingId: string, source?: string, campaign?: string): string => {
    const baseUrl = 'https://careers.yourcompany.com/jobs';
    const params = new URLSearchParams();
    params.append('pid', postingId);
    
    if (source) {
      params.append('source', source);
    }
    
    if (campaign) {
      params.append('utm_campaign', campaign);
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  const recordPostingView = (postingId: string): void => {
    // Find the posting and its metrics
    const posting = externalPostings.find(p => p.id === postingId);
    if (!posting || !posting.metrics) return;
    
    // Update metrics
    const metricsCopy = { ...platformMetrics };
    const metricIndex = metricsCopy[posting.platform].findIndex(m => m.id === posting.metrics.id);
    
    if (metricIndex !== -1) {
      const updatedMetric = {
        ...metricsCopy[posting.platform][metricIndex],
        views: metricsCopy[posting.platform][metricIndex].views + 1,
        lastUpdated: new Date().toISOString()
      };
      
      metricsCopy[posting.platform][metricIndex] = updatedMetric;
      setPlatformMetrics(metricsCopy);
      
      // Also update the metrics in the posting
      const updatedPostings = [...externalPostings];
      const postingIndex = updatedPostings.findIndex(p => p.id === postingId);
      if (postingIndex !== -1) {
        updatedPostings[postingIndex] = {
          ...updatedPostings[postingIndex],
          metrics: updatedMetric
        };
        setExternalPostings(updatedPostings);
      }
    }
  };

  const recordPostingClick = (postingId: string): void => {
    // Find the posting and its metrics
    const posting = externalPostings.find(p => p.id === postingId);
    if (!posting || !posting.metrics) return;
    
    // Update metrics
    const metricsCopy = { ...platformMetrics };
    const metricIndex = metricsCopy[posting.platform].findIndex(m => m.id === posting.metrics.id);
    
    if (metricIndex !== -1) {
      const metric = metricsCopy[posting.platform][metricIndex];
      const updatedMetric = {
        ...metric,
        clicks: metric.clicks + 1,
        conversionRate: metric.views > 0 ? (metric.clicks + 1) / metric.views : 0,
        lastUpdated: new Date().toISOString()
      };
      
      metricsCopy[posting.platform][metricIndex] = updatedMetric;
      setPlatformMetrics(metricsCopy);
      
      // Also update the metrics in the posting
      const updatedPostings = [...externalPostings];
      const postingIndex = updatedPostings.findIndex(p => p.id === postingId);
      if (postingIndex !== -1) {
        updatedPostings[postingIndex] = {
          ...updatedPostings[postingIndex],
          metrics: updatedMetric
        };
        setExternalPostings(updatedPostings);
      }
    }
  };

  const recordPostingApplication = (postingId: string): void => {
    // Find the posting and its metrics
    const posting = externalPostings.find(p => p.id === postingId);
    if (!posting || !posting.metrics) return;
    
    // Update metrics
    const metricsCopy = { ...platformMetrics };
    const metricIndex = metricsCopy[posting.platform].findIndex(m => m.id === posting.metrics.id);
    
    if (metricIndex !== -1) {
      const metric = metricsCopy[posting.platform][metricIndex];
      const updatedMetric = {
        ...metric,
        applications: metric.applications + 1,
        lastUpdated: new Date().toISOString()
      };
      
      if (metric.costPerClick) {
        updatedMetric.costPerApplication = 
          (metric.costPerClick * metric.clicks) / (metric.applications + 1);
      }
      
      metricsCopy[posting.platform][metricIndex] = updatedMetric;
      setPlatformMetrics(metricsCopy);
      
      // Also update the metrics in the posting
      const updatedPostings = [...externalPostings];
      const postingIndex = updatedPostings.findIndex(p => p.id === postingId);
      if (postingIndex !== -1) {
        updatedPostings[postingIndex] = {
          ...updatedPostings[postingIndex],
          metrics: updatedMetric
        };
        setExternalPostings(updatedPostings);
      }
    }
  };

  // Export context value with all methods
  const contextValue: JobPostingContextExtended = {
    // Include existing context values
    // ...
    
    // Add new distribution methods
    externalPostings,
    platformMetrics,
    distributeJobPosting,
    updateExternalPosting,
    getPostingsByJobId,
    getMetricsByJobId,
    shareToSocialMedia,
    scheduleRepost,
    checkAndRepostStaleListings,
    generateAdvancedTrackingUrl,
    recordPostingView,
    recordPostingClick,
    recordPostingApplication
  };

  return (
    <JobPostingContext.Provider value={contextValue}>
      {children}
    </JobPostingContext.Provider>
  );
};

// Hook to use the job posting context
export const useJobPosting = () => {
  const context = useContext(JobPostingContext);
  if (!context) {
    throw new Error('useJobPosting must be used within a JobPostingProvider');
  }
  return context;
};

export default JobPostingContext; 