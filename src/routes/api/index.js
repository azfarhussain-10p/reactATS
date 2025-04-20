import express from 'express';
import jobsRouter from './jobs.js';
import applicationsRouter from './applications.js';
import jobBoardsRouter from './jobBoards.js';

const router = express.Router();

// API Routes
router.use('/jobs', jobsRouter);
router.use('/applications', applicationsRouter);
router.use('/job-boards', jobBoardsRouter);

// API index route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Job Board API',
    version: '1.0.0',
    endpoints: [
      '/api/jobs',
      '/api/applications',
      '/api/job-boards'
    ]
  });
});

export default router; 