import express from 'express';
import mockDataService from '../../services/mockDataService.js';

const router = express.Router();

/**
 * @route   GET /api/applications
 * @desc    Get all job applications with optional filtering
 * @access  Private (to be implemented with auth)
 */
router.get('/', (req, res) => {
  try {
    const applications = mockDataService.getApplications(req.query);
    res.json(applications);
  } catch (error) {
    console.error('Error getting applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/applications/:id
 * @desc    Get application by ID
 * @access  Private (to be implemented with auth)
 */
router.get('/:id', (req, res) => {
  try {
    const application = mockDataService.getApplicationById(parseInt(req.params.id));
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    console.error(`Error getting application ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/applications
 * @desc    Create a new job application
 * @access  Public
 */
router.post('/', (req, res) => {
  try {
    const { jobId, firstName, lastName, email } = req.body;

    // Simple validation
    if (!jobId || !firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Please provide jobId, firstName, lastName, and email' });
    }
    
    const newApplication = mockDataService.createApplication(req.body);
    
    res.status(201).json(newApplication);
  } catch (error) {
    console.error('Error creating application:', error);
    
    if (error.message === 'Job not found') {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/applications/:id
 * @desc    Update an application
 * @access  Private (to be implemented with auth)
 */
router.put('/:id', (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const updatedApplication = mockDataService.updateApplication(applicationId, req.body);
    
    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json(updatedApplication);
  } catch (error) {
    console.error(`Error updating application ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PATCH /api/applications/:id/status
 * @desc    Update an application's status
 * @access  Private (to be implemented with auth)
 */
router.patch('/:id/status', (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { status } = req.body;
    
    const updatedApplication = mockDataService.updateApplicationStatus(applicationId, status);
    
    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json(updatedApplication);
  } catch (error) {
    console.error(`Error updating application ${req.params.id} status:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PATCH /api/applications/:id/stage
 * @desc    Update an application's pipeline stage
 * @access  Private (to be implemented with auth)
 */
router.patch('/:id/stage', (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { stage, notes } = req.body;
    
    const updatedApplication = mockDataService.updateApplicationStage(applicationId, stage, notes);
    
    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json(updatedApplication);
  } catch (error) {
    console.error(`Error updating application ${req.params.id} stage:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/applications/:id
 * @desc    Delete an application
 * @access  Private (to be implemented with auth)
 */
router.delete('/:id', (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    
    const deletedApplication = mockDataService.deleteApplication(applicationId);
    
    if (!deletedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json({ message: 'Application deleted', application: deletedApplication });
  } catch (error) {
    console.error(`Error deleting application ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 