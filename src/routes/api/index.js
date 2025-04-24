import express from 'express';
import jobsRouter from './jobs.js';
import applicationsRouter from './applications.js';
import jobBoardsRouter from './jobBoards.js';
import mockDataService from '../../services/mockDataService.js';

const router = express.Router();

// API Routes
router.use('/jobs', jobsRouter);
router.use('/applications', applicationsRouter);
router.use('/job-boards', jobBoardsRouter);

// Security routes
router.get('/security/config', (req, res) => {
  res.json({
    jwtExpirationMinutes: 60,
    csrfHeaderName: 'X-CSRF-Token',
    csrfEnabled: true,
    rateLimitMax: 100,
    rateLimitTimeWindowMs: 60000, // 1 minute
    passwordMinLength: 10,
    passwordRequireSpecialChar: true,
    passwordRequireNumber: true,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    secureHttpHeadersEnabled: true,
    sessionTimeoutMinutes: 30,
    encryptionEnabled: true,
    mfaEnabled: false,
  });
});

router.get('/security/csrf-token', (req, res) => {
  // Generate a simple CSRF token (in a real app, this would be more secure)
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  res.json({ token });
});

// Adding direct routes for departments, locations, and job types
router.get('/departments', (req, res) => {
  try {
    const departments = mockDataService.getDepartments();
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/locations', (req, res) => {
  try {
    const locations = mockDataService.getLocations();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/job-types', (req, res) => {
  try {
    const jobTypes = mockDataService.getJobTypes();
    res.json(jobTypes);
  } catch (error) {
    console.error('Error fetching job types:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API index route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Job Board API',
    version: '1.0.0',
    endpoints: [
      '/api/jobs',
      '/api/applications',
      '/api/job-boards',
      '/api/departments',
      '/api/locations',
      '/api/job-types',
      '/api/security/config',
      '/api/security/csrf-token'
    ]
  });
});

export default router; 