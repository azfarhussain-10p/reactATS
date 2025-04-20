import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
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
  Block as BlockIcon
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
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string; // Add benefits to the Job interface
  status: 'Active' | 'On-Hold' | 'Closed' | 'Draft';
  applicants: number;
  isFeatured?: boolean;
  isBookmarked?: boolean;
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
    
    isFeatured: false
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
    benefits: false
  });

  // Text formatting state for each field
  const [textFormatState, setTextFormatState] = useState<{
    [key: string]: TextEditorState
  }>({
    description: {
      bold: false,
      italic: false,
      underline: false,
      bulletList: false,
      numberList: false,
      alignment: 'left'
    },
    responsibilities: {
      bold: false,
      italic: false,
      underline: false,
      bulletList: false,
      numberList: false,
      alignment: 'left'
    },
    requirements: {
      bold: false,
      italic: false,
      underline: false,
      bulletList: false,
      numberList: false,
      alignment: 'left'
    },
    skills: {
      bold: false,
      italic: false,
      underline: false,
      bulletList: false,
      numberList: false,
      alignment: 'left'
    },
    benefits: {
      bold: false,
      italic: false,
      underline: false,
      bulletList: false,
      numberList: false,
      alignment: 'left'
    }
  });
  
  // State for preview dialog
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // State for dropdown options
  const [departments, setDepartments] = useState<string[]>(['All']);
  const [locations, setLocations] = useState<string[]>(['All']);
  const [types, setTypes] = useState<string[]>(['All']);
  const [statuses, setStatuses] = useState<string[]>(['All']);
  const [loadingDropdowns, setLoadingDropdowns] = useState({
    departments: false,
    locations: false,
    types: false
  });

  // Calculate days ago from posted date
  const getDaysAgo = (dateString: string) => {
    const posted = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const jobsData = await jobsApi.getAllJobs();
        setJobs(jobsData);
        setFilteredJobs(jobsData);
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
        setLoadingDropdowns(prev => ({ ...prev, departments: true }));
        const data = await jobsApi.getDepartments();
        setDepartments(['All', ...data]);
        setLoadingDropdowns(prev => ({ ...prev, departments: false }));
      } catch (err) {
        console.error('Error fetching departments:', err);
        // Fallback to client-side filtering if API fails
        const uniqueDepartments = Array.from(new Set(jobs.map(job => job.department)));
        setDepartments(['All', ...uniqueDepartments]);
        setLoadingDropdowns(prev => ({ ...prev, departments: false }));
      }
    };
    
    fetchDepartments();
  }, [jobs]);

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingDropdowns(prev => ({ ...prev, locations: true }));
        const data = await jobsApi.getLocations();
        setLocations(['All', ...data]);
        setLoadingDropdowns(prev => ({ ...prev, locations: false }));
      } catch (err) {
        console.error('Error fetching locations:', err);
        // Fallback to client-side filtering if API fails
        const uniqueLocations = Array.from(new Set(jobs.map(job => job.location)));
        setLocations(['All', ...uniqueLocations]);
        setLoadingDropdowns(prev => ({ ...prev, locations: false }));
      }
    };
    
    fetchLocations();
  }, [jobs]);

  // Fetch job types from API
  useEffect(() => {
    const fetchJobTypes = async () => {
      try {
        setLoadingDropdowns(prev => ({ ...prev, types: true }));
        const data = await jobsApi.getJobTypes();
        setTypes(['All', ...data]);
        setLoadingDropdowns(prev => ({ ...prev, types: false }));
      } catch (err) {
        console.error('Error fetching job types:', err);
        // Fallback to client-side filtering if API fails
        const uniqueTypes = Array.from(new Set(jobs.map(job => job.type)));
        setTypes(['All', ...uniqueTypes]);
        setLoadingDropdowns(prev => ({ ...prev, types: false }));
      }
    };
    
    fetchJobTypes();
  }, [jobs]);

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
      result = result.filter(job => 
        job.title.toLowerCase().includes(lowerCaseSearch) || 
        job.description.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // Apply department filter
    if (departmentFilter !== 'All') {
      result = result.filter(job => job.department === departmentFilter);
    }
    
    // Apply location filter
    if (locationFilter !== 'All') {
      result = result.filter(job => job.location === locationFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'All') {
      result = result.filter(job => job.type === typeFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(job => job.status === statusFilter);
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
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? { ...job, isBookmarked: !job.isBookmarked } 
        : job
    ));
  };

  // View job details
  const handleViewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setJobDetailOpen(true);
  };

  // Delete job
  const handleDeleteJob = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setJobToDelete(jobId);
    setDeleteDialogOpen(true);
  };

  // Confirm job deletion
  const confirmDeleteJob = () => {
    if (jobToDelete) {
      setJobs(jobs.filter(job => job.id !== jobToDelete));
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  // Toggle job status
  const toggleJobStatus = (jobId: number, newStatus: 'Active' | 'On-Hold' | 'Closed', e: React.MouseEvent) => {
    e.stopPropagation();
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        return { ...job, status: newStatus };
      }
      return job;
    }));
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
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
    // For drafts, only title is required
    if (asDraft) {
      const titleError = !newJobForm.title;
      setFormErrors({
        ...formErrors,
        title: titleError
      });
      return !titleError;
    }

    // For publishing, all fields are required
    const errors = {
      title: !newJobForm.title,
      department: !newJobForm.department,
      location: !newJobForm.location,
      description: !newJobForm.description,
      responsibilities: !newJobForm.responsibilities,
      requirements: !newJobForm.requirements,
      experience: !newJobForm.experience,
      skills: !newJobForm.skills,
      salary: !newJobForm.salary,
      benefits: !newJobForm.benefits
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle opening the new job dialog
  const handleOpenNewJobDialog = () => {
    // Reset form when opening the dialog
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
      isFeatured: false
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
      benefits: false
    });
    setEditMode(false);
    setEditJobId(null);
    setActiveTab(0);
    setNewJobDialogOpen(true);
  };

  // Edit an existing job
  const handleEditJob = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Only allow editing of draft jobs
    if (job.status !== 'Draft') {
      setSnackbarMessage('Only draft jobs can be edited. Published jobs cannot be modified.');
      setSnackbarOpen(true);
      return;
    }
    
    setNewJobForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      experience: job.experience || '',
      salary: job.salary || '',
      description: job.description,
      responsibilities: job.responsibilities ? job.responsibilities.join('\n') : '',
      requirements: job.requirements ? job.requirements.join('\n') : '',
      skills: '',
      benefits: '',
      isFeatured: job.isFeatured || false
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
      benefits: false
    });
    setEditMode(true);
    setEditJobId(job.id);
    setActiveTab(0);
    setNewJobDialogOpen(true);
  };

  // Handle creating a new job
  const handleCreateNewJob = (asDraft: boolean = false) => {
    if (!validateForm(asDraft)) {
      return;
    }

    // Important - split the text inputs on newlines for requirements and responsibilities
    const newJob: Job = {
      id: Math.floor(Math.random() * 10000),
      title: newJobForm.title,
      department: newJobForm.department || '',
      location: newJobForm.location || '',
      type: newJobForm.type || 'Full-time',
      experience: newJobForm.experience || '',
      salary: newJobForm.salary || '',
      description: newJobForm.description || '',
      responsibilities: newJobForm.responsibilities 
        ? newJobForm.responsibilities.split('\n').filter(item => item.trim() !== '')
        : [],
      requirements: newJobForm.requirements
        ? newJobForm.requirements.split('\n').filter(item => item.trim() !== '')
        : [],
      benefits: newJobForm.benefits || '',
      postedDate: new Date().toISOString().substring(0, 10),
      status: asDraft ? 'Draft' : 'Active',
      applicants: 0,
      isFeatured: newJobForm.isFeatured || false
    };

    if (editMode && editJobId) {
      // Update existing job
      const jobToEdit = jobs.find(job => job.id === editJobId);
      
      // Double-check that we're only editing a draft job
      if (jobToEdit && jobToEdit.status !== 'Draft' && !asDraft) {
        setSnackbarMessage('Only draft jobs can be published. This job has already been published.');
        setSnackbarOpen(true);
        return;
      }
      
      setJobs(jobs.map(job => {
        if (job.id === editJobId) {
          return {
            ...job,
            title: newJob.title,
            location: newJob.location,
            department: newJob.department,
            type: newJob.type,
            experience: newJob.experience || 'Not specified',
            salary: newJob.salary || 'Not specified',
            description: newJob.description,
            responsibilities: newJob.responsibilities,
            requirements: newJob.requirements,
            benefits: newJob.benefits,
            status: asDraft ? 'Draft' : 'Active',
            isFeatured: newJob.isFeatured
          };
        }
        return job;
      }));
      
      setSnackbarMessage(asDraft ? 'Job saved as draft' : 'Job published successfully!');
    } else {
      // Create new job
    setJobs([...jobs, newJob]);
      setSnackbarMessage(asDraft ? 'Job saved as draft' : 'New job posting created successfully!');
    }
    
    setNewJobDialogOpen(false);
    setSnackbarOpen(true);
    
    // Reset form
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
      isFeatured: false
    });
    setEditMode(false);
    setEditJobId(null);
    setActiveTab(0);
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
      isFeatured: event.target.checked
    });
  };

  // Apply formatting to text
  const applyFormatting = (fieldName: string, format: keyof TextEditorState, value: any) => {
    // Get current text and selection
    const textField = document.getElementById(fieldName) as HTMLTextAreaElement;
    if (!textField) return;
    
    const start = textField.selectionStart;
    const end = textField.selectionEnd;
    const selectedText = newJobForm[fieldName as keyof typeof newJobForm]?.toString().substring(start, end) || '';
    
    if (selectedText.length === 0) {
      // Just update the format state if no text is selected
      // For list buttons, ensure they're mutually exclusive
      if (format === 'bulletList' && value === true) {
        setTextFormatState(prev => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            [format]: value,
            numberList: false
          }
        }));
      } else if (format === 'numberList' && value === true) {
        setTextFormatState(prev => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            [format]: value,
            bulletList: false
          }
        }));
      } else {
        setTextFormatState(prev => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            [format]: value
          }
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
        isFormatted = selectedText.split('\n').every(line => line.startsWith('• '));
        const hasNumbering = selectedText.split('\n').some(line => /^\d+\.\s/.test(line));
        
        let cleanedText = selectedText;
        if (hasNumbering) {
          // Remove numbered list formatting first
          cleanedText = selectedText.split('\n').map(line => line.replace(/^\d+\.\s/, '')).join('\n');
        }
        
        if (value && !isFormatted) {
          // Apply bullet list to clean text (without numbers)
          formattedText = cleanedText.split('\n').map(line => `• ${line}`).join('\n');
        } else if (!value || isFormatted) {
          // Remove bullet list
          formattedText = selectedText.split('\n').map(line => line.replace(/^• /, '')).join('\n');
        }
        
        // Also update the numberList state to false since they're mutually exclusive
        setTextFormatState(prev => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            numberList: false
          }
        }));
        break;
      case 'numberList':
        // Check if text already has numbering and remove any existing bullet list formatting
        isFormatted = selectedText.split('\n').every((line, index) => 
          line.match(new RegExp(`^${index + 1}\\. `))
        );
        const hasBullets = selectedText.split('\n').some(line => line.startsWith('• '));
        
        let cleanTextForNumbering = selectedText;
        if (hasBullets) {
          // Remove bullet list formatting first
          cleanTextForNumbering = selectedText.split('\n').map(line => line.replace(/^• /, '')).join('\n');
        }
        
        if (value && !isFormatted) {
          // Apply numbered list to clean text (without bullets)
          formattedText = cleanTextForNumbering.split('\n').map((line, index) => 
            `${index + 1}. ${line}`
          ).join('\n');
        } else if (!value || isFormatted) {
          // Remove numbered list
          formattedText = selectedText.split('\n').map(line => 
            line.replace(/^\d+\. /, '')
          ).join('\n');
        }
        
        // Also update the bulletList state to false since they're mutually exclusive
        setTextFormatState(prev => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            bulletList: false
          }
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
      [fieldName]: newText
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
        newFormatState.bulletList = formattedText.split('\n').every(line => line.startsWith('• '));
        newFormatState.numberList = false; // Make sure numberList is off when bulletList is on
        break;
      case 'numberList':
        newFormatState.numberList = formattedText.split('\n').every((line, index) => 
          line.match(new RegExp(`^${index + 1}\\. `))
        );
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

    setTextFormatState(prev => ({
      ...prev,
      [fieldName]: newFormatState
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
    const selectedText = newJobForm[fieldName as keyof typeof newJobForm]?.toString().substring(start, end) || '';
    
    // Remove all formatting markers
    let cleanText = selectedText
      .replace(/\*\*(.*?)\*\*/g, '$1') // bold
      .replace(/_(.*?)_/g, '$1')      // italic
      .replace(/__(.*?)__/g, '$1')    // underline
      .replace(/^• /gm, '')          // bullet points
      .replace(/^\d+\. /gm, '')      // numbered lists
      .replace(/<center>(.*?)<\/center>/gs, '$1') // center alignment
      .replace(/<right>(.*?)<\/right>/gs, '$1'); // right alignment
    
    // Apply the clean text
    const newText = newJobForm[fieldName as keyof typeof newJobForm]?.toString() || '';
    const before = newText.substring(0, start);
    const after = newText.substring(end);
    const updatedText = before + cleanText + after;
    
    setNewJobForm({
      ...newJobForm,
      [fieldName]: updatedText
    });
    
    // Reset formatting options for this field only
        setTextFormatState(prev => ({
          ...prev,
          [fieldName]: {
        bold: false,
        italic: false,
        underline: false,
        bulletList: false,
        numberList: false,
        alignment: 'left'
          }
        }));
    
    // Set focus back to the text field
    setTimeout(() => {
      textField.focus();
      // Preserve the actual selected text position
      textField.setSelectionRange(start, start + cleanText.length);
    }, 10);
  };

  // Handle alignment format change
  const handleAlignmentChange = (fieldName: string, alignment: 'left' | 'center' | 'right' | null) => {
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
      .map(para => para.trim().length > 0 ? `<p>${para}</p>` : '')
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
    return decimalPart !== undefined 
      ? `${formattedInteger}.${decimalPart}` 
      : formattedInteger;
  };

  // Handle salary input with thousand separator formatting
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatSalary(value);
    
    setNewJobForm({
      ...newJobForm,
      salary: formattedValue
    });
  };

  // Render the responsibilities, requirements and other sections in job details view
  const renderFormattedContent = (content: string | string[]) => {
    if (!content) return null;
    
    // Convert array to string if needed
    const contentStr = Array.isArray(content) ? content.join('\n') : content;
    
    // Replace bullet points to avoid double bullets in view mode
    let formattedContent = contentStr
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
    const items = formattedContent.split('\n').filter(item => item.trim() !== '');
    
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
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? { ...job, isFeatured: !job.isFeatured } 
        : job
    ));
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
          <Button 
            variant="contained" 
            sx={{ mt: 2 }} 
            onClick={() => window.location.reload()}
          >
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
                        endAdornment={loadingDropdowns.departments && <CircularProgress size={20} sx={{ mr: 2 }} />}
                      >
                        {departments.map(dept => (
                          <MenuItem key={dept} value={dept}>{dept}</MenuItem>
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
                        endAdornment={loadingDropdowns.locations && <CircularProgress size={20} sx={{ mr: 2 }} />}
                      >
                        {locations.map(loc => (
                          <MenuItem key={loc} value={loc}>{loc}</MenuItem>
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
                        endAdornment={loadingDropdowns.types && <CircularProgress size={20} sx={{ mr: 2 }} />}
                      >
                        {types.map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
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
                        {statuses.map(status => (
                          <MenuItem key={status} value={status}>{status}</MenuItem>
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
              filteredJobs.map(job => (
                <Grid item xs={12} md={6} lg={4} key={job.id}>
                  <Card 
                    elevation={job.isFeatured ? 3 : 1}
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      position: 'relative',
                      border: job.isFeatured ? '1px solid #f0c14b' : 'none',
                      opacity: job.status === 'Draft' ? 0.7 : 1
                    }}
                  >
                    {job.isFeatured && (
                      <Chip 
                        label="Featured" 
                        color="primary" 
                        size="small" 
                        sx={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10,
                          bgcolor: '#f0c14b',
                          color: 'black'
                        }} 
                      />
                    )}
                    {job.status === 'Draft' && (
                      <Chip 
                        label="Draft" 
                        color="info" 
                        size="small" 
                        sx={{ 
                          position: 'absolute', 
                          top: job.isFeatured ? 40 : 10, 
                          right: 10
                        }} 
                      />
                    )}
                    <CardActionArea onClick={() => handleViewJobDetails(job)}>
                      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="start">
                          <Typography variant="h6" gutterBottom>{job.title}</Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" mb={1}>
                          <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.location}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" mb={1}>
                          <BusinessIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.department}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" mb={1}>
                          <SalaryIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.salary}
                          </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="body2" color="text.secondary" paragraph sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          mb: 1
                        }}>
                          {job.description}
                        </Typography>
                        
                        <Stack 
                          direction="row" 
                          spacing={1} 
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <Chip 
                            label={job.type} 
                            size="small" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={`${job.experience}`} 
                            size="small" 
                            variant="outlined" 
                          />
                          <ButtonGroup 
                            size="small" 
                            aria-label="job status" 
                            sx={{ mb: 1 }}
                            disableRipple
                          >
                            <Button 
                              size="small"
                              variant={job.status === 'Active' ? 'contained' : 'outlined'}
                              color="success"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleJobStatus(job.id, 'Active', e);
                              }}
                              sx={{ fontSize: '0.7rem', py: 0 }}
                              disabled={job.status === 'Draft'}
                              disableRipple
                            >
                              Active
                            </Button>
                            <Button 
                              size="small"
                              variant={job.status === 'On-Hold' ? 'contained' : 'outlined'}
                              color="warning"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleJobStatus(job.id, 'On-Hold', e);
                              }}
                              sx={{ fontSize: '0.7rem', py: 0 }}
                              disabled={job.status === 'Draft'}
                              disableRipple
                            >
                              On-Hold
                            </Button>
                            <Button 
                              size="small"
                              variant={job.status === 'Closed' ? 'contained' : 'outlined'}
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleJobStatus(job.id, 'Closed', e);
                              }}
                              sx={{ fontSize: '0.7rem', py: 0 }}
                              disabled={job.status === 'Draft'}
                              disableRipple
                            >
                              Closed
                            </Button>
                          </ButtonGroup>
                        </Stack>

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center">
                            <PeopleIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {job.applicants} applicants
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center">
                            <DateIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              Posted: {new Date(job.postedDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                    
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button 
                        size="small" 
                        color="primary" 
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewJobDetails(job)}
                      >
                        View Details
                      </Button>
                      
                      <Box>
                        <Tooltip title={job.isBookmarked ? "Remove Bookmark" : "Bookmark"}>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleToggleBookmark(job.id, e)}
                            color={job.isBookmarked ? "primary" : "default"}
                          >
                            {job.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={job.isFeatured ? "Remove Featured" : "Mark as Featured"}>
                          <IconButton 
                            size="small"
                            color={job.isFeatured ? "warning" : "default"}
                            onClick={(e) => toggleJobFeatured(job.id, e)}
                          >
                            {job.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                        </Tooltip>

                        {job.status === 'Draft' && (
                          <Tooltip title="Edit Draft">
                            <IconButton 
                              size="small"
                              color="primary"
                              onClick={(e) => handleEditJob(job, e)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Share">
                          <IconButton 
                            size="small"
                            onClick={(e) => handleOpenShareDialog(job, e)}
                            disabled={job.status === 'Draft'}
                          >
                            <ShareIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={(e) => handleDeleteJob(job.id, e)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardActions>
                  </Card>
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
                    <Typography variant="h6">{selectedJob.title}</Typography>
                    <IconButton onClick={() => setJobDetailOpen(false)} size="small">
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent dividers>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Box mb={3}>
                        <Typography variant="h6" gutterBottom>Job Summary</Typography>
                        <Typography variant="body1" paragraph>
                          {selectedJob.description}
                        </Typography>
                      </Box>
                      
                      <Box mb={3}>
                        <Typography variant="h6" gutterBottom>Responsibilities</Typography>
                        {renderFormattedContent(selectedJob.responsibilities)}
                      </Box>
                      
                      <Box mb={3}>
                        <Typography variant="h6" gutterBottom>Candidate Requirements</Typography>
                        {renderFormattedContent(selectedJob.requirements)}
                      </Box>
                      
                      {/* Benefits section */}
                      <Box mb={3}>
                        <Typography variant="h6" gutterBottom>Compensation and Benefits</Typography>
                        {selectedJob.benefits ? renderFormattedContent(selectedJob.benefits) : (
                          <Typography variant="body2" color="text.secondary">
                            No benefits specified
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Job Information</Typography>
                        
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
                      </Paper>
                      
                      <Stack spacing={1}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          fullWidth
                          onClick={() => handleOpenApplyDialog(selectedJob)}
                        >
                          Apply For This Job
                        </Button>
                        <Button 
                          variant="outlined"
                          startIcon={selectedJob.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
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
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this job posting? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={confirmDeleteJob} 
                color="error" 
                variant="contained"
              >
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
              sx: { minHeight: '80vh' }
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
                    <Typography variant="h6" gutterBottom>Basic Job Information</Typography>
                  <TextField
                    fullWidth
                    label="Job Title"
                      name="title"
                    margin="normal"
                    required
                      value={newJobForm.title}
                      onChange={handleFormChange}
                      error={formErrors.title}
                      helperText={formErrors.title ? "Job title is required" : ""}
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
                        helperText={formErrors.department ? "Department is required" : ""}
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
                        helperText={formErrors.location ? "Location is required" : ""}
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
                    <Typography variant="subtitle1" gutterBottom>Featured Status</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newJobForm.isFeatured}
                          onChange={handleSwitchChange}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {newJobForm.isFeatured ? <StarIcon color="warning" sx={{ mr: 1 }} /> : <StarBorderIcon sx={{ mr: 1 }} />}
                          {newJobForm.isFeatured ? "Featured Job" : "Standard Job"}
                        </Box>
                      }
                    />
                  </Box>
                </Box>
              )}
              
              {/* Tab 2: Job Outline */}
              {activeTab === 1 && (
                <Box sx={{ p: 1 }}>
                  <Typography variant="h6" gutterBottom>Job Description and Responsibilities</Typography>
                  
                  <Box sx={{ position: 'relative', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" component="label" htmlFor="description">
                        Job Description
                        <Typography component="span" color="error">*</Typography>
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
                      helperText={formErrors.description ? "Job description is required" : "Max 2000 characters"}
                      inputProps={{ maxLength: 2000 }}
                    />
                  </Box>
                  
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" component="label" htmlFor="responsibilities">
                        Responsibilities
                        <Typography component="span" color="error">*</Typography>
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
                      helperText={formErrors.responsibilities ? "Responsibilities are required" : "Max 1000 characters"}
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
                  <Typography variant="h6" gutterBottom>Candidate Requirements</Typography>
                  
                  <Box sx={{ position: 'relative', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" component="label" htmlFor="experience">
                        Experience Required
                        <Typography component="span" color="error">*</Typography>
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
                      helperText={formErrors.experience ? "Experience is required" : "Max 100 characters"}
                      inputProps={{ maxLength: 100 }}
                      required
                      error={formErrors.experience}
                    />
                  </Box>
                  
                  <Box sx={{ position: 'relative', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" component="label" htmlFor="requirements">
                        Qualifications
                        <Typography component="span" color="error">*</Typography>
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
                      helperText={formErrors.requirements ? "Qualifications are required" : "Max 1000 characters"}
                      inputProps={{ maxLength: 1000 }}
                      required
                      error={formErrors.requirements}
                    />
                  </Box>
                  
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" component="label" htmlFor="skills">
                        Skills
                        <Typography component="span" color="error">*</Typography>
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
                      helperText={formErrors.skills ? "Skills are required" : "Max 500 characters"}
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
                  <Typography variant="h6" gutterBottom>Compensation and Benefits</Typography>
                  
                  <Box sx={{ position: 'relative', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" component="label" htmlFor="salary">
                        Salary Range
                        <Typography component="span" color="error">*</Typography>
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
                      helperText={formErrors.salary ? "Salary is required" : "Max 100 characters"}
                      inputProps={{ maxLength: 100 }}
                      required
                      error={formErrors.salary}
                    />
                  </Box>
                  
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" component="label" htmlFor="benefits">
                        Benefits
                        <Typography component="span" color="error">*</Typography>
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
                      helperText={formErrors.benefits ? "Benefits are required" : "Max 1000 characters"}
                      inputProps={{ maxLength: 1000 }}
                      required
                      error={formErrors.benefits}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
            <Box>
              {activeTab > 0 && (
                <Button onClick={handlePrevTab} sx={{ mr: 1 }}>
                  Previous
                </Button>
              )}
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => handleCreateNewJob(true)}
              >
                {editMode ? 'Update as Draft' : 'Save as Draft'}
              </Button>
            </Box>
            <Box>
              <Button 
                onClick={() => setNewJobDialogOpen(false)} 
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              {activeTab < 3 ? (
            <Button 
              variant="contained" 
              color="primary"
                  onClick={handleNextTab}
            >
                  Next
            </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleCreateNewJob(false)}
                >
                  {editMode ? 'Update Job' : 'Publish Job'}
                </Button>
              )}
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
                    <TextField
                      fullWidth
                      label="First Name"
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      margin="normal"
                      required
                    />
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
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleApplyForJob}
            >
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
}
export default JobBoard;
