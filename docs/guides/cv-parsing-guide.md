# CV Parsing User Guide

This guide provides step-by-step instructions for working with the CV parsing functionality in the ATS application.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Using CV Parsing During Candidate Registration](#using-cv-parsing-during-candidate-registration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Advanced Usage](#advanced-usage)

## Overview

The CV parsing feature automatically extracts relevant information from candidate resumes/CVs, saving time and reducing manual data entry errors. It supports multiple file formats including PDF, DOC, DOCX, and TXT.

## Prerequisites

- ATS application must be properly installed and configured
- CV Parsing Server must be running (typically on port 5001)
- Proper environment variable setup (`VITE_CV_PARSING_URL=http://localhost:5001`)
- Supported browsers: Chrome, Firefox, Edge, Safari (latest 2 versions)

## Using CV Parsing During Candidate Registration

### Step 1: Access the Candidate Registration Form

1. Log in to the ATS application
2. Navigate to the "Candidates" section
3. Click on "Add New Candidate" button

### Step 2: Upload a CV/Resume

1. In the registration form, locate the "Upload CV" section
2. Click on the file upload button or drag and drop a file into the designated area
3. Select a CV file (supported formats: PDF, DOC, DOCX, TXT)
4. The system will begin processing the file automatically

![CV Upload Interface](../assets/cv-upload-interface.png)

### Step 3: Review Extracted Information

1. After processing, the system will auto-populate form fields with extracted information:

   - Personal details (name, email, phone)
   - Skills
   - Education history
   - Work experience
   - Social profiles (LinkedIn, GitHub)

2. Review the extracted information for accuracy

3. Make any necessary corrections or additions to the data

### Step 4: Complete Registration

1. Fill in any remaining required fields that couldn't be extracted from the CV
2. Click "Save" or "Submit" to complete the registration process

## Troubleshooting

### Common Issues

#### "Failed to load resource: the server responded with a status of 503"

**Problem**: The CV parsing server is not running or not accessible.

**Solution**:

1. Ensure the CV parsing server is running (`node server/index.js`)
2. Check that port 5001 is not being used by another application
3. Verify the environment variable is set correctly (`VITE_CV_PARSING_URL=http://localhost:5001`)

#### "Unsupported file type"

**Problem**: The uploaded file format is not supported.

**Solution**:

1. Ensure you're uploading a supported file format (PDF, DOC, DOCX, or TXT)
2. Convert your file to a supported format if necessary

#### "Unable to extract information"

**Problem**: The system couldn't parse meaningful data from the CV.

**Solution**:

1. Ensure the CV contains text content (not just images)
2. Try a different format if possible (e.g., convert a scanned PDF to a text-based PDF)
3. Manually enter the information

#### Client-side fallback activated

**Problem**: Server-side parsing is unavailable, system is using less accurate client-side parsing.

**Solution**:

1. Check if the CV parsing server is running
2. Review server logs for any errors
3. Restart the CV parsing server if necessary

## Best Practices

### CV Format Recommendations

For best parsing results:

1. **Use text-based documents** rather than scanned images
2. **Structure the CV clearly** with standard sections (Education, Experience, Skills)
3. **Avoid complex formatting** like tables, columns, or custom layouts
4. **Include standard contact information** in a clear format
5. **List skills explicitly** rather than embedding them in paragraphs

### Data Verification

Always:

1. Review all extracted information for accuracy
2. Pay special attention to dates and contact details
3. Verify that skills were correctly identified
4. Check that education and experience entries are properly separated

## Advanced Usage

### Using CV Parsing API Directly

For developers who need to integrate CV parsing into other components:

```javascript
import CVParsingService from '../services/CVParsingService';

// Check if a file is supported
const isSupported = CVParsingService.isSupportedFile(file);

// Parse a CV file
const parsedData = await CVParsingService.parseCV(file);

// Access specific fields
const { firstName, lastName, email, skills } = parsedData;
```

### Server-side vs. Client-side Parsing

The system uses a dual-layer approach:

1. **Server-side parsing** (primary method):

   - More powerful and accurate
   - Handles complex documents better
   - Requires the CV parsing server to be running

2. **Client-side parsing** (fallback method):
   - Activated automatically when server-side parsing is unavailable
   - Limited to simpler parsing capabilities
   - No external service dependencies

The system will automatically choose the best available method.
