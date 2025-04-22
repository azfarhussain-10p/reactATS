import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

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
          filteredJobs = filteredJobs.filter(job => 
            job.title.toLowerCase().includes(searchTerm) || 
            job.description.toLowerCase().includes(searchTerm)
          );
        }
        
        if (filters.department) {
          filteredJobs = filteredJobs.filter(job => 
            job.department === filters.department
          );
        }
        
        if (filters.location) {
          filteredJobs = filteredJobs.filter(job => 
            job.location === filters.location
          );
        }
        
        if (filters.type) {
          filteredJobs = filteredJobs.filter(job => 
            job.type === filters.type
          );
        }
        
        // Handle status filter (e.g., "Active")
        if (filters.status) {
          filteredJobs = filteredJobs.filter(job => 
            job.status === filters.status
          );
        }
        
        return filteredJobs;
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
        const job = mockJobs.find(job => parseInt(job.id) === parseInt(id));
        
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
          const uniqueDepartments = [...new Set(mockJobs.map(job => job.department))];
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
          const uniqueLocations = [...new Set(mockJobs.map(job => job.location))];
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
          const uniqueTypes = [...new Set(mockJobs.map(job => job.type))];
          return uniqueTypes.map((name, index) => ({ id: String(index + 1), name }));
        }
        
        return [];
      } catch (mockError) {
        console.error('Error loading mock job types:', mockError);
        return [];
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
        submittedAt: new Date().toISOString()
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
        return mockApplications.filter(app => app.jobId === parseInt(jobId));
      } catch (mockError) {
        console.error('Error loading mock applications:', mockError);
        return [];
      }
    }
  }
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
        timestamp: new Date().toISOString()
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
        timestamp: new Date().toISOString()
      };
    }
  }
};

export default api; 