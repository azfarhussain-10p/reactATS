# Careers Page

The Careers Page is a public-facing feature of the ATS system that allows job seekers to browse and apply for open positions.

## Overview

The Careers Page provides a user-friendly interface for external candidates to:
- View all published job listings
- Filter jobs by department, location, and job type
- Search for specific jobs using keywords
- View detailed job descriptions
- Apply for positions online
- Save favorite jobs for later review
- Toggle between grid and list view layouts
- Subscribe to job alerts
- Share job listings on social media

## Implementation Details

### Components

The Careers Page is built with the following components:

- **CareerPage.jsx**: The main container component for the careers page with animated hero section
- **JobFilters.jsx**: Provides filtering options for the job list
- **JobCard.jsx**: Card component for individual job listings with save/favorite functionality
- **JobDetailPage.jsx**: Detailed view of a specific job with related jobs and sharing features
- **ApplicationForm.jsx**: Form for submitting job applications with validation
- **JobLayout.jsx**: Toggleable grid/list layout for job listings
- **SubscriptionForm.jsx**: Form for subscribing to job alerts
- **ContactForm.jsx**: Form for sending inquiries about job opportunities

### Data Flow

1. The `CareerPage` component loads when users visit the careers page
2. On component mount, it fetches published jobs, departments, locations, and job types from the API
3. Users can filter jobs using the `JobFilters` component or the search functionality
4. When a user clicks on a job, they are navigated to the job detail page
5. The job detail page shows comprehensive information and related jobs from the same department
6. From the job detail page, users can initiate the application process, share the job, or view related positions

### API Integration

The Careers Page uses the following API endpoints:

- `GET /api/public/jobs` to fetch active jobs with filtering options
- `GET /api/public/departments` to fetch department filter options
- `GET /api/public/locations` to fetch location filter options
- `GET /api/public/job-types` to fetch job type filter options
- `GET /api/public/jobs/:id` to fetch details for a specific job
- `POST /api/public/applications` to submit a job application
- `POST /api/public/subscribe` to subscribe to job alerts
- `POST /api/public/contact` to submit inquiries

### Fallback Mechanism

The Careers Page implements a robust fallback mechanism:
- API calls attempt to fetch data from the server first
- If the API fails, the system falls back to local JSON mock data
- Mock data is stored in JSON format in the `src/data` directory
- This ensures the page remains functional during development or API downtime

## Configuration Options

### Customization

The appearance of the Careers Page can be customized through:

- Company branding in the animated hero section
- Custom styling via CSS variables and responsive design
- Configurable filter options
- Customizable application form fields
- Grid/list layout toggle for job display preferences

### Feature Flags

The following feature flags control Careers Page functionality:

- `ENABLE_JOB_SEARCH`: Enables or disables the search functionality
- `ENABLE_JOB_ALERTS`: Enables or disables job alert subscription feature
- `ENABLE_SOCIAL_SHARING`: Enables or disables social media sharing buttons
- `ENABLE_FAVORITES`: Enables or disables job saving/favoriting feature
- `ENABLE_VIEW_TOGGLE`: Enables or disables grid/list view toggle

## Usage

### For Job Seekers

1. Visit the public career page URL (e.g., `/careers`)
2. Browse available jobs or use filters and search to narrow down options
3. Toggle between grid and list view based on preference
4. Save interesting jobs by clicking the heart icon
5. Click on a job title to view details
6. View related jobs in the same department
7. Share job listings via LinkedIn, Twitter, or email
8. Click "Apply Now" to start the application process
9. Complete the application form with validation and submit
10. Subscribe to job alerts for future opportunities

### For Administrators

1. Create and manage jobs through the admin interface
2. Set job status to "Active" to publish it to the careers page
3. Toggle "Featured" status to highlight important positions
4. Review submitted applications through the admin interface
5. Monitor subscription and contact form submissions

## Security Considerations

- The Careers Page only displays jobs with "Active" status
- Sensitive job information (such as internal notes) is not exposed
- Application submissions are protected against CSRF attacks
- Form validation prevents malicious data in all submission forms
- User data for subscriptions and contact forms is handled securely

## Performance Optimization

- Job listings are paginated to improve load times
- Images are optimized and lazy-loaded
- Filter operations happen client-side after initial data load
- API responses are cached where appropriate
- Animations are optimized for performance
- Client-side filtering reduces server load

## Accessibility

The Careers Page follows accessibility best practices:

- All images have appropriate alt text
- Form fields have proper labels and ARIA attributes
- Color contrast meets WCAG AA standards
- Keyboard navigation is fully supported
- Screen reader compatibility is maintained
- Interactive elements have appropriate focus states

## Related Features

- [Job Distribution](./job-distribution.md): How jobs are distributed to external job boards
- [Job Board Integration](./job-board-integration.md): Integration with third-party job boards
- [Application Process](./application-process.md): End-to-end application workflow

## Troubleshooting

### Common Issues

1. **Jobs not appearing on Careers Page**
   - Verify that jobs have "Active" status
   - Check that the API endpoint is returning data correctly
   - Ensure the fallback mechanism to JSON mock data is functioning

2. **Filter options not working**
   - Ensure that departments and locations are properly set on jobs
   - Verify that filter components are receiving data correctly
   - Check if client-side filtering logic is implemented correctly

3. **Application submissions failing**
   - Check for validation errors in the application form
   - Verify that the API endpoint for submissions is functioning
   - Ensure the correct API path is being used (public endpoints)

4. **Layout issues on mobile devices**
   - Verify that responsive CSS is properly implemented
   - Check media queries for different screen sizes
   - Test on various devices and browsers 