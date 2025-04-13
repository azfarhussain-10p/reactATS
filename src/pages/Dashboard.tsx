import React, { useState } from 'react';
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
  useMediaQuery
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
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userRole] = useState<string>(localStorage.getItem('userRole') || 'recruiter');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
    navigate(path);
  };

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
            Quick Actions
          </Typography>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Candidates Management */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={1} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  borderRadius: 2
                }}
                onClick={() => navigateTo('/candidates')}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{
                    bgcolor: 'primary.lighter',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    Candidates
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View and manage your candidate pipeline
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button size="small" color="primary" endIcon={<ArrowForwardIcon />}>
                    View Candidates
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            {/* Job Openings */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={1} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  borderRadius: 2
                }}
                onClick={() => navigateTo('/job-openings')}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{
                    bgcolor: 'primary.lighter',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <WorkIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    Job Openings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create and manage job listings
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button size="small" color="primary" endIcon={<ArrowForwardIcon />}>
                    View Jobs
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            {/* Interview Scheduler */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={1} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  borderRadius: 2
                }}
                onClick={() => navigateTo('/interviews')}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{
                    bgcolor: 'primary.lighter',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <EventIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    Interviews
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Schedule and manage interviews
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button size="small" color="primary" endIcon={<ArrowForwardIcon />}>
                    View Schedule
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            {/* Analytics */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={1} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  borderRadius: 2
                }}
                onClick={() => navigateTo('/analytics')}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{
                    bgcolor: 'primary.lighter',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track recruitment metrics
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button size="small" color="primary" endIcon={<ArrowForwardIcon />}>
                    View Analytics
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        <Grid container spacing={3}>
          {/* Upcoming Interviews Section */}
          <Grid item xs={12} md={6} lg={4}>
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
              
              <List disablePadding>
                {upcomingInterviews.map(interview => (
                  <ListItem
                    key={interview.id}
                    disablePadding
                    secondaryAction={
                      <Chip 
                        label={`${interview.time}, ${interview.date}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    }
                    sx={{ 
                      mb: 1.5, 
                      p: 1.5, 
                      backgroundColor: 'background.paper', 
                      borderRadius: 1,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      '&:hover': { backgroundColor: '#f8f9fa' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: { xs: 42, sm: 52 } }}>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                        {interview.candidateName.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="500" noWrap>
                          {interview.candidateName}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {interview.position}
                        </Typography>
                      }
                      sx={{ my: 0 }}
                    />
                  </ListItem>
                ))}
              </List>
              
              {upcomingInterviews.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No upcoming interviews scheduled
                </Typography>
              )}
            </Paper>
          </Grid>
          
          {/* Recent Candidates Section */}
          <Grid item xs={12} md={6} lg={4}>
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
              
              <List disablePadding>
                {recentCandidates.map(candidate => (
                  <ListItem
                    key={candidate.id}
                    disablePadding
                    secondaryAction={
                      <Chip 
                        label={candidate.status} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    }
                    sx={{ 
                      mb: 1.5, 
                      p: 1.5, 
                      backgroundColor: 'background.paper', 
                      borderRadius: 1,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      '&:hover': { backgroundColor: '#f8f9fa' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: { xs: 42, sm: 52 } }}>
                      <Avatar sx={{ bgcolor: 'secondary.light', width: 40, height: 40 }}>
                        {candidate.name.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="500" noWrap>
                          {candidate.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {candidate.position}
                        </Typography>
                      }
                      sx={{ my: 0 }}
                    />
                  </ListItem>
                ))}
              </List>
              
              {recentCandidates.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No recent candidates
                </Typography>
              )}
            </Paper>
          </Grid>
          
          {/* Active Jobs Section */}
          <Grid item xs={12} md={6} lg={4}>
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
                  Active Job Postings
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigateTo('/job-openings')}
                  endIcon={<ArrowForwardIcon />}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List disablePadding>
                {activeJobs.map(job => (
                  <ListItem
                    key={job.id}
                    disablePadding
                    secondaryAction={
                      <Chip 
                        label={`${job.applicants} applicants`} 
                        size="small" 
                        color="success" 
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    }
                    sx={{ 
                      mb: 1.5, 
                      p: 1.5, 
                      backgroundColor: 'background.paper', 
                      borderRadius: 1,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      '&:hover': { backgroundColor: '#f8f9fa' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: { xs: 42, sm: 52 } }}>
                      <Box sx={{
                        bgcolor: 'success.lighter',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <WorkIcon sx={{ color: 'success.main' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="500" noWrap>
                          {job.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {job.department}
                        </Typography>
                      }
                      sx={{ my: 0 }}
                    />
                  </ListItem>
                ))}
              </List>
              
              {activeJobs.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No active job postings
                </Typography>
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
                    startIcon={<BarChartIcon />}
                    onClick={() => navigateTo('/advanced-analytics')}
                    fullWidth
                    sx={{ 
                      textTransform: 'none', 
                      py: 1.5, 
                      borderRadius: 2,
                      boxShadow: 2
                    }}
                  >
                    Advanced Analytics
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<NoteIcon />}
                    onClick={() => navigateTo('/application-forms')}
                    fullWidth
                    sx={{ 
                      textTransform: 'none', 
                      py: 1.5, 
                      borderRadius: 2,
                      boxShadow: 2
                    }}
                  >
                    Form Builder
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
        
        {/* Additional Dashboard Widgets - Add more feature integrations */}
        <Box sx={{ mt: 6 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            fontWeight="500" 
            sx={{ 
              mb: 3,
              px: { xs: 1, sm: 0 }
            }}
          >
            Advanced Features
          </Typography>
          
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Advanced Analytics */}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={1} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  borderRadius: 2
                }}
                onClick={() => navigateTo('/advanced-analytics')}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                      <BarChartIcon />
                    </Avatar>
                    <Typography variant="h6" component="div">
                      Advanced Analytics
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Access in-depth recruitment analytics, custom reports, and performance metrics
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 1 }}
                    fullWidth
                  >
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Reports */}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={1} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  borderRadius: 2
                }}
                onClick={() => navigateTo('/reports')}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                      <AssignmentIcon />
                    </Avatar>
                    <Typography variant="h6" component="div">
                      Report Viewer
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Generate, customize, and export reports for all recruitment activities
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="success" 
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 1 }}
                    fullWidth
                  >
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Document Sharing */}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={1} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  borderRadius: 2
                }}
                onClick={() => navigateTo('/document-sharing')}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                      <DescriptionIcon />
                    </Avatar>
                    <Typography variant="h6" component="div">
                      Document Sharing
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Share, manage, and collaborate on recruitment documents with your team
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="warning" 
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 1 }}
                    fullWidth
                  >
                    Access Documents
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard; 