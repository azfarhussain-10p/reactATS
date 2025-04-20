import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Tab,
  Tabs,
  Badge,
  Stack,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Language as WebsiteIcon,
  Link as LinkIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';

// Define types
interface JobBoard {
  id: string;
  name: string;
  logo: string;
  type: 'Premium' | 'Free' | 'Paid';
  status: 'Connected' | 'Disconnected';
  cost: number;
  features: string[];
  recommendedFor: string[];
  color: string;
  jobsPosted: number;
  connectedDate: string;
  costPerJob: number;
  apiKey: string;
}

interface Job {
  id: number;
  title: string;
  location: string;
  department: string;
  type: string;
  salary: string;
  postedDate: string;
  status: 'Active' | 'On-Hold' | 'Closed' | 'Draft';
  distribution: {
    boardId: string;
    status: 'Published' | 'Failed' | 'Pending' | 'Draft';
    postedDate?: string;
    expiryDate?: string;
    applicants?: number;
    views?: number;
    clicks?: number;
    cost?: number;
  }[];
}

interface DistributionHistory {
  id: number;
  jobId: number;
  jobTitle: string;
  boardId: string;
  boardName: string;
  status: 'Published' | 'Failed' | 'Pending' | 'Draft';
  postedDate: string;
  expiryDate: string;
  applicants: number;
  views: number;
  clicks: number;
  cost: number;
  date?: string;
  platforms?: string[];
}

type TabValue = 'boards' | 'distribution' | 'history';

// Define JobBoardStatus type for better type safety
type JobBoardStatus = 'Connected' | 'Disconnected';

// Custom components
const PlatformIcon: React.FC<{ platform: string; size?: 'small' | 'medium' }> = ({ platform, size = 'medium' }) => {
  const getIcon = () => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <LinkedInIcon fontSize={size} />;
      case 'twitter':
        return <TwitterIcon fontSize={size} />;
      case 'facebook':
        return <FacebookIcon fontSize={size} />;
    default:
        return <WebsiteIcon fontSize={size} />;
    }
  };

  return getIcon();
};

const StatusLabel: React.FC<{ status: string; type?: 'board' | 'job' | 'distribution' }> = ({ status, type = 'job' }) => {
  const getColor = () => {
    if (type === 'board') {
      return status === 'Connected' ? 'success' : 'error';
    }
    
    if (type === 'distribution') {
  switch (status) {
    case 'Published':
          return 'success';
        case 'Failed':
          return 'error';
        case 'Pending':
          return 'warning';
    case 'Draft':
          return 'default';
        default:
          return 'default';
      }
    }
    
    // Default job status colors
    switch (status) {
      case 'Active':
        return 'success';
      case 'On-Hold':
        return 'warning';
      case 'Closed':
        return 'error';
      case 'Draft':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Chip 
      label={status} 
      size="small" 
      color={getColor()} 
      variant={type === 'board' && status === 'Connected' ? 'filled' : 'outlined'}
    />
  );
};

// Mock data
const mockJobBoards: JobBoard[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    logo: '/logos/linkedin.png',
    type: 'Premium',
    status: 'Connected',
    cost: 299,
    features: ['Premium placement', 'Candidate matching', 'Smart alerts', 'Performance analytics'],
    recommendedFor: ['Tech jobs', 'Professional roles', 'Corporate positions'],
    color: '#0077B5',
    jobsPosted: 0,
    connectedDate: '',
    costPerJob: 0,
    apiKey: ''
  },
  {
    id: 'indeed',
    name: 'Indeed',
    logo: '/logos/indeed.png',
    type: 'Free',
    status: 'Connected',
    cost: 0,
    features: ['Free posting', 'Basic analytics', 'Mobile optimization'],
    recommendedFor: ['Entry-level positions', 'High-volume hiring', 'General job categories'],
    color: '#003A9B',
    jobsPosted: 0,
    connectedDate: '',
    costPerJob: 0,
    apiKey: ''
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    logo: '/logos/glassdoor.png',
    type: 'Paid',
    status: 'Disconnected',
    cost: 199,
    features: ['Company branding', 'Enhanced visibility', 'Review management'],
    recommendedFor: ['Building employer brand', 'Competitive industries'],
    color: '#0CAA41',
    jobsPosted: 0,
    connectedDate: '',
    costPerJob: 0,
    apiKey: ''
  },
  {
    id: 'monster',
    name: 'Monster',
    logo: '/logos/monster.png',
    type: 'Paid',
    status: 'Connected',
    cost: 249,
    features: ['Resume search', 'Precision matching', 'Featured listings'],
    recommendedFor: ['Specialized roles', 'Healthcare', 'Technical positions'],
    color: '#6E2585',
    jobsPosted: 0,
    connectedDate: '',
    costPerJob: 0,
    apiKey: ''
  },
  {
    id: 'ziprecruiter',
    name: 'ZipRecruiter',
    logo: '/logos/ziprecruiter.png',
    type: 'Premium',
    status: 'Disconnected',
    cost: 349,
    features: ['AI-powered matching', 'One-click apply', 'Multi-platform distribution'],
    recommendedFor: ['Small businesses', 'Diverse hiring needs', 'Quick hiring'],
    color: '#1D9CEA',
    jobsPosted: 0,
    connectedDate: '',
    costPerJob: 0,
    apiKey: ''
  }
];

const mockJobs: Job[] = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    location: 'New York, NY',
    department: 'Engineering',
    type: 'Full-time',
    salary: '$100,000 - $130,000',
    postedDate: '2023-07-15',
    status: 'Active',
    distribution: [
      { 
        boardId: 'linkedin', 
        status: 'Published', 
        postedDate: '2023-07-16', 
        expiryDate: '2023-08-16',
        applicants: 24,
        views: 523,
        clicks: 89,
        cost: 299
      },
      { 
        boardId: 'indeed', 
        status: 'Published', 
        postedDate: '2023-07-16', 
        expiryDate: '2023-08-16',
        applicants: 18,
        views: 412,
        clicks: 67,
        cost: 0
      },
      { 
        boardId: 'monster', 
        status: 'Failed', 
      }
    ]
  },
  {
    id: 2,
    title: 'UX Designer',
    location: 'Remote',
    department: 'Design',
    type: 'Full-time',
    salary: '$85,000 - $110,000',
    postedDate: '2023-07-20',
    status: 'Active',
    distribution: [
      { 
        boardId: 'linkedin', 
        status: 'Published', 
        postedDate: '2023-07-21', 
        expiryDate: '2023-08-21',
        applicants: 12,
        views: 345,
        clicks: 58,
        cost: 299
      },
      { 
        boardId: 'indeed', 
        status: 'Pending' 
      }
    ]
  },
  {
    id: 3,
    title: 'DevOps Engineer',
    location: 'San Francisco, CA',
    department: 'Operations',
    type: 'Full-time',
    salary: '$120,000 - $150,000',
    postedDate: '2023-07-10',
    status: 'On-Hold',
    distribution: [
      { 
        boardId: 'linkedin', 
        status: 'Draft' 
      }
    ]
  },
  {
    id: 4,
    title: 'Marketing Specialist',
    location: 'Chicago, IL',
    department: 'Marketing',
    type: 'Full-time',
    salary: '$70,000 - $90,000',
    postedDate: '2023-07-05',
    status: 'Closed',
    distribution: [
      { 
        boardId: 'linkedin', 
        status: 'Published', 
        postedDate: '2023-07-06', 
        expiryDate: '2023-08-06',
        applicants: 31,
        views: 689,
        clicks: 112,
        cost: 299
      },
      { 
        boardId: 'indeed', 
        status: 'Published', 
        postedDate: '2023-07-06', 
        expiryDate: '2023-08-06',
        applicants: 27,
        views: 542,
        clicks: 94,
        cost: 0
      },
      { 
        boardId: 'monster', 
        status: 'Published', 
        postedDate: '2023-07-06', 
        expiryDate: '2023-08-06',
        applicants: 14,
        views: 378,
        clicks: 63,
        cost: 249
      }
    ]
  }
];

const mockDistributionHistory: DistributionHistory[] = [
  { 
    id: 1, 
    jobId: 1, 
    jobTitle: 'Senior Frontend Developer',
    boardId: 'linkedin',
    boardName: 'LinkedIn',
    status: 'Published',
    postedDate: '2023-07-16',
    expiryDate: '2023-08-16',
    applicants: 24,
    views: 523,
    clicks: 89,
    cost: 299
  },
  { 
    id: 2, 
    jobId: 1,
    jobTitle: 'Senior Frontend Developer',
    boardId: 'indeed',
    boardName: 'Indeed',
    status: 'Published',
    postedDate: '2023-07-16',
    expiryDate: '2023-08-16',
    applicants: 18,
    views: 412,
    clicks: 67,
    cost: 0
  },
  {
    id: 3,
    jobId: 2, 
    jobTitle: 'UX Designer', 
    boardId: 'linkedin',
    boardName: 'LinkedIn',
    status: 'Published',
    postedDate: '2023-07-21',
    expiryDate: '2023-08-21',
    applicants: 12,
    views: 345,
    clicks: 58,
    cost: 299
  },
  {
    id: 4,
    jobId: 4, 
    jobTitle: 'Marketing Specialist',
    boardId: 'linkedin',
    boardName: 'LinkedIn',
    status: 'Published',
    postedDate: '2023-07-06',
    expiryDate: '2023-08-06',
    applicants: 31,
    views: 689,
    clicks: 112,
    cost: 299
  },
  {
    id: 5,
    jobId: 4,
    jobTitle: 'Marketing Specialist',
    boardId: 'indeed',
    boardName: 'Indeed',
    status: 'Published',
    postedDate: '2023-07-06',
    expiryDate: '2023-08-06',
    applicants: 27,
    views: 542,
    clicks: 94,
    cost: 0
  },
  {
    id: 6,
    jobId: 4,
    jobTitle: 'Marketing Specialist',
    boardId: 'monster',
    boardName: 'Monster',
    status: 'Published',
    postedDate: '2023-07-06',
    expiryDate: '2023-08-06',
    applicants: 14,
    views: 378,
    clicks: 63,
    cost: 249
  }
];

// Main component
const JobDistribution: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<TabValue>('boards');
  const [jobBoards, setJobBoards] = useState<JobBoard[]>(mockJobBoards);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [distributionHistory, setDistributionHistory] = useState<DistributionHistory[]>(mockDistributionHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const [editedBoard, setEditedBoard] = useState<JobBoard | null>(null);
  const [isEditBoardDialogOpen, setIsEditBoardDialogOpen] = useState(false);
  const [isAddBoardDialogOpen, setIsAddBoardDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);

  // Derived state for filtered boards
  const filteredBoards = useMemo(() => {
    return jobBoards.filter(board => {
      // Apply search filter
      if (searchTerm && !board.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply type filter
      if (typeFilter !== 'All' && board.type !== typeFilter) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter !== 'All' && board.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [jobBoards, searchTerm, typeFilter, statusFilter]);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };
  
  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle type filter change
  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Open distribute dialog
  const handleOpenDistributeDialog = (job: Job) => {
    setSelectedJob(job);
    
    // Pre-select boards that are connected
    const connectedBoardIds = jobBoards
      .filter(board => board.status === 'Connected')
      .map(board => board.id);
    
    setSelectedBoards(connectedBoardIds);
    setIsDistributeDialogOpen(true);
  };

  // Close distribute dialog
  const handleCloseDistributeDialog = () => {
    setIsDistributeDialogOpen(false);
    setSelectedJob(null);
    setSelectedBoards([]);
  };

  // Toggle board selection
  const handleToggleBoardSelection = (boardId: string) => {
    setSelectedBoards(prev => {
      if (prev.includes(boardId)) {
        return prev.filter(id => id !== boardId);
      } else {
        return [...prev, boardId];
      }
    });
  };

  // Distribute job to selected boards
  const handleDistributeJob = () => {
    if (!selectedJob) return;
    
    // Simulate distributing job to selected boards
    const updatedJobs = jobs.map(job => {
      if (job.id === selectedJob.id) {
        // Create new distribution entries for selected boards
        const updatedDistribution = [...job.distribution];
        
        selectedBoards.forEach(boardId => {
          // Check if board already exists in distribution
          const existingIndex = updatedDistribution.findIndex(
            dist => dist.boardId === boardId
          );
          
          if (existingIndex >= 0) {
            // Update existing distribution
            updatedDistribution[existingIndex] = {
              ...updatedDistribution[existingIndex],
              status: 'Published',
              postedDate: new Date().toISOString().split('T')[0],
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              applicants: 0,
          views: 0,
          clicks: 0,
              cost: jobBoards.find(board => board.id === boardId)?.cost || 0
            };
          } else {
            // Add new distribution
            updatedDistribution.push({
              boardId,
              status: 'Published',
              postedDate: new Date().toISOString().split('T')[0],
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              applicants: 0,
              views: 0,
              clicks: 0,
              cost: jobBoards.find(board => board.id === boardId)?.cost || 0
            });
          }
        });
        
        return {
          ...job,
          distribution: updatedDistribution
        };
      }
      return job;
    });
    
    // Update job distribution history
    const newHistoryEntries: DistributionHistory[] = [];
    
    selectedBoards.forEach(boardId => {
      const board = jobBoards.find(b => b.id === boardId);
      if (!board || !selectedJob) return;
      
      newHistoryEntries.push({
        id: distributionHistory.length + newHistoryEntries.length + 1,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        boardId,
        boardName: board.name,
        status: 'Published',
        postedDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        applicants: 0,
        views: 0,
        clicks: 0,
        cost: board.cost
      });
    });
    
    setJobs(updatedJobs);
    setDistributionHistory([...distributionHistory, ...newHistoryEntries]);
    
    // Close dialog and show success message
    handleCloseDistributeDialog();
    setAlertMessage(`Job "${selectedJob.title}" successfully distributed to ${selectedBoards.length} job boards.`);
    setAlertSeverity('success');
    setIsAlertOpen(true);
  };

  // Close alert
  const handleCloseAlert = () => {
    setIsAlertOpen(false);
  };

  // Connect or disconnect a job board
  const handleToggleBoardConnection = (boardId: string) => {
    setJobBoards(
      jobBoards.map(board => {
        if (board.id === boardId) {
          const newStatus = board.status === 'Connected' ? 'Disconnected' : 'Connected';
          
          // Show alert
          setAlertMessage(`${board.name} successfully ${newStatus.toLowerCase()}.`);
          setAlertSeverity('success');
          setIsAlertOpen(true);
          
          return {
            ...board,
            status: newStatus as 'Connected' | 'Disconnected'
          };
        }
        return board;
      })
    );
  };

  // Open edit board dialog
  const handleOpenEditDialog = (board: JobBoard) => {
    setEditedBoard({...board});
    setIsEditBoardDialogOpen(true);
  };

  // Close edit board dialog
  const handleCloseEditDialog = () => {
    setIsEditBoardDialogOpen(false);
    setEditedBoard(null);
  };

  // Open add board dialog
  const handleOpenAddBoardDialog = () => {
    setIsAddBoardDialogOpen(true);
    setEditedBoard({
      id: `board-${Date.now()}`,
      name: '',
      logo: '',
      type: 'Paid',
      status: 'Disconnected',
      cost: 0,
      features: [],
      recommendedFor: [],
      color: '#cccccc',
      jobsPosted: 0,
      connectedDate: new Date().toISOString().split('T')[0],
      costPerJob: 0,
      apiKey: ''
    });
  };

  // Close add board dialog
  const handleCloseAddBoardDialog = () => {
    setIsAddBoardDialogOpen(false);
    setEditedBoard(null);
  };

  // Open confirm delete dialog
  const handleOpenDeleteConfirm = (boardId: string) => {
    setBoardToDelete(boardId);
    setIsConfirmDeleteOpen(true);
  };

  // Close confirm delete dialog
  const handleCloseDeleteConfirm = () => {
    setIsConfirmDeleteOpen(false);
    setBoardToDelete(null);
  };

  // Save board changes
  const handleSaveBoard = () => {
    if (!editedBoard) return;
    
    // Update existing board or add new one
    if (isEditBoardDialogOpen) {
      setJobBoards(prev => prev.map(board => 
        board.id === editedBoard.id ? editedBoard : board
      ));
      setIsEditBoardDialogOpen(false);
      setAlertMessage(`${editedBoard.name} successfully updated.`);
    } else {
      setJobBoards(prev => [...prev, editedBoard]);
      setIsAddBoardDialogOpen(false);
      setAlertMessage(`${editedBoard.name} successfully added.`);
    }
    
    setAlertSeverity('success');
    setIsAlertOpen(true);
    setEditedBoard(null);
  };

  // Delete board
  const handleDeleteBoard = () => {
    if (!boardToDelete) return;
    
    const boardName = jobBoards.find(board => board.id === boardToDelete)?.name || '';
    
    setJobBoards(prev => prev.filter(board => board.id !== boardToDelete));
    setIsConfirmDeleteOpen(false);
    setBoardToDelete(null);
    
    setAlertMessage(`${boardName} successfully removed.`);
    setAlertSeverity('success');
    setIsAlertOpen(true);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Job Distribution
      </Typography>
      
      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid component="div" item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Total Distributions
            </Typography>
            <Typography variant="h3" color="primary">
              {distributionHistory.length}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid component="div" item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Connected Platforms
            </Typography>
            <Typography variant="h3" color="primary">
              {jobBoards.filter(board => board.status === 'Connected').length}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid component="div" item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Total Applications
            </Typography>
            <Typography variant="h3" color="primary">
              {distributionHistory.reduce((sum, item) => sum + item.applicants, 0)}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Job Boards Section */}
        <Grid component="div" item xs={12}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Connected Job Boards
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleOpenAddBoardDialog}
              >
                Add Platform
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {filteredBoards.map(board => (
                <Grid component="div" item xs={12} sm={6} md={4} lg={3} key={board.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      borderLeft: `4px solid ${board.color}`,
                      opacity: board.status === 'Connected' ? 1 : 0.6
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
                          <PlatformIcon platform={board.id} />
                        </Box>
                        <Typography variant="h6">{board.name}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <StatusLabel status={board.status} type="board" />
                        
                        <Box>
                          <IconButton 
                            size="small"
                            onClick={() => handleOpenEditDialog(board)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {board.id !== 'linkedin' && (
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleOpenDeleteConfirm(board.id)}
                            >
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
        <Grid component="div" item xs={12}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Jobs Available for Distribution
            </Typography>
            
            <Grid container spacing={2}>
              {jobs.filter(job => job.status === 'Active').map(job => (
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
                        Applicants: {job.distribution.filter(dist => dist.status === 'Published').length}
                      </Typography>
                      
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined"
                          onClick={() => handleOpenDistributeDialog(job)}
                          sx={{ flexGrow: 1 }}
                        >
                          Distribution
                        </Button>
                        <Button 
                          variant="contained" 
                          startIcon={<ShareIcon />}
                          onClick={() => {
                            // Make sure we have a job selected and boards to distribute to
                            const connectedBoardIds = jobBoards
                              .filter(board => board.status === 'Connected')
                              .map(board => board.id);
                            
                            if (connectedBoardIds.length === 0) {
                              setAlertMessage('No connected job boards available. Please connect at least one job board first.');
                              setAlertSeverity('error');
                              setIsAlertOpen(true);
                              return;
                            }
                            
                            // Set the selected job and boards, then call the distribute function
                            setSelectedJob(job);
                            setSelectedBoards(connectedBoardIds);
                            
                            // Directly call the distribution function without opening the dialog
                            const updatedJobs = jobs.map(j => {
                              if (j.id === job.id) {
                                // Create new distribution entries for all connected boards
                                const updatedDistribution = [...j.distribution];
                                
                                connectedBoardIds.forEach(boardId => {
                                  // Check if board already exists in distribution
                                  const existingIndex = updatedDistribution.findIndex(
                                    dist => dist.boardId === boardId
                                  );
                                  
                                  if (existingIndex >= 0) {
                                    // Update existing distribution
                                    updatedDistribution[existingIndex] = {
                                      ...updatedDistribution[existingIndex],
                                      status: 'Published',
                                      postedDate: new Date().toISOString().split('T')[0],
                                      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                        .toISOString()
                                        .split('T')[0],
                                      applicants: 0,
                                      views: 0,
                                      clicks: 0,
                                      cost: jobBoards.find(board => board.id === boardId)?.cost || 0
                                    };
                                  } else {
                                    // Add new distribution
                                    updatedDistribution.push({
                                      boardId,
                                      status: 'Published',
                                      postedDate: new Date().toISOString().split('T')[0],
                                      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                        .toISOString()
                                        .split('T')[0],
                                      applicants: 0,
                                      views: 0,
                                      clicks: 0,
                                      cost: jobBoards.find(board => board.id === boardId)?.cost || 0
                                    });
                                  }
                                });
                                
                                return {
                                  ...j,
                                  distribution: updatedDistribution
                                };
                              }
                              return j;
                            });
                            
                            // Update job distribution history
                            const newHistoryEntries: DistributionHistory[] = [];
                            
                            connectedBoardIds.forEach(boardId => {
                              const board = jobBoards.find(b => b.id === boardId);
                              if (!board) return;
                              
                              newHistoryEntries.push({
                                id: distributionHistory.length + newHistoryEntries.length + 1,
                                jobId: job.id,
                                jobTitle: job.title,
                                boardId,
                                boardName: board.name,
                                status: 'Published',
                                postedDate: new Date().toISOString().split('T')[0],
                                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                  .toISOString()
                                  .split('T')[0],
                                applicants: 0,
                                views: 0,
                                clicks: 0,
                                cost: board.cost
                              });
                            });
                            
                            // Update state
                            setJobs(updatedJobs);
                            setDistributionHistory([...distributionHistory, ...newHistoryEntries]);
                            
                            // Show success message
                            setAlertMessage(`Job "${job.title}" successfully distributed to ${connectedBoardIds.length} job boards.`);
                            setAlertSeverity('success');
                            setIsAlertOpen(true);
                          }}
                        >
                          Quick Publish
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
        <Grid component="div" item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribution History
            </Typography>
            
            {distributionHistory.map(dist => (
              <Card sx={{ mb: 2 }} key={dist.id}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid component="div" item xs={12} md={4}>
                      <Typography variant="h6">{dist.jobTitle}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Distributed on: {dist.date || dist.postedDate}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {dist.platforms?.map((platform, idx) => (
                          <Chip 
                            key={idx} 
                            label={platform}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Grid>
                    
                    <Grid component="div" item xs={12} md={6}>
                      <Grid container spacing={2}>
                        <Grid component="div" item xs={4}>
                          <Typography variant="subtitle2" align="center">Views</Typography>
                          <Typography variant="h6" align="center">{dist.views}</Typography>
                        </Grid>
                        <Grid component="div" item xs={4}>
                          <Typography variant="subtitle2" align="center">Clicks</Typography>
                          <Typography variant="h6" align="center">{dist.clicks}</Typography>
                        </Grid>
                        <Grid component="div" item xs={4}>
                          <Typography variant="subtitle2" align="center">Applications</Typography>
                          <Typography variant="h6" align="center" color="primary">{dist.applicants}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    
                    <Grid component="div" item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Chip 
                        icon={dist.status === 'Published' ? <CheckCircleIcon /> : <ErrorIcon />}
                        label={dist.status === 'Published' ? 'Complete' : 'Failed'}
                        color={dist.status === 'Published' ? 'success' : 'error'}
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
      <Dialog open={isDistributeDialogOpen} onClose={handleCloseDistributeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Distribute Job
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Select platforms to distribute:
            {selectedJob && ` "${selectedJob.title}"`}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
            {filteredBoards.map(board => (
              <Chip
                key={board.id}
                icon={<PlatformIcon platform={board.id} />}
                label={board.name}
                onClick={() => handleToggleBoardSelection(board.id)}
                color={selectedBoards.includes(board.id) ? 'primary' : 'default'}
                variant={selectedBoards.includes(board.id) ? 'filled' : 'outlined'}
                sx={{ 
                  cursor: 'pointer',
                  '& .MuiChip-icon': { color: selectedBoards.includes(board.id) ? 'inherit' : board.color }
                }}
              />
            ))}
          </Box>
          
          {selectedBoards.length === 0 && (
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
            disabled={selectedBoards.length === 0}
            startIcon={<ShareIcon />}
          >
            Distribute Now
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Board Dialog */}
      <Dialog open={isEditBoardDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Platform: {editedBoard?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Platform Name"
                value={editedBoard?.name || ''}
                onChange={(e) => setEditedBoard(prev => 
                  prev ? { ...prev, name: e.target.value } : null
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editedBoard?.type || ''}
                  onChange={(e) => setEditedBoard(prev => 
                    prev ? { ...prev, type: e.target.value as 'Premium' | 'Free' | 'Paid' } : null
                  )}
                  label="Type"
                >
                  <MenuItem value="Free">Free</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Premium">Premium</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editedBoard?.status || ''}
                  onChange={(e) => setEditedBoard(prev => 
                    prev ? { ...prev, status: e.target.value as JobBoardStatus } : null
                  )}
                  label="Status"
                >
                  <MenuItem value="Connected">Connected</MenuItem>
                  <MenuItem value="Disconnected">Disconnected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                value={editedBoard?.cost || 0}
                onChange={(e) => setEditedBoard(prev => 
                  prev ? { ...prev, cost: Number(e.target.value) } : null
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="API Key"
                value={editedBoard?.apiKey || ''}
                onChange={(e) => setEditedBoard(prev => 
                  prev ? { ...prev, apiKey: e.target.value } : null
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveBoard}
            startIcon={<CheckCircleIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Board Dialog */}
      <Dialog open={isAddBoardDialogOpen} onClose={handleCloseAddBoardDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Platform
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Platform Name"
                value={editedBoard?.name || ''}
                onChange={(e) => setEditedBoard(prev => 
                  prev ? { ...prev, name: e.target.value } : null
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editedBoard?.type || ''}
                  onChange={(e) => setEditedBoard(prev => 
                    prev ? { ...prev, type: e.target.value as 'Premium' | 'Free' | 'Paid' } : null
                  )}
                  label="Type"
                >
                  <MenuItem value="Free">Free</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Premium">Premium</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                value={editedBoard?.cost || 0}
                onChange={(e) => setEditedBoard(prev => 
                  prev ? { ...prev, cost: Number(e.target.value) } : null
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="API Key"
                value={editedBoard?.apiKey || ''}
                onChange={(e) => setEditedBoard(prev => 
                  prev ? { ...prev, apiKey: e.target.value } : null
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddBoardDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveBoard}
            startIcon={<CheckCircleIcon />}
          >
            Add Platform
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={isConfirmDeleteOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this platform? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteBoard}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={isAlertOpen}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alertSeverity}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JobDistribution; 