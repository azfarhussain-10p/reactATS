import express from 'express';
import mockDataService from '../../services/mockDataService.js';

const router = express.Router();

/**
 * @route   GET /api/job-boards
 * @desc    Get all job boards
 * @access  Private (to be implemented with auth)
 */
router.get('/', (req, res) => {
  try {
    const jobBoards = mockDataService.getJobBoards();
    res.json(jobBoards);
  } catch (error) {
    console.error('Error getting job boards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/job-boards/:id
 * @desc    Get job board by ID
 * @access  Private (to be implemented with auth)
 */
router.get('/:id', (req, res) => {
  try {
    const jobBoard = mockDataService.getJobBoardById(parseInt(req.params.id));

    if (!jobBoard) {
      return res.status(404).json({ message: 'Job board not found' });
    }

    res.json(jobBoard);
  } catch (error) {
    console.error(`Error getting job board ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/job-boards/slug/:slug
 * @desc    Get job board by slug
 * @access  Public
 */
router.get('/slug/:slug', (req, res) => {
  try {
    const jobBoard = mockDataService.getJobBoardBySlug(req.params.slug);

    if (!jobBoard) {
      return res.status(404).json({ message: 'Job board not found' });
    }

    res.json(jobBoard);
  } catch (error) {
    console.error(`Error getting job board with slug ${req.params.slug}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/job-boards
 * @desc    Create a new job board
 * @access  Private (to be implemented with auth)
 */
router.post('/', (req, res) => {
  try {
    const { name, slug } = req.body;

    // Simple validation
    if (!name || !slug) {
      return res.status(400).json({ message: 'Please provide name and slug' });
    }

    const newJobBoard = mockDataService.createJobBoard(req.body);

    res.status(201).json(newJobBoard);
  } catch (error) {
    console.error('Error creating job board:', error);

    if (error.message === 'Slug already exists') {
      return res.status(400).json({ message: 'Slug already exists' });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/job-boards/:id
 * @desc    Update a job board
 * @access  Private (to be implemented with auth)
 */
router.put('/:id', (req, res) => {
  try {
    const jobBoardId = parseInt(req.params.id);
    const updatedJobBoard = mockDataService.updateJobBoard(jobBoardId, req.body);

    if (!updatedJobBoard) {
      return res.status(404).json({ message: 'Job board not found' });
    }

    res.json(updatedJobBoard);
  } catch (error) {
    console.error(`Error updating job board ${req.params.id}:`, error);

    if (error.message === 'Slug already exists on another board') {
      return res.status(400).json({ message: 'Slug already exists on another board' });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PATCH /api/job-boards/:id/status
 * @desc    Update a job board's active status
 * @access  Private (to be implemented with auth)
 */
router.patch('/:id/status', (req, res) => {
  try {
    const jobBoardId = parseInt(req.params.id);
    const { isActive } = req.body;

    const updatedJobBoard = mockDataService.updateJobBoardStatus(jobBoardId, isActive);

    if (!updatedJobBoard) {
      return res.status(404).json({ message: 'Job board not found' });
    }

    res.json(updatedJobBoard);
  } catch (error) {
    console.error(`Error updating job board ${req.params.id} status:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/job-boards/:id
 * @desc    Delete a job board
 * @access  Private (to be implemented with auth)
 */
router.delete('/:id', (req, res) => {
  try {
    const jobBoardId = parseInt(req.params.id);

    const deletedJobBoard = mockDataService.deleteJobBoard(jobBoardId);

    if (!deletedJobBoard) {
      return res.status(404).json({ message: 'Job board not found' });
    }

    res.json({ message: 'Job board deleted', jobBoard: deletedJobBoard });
  } catch (error) {
    console.error(`Error deleting job board ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
