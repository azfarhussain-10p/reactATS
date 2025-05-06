# CV Parsing Server for React ATS

This server handles the CV parsing functionality for the React ATS application, providing more robust parsing of PDF, DOC, DOCX, and TXT files than client-side parsing alone.

## Setup Instructions

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an `.env` file in the root of your React application with:

   ```
   VITE_CV_PARSING_URL=http://localhost:5001
   ```

3. Start the server:

   ```bash
   node index.js
   ```

   Or start it through the main application script:

   ```bash
   node ../run-ats.js
   ```

4. The server will be running at http://localhost:5001

## API Endpoints

- `GET /api/parse-cv/status` - Check if the server is running
- `POST /api/parse-cv` - Upload and parse a CV file

## Using with the React ATS Application

The application is already set up to use this server when available. It will:

1. First try to use the server-side parsing if the server is running
2. Fall back to client-side parsing if the server is not available

## Folder Structure

- `/uploads` - Temporary storage for uploaded files (created automatically, but ignored by git)

## Troubleshooting

If you encounter issues with CV parsing:

1. Check if the server is running (`node index.js`)
2. Verify the server is accessible at http://localhost:5001/api/parse-cv/status
3. Check if the `VITE_CV_PARSING_URL` environment variable is correctly set
4. Check the server logs for any errors
5. Ensure the file types you're trying to parse are supported (PDF, DOC, DOCX, TXT)
6. Look for the "Failed to load resource: the server responded with a status of 503" error, which indicates the server is not running

## Production Deployment

For production, you should:

1. Set up proper file storage (e.g., AWS S3) instead of local files
2. Add user authentication and rate limiting
3. Consider using a more robust CV parsing service or API
4. Implement proper error handling and logging

## Integration with main application

This server is automatically started when running the complete application with:

```bash
node run-ats.js
```

The `run-ats.js` script handles:

- Starting this server on port 5001
- Setting up the proper environment variables
- Health checks to ensure the server is running properly
