# CV Parsing API

## Overview

The CV Parsing API provides endpoints for extracting structured information from candidate CV/resume files. The API supports multiple file formats (PDF, DOC, DOCX, TXT) and provides detailed candidate information extraction.

## Base URL

```
http://localhost:5001/api
```

The base URL can be configured using the `VITE_CV_PARSING_URL` environment variable.

## Endpoints

### Check Service Status

Verifies if the CV parsing service is available.

**URL**: `/parse-cv/status`
**Method**: `GET`
**Auth Required**: No

#### Success Response

**Code**: `200 OK`
**Content Example**:

```json
{
  "status": "available"
}
```

### Parse CV

Parses an uploaded CV file and extracts relevant information.

**URL**: `/parse-cv`
**Method**: `POST`
**Auth Required**: No
**Content-Type**: `multipart/form-data`

#### Request Parameters

| Parameter | Type | Required | Description                                                  |
| --------- | ---- | -------- | ------------------------------------------------------------ |
| cvFile    | File | Yes      | The CV file to parse. Supported formats: PDF, DOC, DOCX, TXT |

#### Success Response

**Code**: `200 OK`
**Content Example**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1 (555) 123-4567",
  "linkedin": "https://www.linkedin.com/in/johndoe",
  "github": "https://www.github.com/johndoe",
  "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
  "education": [
    {
      "institution": "University",
      "degree": "Bachelor of Science in Computer Science",
      "field": "",
      "startDate": "",
      "endDate": "",
      "current": false
    }
  ],
  "experience": [
    {
      "company": "Company",
      "title": "Senior Software Engineer",
      "location": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "description": "Led development of web applications using React and Node.js."
    }
  ]
}
```

#### Error Responses

**Code**: `400 Bad Request`
**Content Example**:

```json
{
  "error": "No file uploaded"
}
```

**Code**: `400 Bad Request`
**Content Example**:

```json
{
  "error": "Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files."
}
```

**Code**: `413 Payload Too Large`
**Content Example**:

```json
{
  "error": "File size exceeds the limit"
}
```

**Code**: `500 Internal Server Error`
**Content Example**:

```json
{
  "error": "Failed to parse CV",
  "message": "Error details..."
}
```

## Data Model

### ParsedCVData

| Field      | Type              | Description                                 |
| ---------- | ----------------- | ------------------------------------------- |
| firstName  | string            | Candidate's first name                      |
| lastName   | string            | Candidate's last name                       |
| email      | string            | Candidate's email address                   |
| phone      | string            | Candidate's phone number                    |
| linkedin   | string (optional) | Candidate's LinkedIn profile URL            |
| github     | string (optional) | Candidate's GitHub profile URL              |
| skills     | string[]          | List of candidate's skills                  |
| education  | Education[]       | List of candidate's education records       |
| experience | Experience[]      | List of candidate's work experience records |

### Education

| Field       | Type    | Description                         |
| ----------- | ------- | ----------------------------------- |
| institution | string  | Name of the educational institution |
| degree      | string  | Degree obtained or pursuing         |
| field       | string  | Field of study                      |
| startDate   | string  | Start date of education             |
| endDate     | string  | End date of education               |
| current     | boolean | Whether education is ongoing        |

### Experience

| Field       | Type    | Description                   |
| ----------- | ------- | ----------------------------- |
| company     | string  | Company name                  |
| title       | string  | Job title                     |
| location    | string  | Job location                  |
| startDate   | string  | Start date of employment      |
| endDate     | string  | End date of employment        |
| current     | boolean | Whether employment is current |
| description | string  | Job description               |

## Usage Examples

### cURL

```bash
curl -X POST \
  -F "cvFile=@resume.pdf" \
  http://localhost:5001/api/parse-cv
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const parseCV = async (file) => {
  const formData = new FormData();
  formData.append('cvFile', file);

  try {
    const response = await axios.post('http://localhost:5001/api/parse-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error parsing CV:', error);
    throw new Error('Failed to parse CV');
  }
};
```

## Implementation Notes

- File size is limited to 10MB
- Temporary files are deleted after processing
- CORS is enabled for cross-origin requests
- Parsing accuracy may vary depending on the CV format and structure
- Server-side parsing is recommended for better accuracy
