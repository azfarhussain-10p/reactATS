# API Service Documentation

This document provides detailed information about the API service implementation used in the ATS application frontend.

## Overview

The frontend API service is implemented using axios and provides a structured interface for communicating with the backend API. The service is organized into three main modules:

- `jobsApi`: For managing job listings
- `applicationsApi`: For managing job applications
- `jobBoardsApi`: For managing job boards

## Base Configuration

The API service uses a centralized axios instance with default configuration:

```typescript
// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});
```

### Request Interceptor

A request interceptor is configured to add a cache-busting parameter to all requests:

```typescript
api.interceptors.request.use(config => {
  // Add a timestamp query parameter to bust the cache
  if (config.params) {
    config.params = { ...config.params, _t: new Date().getTime() };
  } else {
    config.params = { _t: new Date().getTime() };
  }
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
  return config;
});
```

### Response Interceptor

A response interceptor logs all responses and errors:

```typescript
api.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  error => {
    console.error(`API Error: ${error.response?.status} ${error.config?.url}`, error);
    return Promise.reject(error);
  }
);
```

## Jobs API Service

The `jobsApi` object provides methods for interacting with job-related endpoints:

### Getting Jobs

```typescript
// Get all jobs with optional filtering
getAllJobs: async (filters = {}) => {
  try {
    const response = await api.get('/jobs', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}
```

Usage in components:

```typescript
const [jobs, setJobs] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await jobsApi.getAllJobs();
      setJobs(jobsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
      setLoading(false);
    }
  };
  
  fetchJobs();
}, []);
```

### Getting Filtering Options

Methods for getting filter options:

```typescript
// Get all unique departments
getDepartments: async () => {
  try {
    const response = await api.get('/jobs/departments');
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
}

// Similar methods for locations and job types
```

### Getting a Single Job

```typescript
// Get job by ID
getJobById: async (id: number) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching job ${id}:`, error);
    throw error;
  }
}
```

### Creating, Updating and Deleting Jobs

```typescript
// Create new job
createJob: async (jobData: any) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

// Update job
updateJob: async (id: number, jobData: any) => {
  try {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  } catch (error) {
    console.error(`Error updating job ${id}:`, error);
    throw error;
  }
}

// Delete job
deleteJob: async (id: number) => {
  try {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting job ${id}:`, error);
    throw error;
  }
}
```

### Specialized Actions

```typescript
// Update job status
updateJobStatus: async (id: number, status: string) => {
  try {
    const response = await api.patch(`/jobs/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating job ${id} status:`, error);
    throw error;
  }
}

// Toggle job featured status
toggleJobFeatured: async (id: number) => {
  try {
    const response = await api.patch(`/jobs/${id}/featured`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling job ${id} featured status:`, error);
    throw error;
  }
}
```

## Applications API Service

The `applicationsApi` object provides methods for interacting with application-related endpoints:

### Getting Applications

```typescript
// Get all applications with optional filtering
getAllApplications: async (filters = {}) => {
  try {
    const response = await api.get('/applications', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
}
```

### Getting a Single Application

```typescript
// Get application by ID
getApplicationById: async (id: number) => {
  try {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching application ${id}:`, error);
    throw error;
  }
}
```

### Creating, Updating and Deleting Applications

```typescript
// Create application
createApplication: async (applicationData: any) => {
  try {
    const response = await api.post('/applications', applicationData);
    return response.data;
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
}

// Update application
updateApplication: async (id: number, applicationData: any) => {
  try {
    const response = await api.put(`/applications/${id}`, applicationData);
    return response.data;
  } catch (error) {
    console.error(`Error updating application ${id}:`, error);
    throw error;
  }
}

// Delete application
deleteApplication: async (id: number) => {
  try {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting application ${id}:`, error);
    throw error;
  }
}
```

### Specialized Actions

```typescript
// Update application status
updateApplicationStatus: async (id: number, status: string) => {
  try {
    const response = await api.patch(`/applications/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating application ${id} status:`, error);
    throw error;
  }
}

// Update application stage
updateApplicationStage: async (id: number, stage: string, notes?: string) => {
  try {
    const response = await api.patch(`/applications/${id}/stage`, { stage, notes });
    return response.data;
  } catch (error) {
    console.error(`Error updating application ${id} stage:`, error);
    throw error;
  }
}
```

## Job Boards API Service

The `jobBoardsApi` object provides methods for interacting with job board-related endpoints:

### Getting Job Boards

```typescript
// Get all job boards
getAllJobBoards: async () => {
  try {
    const response = await api.get('/job-boards');
    return response.data;
  } catch (error) {
    console.error('Error fetching job boards:', error);
    throw error;
  }
}
```

### Getting a Single Job Board

```typescript
// Get job board by ID
getJobBoardById: async (id: number) => {
  try {
    const response = await api.get(`/job-boards/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching job board ${id}:`, error);
    throw error;
  }
}

// Get job board by slug
getJobBoardBySlug: async (slug: string) => {
  try {
    const response = await api.get(`/job-boards/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching job board with slug ${slug}:`, error);
    throw error;
  }
}
```

### Creating, Updating and Deleting Job Boards

```typescript
// Create job board
createJobBoard: async (jobBoardData: any) => {
  try {
    const response = await api.post('/job-boards', jobBoardData);
    return response.data;
  } catch (error) {
    console.error('Error creating job board:', error);
    throw error;
  }
}

// Update job board
updateJobBoard: async (id: number, jobBoardData: any) => {
  try {
    const response = await api.put(`/job-boards/${id}`, jobBoardData);
    return response.data;
  } catch (error) {
    console.error(`Error updating job board ${id}:`, error);
    throw error;
  }
}

// Delete job board
deleteJobBoard: async (id: number) => {
  try {
    const response = await api.delete(`/job-boards/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting job board ${id}:`, error);
    throw error;
  }
}
```

### Specialized Actions

```typescript
// Update job board status
updateJobBoardStatus: async (id: number, isActive: boolean) => {
  try {
    const response = await api.patch(`/job-boards/${id}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error(`Error updating job board ${id} status:`, error);
    throw error;
  }
}
```

## Error Handling Best Practices

When using the API services in components, follow these best practices for error handling:

1. Always wrap API calls in try-catch blocks
2. Handle loading states with a loading indicator
3. Provide user-friendly error messages
4. Log detailed errors to the console for debugging

Example pattern:

```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getData();
      setData(result);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      setLoading(false);
    }
  };
  
  fetchData();
}, []);

// In your JSX
{loading && <CircularProgress />}
{error && <Alert severity="error">{error}</Alert>}
{!loading && !error && (
  // Render your data
)}
```

## Type Safety

For better type safety, consider defining TypeScript interfaces for your request and response data:

```typescript
// Job interfaces
interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  // ...other properties
}

interface JobCreateRequest {
  title: string;
  department: string;
  location: string;
  // ...other properties without id
}

// Then use in API calls
const createJob = async (jobData: JobCreateRequest): Promise<Job> => {
  try {
    const response = await api.post<Job>('/jobs', jobData);
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}
```

## Conclusion

This API service provides a clean interface for interacting with the backend API from React components. By centralizing all API calls in one service, we ensure consistent error handling, logging, and request formatting across the application.

For more information on the backend API endpoints, refer to the [API Documentation](../../API-README.md). 