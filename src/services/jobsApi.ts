import { jobsApi as baseJobsApi } from './api';

/**
 * Extended Job API service with additional methods for the Career page and CV parsing integration
 */
const jobsApi = {
  /**
   * Wraps the base getAllJobs method
   */
  getAllJobs: (filters = {}) => baseJobsApi.getAllJobs(filters),

  /**
   * Wraps the base getJobById method
   */
  getJobById: (id: number) => baseJobsApi.getJobById(id),

  /**
   * Get only published (active) jobs for the career site
   */
  getPublishedJobs: async () => {
    try {
      return await baseJobsApi.getAllJobs({ status: 'Active', published: true });
    } catch (error) {
      console.error('Error fetching published jobs:', error);
      throw error;
    }
  },

  /**
   * Get departments for job filtering
   */
  getDepartments: async () => {
    try {
      const response = await baseJobsApi.getDepartments();
      return response;
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Fallback to mock data if API fails
      return [
        'Engineering',
        'Design',
        'Product',
        'Marketing',
        'Sales',
        'Customer Support',
        'Human Resources',
        'Finance',
        'Operations',
      ];
    }
  },

  /**
   * Get locations for job filtering
   */
  getLocations: async () => {
    try {
      const response = await baseJobsApi.getLocations();
      return response;
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Fallback to mock data if API fails
      return [
        'New York, NY',
        'San Francisco, CA',
        'Seattle, WA',
        'Austin, TX',
        'Chicago, IL',
        'Remote',
      ];
    }
  },

  /**
   * Get job types for filtering
   */
  getJobTypes: async () => {
    try {
      const response = await baseJobsApi.getJobTypes();
      return response;
    } catch (error) {
      console.error('Error fetching job types:', error);
      // Fallback to mock data if API fails
      return [
        { id: '1', name: 'Full-time' },
        { id: '2', name: 'Part-time' },
        { id: '3', name: 'Contract' },
        { id: '4', name: 'Internship' },
        { id: '5', name: 'Remote' },
      ];
    }
  },

  /**
   * Get related jobs based on job ID or department
   */
  getRelatedJobs: async (jobId: number, limit = 3) => {
    try {
      // First get the job to determine its department
      const job = await baseJobsApi.getJobById(jobId);

      // Then get other jobs in the same department
      const departmentJobs = await baseJobsApi.getAllJobs({
        department: job.department,
        status: 'Active',
        published: true,
      });

      // Filter out the current job and limit the results
      return departmentJobs.filter((relatedJob: any) => relatedJob.id !== jobId).slice(0, limit);
    } catch (error) {
      console.error('Error fetching related jobs:', error);
      return [];
    }
  },

  /**
   * Apply for a job
   */
  applyForJob: async (jobId: number, applicationData: any) => {
    try {
      // In a real implementation, this would submit to the applications API
      // For now, we'll just log the application and return success
      console.log('Job application submitted:', { jobId, ...applicationData });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        message: 'Application submitted successfully',
        applicationId: `app-${Date.now()}`,
      };
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  },
};

export default jobsApi;
