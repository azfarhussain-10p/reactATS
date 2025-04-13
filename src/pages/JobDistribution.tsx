import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Link,
  Alert,
  Badge,
  Avatar,
  Snackbar
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PlayArrow as PublishIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon,
  BarChart as ChartIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Language as WebsiteIcon,
  Warning as WarningIcon,
  Share as ShareIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

import { useJobPosting } from '../contexts/JobPostingContext';
import { JobPlatform, ExternalJobPosting } from '../models/types';

// Define platform icons
const PlatformIcon = ({ platform }: { platform: JobPlatform }) => {
  switch (platform) {
    case 'LinkedIn':
      return <LinkedInIcon style={{ color: '#0077b5' }} />;
    case 'Facebook':
      return <FacebookIcon style={{ color: '#1877f2' }} />;
    case 'Twitter':
      return <TwitterIcon style={{ color: '#1da1f2' }} />;
    case 'CompanyWebsite':
      return <WebsiteIcon style={{ color: '#4caf50' }} />;
    default:
      return <Language />;
  }
};

// Status label component
const StatusLabel = ({ status }: { status: string }) => {
  let color = 'default';
  switch (status) {
    case 'Published':
      color = 'success';
      break;
    case 'Draft':
      color = 'default';
      break;
    case 'Expired':
      color = 'error';
      break;
    case 'Paused':
      color = 'warning';
      break;
  }
  return <Chip label={status} color={color as any} size="small" />;
};

// Mock data for job listings
const mockJobs = [
  { id: 1, title: 'Frontend Developer', department: 'Engineering', status: 'Published', applicants: 12 },
  { id: 2, title: 'UX Designer', department: 'Design', status: 'Published', applicants: 8 },
  { id: 3, title: 'Product Manager', department: 'Product', status: 'Draft', applicants: 0 },
  { id: 4, title: 'DevOps Engineer', department: 'Engineering', status: 'Published', applicants: 5 },
  { id: 5, title: 'Marketing Specialist', department: 'Marketing', status: 'Draft', applicants: 0 },
];

// Mock data for job boards
const mockJobBoards = [
  { id: 1, name: 'LinkedIn', icon: <LinkedInIcon />, connected: true, color: '#0077B5' },
  { id: 2, name: 'Indeed', icon: <WebsiteIcon />, connected: true, color: '#003A9B' },
  { id: 3, name: 'Glassdoor', icon: <WebsiteIcon />, connected: false, color: '#0CAA41' },
  { id: 4, name: 'Facebook Jobs', icon: <FacebookIcon />, connected: true, color: '#4267B2' },
  { id: 5, name: 'Twitter', icon: <TwitterIcon />, connected: false, color: '#1DA1F2' },
  { id: 6, name: 'Company Website', icon: <WebsiteIcon />, connected: true, color: '#FF5722' },
];

// Mock distribution history
const mockDistributionHistory = [
  { 
    id: 1, 
    jobId: 1, 
    jobTitle: 'Frontend Developer', 
    date: '2023-06-15', 
    platforms: ['LinkedIn', 'Indeed', 'Company Website'],
    status: 'complete',
    views: 230,
    clicks: 45,
    applications: 12
  },
  { 
    id: 2, 
    jobId: 2, 
    jobTitle: 'UX Designer', 
    date: '2023-06-10', 
    platforms: ['LinkedIn', 'Glassdoor'],
    status: 'complete',
    views: 180,
    clicks: 32,
    applications: 8
  },
  { 
    id: 3, 
    jobId: 4, 
    jobTitle: 'DevOps Engineer', 
    date: '2023-06-05', 
    platforms: ['LinkedIn', 'Indeed', 'Facebook Jobs'],
    status: 'complete',
    views: 120,
    clicks: 18,
    applications: 5
  },
];

const JobDistribution = () => {
  const {
    jobPostings,
    getPlatformPostings,
    createJobPosting,
    publishJobPosting,
    pauseJobPosting,
    deleteJobPosting,
    updateJobPosting,
    getJobPostingMetrics,
    getAggregatedMetrics,
    generateTrackingUrl
  } = useJobPosting();

  // State for the selected job and tab
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Dialog states
  const [newPostingDialog, setNewPostingDialog] = useState(false);
  const [metricsDialog, setMetricsDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    jobId: 1,
    platform: 'LinkedIn' as JobPlatform,
    title: '',
    autoRepost: true,
    repostThreshold: 30
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  // Selected posting for metrics
  const [selectedPosting, setSelectedPosting] = useState<ExternalJobPosting | null>(null);
  
  // Get unique job IDs
  const jobIds = Array.from(new Set(jobPostings.map(posting => posting.jobId)));
  
  // Get postings for selected job
  const currentJobPostings = selectedJobId
    ? getPlatformPostings(selectedJobId)
    : jobPostings;
  
  // Filter postings based on active tab
  const filteredPostings = activeTab === 0
    ? currentJobPostings
    : activeTab === 1
      ? currentJobPostings.filter(p => p.status === 'Published')
      : activeTab === 2
        ? currentJobPostings.filter(p => p.status === 'Draft')
        : currentJobPostings.filter(p => p.status === 'Expired' || p.status === 'Paused');
  
  // Get metrics for selected job
  const aggregatedMetrics = selectedJobId
    ? getAggregatedMetrics(selectedJobId)
    : getAggregatedMetrics();
  
  // Get job distribution states
  const [jobs, setJobs] = useState(mockJobs);
  const [jobBoards, setJobBoards] = useState(mockJobBoards);
  const [distributionHistory, setDistributionHistory] = useState(mockDistributionHistory);
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [newBoardDialogOpen, setNewBoardDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  const [newJobBoard, setNewJobBoard] = useState({
    name: '',
    apiKey: '',
    apiUrl: '',
    autoDistribute: false
  });
  
  // Effect to select the first job ID by default
  useEffect(() => {
    if (jobIds.length > 0 && !selectedJobId) {
      setSelectedJobId(jobIds[0]);
    }
  }, [jobIds, selectedJobId]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle job change
  const handleJobChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedJobId(event.target.value as number);
  };
  
  // Open new posting dialog
  const handleNewPosting = () => {
    setFormData({
      jobId: selectedJobId || 1,
      platform: 'LinkedIn',
      title: '',
      autoRepost: true,
      repostThreshold: 30
    });
    setNewPostingDialog(true);
  };
  
  // Handle form input change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    if (name === 'autoRepost') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name as string]: value }));
    }
  };
  
  // Create a new job posting
  const handleCreatePosting = () => {
    createJobPosting(
      formData.jobId,
      formData.platform,
      formData.title || `Job #${formData.jobId} - ${formData.platform}`
    );
    setNewPostingDialog(false);
  };
  
  // Publish a job posting
  const handlePublish = async (postingId: string) => {
    setIsLoading(postingId);
    await publishJobPosting(postingId);
    setIsLoading(null);
  };
  
  // Pause a job posting
  const handlePause = async (postingId: string) => {
    setIsLoading(postingId);
    await pauseJobPosting(postingId);
    setIsLoading(null);
  };
  
  // Delete a job posting
  const handleDelete = async (postingId: string) => {
    setIsLoading(postingId);
    await deleteJobPosting(postingId);
    setConfirmDeleteDialog(null);
    setIsLoading(null);
  };
  
  // Show metrics for a posting
  const handleShowMetrics = (posting: ExternalJobPosting) => {
    setSelectedPosting(posting);
    setMetricsDialog(true);
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };
  
  // Handle opening the distribute dialog
  const handleOpenDistributeDialog = (jobId: number) => {
    setSelectedJobId(jobId);
    setSelectedPlatforms([]);
    setDistributeDialogOpen(true);
  };

  // Handle closing the distribute dialog
  const handleCloseDistributeDialog = () => {
    setDistributeDialogOpen(false);
    setSelectedJobId(null);
  };

  // Handle toggling platforms for distribution
  const handleTogglePlatform = (platformId: number) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  // Handle job distribution
  const handleDistributeJob = () => {
    if (!selectedJobId || selectedPlatforms.length === 0) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const job = jobs.find(j => j.id === selectedJobId);
      const platforms = selectedPlatforms.map(id => jobBoards.find(b => b.id === id)?.name || '');
      
      if (job) {
        const newDistribution = {
          id: distributionHistory.length + 1,
          jobId: job.id,
          jobTitle: job.title,
          date: new Date().toISOString().split('T')[0],
          platforms,
          status: 'complete',
          views: 0,
          clicks: 0,
          applications: 0
        };
        
        setDistributionHistory(prev => [newDistribution, ...prev]);
        setSnackbarMessage(`Job "${job.title}" has been distributed to ${platforms.length} platforms.`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
      
      setLoading(false);
      handleCloseDistributeDialog();
    }, 2000);
  };

  // Handle opening the new job board dialog
  const handleOpenNewBoardDialog = () => {
    setNewJobBoard({
      name: '',
      apiKey: '',
      apiUrl: '',
      autoDistribute: false
    });
    setNewBoardDialogOpen(true);
  };

  // Handle closing the new job board dialog
  const handleCloseNewBoardDialog = () => {
    setNewBoardDialogOpen(false);
  };

  // Handle adding a new job board
  const handleAddJobBoard = () => {
    if (!newJobBoard.name) return;
    
    const newBoard = {
      id: jobBoards.length + 1,
      name: newJobBoard.name,
      icon: <WebsiteIcon />,
      connected: true,
      color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
    };
    
    setJobBoards(prev => [...prev, newBoard]);
    setSnackbarMessage(`New job board "${newJobBoard.name}" has been added.`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    handleCloseNewBoardDialog();
  };

  // Handle input change for new job board form
  const handleNewBoardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewJobBoard(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle toggle change for new job board form
  const handleNewBoardToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewJobBoard(prev => ({
      ...prev,
      autoDistribute: e.target.checked
    }));
  };

  // Handle closing the snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Job Distribution
      </Typography>
      
      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Total Distributions
            </Typography>
            <Typography variant="h3" color="primary">
              {distributionHistory.length}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Connected Platforms
            </Typography>
            <Typography variant="h3" color="primary">
              {jobBoards.filter(board => board.connected).length}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Total Applications
            </Typography>
            <Typography variant="h3" color="primary">
              {distributionHistory.reduce((sum, item) => sum + item.applications, 0)}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Job Boards Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Connected Job Boards
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleOpenNewBoardDialog}
              >
                Add New
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {jobBoards.map(board => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={board.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      borderLeft: `4px solid ${board.color}`,
                      opacity: board.connected ? 1 : 0.6
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: board.color,
                          color: 'white',
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          mr: 1
                        }}>
                          {board.icon}
                        </Box>
                        <Typography variant="h6">{board.name}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                          label={board.connected ? 'Connected' : 'Disconnected'} 
                          color={board.connected ? 'success' : 'error'}
                          size="small"
                        />
                        
                        <Box>
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {board.id > 6 && (
                            <IconButton size="small" color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        
        {/* Jobs for Distribution */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Jobs Available for Distribution
            </Typography>
            
            <Grid container spacing={2}>
              {jobs.filter(job => job.status === 'Published').map(job => (
                <Grid item xs={12} sm={6} md={4} key={job.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {job.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Department: {job.department}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Status: {job.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Applicants: {job.applicants}
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Button 
                          variant="contained" 
                          startIcon={<ShareIcon />}
                          fullWidth
                          onClick={() => handleOpenDistributeDialog(job.id)}
                        >
                          Distribute
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        
        {/* Distribution History */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribution History
            </Typography>
            
            {distributionHistory.map(dist => (
              <Card sx={{ mb: 2 }} key={dist.id}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6">{dist.jobTitle}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Distributed on: {dist.date}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {dist.platforms.map((platform, idx) => (
                          <Chip 
                            key={idx} 
                            label={platform}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" align="center">Views</Typography>
                          <Typography variant="h6" align="center">{dist.views}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" align="center">Clicks</Typography>
                          <Typography variant="h6" align="center">{dist.clicks}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" align="center">Applications</Typography>
                          <Typography variant="h6" align="center" color="primary">{dist.applications}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    
                    <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Chip 
                        icon={dist.status === 'complete' ? <CheckCircleIcon /> : <ErrorIcon />}
                        label={dist.status === 'complete' ? 'Complete' : 'Failed'}
                        color={dist.status === 'complete' ? 'success' : 'error'}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Distribute Job Dialog */}
      <Dialog open={distributeDialogOpen} onClose={handleCloseDistributeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Distribute Job
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Select platforms to distribute:
            {selectedJobId && ` "${jobs.find(j => j.id === selectedJobId)?.title}"`}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
            {jobBoards.filter(board => board.connected).map(board => (
              <Chip
                key={board.id}
                icon={board.icon}
                label={board.name}
                onClick={() => handleTogglePlatform(board.id)}
                color={selectedPlatforms.includes(board.id) ? 'primary' : 'default'}
                variant={selectedPlatforms.includes(board.id) ? 'filled' : 'outlined'}
                sx={{ 
                  cursor: 'pointer',
                  '& .MuiChip-icon': { color: selectedPlatforms.includes(board.id) ? 'inherit' : board.color }
                }}
              />
            ))}
          </Box>
          
          {selectedPlatforms.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Please select at least one platform to distribute the job.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDistributeDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleDistributeJob}
            disabled={selectedPlatforms.length === 0 || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <ShareIcon />}
          >
            {loading ? 'Distributing...' : 'Distribute Now'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add New Job Board Dialog */}
      <Dialog open={newBoardDialogOpen} onClose={handleCloseNewBoardDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Job Board
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Job Board Name"
            name="name"
            fullWidth
            value={newJobBoard.name}
            onChange={handleNewBoardInputChange}
            required
          />
          <TextField
            margin="dense"
            label="API Key"
            name="apiKey"
            fullWidth
            value={newJobBoard.apiKey}
            onChange={handleNewBoardInputChange}
          />
          <TextField
            margin="dense"
            label="API URL"
            name="apiUrl"
            fullWidth
            value={newJobBoard.apiUrl}
            onChange={handleNewBoardInputChange}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newJobBoard.autoDistribute}
                onChange={handleNewBoardToggleChange}
                name="autoDistribute"
              />
            }
            label="Auto-distribute new jobs"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewBoardDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddJobBoard}
            disabled={!newJobBoard.name}
          >
            Add Job Board
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JobDistribution; 