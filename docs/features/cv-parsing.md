# CV Parsing Feature

## Overview

The CV Parsing feature automatically extracts structured information from candidate CV/resume files. This feature supports multiple file formats (PDF, DOC, DOCX, TXT) and uses a dual-layer approach with server-side parsing and client-side fallback for optimal performance and reliability.

## Key Features

- Multi-format support (PDF, DOC, DOCX, TXT)
- Dual-layer parsing approach (server-side primary, client-side fallback)
- Automatic extraction of candidate information
- Seamless integration with candidate registration

## Architecture

The CV parsing system uses a dual-layer approach:

1. **Server-side Parsing (Primary Method)**

   - Dedicated Express server running on port 5001
   - Uses pdf-parse for PDF files and mammoth for DOC/DOCX files
   - Provides more powerful and accurate parsing
   - Accessible via API endpoint: `/api/parse-cv`

2. **Client-side Parsing (Fallback Method)**
   - Activated when server-side parsing is unavailable
   - Limited to simpler parsing capabilities
   - Runs directly in the browser
   - No external service dependencies

## Usage

The CV parsing feature is primarily used during the candidate registration process:

1. User uploads a CV file (.pdf, .doc, .docx, or .txt)
2. System automatically attempts server-side parsing
3. If server-side parsing is unavailable, system falls back to client-side parsing
4. Extracted information populates registration form fields
5. User can review and modify extracted information before submission

## Implementation Details

### Environment Configuration

The CV parsing service requires proper environment configuration:

```
VITE_CV_PARSING_URL=http://localhost:5001
```

### Server-Side Components

- **CV Parsing Server**: Located in `server/index.js`
- **Port**: 5001 (configurable via environment variable)
- **Endpoints**:
  - `GET /api/parse-cv/status`: Check if the parsing service is available
  - `POST /api/parse-cv`: Parse uploaded CV file

### Client-Side Components

- **CV Parsing Service**: Located in `src/services/CVParsingService.ts`
- **CV Parsing API Client**: Located in `src/services/CVParsingAPI.ts`
- **Integration Point**: `CandidateRegistration.tsx` component

### Required Dependencies

- **Server-side**:
  - express
  - multer
  - pdf-parse
  - mammoth
  - cors
- **Client-side**:
  - axios (for API communication)

## Parsing Logic

The parsing engine extracts the following information:

- **Personal Details**: Name, email, phone number
- **Professional Profiles**: LinkedIn, GitHub
- **Skills**: Technical and soft skills
- **Education**: Degrees, institutions
- **Experience**: Work history, job titles, companies

## Performance Considerations

- Server-side parsing is more resource-intensive but provides better results
- Client-side parsing is more limited but doesn't require external services
- Files are validated for type and size before parsing (max 10MB)
- Temporary files are automatically cleaned up after parsing

## Troubleshooting

### Common Issues

1. **"Failed to load resource: the server responded with a status of 503"**

   - Cause: CV parsing server is not running or not accessible
   - Solution: Ensure the CV parsing server is running on port 5001

2. **"Unsupported file type"**

   - Cause: File format not supported
   - Solution: Use PDF, DOC, DOCX, or TXT files only

3. **"File too large"**
   - Cause: File exceeds size limit
   - Solution: Upload a file smaller than 10MB

### Debugging Steps

1. Verify the CV parsing server is running (`node server/index.js`)
2. Check the server logs for parsing errors
3. Ensure the correct environment variable is set (`VITE_CV_PARSING_URL`)
4. Verify network connectivity between client and server
5. Check if the file format is supported

## Security Considerations

- File uploads are validated for type and size
- Temporary files are deleted after processing
- CORS is properly configured to restrict access
- No sensitive information is stored on the server

## Future Enhancements

- Enhanced parsing accuracy with machine learning
- Support for additional file formats
- Extraction of more detailed candidate information
- Integration with OCR for scanned documents
- Multilingual support for international CVs
