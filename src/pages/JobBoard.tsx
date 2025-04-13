import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
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
  Snackbar
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
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

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
  status: 'Active' | 'Paused' | 'Closed';
  applicants: number;
  isFeatured?: boolean;
  isBookmarked?: boolean;
}

const mockJobs: Job[] = [
  {
    id: 1,
    title: 'Senior React Developer',
    location: 'New York, NY',
    department: 'Engineering',
    type: 'Full-time',
    experience: '3-5 years',
    salary: '$110,000 - $130,000',
    postedDate: '2023-05-10',
    description: 'We are looking for a Senior React Developer to join our growing team. The ideal candidate will have strong experience with React, TypeScript, and modern front-end development practices.',
    responsibilities: [
      'Develop new user-facing features using React.js',
      'Build reusable components and front-end libraries for future use',
      'Translate designs and wireframes into high-quality code',
      'Optimize components for maximum performance across devices and browsers',
      'Coordinate with the rest of the team working on different layers of the infrastructure'
    ],
    requirements: [
      '3+ years of experience with React.js',
      'Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model',
      'Experience with TypeScript, Redux, and React hooks',
      'Thorough understanding of React.js and its core principles',
      'Experience with popular React.js workflows such as Flux or Redux'
    ],
    status: 'Active',
    applicants: 24,
    isFeatured: true
  },
  {
    id: 2,
    title: 'UX Designer',
    location: 'Remote',
    department: 'Design',
    type: 'Full-time',
    experience: '2-4 years',
    salary: '$90,000 - $110,000',
    postedDate: '2023-05-08',
    description: 'We are seeking a talented UX Designer who can create exceptional user experiences. You\'ll work closely with product managers and engineers to turn complex requirements into intuitive, accessible, and easy-to-use designs.',
    responsibilities: [
      'Create user flows, wireframes, prototypes and mockups',
      'Design UI elements and components that are intuitive and user-friendly',
      'Conduct usability testing and gather feedback',
      'Work with development team to implement designs',
      'Stay up-to-date with the latest UX trends, tools, and technologies'
    ],
    requirements: [
      'Proven work experience as a UX Designer, UI Designer or similar role',
      'Portfolio of design projects',
      'Proficiency in design tools like Figma, Sketch, or Adobe XD',
      'Knowledge of HTML, CSS, and JavaScript is a plus',
      'Problem-solving attitude with an eye for detail'
    ],
    status: 'Active',
    applicants: 18
  },
  {
    id: 3,
    title: 'DevOps Engineer',
    location: 'San Francisco, CA',
    department: 'Operations',
    type: 'Full-time',
    experience: '4-6 years',
    salary: '$130,000 - $150,000',
    postedDate: '2023-05-05',
    description: 'We\'re looking for a DevOps Engineer to help us build and maintain our cloud infrastructure. You\'ll be responsible for deployment, automation, and ensuring the reliability and scalability of our systems.',
    responsibilities: [
      'Design, implement and manage DevOps processes',
      'Set up and maintain CI/CD pipelines',
      'Automate infrastructure using tools like Terraform',
      'Monitor systems and troubleshoot issues',
      'Implement security measures and best practices'
    ],
    requirements: [
      'Experience with AWS, Azure, or GCP',
      'Knowledge of containerization (Docker, Kubernetes)',
      'Familiarity with infrastructure as code tools (Terraform, CloudFormation)',
      'Experience with CI/CD tools (Jenkins, GitLab CI, GitHub Actions)',
      'Strong scripting skills (Bash, Python)'
    ],
    status: 'Active',
    applicants: 12
  },
  {
    id: 4,
    title: 'Product Manager',
    location: 'Boston, MA',
    department: 'Product',
    type: 'Full-time',
    experience: '5+ years',
    salary: '$120,000 - $140,000',
    postedDate: '2023-04-28',
    description: 'We are looking for an experienced Product Manager to join our team. You will be responsible for defining the product vision, strategy, and roadmap for our SaaS platform.',
    responsibilities: [
      'Define the product vision, strategy, and roadmap',
      'Gather and analyze feedback from customers, stakeholders, and potential users',
      'Work closely with engineering teams to deliver features',
      'Define success metrics for product features',
      'Conduct market research and analyze competitors'
    ],
    requirements: [
      '5+ years of experience in product management',
      'Experience with agile development methodologies',
      'Strong analytical and problem-solving skills',
      'Excellent communication and presentation skills',
      'Technical background or knowledge of B2B SaaS products'
    ],
    status: 'Active',
    applicants: 15,
    isFeatured: true
  },
  {
    id: 5,
    title: 'Full Stack Developer',
    location: 'Chicago, IL',
    department: 'Engineering',
    type: 'Full-time',
    experience: '3-5 years',
    salary: '$100,000 - $120,000',
    postedDate: '2023-04-25',
    description: 'We\'re looking for a Full Stack Developer who can work on both the front-end and back-end of our applications. You\'ll be working with a variety of technologies and frameworks.',
    responsibilities: [
      'Develop user-facing features using modern JavaScript frameworks',
      'Build and maintain server-side logic using Node.js',
      'Design and implement database schemas',
      'Ensure the technical feasibility of UI/UX designs',
      'Optimize applications for performance and scalability'
    ],
    requirements: [
      'Experience with JavaScript/TypeScript and frameworks like React, Angular, or Vue',
      'Familiarity with server-side languages like Node.js, Python, or Java',
      'Knowledge of database technologies (SQL, NoSQL)',
      'Understanding of frontend build pipelines and tools',
      'Good understanding of web fundamentals and best practices'
    ],
    status: 'Paused',
    applicants: 30
  }
];

const JobBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDetailOpen, setJobDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);

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

  // Get unique departments, locations, and types for filters
  const departments = ['All', ...Array.from(new Set(jobs.map(job => job.department)))];
  const locations = ['All', ...Array.from(new Set(jobs.map(job => job.location)))];
  const types = ['All', ...Array.from(new Set(jobs.map(job => job.type)))];
  const statuses = ['All', 'Active', 'Paused', 'Closed'];

  // Calculate days ago from posted date
  const getDaysAgo = (dateString: string) => {
    const posted = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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

  // Handle opening the new job dialog
  const handleOpenNewJobDialog = () => {
    setNewJobDialogOpen(true);
  };

  // Handle creating a new job (mock implementation)
  const handleCreateNewJob = () => {
    // In a real app, you would collect and validate job data from a form
    const newJob: Job = {
      id: jobs.length + 1,
      title: 'New Job Position',
      location: 'Remote',
      department: 'Engineering',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '$80,000 - $100,000',
      postedDate: new Date().toISOString().split('T')[0],
      description: 'This is a new job position.',
      responsibilities: ['Responsibility 1', 'Responsibility 2', 'Responsibility 3'],
      requirements: ['Requirement 1', 'Requirement 2', 'Requirement 3'],
      status: 'Active',
      applicants: 0
    };
    
    setJobs([...jobs, newJob]);
    setNewJobDialogOpen(false);
    setSnackbarMessage('New job posting created successfully!');
    setSnackbarOpen(true);
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

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Job Board</Typography>
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
          <Grid item xs={12} md={4}>
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
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    label="Department"
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={locationFilter}
                    label="Location"
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    {locations.map(loc => (
                      <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Job Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Job Type"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    {types.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
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
                  border: job.isFeatured ? '1px solid #f0c14b' : 'none'
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
                    
                    <Stack direction="row" spacing={1} mb={1}>
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
                      <Chip 
                        label={job.status} 
                        size="small" 
                        color={
                          job.status === 'Active' ? 'success' : 
                          job.status === 'Paused' ? 'warning' : 'error'
                        }
                        variant={job.status === 'Active' ? 'filled' : 'outlined'}
                      />
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
                          {getDaysAgo(job.postedDate)} days ago
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
                    
                    <Tooltip title="Share">
                      <IconButton 
                        size="small"
                        onClick={(e) => handleOpenShareDialog(job, e)}
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
                    <Typography variant="h6" gutterBottom>Job Description</Typography>
                    <Typography variant="body1" paragraph>
                      {selectedJob.description}
                    </Typography>
                  </Box>
                  
                  <Box mb={3}>
                    <Typography variant="h6" gutterBottom>Responsibilities</Typography>
                    <ul style={{ paddingLeft: '20px', marginTop: 0 }}>
                      {selectedJob.responsibilities.map((resp, index) => (
                        <li key={index}>
                          <Typography variant="body1" paragraph>
                            {resp}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                  
                  <Box mb={3}>
                    <Typography variant="h6" gutterBottom>Requirements</Typography>
                    <ul style={{ paddingLeft: '20px', marginTop: 0 }}>
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index}>
                          <Typography variant="body1" paragraph>
                            {req}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Job Details</Typography>
                    
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
                        <strong>Posted:</strong> {new Date(selectedJob.postedDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <PeopleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        <strong>Applicants:</strong> {selectedJob.applicants}
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

      {/* Post New Job Dialog */}
      <Dialog
        open={newJobDialogOpen}
        onClose={() => setNewJobDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Post New Job</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Fill out the form below to create a new job posting.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Job Title"
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Job Type</InputLabel>
                <Select
                  label="Job Type"
                  defaultValue="Full-time"
                >
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Temporary">Temporary</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Experience Required"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salary Range"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Description"
                margin="normal"
                multiline
                rows={4}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewJobDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleCreateNewJob}
          >
            Create Job Posting
          </Button>
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default JobBoard; 