# Comprehensive User Guide for the Multi-tenant ATS Application

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Features](#core-features)
4. [User Roles and Permissions](#user-roles-and-permissions)
5. [Recruiting Workflow](#recruiting-workflow)
6. [Job Management](#job-management)
7. [Candidate Management](#candidate-management)
8. [Interview Management](#interview-management)
9. [Assessment Management](#assessment-management)
10. [Reporting and Analytics](#reporting-and-analytics)
11. [Advanced Features](#advanced-features)
12. [Administrator Guide](#administrator-guide)
13. [Technical Documentation](#technical-documentation)
14. [Appendix](#appendix)

---

## Introduction

### Welcome to Your New ATS

Welcome to your comprehensive Applicant Tracking System (ATS), an enterprise-grade solution designed to streamline and optimize your entire recruitment process. This multi-tenant SaaS application combines powerful features with an intuitive interface to help your organization attract, evaluate, and hire top talent efficiently.

### Key Benefits

- **Centralized Recruitment**: Manage your entire hiring pipeline in one place
- **Time Savings**: Automate repetitive tasks and focus on high-value activities
- **Data-Driven Decisions**: Access analytics and reports to optimize your recruitment strategy
- **Enhanced Collaboration**: Enable seamless teamwork between recruiters, hiring managers, and interviewers
- **Improved Candidate Experience**: Provide a smooth, professional application process
- **Compliance**: Maintain consistent hiring practices and documentation

### System Architecture

Our ATS is built on a modern technology stack:

- **Frontend**: React.js with Material-UI for a responsive, intuitive interface
- **Backend**: Node.js with RESTful API architecture
- **Database**: PostgreSQL with multi-tenant design
- **Security**: JWT-based authentication, role-based access control
- **Integrations**: Job boards, email services, calendar systems, and assessment platforms

---

## Getting Started

### Accessing the System

1. Navigate to your organization's custom subdomain: `https://[your-company].ats-app.com`
2. Enter your email address and password
3. For first-time login, you'll be prompted to change your password and complete your profile

### User Interface Overview

The ATS features a clean, intuitive interface organized into these main sections:

- **Dashboard**: Customizable overview of key metrics and activities
- **Jobs**: Create and manage job postings
- **Candidates**: Search and manage candidate profiles
- **Applications**: View and process applications for specific positions
- **Interviews**: Schedule and manage interviews
- **Reports**: Access analytics and generate reports
- **Settings**: Configure system preferences and integrations

### Navigation Basics

- **Main Menu**: Located on the left sidebar, providing access to all major sections
- **Quick Actions**: Available from the dashboard for common tasks
- **Search**: Global search function accessible from the top bar
- **User Menu**: Access your profile, preferences, and logout option
- **Notifications**: Real-time alerts for important activities and tasks

---

## Core Features

### Dashboard

Your personalized dashboard provides at-a-glance insights into your recruitment activities:

- **Pipeline Overview**: Visual representation of candidates at each stage
- **Recent Activity**: Latest actions in the system
- **Key Metrics**: Customizable widgets showing important statistics
- **Tasks**: Upcoming interviews, pending reviews, and action items
- **Quick Links**: Shortcuts to frequently used features

### Customization Options

1. Click the "Customize" button in the top-right corner of the dashboard
2. Add, remove, or rearrange widgets by dragging and dropping
3. Configure each widget's settings to display relevant information
4. Save your layout for future sessions

---

## User Roles and Permissions

The ATS supports five primary user roles, each with specific permissions and access levels:

### Admin

- Complete system access and configuration control
- User management and role assignment
- Tenant settings and customization
- Access to all data and features

### Recruiter

- Create and manage job postings
- Review and process applications
- Schedule interviews
- Manage candidate communications
- Access to reporting features

### Hiring Manager

- Review applications for their department
- Participate in interview processes
- Provide feedback and evaluations
- View department-specific metrics

### Interviewer

- View assigned interview schedules
- Access candidate information for interviews
- Submit interview feedback
- Limited access to the candidate pipeline

### Candidate (External Portal)

- Apply for positions
- Update personal information
- Track application status
- Schedule interviews
- Complete assessments

---

## Recruiting Workflow

### Standard Recruitment Pipeline

The ATS supports a customizable recruitment workflow, with a default pipeline including these stages:

1. **Applied**: Initial application received
2. **Screening**: Resume review and initial evaluation
3. **Interview**: Various interview stages
4. **Assessment**: Skills and aptitude testing
5. **Offer**: Offer extension and negotiation
6. **Hired**: Successful completion of the process

### Customizing Your Workflow

Administrators can customize the recruitment pipeline by:
1. Navigating to Settings → Recruitment Pipeline
2. Adding, removing, or reordering stages
3. Creating department-specific workflows
4. Defining automatic actions at each stage
5. Setting up approval requirements

---

## Job Management

### Creating a New Job Posting

1. Navigate to the Jobs section and click "Create New Job"
2. Complete the required fields:
   - Job title and department
   - Job description and requirements
   - Location and work type (in-office, remote, hybrid)
   - Salary range and benefits (optional)
   - Required skills and experience level
3. Select the approval workflow (if applicable)
4. Choose job board integrations for external posting
5. Set the application form requirements
6. Configure screening questions (optional)
7. Review and publish (or save as draft)

### Job Posting Templates

Save time by creating templates for similar positions:
1. Create a job posting as normal
2. Click "Save as Template" before publishing
3. Give your template a name and category
4. Access templates when creating new positions

### Managing Active Jobs

Monitor and manage your active job postings:
- View applicant metrics and pipeline status
- Edit or update posting details
- Extend or close application periods
- Clone positions for similar roles
- Archive jobs for future reference

### Job Approval Workflows

For organizations requiring approval processes:
1. Create job posting and submit for review
2. System notifies approvers based on configured workflow
3. Approvers can review and approve/reject with comments
4. Once fully approved, job can be published
5. Track approval status in real-time

---

## Candidate Management

### Candidate Sources

The ATS supports multiple candidate sourcing methods:
- Direct applications through job postings
- Manual entry by recruiters
- Resume parsing and bulk import
- Employee referrals
- Integration with external job boards
- Talent pool and previous applicants

### Candidate Profiles

Comprehensive candidate profiles include:
- Contact information and availability
- Work experience and education history
- Skills and certifications
- Document storage (resumes, portfolios, etc.)
- Application history within your organization
- Notes and feedback from team members
- Tags for easy categorization

### Candidate Search and Filtering

Quickly find candidates using the advanced search:
1. Navigate to the Candidates section
2. Use filters for skills, experience, location, etc.
3. Save common searches for future use
4. Create talent pools based on search criteria

### Talent Pools

Create and manage groups of candidates for future opportunities:
1. Navigate to Candidates → Talent Pools
2. Create a new pool with specific criteria
3. Add candidates manually or via saved searches
4. Use pools for targeted campaigns or quick access
5. Share pools with team members for collaboration

---

## Interview Management

### Interview Types

Configure different interview formats to match your process:
- Phone/Video Screening
- Technical Assessment
- Behavioral Interview
- Panel Interview
- Final/Executive Interview

### Scheduling Interviews

1. From an application, click "Schedule Interview"
2. Select interview type and participants
3. Choose available time slots or use calendar integration
4. Add interview details (location, video link, etc.)
5. System sends invitations to all participants

### Calendar Integrations

Connect with popular calendar systems:
- Google Calendar
- Microsoft Outlook
- Apple Calendar
- Configure two-way sync for real-time updates

### Interview Preparation

Interviewers can prepare using these tools:
- Access to candidate profile and application
- Structured interview kits with recommended questions
- Previous interview feedback (if applicable)
- Evaluation criteria and scoring guidelines

### Feedback Collection

After interviews, collect standardized feedback:
1. Interviewers receive automated reminders
2. Complete evaluation forms based on defined criteria
3. Provide overall assessment and recommendation
4. Add detailed notes and observations
5. Submit feedback for recruiting team review

---

## Assessment Management

### Assessment Types

Integrate various assessment tools to evaluate candidates:
- Technical/Coding Assessments
- Personality and Aptitude Tests
- Skills-based Evaluations
- Video Interviews
- Custom Assessments

### Creating Assessment Templates

1. Navigate to Settings → Assessments
2. Select assessment type and provider
3. Configure assessment parameters
4. Set scoring criteria and passing thresholds
5. Associate with job types or departments

### Sending Assessments

1. From a candidate's application, click "Send Assessment"
2. Select appropriate assessment template
3. Customize instructions if needed
4. Set deadline for completion
5. System sends invitation to candidate

### Reviewing Results

1. Assessment results are automatically imported
2. View scores, percentiles, and detailed breakdowns
3. Compare against job requirements
4. Add results to candidate evaluation
5. Use data for making informed decisions

---

## Reporting and Analytics

### Standard Reports

Access built-in reports for key recruitment metrics:
- Time-to-fill by position and department
- Source effectiveness analysis
- Candidate pipeline metrics
- Interview-to-offer ratios
- Offer acceptance rates
- Diversity and inclusion metrics
- Recruiter performance statistics

### Custom Reports

Create tailored reports for specific needs:
1. Navigate to Reports → Custom Reports
2. Select data points and filters
3. Choose visualization type (tables, charts, etc.)
4. Set scheduling and distribution options
5. Save for future use

### Analytics Dashboard

Interactive analytics provide deeper insights:
1. Navigate to Reports → Analytics Dashboard
2. View trend analyses and forecasting
3. Drill down into specific metrics
4. Export data for external analysis
5. Share insights with stakeholders

### Scheduled Reports

Automate report distribution:
1. Configure report parameters and recipients
2. Set frequency (daily, weekly, monthly)
3. Choose delivery format (PDF, Excel, etc.)
4. Add custom messages or highlights
5. Manage all scheduled reports from a central dashboard

---

## Advanced Features

### Resume Parsing

Automate candidate data extraction:
1. Upload resume or have candidate submit it
2. System extracts key information (experience, education, skills)
3. Creates or updates candidate profile automatically
4. Highlights matching skills for specific positions
5. Allows manual verification and editing

### Email and Communication Management

Streamline candidate communications:
1. Create email templates for common scenarios
2. Send personalized messages directly from the ATS
3. Track email opens, clicks, and responses
4. Set up automated communication workflows
5. Maintain a complete history of all interactions

### Document Sharing

Securely share documents with team members:
1. Upload documents to candidate or job profiles
2. Set access permissions for various user roles
3. Track document views and downloads
4. Set expiration dates for sensitive information
5. Maintain version control for updated documents

### Skills Gap Analysis

Evaluate candidates against job requirements:
1. System compares candidate skills to job requirements
2. Identifies matches and gaps in qualifications
3. Provides percentage match scores
4. Recommends additional assessments if needed
5. Helps prioritize candidates based on skill alignment

### Email Campaigns

Send targeted messages to candidate groups:
1. Select target audience from candidates or talent pools
2. Create campaign content or use templates
3. Schedule delivery time
4. Monitor engagement metrics
5. Follow up based on candidate responses

---

## Administrator Guide

### Tenant Configuration

Set up your organization's environment:
1. Configure company profile and branding
2. Set up departments and locations
3. Define custom fields and data structures
4. Configure workflow and approval processes
5. Set system-wide preferences and defaults

### User Management

Manage user accounts and permissions:
1. Create new user accounts
2. Assign appropriate roles and permissions
3. Manage department assignments
4. Configure email notifications preferences
5. Monitor user activity and system usage

### Integration Management

Connect with external systems and services:
1. Set up job board integrations (LinkedIn, Indeed, etc.)
2. Configure email service providers
3. Connect calendar systems for scheduling
4. Integrate assessment platforms
5. Set up single sign-on (SSO) if applicable

### Compliance Settings

Configure settings to ensure regulatory compliance:
1. Set data retention policies
2. Configure equal employment opportunity tracking
3. Set up consent management for candidates
4. Configure GDPR/CCPA compliance settings
5. Establish audit trails for key activities

---

## Technical Documentation

### System Requirements

For optimal performance, ensure your environment meets these specifications:

**Supported Browsers:**
- Google Chrome (latest 2 versions)
- Mozilla Firefox (latest 2 versions)
- Microsoft Edge (latest 2 versions)
- Safari (latest 2 versions)

**Mobile Devices:**
- iOS (latest 2 versions)
- Android (latest 2 versions)

### API Documentation

The ATS provides a comprehensive REST API for integrations:
- Authentication using JWT tokens
- Complete CRUD operations for all major entities
- Webhook support for real-time events
- Rate limiting and security features
- Detailed documentation available at `https://[your-subdomain].ats-app.com/api-docs`

### Data Security

The system employs multiple layers of security:
- Data encryption in transit (HTTPS/TLS)
- Data encryption at rest
- Role-based access control
- Multi-tenant data isolation
- Regular security audits and penetration testing
- Compliance with SOC 2, GDPR, and other standards

### Backup and Recovery

Data protection measures include:
- Automated daily backups
- Point-in-time recovery options
- Geo-redundant storage
- 30-day backup retention (configurable)
- Disaster recovery procedures with 99.9% uptime SLA

---

## Appendix

### Glossary of Terms

- **Applicant**: An individual who has applied for a position
- **Candidate**: An individual in the recruitment database, may or may not have applied
- **Requisition**: Formal request to fill a position
- **Time-to-Fill**: Duration from job posting to acceptance
- **Time-to-Hire**: Duration from application to acceptance
- **Talent Pool**: Group of candidates with similar qualifications
- **Onboarding**: Process of integrating new hires

### Keyboard Shortcuts

Increase productivity with these shortcuts:
- `Alt+N`: Create new (context-sensitive)
- `Alt+S`: Save current item
- `Alt+F`: Open search
- `Alt+D`: Go to dashboard
- `Alt+J`: Go to jobs
- `Alt+C`: Go to candidates
- `Alt+I`: Go to interviews
- `Alt+R`: Go to reports

### Troubleshooting Common Issues

**Login Problems:**
- Verify your email and password
- Check for caps lock and typing errors
- Use the "Forgot Password" option if needed
- Contact your administrator for account issues

**Performance Issues:**
- Clear browser cache and cookies
- Try a different browser
- Check your internet connection
- Contact support if problems persist

### Support Resources

- **Help Center**: Comprehensive knowledge base at `https://help.ats-app.com`
- **Video Tutorials**: Step-by-step guides at `https://learn.ats-app.com`
- **Support Ticket**: Submit issues through the Help menu in the application
- **Phone Support**: Available for Enterprise plans at +1-800-ATS-HELP
- **Training Webinars**: Weekly sessions for new features and best practices

---

## System Database Structure

For technical administrators and developers, here's an overview of the database structure:

### Core Tables
- **tenants**: Organization information and subscription details
- **users_ats**: User accounts with authentication and role information
- **departments**: Organizational structure within each tenant

### Job Management
- **jobs**: Job postings and descriptions
- **job_skills**: Skills required for each position
- **job_locations**: Work locations for positions
- **job_approval_workflows**: Approval processes for job postings

### Candidate Management
- **candidates**: Core candidate information
- **candidate_skills**: Skills possessed by candidates
- **candidate_education**: Educational background
- **candidate_experience**: Work history
- **candidate_certifications**: Professional certifications
- **candidate_documents**: Resumes and supporting materials

### Recruitment Process
- **applications**: Candidate applications to jobs
- **application_stages**: Customizable recruitment pipeline
- **application_stage_history**: Stage transitions and history
- **interviews**: Scheduled interviews
- **interview_participants**: Interviewers and observers
- **interview_feedback**: Evaluations and recommendations
- **offers**: Employment offers and terms

### Communication
- **communication_templates**: Email and message templates
- **communications**: Message history with candidates
- **email_campaigns**: Bulk communication initiatives

### Assessment
- **assessment_providers**: Integration with testing platforms
- **assessment_templates**: Configured evaluations
- **application_assessments**: Candidate test results

This database structure supports the full functionality of the ATS while maintaining proper data isolation between tenants.

---

*This user guide is designed to provide a comprehensive overview of your ATS application. For specific questions or assistance, please contact your system administrator or our support team.* 