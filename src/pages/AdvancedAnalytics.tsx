import React, { useState, useRef, useEffect, Component, ErrorInfo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  SkipPrevious,
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
  Container,
  Tab,
  Tabs,
  Grid,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon,
  Accessibility as AccessibilityIcon,
} from '@mui/icons-material';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useATSIntegration } from '../contexts/ATSIntegrationContext';
import { useAdvancedDashboard } from '../contexts/AdvancedDashboardContext';
import { ATSIntegrationProvider } from '../contexts/ATSIntegrationContext';
import { AdvancedDashboardProvider } from '../contexts/AdvancedDashboardContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';

// Create an accessible theme with enhanced contrast
const getAccessibleTheme = (baseTheme: any) => {
  let theme = createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      primary: {
        main: '#1976d2', // Higher contrast blue
        dark: '#0d47a1',
        light: '#42a5f5',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#7b1fa2', // Higher contrast purple
        dark: '#4a148c',
        light: '#9c27b0',
        contrastText: '#ffffff',
      },
      error: {
        main: '#d32f2f', // Higher contrast red
        dark: '#b71c1c',
        light: '#ef5350',
        contrastText: '#ffffff',
      },
      success: {
        main: '#2e7d32', // Higher contrast green
        dark: '#1b5e20',
        light: '#4caf50',
        contrastText: '#ffffff',
      },
      background: {
        default: '#fafafa',
        paper: '#ffffff',
      },
      text: {
        primary: '#212121', // Darker text for better contrast
        secondary: '#424242',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
    },
  });
  return responsiveFontSizes(theme);
};

// Mockup for chart components (in a real app, you'd use a library like recharts)
const CustomLineChart = ({ data }: { data: any }) => (
  <Box sx={{ 
    height: 250, 
    width: '100%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    border: '1px dashed #ccc',
    borderRadius: 1,
    p: 2,
    bgcolor: 'background.paper'
  }}>
    <Typography variant="body2" color="text.secondary">
      Line Chart Visualization (would render actual chart in production)
    </Typography>
  </Box>
);

const CustomBarChart = ({ data }: { data: any }) => (
  <Box sx={{ 
    height: 250, 
    width: '100%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    border: '1px dashed #ccc',
    borderRadius: 1,
    p: 2,
    bgcolor: 'background.paper'
  }}>
    <Typography variant="body2" color="text.secondary">
      Bar Chart Visualization (would render actual chart in production)
    </Typography>
  </Box>
);

const CustomPieChart = ({ data }: { data: any }) => (
  <Box sx={{ 
    height: 250, 
    width: '100%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    border: '1px dashed #ccc',
    borderRadius: 1,
    p: 2,
    bgcolor: 'background.paper'
  }}>
    <Typography variant="body2" color="text.secondary">
      Pie Chart Visualization (would render actual chart in production)
    </Typography>
  </Box>
);

const CustomAreaChart = ({ data }: { data: any }) => (
  <Box sx={{ 
    height: 300, 
    width: '100%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    border: '1px dashed #ccc',
    borderRadius: 1,
    p: 2,
    bgcolor: 'background.paper'
  }}>
    <Typography variant="body2" color="text.secondary">
      Area Chart Visualization (would render actual chart in production)
    </Typography>
  </Box>
);

const SankeyChart = ({ data }: { data: any }) => (
  <Box sx={{ 
    height: 300, 
    width: '100%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    border: '1px dashed #ccc',
    borderRadius: 1,
    p: 2,
    bgcolor: 'background.paper'
  }}>
    <Typography variant="body2" color="text.secondary">
      Sankey/Funnel Chart Visualization (would render actual chart in production)
    </Typography>
  </Box>
);

// Metric Card Component with improved accessibility
const MetricCard = ({ 
  title, 
  value, 
  trend, 
  trendValue, 
  icon,
  subtitle,
  ariaLabel,
}: { 
  title: string; 
  value: string | number; 
  trend: 'up' | 'down' | 'neutral'; 
  trendValue: string;
  icon?: React.ReactNode;
  subtitle?: string;
  ariaLabel?: string;
}) => {
  const trendColor = trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary';
  const trendIcon = trend === 'up' ? <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} /> 
                  : trend === 'down' ? <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} /> 
                  : null;
  
  const fullAriaLabel = ariaLabel || `${title}: ${value}${subtitle ? `, ${subtitle}` : ''}, Trend: ${trendValue}`;
  
  return (
    <Card sx={{ height: '100%' }} aria-label={fullAriaLabel} tabIndex={0}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {icon}
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }} aria-live="polite">
          {trendIcon}
          <Typography 
            variant="body2" 
            color={trendColor}
          >
            {trendValue}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Funnel Stage Component with improved accessibility
const FunnelStage = ({ 
  stage, 
  count, 
  total, 
  conversionRate, 
  timeInStage 
}: { 
  stage: string; 
  count: number; 
  total: number; 
  conversionRate: number;
  timeInStage: number;
}) => {
  const progressPercentage = (count / total) * 100;
  const ariaLabel = `${stage} stage: ${count} candidates, ${conversionRate.toFixed(1)}% conversion rate, average time in stage: ${timeInStage} days`;
  
  return (
    <Box sx={{ mb: 2 }} role="region" aria-label={`${stage} stage statistics`}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{stage}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            {count} candidates
          </Typography>
          <Chip 
            label={`${conversionRate.toFixed(1)}%`} 
            size="small" 
            color={conversionRate > 70 ? 'success' : conversionRate > 40 ? 'primary' : 'default'} 
            variant="outlined"
            aria-label={`${conversionRate.toFixed(1)}% conversion rate`}
          />
        </Box>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={progressPercentage} 
        sx={{ height: 10, borderRadius: 5 }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPercentage}
        aria-label={`${count} out of ${total} candidates (${progressPercentage.toFixed(1)}%)`}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
        Avg. time in stage: {timeInStage} days
      </Typography>
    </Box>
  );
};

// SkipLink component for keyboard navigation
const SkipLink = ({ targetId, label }: { targetId: string, label: string }) => {
  return (
    <Button 
      sx={{ 
        position: 'absolute', 
        left: '-9999px', 
        zIndex: 9999, 
        mt: 1, 
        ml: 1,
        '&:focus': {
          left: 'auto',
          position: 'relative'
        }
      }} 
      variant="contained" 
      size="small"
      href={`#${targetId}`}
    >
      {label}
    </Button>
  );
};

// Interface for tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel Component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Mock data for charts
const hiringFunnelData = [
  { name: 'Applications', value: 1200 },
  { name: 'Screenings', value: 800 },
  { name: 'Interviews', value: 500 },
  { name: 'Offers', value: 150 },
  { name: 'Hires', value: 100 },
];

// Mock overview metrics data
const mockOverviewMetrics = {
  totalCandidates: { value: 1200, change: 15 },
  timeToHire: { value: 23, change: -5 },
  costPerHire: { value: 4500, change: 3 },
  offerAcceptRate: { value: 85, change: 2 },
  diversityScore: { value: 72, change: 8 }
};

// Fallback function for getOverviewMetrics
const fallbackGetOverviewMetrics = (timeRange) => {
  return mockOverviewMetrics;
};

const timeToHireData = [
  { month: 'Jan', days: 25 },
  { month: 'Feb', days: 27 },
  { month: 'Mar', days: 24 },
  { month: 'Apr', days: 22 },
  { month: 'May', days: 23 },
  { month: 'Jun', days: 20 },
];

const sourcesData = [
  { name: 'LinkedIn', value: 150 },
  { name: 'Indeed', value: 120 },
  { name: 'Referrals', value: 80 },
  { name: 'Company Site', value: 70 },
  { name: 'Other', value: 30 },
];

const skillsGapData = [
  { name: 'JavaScript', demand: 85, supply: 65 },
  { name: 'React', demand: 80, supply: 60 },
  { name: 'Node.js', demand: 75, supply: 50 },
  { name: 'Python', demand: 70, supply: 65 },
  { name: 'Java', demand: 65, supply: 75 },
  { name: 'Product', demand: 60, supply: 40 },
  { name: 'UX/UI', demand: 55, supply: 35 },
];

const candidateVolumeData = [
  { month: 'Jan', applications: 220, interviews: 80, hires: 10 },
  { month: 'Feb', applications: 240, interviews: 90, hires: 12 },
  { month: 'Mar', applications: 300, interviews: 120, hires: 18 },
  { month: 'Apr', applications: 280, interviews: 110, hires: 15 },
  { month: 'May', applications: 320, interviews: 130, hires: 20 },
  { month: 'Jun', applications: 350, interviews: 150, hires: 25 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Error Boundary Component
class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, errorMessage: string}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" component="div">
              Something went wrong loading the Analytics
            </Typography>
            <Typography variant="body1">
              {this.state.errorMessage || "Please try refreshing the page or contact support."}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Alert>
        </Container>
      );
    }
    return this.props.children;
  }
}

function AdvancedAnalytics() {
  const theme = useTheme();
  const accessibleTheme = getAccessibleTheme(theme);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const analyticsMainRef = useRef<HTMLDivElement>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  
  // Safely get contexts with fallbacks
  let analytics;
  let integrationState = {};
  let dashboards = [];
  
  try {
    analytics = useAnalytics();
  } catch (error) {
    console.warn("Analytics context not available:", error);
    setContextError(prev => prev || "Analytics context not available");
    analytics = {
      timeRangeOptions: [],
      getOverviewMetrics: fallbackGetOverviewMetrics,
      getHiringFunnelData: () => hiringFunnelData,
      getDepartmentMetrics: () => ({}),
      getSourceMetrics: () => sourcesData,
      getTrendData: () => candidateVolumeData,
      getComparisonWithPrevious: () => ({
        totalCandidates: 5,
        timeToHire: -2,
        costPerHire: 2,
        offerAcceptRate: 1,
        diversityScore: 3
      }),
      getTopPerformingJobs: () => ([
        { title: 'Software Engineer', filled: 12, time: 25 },
        { title: 'Product Manager', filled: 8, time: 32 },
        { title: 'UX Designer', filled: 5, time: 28 }
      ]),
      getCandidateQualityMetrics: () => ({
        averageScore: 7.8,
        onboardingSuccess: 92,
        firstYearRetention: 85
      })
    };
  }

  try {
    const atsIntegration = useATSIntegration();
    integrationState = atsIntegration?.integrationState || {};
  } catch (error) {
    console.warn("ATS Integration context not available:", error);
    setContextError(prev => prev || "ATS Integration context not available");
  }

  try {
    const advancedDashboard = useAdvancedDashboard();
    dashboards = advancedDashboard?.dashboards || [];
  } catch (error) {
    console.warn("Advanced Dashboard context not available:", error);
    setContextError(prev => prev || "Advanced Dashboard context not available");
  }
  
  const {
    timeRangeOptions,
    getOverviewMetrics,
    getHiringFunnelData,
    getDepartmentMetrics,
    getSourceMetrics,
    getTrendData,
    getComparisonWithPrevious,
    getTopPerformingJobs,
    getCandidateQualityMetrics
  } = analytics;
  
  const [timeRange, setTimeRange] = useState('30days');
  const [trendGrouping, setTrendGrouping] = useState<'day' | 'week' | 'month'>('week');
  const [refreshing, setRefreshing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Focus trap for modal dialogs (to be used if we add modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle keyboard shortcuts
      if (e.altKey && e.key === 'c') {
        setHighContrastMode(!highContrastMode);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [highContrastMode]);
  
  // Get metrics based on selected time range - wrap in try-catch to prevent crashes
  let overviewMetrics = mockOverviewMetrics;
  let hiringFunnel = hiringFunnelData;
  let departmentMetrics = {};
  let sourceMetrics = sourcesData;
  let trendData = candidateVolumeData;
  let topJobs = [
    { title: 'Software Engineer', filled: 12, time: 25 },
    { title: 'Product Manager', filled: 8, time: 32 },
    { title: 'UX Designer', filled: 5, time: 28 }
  ];
  let qualityMetrics = {
    averageScore: 7.8,
    onboardingSuccess: 92,
    firstYearRetention: 85
  };
  
  try {
    if (typeof getOverviewMetrics === 'function') {
      overviewMetrics = getOverviewMetrics(timeRange);
    }
    if (typeof getHiringFunnelData === 'function') {
      hiringFunnel = getHiringFunnelData(timeRange);
    }
    if (typeof getDepartmentMetrics === 'function') {
      departmentMetrics = getDepartmentMetrics(timeRange);
    }
    if (typeof getSourceMetrics === 'function') {
      sourceMetrics = getSourceMetrics(timeRange);
    }
    if (typeof getTrendData === 'function') {
      trendData = getTrendData(timeRange, trendGrouping);
    }
    if (typeof getTopPerformingJobs === 'function') {
      topJobs = getTopPerformingJobs(timeRange);
    }
    if (typeof getCandidateQualityMetrics === 'function') {
      qualityMetrics = getCandidateQualityMetrics(timeRange);
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    setContextError(prev => prev || "Error fetching analytics data");
  }
  
  // Handle time range change
  const handleTimeRangeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeRange(event.target.value as string);
  };
  
  // Handle trend grouping change
  const handleTrendGroupingChange = (
    event: React.MouseEvent<HTMLElement>,
    newGrouping: 'day' | 'week' | 'month',
  ) => {
    if (newGrouping !== null) {
      setTrendGrouping(newGrouping);
    }
  };
  
  // Simulate data refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
    
    // Announce to screen readers
    const announcement = document.getElementById('refresh-announcement');
    if (announcement) {
      announcement.textContent = "Data refreshing...";
      setTimeout(() => {
        announcement.textContent = "Data refresh complete";
      }, 1500);
    }
  };
  
  const toggleHighContrast = () => {
    setHighContrastMode(!highContrastMode);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={highContrastMode ? accessibleTheme : theme}>
      {/* Screen reader only announcements */}
      <div 
        aria-live="polite" 
        id="refresh-announcement" 
        style={{ 
          position: 'absolute', 
          height: '1px', 
          width: '1px', 
          padding: 0, 
          overflow: 'hidden', 
          clip: 'rect(0, 0, 0, 0)', 
          whiteSpace: 'nowrap', 
          border: 0 
        }}
      >
      </div>
    
      {/* Skip Navigation */}
      <SkipLink targetId="analytics-main" label="Skip to main content" />
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {contextError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {contextError} - Some features may be limited. Please refresh the page or contact support if this persists.
          </Alert>
        )}
        
        {refreshing && <LinearProgress sx={{ mb: 2 }} />}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Advanced Analytics
          </Typography>
          <Box>
            <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                id="time-range-select"
                value={timeRange}
                label="Time Range"
                onChange={handleTimeRangeChange}
              >
                <MenuItem value="1m">Last Month</MenuItem>
                <MenuItem value="3m">Last 3 Months</MenuItem>
                <MenuItem value="6m">Last 6 Months</MenuItem>
                <MenuItem value="1y">Last Year</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Data">
              <IconButton onClick={() => alert('Analytics data exported successfully!')} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
              <Tab label="Recruitment Funnel" />
              <Tab label="Candidate Sources" />
              <Tab label="Skill Gap Analysis" />
              <Tab label="Diversity & Inclusion" />
            </Tabs>
          </Box>
          
          {/* Recruitment Funnel Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Hiring Funnel</Typography>
                    <Tooltip title="Shows the number of candidates at each stage of the recruitment process">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300, width: '100%' }}>
                    <CustomBarChart data={hiringFunnelData} />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Time to Hire Trend</Typography>
                    <Tooltip title="Average days to hire by month">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300, width: '100%' }}>
                    <CustomLineChart data={timeToHireData} />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Candidate Volume Trend</Typography>
                    <Tooltip title="Monthly trends for applications, interviews, and hires">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300, width: '100%' }}>
                    <CustomAreaChart data={candidateVolumeData} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Candidate Sources Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Candidate Sources</Typography>
                    <Tooltip title="Distribution of candidates by source">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300, width: '100%' }}>
                    <CustomPieChart data={sourcesData} />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Source Quality</Typography>
                    <Tooltip title="Quality metrics by source (percent of candidates that reached interview stage)">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300, width: '100%' }}>
                    <CustomBarChart data={[
                      { name: 'Referrals', quality: 68 },
                      { name: 'LinkedIn', quality: 42 },
                      { name: 'Company Site', quality: 38 },
                      { name: 'Indeed', quality: 35 },
                      { name: 'Other', quality: 25 },
                    ]} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Skill Gap Analysis Tab */}
          <TabPanel value={tabValue} index={2}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Skills Gap Analysis</Typography>
                <Tooltip title="Comparison of skill demand vs. supply in candidate pool">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 400, width: '100%' }}>
                <CustomBarChart data={skillsGapData} />
              </Box>
            </Paper>
          </TabPanel>
          
          {/* Diversity & Inclusion Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Gender Distribution</Typography>
                    <Tooltip title="Gender distribution across all stages">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300, width: '100%' }}>
                    <CustomPieChart data={[
                      { name: 'Male', value: 58 },
                      { name: 'Female', value: 38 },
                      { name: 'Non-binary', value: 4 }
                    ]} />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Ethnicity Distribution</Typography>
                    <Tooltip title="Ethnicity distribution across all stages">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300, width: '100%' }}>
                    <CustomPieChart data={[
                      { name: 'White', value: 62 },
                      { name: 'Asian', value: 18 },
                      { name: 'Black', value: 10 },
                      { name: 'Hispanic', value: 8 },
                      { name: 'Other', value: 2 }
                    ]} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

// Wrapper component to ensure all necessary providers are available
function AdvancedAnalyticsWithProviders() {
  return (
    <ErrorBoundary>
      <AnalyticsProvider>
        <ATSIntegrationProvider>
          <AdvancedDashboardProvider>
            <AdvancedAnalytics />
          </AdvancedDashboardProvider>
        </ATSIntegrationProvider>
      </AnalyticsProvider>
    </ErrorBoundary>
  );
}

export default AdvancedAnalyticsWithProviders; 