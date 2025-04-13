import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, Link as RouterLink } from 'react-router-dom';
import { 
  CssBaseline, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Container,
  Paper,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  Stack,
  Tab,
  Tabs,
  IconButton,
  Divider,
  Grid,
  ThemeProvider,
  createTheme,
  responsiveFontSizes
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  PersonSearch as PersonSearchIcon,
  EventNote as EventNoteIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Event as EventIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Place as PlaceIcon,
  CompareArrows as CompareArrowsIcon,
  Assessment as ReportsIcon,
  AccountTree as AccountTreeIcon,
  BarChart as BarChartIcon,
  School as SchoolIcon,
  Send as SendIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  Description as FormIcon
} from '@mui/icons-material';
import { CandidateProvider } from './contexts/CandidateContext';
import { JobPostingProvider } from './contexts/JobPostingContext';
import { PipelineProvider } from './contexts/PipelineContext';
import { EvaluationProvider } from './contexts/EvaluationContext';
import { ResumeParsingProvider } from './contexts/ResumeParsingContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { EmailCampaignProvider } from './contexts/EmailCampaignContext';
import { FormBuilderProvider } from './contexts/FormBuilderContext';
import { AccessibilitySettings } from './components/AccessibilityMenu';
import ScreenReaderAnnouncer from './components/ScreenReaderAnnouncer';
import './styles/accessibilityStyles.css';
import { AdvancedAnalyticsProvider } from './contexts/AdvancedAnalyticsContext';

// Drawer width for the sidebar navigation
const drawerWidth = 240;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState('Dashboard');
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(() => {
    // Try to load saved settings from localStorage
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Failed to parse saved accessibility settings', e);
      }
    }
    return {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      keyboardFocusVisible: true,
      fontSizeMultiplier: 1,
    };
  });

  useEffect(() => {
    // Update selected page based on URL
    const path = location.pathname;
    if (path.includes('/dashboard')) {
      setSelectedPage('Dashboard');
    } else if (path.includes('/job-openings')) {
      setSelectedPage('Job Openings');
    } else if (path.includes('/candidates')) {
      setSelectedPage('Candidates');
    } else if (path.includes('/interviews')) {
      setSelectedPage('Interviews');
    } else if (path.includes('/reports')) {
      setSelectedPage('Reports');
    } else if (path.includes('/analytics')) {
      setSelectedPage('Analytics');
    } else if (path.includes('/skills-gap')) {
      setSelectedPage('Skills Gap Analysis');
    } else if (path.includes('/settings')) {
      setSelectedPage('Settings');
    } else if (path.includes('/job-distribution')) {
      setSelectedPage('Job Distribution');
    } else if (path.includes('/email-campaigns')) {
      setSelectedPage('Email Campaigns');
    } else if (path.includes('/application-forms')) {
      setSelectedPage('Application Forms');
    } else if (path.includes('/document-sharing')) {
      setSelectedPage('Documents');
    }
  }, [location]);

  // Create a theme that respects accessibility settings
  const theme = React.useMemo(() => {
    let theme = createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: accessibilitySettings.highContrast ? '#0000EE' : '#1976d2',
          dark: accessibilitySettings.highContrast ? '#00008B' : '#115293',
          light: accessibilitySettings.highContrast ? '#6666FF' : '#4791db',
          contrastText: '#ffffff',
        },
        secondary: {
          main: accessibilitySettings.highContrast ? '#551A8B' : '#9c27b0',
          dark: accessibilitySettings.highContrast ? '#4B0082' : '#7b1fa2',
          light: accessibilitySettings.highContrast ? '#8A2BE2' : '#ba68c8',
          contrastText: '#ffffff',
        },
        error: {
          main: accessibilitySettings.highContrast ? '#B22222' : '#d32f2f',
        },
        success: {
          main: accessibilitySettings.highContrast ? '#008000' : '#2e7d32',
        },
        text: {
          primary: accessibilitySettings.highContrast ? '#000000' : '#212121',
          secondary: accessibilitySettings.highContrast ? '#444444' : '#757575',
        },
        background: {
          default: accessibilitySettings.highContrast ? '#FFFFFF' : '#f5f5f5',
          paper: accessibilitySettings.highContrast ? '#FFFFFF' : '#ffffff',
        },
      },
      typography: {
        fontSize: accessibilitySettings.largeText ? 16 : 14,
      },
      components: {
        MuiButton: {
          defaultProps: {
            disableElevation: accessibilitySettings.reducedMotion,
          },
          styleOverrides: {
            root: {
              transition: accessibilitySettings.reducedMotion ? 'none' : undefined,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              transition: accessibilitySettings.reducedMotion ? 'none' : undefined,
            },
          },
        },
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              transition: accessibilitySettings.reducedMotion ? 'none' : undefined,
              '& *': {
                transition: accessibilitySettings.reducedMotion ? 'none !important' : undefined,
                animation: accessibilitySettings.reducedMotion ? 'none !important' : undefined,
              },
            },
            ':focus-visible': {
              outline: accessibilitySettings.keyboardFocusVisible ? '3px solid #1976d2' : 'none',
              outlineOffset: '2px',
            },
          },
        },
      },
    });
    
    // Apply responsive font sizes if largeText is enabled
    if (accessibilitySettings.largeText) {
      theme = responsiveFontSizes(theme);
    }
    
    return theme;
  }, [accessibilitySettings]);

  // Update body classes based on accessibility settings
  useEffect(() => {
    // High contrast mode
    if (accessibilitySettings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Large text mode
    if (accessibilitySettings.largeText) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }
    
    // Reduced motion
    if (accessibilitySettings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
    
    // Keyboard focus visibility
    if (accessibilitySettings.keyboardFocusVisible) {
      document.body.classList.add('keyboard-focus-visible');
    } else {
      document.body.classList.remove('keyboard-focus-visible');
    }
    
    // Set CSS variables
    document.documentElement.style.setProperty(
      '--font-size-multiplier', 
      accessibilitySettings.fontSizeMultiplier.toString()
    );
  }, [accessibilitySettings]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavItemClick = (text: string, path: string) => {
    setSelectedPage(text);
    navigate(path);
    setMobileOpen(false);
  };

  // Main content or nested routes
  const shouldRenderMainContent = () => {
    const path = location.pathname;
    return path === '/' || 
           path === '/dashboard' || 
           path === '/candidates' || 
           path === '/interviews' || 
           path === '/reports' || 
           path === '/analytics' || 
           path === '/skills-gap' || 
           path === '/settings';
  };

  // Define menu items (sidebar navigation)
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Job Openings', icon: <WorkIcon />, path: '/job-openings' },
    { text: 'Job Distribution', icon: <SendIcon />, path: '/job-distribution' },
    { text: 'Candidates', icon: <PersonSearchIcon />, path: '/candidates' },
    { text: 'Recruitment Pipeline', icon: <AccountTreeIcon />, path: '/pipeline' },
    { text: 'Interview Scheduler', icon: <EventIcon />, path: '/interviews' },
    { text: 'Email Campaigns', icon: <CampaignIcon />, path: '/email-campaigns' },
    { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
    { text: 'Analytics', icon: <AssessmentIcon />, path: '/analytics' },
    { text: 'Skills Gap Analysis', icon: <SchoolIcon />, path: '/skills-gap' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Application Forms', icon: <FormIcon />, path: '/application-forms' }
  ];

  // Nested menu items
  const candidateSubMenu = [
    { text: 'All Candidates', path: '/candidates' },
    { text: 'Add Candidate', path: '/candidates/add' },
    { text: 'Candidate Ranking', path: '/candidates/ranking' }
  ];

  // Render dashboard content based on selected page
  const renderMainContent = () => {
    if (!shouldRenderMainContent()) {
      return <Outlet />;
    }

    switch (selectedPage) {
      case 'Dashboard':
        return <DashboardContent />;
      case 'Job Openings':
        return <JobOpeningsContent />;
      case 'Candidates':
        return <CandidatesContent navigate={navigate} />;
      case 'Interviews':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Interviews
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button 
                variant="contained"
                startIcon={<EventIcon />}
                onClick={() => navigate('/interviews/scheduler')}
              >
                Open Interview Scheduler
              </Button>
            </Box>
            <Paper sx={{ p: 3 }}>
              <Typography variant="body1">
                The Interview section helps you manage and schedule interviews with candidates.
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Use the Interview Scheduler to:
              </Typography>
              <ul>
                <li>Schedule new interviews with candidates</li>
                <li>Track upcoming and past interviews</li>
                <li>Add interview feedback and notes</li>
                <li>Coordinate with team members</li>
              </ul>
            </Paper>
          </Box>
        );
      case 'Reports':
        return (
          <Typography paragraph>
            Reports content goes here.
          </Typography>
        );
      case 'Settings':
        return (
          <Typography paragraph>
            Settings content goes here.
          </Typography>
        );
      default:
        return <Outlet />;
    }
  };

  // Drawer content
  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          ATS + Scoring
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
            <ListItemButton 
              selected={selectedPage === item.text}
                onClick={() => handleNavItemClick(item.text, item.path)}
            >
                <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
            
            {/* Submenu for Candidates */}
            {item.text === 'Candidates' && (
              <List disablePadding>
                {candidateSubMenu.map((subItem) => (
                  <ListItem key={subItem.text} disablePadding>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={() => handleNavItemClick(subItem.text, subItem.path)}
                    >
                      <ListItemText 
                        primary={subItem.text}
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          style: { fontWeight: location.pathname === subItem.path ? 'bold' : 'normal' }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  // Handle the accessibility settings change
  const handleAccessibilityChange = (settings: AccessibilitySettings) => {
    setAccessibilitySettings(settings);
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ScreenReaderAnnouncer />
      <AdvancedAnalyticsProvider>
        <CandidateProvider>
          <JobPostingProvider>
            <PipelineProvider>
              <EvaluationProvider>
                <ResumeParsingProvider>
                  <AnalyticsProvider>
                    <EmailCampaignProvider>
                      <FormBuilderProvider>
                        <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
                              ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
                                edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {selectedPage}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
                            {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
                                keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
                            {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
                          {/* Main content */}
      <Box
        component="main"
        sx={{ 
                              backgroundColor: (theme) =>
                                theme.palette.mode === 'light'
                                  ? theme.palette.grey[100]
                                  : theme.palette.grey[900],
          flexGrow: 1, 
                              height: '100vh',
                              overflow: 'auto',
                            }}
                          >
                            <Toolbar />
                            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                              {renderMainContent()}
        </Container>
      </Box>
    </Box>
                      </FormBuilderProvider>
                    </EmailCampaignProvider>
                  </AnalyticsProvider>
                </ResumeParsingProvider>
              </EvaluationProvider>
            </PipelineProvider>
          </JobPostingProvider>
        </CandidateProvider>
      </AdvancedAnalyticsProvider>
      
      {/* Skip links for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
    </ThemeProvider>
  );
}

// Dashboard Component
function DashboardContent() {
  const stats = [
    { title: 'Open Positions', value: 12, color: '#bbdefb' },
    { title: 'Total Candidates', value: 143, color: '#f8bbd0' },
    { title: 'Interviews This Week', value: 8, color: '#c8e6c9' },
    { title: 'New Applications', value: 24, color: '#ffe0b2' },
  ];

  return (
    <Box>
      <Grid component="div" container spacing={4}>
        {stats.map((stat, index) => (
          <Grid component="div" item xs={12} md={6} lg={3} key={index}>
            <Card sx={{ bgcolor: stat.color }} className="dashboard-card">
              <CardContent>
                <Typography variant="h4" component="div">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid component="div" container spacing={3}>
        <Grid component="div" item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography paragraph>
                • John Smith applied for Frontend Developer position
              </Typography>
              <Typography paragraph>
                • Interview scheduled with Jane Doe for UX Designer
              </Typography>
              <Typography paragraph>
                • New position added: DevOps Engineer
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid component="div" item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Interviews
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography paragraph>
                • Sarah Johnson - Marketing Manager (Today, 2:00 PM)
              </Typography>
              <Typography paragraph>
                • Michael Brown - Software Engineer (Tomorrow, 10:00 AM)
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// Job Openings Component
function JobOpeningsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock job data
  const jobs = [
    { id: 1, title: 'Frontend Developer', department: 'Engineering', location: 'Remote', status: 'Open', applicants: 12, postedDate: '2023-11-15' },
    { id: 2, title: 'UX Designer', department: 'Design', location: 'New York', status: 'Open', applicants: 8, postedDate: '2023-11-10' },
    { id: 3, title: 'Product Manager', department: 'Product', location: 'San Francisco', status: 'Open', applicants: 5, postedDate: '2023-11-05' },
    { id: 4, title: 'Backend Developer', department: 'Engineering', location: 'Remote', status: 'Closed', applicants: 20, postedDate: '2023-10-20' },
    { id: 5, title: 'DevOps Engineer', department: 'Engineering', location: 'Seattle', status: 'Open', applicants: 3, postedDate: '2023-11-20' },
  ];

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <TextField
            placeholder="Search jobs..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />} 
            sx={{ ml: 1 }}
          >
            Filter
          </Button>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add New Job
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Job Title</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Applicants</strong></TableCell>
              <TableCell><strong>Posted Date</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.department}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>
                  <Chip 
                    label={job.status} 
                    color={job.status === 'Open' ? 'primary' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{job.applicants}</TableCell>
                <TableCell>{new Date(job.postedDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton size="small">
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// Candidates Component
interface CandidatesContentProps {
  navigate: (path: string) => void;
}

function CandidatesContent({ navigate }: CandidatesContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(0); // 0 for list view, 1 for grid view
  
  // Mock candidates data
  const candidates = [
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john.doe@example.com', 
      phone: '(555) 123-4567',
      role: 'Frontend Developer',
      status: 'Interview',
      location: 'New York, NY',
      skills: ['React', 'JavaScript', 'CSS', 'HTML'],
      appliedDate: '2023-11-10'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane.smith@example.com', 
      phone: '(555) 987-6543',
      role: 'UX Designer',
      status: 'Screening',
      location: 'San Francisco, CA',
      skills: ['Figma', 'Adobe XD', 'UI/UX', 'Prototyping'],
      appliedDate: '2023-11-12'
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      email: 'mike.johnson@example.com', 
      phone: '(555) 456-7890',
      role: 'Backend Developer',
      status: 'Applied',
      location: 'Chicago, IL',
      skills: ['Node.js', 'Python', 'MongoDB', 'Express'],
      appliedDate: '2023-11-15'
    },
    { 
      id: 4, 
      name: 'Sara Williams', 
      email: 'sara.williams@example.com', 
      phone: '(555) 234-5678',
      role: 'Product Manager',
      status: 'Offer',
      location: 'Austin, TX',
      skills: ['Product Strategy', 'Agile', 'Market Research'],
      appliedDate: '2023-11-01'
    },
  ];

  // Status color mapping
  const statusColors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
    'Applied': 'default',
    'Screening': 'info',
    'Interview': 'primary',
    'Offer': 'success',
    'Hired': 'secondary',
    'Rejected': 'error',
  };

  // Filter candidates based on search term
  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    candidate.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Handle navigation to candidate profile
  const handleViewProfile = (candidateId: number) => {
    navigate(`/candidates/${candidateId}`);
  };
  
  // Handle navigation to add candidate page
  const handleAddCandidate = () => {
    navigate('/candidates/add');
  };
  
  // Handle navigation to candidate ranking page
  const handleViewRankings = () => {
    navigate('/candidates/ranking');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            placeholder="Search candidates..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />} 
            sx={{ ml: 1 }}
          >
            Filter
          </Button>
          <Tabs 
            value={viewMode} 
            onChange={(_e, newValue) => setViewMode(newValue)}
            sx={{ ml: 2 }}
          >
            <Tab label="List" />
            <Tab label="Grid" />
          </Tabs>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<CompareArrowsIcon />}
            onClick={handleViewRankings}
            sx={{ mr: 1 }}
          >
            View Rankings
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddCandidate}
          >
          Add Candidate
        </Button>
        </Box>
      </Box>

      {viewMode === 0 ? (
        // List View
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Applied Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>{candidate.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="body1">{candidate.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{candidate.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{candidate.role}</TableCell>
                  <TableCell>{candidate.location}</TableCell>
                  <TableCell>
                    <Chip 
                      label={candidate.status} 
                      color={statusColors[candidate.status]} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{new Date(candidate.appliedDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => handleViewProfile(candidate.id)}
                    >
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        // Grid View
        <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1.5 }}>
          {filteredCandidates.map((candidate) => (
            <Box key={candidate.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, padding: 1.5 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, mr: 2 }}>{candidate.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="h6">{candidate.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{candidate.role}</Typography>
                      <Chip 
                        label={candidate.status} 
                        color={statusColors[candidate.status]} 
                        size="small" 
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                  
                  <Stack spacing={1} mt={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{candidate.email}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{candidate.phone}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PlaceIcon fontSize="small" color="action" />
                      <Typography variant="body2">{candidate.location}</Typography>
                    </Stack>
                  </Stack>
                  
                  <Box mt={2}>
                    <Typography variant="subtitle2">Skills:</Typography>
                    <Box sx={{ mt: 1 }}>
                      {candidate.skills.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => handleViewProfile(candidate.id)}
                    >
                      View Profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default App;
