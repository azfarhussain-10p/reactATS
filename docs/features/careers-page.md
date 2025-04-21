# Careers Page

The Careers Page is a public-facing feature of the ATS system that allows job seekers to browse and apply for open positions.

## Overview

The Careers Page provides a user-friendly interface for external candidates to:
- View all published job listings
- Filter jobs by department, location, and job type
- Search for specific jobs using keywords
- View detailed job descriptions
- Apply for positions online

## Implementation Details

### Components

The Careers Page is built with the following components:

- **CareerPage.jsx**: The main container component for the careers page
- **CareerHeader.jsx**: The header section with title and introduction
- **JobList.jsx**: Displays the list of available jobs
- **JobFilters.jsx**: Provides filtering options for the job list
- **JobCard.jsx**: Card component for individual job listings
- **JobDetail.jsx**: Detailed view of a specific job
- **ApplicationForm.jsx**: Form for submitting job applications

### Data Flow

1. The `CareerPage` component loads when users visit the careers page
2. On component mount, it fetches published jobs, departments, and locations from the API
3. Users can filter jobs using the `JobFilters` component
4. When a user clicks on a job, they are navigated to the job detail page
5. From the job detail page, users can initiate the application process

### API Integration

The Careers Page uses the following API endpoints:

- `GET /api/jobs` with `status=published` parameter to fetch active jobs
- `GET /api/jobs/departments` to fetch department filter options
- `GET /api/jobs/locations` to fetch location filter options
- `GET /api/jobs/:id` to fetch details for a specific job
- `POST /api/applications` to submit a job application

## Configuration Options

### Customization

The appearance of the Careers Page can be customized through:

- Company branding in the `CareerHeader` component
- Custom styling via CSS variables
- Configurable filter options
- Customizable application form fields

### Feature Flags

The following feature flags control Careers Page functionality:

- `ENABLE_JOB_SEARCH`: Enables or disables the search functionality
- `ENABLE_JOB_ALERTS`: Enables or disables job alert subscription feature
- `ENABLE_SOCIAL_SHARING`: Enables or disables social media sharing buttons

## Usage

### For Job Seekers

1. Visit the public career page URL (e.g., `/careers`)
2. Browse available jobs or use filters to narrow down options
3. Click on a job title to view details
4. Click "Apply Now" to start the application process
5. Complete the application form and submit

### For Administrators

1. Create and manage jobs through the admin interface
2. Set job status to "Active" to publish it to the careers page
3. Toggle "Featured" status to highlight important positions
4. Review submitted applications through the admin interface

## Security Considerations

- The Careers Page only displays jobs with "Active" status
- Sensitive job information (such as internal notes) is not exposed
- Application submissions are protected against CSRF attacks
- Input validation prevents malicious data in application forms

## Performance Optimization

- Job listings are paginated to improve load times
- Images are optimized and lazy-loaded
- Filter operations happen client-side after initial data load
- API responses are cached where appropriate

## Accessibility

The Careers Page follows accessibility best practices:

- All images have appropriate alt text
- Form fields have proper labels and ARIA attributes
- Color contrast meets WCAG AA standards
- Keyboard navigation is fully supported
- Screen reader compatibility is maintained

## Related Features

- [Job Distribution](./job-distribution.md): How jobs are distributed to external job boards
- [Job Board Integration](./job-board-integration.md): Integration with third-party job boards
- [Application Process](./application-process.md): End-to-end application workflow

## Troubleshooting

### Common Issues

1. **Jobs not appearing on Careers Page**
   - Verify that jobs have "Active" status
   - Check that the API endpoint is returning data correctly

2. **Filter options not working**
   - Ensure that departments and locations are properly set on jobs
   - Verify that filter components are receiving data correctly

3. **Application submissions failing**
   - Check for validation errors in the application form
   - Verify that the API endpoint for submissions is functioning 