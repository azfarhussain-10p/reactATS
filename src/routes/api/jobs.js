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
    const filters = {
      search: req.query.search,
      department: req.query.department,
      location: req.query.location,
      type: req.query.type,
      status: req.query.status
    };
    
    const jobs = mockDataService.getJobs(filters);
    
    res.json(jobs);
  } catch (error) {
    logger.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error' });
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
    
    if (isNaN(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }
    
    const job = mockDataService.getJobById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    logger.error(`Error fetching job ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/jobs
 * @desc    Create a new job
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    // Simple validation
    if (!req.body.title || !req.body.department) {
      return res.status(400).json({ message: 'Please provide at least a title and department' });
    }
    
    const newJob = mockDataService.createJob(req.body);
    
    res.status(201).json(newJob);
  } catch (error) {
    logger.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error' });
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
    
    if (isNaN(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }
    
    const updatedJob = mockDataService.updateJob(jobId, req.body);
    
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(updatedJob);
  } catch (error) {
    logger.error(`Error updating job ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
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
    
    if (isNaN(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }
    
    const deletedJob = mockDataService.deleteJob(jobId);
    
    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting job ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 