import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MockDataService {
  constructor() {
    this.loadAllData();
  }

  /**
   * Load all data from JSON files
   */
  loadAllData() {
    try {
      // Load jobs data
      const jobsData = this.loadData('mockJobs.json');
      // Handle both array format and {jobs: [...]} format
      this.jobs = Array.isArray(jobsData) ? jobsData : jobsData.jobs || [];

      // Load applications data
      const applicationsData = this.loadData('mockApplications.json');
      this.applications = Array.isArray(applicationsData)
        ? applicationsData
        : applicationsData.applications || [];

      // Load job boards data
      const jobBoardsData = this.loadData('mockJobBoards.json');
      this.jobBoards = Array.isArray(jobBoardsData) ? jobBoardsData : jobBoardsData.jobBoards || [];

      console.log(
        `Loaded data: ${this.jobs.length} jobs, ${this.applications.length} applications, ${this.jobBoards.length} job boards`
      );
    } catch (error) {
      console.error('Error loading data:', error);
      // Initialize with empty arrays if load fails
      this.jobs = [];
      this.applications = [];
      this.jobBoards = [];
    }
  }

  /**
   * Load data from a JSON file
   * @param {string} filename - The name of the JSON file to load
   * @returns {Array|Object} The parsed JSON data
   */
  loadData(filename) {
    try {
      const filePath = path.resolve(__dirname, '../data', filename);
      console.log(`Loading data from ${filePath}`);

      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return [];
      }

      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading data from ${filename}:`, error);
      return [];
    }
  }

  /**
   * Save data to a JSON file
   * @param {string} filename - The name of the JSON file to save to
   * @param {Array|Object} data - The data to save
   */
  saveData(filename, data) {
    try {
      const filePath = path.join(__dirname, '../data', filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error(`Error saving ${filename}:`, error);
    }
  }

  /**
   * Get all jobs with optional filtering
   * @param {Object} filters - Optional filters to apply
   * @returns {Array} Filtered jobs
   */
  getJobs(filters = {}) {
    // Reload data to ensure we have the latest
    this.loadAllData();

    let filteredJobs = [...this.jobs];

    const { search, department, location, type, status } = filters;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.department.toLowerCase().includes(searchLower)
      );
    }

    if (department && department !== 'All') {
      filteredJobs = filteredJobs.filter((job) => job.department === department);
    }

    if (location && location !== 'All') {
      filteredJobs = filteredJobs.filter((job) => job.location === location);
    }

    if (type && type !== 'All') {
      filteredJobs = filteredJobs.filter((job) => job.type === type);
    }

    if (status && status !== 'All') {
      filteredJobs = filteredJobs.filter((job) => job.status === status);
    }

    return filteredJobs;
  }

  /**
   * Get a job by ID
   * @param {number} id - The job ID
   * @returns {Object|null} The job object or null if not found
   */
  getJobById(id) {
    // Reload data to ensure we have the latest
    this.loadAllData();
    return this.jobs.find((job) => job.id === id) || null;
  }

  /**
   * Create a new job
   * @param {Object} jobData - The job data
   * @returns {Object} The created job
   */
  createJob(jobData) {
    const maxId = this.jobs.length > 0 ? Math.max(...this.jobs.map((job) => job.id)) : 0;

    const newJob = {
      id: maxId + 1,
      ...jobData,
      postedDate: jobData.postedDate || new Date().toISOString().split('T')[0],
      applicants: jobData.applicants || 0,
      status: jobData.status || 'Active',
    };

    this.jobs.push(newJob);
    this.saveData('mockJobs.json', this.jobs);

    return newJob;
  }

  /**
   * Update a job
   * @param {number} id - The job ID
   * @param {Object} jobData - The updated job data
   * @returns {Object|null} The updated job or null if not found
   */
  updateJob(id, jobData) {
    const jobIndex = this.jobs.findIndex((job) => job.id === id);

    if (jobIndex === -1) {
      return null;
    }

    const updatedJob = { ...this.jobs[jobIndex], ...jobData };
    this.jobs[jobIndex] = updatedJob;
    this.saveData('mockJobs.json', this.jobs);

    return updatedJob;
  }

  /**
   * Delete a job
   * @param {number} id - The job ID
   * @returns {Object|null} The deleted job or null if not found
   */
  deleteJob(id) {
    const jobIndex = this.jobs.findIndex((job) => job.id === id);

    if (jobIndex === -1) {
      return null;
    }

    const [deletedJob] = this.jobs.splice(jobIndex, 1);
    this.saveData('mockJobs.json', this.jobs);

    return deletedJob;
  }

  /**
   * Get all applications with optional filtering
   * @param {Object} filters - Optional filters to apply
   * @returns {Array} Filtered applications
   */
  getApplications(filters = {}) {
    // Reload data to ensure we have the latest
    this.loadAllData();

    let filteredApplications = [...this.applications];

    const { jobId, candidateId, status } = filters;

    if (jobId) {
      filteredApplications = filteredApplications.filter((app) => app.jobId === parseInt(jobId));
    }

    if (candidateId) {
      filteredApplications = filteredApplications.filter(
        (app) => app.candidateId === parseInt(candidateId)
      );
    }

    if (status) {
      filteredApplications = filteredApplications.filter((app) => app.status === status);
    }

    return filteredApplications;
  }

  /**
   * Get an application by ID
   * @param {number} id - The application ID
   * @returns {Object|null} The application object or null if not found
   */
  getApplicationById(id) {
    // Reload data to ensure we have the latest
    this.loadAllData();
    return this.applications.find((app) => app.id === id) || null;
  }

  /**
   * Create a new application
   * @param {Object} applicationData - The application data
   * @returns {Object} The created application
   */
  createApplication(applicationData) {
    const job = this.getJobById(parseInt(applicationData.jobId));

    if (!job) {
      throw new Error('Job not found');
    }

    const maxId =
      this.applications.length > 0 ? Math.max(...this.applications.map((app) => app.id)) : 0;

    const now = new Date().toISOString();

    const newApplication = {
      id: maxId + 1,
      jobId: parseInt(applicationData.jobId),
      jobTitle: job.title,
      candidateId: applicationData.candidateId || null,
      firstName: applicationData.firstName,
      lastName: applicationData.lastName,
      email: applicationData.email,
      phone: applicationData.phone || '',
      resume: applicationData.resume || '',
      coverLetter: applicationData.coverLetter || '',
      linkedInUrl: applicationData.linkedInUrl || '',
      portfolioUrl: applicationData.portfolioUrl || '',
      referredBy: applicationData.referredBy || '',
      source: applicationData.source || 'Direct Application',
      answers: applicationData.answers || [],
      status: 'New',
      stage: 'Applied',
      appliedDate: now,
      stageHistory: [
        {
          stage: 'Applied',
          enteredAt: now,
          exitedAt: null,
          notes: 'Initial application submitted',
        },
      ],
      notes: '',
      flagged: false,
      lastUpdated: now,
    };

    this.applications.push(newApplication);

    // Update job's applicant count
    const jobIndex = this.jobs.findIndex((j) => j.id === parseInt(applicationData.jobId));
    if (jobIndex !== -1) {
      this.jobs[jobIndex].applicants += 1;
      this.saveData('mockJobs.json', this.jobs);
    }

    this.saveData('mockApplications.json', this.applications);

    return newApplication;
  }

  /**
   * Update an application
   * @param {number} id - The application ID
   * @param {Object} applicationData - The updated application data
   * @returns {Object|null} The updated application or null if not found
   */
  updateApplication(id, applicationData) {
    const applicationIndex = this.applications.findIndex((app) => app.id === id);

    if (applicationIndex === -1) {
      return null;
    }

    // Prevent updating certain fields
    const { id: appId, appliedDate, ...updateableFields } = applicationData;

    const updatedApplication = {
      ...this.applications[applicationIndex],
      ...updateableFields,
      lastUpdated: new Date().toISOString(),
    };

    this.applications[applicationIndex] = updatedApplication;
    this.saveData('mockApplications.json', this.applications);

    return updatedApplication;
  }

  /**
   * Update an application's status
   * @param {number} id - The application ID
   * @param {string} status - The new status
   * @returns {Object|null} The updated application or null if not found
   */
  updateApplicationStatus(id, status) {
    const applicationIndex = this.applications.findIndex((app) => app.id === id);

    if (applicationIndex === -1) {
      return null;
    }

    this.applications[applicationIndex].status = status;
    this.applications[applicationIndex].lastUpdated = new Date().toISOString();

    this.saveData('mockApplications.json', this.applications);

    return this.applications[applicationIndex];
  }

  /**
   * Update an application's pipeline stage
   * @param {number} id - The application ID
   * @param {string} stage - The new stage
   * @param {string} notes - Optional notes about the stage change
   * @returns {Object|null} The updated application or null if not found
   */
  updateApplicationStage(id, stage, notes) {
    const applicationIndex = this.applications.findIndex((app) => app.id === id);

    if (applicationIndex === -1) {
      return null;
    }

    const now = new Date().toISOString();

    // Close the current stage
    const currentStageIndex = this.applications[applicationIndex].stageHistory.findIndex(
      (s) => s.exitedAt === null
    );

    if (currentStageIndex !== -1) {
      this.applications[applicationIndex].stageHistory[currentStageIndex].exitedAt = now;
    }

    // Add the new stage
    this.applications[applicationIndex].stageHistory.push({
      stage,
      enteredAt: now,
      exitedAt: null,
      notes: notes || `Moved to ${stage} stage`,
    });

    // Update the current stage
    this.applications[applicationIndex].stage = stage;
    this.applications[applicationIndex].lastUpdated = now;

    this.saveData('mockApplications.json', this.applications);

    return this.applications[applicationIndex];
  }

  /**
   * Delete an application
   * @param {number} id - The application ID
   * @returns {Object|null} The deleted application or null if not found
   */
  deleteApplication(id) {
    const applicationIndex = this.applications.findIndex((app) => app.id === id);

    if (applicationIndex === -1) {
      return null;
    }

    const [deletedApplication] = this.applications.splice(applicationIndex, 1);
    this.saveData('mockApplications.json', this.applications);

    return deletedApplication;
  }

  /**
   * Get all job boards
   * @returns {Array} All job boards
   */
  getJobBoards() {
    // Reload data to ensure we have the latest
    this.loadAllData();
    return [...this.jobBoards];
  }

  /**
   * Get a job board by ID
   * @param {number} id - The job board ID
   * @returns {Object|null} The job board object or null if not found
   */
  getJobBoardById(id) {
    // Reload data to ensure we have the latest
    this.loadAllData();
    return this.jobBoards.find((board) => board.id === id) || null;
  }

  /**
   * Get a job board by slug
   * @param {string} slug - The job board slug
   * @returns {Object|null} The job board object or null if not found
   */
  getJobBoardBySlug(slug) {
    // Reload data to ensure we have the latest
    this.loadAllData();
    return this.jobBoards.find((board) => board.slug === slug && board.isActive) || null;
  }

  /**
   * Create a new job board
   * @param {Object} jobBoardData - The job board data
   * @returns {Object} The created job board
   */
  createJobBoard(jobBoardData) {
    // Check if slug already exists
    if (this.jobBoards.some((board) => board.slug === jobBoardData.slug)) {
      throw new Error('Slug already exists');
    }

    const maxId =
      this.jobBoards.length > 0 ? Math.max(...this.jobBoards.map((board) => board.id)) : 0;

    const now = new Date().toISOString();

    const newJobBoard = {
      id: maxId + 1,
      ...jobBoardData,
      createdAt: now,
      updatedAt: now,
      isActive: jobBoardData.isActive !== undefined ? jobBoardData.isActive : true,
      featuredJobs: jobBoardData.featuredJobs || 0,
      jobsPerPage: jobBoardData.jobsPerPage || 10,
      customFields: jobBoardData.customFields || [],
    };

    this.jobBoards.push(newJobBoard);
    this.saveData('mockJobBoards.json', this.jobBoards);

    return newJobBoard;
  }

  /**
   * Update a job board
   * @param {number} id - The job board ID
   * @param {Object} jobBoardData - The updated job board data
   * @returns {Object|null} The updated job board or null if not found
   */
  updateJobBoard(id, jobBoardData) {
    const jobBoardIndex = this.jobBoards.findIndex((board) => board.id === id);

    if (jobBoardIndex === -1) {
      return null;
    }

    // Check if slug exists on another board
    if (
      jobBoardData.slug &&
      this.jobBoards.some((board) => board.slug === jobBoardData.slug && board.id !== id)
    ) {
      throw new Error('Slug already exists on another board');
    }

    const updatedJobBoard = {
      ...this.jobBoards[jobBoardIndex],
      ...jobBoardData,
      updatedAt: new Date().toISOString(),
    };

    this.jobBoards[jobBoardIndex] = updatedJobBoard;
    this.saveData('mockJobBoards.json', this.jobBoards);

    return updatedJobBoard;
  }

  /**
   * Update a job board's active status
   * @param {number} id - The job board ID
   * @param {boolean} isActive - The new active status
   * @returns {Object|null} The updated job board or null if not found
   */
  updateJobBoardStatus(id, isActive) {
    const jobBoardIndex = this.jobBoards.findIndex((board) => board.id === id);

    if (jobBoardIndex === -1) {
      return null;
    }

    this.jobBoards[jobBoardIndex].isActive = isActive;
    this.jobBoards[jobBoardIndex].updatedAt = new Date().toISOString();

    this.saveData('mockJobBoards.json', this.jobBoards);

    return this.jobBoards[jobBoardIndex];
  }

  /**
   * Delete a job board
   * @param {number} id - The job board ID
   * @returns {Object|null} The deleted job board or null if not found
   */
  deleteJobBoard(id) {
    const jobBoardIndex = this.jobBoards.findIndex((board) => board.id === id);

    if (jobBoardIndex === -1) {
      return null;
    }

    const [deletedJobBoard] = this.jobBoards.splice(jobBoardIndex, 1);
    this.saveData('mockJobBoards.json', this.jobBoards);

    return deletedJobBoard;
  }

  /**
   * Get all unique departments
   * @returns {Array} Array of unique departments
   */
  getDepartments() {
    // Reload data to ensure we have the latest
    this.loadAllData();
    return [...new Set(this.jobs.map((job) => job.department))];
  }

  /**
   * Get all unique locations
   * @returns {Array} Array of unique locations
   */
  getLocations() {
    // Reload data to ensure we have the latest
    this.loadAllData();
    return [...new Set(this.jobs.map((job) => job.location))];
  }

  /**
   * Get all unique job types
   * @returns {Array} Array of unique job types
   */
  getJobTypes() {
    // Reload data to ensure we have the latest
    this.loadAllData();
    return [...new Set(this.jobs.map((job) => job.type))];
  }
}

// Create a singleton instance
const mockDataService = new MockDataService();

export default mockDataService;
