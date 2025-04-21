import express from 'express';
import mockDataService from '../../services/mockDataService.js';
import { authenticate } from '../../middleware/auth.js';
import logger from '../../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /api/jobs
 * @desc    Get all jobs with optional filtering
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    logger.info(`Fetching jobs with filters: ${JSON.stringify(req.query)}`);
    
    const filters = {
      search: req.query.search,
      department: req.query.department,
      location: req.query.location,
      type: req.query.type,
      status: req.query.status
    };
    
    // Special case for the public careers page
    if (req.query.status === 'published') {
      filters.status = 'Active'; // Only show active jobs on the public career page
    }
    
    // Force a refresh of data before getting jobs to ensure latest status changes are reflected
    mockDataService.loadAllData();
    
    const jobs = mockDataService.getJobs(filters);
    
    if (!jobs || jobs.length === 0) {
      logger.info('No jobs found matching the criteria');
      // Still returning an empty array with 200 status as this is not an error condition
    }
    
    logger.info(`Successfully retrieved ${jobs.length} jobs`);
    res.json(jobs);
  } catch (error) {
    logger.error(`Error fetching jobs with filters ${JSON.stringify(req.query)}:`, error);
    // Return a more detailed error response
    res.status(500).json({ 
      message: 'Failed to retrieve jobs',
      details: error.message,
      code: 'JOBS_FETCH_ERROR'
    });
  }
});

/**
 * @route   GET /api/jobs/departments
 * @desc    Get all unique departments
 * @access  Public
 */
router.get('/departments', async (req, res) => {
  try {
    const departments = mockDataService.getDepartments();
    res.json(departments);
  } catch (error) {
    logger.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/jobs/locations
 * @desc    Get all unique locations
 * @access  Public
 */
router.get('/locations', async (req, res) => {
  try {
    const locations = mockDataService.getLocations();
    res.json(locations);
  } catch (error) {
    logger.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/jobs/types
 * @desc    Get all unique job types
 * @access  Public
 */
router.get('/types', async (req, res) => {
  try {
    const types = mockDataService.getJobTypes();
    res.json(types);
  } catch (error) {
    logger.error('Error fetching job types:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get a job by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    logger.info(`Fetching job with ID: ${jobId}`);
    
    if (isNaN(jobId)) {
      logger.warn(`Invalid job ID provided: ${req.params.id}`);
      return res.status(400).json({ 
        message: 'Invalid job ID', 
        details: 'Job ID must be a number',
        code: 'INVALID_JOB_ID'
      });
    }
    
    const job = mockDataService.getJobById(jobId);
    
    if (!job) {
      logger.warn(`Job not found with ID: ${jobId}`);
      return res.status(404).json({ 
        message: 'Job not found', 
        details: `No job exists with ID ${jobId}`,
        code: 'JOB_NOT_FOUND'
      });
    }
    
    logger.info(`Successfully retrieved job with ID: ${jobId}`);
    res.json(job);
  } catch (error) {
    logger.error(`Error fetching job with ID ${req.params.id}:`, error);
    res.status(500).json({ 
      message: 'Failed to retrieve job',
      details: error.message,
      code: 'JOB_FETCH_ERROR'
    });
  }
});

/**
 * @route   POST /api/jobs
 * @desc    Create a new job
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    logger.info('Creating new job with data:', { ...req.body, description: req.body.description ? '(truncated)' : undefined });
    
    // Enhanced validation
    const requiredFields = ['title', 'department', 'location', 'type'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      logger.warn(`Job creation failed: Missing required fields: ${missingFields.join(', ')}`);
      return res.status(400).json({ 
        message: 'Invalid job data', 
        details: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // Additional validation for specific fields could be added here
    if (req.body.title && req.body.title.length < 3) {
      logger.warn('Job creation failed: Title too short');
      return res.status(400).json({
        message: 'Invalid job data',
        details: 'Job title must be at least 3 characters long',
        code: 'INVALID_JOB_TITLE'
      });
    }
    
    const newJob = mockDataService.createJob(req.body);
    
    logger.info(`Successfully created new job with ID: ${newJob.id}`);
    res.status(201).json(newJob);
  } catch (error) {
    logger.error('Error creating job:', error);
    res.status(500).json({ 
      message: 'Failed to create job',
      details: error.message,
      code: 'JOB_CREATE_ERROR'
    });
  }
});

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update a job
 * @access  Private
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    logger.info(`Updating job with ID: ${jobId}`, { ...req.body, description: req.body.description ? '(truncated)' : undefined });
    
    if (isNaN(jobId)) {
      logger.warn(`Invalid job ID provided for update: ${req.params.id}`);
      return res.status(400).json({ 
        message: 'Invalid job ID', 
        details: 'Job ID must be a number',
        code: 'INVALID_JOB_ID'
      });
    }
    
    // Check if the job exists before trying to update
    const existingJob = mockDataService.getJobById(jobId);
    if (!existingJob) {
      logger.warn(`Update failed: Job not found with ID: ${jobId}`);
      return res.status(404).json({ 
        message: 'Job not found', 
        details: `No job exists with ID ${jobId}`,
        code: 'JOB_NOT_FOUND'
      });
    }
    
    // Validation for specific update fields
    if (req.body.title && req.body.title.length < 3) {
      logger.warn('Job update failed: Title too short');
      return res.status(400).json({
        message: 'Invalid job data',
        details: 'Job title must be at least 3 characters long',
        code: 'INVALID_JOB_TITLE'
      });
    }
    
    const updatedJob = mockDataService.updateJob(jobId, req.body);
    
    logger.info(`Successfully updated job with ID: ${jobId}`);
    res.json(updatedJob);
  } catch (error) {
    logger.error(`Error updating job ${req.params.id}:`, error);
    res.status(500).json({ 
      message: 'Failed to update job',
      details: error.message,
      code: 'JOB_UPDATE_ERROR'
    });
  }
});

/**
 * @route   PATCH /api/jobs/:id/status
 * @desc    Update a job's status
 * @access  Private
 */
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    
    if (isNaN(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }
    
    if (!req.body.status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const job = mockDataService.getJobById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const updatedJob = mockDataService.updateJob(jobId, { status: req.body.status });
    
    res.json(updatedJob);
  } catch (error) {
    logger.error(`Error updating job status ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PATCH /api/jobs/:id/featured
 * @desc    Toggle a job's featured status
 * @access  Private
 */
router.patch('/:id/featured', authenticate, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    
    if (isNaN(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }
    
    const job = mockDataService.getJobById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Toggle the featured status
    const updatedJob = mockDataService.updateJob(jobId, { 
      isFeatured: !job.isFeatured 
    });
    
    res.json(updatedJob);
  } catch (error) {
    logger.error(`Error toggling job featured status ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    logger.info(`Attempting to delete job with ID: ${jobId}`);
    
    if (isNaN(jobId)) {
      logger.warn(`Invalid job ID provided for deletion: ${req.params.id}`);
      return res.status(400).json({ 
        message: 'Invalid job ID', 
        details: 'Job ID must be a number',
        code: 'INVALID_JOB_ID'
      });
    }
    
    // Check if the job exists before trying to delete
    const existingJob = mockDataService.getJobById(jobId);
    if (!existingJob) {
      logger.warn(`Deletion failed: Job not found with ID: ${jobId}`);
      return res.status(404).json({ 
        message: 'Job not found', 
        details: `No job exists with ID ${jobId}`,
        code: 'JOB_NOT_FOUND'
      });
    }
    
    // Check if the job has associated applications before deletion
    // This is a hypothetical check; you may need to add this logic to mockDataService
    // const hasApplications = mockDataService.jobHasApplications(jobId);
    // if (hasApplications) {
    //   logger.warn(`Deletion failed: Job ${jobId} has associated applications`);
    //   return res.status(409).json({
    //     message: 'Cannot delete job',
    //     details: 'The job has associated applications',
    //     code: 'JOB_HAS_APPLICATIONS'
    //   });
    // }
    
    const deletedJob = mockDataService.deleteJob(jobId);
    
    logger.info(`Successfully deleted job with ID: ${jobId}`);
    res.json({ 
      message: 'Job deleted successfully',
      details: `Job with ID ${jobId} and title "${deletedJob.title}" has been removed`,
      code: 'JOB_DELETED'
    });
  } catch (error) {
    logger.error(`Error deleting job ${req.params.id}:`, error);
    res.status(500).json({ 
      message: 'Failed to delete job',
      details: error.message,
      code: 'JOB_DELETE_ERROR'
    });
  }
});

export default router; 