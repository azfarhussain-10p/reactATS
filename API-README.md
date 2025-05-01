# ATS Application API Documentation

This document provides information about the API endpoints available in the ATS (Applicant Tracking System) application.

## Base URL

All API endpoints are prefixed with `/api`.

## Backend Implementation

The API is implemented using Express.js with a mock data service that simulates database operations for development purposes. The mock data is stored in JSON files in the `src/data` directory.

### Mock Data Service

The application uses a `mockDataService` to handle data operations:

- All data is loaded from JSON files at startup
- Data is kept in memory for faster operations
- All changes are persisted back to the JSON files

## Authentication

Authentication is partially implemented. Some endpoints require authentication which is handled by the `authenticate` middleware. For development purposes, authentication can be bypassed.

## Jobs API

### Get All Jobs

- **URL**: `/api/jobs`
- **Method**: `GET`
- **Query Parameters**:
  - `search`: Filter jobs by keyword in title, description, or department
  - `department`: Filter jobs by department
  - `location`: Filter jobs by location
  - `type`: Filter jobs by job type
  - `status`: Filter jobs by status (Active, On-Hold, Closed, Draft)
- **Response**: Array of job objects
- **Access**: Public

### Get All Departments

- **URL**: `/api/jobs/departments`
- **Method**: `GET`
- **Response**: Array of unique department strings
- **Access**: Public

### Get All Locations

- **URL**: `/api/jobs/locations`
- **Method**: `GET`
- **Response**: Array of unique location strings
- **Access**: Public

### Get All Job Types

- **URL**: `/api/jobs/types`
- **Method**: `GET`
- **Response**: Array of unique job type strings
- **Access**: Public

### Get Job by ID

- **URL**: `/api/jobs/:id`
- **Method**: `GET`
- **Response**: Single job object
- **Access**: Public
- **Error Responses**:
  - `400`: Invalid job ID
  - `404`: Job not found
  - `500`: Server error

### Create Job

- **URL**: `/api/jobs`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "title": "Job Title",
    "department": "Department Name",
    "location": "Job Location",
    "type": "Full-time",
    "experience": "3-5 years",
    "salary": "$100,000 - $120,000",
    "description": "Job description text",
    "responsibilities": ["Responsibility 1", "Responsibility 2"],
    "requirements": ["Requirement 1", "Requirement 2"],
    "benefits": "Benefits information",
    "status": "Active"
  }
  ```
- **Response**: Newly created job object
- **Access**: Private (requires authentication)
- **Error Responses**:
  - `400`: Invalid job data
  - `500`: Server error

### Update Job

- **URL**: `/api/jobs/:id`
- **Method**: `PUT`
- **Body**: Job object with updated fields
- **Response**: Updated job object
- **Access**: Private (requires authentication)
- **Error Responses**:
  - `400`: Invalid job ID or data
  - `404`: Job not found
  - `500`: Server error

### Update Job Status

- **URL**: `/api/jobs/:id/status`
- **Method**: `PATCH`
- **Body**:
  ```json
  {
    "status": "Active" // or "On-Hold", "Closed", "Draft"
  }
  ```
- **Response**: Updated job object
- **Access**: Private (requires authentication)
- **Error Responses**:
  - `400`: Invalid job ID or status
  - `404`: Job not found
  - `500`: Server error

### Toggle Featured Status

- **URL**: `/api/jobs/:id/featured`
- **Method**: `PATCH`
- **Response**: Updated job object with toggled featured status
- **Access**: Private (requires authentication)
- **Error Responses**:
  - `400`: Invalid job ID
  - `404`: Job not found
  - `500`: Server error

### Delete Job

- **URL**: `/api/jobs/:id`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "message": "Job deleted",
    "job": {
      /* deleted job object */
    }
  }
  ```
- **Access**: Private (requires authentication)
- **Error Responses**:
  - `400`: Invalid job ID
  - `404`: Job not found
  - `500`: Server error

## Applications API

### Get All Applications

- **URL**: `/api/applications`
- **Method**: `GET`
- **Query Parameters**:
  - `jobId`: Filter applications by job ID
  - `candidateId`: Filter applications by candidate ID
  - `status`: Filter applications by status
- **Response**: Array of application objects
- **Access**: Private (requires authentication)
- **Error Responses**:
  - `500`: Server error

### Get Application by ID

- **URL**: `/api/applications/:id`
- **Method**: `GET`
- **Response**: Single application object
- **Access**: Private (requires authentication)
- **Error Responses**:
  - `400`: Invalid application ID
  - `404`: Application not found
  - `500`: Server error

### Create Application

- **URL**: `/api/applications`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "jobId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "123-456-7890",
    "resume": "URL to resume",
    "coverLetter": "Cover letter text",
    "linkedInUrl": "LinkedIn profile URL",
    "portfolioUrl": "Portfolio URL",
    "referredBy": "Referrer name",
    "source": "Source of application",
    "answers": []
  }
  ```
- **Response**: Newly created application object
- **Access**: Public
- **Error Responses**:
  - `400`: Invalid application data
  - `404`: Referenced job not found
  - `500`: Server error

### Update Application

- **URL**: `/api/applications/:id`
- **Method**: `PUT`
- **Body**: Application object with updated fields
- **Response**: Updated application object
- **Access**: Private (requires authentication)
- **Error Responses**:
  - `400`: Invalid application ID or data
  - `404`: Application not found
  - `500`: Server error

### Update Application Status

- **URL**: `/api/applications/:id/status`
- **Method**: `PATCH`
- **Body**:
  ```json
  {
    "status": "New" // or other status values
  }
  ```
- **Response**: Updated application object
- **Access**: Private (requires authentication)
- **Error Responses**:
  - `400`: Invalid application ID or status
  - `404`: Application not found
  - `500`: Server error

### Update Application Stage

- **URL**: `/api/applications/:id/stage`
- **Method**: `PATCH`
- **Body**:
  ```json
  {
    "stage": "Applied", // or other pipeline stages
    "notes": "Optional notes about the stage change"
  }
  ```
- **Response**: Updated application object
- **Access**: Private (requires authentication)
- **Error Responses**:
  - `400`: Invalid application ID or stage
  - `404`: Application not found
  - `500`: Server error

### Delete Application

- **URL**: `/api/applications/:id`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "message": "Application deleted",
    "application": {
      /* deleted application object */
    }
  }
  ```
- **Access**: Private (requires authentication)
- **Error Responses**:
  - `400`: Invalid application ID
  - `404`: Application not found
  - `500`: Server error

## Job Boards API

### Get All Job Boards

- **URL**: `/api/job-boards`
- **Method**: `GET`
- **Response**: Array of job board objects
- **Access**: Private (to be implemented with auth)
- **Error Responses**:
  - `500`: Server error

### Get Job Board by ID

- **URL**: `/api/job-boards/:id`
- **Method**: `GET`
- **Response**: Single job board object
- **Access**: Private (to be implemented with auth)
- **Error Responses**:
  - `400`: Invalid job board ID
  - `404`: Job board not found
  - `500`: Server error

### Get Job Board by Slug

- **URL**: `/api/job-boards/slug/:slug`
- **Method**: `GET`
- **Response**: Single job board object
- **Access**: Public
- **Error Responses**:
  - `404`: Job board not found
  - `500`: Server error

### Create Job Board

- **URL**: `/api/job-boards`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "Job Board Name",
    "slug": "job-board-slug",
    "description": "Job board description",
    "isActive": true,
    "featuredJobs": 3,
    "jobsPerPage": 10,
    "showSalary": true,
    "showApplications": true,
    "layout": "grid",
    "primaryColor": "#3f51b5",
    "secondaryColor": "#f50057",
    "logoUrl": "/logo.svg",
    "metaTitle": "SEO Title",
    "metaDescription": "SEO Description"
  }
  ```
- **Response**: Newly created job board object
- **Access**: Private (to be implemented with auth)
- **Error Responses**:
  - `400`: Invalid job board data
  - `500`: Server error

### Update Job Board

- **URL**: `/api/job-boards/:id`
- **Method**: `PUT`
- **Body**: Job board object with updated fields
- **Response**: Updated job board object
- **Access**: Private (to be implemented with auth)
- **Error Responses**:
  - `400`: Invalid job board ID or data
  - `404`: Job board not found
  - `500`: Server error

### Update Job Board Status

- **URL**: `/api/job-boards/:id/status`
- **Method**: `PATCH`
- **Body**:
  ```json
  {
    "isActive": true // or false
  }
  ```
- **Response**: Updated job board object
- **Access**: Private (to be implemented with auth)
- **Error Responses**:
  - `400`: Invalid job board ID or status
  - `404`: Job board not found
  - `500`: Server error

### Delete Job Board

- **URL**: `/api/job-boards/:id`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "message": "Job board deleted",
    "jobBoard": {
      /* deleted job board object */
    }
  }
  ```
- **Access**: Private (to be implemented with auth)
- **Error Responses**:
  - `400`: Invalid job board ID
  - `404`: Job board not found
  - `500`: Server error

## Frontend API Integration

The frontend uses the axios library to communicate with the API. API service functions are located in `src/services/api.ts` and organized into:

- `jobsApi`: Methods for job-related operations
- `applicationsApi`: Methods for application-related operations
- `jobBoardsApi`: Methods for job board-related operations

Example usage in React components:

```typescript
// Fetching jobs in a component
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

## Error Handling

All API endpoints implement proper error handling:

- Validation of inputs (IDs, required fields, etc.)
- Appropriate HTTP status codes for different error scenarios
- Consistent error response format
- Error logging

Example error response:

```json
{
  "message": "Job not found"
}
```

## Mock Data Structure

The application uses the following mock data files:

- `mockJobs.json`: Contains job listings
- `mockApplications.json`: Contains job applications
- `mockJobBoards.json`: Contains job board configurations

Each file contains an array of objects with the appropriate schema for that entity.
