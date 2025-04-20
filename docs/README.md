# ⚠️ DEPRECATED - Content Moved

> **Note**: This documentation file is deprecated. All content has been moved to the root [README.md](/README.md) file in the project root directory.
> Please refer to the main README.md file for the most up-to-date documentation.

---

# ATS Application Documentation

Welcome to the ATS (Applicant Tracking System) application documentation. This directory contains comprehensive documentation for all aspects of the application.

## Documentation Structure

This documentation is structured as follows:

- **API Documentation**: Details on all API endpoints and frontend API service implementation
  - API endpoints reference in [API-README.md](../API-README.md)
  - API service implementation details in [api/services/api-service.md](api/services/api-service.md)

## Implementation Details

### Backend

The backend of the application is implemented using:
- Express.js for the REST API
- Mock data services that simulate database operations
- JSON files for data storage during development

### Frontend

The frontend of the application is implemented using:
- React with TypeScript
- Material-UI for components and styling
- Axios for API communication

## Mock Data Services

The application uses mock data services to simulate database operations. These services:

1. Load data from JSON files
2. Provide methods for CRUD operations
3. Handle filtering and sorting
4. Persist changes back to JSON files

The mock data is stored in:
- `src/data/mockJobs.json`: Job listings data
- `src/data/mockApplications.json`: Application data
- `src/data/mockJobBoards.json`: Job board configuration data

## API Integration

For information on how to interact with the API from React components, see the [API Services documentation](api/README.md).

## Frontend Components

The frontend is built with React and uses Material-UI for components. Key pages include:

- `JobOpenings.tsx`: Public job listings page
- `JobBoard.tsx`: Admin job management page

## Development Setup

To set up the development environment:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks and provide user-friendly error messages
2. **Loading States**: Handle loading states with appropriate visual indicators
3. **TypeScript**: Use TypeScript interfaces for better type safety and developer experience
4. **Component Structure**: Follow established component patterns and reuse existing components
5. **API Integration**: Use the centralized API services for all API communication

## Contributing

Contributions to this documentation are welcome. When updating documentation:

1. Ensure accuracy of API endpoint descriptions
2. Add examples where possible
3. Keep code examples up to date with the actual implementation
4. Follow Markdown best practices for formatting

---

**Note**: This documentation is continuously updated. If you find any discrepancies or have suggestions for improvement, please follow our [contribution guidelines](/docs/guides/contributing/guidelines.md). 