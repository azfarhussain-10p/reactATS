# Job Distribution Feature

## Overview

The Job Distribution feature allows recruiters to efficiently distribute job postings to multiple job boards from a single interface. This streamlines the job posting process, saving time and ensuring wider reach for recruitment efforts.

## Key Functionality

### Platform Management

- **Connected Job Boards:** View and manage all connected job posting platforms in one place
- **Platform Status:** Track which platforms are connected or disconnected
- **Platform Types:** Support for Free, Paid, and Premium job board options
- **Platform Metrics:** Monitor performance metrics for each platform

### Job Distribution Options

- **Distribution:** Open a dialog to selectively choose which job boards to distribute a job to, allowing for customized distribution strategies
- **Quick Publish:** Immediately distribute a job to all connected platforms with a single click
- **Distribution History:** Track where jobs have been distributed and their performance

### Performance Tracking

- **Applicant Tracking:** Monitor the number of applicants per job board
- **View & Click Metrics:** Track views and clicks per job posting
- **Cost Analysis:** Track the cost associated with each job board

## User Interface

### Platform Management Interface

The Connected Job Boards section displays all available platforms with:
- Platform name and icon
- Connection status (Connected/Disconnected)
- Edit and Delete options
- Color-coding for easier identification

### Job Distribution Interface

The Jobs Available for Distribution section presents active jobs with:
- Two action buttons:
  - **Distribution:** Opens a selective distribution dialog
  - **Quick Publish:** Automatically distributes to all connected platforms

### Distribution History

The Distribution History section displays:
- Comprehensive metrics for each distribution
- Performance statistics (views, clicks, applications)
- Status indicators (Complete/Failed)

## Technical Implementation

The Job Distribution feature is implemented in React with Material UI components. Key implementation details include:

- **State Management:** Uses React's useState and useMemo hooks for local state management
- **Platform Selection:** Implements a chip-based selection interface for choosing job boards
- **Distribution Logic:** Contains algorithms to handle both selective and quick distribution
- **Error Handling:** Includes validation to prevent distribution to non-connected platforms

## Configuration Options

Platforms can be configured with:
- Name and logo
- Type (Free, Paid, Premium)
- Connection status
- Cost
- API Key for integration
- Features and recommended use cases

## Security Considerations

- API keys for job board integrations are stored securely
- User permissions control who can manage platforms and distribute jobs

## Troubleshooting

Common issues:
- If Quick Publish doesn't work, ensure there are connected job boards available
- If metrics aren't showing, check that the distribution was successful

## Related Features

- Job Board Management
- Recruitment Analytics
- Job Posting Creation 