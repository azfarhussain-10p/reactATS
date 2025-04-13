import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
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
const LineChart = ({ data }: { data: any }) => (
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

const BarChart = ({ data }: { data: any }) => (
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

const PieChart = ({ data }: { data: any }) => (
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

function AdvancedAnalytics() {
  const theme = useTheme();
  const accessibleTheme = getAccessibleTheme(theme);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const analyticsMainRef = useRef<HTMLDivElement>(null);
  
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
  } = useAnalytics();
  
  const [timeRange, setTimeRange] = useState('30days');
  const [trendGrouping, setTrendGrouping] = useState<'day' | 'week' | 'month'>('week');
  const [refreshing, setRefreshing] = useState(false);
  
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
  
  // Get metrics based on selected time range
  const overviewMetrics = getOverviewMetrics(timeRange);
  const hiringFunnel = getHiringFunnelData(timeRange);
  const departmentMetrics = getDepartmentMetrics(timeRange);
  const sourceMetrics = getSourceMetrics(timeRange);
  const trendData = getTrendData(timeRange, trendGrouping);
  const topJobs = getTopPerformingJobs(timeRange);
  const qualityMetrics = getCandidateQualityMetrics(timeRange);
  
  // Handle time range change
  const handleTimeRangeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
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
      
      <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3, px: 2 }} ref={analyticsMainRef} id="analytics-main" tabIndex={-1}>
        {/* Header and Controls */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: { xs: 2, md: 0 } }} component="h1">
            Advanced Recruitment Analytics
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="time-period-label">Time Period</InputLabel>
              <Select
                labelId="time-period-label"
                id="time-period-select"
                value={timeRange}
                onChange={handleTimeRangeChange}
                label="Time Period"
                startAdornment={
                  <InputAdornment position="start">
                    <DateRangeIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                {timeRangeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title="Toggle high contrast mode (Alt+C)">
              <IconButton onClick={toggleHighContrast} aria-label="Toggle high contrast mode">
                <AccessibilityIcon />
              </IconButton>
            </Tooltip>
            
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              size="small"
              aria-label="Export analytics data"
            >
              Export
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
              size="small"
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label={refreshing ? "Refreshing data" : "Refresh data"}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      
        {/* Key Metrics Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Total Candidates" 
              value={overviewMetrics.totalCandidates}
              trend="up"
              trendValue="+12% vs prev period"
              subtitle={`${overviewMetrics.newCandidates} new this period`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Average Time to Hire" 
              value={`${overviewMetrics.averageTimeToHire} days`}
              trend="down"
              trendValue="-3.5 days vs prev period"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Offer Acceptance Rate" 
              value={`${overviewMetrics.offerAcceptanceRate.toFixed(1)}%`}
              trend="up"
              trendValue="+5.2% vs prev period"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              title="Active Positions" 
              value={overviewMetrics.activePositions}
              trend="neutral"
              trendValue="Same as prev period"
              subtitle={`${overviewMetrics.interviewsScheduled} interviews scheduled`}
            />
          </Grid>
        </Grid>
        
        {/* Hiring Trends */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Hiring Trends</Typography>
            <ToggleButtonGroup
              value={trendGrouping}
              exclusive
              onChange={handleTrendGroupingChange}
              size="small"
            >
              <ToggleButton value="day">Daily</ToggleButton>
              <ToggleButton value="week">Weekly</ToggleButton>
              <ToggleButton value="month">Monthly</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <LineChart data={trendData} />
        </Paper>
        
        {/* Hiring Funnel and Source Analysis */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Hiring Funnel
              </Typography>
              <Box>
                {hiringFunnel.map((stage) => (
                  <FunnelStage 
                    key={stage.stage}
                    stage={stage.stage}
                    count={stage.count}
                    total={hiringFunnel[0].count || 1}
                    conversionRate={stage.conversionRate}
                    timeInStage={stage.timeInStage}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Candidate Sources
              </Typography>
              <PieChart data={sourceMetrics} />
              <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Source</TableCell>
                      <TableCell align="right">Candidates</TableCell>
                      <TableCell align="right">Hire Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sourceMetrics.slice(0, 5).map((source) => (
                      <TableRow key={source.source}>
                        <TableCell>{source.source}</TableCell>
                        <TableCell align="right">{source.candidates}</TableCell>
                        <TableCell align="right">{source.hireRate.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Department Analysis */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Department Performance
          </Typography>
          <BarChart data={departmentMetrics} />
          <TableContainer sx={{ mt: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Department</TableCell>
                  <TableCell align="right">Open Positions</TableCell>
                  <TableCell align="right">Applicants</TableCell>
                  <TableCell align="right">Interviews</TableCell>
                  <TableCell align="right">Offers</TableCell>
                  <TableCell align="right">Hires</TableCell>
                  <TableCell align="right">Time to Hire</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departmentMetrics.map((dept) => (
                  <TableRow key={dept.name}>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell align="right">{dept.openPositions}</TableCell>
                    <TableCell align="right">{dept.applicants}</TableCell>
                    <TableCell align="right">{dept.interviews}</TableCell>
                    <TableCell align="right">{dept.offers}</TableCell>
                    <TableCell align="right">{dept.hires}</TableCell>
                    <TableCell align="right">{dept.timeToHire} days</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        {/* Top Performing Jobs */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Top Performing Jobs
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job Title</TableCell>
                  <TableCell align="right">Applications</TableCell>
                  <TableCell align="right">Interview Rate</TableCell>
                  <TableCell align="right">Offer Rate</TableCell>
                  <TableCell align="right">Time to Fill</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.title}</TableCell>
                    <TableCell align="right">{job.applications}</TableCell>
                    <TableCell align="right">{job.interviewRate}%</TableCell>
                    <TableCell align="right">{job.offerRate}%</TableCell>
                    <TableCell align="right">{job.timeToFill} days</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        {/* Candidate Quality Metrics */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Candidate Quality Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Average Evaluation Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h4" sx={{ mr: 2 }}>
                      {qualityMetrics.avgEvaluationScore.toFixed(1)}/5.0
                    </Typography>
                    <Chip 
                      label={qualityMetrics.avgEvaluationScore >= 4.0 ? "Excellent" : "Good"} 
                      color={qualityMetrics.avgEvaluationScore >= 4.0 ? "success" : "primary"} 
                      size="small" 
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(qualityMetrics.avgEvaluationScore / 5) * 100} 
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Skill Match Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h4" sx={{ mr: 2 }}>
                      {qualityMetrics.skillMatchRate}%
                    </Typography>
                    <Chip 
                      label={qualityMetrics.skillMatchRate >= 80 ? "High" : "Average"} 
                      color={qualityMetrics.skillMatchRate >= 80 ? "success" : "primary"} 
                      size="small" 
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={qualityMetrics.skillMatchRate} 
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Referral Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h4" sx={{ mr: 2 }}>
                      {qualityMetrics.referralRate}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={qualityMetrics.referralRate} 
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Technical Assessment Pass Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h4" sx={{ mr: 2 }}>
                      {qualityMetrics.passedTechnicalAssessment}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={qualityMetrics.passedTechnicalAssessment} 
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default AdvancedAnalytics; 