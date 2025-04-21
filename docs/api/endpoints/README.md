# API Endpoints Documentation

This directory contains documentation for all API endpoints in the ATS application.

## Authentication Endpoints

- **[Login](/docs/api/endpoints/auth/login.md)** - Authenticate a user and get access token
- **[Refresh Token](/docs/api/endpoints/auth/refresh.md)** - Refresh an expired access token
- **[Logout](/docs/api/endpoints/auth/logout.md)** - Log out a user by invalidating their token

## Jobs Endpoints

- **[Create Job](/docs/api/endpoints/jobs/create.md)** - Create a new job posting
- **[Get All Jobs](/docs/api/endpoints/jobs/get-all.md)** - Retrieve all jobs with optional filtering
- **[Get Job by ID](/docs/api/endpoints/jobs/get-by-id.md)** - Retrieve a specific job by ID
- **[Update Job](/docs/api/endpoints/jobs/update.md)** - Update an existing job posting
- **[Delete Job](/docs/api/endpoints/jobs/delete.md)** - Delete a job posting
- **[Update Job Status](/docs/api/endpoints/jobs/update-status.md)** - Update a job's status
- **[Toggle Featured Status](/docs/api/endpoints/jobs/toggle-featured.md)** - Toggle a job's featured status
- **[Get Departments](/docs/api/endpoints/jobs/get-departments.md)** - Get all unique departments
- **[Get Locations](/docs/api/endpoints/jobs/get-locations.md)** - Get all unique locations
- **[Get Job Types](/docs/api/endpoints/jobs/get-job-types.md)** - Get all unique job types

## Applications Endpoints

- **[Create Application](/docs/api/endpoints/applications/create.md)** - Submit a job application
- **[Get All Applications](/docs/api/endpoints/applications/get-all.md)** - Retrieve all applications with optional filtering
- **[Get Application by ID](/docs/api/endpoints/applications/get-by-id.md)** - Retrieve a specific application by ID
- **[Update Application](/docs/api/endpoints/applications/update.md)** - Update an existing application
- **[Update Application Status](/docs/api/endpoints/applications/update-status.md)** - Update an application's status
- **[Update Application Stage](/docs/api/endpoints/applications/update-stage.md)** - Update an application's pipeline stage
- **[Delete Application](/docs/api/endpoints/applications/delete.md)** - Delete an application

## Job Boards Endpoints

- **[Create Job Board](/docs/api/endpoints/job-boards/create.md)** - Create a new job board
- **[Get All Job Boards](/docs/api/endpoints/job-boards/get-all.md)** - Retrieve all job boards
- **[Get Job Board by ID](/docs/api/endpoints/job-boards/get-by-id.md)** - Retrieve a specific job board by ID
- **[Get Job Board by Slug](/docs/api/endpoints/job-boards/get-by-slug.md)** - Retrieve a specific job board by slug
- **[Update Job Board](/docs/api/endpoints/job-boards/update.md)** - Update an existing job board
- **[Update Job Board Status](/docs/api/endpoints/job-boards/update-status.md)** - Update a job board's active status
- **[Delete Job Board](/docs/api/endpoints/job-boards/delete.md)** - Delete a job board

## Using the API

For information on how to use these endpoints in your code, please refer to:

- **[API Service Documentation](/docs/api/services/api-service.md)** - How to use the API service
- **[Authentication Guide](/docs/api/services/auth-service.md)** - How to handle authentication
- **[Error Handling](/docs/api/services/error-handling.md)** - How to handle API errors

## API Versioning

The current API version is `v1`. All endpoints are prefixed with `/api`.

## Status Codes

The API uses the following status codes:

- `200 OK` - The request was successful
- `201 Created` - A new resource was successfully created
- `400 Bad Request` - The request was invalid or cannot be served
- `401 Unauthorized` - Authentication failed or user doesn't have permissions
- `404 Not Found` - The resource was not found
- `409 Conflict` - There was a conflict with the current state of the resource
- `500 Internal Server Error` - Server error 