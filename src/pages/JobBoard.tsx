import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid as MuiGrid,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Stack,
  CardActionArea,
  CardActions,
  Snackbar,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  ButtonGroup,
  CircularProgress,
  alpha,
  Alert,
  AlertTitle,
  List,
  ListItem,
} from '@mui/material';
import { yellow, purple, amber, deepPurple } from '@mui/material/colors';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  BusinessCenter as BusinessIcon,
  AttachMoney as SalaryIcon,
  PeopleAlt as PeopleIcon,
  EventNote as DateIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Info as InfoIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  FormatAlignLeft as FormatAlignLeftIcon,
  FormatAlignCenter as FormatAlignCenterIcon,
  FormatAlignRight as FormatAlignRightIcon,
  FormatClear as FormatClearIcon,
  Block as BlockIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Publish as PublishIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon,
  RemoveFormatting as RemoveFormattingIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { jobsApi } from '../services/api';

interface Job {
  id: number;
  title: string;
  location: string;
  department: string;
  type: string;
  experience: string;
  salary: string;
  postedDate: string;
  createdDate: string; // Date when the job was created (for drafts)
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string | string[]; // Can be string or string array
  status: 'Active' | 'On-Hold' | 'Closed' | 'Draft';
  applicants: number;
  isFeatured?: boolean;
  isBookmarked?: boolean;
  skills?: string[] | string; // Can be string array or string
}

interface TextEditorState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  bulletList: boolean;
  numberList: boolean;
  alignment: 'left' | 'center' | 'right';
}

// Create a custom Grid component that handles the TypeScript errors
const Grid = (props: any) => <MuiGrid {...props} />;

const JobBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDetailOpen, setJobDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state variables for functionality
  const [newJobDialogOpen, setNewJobDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [jobToShare, setJobToShare] = useState<Job | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [jobToApply, setJobToApply] = useState<Job | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editJobId, setEditJobId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // New state for job form
  const [newJobForm, setNewJobForm] = useState({
    // Job Summary
    title: '',
    department: '',
    location: '',
    type: 'Full-time',

    // Job Outline
    description: '',
    responsibilities: '',

    // Qualifications & Experience
    requirements: '',
    experience: '',
    skills: '',

    // Salary & Benefits
    salary: '',
    benefits: '',

    isFeatured: false,
  });
  const [formErrors, setFormErrors] = useState({
    title: false,
    department: false,
    location: false,
    description: false,
    responsibilities: false,
    requirements: false,
    experience: false,
    skills: false,
    salary: false,
    benefits: false,
  });

  // Text formatting state for each field
  const [textFormatState, setTextFormatState] = useState<{
    [key: string]: TextEditorState;
  }>({
    description: {
      bold: false,
      italic: false,
      underline: false,
      bulletList: false,
      numberList: false,
      alignment: 'left',
    },
    responsibilities: {
      bold: false,
      italic: false,
      underline: false,
      bulletList: false,
      numberList: false,
      alignment: 'left',
    },
    requirements: {
      bold: false,
      italic: false,
      underline: false,
      bulletList: false,
      numberList: false,
      alignment: 'left',
    },
    skills: {
      bold: false,
      italic: false,
      underline: false,
      bulletList: false,
      numberList: false,
      alignment: 'left',
    },
    benefits: {
      bold: false,
      italic: false,
      underline: false,
      bulletList: false,
      numberList: false,
      alignment: 'left',
    },
  });

  // State for preview dialog
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // State for publish confirmation dialog
  const [publishConfirmDialogOpen, setPublishConfirmDialogOpen] = useState(false);
  const [jobToPublish, setJobToPublish] = useState<{ job: Partial<Job>; isNew: boolean } | null>(
    null
  );

  // State for dropdown options
  const [departments, setDepartments] = useState<string[]>(['All']);
  const [locations, setLocations] = useState<string[]>(['All']);
  const [types, setTypes] = useState<string[]>(['All']);
  const [statuses, setStatuses] = useState<string[]>(['All']);
  const [loadingDropdowns, setLoadingDropdowns] = useState({
    departments: false,
    locations: false,
    types: false,
  });

  // Calculate days ago from posted date
  const getDaysAgo = (dateString: string) => {
    const posted = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date in a user-friendly way
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all jobs including drafts for the JobBoard page
        const jobsData = await jobsApi.getAllJobs();
        setJobs(jobsData);
        setFilteredJobs(jobsData);

        // Success message
        console.log(`Loaded ${jobsData.length} jobs, including drafts`);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again later.');
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDropdowns((prev) => ({ ...prev, departments: true }));
        const data = await jobsApi.getDepartments();
        setDepartments(['All', ...data]);
        setLoadingDropdowns((prev) => ({ ...prev, departments: false }));
      } catch (err) {
        console.error('Error fetching departments:', err);
        // Fallback to client-side filtering if API fails
        if (jobs.length > 0) {
          const uniqueDepartments = Array.from(new Set(jobs.map((job) => job.department)));
          setDepartments(['All', ...uniqueDepartments]);
        }
        setLoadingDropdowns((prev) => ({ ...prev, departments: false }));
      }
    };

    fetchDepartments();
  }, []); // Remove jobs dependency to prevent infinite loop

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingDropdowns((prev) => ({ ...prev, locations: true }));
        const data = await jobsApi.getLocations();
        setLocations(['All', ...data]);
        setLoadingDropdowns((prev) => ({ ...prev, locations: false }));
      } catch (err) {
        console.error('Error fetching locations:', err);
        // Fallback to client-side filtering if API fails
        if (jobs.length > 0) {
          const uniqueLocations = Array.from(new Set(jobs.map((job) => job.location)));
          setLocations(['All', ...uniqueLocations]);
        }
        setLoadingDropdowns((prev) => ({ ...prev, locations: false }));
      }
    };

    fetchLocations();
  }, []); // Remove jobs dependency to prevent infinite loop

  // Fetch job types from API
  useEffect(() => {
    const fetchJobTypes = async () => {
      try {
        setLoadingDropdowns((prev) => ({ ...prev, types: true }));
        const data = await jobsApi.getJobTypes();
        setTypes(['All', ...data]);
        setLoadingDropdowns((prev) => ({ ...prev, types: false }));
      } catch (err) {
        console.error('Error fetching job types:', err);
        // Fallback to client-side filtering if API fails
        if (jobs.length > 0) {
          const uniqueTypes = Array.from(new Set(jobs.map((job) => job.type)));
          setTypes(['All', ...uniqueTypes]);
        }
        setLoadingDropdowns((prev) => ({ ...prev, types: false }));
      }
    };

    fetchJobTypes();
  }, []); // Remove jobs dependency to prevent infinite loop

  // Fetch job statuses
  useEffect(() => {
    // Get job statuses from API service
    const jobStatuses = jobsApi.getJobStatuses();
    setStatuses(['All', ...jobStatuses]);
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...jobs];

    // Apply search
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerCaseSearch) ||
          job.description.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Apply department filter
    if (departmentFilter !== 'All') {
      result = result.filter((job) => job.department === departmentFilter);
    }

    // Apply location filter
    if (locationFilter !== 'All') {
      result = result.filter((job) => job.location === locationFilter);
    }

    // Apply type filter
    if (typeFilter !== 'All') {
      result = result.filter((job) => job.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter((job) => job.status === statusFilter);
    }

    // Sort results: Featured jobs first, then by posted date (newest first)
    result.sort((a, b) => {
      // First sort by featured status
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;

      // Then sort by posted date (newest first)
      const dateA = new Date(a.postedDate).getTime();
      const dateB = new Date(b.postedDate).getTime();
      return dateB - dateA;
    });

    setFilteredJobs(result);
  }, [jobs, searchTerm, departmentFilter, locationFilter, typeFilter, statusFilter]);

  // Toggle bookmark status
  const handleToggleBookmark = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setJobs(
      jobs.map((job) => (job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job))
    );
  };

  // View job details
  const handleViewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setJobDetailOpen(true);
  };

  // Delete job
  const handleDeleteJob = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const job = jobs.find((job) => job.id === jobId);

    // Only allow deletion of Draft and Closed jobs
    if (job && job.status === 'Active') {
      setSnackbarMessage('Active jobs cannot be deleted. Please close the job first.');
      setSnackbarOpen(true);
      return;
    }

    if (job && job.status === 'On-Hold') {
      setSnackbarMessage('On-Hold jobs cannot be deleted. Please close the job first.');
      setSnackbarOpen(true);
      return;
    }

    setJobToDelete(jobId);
    setDeleteDialogOpen(true);
  };

  // Confirm job deletion
  const confirmDeleteJob = async () => {
    if (jobToDelete) {
      try {
        // First update local state to provide immediate feedback
        setJobs(jobs.filter((job) => job.id !== jobToDelete));

        // In a real application, this would be an API call
        // Try to use the API service if available, but handle errors gracefully
        try {
          await jobsApi.deleteJob(jobToDelete);
          console.log(`Job ${jobToDelete} deleted via API`);
        } catch (apiError) {
          console.warn('API delete failed, but local state was updated:', apiError);
          // API failure is not critical since we've already updated the local state
        }

        setSnackbarMessage('Job deleted successfully');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error deleting job:', error);
        setSnackbarMessage('Failed to delete job: ' + (error.message || 'Unknown error'));
        setSnackbarOpen(true);
      } finally {
        // Close the dialog regardless of outcome
        setDeleteDialogOpen(false);
        setJobToDelete(null);
      }
    }
  };

  // Toggle job status
  const toggleJobStatus = (
    jobId: number,
    newStatus: 'Active' | 'On-Hold' | 'Closed',
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setJobs(
      jobs.map((job) => {
        if (job.id === jobId) {
          return { ...job, status: newStatus };
        }
        return job;
      })
    );
  };

  // Handle form input changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setNewJobForm({
      ...newJobForm,
      [name as string]: value,
    });

    // Clear error when field is being edited
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name as string]: false,
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewJobForm({
      ...newJobForm,
      [name]: checked,
    });
  };

  // Validate form fields
  const validateForm = (asDraft: boolean = false) => {
    // For draft jobs, only validate the title field
    if (asDraft) {
      const titleEmpty = !newJobForm.title || newJobForm.title.trim() === '';
      setFormErrors((prev) => ({ ...prev, title: titleEmpty }));
      return !titleEmpty;
    }

    // For publishing, perform full validation
    const errors = {
      title: !newJobForm.title || newJobForm.title.trim() === '',
      department: !newJobForm.department || newJobForm.department.trim() === '',
      location: !newJobForm.location || newJobForm.location.trim() === '',
      description: !newJobForm.description || newJobForm.description.trim() === '',
      responsibilities: !newJobForm.responsibilities || newJobForm.responsibilities.trim() === '',
      requirements: !newJobForm.requirements || newJobForm.requirements.trim() === '',
      experience: !newJobForm.experience || newJobForm.experience.trim() === '',
      skills: !newJobForm.skills || newJobForm.skills.trim() === '',
      salary: !newJobForm.salary || newJobForm.salary.trim() === '',
      benefits: !newJobForm.benefits || newJobForm.benefits.trim() === '',
    };

    setFormErrors(errors);

    // Check if any required fields are missing
    return !Object.values(errors).some((error) => error === true);
  };

  // Memoize form validity to avoid unnecessary calls to validateForm during render
  const isFormValid = useMemo(() => {
    const errors = {
      title: !newJobForm.title || newJobForm.title.trim() === '',
      department: !newJobForm.department || newJobForm.department.trim() === '',
      location: !newJobForm.location || newJobForm.location.trim() === '',
      description: !newJobForm.description || newJobForm.description.trim() === '',
      responsibilities: !newJobForm.responsibilities || newJobForm.responsibilities.trim() === '',
      requirements: !newJobForm.requirements || newJobForm.requirements.trim() === '',
      experience: !newJobForm.experience || newJobForm.experience.trim() === '',
      skills: !newJobForm.skills || newJobForm.skills.trim() === '',
      salary: !newJobForm.salary || newJobForm.salary.trim() === '',
      benefits: !newJobForm.benefits || newJobForm.benefits.trim() === '',
    };

    return !Object.values(errors).some((error) => error === true);
  }, [
    newJobForm.title,
    newJobForm.department,
    newJobForm.location,
    newJobForm.description,
    newJobForm.responsibilities,
    newJobForm.requirements,
    newJobForm.experience,
    newJobForm.skills,
    newJobForm.salary,
    newJobForm.benefits,
  ]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle opening the new job dialog
  const handleOpenNewJobDialog = () => {
    // Reset form first
    resetForm();
    setEditMode(false);
    setEditJobId(null);
    setActiveTab(0);
    setNewJobDialogOpen(true);
  };

  // Reset form function
  const resetForm = () => {
    setNewJobForm({
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      description: '',
      responsibilities: '',
      requirements: '',
      experience: '',
      skills: '',
      salary: '',
      benefits: '',
      isFeatured: false,
    });
    setFormErrors({
      title: false,
      department: false,
      location: false,
      description: false,
      responsibilities: false,
      requirements: false,
      experience: false,
      skills: false,
      salary: false,
      benefits: false,
    });
    setActiveTab(0);
  };

  // Edit an existing job
  const handleEditJob = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();

    // Only allow editing draft jobs
    if (job.status !== 'Draft') {
      setSnackbarMessage('Only draft jobs can be edited. Published jobs cannot be modified.');
      setSnackbarOpen(true);
      return;
    }

    // Format skills from the job data (if they exist)
    const skillsText = Array.isArray(job.skills) ? job.skills.join('\n') : job.skills || '';

    // Format benefits properly - could be a string or missing
    const benefitsText =
      typeof job.benefits === 'string'
        ? job.benefits
        : Array.isArray(job.benefits)
          ? job.benefits.join('\n')
          : '';

    setNewJobForm({
      title: job.title,
      department: job.department === 'Unspecified' ? '' : job.department,
      location: job.location === 'Unspecified' ? '' : job.location,
      type: job.type,
      experience: job.experience || '',
      salary: job.salary || '',
      description: job.description,
      responsibilities: job.responsibilities ? job.responsibilities.join('\n') : '',
      requirements: job.requirements ? job.requirements.join('\n') : '',
      skills: skillsText,
      benefits: benefitsText,
      isFeatured: job.isFeatured || false,
    });
    setFormErrors({
      title: false,
      department: false,
      location: false,
      description: false,
      responsibilities: false,
      requirements: false,
      experience: false,
      skills: false,
      salary: false,
      benefits: false,
    });
    setEditMode(true);
    setEditJobId(job.id);
    setActiveTab(0);
    setNewJobDialogOpen(true);
  };

  // Handle creating a new job
  const handleCreateNewJob = (asDraft: boolean = false) => {
    // Validate the form based on whether it's a draft or publish
    const isValid = validateForm(asDraft);

    if (!isValid) {
      // Show appropriate error message
      const message = asDraft
        ? 'A job title is required, even for drafts.'
        : 'Please fill in all required fields before publishing.';

      setSnackbarMessage(message);
      setSnackbarOpen(true);

      // For drafts, just go to the first tab
      if (asDraft) {
        setActiveTab(0);
        return;
      }

      // For publishing, check which tab has errors
      if (formErrors.title || formErrors.department || formErrors.location) {
        setActiveTab(0); // Job Summary tab
      } else if (formErrors.description || formErrors.responsibilities) {
        setActiveTab(1); // Job Outline tab
      } else if (formErrors.requirements || formErrors.experience || formErrors.skills) {
        setActiveTab(2); // Qualifications & Experience tab
      } else if (formErrors.salary || formErrors.benefits) {
        setActiveTab(3); // Salary & Benefits tab
      }
      return;
    }

    // If this is a draft save, just save directly
    if (asDraft) {
      saveOrUpdateJob(true);
      return;
    }

    // Show confirmation dialog for publishing
    if (editMode && editJobId) {
      // If editing a draft
      const existingJob = jobs.find((job) => job.id === editJobId);
      if (existingJob) {
        setJobToPublish({ job: existingJob, isNew: false });
        setPublishConfirmDialogOpen(true);
      }
    } else {
      // If creating a new job
      const newJobData: Partial<Job> = {
        title: newJobForm.title,
        department: newJobForm.department,
        location: newJobForm.location,
        type: newJobForm.type,
        experience: newJobForm.experience,
        salary: newJobForm.salary,
        description: newJobForm.description,
        responsibilities: newJobForm.responsibilities
          .split('\n')
          .filter((item) => item.trim() !== ''),
        requirements: newJobForm.requirements.split('\n').filter((item) => item.trim() !== ''),
        skills: newJobForm.skills.split('\n').filter((item) => item.trim() !== ''),
        benefits: newJobForm.benefits,
        isFeatured: newJobForm.isFeatured,
      };

      setJobToPublish({ job: newJobData, isNew: true });
      setPublishConfirmDialogOpen(true);
    }
  };

  // Function to actually save or update a job
  const saveOrUpdateJob = (asDraft: boolean = false) => {
    // If editing an existing job
    if (editMode && editJobId) {
      // Get the existing job
      const existingJob = jobs.find((job) => job.id === editJobId);

      // Only allow editing draft jobs
      if (existingJob && existingJob.status !== 'Draft') {
        setSnackbarMessage('Only draft jobs can be edited. Published jobs cannot be modified.');
        setSnackbarOpen(true);
        return;
      }

      const updatedJob: Partial<Job> = {
        title: newJobForm.title,
        department: newJobForm.department,
        location: newJobForm.location,
        type: newJobForm.type,
        experience: newJobForm.experience,
        salary: newJobForm.salary,
        description: newJobForm.description,
        responsibilities: newJobForm.responsibilities
          .split('\n')
          .filter((item) => item.trim() !== ''),
        requirements: newJobForm.requirements.split('\n').filter((item) => item.trim() !== ''),
        skills: newJobForm.skills.split('\n').filter((item) => item.trim() !== ''),
        benefits: newJobForm.benefits,
        isFeatured: newJobForm.isFeatured,
        status: asDraft ? 'Draft' : 'Active',
      };

      // If publishing, set posted date
      if (!asDraft) {
        updatedJob.postedDate = new Date().toISOString().split('T')[0];
      }

      // Update the job in state
      setJobs((prevJobs) =>
        prevJobs.map((job) => (job.id === editJobId ? { ...job, ...updatedJob } : job))
      );

      const message = asDraft
        ? `Job "${newJobForm.title}" saved as draft.`
        : `Job "${newJobForm.title}" updated and published.`;
      setSnackbarMessage(message);
      setSnackbarOpen(true);
    } else {
      // Create a new job
      const newJob: Omit<Job, 'id'> = {
        title: newJobForm.title || 'Untitled Draft Job',
        department: newJobForm.department || '',
        location: newJobForm.location || '',
        type: newJobForm.type || 'Full-time',
        experience: newJobForm.experience || '',
        salary: newJobForm.salary || '',
        postedDate: asDraft ? '' : new Date().toISOString().split('T')[0],
        createdDate: new Date().toISOString().split('T')[0], // Set created date to today
        description: newJobForm.description || '',
        responsibilities: newJobForm.responsibilities
          ? newJobForm.responsibilities.split('\n').filter((item) => item.trim() !== '')
          : [],
        requirements: newJobForm.requirements
          ? newJobForm.requirements.split('\n').filter((item) => item.trim() !== '')
          : [],
        skills: newJobForm.skills
          ? newJobForm.skills.split('\n').filter((item) => item.trim() !== '')
          : [],
        benefits: newJobForm.benefits || '',
        status: asDraft ? 'Draft' : 'Active',
        applicants: 0,
        isFeatured: newJobForm.isFeatured || false,
        isBookmarked: false,
      };

      // In a real app, this would be an API call
      const maxId = jobs.length > 0 ? Math.max(...jobs.map((job) => job.id)) : 0;
      const jobWithId = { ...newJob, id: maxId + 1 } as Job;

      setJobs((prevJobs) => [...prevJobs, jobWithId]);

      // Set a success message
      const message = asDraft
        ? `Job "${newJobForm.title || 'Untitled Job'}" saved as draft.`
        : `Job "${newJobForm.title}" published successfully.`;
      setSnackbarMessage(message);
      setSnackbarOpen(true);
    }

    // Close the dialog and reset the form
    setNewJobDialogOpen(false);
    resetForm();
    setEditMode(false);
    setEditJobId(null);
  };

  // Navigation to next tab
  const handleNextTab = () => {
    setActiveTab((prev) => Math.min(prev + 1, 3));
  };

  // Navigation to previous tab
  const handlePrevTab = () => {
    setActiveTab((prev) => Math.max(prev - 1, 0));
  };

  // Handle opening the share dialog
  const handleOpenShareDialog = (job: Job, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setJobToShare(job);
    setShareDialogOpen(true);
  };

  // Handle sharing a job (mock implementation)
  const handleShareJob = () => {
    if (!jobToShare || !emailTo) return;

    // In a real app, you would send this data to your backend
    console.log(`Sharing job "${jobToShare.title}" with ${emailTo}`);
    console.log(`Message: ${shareMessage}`);

    setShareDialogOpen(false);
    setJobToShare(null);
    setEmailTo('');
    setShareMessage('');
    setSnackbarMessage(`Job shared with ${emailTo} successfully!`);
    setSnackbarOpen(true);
  };

  // Handle opening the apply dialog
  const handleOpenApplyDialog = (job: Job) => {
    if (job.status !== 'Active') {
      setSnackbarMessage('You can only apply for active jobs.');
      setSnackbarOpen(true);
      return;
    }
    setJobToApply(job);
    setApplyDialogOpen(true);
  };

  // Handle applying for a job (mock implementation)
  const handleApplyForJob = () => {
    if (!jobToApply) return;

    // In a real app, you would collect resume and other application data
    console.log(`Applying for job: ${jobToApply.title}`);

    setApplyDialogOpen(false);
    setJobToApply(null);
    setSnackbarMessage('Your application has been submitted successfully!');
    setSnackbarOpen(true);
  };

  // Handle switch change
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewJobForm({
      ...newJobForm,
      isFeatured: event.target.checked,
    });
  };

  // Apply formatting to text
  const applyFormatting = (fieldName: string, format: keyof TextEditorState, value: any) => {
    // Get current text and selection
    const textField = document.getElementById(fieldName) as HTMLTextAreaElement;
    if (!textField) return;

    const start = textField.selectionStart;
    const end = textField.selectionEnd;
    const selectedText =
      newJobForm[fieldName as keyof typeof newJobForm]?.toString().substring(start, end) || '';

    if (selectedText.length === 0) {
      // Just update the format state if no text is selected
      // For list buttons, ensure they're mutually exclusive
      if (format === 'bulletList' && value === true) {
        setTextFormatState((prev) => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            [format]: value,
            numberList: false,
          },
        }));
      } else if (format === 'numberList' && value === true) {
        setTextFormatState((prev) => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            [format]: value,
            bulletList: false,
          },
        }));
      } else {
        setTextFormatState((prev) => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            [format]: value,
          },
        }));
      }
      return;
    }

    // Get the current text
    const fullText = newJobForm[fieldName as keyof typeof newJobForm]?.toString() || '';
    const before = fullText.substring(0, start);
    const after = fullText.substring(end);

    // Check if text already has formatting
    let newText = '';
    let isFormatted = false;
    let formattedText = selectedText;

    switch (format) {
      case 'bold':
        isFormatted = selectedText.startsWith('**') && selectedText.endsWith('**');
        if (value && !isFormatted) {
          // Apply bold
          formattedText = `**${selectedText}**`;
        } else if (!value || isFormatted) {
          // Remove bold
          formattedText = selectedText.replace(/^\*\*(.*)\*\*$/g, '$1');
        }
        break;
      case 'italic':
        isFormatted = selectedText.startsWith('_') && selectedText.endsWith('_');
        if (value && !isFormatted) {
          // Apply italic
          formattedText = `_${selectedText}_`;
        } else if (!value || isFormatted) {
          // Remove italic
          formattedText = selectedText.replace(/^_(.*?)_$/g, '$1');
        }
        break;
      case 'underline':
        isFormatted = selectedText.startsWith('__') && selectedText.endsWith('__');
        if (value && !isFormatted) {
          // Apply underline
          formattedText = `__${selectedText}__`;
        } else if (!value || isFormatted) {
          // Remove underline
          formattedText = selectedText.replace(/^__(.*?)__$/g, '$1');
        }
        break;
      case 'bulletList':
        // Check if text already has bullet points and remove any existing numbered list formatting
        isFormatted = selectedText.split('\n').every((line) => line.startsWith('• '));
        const hasNumbering = selectedText.split('\n').some((line) => /^\d+\.\s/.test(line));

        let cleanedText = selectedText;
        if (hasNumbering) {
          // Remove numbered list formatting first
          cleanedText = selectedText
            .split('\n')
            .map((line) => line.replace(/^\d+\.\s/, ''))
            .join('\n');
        }

        if (value && !isFormatted) {
          // Apply bullet list to clean text (without numbers)
          formattedText = cleanedText
            .split('\n')
            .map((line) => `• ${line}`)
            .join('\n');
        } else if (!value || isFormatted) {
          // Remove bullet list
          formattedText = selectedText
            .split('\n')
            .map((line) => line.replace(/^• /, ''))
            .join('\n');
        }

        // Also update the numberList state to false since they're mutually exclusive
        setTextFormatState((prev) => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            numberList: false,
          },
        }));
        break;
      case 'numberList':
        // Check if text already has numbering and remove any existing bullet list formatting
        isFormatted = selectedText
          .split('\n')
          .every((line, index) => line.match(new RegExp(`^${index + 1}\\. `)));
        const hasBullets = selectedText.split('\n').some((line) => line.startsWith('• '));

        let cleanTextForNumbering = selectedText;
        if (hasBullets) {
          // Remove bullet list formatting first
          cleanTextForNumbering = selectedText
            .split('\n')
            .map((line) => line.replace(/^• /, ''))
            .join('\n');
        }

        if (value && !isFormatted) {
          // Apply numbered list to clean text (without bullets)
          formattedText = cleanTextForNumbering
            .split('\n')
            .map((line, index) => `${index + 1}. ${line}`)
            .join('\n');
        } else if (!value || isFormatted) {
          // Remove numbered list
          formattedText = selectedText
            .split('\n')
            .map((line) => line.replace(/^\d+\. /, ''))
            .join('\n');
        }

        // Also update the bulletList state to false since they're mutually exclusive
        setTextFormatState((prev) => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            bulletList: false,
          },
        }));
        break;
      case 'alignment':
        // Check for existing alignment tags
        const centerFormatted = selectedText.match(/^<center>(.*)<\/center>$/s);
        const rightFormatted = selectedText.match(/^<right>(.*)<\/right>$/s);

        // Remove any existing alignment formatting first
        let cleanTextForAlignment = selectedText;
        if (centerFormatted) {
          cleanTextForAlignment = centerFormatted[1];
          isFormatted = value === 'center';
        } else if (rightFormatted) {
          cleanTextForAlignment = rightFormatted[1];
          isFormatted = value === 'right';
        }

        // Apply new alignment if needed
        if (value === 'left' || isFormatted) {
          formattedText = cleanTextForAlignment; // No tags for left alignment
        } else if (value === 'center') {
          formattedText = `<center>${cleanTextForAlignment}</center>`;
        } else if (value === 'right') {
          formattedText = `<right>${cleanTextForAlignment}</right>`;
        }
        break;
      default:
        formattedText = selectedText;
        break;
    }

    // Apply the formatted text
    newText = before + formattedText + after;

    // Update form state
    setNewJobForm({
      ...newJobForm,
      [fieldName]: newText,
    });

    // Update formatting state based on the result
    const newFormatState = { ...textFormatState[fieldName] };
    switch (format) {
      case 'bold':
        newFormatState.bold = formattedText.startsWith('**') && formattedText.endsWith('**');
        break;
      case 'italic':
        newFormatState.italic = formattedText.startsWith('_') && formattedText.endsWith('_');
        break;
      case 'underline':
        newFormatState.underline = formattedText.startsWith('__') && formattedText.endsWith('__');
        break;
      case 'bulletList':
        newFormatState.bulletList = formattedText
          .split('\n')
          .every((line) => line.startsWith('• '));
        newFormatState.numberList = false; // Make sure numberList is off when bulletList is on
        break;
      case 'numberList':
        newFormatState.numberList = formattedText
          .split('\n')
          .every((line, index) => line.match(new RegExp(`^${index + 1}\\. `)));
        newFormatState.bulletList = false; // Make sure bulletList is off when numberList is on
        break;
      case 'alignment':
        if (formattedText.match(/^<center>.*<\/center>$/s)) {
          newFormatState.alignment = 'center';
        } else if (formattedText.match(/^<right>.*<\/right>$/s)) {
          newFormatState.alignment = 'right';
        } else {
          newFormatState.alignment = 'left';
        }
        break;
    }

    setTextFormatState((prev) => ({
      ...prev,
      [fieldName]: newFormatState,
    }));

    // Set focus back to the text field and update selection
    setTimeout(() => {
      textField.focus();

      // Calculate new selection positions based on the changes to the text
      const selectionDiff = formattedText.length - selectedText.length;
      const newSelectionStart = start;
      const newSelectionEnd = end + selectionDiff;

      textField.setSelectionRange(newSelectionStart, newSelectionEnd);
    }, 10);
  };

  // Clear all formatting
  const clearFormatting = (fieldName: string) => {
    const textField = document.getElementById(fieldName) as HTMLTextAreaElement;
    if (!textField) return;

    const start = textField.selectionStart;
    const end = textField.selectionEnd;
    const selectedText =
      newJobForm[fieldName as keyof typeof newJobForm]?.toString().substring(start, end) || '';

    // Remove all formatting markers
    const cleanText = selectedText
      .replace(/\*\*(.*?)\*\*/g, '$1') // bold
      .replace(/_(.*?)_/g, '$1') // italic
      .replace(/__(.*?)__/g, '$1') // underline
      .replace(/^• /gm, '') // bullet points
      .replace(/^\d+\. /gm, '') // numbered lists
      .replace(/<center>(.*?)<\/center>/gs, '$1') // center alignment
      .replace(/<right>(.*?)<\/right>/gs, '$1'); // right alignment

    // Apply the clean text
    const newText = newJobForm[fieldName as keyof typeof newJobForm]?.toString() || '';
    const before = newText.substring(0, start);
    const after = newText.substring(end);
    const updatedText = before + cleanText + after;

    setNewJobForm({
      ...newJobForm,
      [fieldName]: updatedText,
    });

    // Reset formatting options for this field only
    setTextFormatState((prev) => ({
      ...prev,
      [fieldName]: {
        bold: false,
        italic: false,
        underline: false,
        bulletList: false,
        numberList: false,
        alignment: 'left',
      },
    }));

    // Set focus back to the text field
    setTimeout(() => {
      textField.focus();
      // Preserve the actual selected text position
      textField.setSelectionRange(start, start + cleanText.length);
    }, 10);
  };

  // Handle alignment format change
  const handleAlignmentChange = (
    fieldName: string,
    alignment: 'left' | 'center' | 'right' | null
  ) => {
    if (alignment) {
      applyFormatting(fieldName, 'alignment', alignment);
    }
  };

  // Show preview dialog for formatted text
  const showPreview = (fieldName: string, fieldLabel: string) => {
    const content = newJobForm[fieldName as keyof typeof newJobForm]?.toString() || '';

    // Apply markdown-like formatting for display
    let formattedContent = content
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Underline
      .replace(/__(.*?)__/g, '<u>$1</u>')
      // Bullet lists
      .replace(/^• (.*)$/gm, '<li>$1</li>')
      // Numbered lists
      .replace(/^\d+\. (.*)$/gm, '<li>$1</li>')
      // Center alignment
      .replace(/<center>(.*?)<\/center>/gs, '<div style="text-align: center">$1</div>')
      // Right alignment
      .replace(/<right>(.*?)<\/right>/gs, '<div style="text-align: right">$1</div>');

    // Add proper list tags
    if (formattedContent.includes('<li>')) {
      formattedContent = '<ul>' + formattedContent + '</ul>';
      // Fix nested lists if any
      formattedContent = formattedContent.replace(/<\/ul><ul>/g, '');
    }

    // Add paragraph tags for better readability
    formattedContent = formattedContent
      .split('\n\n')
      .map((para) => (para.trim().length > 0 ? `<p>${para}</p>` : ''))
      .join('');

    setPreviewContent(formattedContent);
    setPreviewTitle(fieldLabel);
    setPreviewDialogOpen(true);
  };

  // Render a text editor toolbar for a given field
  const renderTextEditorToolbar = (fieldName: string, fieldLabel: string) => {
    const formatState = textFormatState[fieldName];

    return (
      <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <ToggleButtonGroup size="small">
          <ToggleButton
            value="bold"
            selected={formatState.bold}
            onChange={(_, value) => applyFormatting(fieldName, 'bold', value)}
            aria-label="bold"
          >
            <FormatBoldIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="italic"
            selected={formatState.italic}
            onChange={(_, value) => applyFormatting(fieldName, 'italic', value)}
            aria-label="italic"
          >
            <FormatItalicIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="underline"
            selected={formatState.underline}
            onChange={(_, value) => applyFormatting(fieldName, 'underline', value)}
            aria-label="underline"
          >
            <FormatUnderlinedIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup size="small">
          <ToggleButton
            value="bulletList"
            selected={formatState.bulletList}
            onChange={(_, value) => applyFormatting(fieldName, 'bulletList', value)}
            aria-label="bullet list"
          >
            <FormatListBulletedIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="numberList"
            selected={formatState.numberList}
            onChange={(_, value) => applyFormatting(fieldName, 'numberList', value)}
            aria-label="number list"
          >
            <FormatListNumberedIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={formatState.alignment}
          onChange={(_, value) => handleAlignmentChange(fieldName, value)}
        >
          <ToggleButton value="left" aria-label="align left">
            <FormatAlignLeftIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="center" aria-label="align center">
            <FormatAlignCenterIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="right" aria-label="align right">
            <FormatAlignRightIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        <IconButton
          size="small"
          onClick={() => clearFormatting(fieldName)}
          aria-label="clear formatting"
        >
          <FormatClearIcon fontSize="small" />
        </IconButton>

        <Button
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => showPreview(fieldName, fieldLabel)}
          sx={{ ml: 'auto' }}
        >
          Preview
        </Button>
      </Box>
    );
  };

  // Format salary with thousand separators
  const formatSalary = (value: string) => {
    // Remove any non-digit characters except decimal point
    let sanitized = value.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }

    // Split by decimal point to handle integers and decimals separately
    const [integerPart, decimalPart] = sanitized.split('.');

    // Add thousand separators to the integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Combine the parts
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  // Handle salary input with thousand separator formatting
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatSalary(value);

    setNewJobForm({
      ...newJobForm,
      salary: formattedValue,
    });
  };

  // Render the responsibilities, requirements and other sections in job details view
  const renderFormattedContent = (content: string | string[]) => {
    if (!content) return null;

    // Convert array to string if needed
    const contentStr = Array.isArray(content) ? content.join('\n') : content;

    // Replace bullet points to avoid double bullets in view mode
    const formattedContent = contentStr
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Underline
      .replace(/__(.*?)__/g, '<u>$1</u>')
      // Bullet lists (avoid adding <li> tags since we'll manually add list items below)
      .replace(/^• (.*)$/gm, '$1')
      // Numbered lists (avoid adding <li> tags since we'll manually add list items below)
      .replace(/^\d+\. (.*)$/gm, '$1')
      // Center alignment
      .replace(/<center>(.*?)<\/center>/gs, '<div style="text-align: center">$1</div>')
      // Right alignment
      .replace(/<right>(.*?)<\/right>/gs, '<div style="text-align: right">$1</div>');

    // Split by new line and create list items
    const items = formattedContent.split('\n').filter((item) => item.trim() !== '');

    return (
      <ul>
        {items.map((item, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>
    );
  };

  // Toggle job feature status
  const toggleJobFeatured = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Get the current featured status to toggle
    const job = jobs.find((j) => j.id === jobId);
    const newFeaturedStatus = job ? !job.isFeatured : false;

    // Update the main jobs list
    const updatedJobs = jobs.map((job) =>
      job.id === jobId ? { ...job, isFeatured: newFeaturedStatus } : job
    );
    setJobs(updatedJobs);

    // Update filtered jobs list to ensure consistency in the UI
    setFilteredJobs((prevFilteredJobs) =>
      prevFilteredJobs.map((job) =>
        job.id === jobId ? { ...job, isFeatured: newFeaturedStatus } : job
      )
    );

    // Also update selectedJob if it's the one being toggled
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob({ ...selectedJob, isFeatured: newFeaturedStatus });
    }

    // Log the change for debugging
    console.log(`Job ${jobId} featured status changed to: ${newFeaturedStatus}`);
  };

  // Render job cards
  const renderJobCard = (job: Job) => {
    const daysAgo = getDaysAgo(job.postedDate);
    const isJobBookmarked = job.isBookmarked || false;

    return (
      <Card
        key={job.id}
        sx={{
          mb: 2,
          position: 'relative',
          borderLeft: job.isFeatured ? '4px solid #ffc107' : 'none',
          opacity: job.status === 'Closed' ? 0.7 : 1,
        }}
      >
        {/* Status tags container */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'row-reverse', // Reverse to keep draft on right if both present
            gap: 1,
            zIndex: 1,
          }}
        >
          {/* Draft tag */}
          {job.status === 'Draft' && (
            <Chip
              label="DRAFT"
              color="warning"
              size="small"
              sx={{
                fontWeight: 'bold',
              }}
            />
          )}

          {/* Status tag for non-Draft statuses */}
          {job.status !== 'Draft' && (
            <Chip
              label={job.status}
              color={
                job.status === 'Active' ? 'success' : job.status === 'On-Hold' ? 'warning' : 'error'
              }
              size="small"
            />
          )}

          {/* Featured tag */}
          {job.isFeatured && (
            <Chip
              icon={
                <StarIcon
                  fontSize="small"
                  sx={{
                    color: amber[500],
                    animation: 'pulse 1.5s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 0.7 },
                      '50%': { opacity: 1 },
                      '100%': { opacity: 0.7 },
                    },
                  }}
                />
              }
              label="Featured"
              size="small"
              sx={{
                background: `linear-gradient(45deg, ${deepPurple[700]} 0%, ${purple[500]} 100%)`,
                color: '#ffffff',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.3s ease',
                '& .MuiChip-label': {
                  color: '#ffffff',
                },
                '& .MuiChip-icon': {
                  color: amber[500],
                },
              }}
            />
          )}
        </Box>

        <CardActionArea onClick={() => handleViewJobDetails(job)}>
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <Typography variant="h6" component="div">
                {job.title}
              </Typography>
              <Box>
                {/* Remove status chips from here since they're now in the top-right container */}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1, color: 'text.secondary' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{job.location}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{job.department}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SalaryIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{job.salary || 'Not specified'}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{job.applicants} applicants</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DateIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {job.status === 'Draft' ? (
                    job.createdDate ? (
                      <>
                        Created on {formatDate(job.createdDate)}
                        <span style={{ color: '#757575', fontSize: '0.9em', marginLeft: '4px' }}>
                          ({getDaysAgo(job.createdDate)}{' '}
                          {getDaysAgo(job.createdDate) === 1 ? 'day' : 'days'} ago)
                        </span>
                      </>
                    ) : (
                      'Created recently'
                    )
                  ) : (
                    <>
                      Posted on {formatDate(job.postedDate)}{' '}
                      <span style={{ color: '#757575', fontSize: '0.9em' }}>
                        ({daysAgo} {daysAgo === 1 ? 'day' : 'days'} ago)
                      </span>
                    </>
                  )}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
              {job.description.length > 120
                ? `${job.description.substring(0, 120)}...`
                : job.description}
            </Typography>
          </CardContent>
        </CardActionArea>

        <CardActions>
          <ButtonGroup variant="text" size="small">
            {job.status === 'Draft' ? (
              <>
                <Button startIcon={<EditIcon />} onClick={(e) => handleEditJob(job, e)}>
                  Edit
                </Button>
                <Button
                  startIcon={<PlayArrowIcon />}
                  onClick={(e) => handlePublishDraft(job, e)}
                  color="success"
                >
                  Publish
                </Button>
              </>
            ) : (
              <Button startIcon={<VisibilityIcon />} onClick={() => handleViewJobDetails(job)}>
                View
              </Button>
            )}

            {job.status === 'Active' ? (
              <>
                <Button
                  startIcon={<PauseIcon />}
                  onClick={(e) => toggleJobStatus(job.id, 'On-Hold', e)}
                  color="warning"
                >
                  Pause
                </Button>
                <Button
                  startIcon={<BlockIcon />}
                  onClick={(e) => toggleJobStatus(job.id, 'Closed', e)}
                  color="error"
                >
                  Close
                </Button>
              </>
            ) : job.status === 'On-Hold' ? (
              <>
                <Button
                  startIcon={<PlayArrowIcon />}
                  onClick={(e) => toggleJobStatus(job.id, 'Active', e)}
                  color="success"
                >
                  Activate
                </Button>
                <Button
                  startIcon={<BlockIcon />}
                  onClick={(e) => toggleJobStatus(job.id, 'Closed', e)}
                  color="error"
                >
                  Close
                </Button>
              </>
            ) : null}

            <Button startIcon={<ShareIcon />} onClick={(e) => handleOpenShareDialog(job, e)}>
              Share
            </Button>

            <IconButton
              size="small"
              onClick={(e) => handleToggleBookmark(job.id, e)}
              color={isJobBookmarked ? 'primary' : 'default'}
              aria-label={isJobBookmarked ? 'Remove bookmark' : 'Bookmark job'}
            >
              {isJobBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </ButtonGroup>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={job.isFeatured ? 'Remove from featured' : 'Mark as featured'}>
            <IconButton
              size="small"
              onClick={(e) => toggleJobFeatured(job.id, e)}
              sx={{
                color: job.isFeatured ? amber[500] : 'inherit',
                transition: 'transform 0.2s ease, color 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  color: job.isFeatured ? amber[600] : amber[300],
                },
              }}
            >
              {job.isFeatured ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete job">
            <IconButton size="small" onClick={(e) => handleDeleteJob(job.id, e)} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    );
  };

  // Add new method to publish a draft job
  const handlePublishDraft = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    // In a real application, this would be an API call
    // Check if the job is complete enough to be published
    const requiredFields = [
      'title',
      'department',
      'location',
      'type',
      'description',
      'responsibilities',
      'requirements',
      'experience',
      'skills',
      'salary',
      'benefits',
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        !job[field as keyof Job] ||
        (Array.isArray(job[field as keyof Job]) &&
          (job[field as keyof Job] as any[]).length === 0) ||
        (typeof job[field as keyof Job] === 'string' &&
          (job[field as keyof Job] as string).trim() === '')
    );

    if (missingFields.length > 0) {
      setSnackbarMessage(`Cannot publish incomplete job. Missing: ${missingFields.join(', ')}`);
      setSnackbarOpen(true);

      // Open the edit form to allow the user to complete the job
      handleEditJob(job, e);
      return;
    }

    // Show publish confirmation dialog
    setJobToPublish({ job, isNew: false });
    setPublishConfirmDialogOpen(true);
  };

  // Function to confirm publishing a job
  const confirmPublishJob = () => {
    if (!jobToPublish) return;

    const { job, isNew } = jobToPublish;

    if (isNew) {
      // Handle publishing a new job
      saveOrUpdateJob(false); // This will actually save the job with status 'Active'
    } else if (job.id) {
      // Handle publishing an existing draft
      setJobs((prevJobs) =>
        prevJobs.map((j) =>
          j.id === job.id
            ? {
                ...j, // Preserve all existing job properties
                status: 'Active',
                postedDate: new Date().toISOString().split('T')[0],
              }
            : j
        )
      );

      setSnackbarMessage(`Job "${job.title}" has been published successfully.`);
      setSnackbarOpen(true);
    }

    // Close both dialogs
    setPublishConfirmDialogOpen(false);
    setNewJobDialogOpen(false); // Close the edit/new job dialog as well
    setJobToPublish(null);
  };

  return (
    <Box sx={{ padding: 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#FFF4F4' }}>
          <Typography color="error">{error}</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Paper>
      ) : (
        <Box>
          {/* Control Panel */}
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Job Board ({filteredJobs.length} Jobs)</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenNewJobDialog}
            >
              Post New Job
            </Button>
          </Box>

          {/* Filters and Search */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid component="div" item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search jobs by title or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>

              <Grid component="div" item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid component="div" item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={departmentFilter}
                        label="Department"
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        endAdornment={
                          loadingDropdowns.departments && (
                            <CircularProgress size={20} sx={{ mr: 2 }} />
                          )
                        }
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid component="div" item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Location</InputLabel>
                      <Select
                        value={locationFilter}
                        label="Location"
                        onChange={(e) => setLocationFilter(e.target.value)}
                        endAdornment={
                          loadingDropdowns.locations && (
                            <CircularProgress size={20} sx={{ mr: 2 }} />
                          )
                        }
                      >
                        {locations.map((loc) => (
                          <MenuItem key={loc} value={loc}>
                            {loc}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid component="div" item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Job Type</InputLabel>
                      <Select
                        value={typeFilter}
                        label="Job Type"
                        onChange={(e) => setTypeFilter(e.target.value)}
                        endAdornment={
                          loadingDropdowns.types && <CircularProgress size={20} sx={{ mr: 2 }} />
                        }
                      >
                        {types.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid component="div" item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        {statuses.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Job Listings */}
          <Grid container spacing={3}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <Grid item xs={12} md={6} lg={4} key={job.id}>
                  {renderJobCard(job)}
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No jobs found matching your criteria
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try adjusting your filters or search terms
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* Job Detail Dialog */}
          <Dialog
            open={jobDetailOpen}
            onClose={() => setJobDetailOpen(false)}
            fullWidth
            maxWidth="md"
            scroll="paper"
          >
            {selectedJob && (
              <>
                <DialogTitle>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <Typography variant="h6">{selectedJob.title}</Typography>
                      {selectedJob.isFeatured && (
                        <Chip
                          icon={
                            <StarIcon
                              fontSize="small"
                              sx={{
                                color: amber[500],
                                animation: 'pulse 1.5s infinite',
                                '@keyframes pulse': {
                                  '0%': { opacity: 0.7 },
                                  '50%': { opacity: 1 },
                                  '100%': { opacity: 0.7 },
                                },
                              }}
                            />
                          }
                          label="Featured"
                          size="small"
                          sx={{
                            ml: 1,
                            background: `linear-gradient(45deg, ${deepPurple[700]} 0%, ${purple[500]} 100%)`,
                            color: '#ffffff',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            '&:hover': {
                              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                            },
                            transition: 'all 0.3s ease',
                            '& .MuiChip-label': {
                              color: '#ffffff',
                            },
                            '& .MuiChip-icon': {
                              color: amber[500],
                            },
                          }}
                        />
                      )}
                    </Box>
                    <IconButton onClick={() => setJobDetailOpen(false)} size="small">
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent dividers>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                          Job Summary
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {selectedJob.description}
                        </Typography>
                      </Box>

                      <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                          Responsibilities
                        </Typography>
                        {renderFormattedContent(selectedJob.responsibilities)}
                      </Box>

                      <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                          Candidate Requirements
                        </Typography>
                        {renderFormattedContent(selectedJob.requirements)}
                      </Box>

                      {/* Benefits section */}
                      <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                          Compensation and Benefits
                        </Typography>
                        {selectedJob.benefits ? (
                          renderFormattedContent(selectedJob.benefits)
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No benefits specified
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Job Information
                        </Typography>

                        <Box display="flex" alignItems="center" mb={1}>
                          <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            <strong>Location:</strong> {selectedJob.location}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                          <BusinessIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            <strong>Department:</strong> {selectedJob.department}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                          <SalaryIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            <strong>Salary:</strong> {selectedJob.salary}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                          <Typography variant="body2">
                            <strong>Type:</strong> {selectedJob.type}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                          <Typography variant="body2">
                            <strong>Experience:</strong> {selectedJob.experience}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                          <Typography variant="body2">
                            <strong>Status:</strong> {selectedJob.status}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                          <DateIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            <strong>Posted:</strong>{' '}
                            {selectedJob.status === 'Draft'
                              ? 'Not published yet'
                              : formatDate(selectedJob.postedDate)}
                          </Typography>
                        </Box>
                      </Paper>

                      <Stack spacing={1}>
                        {selectedJob.status === 'Active' && (
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => handleOpenApplyDialog(selectedJob)}
                          >
                            Apply For This Job
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          startIcon={
                            selectedJob.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />
                          }
                          fullWidth
                          onClick={(e) => handleToggleBookmark(selectedJob.id, e)}
                        >
                          {selectedJob.isBookmarked ? 'Saved' : 'Save Job'}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<ShareIcon />}
                          fullWidth
                          onClick={(e) => handleOpenShareDialog(selectedJob)}
                        >
                          Share Job
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setJobDetailOpen(false)}>Close</Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this job posting? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmDeleteJob} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Post New Job Dialog - Redesigned with tabs and more space */}
          <Dialog
            open={newJobDialogOpen}
            onClose={() => setNewJobDialogOpen(false)}
            fullWidth
            maxWidth="lg"
            PaperProps={{
              sx: { minHeight: '80vh' },
            }}
          >
            <DialogTitle>
              {editMode ? 'Edit Job' : 'Post New Job'}
              <IconButton
                aria-label="close"
                onClick={() => setNewJobDialogOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="job creation tabs"
                  >
                    <Tab label="Job Summary" />
                    <Tab label="Job Outline" />
                    <Tab label="Qualifications & Experience" />
                    <Tab label="Salary & Benefits" />
                  </Tabs>
                </Box>

                {/* Tab 1: Job Summary */}
                {activeTab === 0 && (
                  <Box sx={{ p: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Basic Job Information
                    </Typography>
                    <TextField
                      fullWidth
                      label="Job Title"
                      name="title"
                      margin="normal"
                      required
                      value={newJobForm.title}
                      onChange={handleFormChange}
                      error={formErrors.title}
                      helperText={formErrors.title ? 'Job title is required' : ''}
                    />

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Department"
                          name="department"
                          required
                          value={newJobForm.department}
                          onChange={handleFormChange}
                          error={formErrors.department}
                          helperText={formErrors.department ? 'Department is required' : ''}
                          placeholder="e.g., Engineering, Marketing, HR"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Location"
                          name="location"
                          required
                          value={newJobForm.location}
                          onChange={handleFormChange}
                          error={formErrors.location}
                          helperText={formErrors.location ? 'Location is required' : ''}
                          placeholder="e.g., New York, Remote, San Francisco"
                        />
                      </Grid>
                    </Grid>

                    <FormControl fullWidth margin="normal">
                      <InputLabel>Job Type</InputLabel>
                      <Select
                        label="Job Type"
                        name="type"
                        value={newJobForm.type}
                        onChange={handleFormChange}
                        required
                      >
                        <MenuItem value="Full-time">Full-time</MenuItem>
                        <MenuItem value="Part-time">Part-time</MenuItem>
                        <MenuItem value="Contract">Contract</MenuItem>
                        <MenuItem value="Temporary">Temporary</MenuItem>
                        <MenuItem value="Internship">Internship</MenuItem>
                      </Select>
                    </FormControl>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Featured Status
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={newJobForm.isFeatured}
                            onChange={handleSwitchChange}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: amber[500],
                                '&:hover': {
                                  backgroundColor: alpha(amber[500], 0.1),
                                },
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: deepPurple[500],
                              },
                              '& .MuiSwitch-thumb': {
                                boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {newJobForm.isFeatured ? (
                              <StarIcon
                                sx={{
                                  mr: 1,
                                  color: amber[500],
                                  animation: 'pulse 1.5s infinite',
                                  '@keyframes pulse': {
                                    '0%': { opacity: 0.7 },
                                    '50%': { opacity: 1 },
                                    '100%': { opacity: 0.7 },
                                  },
                                }}
                              />
                            ) : (
                              <StarBorderIcon sx={{ mr: 1 }} />
                            )}
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: newJobForm.isFeatured ? 'bold' : 'normal',
                                background: newJobForm.isFeatured
                                  ? `linear-gradient(45deg, ${deepPurple[700]} 30%, ${purple[500]} 90%)`
                                  : 'inherit',
                                WebkitBackgroundClip: newJobForm.isFeatured ? 'text' : 'inherit',
                                WebkitTextFillColor: newJobForm.isFeatured
                                  ? 'transparent'
                                  : 'inherit',
                              }}
                            >
                              {newJobForm.isFeatured ? 'Featured Job' : 'Standard Job'}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  </Box>
                )}

                {/* Tab 2: Job Outline */}
                {activeTab === 1 && (
                  <Box sx={{ p: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Job Description and Responsibilities
                    </Typography>

                    <Box sx={{ position: 'relative', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" component="label" htmlFor="description">
                          Job Description
                          <Typography component="span" color="error">
                            *
                          </Typography>
                        </Typography>
                        <Tooltip title="Provide a comprehensive overview of the job, including its purpose, main duties, and how it fits into the organization">
                          <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                        </Tooltip>
                      </Box>
                      {renderTextEditorToolbar('description', 'Job Description')}
                      <TextField
                        id="description"
                        fullWidth
                        name="description"
                        multiline
                        rows={8}
                        required
                        value={newJobForm.description}
                        onChange={handleFormChange}
                        error={formErrors.description}
                        helperText={
                          formErrors.description
                            ? 'Job description is required'
                            : 'Max 2000 characters'
                        }
                        inputProps={{ maxLength: 2000 }}
                      />
                    </Box>

                    <Box sx={{ position: 'relative' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography
                          variant="subtitle1"
                          component="label"
                          htmlFor="responsibilities"
                        >
                          Responsibilities
                          <Typography component="span" color="error">
                            *
                          </Typography>
                        </Typography>
                        <Tooltip title="List the key responsibilities for this position, enter each responsibility on a new line">
                          <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                        </Tooltip>
                      </Box>
                      {renderTextEditorToolbar('responsibilities', 'Responsibilities')}
                      <TextField
                        id="responsibilities"
                        fullWidth
                        name="responsibilities"
                        multiline
                        rows={8}
                        value={newJobForm.responsibilities}
                        onChange={handleFormChange}
                        placeholder="Enter each responsibility on a new line"
                        helperText={
                          formErrors.responsibilities
                            ? 'Responsibilities are required'
                            : 'Max 1000 characters'
                        }
                        inputProps={{ maxLength: 1000 }}
                        required
                        error={formErrors.responsibilities}
                      />
                    </Box>
                  </Box>
                )}

                {/* Tab 3: Qualifications & Experience */}
                {activeTab === 2 && (
                  <Box sx={{ p: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Candidate Requirements
                    </Typography>

                    <Box sx={{ position: 'relative', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" component="label" htmlFor="experience">
                          Experience Required
                          <Typography component="span" color="error">
                            *
                          </Typography>
                        </Typography>
                        <Tooltip title="Specify the years of experience needed for this position">
                          <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                        </Tooltip>
                      </Box>
                      <TextField
                        id="experience"
                        fullWidth
                        name="experience"
                        margin="normal"
                        value={newJobForm.experience}
                        onChange={handleFormChange}
                        placeholder="e.g., 3-5 years in similar role"
                        helperText={
                          formErrors.experience ? 'Experience is required' : 'Max 100 characters'
                        }
                        inputProps={{ maxLength: 100 }}
                        required
                        error={formErrors.experience}
                      />
                    </Box>

                    <Box sx={{ position: 'relative', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" component="label" htmlFor="requirements">
                          Qualifications
                          <Typography component="span" color="error">
                            *
                          </Typography>
                        </Typography>
                        <Tooltip title="List the qualifications required for this position, such as education, certifications, or knowledge areas">
                          <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                        </Tooltip>
                      </Box>
                      {renderTextEditorToolbar('requirements', 'Qualifications')}
                      <TextField
                        id="requirements"
                        fullWidth
                        name="requirements"
                        multiline
                        rows={6}
                        value={newJobForm.requirements}
                        onChange={handleFormChange}
                        placeholder="Enter each qualification on a new line"
                        helperText={
                          formErrors.requirements
                            ? 'Qualifications are required'
                            : 'Max 1000 characters'
                        }
                        inputProps={{ maxLength: 1000 }}
                        required
                        error={formErrors.requirements}
                      />
                    </Box>

                    <Box sx={{ position: 'relative' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" component="label" htmlFor="skills">
                          Skills
                          <Typography component="span" color="error">
                            *
                          </Typography>
                        </Typography>
                        <Tooltip title="Specify technical or soft skills needed for the role, one per line">
                          <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                        </Tooltip>
                      </Box>
                      {renderTextEditorToolbar('skills', 'Skills')}
                      <TextField
                        id="skills"
                        fullWidth
                        name="skills"
                        multiline
                        rows={4}
                        value={newJobForm.skills}
                        onChange={handleFormChange}
                        placeholder="Enter each skill on a new line"
                        helperText={
                          formErrors.skills ? 'Skills are required' : 'Max 500 characters'
                        }
                        inputProps={{ maxLength: 500 }}
                        required
                        error={formErrors.skills}
                      />
                    </Box>
                  </Box>
                )}

                {/* Tab 4: Salary & Benefits */}
                {activeTab === 3 && (
                  <Box sx={{ p: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Compensation and Benefits
                    </Typography>

                    <Box sx={{ position: 'relative', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" component="label" htmlFor="salary">
                          Salary Range
                          <Typography component="span" color="error">
                            *
                          </Typography>
                        </Typography>
                        <Tooltip title="Provide a salary range to attract the right candidates">
                          <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                        </Tooltip>
                      </Box>
                      <TextField
                        id="salary"
                        fullWidth
                        name="salary"
                        margin="normal"
                        value={newJobForm.salary}
                        onChange={handleSalaryChange}
                        placeholder="e.g., $80,000 - $100,000"
                        helperText={formErrors.salary ? 'Salary is required' : 'Max 100 characters'}
                        inputProps={{ maxLength: 100 }}
                        required
                        error={formErrors.salary}
                      />
                    </Box>

                    <Box sx={{ position: 'relative' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" component="label" htmlFor="benefits">
                          Benefits
                          <Typography component="span" color="error">
                            *
                          </Typography>
                        </Typography>
                        <Tooltip title="List benefits such as healthcare, 401k, time off, work-from-home options, etc.">
                          <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                        </Tooltip>
                      </Box>
                      {renderTextEditorToolbar('benefits', 'Benefits')}
                      <TextField
                        id="benefits"
                        fullWidth
                        name="benefits"
                        multiline
                        rows={8}
                        value={newJobForm.benefits}
                        onChange={handleFormChange}
                        placeholder="Enter each benefit on a new line"
                        helperText={
                          formErrors.benefits ? 'Benefits are required' : 'Max 1000 characters'
                        }
                        inputProps={{ maxLength: 1000 }}
                        required
                        error={formErrors.benefits}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions
              sx={{
                px: 3,
                py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(0, 0, 0, 0.12)',
              }}
            >
              <Box>
                <Button onClick={() => setNewJobDialogOpen(false)} color="inherit">
                  Cancel
                </Button>
              </Box>

              <Box display="flex" gap={1}>
                {activeTab > 0 && (
                  <Button
                    onClick={handlePrevTab}
                    startIcon={<KeyboardArrowLeft />}
                    variant="outlined"
                  >
                    Previous
                  </Button>
                )}

                {activeTab < 3 && (
                  <Button
                    onClick={handleNextTab}
                    endIcon={<KeyboardArrowRight />}
                    variant="outlined"
                  >
                    Next
                  </Button>
                )}

                {/* Draft and Publish buttons */}
                <Box sx={{ ml: 1 }}>
                  <ButtonGroup variant="contained">
                    <Button
                      onClick={() => handleCreateNewJob(true)}
                      startIcon={
                        <CloudUploadIcon
                          sx={{
                            animation: 'float 3s ease-in-out infinite',
                            '@keyframes float': {
                              '0%, 100%': { transform: 'translateY(0)' },
                              '50%': { transform: 'translateY(-3px)' },
                            },
                          }}
                        />
                      }
                      sx={{
                        background: `linear-gradient(45deg, ${amber[700]} 0%, ${amber[500]} 100%)`,
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 3px 5px 2px rgba(255, 193, 7, 0.3)',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${amber[800]} 0%, ${amber[600]} 100%)`,
                          boxShadow: '0 4px 8px 2px rgba(255, 193, 7, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background:
                            'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: '0.5s',
                        },
                        '&:hover::after': {
                          left: '100%',
                        },
                      }}
                      disabled={!newJobForm.title || newJobForm.title.trim() === ''}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      onClick={() => handleCreateNewJob(false)}
                      startIcon={
                        <PublishIcon
                          sx={{
                            animation: 'rise 2s ease-in-out infinite',
                            '@keyframes rise': {
                              '0%, 100%': { transform: 'translateY(0)' },
                              '50%': { transform: 'translateY(-3px)' },
                            },
                          }}
                        />
                      }
                      sx={{
                        background: 'linear-gradient(45deg, #2e7d32 0%, #4caf50 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 3px 5px 2px rgba(76, 175, 80, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1b5e20 0%, #388e3c 100%)',
                          boxShadow: '0 4px 8px 2px rgba(76, 175, 80, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background:
                            'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: '0.5s',
                        },
                        '&:hover::after': {
                          left: '100%',
                        },
                      }}
                      disabled={!isFormValid}
                    >
                      Publish Job
                    </Button>
                  </ButtonGroup>
                </Box>
              </Box>
            </DialogActions>
          </Dialog>

          {/* Share Job Dialog */}
          <Dialog
            open={shareDialogOpen}
            onClose={() => setShareDialogOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Share Job</DialogTitle>
            <DialogContent>
              {jobToShare && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Sharing: {jobToShare.title}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    margin="normal"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Message (Optional)"
                    margin="normal"
                    multiline
                    rows={4}
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    placeholder="Check out this job opportunity that might interest you!"
                  />
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleShareJob}
                disabled={!emailTo}
              >
                Share
              </Button>
            </DialogActions>
          </Dialog>

          {/* Apply For Job Dialog */}
          <Dialog
            open={applyDialogOpen}
            onClose={() => setApplyDialogOpen(false)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>Apply For Job</DialogTitle>
            <DialogContent>
              {jobToApply && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Applying for: {jobToApply.title}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="First Name" margin="normal" required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Last Name" margin="normal" required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Email" type="email" margin="normal" required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Phone" margin="normal" required />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Resume/CV
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                      >
                        Upload Resume
                        <input type="file" hidden />
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Cover Letter (Optional)
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                      >
                        Upload Cover Letter
                        <input type="file" hidden />
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Additional Information"
                        margin="normal"
                        multiline
                        rows={4}
                        placeholder="Include any additional information you'd like to share with the hiring team."
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" color="primary" onClick={handleApplyForJob}>
                Submit Application
              </Button>
            </DialogActions>
          </Dialog>

          {/* Preview Dialog */}
          <Dialog
            open={previewDialogOpen}
            onClose={() => setPreviewDialogOpen(false)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Preview: {previewTitle}</Typography>
                <IconButton onClick={() => setPreviewDialogOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <div dangerouslySetInnerHTML={{ __html: previewContent }} />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Publish Confirmation Dialog */}
          <Dialog
            open={publishConfirmDialogOpen}
            onClose={() => setPublishConfirmDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <PublishIcon color="warning" />
                <Typography variant="h6">Publish Job Confirmation</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <AlertTitle>Publishing is a one-way action</AlertTitle>
                  Once a job is published, it <strong>cannot be edited</strong>. You will only be
                  able to change its status (Active, On-Hold, or Closed) after publishing.
                </Alert>

                {jobToPublish && (
                  <Typography variant="body1">
                    Are you sure you want to publish "<strong>{jobToPublish.job.title}</strong>"?
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  mt: 2,
                  bgcolor: '#ffffff',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ color: '#000000', fontWeight: 600, fontSize: '1rem' }}
                >
                  What happens after publishing:
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1 }}>
                  <CheckIcon style={{ color: '#2e7d32', marginRight: '12px' }} fontSize="small" />
                  <Typography sx={{ color: '#000000', fontWeight: 500 }}>
                    Job becomes immediately visible to applicants
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckIcon style={{ color: '#2e7d32', marginRight: '12px' }} fontSize="small" />
                  <Typography sx={{ color: '#000000', fontWeight: 500 }}>
                    Applications can be received
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BlockIcon style={{ color: '#d32f2f', marginRight: '12px' }} fontSize="small" />
                  <Typography sx={{ color: '#000000', fontWeight: 500 }}>
                    Job content cannot be modified
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InfoIcon style={{ color: '#0288d1', marginRight: '12px' }} fontSize="small" />
                  <Typography sx={{ color: '#000000', fontWeight: 500 }}>
                    Status can be changed (Active, On-Hold, Closed)
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPublishConfirmDialogOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={confirmPublishJob}
                startIcon={<PublishIcon />}
              >
                Publish Job
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            message={snackbarMessage}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          />
        </Box>
      )}
    </Box>
  );
};
export default JobBoard;
