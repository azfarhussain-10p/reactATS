# ATS Documentation Navigation Map

## 📍 Quick Access

- [Main Documentation](../README.md)
- [User Guide](./guides/USER_GUIDE.md)
- [API Reference](./api/README.md)
- [Database Guide](./technical/database-structure.md)

## 📚 Documentation Structure

```
docs/
├── README.md                  # Main documentation entry point
├── NAVIGATION.md             # This navigation map
├── CHANGELOG.md              # Version history
│
├── api/                      # API Documentation
│   ├── README.md            # API overview
│   ├── services/            # Service documentation
│   └── endpoints/           # Endpoint documentation
│       ├── auth/
│       ├── candidates/
│       ├── jobs/
│       └── interviews/
│
├── components/              # Component Documentation
│   ├── README.md           # Components overview
│   ├── layout/             # Layout components
│   ├── auth/               # Authentication components
│   ├── ui/                 # UI components
│   └── features/           # Feature-specific components
│
├── features/               # Feature Documentation
│   ├── README.md          # Features overview
│   ├── auth-flow.md       # Authentication flow
│   ├── candidate-pipeline.md
│   ├── cv-parsing.md      # CV parsing system
│   └── OFFLINE_CAPABILITIES.md
│
├── guides/                 # User Guides
│   ├── README.md          # Guides overview
│   ├── USER_GUIDE.md      # Main user guide
│   ├── quick-start.md     # Quick start guide
│   ├── admin/             # Admin guides
│   ├── recruiter/         # Recruiter guides
│   └── best-practices/    # Best practices
│
└── technical/             # Technical Documentation
    ├── database-structure.md
    └── database-operations.md
```

## 🔍 Documentation by Role

### For End Users

1. [Quick Start Guide](./guides/quick-start.md)
2. [User Guide](./guides/USER_GUIDE.md)
3. [Troubleshooting](./guides/troubleshooting/common-issues.md)

### For Administrators

1. [Admin Guide](./guides/admin/admin-guide.md)
2. [System Configuration](./guides/admin/system-config.md)
3. [Security Guidelines](./guides/best-practices/security.md)

### For Developers

1. [API Documentation](./api/README.md)
2. [Database Structure](./technical/database-structure.md)
3. [Component Guide](./components/README.md)
4. [Prettier Integration Guide](./prettier-guide.md)

### For DevOps

1. [Database Operations](./technical/database-operations.md)
2. [Performance Guide](./guides/best-practices/performance.md)
3. [Monitoring Guide](./guides/admin/monitoring.md)

## 🔄 Common Workflows

### Candidate Management

1. [Candidate Pipeline](./features/candidate-pipeline.md)
2. [CV Parsing](./features/cv-parsing.md)
3. [Interview Process](./features/structured-interviews.md)
4. [Offer Management](./features/offer-management.md)

### Job Management

1. [Job Posting](./guides/recruiter/job-posting.md)
2. [Applicant Tracking](./features/applicant-tracking.md)
3. [Analytics](./features/analytics-dashboard.md)

### System Administration

1. [User Management](./guides/admin/user-management.md)
2. [Access Control](./guides/admin/access-control.md)
3. [System Maintenance](./guides/admin/maintenance.md)

## 🔗 Cross-Reference Index

### Authentication & Security

- [Auth Flow](./features/auth-flow.md)
- [Security Best Practices](./guides/best-practices/security.md)
- [Auth Components](./components/auth/README.md)
- [Auth APIs](./api/endpoints/auth/README.md)

### Database & Performance

- [Database Structure](./technical/database-structure.md)
- [Database Operations](./technical/database-operations.md)
- [Performance Optimization](./technical/performance.md)
- [Monitoring](./guides/admin/monitoring.md)

### User Interface

- [UI Components](./components/ui/README.md)
- [Accessibility](./guides/best-practices/accessibility.md)
- [Form Builder](./features/dynamic-forms.md)
- [Layout System](./components/layout/README.md)

## 📝 Contributing to Documentation

- [Style Guide](./guides/contributing/style-guide.md)
- [Documentation Templates](./guides/contributing/templates.md)
- [Contribution Process](./guides/contributing/guidelines.md)

# Documentation Navigation Map

This document provides a comprehensive overview of all documentation resources available for the ATS application.

## Quick Start

If you're new to the documentation:

1. [User Guide](./guides/USER_GUIDE.md) - Comprehensive user guide for all roles
2. [Quick Start Guide](./guides/quick-start.md) - Get up and running quickly
3. [Feature Overview](./features/README.md) - Explore all available features
4. [API Documentation](./api/README.md) - Understanding the API architecture
5. [Component Library](./components/README.md) - UI component documentation

## Documentation Structure

The documentation is organized into the following sections:

### User Guides

- [Complete User Guide](./guides/USER_GUIDE.md) - Comprehensive guide for all users
- [Quick Start Guide](./guides/quick-start.md) - Get up and running quickly
- [Installation Guide](./guides/installation.md) - Setup instructions
- [Configuration Guide](./guides/configuration.md) - Configuration options

Role-specific guides:

- [Administrator Guide](./guides/admin/admin-guide.md)
- [Recruiter Guide](./guides/recruiter/recruiter-guide.md)
- [Hiring Manager Guide](./guides/hiring-manager/hiring-manager-guide.md)
- [Interviewer Guide](./guides/interviewer/interviewer-guide.md)

### Feature Documentation

Core Features:

- [Job Draft & Publishing](./features/job-draft-publishing.md) - Draft and publishing system
- [Application Process](./features/application-process.md) - End-to-end application workflow
- [Status-Based Controls](./features/application-process.md#application-restrictions) - Job status impact on applications
- [Offline Support](./features/OFFLINE_CAPABILITIES.md) - Working without internet
- [Authentication & Security](./features/auth-flow.md) - Identity and access management
- [Candidate Pipeline](./features/candidate-pipeline.md) - Applicant tracking workflow
- [CV Parsing](./features/cv-parsing.md) - Resume data extraction
- [Interview Management](./features/structured-interviews.md) - Structured interview process

Advanced Features:

- [Analytics Dashboard](./features/analytics-dashboard.md) - Recruitment metrics
- [Job Board Integration](./features/job-board-integration.md) - External job posting
- [Document Sharing](./features/document-sharing.md) - File management
- [Dynamic Forms](./features/dynamic-forms.md) - Custom form builder

### API Documentation

- [API Overview](./api/README.md) - API architecture and principles
- [Authentication APIs](./api/endpoints/auth/login.md) - Identity management
- [Job APIs](./api/endpoints/jobs/create.md) - Job management
- [Candidate APIs](./api/endpoints/candidates/create.md) - Candidate management
- [Interview APIs](./api/endpoints/interviews/schedule.md) - Interview scheduling

### Component Documentation

- [Component Overview](./components/README.md) - Component architecture
- [Layout Components](./components/layout/Layout.md) - Page structure
- [Form Components](./components/form/FormField.md) - Data collection
- [Interview Components](./components/interview/StructuredInterviewKit.md) - Interview tools
- [Analytics Components](./components/analytics/ReportBuilder.md) - Data visualization

### Technical Documentation

- [Database Structure](./technical/database-structure.md) - Data model
- [Security Implementation](./technical/security.md) - Security measures
- [Performance Optimization](./technical/performance.md) - Speed and reliability
- [Integration Framework](./technical/integrations.md) - Third-party connections
- [Prettier Integration Guide](./prettier-guide.md) - Code formatting standards
- [ESLint Configuration](../README.md#eslint-configuration) - Code quality standards

## Feature Guides by User Role

### For Recruiters

- [Job Creation & Management](./features/job-draft-publishing.md) - Create and manage job listings
- [Candidate Sourcing](./features/candidate-pipeline.md#sourcing) - Find qualified candidates
- [CV Parsing & Processing](./features/cv-parsing.md) - Extract resume data
- [Interview Scheduling](./features/interview-scheduling.md) - Coordinate interviews
- [Applicant Tracking](./features/candidate-pipeline.md) - Track candidate progress

### For Hiring Managers

- [Job Requisition](./features/job-distribution.md#requisition) - Request new positions
- [Candidate Review](./features/candidate-pipeline.md#review) - Evaluate applicants
- [Team Collaboration](./features/team-messaging.md) - Collaborate with recruiters
- [Hiring Decisions](./features/decision-making.md) - Select final candidates

### For Administrators

- [User Management](./guides/admin/user-management.md) - Manage system users
- [System Configuration](./guides/admin/system-config.md) - Configure system settings
- [Integration Setup](./guides/admin/integration-setup.md) - Connect external services
- [Security Controls](./guides/admin/security-controls.md) - Manage security settings

## Common Tasks

- [Creating a Job Posting](./guides/USER_GUIDE.md#creating-a-new-job-posting) - Post new positions
- [Managing Job Drafts](./features/job-draft-publishing.md#draft-mode) - Work with draft jobs
- [Processing CV/Resumes](./features/cv-parsing.md) - Extract resume data
- [Reviewing Applications](./guides/USER_GUIDE.md#candidate-management) - Process applications
- [Scheduling Interviews](./guides/USER_GUIDE.md#interview-management) - Set up interviews
- [Generating Reports](./guides/USER_GUIDE.md#reporting-and-analytics) - Create custom reports
