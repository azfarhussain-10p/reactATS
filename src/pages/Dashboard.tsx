import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  CardHeader, 
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Container,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Work as WorkIcon, 
  Event as EventIcon, 
  Assessment as AssessmentIcon, 
  BusinessCenter as BusinessCenterIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  InsertDriveFile as FileIcon,
  BarChart as BarChartIcon,
  Note as NoteIcon,
  PeopleAlt as PeopleAltIcon,
  ArrowForward as ArrowForwardIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  PersonAdd as PersonAddIcon,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import useAnalyticsNavigation from '../hooks/useAnalyticsNavigation';
import CandidateStats from '../components/CandidateStats';
import { useCandidateContext } from '../contexts/CandidateContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userRole] = useState<string>(localStorage.getItem('userRole') || 'recruiter');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { goToAnalytics } = useAnalyticsNavigation();
  const { candidates } = useCandidateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for dashboard
  const upcomingInterviews = [
    { id: 1, candidateName: 'John Doe', position: 'Senior React Developer', time: '10:00 AM', date: 'Today' },
    { id: 2, candidateName: 'Jane Smith', position: 'UX Designer', time: '2:30 PM', date: 'Tomorrow' },
    { id: 3, candidateName: 'Mike Johnson', position: 'DevOps Engineer', time: '11:15 AM', date: '05/20/2023' }
  ];

  const recentCandidates = [
    { id: 1, name: 'Emily Brown', position: 'Frontend Developer', status: 'Phone Screening' },
    { id: 2, name: 'Robert Wilson', position: 'Product Manager', status: 'Technical Interview' },
    { id: 3, name: 'Linda Garcia', position: 'QA Engineer', status: 'Offer Sent' }
  ];

  const activeJobs = [
    { id: 1, title: 'Senior React Developer', department: 'Engineering', applicants: 24 },
    { id: 2, title: 'UX Designer', department: 'Design', applicants: 18 },
    { id: 3, title: 'DevOps Engineer', department: 'Infrastructure', applicants: 12 }
  ];

  // Helper functions for navigation
  const navigateTo = (path: string) => {
    console.log(`Navigating to: ${path}`);
    if (path === '/jobs/create') {
      navigate('/job-openings');
    } else if (path === '/schedule-interview') {
      navigate('/interviews');
    } else {
      navigate(path);
    }
  };

  // Add error handling
  useEffect(() => {
    const handleErrors = () => {
      try {
        // Only check this once, not inside the effect's callback
        if (!candidates) {
          console.warn('Candidate data not available');
        }
      } catch (err) {
        console.error('Error in Dashboard:', err);
        setError('Error loading dashboard components');
      }
    };

    handleErrors();
  }, [candidates]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: '#f9fafb', 
      minHeight: 'calc(100vh - 80px)',
      width: '100%',
      pt: { xs: 2, sm: 3 },
      pb: { xs: 4, sm: 6 }
    }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 2,
            backgroundColor: 'white',
            mb: 3,
            overflow: 'hidden'
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="500" gutterBottom>
            Welcome to Your ATS Dashboard
            {userRole === 'admin' && (
              <Chip 
                label="Admin" 
                color="primary" 
                size="small" 
                sx={{ ml: 2, verticalAlign: 'middle' }} 
              />
            )}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Manage your recruitment process efficiently
          </Typography>
        </Paper>
        
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h5" component="h2" fontWeight="500" sx={{ mb: 3 }}>
            Quick Actions
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => navigateTo('/candidates/add')}
              >
                <Box
                  sx={{
                    bgcolor: 'primary.light',
                    p: 2,
                    borderRadius: '50%',
                    mb: 2
                  }}
                >
                  <PersonAddIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  Add Candidate
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create a new candidate profile in the system
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => navigateTo('/jobs/create')}
              >
                <Box
                  sx={{
                    bgcolor: '#e3f2fd',
                    p: 2,
                    borderRadius: '50%',
                    mb: 2
                  }}
                >
                  <WorkIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  Post Job
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create and publish a new job opening
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => navigateTo('/schedule-interview')}
              >
                <Box
                  sx={{
                    bgcolor: '#e8f5e9',
                    p: 2,
                    borderRadius: '50%',
                    mb: 2
                  }}
                >
                  <EventIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  Schedule Interview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Set up interviews with candidates
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => navigateTo('/analytics')}
              >
                <Box
                  sx={{
                    bgcolor: '#fce4ec',
                    p: 2,
                    borderRadius: '50%',
                    mb: 2
                  }}
                >
                  <BarChartIcon sx={{ fontSize: 40, color: '#c2185b' }} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View detailed hiring analytics
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        {/* Candidate Statistics Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            fontWeight="500" 
            sx={{ 
              mb: 3,
              px: { xs: 1, sm: 0 }
            }}
          >
            Candidate Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ position: 'relative' }}>
                {candidates && candidates.length > 0 ? (
                  <CandidateStats 
                    variant="detailed" 
                    showTitle={false} 
                    maxTagsToShow={8}
                  />
                ) : (
                  <Card sx={{ p: 3 }}>
                    <Typography variant="body1" align="center">
                      No candidate data available
                    </Typography>
                  </Card>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 3 }}>
                {candidates && candidates.length > 0 ? (
                  <CandidateStats 
                    variant="compact" 
                    showTitle={true}
                  />
                ) : (
                  <Card sx={{ p: 3 }}>
                    <Typography variant="body1" align="center">
                      No candidate data available
                    </Typography>
                  </Card>
                )}
                <Card sx={{ flexGrow: 1 }}>
                  <CardHeader 
                    title="Hiring Progress" 
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <Divider />
                  <CardContent sx={{ pt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => navigateTo('/advanced-analytics')}
                        endIcon={<BarChartIcon />}
                      >
                        View Detailed Analytics
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                height: '100%',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3" fontWeight="500">
                  Upcoming Interviews
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigateTo('/interviews')}
                  endIcon={<ArrowForwardIcon />}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List sx={{ p: 0 }}>
                {upcomingInterviews.map(interview => (
                  <ListItem
                    key={interview.id}
                    disablePadding
                    sx={{ 
                      mb: 1.5, 
                      p: 1.5, 
                      backgroundColor: 'background.paper', 
                      borderRadius: 1,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      '&:hover': { backgroundColor: '#f8f9fa' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: '40px' }}>
                      <Avatar sx={{ bgcolor: 'secondary.light', width: 36, height: 36 }}>
                        {interview.candidateName.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={interview.candidateName}
                      secondary={interview.position}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {interview.time}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {interview.date}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
              
              {upcomingInterviews.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No upcoming interviews
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                height: '100%',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3" fontWeight="500">
                  Recent Candidates
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigateTo('/candidates')}
                  endIcon={<ArrowForwardIcon />}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              
                {recentCandidates.map(candidate => (
                  <ListItem
                    key={candidate.id}
                    disablePadding
                    sx={{ 
                      mb: 1.5, 
                      p: 1.5, 
                      backgroundColor: 'background.paper', 
                      borderRadius: 1,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      '&:hover': { backgroundColor: '#f8f9fa' },
                      flexDirection: 'column',
                      alignItems: 'flex-start'
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      mb: 1
                    }}>
                      <Avatar sx={{ 
                        bgcolor: 'secondary.light', 
                        width: 40, 
                        height: 40,
                        mr: 2
                      }}>
                        {candidate.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ 
                        flexGrow: 1,
                        overflow: 'hidden'
                      }}>
                        <Typography variant="body1" fontWeight="500" noWrap>
                          {candidate.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {candidate.position}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                      width: '100%', 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pl: { xs: 0, sm: 7 }
                    }}>
                      <Chip 
                        label={candidate.status}
                        size="small"
                        color="primary"
                        variant={candidate.status === 'New' ? 'outlined' : 'filled'}
                      />
                      <Button 
                        size="small" 
                        onClick={() => navigateTo(`/candidates/${candidate.id}`)}
                      >
                        View Profile
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              
              {recentCandidates.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent candidates
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* More Features Section */}
        <Box sx={{ mt: 4 }}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: { xs: 2, sm: 3 },
              borderRadius: 2
            }}
          >
            <Typography variant="h6" component="h2" fontWeight="500" gutterBottom>
              More Features
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  onClick={() => navigateTo('/document-sharing')}
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start', 
                    textTransform: 'none', 
                    py: 1.5,
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  Documents
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<SchoolIcon />}
                  onClick={() => navigateTo('/skills-gap')}
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start', 
                    textTransform: 'none', 
                    py: 1.5,
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  Skills Gap
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={() => navigateTo('/email-campaigns')}
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start', 
                    textTransform: 'none', 
                    py: 1.5,
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  Email Campaigns
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  onClick={() => navigateTo('/interview-kits')}
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start', 
                    textTransform: 'none', 
                    py: 1.5,
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  Interview Kits
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<FileIcon />}
                  onClick={() => navigateTo('/resume-parser')}
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start', 
                    textTransform: 'none', 
                    py: 1.5,
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  Resume Parser
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<BarChartIcon />}
                  onClick={() => navigateTo('/reports')}
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start', 
                    textTransform: 'none', 
                    py: 1.5,
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  Reports
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        
        {/* Admin Only Section */}
        {userRole === 'admin' && (
          <Box sx={{ mt: 4 }}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: { xs: 2, sm: 3 },
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography variant="h6" component="h2" fontWeight="500" gutterBottom>
                Admin Tools
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                These tools are only available to administrators
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PeopleAltIcon />}
                    onClick={() => navigateTo('/user-management')}
                    fullWidth
                    sx={{ 
                      textTransform: 'none', 
                      py: 1.5, 
                      borderRadius: 2,
                      boxShadow: 2
                    }}
                  >
                    User Management
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<SettingsIcon />}
                    onClick={() => navigateTo('/settings')}
                    fullWidth
                    sx={{ 
                      textTransform: 'none', 
                      py: 1.5, 
                      borderRadius: 2,
                      boxShadow: 2
                    }}
                  >
                    System Settings
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<DashboardIcon />}
                    onClick={() => navigateTo('/advanced-dashboard')}
                    fullWidth
                    sx={{ 
                      textTransform: 'none', 
                      py: 1.5, 
                      borderRadius: 2,
                      boxShadow: 2
                    }}
                  >
                    Custom Dashboards
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard; 