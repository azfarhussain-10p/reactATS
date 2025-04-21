import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:80/api",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// Add request interceptor to add cache-busting parameter
api.interceptors.request.use((config) => {
  // Add a timestamp query parameter to bust the cache
  if (config.params) {
    config.params = { ...config.params, _t: new Date().getTime() };
  } else {
    config.params = { _t: new Date().getTime() };
  }
  console.log(
    `API Request: ${config.method?.toUpperCase()} ${config.url}`,
    config.params,
  );
  return config;
});

// Add response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      `API Error: ${error.response?.status} ${error.config?.url}`,
      error,
    );
    return Promise.reject(error);
  },
);

// Jobs API service
export const jobsApi = {
  // Get all jobs with optional filtering
  getAllJobs: async (filters = {}) => {
    try {
      const response = await api.get("/jobs", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  },

  // Get job by ID
  getJobById: async (id: number) => {
    try {
      const response = await api.get(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  },

  // Create new job
  createJob: async (jobData: any) => {
    try {
      const response = await api.post("/jobs", jobData);
      return response.data;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  },

  // Update job
  updateJob: async (id: number, jobData: any) => {
    try {
      const response = await api.put(`/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      console.error(`Error updating job ${id}:`, error);
      throw error;
    }
  },

  // Update job status
  updateJobStatus: async (id: number, status: string) => {
    try {
      const response = await api.patch(`/jobs/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating job ${id} status:`, error);
      throw error;
    }
  },

  // Toggle job featured status
  toggleJobFeatured: async (id: number) => {
    try {
      const response = await api.patch(`/jobs/${id}/featured`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling job ${id} featured status:`, error);
      throw error;
    }
  },

  // Delete job
  deleteJob: async (id: number) => {
    try {
      const response = await api.delete(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting job ${id}:`, error);
      throw error;
    }
  },

  // Get all unique departments
  getDepartments: async () => {
    try {
      const response = await api.get("/jobs/departments");
      return response.data;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  },

  // Get all unique locations
  getLocations: async () => {
    try {
      const response = await api.get("/jobs/locations");
      return response.data;
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }
  },

  // Get all unique job types
  getJobTypes: async () => {
    try {
      const response = await api.get("/jobs/types");
      return response.data;
    } catch (error) {
      console.error("Error fetching job types:", error);
      throw error;
    }
  },

  // Get all available job statuses
  // Note: This is a local method as there's no API endpoint
  getJobStatuses: () => {
    return ["Active", "On-Hold", "Closed", "Draft"];
  },
};

// Applications API service
export const applicationsApi = {
  // Get all applications with optional filtering
  getAllApplications: async (filters = {}) => {
    try {
      const response = await api.get("/applications", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  },

  // Get application by ID
  getApplicationById: async (id: number) => {
    try {
      const response = await api.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching application ${id}:`, error);
      throw error;
    }
  },

  // Create application
  createApplication: async (applicationData: any) => {
    try {
      const response = await api.post("/applications", applicationData);
      return response.data;
    } catch (error) {
      console.error("Error creating application:", error);
      throw error;
    }
  },

  // Update application
  updateApplication: async (id: number, applicationData: any) => {
    try {
      const response = await api.put(`/applications/${id}`, applicationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating application ${id}:`, error);
      throw error;
    }
  },

  // Update application status
  updateApplicationStatus: async (id: number, status: string) => {
    try {
      const response = await api.patch(`/applications/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating application ${id} status:`, error);
      throw error;
    }
  },

  // Update application stage
  updateApplicationStage: async (id: number, stage: string, notes?: string) => {
    try {
      const response = await api.patch(`/applications/${id}/stage`, {
        stage,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating application ${id} stage:`, error);
      throw error;
    }
  },

  // Delete application
  deleteApplication: async (id: number) => {
    try {
      const response = await api.delete(`/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting application ${id}:`, error);
      throw error;
    }
  },
};

// Job Boards API service
export const jobBoardsApi = {
  // Get all job boards
  getAllJobBoards: async () => {
    try {
      const response = await api.get("/job-boards");
      return response.data;
    } catch (error) {
      console.error("Error fetching job boards:", error);
      throw error;
    }
  },

  // Get job board by ID
  getJobBoardById: async (id: number) => {
    try {
      const response = await api.get(`/job-boards/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job board ${id}:`, error);
      throw error;
    }
  },

  // Get job board by slug
  getJobBoardBySlug: async (slug: string) => {
    try {
      const response = await api.get(`/job-boards/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job board with slug ${slug}:`, error);
      throw error;
    }
  },

  // Create job board
  createJobBoard: async (jobBoardData: any) => {
    try {
      const response = await api.post("/job-boards", jobBoardData);
      return response.data;
    } catch (error) {
      console.error("Error creating job board:", error);
      throw error;
    }
  },

  // Update job board
  updateJobBoard: async (id: number, jobBoardData: any) => {
    try {
      const response = await api.put(`/job-boards/${id}`, jobBoardData);
      return response.data;
    } catch (error) {
      console.error(`Error updating job board ${id}:`, error);
      throw error;
    }
  },

  // Update job board status
  updateJobBoardStatus: async (id: number, isActive: boolean) => {
    try {
      const response = await api.patch(`/job-boards/${id}/status`, {
        isActive,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating job board ${id} status:`, error);
      throw error;
    }
  },

  // Delete job board
  deleteJobBoard: async (id: number) => {
    try {
      const response = await api.delete(`/job-boards/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting job board ${id}:`, error);
      throw error;
    }
  },
};

export default {
  jobs: jobsApi,
  applications: applicationsApi,
  jobBoards: jobBoardsApi,
};
