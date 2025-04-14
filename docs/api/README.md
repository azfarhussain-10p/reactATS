# API Documentation

This directory contains comprehensive documentation for all API services and endpoints in the ATS application.

## Core Services

- [API Service](./services/api-service.md) - Core API service for making HTTP requests
- [Cache Service](./services/cache-service.md) - Service for managing API response caching
- [Queue Service](./services/queue-service.md) - Service for managing background tasks and job queues
- [Security Service](./services/security-service.md) - Service for handling authentication and authorization
- [Performance Monitor Service](./services/performance-monitor-service.md) - Service for monitoring application performance
- [Service Worker Manager](./services/service-worker-manager.md) - Service for managing PWA and offline capabilities
- [Scalability Service](./services/scalability-service.md) - Service for handling application scaling

## API Endpoints

### Authentication
- [Login](./endpoints/auth/login.md)
- [Register](./endpoints/auth/register.md)
- [Refresh Token](./endpoints/auth/refresh-token.md)

### Candidates
- [Create Candidate](./endpoints/candidates/create.md)
- [Update Candidate](./endpoints/candidates/update.md)
- [List Candidates](./endpoints/candidates/list.md)
- [Search Candidates](./endpoints/candidates/search.md)

### Jobs
- [Create Job](./endpoints/jobs/create.md)
- [Update Job](./endpoints/jobs/update.md)
- [List Jobs](./endpoints/jobs/list.md)
- [Search Jobs](./endpoints/jobs/search.md)

### Interviews
- [Schedule Interview](./endpoints/interviews/schedule.md)
- [Update Interview](./endpoints/interviews/update.md)
- [List Interviews](./endpoints/interviews/list.md)

### Analytics
- [Candidate Statistics](./endpoints/analytics/candidate-stats.md)
- [Job Statistics](./endpoints/analytics/job-stats.md)
- [Interview Statistics](./endpoints/analytics/interview-stats.md)

## Contributing

When adding new API documentation, please follow these guidelines:
1. Use the provided templates in the `_templates` directory
2. Include request/response examples
3. Document all parameters and response fields
4. Include error handling information
5. Add authentication requirements
6. Update this index file with links to new documentation 