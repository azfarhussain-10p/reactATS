# ATS Application API Documentation

This directory contains documentation related to the API implementation in the ATS (Applicant Tracking System) application.

## Directory Structure

- `services/`: Documentation for frontend API service implementations
  - [api-service.md](services/api-service.md): Frontend API service implementation details

## API Endpoints

For a complete list of available API endpoints, refer to the [API-README.md](../API-README.md) in the root directory.

## Frontend Integration

The frontend uses the API services defined in `src/services/api.ts` to communicate with the backend. These services provide a clean and consistent interface for making API calls from React components.

### Key Concepts

1. **Centralized API Configuration**: All API calls use a single axios instance with consistent configuration
2. **Structured Service Objects**: API functionality is organized into service objects by domain (jobs, applications, job boards)
3. **Consistent Error Handling**: All API methods follow the same pattern for error handling and logging
4. **TypeScript Integration**: API methods use TypeScript for better type safety and developer experience

### Common Usage Pattern

```typescript
import { jobsApi } from '../services/api';

// In a React component
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

## Best Practices

1. Always wrap API calls in try-catch blocks
2. Handle loading states with a loading indicator
3. Provide user-friendly error messages
4. Log detailed errors to the console for debugging
5. Use TypeScript interfaces for request and response data 