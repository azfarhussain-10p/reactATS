# Job Draft & Publishing System

This document explains the draft and publishing system for job postings in the ATS application.

## Overview

The Job Draft & Publishing system enables recruiters and hiring managers to:

- Save jobs as drafts during creation (private, editable)
- Publish jobs when ready (public, non-editable)
- Apply different validation rules to drafts vs. published jobs
- Implement status-based permission controls for deletion

## Key Features

### Draft Mode

- **Private Visibility**: Draft jobs are only visible on the JobBoard (admin interface)
- **Minimal Validation**: Only job title is required to save as draft
- **Full Editability**: All fields can be modified while in draft status
- **Visual Indicators**: Clear "DRAFT" tag in yellow identifies draft jobs
- **Deletion**: Draft jobs can be deleted by authorized users

### Published Mode

- **Public Visibility**: Published jobs appear on both JobBoard and Careers Page
- **Full Validation**: All required fields must be completed before publishing
- **Status Management**: Published jobs can be set to Active, On-Hold, or Closed
- **Protection**: Published jobs (Active/On-Hold) cannot be deleted; they must be closed first
- **Visual Indicators**: Status badges show current state (Active, On-Hold, Closed)

## Status Workflow

1. **Draft**: Initial creation state, fully editable
2. **Active**: Published and visible to candidates
3. **On-Hold**: Published but temporarily paused
4. **Closed**: Job is no longer accepting applications

## Deletion Rules

The system enforces the following deletion rules:

| Job Status | Can Delete? | Required Action Before Deletion |
|------------|-------------|--------------------------------|
| Draft      | Yes         | None                           |
| Active     | No          | Must close job first           |
| On-Hold    | No          | Must close job first           |
| Closed     | Yes         | None                           |

## Visual Elements

- **Featured Indicator**: Purple gradient tag with animated star icon for premium listings
- **Draft Indicator**: Yellow tag for draft jobs
- **Status Indicators**: Color-coded badges (Green for Active, Orange for On-Hold, Red for Closed)

## User Interface Components

### JobBoard Page

- Draft and status indicators on job cards
- Status-specific action buttons:
  - Edit button for Draft jobs
  - Publish button for Draft jobs
  - Close button for Active/On-Hold jobs
  - Delete button (enabled only for Draft and Closed jobs)

### New Job Dialog

- "Save as Draft" button with animated styling
- "Publish Job" button with validation enforcement
- Field validation based on save mode (draft vs. publish)

## Technical Implementation

### Frontend

- Status-based rendering of UI elements and actions
- Different validation rules for draft vs. published states
- Status-appropriate action buttons

### API Layer

- Permission checks for deletion based on job status
- Validation rules enforced on both client and server
- Status tracking and transition handling

## Best Practices

- Use drafts to prepare job postings before they're ready for public view
- Close jobs instead of deleting them to maintain historical data
- Use the featured flag for high-priority positions
- Regularly review draft jobs to either publish or remove them

## Related Features

- [Job Distribution](./job-distribution.md)
- [Job Board Integration](./job-board-integration.md)
- [Careers Page](./careers-page.md)
- [Job Performance Analytics](./job-performance.md)

---

[← Back to Documentation Home](../../README.md) 