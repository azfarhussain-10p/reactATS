# Job Creation API

## Endpoint

```
POST /api/jobs
```

## Description

Creates a new job posting in the system.

## Authentication

This endpoint requires authentication. Include the authentication token in the request header.

## Request Headers

| Header | Value | Description |
|--------|-------|-------------|
| Content-Type | application/json | The content type of the request body |
| Authorization | Bearer {token} | Authentication token |

## Request Body

```json
{
  "title": "Senior React Developer",
  "department": "Engineering",
  "location": "New York, NY",
  "type": "Full-time",
  "experience": "3-5 years",
  "salary": "$120,000 - $150,000",
  "description": "We are looking for a senior React developer to join our team.",
  "responsibilities": [
    "Develop new user-facing features using React.js",
    "Build reusable components and front-end libraries for future use"
  ],
  "requirements": [
    "3+ years of experience with React.js and JavaScript ES6+",
    "Strong proficiency in JavaScript and TypeScript"
  ],
  "benefits": [
    "Competitive salary",
    "Health, dental, and vision insurance"
  ],
  "status": "Active"
}
```

### Required Fields

The following fields are required:
- `title` - The job title
- `department` - The department the job belongs to
- `location` - The job location
- `type` - The employment type (Full-time, Part-time, Contract, etc.)

## Response

### Success Response

**Code**: 201 Created

```json
{
  "id": 123,
  "title": "Senior React Developer",
  "department": "Engineering",
  "location": "New York, NY",
  "type": "Full-time",
  "experience": "3-5 years",
  "salary": "$120,000 - $150,000",
  "description": "We are looking for a senior React developer to join our team.",
  "responsibilities": [
    "Develop new user-facing features using React.js",
    "Build reusable components and front-end libraries for future use"
  ],
  "requirements": [
    "3+ years of experience with React.js and JavaScript ES6+",
    "Strong proficiency in JavaScript and TypeScript"
  ],
  "benefits": [
    "Competitive salary",
    "Health, dental, and vision insurance"
  ],
  "postedDate": "2023-10-15",
  "status": "Active",
  "isFeatured": false,
  "applicants": 0
}
```

### Error Responses

**Code**: 400 Bad Request
```json
{
  "message": "Invalid job data",
  "details": "Missing required fields: title, department",
  "code": "MISSING_REQUIRED_FIELDS"
}
```

**Code**: 401 Unauthorized
```json
{
  "message": "Authentication failed",
  "code": "AUTH_FAILED"
}
```

**Code**: 500 Internal Server Error
```json
{
  "message": "Failed to create job",
  "details": "Database connection error",
  "code": "JOB_CREATE_ERROR"
}
```

## Implementation Notes

- The job will be assigned a unique ID automatically
- The `postedDate` will be set to the current date if not provided
- The `applicants` count will start at 0
- The `isFeatured` flag defaults to false

## Code Example

```javascript
// Example using the jobsApi service
import { jobsApi } from '../services/api';

const createNewJob = async (jobData) => {
  try {
    const newJob = await jobsApi.createJob(jobData);
    console.log('Job created successfully:', newJob);
    return newJob;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};
``` 