# ATS Application (React + TypeScript + Vite)

Welcome to the documentation for our Applicant Tracking System (ATS). This comprehensive documentation covers everything from user guides to technical implementation details.

> 📍 **New to the documentation?** Start with our [Documentation Navigation Map](./docs/NAVIGATION.md) for a complete overview of all documentation resources.

## Table of Contents

- [ATS Application (React + TypeScript + Vite)](#ats-application-react--typescript--vite)
  - [Table of Contents](#table-of-contents)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the Application](#running-the-application)
    - [Environment Variables](#environment-variables)
    - [Verifying Your Setup](#verifying-your-setup)
  - [📚 Documentation Sections](#-documentation-sections)
    - [📖 User Guides](#-user-guides)
    - [🔧 Features](#-features)
    - [🧩 Components](#-components)
    - [🔌 API Documentation](#-api-documentation)
    - [💾 Database Documentation](#-database-documentation)
  - [🖥️ Technical Information](#️-technical-information)
    - [Browser Support \& Technical Requirements](#browser-support--technical-requirements)
      - [Supported Browsers](#supported-browsers)
      - [Technical Requirements](#technical-requirements)
    - [Performance Targets](#performance-targets)
    - [Deployment Information](#deployment-information)
    - [React + TypeScript + Vite Setup](#react--typescript--vite-setup)
      - [Development Setup](#development-setup)
      - [Expanding the ESLint configuration](#expanding-the-eslint-configuration)
  - [🔍 Quick Links](#-quick-links)
    - [For New Users](#for-new-users)
    - [For Developers](#for-developers)
  - [🎯 Best Practices](#-best-practices)
  - [🆘 Support \& Troubleshooting](#-support--troubleshooting)
  - [🤝 Contributing](#-contributing)
  - [📅 Version History](#-version-history)
  - [📝 License](#-license)
  - [Features](#features)
  - [ESLint Configuration](#eslint-configuration)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/React-ATS.git
   cd React-ATS
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

The application consists of three main components:

- Frontend (React application)
- API Server (Express server)
- CV Parsing Server (Express server for document parsing)

**Recommended method:**

```bash
node run-ats.js
```

This is the primary method to run the complete application. The `run-ats.js` script:

- Automatically checks and frees required ports (3000, 3001, 5001)
- Starts all three components in the correct order
- Performs health checks to ensure services are running properly
- Sets up environment variables for each component
- Provides graceful shutdown handling
- Displays friendly URLs for all services

**Alternative methods:**

You can also run these components using npm scripts:

```bash
npm run start:all
```

**Run components individually:**

1. Start the CV Parsing Server:

   ```bash
   node server/index.js
   ```

2. Start the API Server:

   ```bash
   npm run server
   ```

3. Start the Frontend Development Server:
   ```bash
   npm run dev
   ```

The application will be available at:

- Frontend: http://localhost:3000
- API Server: http://localhost:3001
- CV Parsing Server: http://localhost:5001

### Environment Variables

Create a `.env` file in the root directory with the following content:

```
VITE_API_URL=http://localhost:3001/api
VITE_CV_PARSING_URL=http://localhost:5001
```

> **Note**: The CV parsing functionality requires the CV parsing server to be running on port 5001. If you experience a 503 error when parsing CVs, make sure the CV parsing server is running. See [CV Parsing Documentation](./docs/features/cv-parsing.md) for more details.

### Verifying Your Setup

We've included test scripts to help you verify your setup is working correctly:

**Verify All Components**

```bash
node test-app.js
```

This script checks if all components (frontend, API server, and CV parsing server) are running correctly.

**Verify CV Parsing Server Only**

```bash
node server/test-server.js
```

This script specifically checks if the CV parsing server is running and responding correctly.

If you encounter any issues, the test scripts will provide guidance on what might be wrong and how to fix it.

## 📚 Documentation Sections

### [📖 User Guides](./docs/guides/README.md)

Get started with our user-friendly guides:

- [Complete User Guide](./docs/guides/USER_GUIDE.md) - Comprehensive guide for all users
- [Quick Start Guide](./docs/guides/quick-start.md) - Get up and running quickly
- [Installation Guide](./docs/guides/installation.md) - Setup instructions
- [Configuration Guide](./docs/guides/configuration.md) - Configuration details
- [CV Parsing Guide](./docs/guides/cv-parsing-guide.md) - Guide for using CV parsing functionality

Role-specific guides:

- [Administrator Guide](./docs/guides/admin/admin-guide.md)
- [Recruiter Guide](./docs/guides/recruiter/recruiter-guide.md)
- [Hiring Manager Guide](./docs/guides/hiring-manager/hiring-manager-guide.md)
- [Interviewer Guide](./docs/guides/interviewer/interviewer-guide.md)

### [🔧 Features](./docs/features/README.md)

Explore our feature documentation:

Core Features:

- [Offline Support](./docs/features/OFFLINE_CAPABILITIES.md)
- [Authentication & Security](./docs/features/auth-flow.md)
- [Candidate Management](./docs/features/candidate-pipeline.md)
- [CV Parsing](./docs/features/cv-parsing.md) - Automated resume data extraction
- [Interview Management](./docs/features/structured-interviews.md)

Job Management:

- [Job Draft & Publishing](./docs/features/job-draft-publishing.md) - Draft and publishing workflow
- [Application Process](./docs/features/application-process.md) - Job application management
- [Status-Based Controls](./docs/features/application-process.md#application-restrictions) - Job status impact on applications

Advanced Features:

- [Analytics & Reporting](./docs/features/analytics-dashboard.md)
- [Team Collaboration](./docs/features/team-messaging.md)
- [Document Management](./docs/features/document-sharing.md)
- [Form Builder](./docs/features/dynamic-forms.md)

### [🧩 Components](./docs/components/README.md)

Detailed component documentation:

Core Components:

- [Layout Components](./docs/components/layout/Layout.md)
- [Authentication Components](./docs/components/auth/AuthCheck.md)
- [UI Components](./docs/components/ui/LoadingScreen.md)
- [Accessibility Components](./docs/components/accessibility/AccessibilityMenu.md)

Feature Components:

- [Interview Components](./docs/components/interview/StructuredInterviewKit.md)
- [Analytics Components](./docs/components/analytics/ReportBuilder.md)
- [Integration Components](./docs/components/integrations/AdvancedAnalyticsIntegration.md)
- [Form Builder Components](./docs/components/form-builder/README.md)

### [🔌 API Documentation](./docs/api/README.md)

Complete API reference:

Services:

- [API Service](./docs/api/services/api-service.md)
- [Cache Service](./docs/api/services/cache-service.md)
- [CV Parsing Service](./docs/api/services/cv-parsing-service.md) - Resume parsing service
- [Security Service](./docs/api/services/security-service.md)
- [Performance Monitor](./docs/api/services/performance-monitor-service.md)

Endpoints:

- [Authentication APIs](./docs/api/endpoints/auth/login.md)
- [Candidate APIs](./docs/api/endpoints/candidates/create.md)
- [Job APIs](./docs/api/endpoints/jobs/create.md)
- [Interview APIs](./docs/api/endpoints/interviews/schedule.md)
- [CV Parsing APIs](./docs/api/endpoints/cv-parsing/parse-cv.md) - CV extraction endpoints

### [💾 Database Documentation](./docs/technical/database-structure.md)

Complete database documentation:

Core Structure:

- [Database Structure](./docs/technical/database-structure.md) - Tables and relationships
- [Database Operations](./docs/technical/database-operations.md) - Detailed operations guide
- [Entity Relationships](./docs/technical/database-operations.md#data-relationships) - Complete ERD
- [Security Implementation](./docs/technical/database-structure.md#security-and-access-control) - Access control

Operations & Performance:

- [Common Queries](./docs/technical/database-operations.md#common-operations) - Frequently used operations
- [Performance Optimization](./docs/technical/database-operations.md#performance-optimization) - Optimization guide
- [Monitoring & Maintenance](./docs/technical/database-operations.md#monitoring--maintenance) - Database maintenance
- [Database Indexes](./docs/technical/database-operations.md#database-indexes) - Index management

Workflows:

- [Candidate Pipeline](./docs/technical/database-structure.md#workflows) - Application process
- [Interview Management](./docs/technical/database-structure.md#interview-management) - Interview workflow
- [Offer Management](./docs/technical/database-structure.md#offer-management-workflow) - Offer process

## 🖥️ Technical Information

### Browser Support & Technical Requirements

#### Supported Browsers

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

#### Technical Requirements

- Internet connectivity is required for core functionality
- Limited offline capabilities for form submissions and data viewing
- Email service availability required for notifications
- Administrative users should have basic technical proficiency
- Regular system maintenance windows scheduled monthly (typically last Sunday, 2-4 AM UTC)

### Performance Targets

- Page load times under 2 seconds
- Search results returned within 1 second
- Bulk operations optimized for large datasets
- Concurrent user support scaled based on tenant size

### Deployment Information

- Cloud-based hosting with containerization
- CI/CD pipeline for automated testing and deployment
- Separate environments for development, staging, and production
- Automated daily backups with 30-day retention
- Disaster recovery plan with RPO < 24 hours and RTO < 4 hours

### React + TypeScript + Vite Setup

This application is built with React, TypeScript and Vite. It provides the following features:

- Fast HMR (Hot Module Replacement)
- TypeScript integration
- ESLint configuration

#### Development Setup

To get started with development:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

#### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```

#### Code Formatting with Prettier

The ATS application uses Prettier for consistent code formatting. Key features include:

- Automatic code formatting on save (with editor integration)
- Consistent style across the entire codebase
- Integration with ESLint to avoid conflicting rules

**Usage:**

```bash
# Format all files
npm run format

# Check if files are properly formatted
npm run format:check
```

For more details, see the [Prettier Integration Guide](./docs/prettier-guide.md).

## 🔍 Quick Links

### For New Users

1. Start with the [Quick Start Guide](./docs/guides/quick-start.md)
2. Read the [User Guide](./docs/guides/USER_GUIDE.md)
3. Check [Common Issues](./docs/guides/troubleshooting/common-issues.md)
4. Review [Best Practices](./docs/guides/best-practices/security.md)

### For Developers

1. Review [API Documentation](./docs/api/README.md)
2. Explore [Component Documentation](./docs/components/README.md)
3. Understand [Feature Implementation](./docs/features/README.md)
4. Check [Contributing Guidelines](./docs/guides/contributing/guidelines.md)
5. Review [Prettier Integration Guide](./docs/prettier-guide.md)

## 🎯 Best Practices

- [Security Guidelines](./docs/guides/best-practices/security.md)
- [Performance Optimization](./docs/guides/best-practices/performance.md)
- [Accessibility Standards](./docs/guides/best-practices/accessibility.md)
- [Data Management](./docs/guides/best-practices/data-management.md)

## 🆘 Support & Troubleshooting

- [Common Issues](./docs/guides/troubleshooting/common-issues.md)
- [Error Messages](./docs/guides/troubleshooting/error-messages.md)
- [FAQ](./docs/guides/troubleshooting/faq.md)
- [Support Guide](./docs/guides/troubleshooting/support-guide.md)

## 🤝 Contributing

We welcome contributions! Please review:

- [Documentation Style Guide](./docs/guides/contributing/style-guide.md)
- [Contributing Guidelines](./docs/guides/contributing/guidelines.md)
- [Documentation Templates](./docs/guides/contributing/templates.md)

## 📅 Version History

This documentation is maintained alongside the ATS application. For the latest updates, check our [changelog](./docs/CHANGELOG.md).

## 📝 License

This documentation is covered under the same license as the ATS application. See [LICENSE](./LICENSE) for more details.

## Features

- **Modern React Architecture**: Built with React 18, TypeScript, and Material UI v5
- **Comprehensive ATS Functionality**: Complete candidate management and hiring workflow
- **Job Distribution System**: Distribute job postings to multiple platforms with a single click
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Full theme support with easy customization
- **Authentication & Authorization**: Complete user management with role-based access
- **CV Parsing**: Automated extraction of candidate information from resume files
- **Multi-format Support**: Parse PDF, DOC, DOCX, and TXT files
- **Dual-layer Parsing**: Server-side parsing with client-side fallback

## ESLint Configuration

The project uses ESLint to maintain code quality and consistency. We've added a `.eslintrc.json` file that disables certain rules to allow the project to build without errors.

To fix ESLint issues:

1. Run the fix script: `npm run lint:fix`
2. For a complete check: `npm run lint:check`

If you want to properly fix all issues, follow these best practices:

- Remove unused imports and variables
- Replace `any` types with appropriate TypeScript types
- Add missing dependencies to React hooks dependency arrays
- Move lexical declarations outside of case blocks
- Follow React's fast refresh guidelines by separating component exports from utility functions
