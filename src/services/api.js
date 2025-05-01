import axios from 'axios';

// Check if we're in a Vite environment, otherwise fallback to a default URL
const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  window.env?.REACT_APP_API_BASE_URL ||
  'http://localhost:3001/api';

// Lazy load mock data to avoid issues with fetch
const getMockJobs = async () => {
  try {
    const jobs = await import('../data/mockJobs.json');
    return jobs.default || jobs;
  } catch (error) {
    console.error('Error importing mock jobs:', error);
    return [];
  }
};

const getMockDepartments = async () => {
  try {
    const departments = await import('../data/mockDepartments.json');
    return departments.default || departments;
  } catch (error) {
    console.error('Error importing mock departments:', error);
    return [];
  }
};

const getMockLocations = async () => {
  try {
    const locations = await import('../data/mockLocations.json');
    return locations.default || locations;
  } catch (error) {
    console.error('Error importing mock locations:', error);
    return [];
  }
};

const getMockJobTypes = async () => {
  try {
    const jobTypes = await import('../data/mockJobTypes.json');
    return jobTypes.default || jobTypes;
  } catch (error) {
    console.error('Error importing mock job types:', error);
    return [];
  }
};

const getMockApplications = async () => {
  try {
    const applications = await import('../data/mockApplications.json');
    return applications.default || applications;
  } catch (error) {
    console.error('Error importing mock applications:', error);
    return [];
  }
};

// Axios instance with base configurations
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Job API service with mock fallbacks for when backend isn't ready
export const jobsApi = {
  // Get all jobs with optional filters
  getAllJobs: async (filters = {}) => {
    try {
      const response = await api.get('/jobs', { params: filters });
      return response.data;
    } catch (error) {
      console.warn('Using mock jobs data due to API error:', error);

      try {
        // Get mock data using dynamic import
        const mockJobs = await getMockJobs();

        // Filter mock jobs based on provided filters
        let filteredJobs = [...mockJobs];

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredJobs = filteredJobs.filter(
            (job) =>
              job.title.toLowerCase().includes(searchTerm) ||
              job.description.toLowerCase().includes(searchTerm)
          );
        }

        if (filters.department) {
          filteredJobs = filteredJobs.filter((job) => job.department === filters.department);
        }

        if (filters.location) {
          filteredJobs = filteredJobs.filter((job) => job.location === filters.location);
        }

        if (filters.type) {
          filteredJobs = filteredJobs.filter((job) => job.type === filters.type);
        }

        // Handle status filter (e.g., "Active", "Draft", "On-Hold", "Closed")
        if (filters.status) {
          filteredJobs = filteredJobs.filter((job) => job.status === filters.status);
        }

        // Special handling for published filter used by Careers page
        // to show only Active jobs and exclude drafts, on-hold, and closed
        if (filters.published === 'true' || filters.published === true) {
          filteredJobs = filteredJobs.filter((job) => job.status === 'Active');
        }

        return filteredJobs;
      } catch (mockError) {
        console.error('Error loading mock data:', mockError);
        return [];
      }
    }
  },

  // Get all draft jobs for the JobBoard page
  getDraftJobs: async () => {
    try {
      const response = await api.get('/jobs', { params: { status: 'Draft' } });
      return response.data;
    } catch (error) {
      console.warn('Using mock jobs data due to API error:', error);

      try {
        const mockJobs = await getMockJobs();
        return mockJobs.filter((job) => job.status === 'Draft');
      } catch (mockError) {
        console.error('Error loading mock data:', mockError);
        return [];
      }
    }
  },

  // Get all published (Active) jobs for the Careers page
  getPublishedJobs: async () => {
    try {
      const response = await api.get('/jobs', { params: { status: 'Active' } });
      return response.data;
    } catch (error) {
      console.warn('Using mock jobs data due to API error:', error);

      try {
        const mockJobs = await getMockJobs();
        return mockJobs.filter((job) => job.status === 'Active');
      } catch (mockError) {
        console.error('Error loading mock data:', mockError);
        return [];
      }
    }
  },

  // Get job by ID
  getJobById: async (id) => {
    try {
      const response = await api.get(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Using mock job data due to API error:', error);

      try {
        // Get mock data using dynamic import
        const mockJobs = await getMockJobs();
        const job = mockJobs.find((job) => parseInt(job.id) === parseInt(id));

        if (!job) {
          throw new Error('Job not found');
        }

        return job;
      } catch (mockError) {
        console.error('Error loading mock data:', mockError);
        throw new Error('Job not found');
      }
    }
  },

  // Create a new job (can be draft or published)
  createJob: async (jobData) => {
    try {
      const response = await api.post('/jobs', jobData);
      return response.data;
    } catch (error) {
      console.warn('Using mock implementation due to API error:', error);

      try {
        // Get mock data using dynamic import
        const mockJobs = await getMockJobs();

        // Create a new job with a unique ID
        const maxId =
          mockJobs.length > 0 ? Math.max(...mockJobs.map((job) => parseInt(job.id))) : 0;

        // Determine if this is a draft or published job
        const isDraft = jobData.isDraft === true || jobData.status === 'Draft';

        // Format the date as YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        const newJob = {
          id: maxId + 1,
          ...jobData,
          status: isDraft ? 'Draft' : 'Active',
          postedDate: isDraft ? today : today, // Set posted date even for drafts for display purposes
          applicants: 0,
        };

        // Add the new job to mock data
        mockJobs.push(newJob);

        return newJob;
      } catch (mockError) {
        console.error('Error in mock job creation:', mockError);
        throw new Error('Failed to create job');
      }
    }
  },

  // Update an existing job
  updateJob: async (id, jobData) => {
    try {
      const response = await api.put(`/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      console.warn('Using mock implementation due to API error:', error);

      try {
        // Get mock data using dynamic import
        const mockJobs = await getMockJobs();

        // Find the job to update
        const jobIndex = mockJobs.findIndex((job) => parseInt(job.id) === parseInt(id));

        if (jobIndex === -1) {
          throw new Error('Job not found');
        }

        // Check if the job is a draft - only drafts can be edited
        if (mockJobs[jobIndex].status !== 'Draft') {
          throw new Error('Only draft jobs can be edited');
        }

        // Update the job
        const updatedJob = {
          ...mockJobs[jobIndex],
          ...jobData,
        };

        mockJobs[jobIndex] = updatedJob;

        return updatedJob;
      } catch (mockError) {
        console.error('Error in mock job update:', mockError);
        throw mockError;
      }
    }
  },

  // Save a job as a draft
  saveJobAsDraft: async (id, jobData) => {
    try {
      const response = await api.post(`/jobs/${id}/save-draft`, jobData);
      return response.data;
    } catch (error) {
      console.warn('Using mock implementation due to API error:', error);

      try {
        // Get mock data using dynamic import
        const mockJobs = await getMockJobs();

        // Find the job to save as draft
        const jobIndex = mockJobs.findIndex((job) => parseInt(job.id) === parseInt(id));

        if (jobIndex === -1) {
          throw new Error('Job not found');
        }

        // Set the job as a draft but maintain postedDate
        const currentDate = mockJobs[jobIndex].postedDate || new Date().toISOString().split('T')[0];

        const updatedJob = {
          ...mockJobs[jobIndex],
          ...jobData,
          status: 'Draft',
          postedDate: currentDate, // Keep existing date or set new one
        };

        mockJobs[jobIndex] = updatedJob;

        return updatedJob;
      } catch (mockError) {
        console.error('Error in mock draft save:', mockError);
        throw mockError;
      }
    }
  },

  // Publish a draft job
  publishJob: async (id) => {
    try {
      const response = await api.post(`/jobs/${id}/publish`);
      return response.data;
    } catch (error) {
      console.warn('Using mock implementation due to API error:', error);

      try {
        // Get mock data using dynamic import
        const mockJobs = await getMockJobs();

        // Find the job to publish
        const jobIndex = mockJobs.findIndex((job) => parseInt(job.id) === parseInt(id));

        if (jobIndex === -1) {
          throw new Error('Job not found');
        }

        // Check if the job is a draft
        if (mockJobs[jobIndex].status !== 'Draft') {
          throw new Error('Only draft jobs can be published');
        }

        // Set required fields for validation
        const requiredFields = [
          'title',
          'department',
          'location',
          'type',
          'description',
          'responsibilities',
          'requirements',
        ];
        const missingFields = requiredFields.filter(
          (field) =>
            !mockJobs[jobIndex][field] ||
            (typeof mockJobs[jobIndex][field] === 'string' &&
              mockJobs[jobIndex][field].trim() === '') ||
            (Array.isArray(mockJobs[jobIndex][field]) && mockJobs[jobIndex][field].length === 0)
        );

        if (missingFields.length > 0) {
          throw new Error(
            `Cannot publish incomplete job. Missing fields: ${missingFields.join(', ')}`
          );
        }

        // Publish the job
        const updatedJob = {
          ...mockJobs[jobIndex],
          status: 'Active',
          postedDate: new Date().toISOString().split('T')[0],
        };

        mockJobs[jobIndex] = updatedJob;

        return updatedJob;
      } catch (mockError) {
        console.error('Error in mock job publish:', mockError);
        throw mockError;
      }
    }
  },

  // Get all departments
  getDepartments: async () => {
    try {
      const response = await api.get('/departments');
      return response.data;
    } catch (error) {
      console.warn('Using mock departments data due to API error:', error);

      try {
        // First try to get departments from dedicated file
        const mockDepartments = await getMockDepartments();
        if (mockDepartments && mockDepartments.length > 0) {
          return mockDepartments;
        }

        // If that fails, extract from jobs
        const mockJobs = await getMockJobs();
        if (mockJobs.length > 0) {
          const uniqueDepartments = [...new Set(mockJobs.map((job) => job.department))];
          return uniqueDepartments.map((name, index) => ({ id: String(index + 1), name }));
        }

        return [];
      } catch (mockError) {
        console.error('Error loading mock departments:', mockError);
        return [];
      }
    }
  },

  // Get all locations
  getLocations: async () => {
    try {
      const response = await api.get('/locations');
      return response.data;
    } catch (error) {
      console.warn('Using mock locations data due to API error:', error);

      try {
        // First try to get locations from dedicated file
        const mockLocations = await getMockLocations();
        if (mockLocations && mockLocations.length > 0) {
          return mockLocations;
        }

        // If that fails, extract from jobs
        const mockJobs = await getMockJobs();
        if (mockJobs.length > 0) {
          const uniqueLocations = [...new Set(mockJobs.map((job) => job.location))];
          return uniqueLocations.map((name, index) => ({ id: String(index + 1), name }));
        }

        return [];
      } catch (mockError) {
        console.error('Error loading mock locations:', mockError);
        return [];
      }
    }
  },

  // Get all job types
  getJobTypes: async () => {
    try {
      const response = await api.get('/job-types');
      return response.data;
    } catch (error) {
      console.warn('Using mock job types data due to API error:', error);

      try {
        // First try to get job types from dedicated file
        const mockJobTypes = await getMockJobTypes();
        if (mockJobTypes && mockJobTypes.length > 0) {
          return mockJobTypes;
        }

        // If that fails, extract from jobs
        const mockJobs = await getMockJobs();
        if (mockJobs.length > 0) {
          const uniqueTypes = [...new Set(mockJobs.map((job) => job.type))];
          return uniqueTypes.map((name, index) => ({ id: String(index + 1), name }));
        }

        return [];
      } catch (mockError) {
        console.error('Error loading mock job types:', mockError);
        return [];
      }
    }
  },

  // Get all available job statuses
  getJobStatuses: () => {
    return ['Active', 'On-Hold', 'Closed', 'Draft'];
  },

  // Delete a job
  deleteJob: async (id) => {
    try {
      const response = await api.delete(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Using mock implementation due to API error:', error);

      try {
        // Get mock data using dynamic import
        const mockJobs = await getMockJobs();

        // Find the job to delete
        const jobIndex = mockJobs.findIndex((job) => parseInt(job.id) === parseInt(id));

        if (jobIndex === -1) {
          throw new Error('Job not found');
        }

        // Check if the job can be deleted (only Draft and Closed jobs can be deleted)
        if (mockJobs[jobIndex].status === 'Active') {
          throw new Error('Active jobs cannot be deleted. Please close the job first.');
        }

        if (mockJobs[jobIndex].status === 'On-Hold') {
          throw new Error('On-Hold jobs cannot be deleted. Please close the job first.');
        }

        // Remove the job from mock data
        const deletedJob = mockJobs.splice(jobIndex, 1)[0];

        return { success: true, message: 'Job deleted successfully', deletedJob };
      } catch (mockError) {
        console.error('Error in mock job deletion:', mockError);
        throw mockError;
      }
    }
  },
};

// Applications API service with mock implementation
export const applicationsApi = {
  // Create a new application
  createApplication: async (applicationData) => {
    try {
      const response = await api.post('/applications', applicationData);
      return response.data;
    } catch (error) {
      console.warn('Mock application submission due to API error:', error);
      console.log('Application data that would be submitted:', applicationData);

      // Mock a successful response
      return {
        id: Math.floor(Math.random() * 1000) + 1,
        ...applicationData,
        status: 'Submitted',
        submittedAt: new Date().toISOString(),
      };
    }
  },

  // Get applications by job ID (for admin purposes)
  getApplicationsByJobId: async (jobId) => {
    try {
      const response = await api.get(`/applications`, { params: { jobId } });
      return response.data;
    } catch (error) {
      console.warn('Mock applications retrieval due to API error:', error);

      try {
        // Get mock applications data
        const mockApplications = await getMockApplications();

        // Filter applications by jobId
        return mockApplications.filter((app) => app.jobId === parseInt(jobId));
      } catch (mockError) {
        console.error('Error loading mock applications:', mockError);
        return [];
      }
    }
  },
};

// Career page specific API service
export const careerApi = {
  // Subscribe to job alerts
  subscribeToJobAlerts: async (email, preferences = {}) => {
    try {
      const response = await api.post('/career/subscribe', { email, preferences });
      return response.data;
    } catch (error) {
      console.warn('Mock subscription due to API error:', error);
      console.log('Subscription data that would be submitted:', { email, preferences });

      // Mock a successful response
      return {
        success: true,
        message: 'Subscription successful',
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Submit contact form
  submitContactForm: async (contactData) => {
    try {
      const response = await api.post('/career/contact', contactData);
      return response.data;
    } catch (error) {
      console.warn('Mock contact form submission due to API error:', error);
      console.log('Contact data that would be submitted:', contactData);

      // Mock a successful response
      return {
        success: true,
        message: 'Message sent successfully',
        timestamp: new Date().toISOString(),
      };
    }
  },
};

export default api;
