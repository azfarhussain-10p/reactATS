# CV Parsing Service

## Overview

The CV Parsing Service provides functionality to extract structured information from candidate CV/resume files. The service implements a dual-layer approach with server-side parsing as the primary method and client-side parsing as a fallback mechanism.

## Architecture

![CV Parsing Architecture](../../assets/cv-parsing-architecture.png)

The CV Parsing Service consists of two main components:

1. **Server-side Parsing Service**

   - Implemented as a standalone Express server
   - Handles file parsing for PDF, DOC, DOCX, and TXT formats
   - Offers better parsing accuracy and capabilities
   - Available through the CV Parsing API

2. **Client-side Parsing Service**
   - Implemented in the browser
   - Provides fallback when server-side parsing is unavailable
   - Limited to simpler parsing capabilities

## Service Files

| File                               | Description                                                       |
| ---------------------------------- | ----------------------------------------------------------------- |
| `src/services/CVParsingService.ts` | Main service for CV parsing with fallback mechanism               |
| `src/services/CVParsingAPI.ts`     | API client for communicating with the server-side parsing service |
| `server/index.js`                  | Server-side CV parsing implementation                             |

## Service Classes

### CVParsingService

Main service that coordinates CV parsing, utilizing both server-side and client-side capabilities.

```typescript
class CVParsingService {
  // Parse a CV file using the best available method (server-side preferred)
  public static async parseCV(file: File): Promise<ParsedCVData>;

  // Parse a CV file using client-side methods only
  public static async parseClientSide(file: File): Promise<ParsedCVData>;

  // Check if the CV file is supported
  public static isSupportedFile(file: File): boolean;
}
```

### CVParsingAPI

API client for communicating with the server-side parsing service.

```typescript
class CVParsingAPI {
  // Send a CV file to the server for parsing
  public static async parseCV(file: File): Promise<ParsedCVData>;

  // Check if server-side parsing is available
  public static async isAvailable(): Promise<boolean>;
}
```

## Data Model

### ParsedCVData Interface

```typescript
interface ParsedCVData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

interface Experience {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}
```

## Usage Examples

### Basic Usage

```typescript
import CVParsingService from '../services/CVParsingService';

// In a component or form handler
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file && CVParsingService.isSupportedFile(file)) {
    try {
      const parsedData = await CVParsingService.parseCV(file);
      // Use parsedData to populate form fields
      setFormData({
        firstName: parsedData.firstName,
        lastName: parsedData.lastName,
        email: parsedData.email,
        phone: parsedData.phone,
        // ... other fields
      });
    } catch (error) {
      console.error('Failed to parse CV:', error);
      // Handle error
    }
  } else {
    // Handle unsupported file
  }
};
```

### Using Server-Side Parsing Directly

```typescript
import CVParsingAPI from '../services/CVParsingAPI';

const parseWithServer = async (file: File) => {
  try {
    // Check if server parsing is available
    const isServerAvailable = await CVParsingAPI.isAvailable();

    if (isServerAvailable) {
      const parsedData = await CVParsingAPI.parseCV(file);
      return parsedData;
    } else {
      throw new Error('Server-side parsing unavailable');
    }
  } catch (error) {
    console.error('Error using server parsing:', error);
    throw error;
  }
};
```

## Error Handling

The service implements robust error handling:

1. **Server Connection Errors**

   - Automatically falls back to client-side parsing
   - Logs error details for debugging

2. **File Format Errors**

   - Validates file formats before processing
   - Returns clear error messages for unsupported formats

3. **Parsing Errors**
   - Catches and logs parsing exceptions
   - Returns partial data when possible

## Configuration

### Environment Variables

| Variable              | Description                   | Default                 |
| --------------------- | ----------------------------- | ----------------------- |
| `VITE_CV_PARSING_URL` | URL for the CV parsing server | `http://localhost:5001` |

### Server Configuration

Server-side parsing service can be configured in `server/index.js`:

- **Port**: Defaults to 5001, configurable via `PORT` environment variable
- **File Size Limit**: 10MB maximum, configurable in multer options
- **Supported Formats**: PDF, DOC, DOCX, TXT
- **CORS**: Enabled for cross-origin requests

## Integration with Other Services

The CV Parsing Service integrates with:

- **Candidate Registration**: Auto-populates registration forms with parsed data
- **Profile Management**: Updates candidate profiles with resume information
- **Search & Filtering**: Enables skills-based candidate searching
