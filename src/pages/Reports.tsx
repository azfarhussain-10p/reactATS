import { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

// Mock data for recruitment metrics
const recruitmentData = {
  totalCandidates: 128,
  totalHired: 12,
  totalRejected: 42,
  inProgress: 74,
  averageTimeToHire: 28, // in days
  conversionRate: 9.4, // percentage
  jobOpenings: 8,
  applicationsBySource: [
    { source: 'LinkedIn', count: 45, percentage: 35.2 },
    { source: 'Indeed', count: 32, percentage: 25.0 },
    { source: 'Company Website', count: 21, percentage: 16.4 },
    { source: 'Referrals', count: 18, percentage: 14.1 },
    { source: 'Other', count: 12, percentage: 9.3 }
  ],
  applicationsByDepartment: [
    { department: 'Engineering', count: 56, percentage: 43.8 },
    { department: 'Design', count: 24, percentage: 18.8 },
    { department: 'Marketing', count: 21, percentage: 16.4 },
    { department: 'Sales', count: 15, percentage: 11.7 },
    { department: 'Operations', count: 12, percentage: 9.3 }
  ],
  hiringTrends: [
    { month: 'Jan', applications: 14, hires: 1 },
    { month: 'Feb', applications: 18, hires: 2 },
    { month: 'Mar', applications: 22, hires: 1 },
    { month: 'Apr', applications: 16, hires: 1 },
    { month: 'May', applications: 20, hires: 2 },
    { month: 'Jun', applications: 24, hires: 3 },
    { month: 'Jul', applications: 29, hires: 2 },
    { month: 'Aug', applications: 32, hires: 3 }
  ],
  interviewMetrics: {
    totalScheduled: 98,
    completed: 86,
    cancelled: 12,
    passRate: 64, // percentage
  }
};

// Timeframe options
const timeframeOptions = ['Last 30 Days', 'Last 90 Days', 'Last 6 Months', 'Last Year', 'All Time'];

function Reports() {
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  
  // In a real app, this would filter based on the selected timeframe
  const handleTimeframeChange = (event: any) => {
    setTimeframe(event.target.value);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Recruitment Analytics</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Timeframe</InputLabel>
          <Select
            value={timeframe}
            onChange={handleTimeframeChange}
            label="Timeframe"
          >
            {timeframeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Typography variant="h6" sx={{ mb: 2 }}>Key Metrics</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1, mb: 3 }}>
        <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Candidates
              </Typography>
              <Typography variant="h4">
                {recruitmentData.totalCandidates}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +12% vs prev period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Time to Hire
              </Typography>
              <Typography variant="h4">
                {recruitmentData.averageTimeToHire} <Typography variant="caption">days</Typography>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  -3 days vs prev period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h4">
                {recruitmentData.conversionRate}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +1.2% vs prev period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Open Positions
              </Typography>
              <Typography variant="h4">
                {recruitmentData.jobOpenings}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {recruitmentData.totalHired} hired this period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Candidate Pipeline */}
      <Typography variant="h6" sx={{ mb: 2 }}>Candidate Pipeline</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1, mb: 3 }}>
        <Box sx={{ width: { xs: '100%', md: '66.666%' }, p: 1 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Pipeline Distribution
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1, mt: 1 }}>
              <Box sx={{ width: { xs: '100%', sm: '25%' }, p: 1 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Candidates
                  </Typography>
                  <Typography variant="h6">
                    {recruitmentData.totalCandidates}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '25%' }, p: 1 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                  <Typography variant="h6">
                    {recruitmentData.inProgress}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({Math.round(recruitmentData.inProgress / recruitmentData.totalCandidates * 100)}%)
                    </Typography>
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '25%' }, p: 1 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Hired
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {recruitmentData.totalHired}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({Math.round(recruitmentData.totalHired / recruitmentData.totalCandidates * 100)}%)
                    </Typography>
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '25%' }, p: 1 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {recruitmentData.totalRejected}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({Math.round(recruitmentData.totalRejected / recruitmentData.totalCandidates * 100)}%)
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Interviews
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1 }}>
              <Box sx={{ width: { xs: '100%', sm: '25%' }, p: 1 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Scheduled
                  </Typography>
                  <Typography variant="h6">
                    {recruitmentData.interviewMetrics.totalScheduled}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '25%' }, p: 1 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                  <Typography variant="h6">
                    {recruitmentData.interviewMetrics.completed}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '25%' }, p: 1 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cancelled
                  </Typography>
                  <Typography variant="h6">
                    {recruitmentData.interviewMetrics.cancelled}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '25%' }, p: 1 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pass Rate
                  </Typography>
                  <Typography variant="h6">
                    {recruitmentData.interviewMetrics.passRate}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ width: { xs: '100%', md: '33.333%' }, p: 1 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Status Breakdown
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Applied</Typography>
                  <Typography variant="body2" fontWeight="bold">34</Typography>
                </Box>
                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                  <Box sx={{ width: '26.5%', bgcolor: 'primary.main', height: 8, borderRadius: 1 }} />
                </Box>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Screening</Typography>
                  <Typography variant="body2" fontWeight="bold">24</Typography>
                </Box>
                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                  <Box sx={{ width: '18.75%', bgcolor: 'info.main', height: 8, borderRadius: 1 }} />
                </Box>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Interview</Typography>
                  <Typography variant="body2" fontWeight="bold">16</Typography>
                </Box>
                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                  <Box sx={{ width: '12.5%', bgcolor: 'warning.main', height: 8, borderRadius: 1 }} />
                </Box>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Offer</Typography>
                  <Typography variant="body2" fontWeight="bold">8</Typography>
                </Box>
                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                  <Box sx={{ width: '6.25%', bgcolor: 'secondary.main', height: 8, borderRadius: 1 }} />
                </Box>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Hired</Typography>
                  <Typography variant="body2" fontWeight="bold">12</Typography>
                </Box>
                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                  <Box sx={{ width: '9.4%', bgcolor: 'success.main', height: 8, borderRadius: 1 }} />
                </Box>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Rejected</Typography>
                  <Typography variant="body2" fontWeight="bold">42</Typography>
                </Box>
                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                  <Box sx={{ width: '32.8%', bgcolor: 'error.main', height: 8, borderRadius: 1 }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Source Metrics */}
      <Typography variant="h6" sx={{ mb: 2 }}>Source & Department Analysis</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1, mb: 3 }}>
        <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Application Source</strong></TableCell>
                  <TableCell align="right"><strong>Candidates</strong></TableCell>
                  <TableCell align="right"><strong>Percentage</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recruitmentData.applicationsBySource.map((row) => (
                  <TableRow key={row.source}>
                    <TableCell>{row.source}</TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                    <TableCell align="right">{row.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Department</strong></TableCell>
                  <TableCell align="right"><strong>Candidates</strong></TableCell>
                  <TableCell align="right"><strong>Percentage</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recruitmentData.applicationsByDepartment.map((row) => (
                  <TableRow key={row.department}>
                    <TableCell>{row.department}</TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                    <TableCell align="right">{row.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Monthly Trends */}
      <Typography variant="h6" sx={{ mb: 2 }}>Monthly Hiring Trends</Typography>
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Month</strong></TableCell>
                <TableCell align="right"><strong>Applications</strong></TableCell>
                <TableCell align="right"><strong>Hires</strong></TableCell>
                <TableCell align="right"><strong>Conversion Rate</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recruitmentData.hiringTrends.map((row) => (
                <TableRow key={row.month}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell align="right">{row.applications}</TableCell>
                  <TableCell align="right">{row.hires}</TableCell>
                  <TableCell align="right">
                    {((row.hires / row.applications) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell align="right"><strong>
                  {recruitmentData.hiringTrends.reduce((sum, item) => sum + item.applications, 0)}
                </strong></TableCell>
                <TableCell align="right"><strong>
                  {recruitmentData.hiringTrends.reduce((sum, item) => sum + item.hires, 0)}
                </strong></TableCell>
                <TableCell align="right"><strong>
                  {(recruitmentData.hiringTrends.reduce((sum, item) => sum + item.hires, 0) / 
                    recruitmentData.hiringTrends.reduce((sum, item) => sum + item.applications, 0) * 100).toFixed(1)}%
                </strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default Reports; 