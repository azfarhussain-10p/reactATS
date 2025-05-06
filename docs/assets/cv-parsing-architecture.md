# CV Parsing Architecture Diagram

This document contains descriptive information for the CV parsing architecture diagram referenced in the CV parsing documentation.

## Architecture Overview

The CV Parsing system uses a dual-layer approach with server-side parsing as the primary method and client-side parsing as a fallback.

```
                                  ┌──────────────────────┐
                                  │                      │
                                  │   User Interface     │
                                  │                      │
                                  └─────────▲────────────┘
                                            │
                                            │ Upload CV
                                            │
                                  ┌─────────▼────────────┐
                                  │                      │
                                  │  CVParsingService    │
                                  │                      │
                                  └─────────┬────────────┘
                                            │
                                            │
                          ┌─────────────────┴───────────────┐
                          │                                 │
             ┌────────────▼───────────┐        ┌────────────▼───────────┐
             │                        │        │                        │
             │   Server Available?    │─Yes──► │    CVParsingAPI        │
             │                        │        │    (Server-side)       │
             └────────────┬───────────┘        └────────────┬───────────┘
                          │                                 │
                          │ No                             │
                          │                                │
             ┌────────────▼───────────┐        ┌────────────▼───────────┐
             │                        │        │                        │
             │  Client-side Parsing   │        │  Express Server        │
             │                        │        │  (Port 5001)           │
             └────────────┬───────────┘        └────────────┬───────────┘
                          │                                 │
                          │                                 │
                          │                    ┌────────────▼───────────┐
                          │                    │                        │
                          │                    │  pdf-parse (PDF)       │
                          │                    │  mammoth (DOC/DOCX)    │
                          │                    │                        │
                          │                    └────────────┬───────────┘
                          │                                 │
                          │                                 │
             ┌────────────▼───────────────────┬────────────▼───────────┐
             │                                │                        │
             │          Parsed CV Data        │                        │
             │                                │                        │
             └────────────────────────────────┴────────────────────────┘
```

## Flow Description

1. The user uploads a CV file through the user interface.
2. The `CVParsingService` receives the file and checks if server-side parsing is available.
3. If server-side parsing is available:
   - The file is sent to the `CVParsingAPI` client
   - The API client sends the file to the Express server running on port 5001
   - The server uses appropriate libraries to parse the file (pdf-parse for PDF, mammoth for DOC/DOCX)
   - The parsed data is returned to the client
4. If server-side parsing is unavailable:
   - The system falls back to client-side parsing
   - Limited parsing is performed directly in the browser
5. The parsed CV data is returned to the user interface for form population

## Components

1. **User Interface**: The frontend components where users upload CV files
2. **CVParsingService**: Main service that coordinates the parsing process
3. **CVParsingAPI**: Client for the server-side parsing API
4. **Express Server**: Backend server that performs the actual parsing
5. **Parsing Libraries**: Third-party libraries used for different file formats

## Benefits of Dual-Layer Approach

- **Reliability**: System can still function when server is unavailable
- **Performance**: Server-side parsing offers better accuracy and capabilities
- **Flexibility**: Different parsing strategies for different file formats
- **Scalability**: Server-side parsing can be scaled independently
