import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Share as ShareIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import JobBoard from './JobBoard';
import JobOpenings from './JobOpenings';
import JobDistribution from './JobDistribution';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`job-management-tabpanel-${index}`}
      aria-labelledby={`job-management-tab-${index}`}
      {...other}
      style={{ height: '100%', width: '100%', overflow: 'auto' }}
    >
      {value === index && <Box sx={{ height: '100%', width: '100%' }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `job-management-tab-${index}`,
    'aria-controls': `job-management-tabpanel-${index}`,
  };
}

const JobManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Set active tab based on path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/job-board') {
      setActiveTab(0);
    } else if (path === '/job-openings') {
      setActiveTab(1);
    } else if (path === '/job-distribution') {
      setActiveTab(2);
    }
  }, [location.pathname]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);

    // Update the URL to match the selected tab
    switch (newValue) {
      case 0:
        navigate('/job-board');
        break;
      case 1:
        navigate('/job-openings');
        break;
      case 2:
        navigate('/job-distribution');
        break;
      default:
        navigate('/job-board');
    }
  };

  // Handle errors
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Paper
        sx={{
          borderRadius: '8px',
          overflow: 'hidden',
          mb: 2,
          boxShadow: theme.shadows[2],
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 500, mb: 1 }}>
                Job Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create, edit, and manage job postings across your organization
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<WorkIcon />}
              onClick={() => {
                if (activeTab === 0 && typeof window !== 'undefined') {
                  // Call the openNewJobDialog function in JobBoard component
                  const jobBoardElement = document.getElementById('job-management-tabpanel-0');
                  if (jobBoardElement) {
                    // Create and dispatch a custom event that JobBoard will listen for
                    const event = new CustomEvent('openNewJobDialog');
                    jobBoardElement.dispatchEvent(event);
                  }
                }
              }}
              sx={{
                minWidth: 150,
                height: 40,
                boxShadow: theme.shadows[3],
                '&:hover': {
                  boxShadow: theme.shadows[5],
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease',
                },
              }}
            >
              Post New Job
            </Button>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="job management tabs"
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons={isMobile ? 'auto' : false}
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 64,
              fontSize: theme.typography.body1.fontSize,
              fontWeight: theme.typography.fontWeightMedium,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                fontWeight: theme.typography.fontWeightBold,
                color: theme.palette.primary.main,
              },
            },
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Tab
            icon={<WorkIcon />}
            iconPosition="start"
            label={!isMobile ? 'Job Board' : ''}
            {...a11yProps(0)}
            sx={{ py: 3 }}
          />
          <Tab
            icon={<DashboardIcon />}
            iconPosition="start"
            label={!isMobile ? 'Job Openings' : ''}
            {...a11yProps(1)}
            sx={{ py: 3 }}
          />
          <Tab
            icon={<ShareIcon />}
            iconPosition="start"
            label={!isMobile ? 'Job Distribution' : ''}
            {...a11yProps(2)}
            sx={{ py: 3 }}
          />
        </Tabs>
      </Paper>

      <Box
        sx={{
          flexGrow: 1,
          borderRadius: '8px',
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: 'calc(100% - 200px)',
          minHeight: '400px',
          zIndex: 1,
        }}
      >
        {isLoading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel key="job-board-panel" value={activeTab} index={0}>
              <JobBoard />
            </TabPanel>
            <TabPanel key="job-openings-panel" value={activeTab} index={1}>
              <JobOpenings />
            </TabPanel>
            <TabPanel key="job-distribution-panel" value={activeTab} index={2}>
              <JobDistribution />
            </TabPanel>
          </>
        )}
      </Box>
    </Box>
  );
};

export default JobManagement;
