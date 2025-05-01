import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import DownloadIcon from '@mui/icons-material/Download';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// Types for cost data
interface CostCategory {
  id: string;
  name: string;
  description: string;
  isDirectCost: boolean;
}

interface CostItem {
  id: string;
  categoryId: string;
  name: string;
  amount: number;
  department?: string;
  jobRole?: string;
}

interface CostSummary {
  totalCost: number;
  directCosts: number;
  indirectCosts: number;
  byDepartment: Record<string, number>;
  byCategory: Record<string, number>;
  costPerHire: number;
  previousPeriodCostPerHire?: number;
  industryAverage?: number;
}

// Sample cost categories
const costCategories: CostCategory[] = [
  {
    id: '1',
    name: 'Advertising',
    description: 'Job board postings, social media ads, etc.',
    isDirectCost: true,
  },
  {
    id: '2',
    name: 'Agency Fees',
    description: 'Recruitment agency and headhunter fees',
    isDirectCost: true,
  },
  {
    id: '3',
    name: 'Referral Bonuses',
    description: 'Employee referral program payouts',
    isDirectCost: true,
  },
  {
    id: '4',
    name: 'Background Checks',
    description: 'Pre-employment screening and verification',
    isDirectCost: true,
  },
  {
    id: '5',
    name: 'Recruiting Events',
    description: 'Career fairs, networking events, etc.',
    isDirectCost: true,
  },
  {
    id: '6',
    name: 'ATS Software',
    description: 'Applicant tracking system subscription',
    isDirectCost: false,
  },
  {
    id: '7',
    name: 'HR Time',
    description: 'HR team time spent on recruiting activities',
    isDirectCost: false,
  },
  {
    id: '8',
    name: 'Hiring Manager Time',
    description: 'Time spent by hiring managers in the process',
    isDirectCost: false,
  },
  {
    id: '9',
    name: 'Onboarding',
    description: 'New hire orientation and training',
    isDirectCost: false,
  },
];

// Sample cost data
const sampleCostItems: CostItem[] = [
  {
    id: '1',
    categoryId: '1',
    name: 'LinkedIn Job Premium',
    amount: 2500,
    department: 'Engineering',
  },
  {
    id: '2',
    categoryId: '1',
    name: 'Indeed Sponsored Listings',
    amount: 1800,
    department: 'Sales',
  },
  {
    id: '3',
    categoryId: '2',
    name: 'Tech Recruiter Agency',
    amount: 12000,
    department: 'Engineering',
  },
  {
    id: '4',
    categoryId: '3',
    name: 'Referral Bonuses Paid',
    amount: 3000,
    department: 'Engineering',
  },
  { id: '5', categoryId: '4', name: 'Background Check Service', amount: 1200, department: 'All' },
  {
    id: '6',
    categoryId: '5',
    name: 'Tech Conference Booth',
    amount: 5000,
    department: 'Engineering',
  },
  { id: '7', categoryId: '6', name: 'ATS Monthly Subscription', amount: 1500, department: 'All' },
  {
    id: '8',
    categoryId: '7',
    name: 'Recruiter Salaries (Allocated)',
    amount: 22000,
    department: 'All',
  },
  {
    id: '9',
    categoryId: '8',
    name: 'Interview Hours (Calculated)',
    amount: 8500,
    department: 'Engineering',
  },
  {
    id: '10',
    categoryId: '8',
    name: 'Interview Hours (Calculated)',
    amount: 4200,
    department: 'Sales',
  },
  { id: '11', categoryId: '9', name: 'Training Materials', amount: 1200, department: 'All' },
  { id: '12', categoryId: '9', name: 'Onboarding Time', amount: 3500, department: 'All' },
];

// Sample hire data by department
const departmentHires = {
  Engineering: 8,
  Sales: 5,
  Marketing: 3,
  HR: 1,
  Finance: 2,
};

// CostPerHireAnalytics component
const CostPerHireAnalytics: React.FC = () => {
  const analytics = useAnalytics();

  const [period, setPeriod] = useState('2023-Q4');
  const [isLoading, setIsLoading] = useState(false);
  const [costItems, setCostItems] = useState<CostItem[]>(sampleCostItems);
  const [tabValue, setTabValue] = useState(0);
  const [costSummary, setCostSummary] = useState<CostSummary>({
    totalCost: 0,
    directCosts: 0,
    indirectCosts: 0,
    byDepartment: {},
    byCategory: {},
    costPerHire: 0,
    previousPeriodCostPerHire: 0,
    industryAverage: 0,
  });

  // Available periods for selection
  const periods = [
    { value: '2023-Q4', label: 'Q4 2023' },
    { value: '2023-Q3', label: 'Q3 2023' },
    { value: '2023-Q2', label: 'Q2 2023' },
    { value: '2023-Q1', label: 'Q1 2023' },
    { value: '2022-Q4', label: 'Q4 2022' },
  ];

  // Available departments
  const departments = ['All', 'Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];

  // Handle period change
  const handlePeriodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPeriod(event.target.value);
  };

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate cost summary based on cost items and hire data
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Calculate total costs
      const total = costItems.reduce((sum, item) => sum + item.amount, 0);

      // Direct vs Indirect costs
      const directCosts = costItems
        .filter((item) => {
          const category = costCategories.find((cat) => cat.id === item.categoryId);
          return category?.isDirectCost;
        })
        .reduce((sum, item) => sum + item.amount, 0);

      const indirectCosts = total - directCosts;

      // Costs by department
      const byDepartment: Record<string, number> = {};
      for (const item of costItems) {
        const dept = item.department || 'Uncategorized';
        if (!byDepartment[dept]) {
          byDepartment[dept] = 0;
        }
        byDepartment[dept] += item.amount;
      }

      // Handle 'All' department by distributing it proportionally
      const allDeptCost = byDepartment['All'] || 0;
      delete byDepartment['All'];

      const totalSpecificDeptCost = Object.values(byDepartment).reduce(
        (sum, cost) => sum + cost,
        0
      );
      const totalHires = Object.values(departmentHires).reduce((sum, hires) => sum + hires, 0);

      // Distribute 'All' department costs
      Object.keys(byDepartment).forEach((dept) => {
        // Use department size (hire count) as a weight for distribution
        const weight = departmentHires[dept as keyof typeof departmentHires] / totalHires;
        byDepartment[dept] += allDeptCost * weight;
      });

      // Costs by category
      const byCategory: Record<string, number> = {};
      for (const item of costItems) {
        const category = costCategories.find((cat) => cat.id === item.categoryId);
        const catName = category?.name || 'Uncategorized';
        if (!byCategory[catName]) {
          byCategory[catName] = 0;
        }
        byCategory[catName] += item.amount;
      }

      // Calculate cost per hire
      const costPerHire = total / totalHires;

      // Set historical data based on period
      let previousPeriodCostPerHire = 0;
      let industryAverage = 0;

      switch (period) {
        case '2023-Q4':
          previousPeriodCostPerHire = 4650;
          industryAverage = 4950;
          break;
        case '2023-Q3':
          previousPeriodCostPerHire = 4800;
          industryAverage = 4900;
          break;
        case '2023-Q2':
          previousPeriodCostPerHire = 4550;
          industryAverage = 4850;
          break;
        default:
          previousPeriodCostPerHire = 4700;
          industryAverage = 4900;
      }

      setCostSummary({
        totalCost: total,
        directCosts,
        indirectCosts,
        byDepartment,
        byCategory,
        costPerHire,
        previousPeriodCostPerHire,
        industryAverage,
      });

      setIsLoading(false);
    }, 1000);
  }, [period, costItems]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Render percentage change
  const renderPercentChange = (current: number, previous: number) => {
    if (!previous) return null;

    const percentChange = ((current - previous) / previous) * 100;
    const isPositive = percentChange >= 0;

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: !isPositive ? 'success.main' : 'error.main', // Inverse for cost metrics (lower is better)
        }}
      >
        {!isPositive ? <TrendingDownIcon fontSize="small" /> : <TrendingUpIcon fontSize="small" />}
        <Typography variant="body2" sx={{ ml: 0.5 }}>
          {Math.abs(percentChange).toFixed(1)}%
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Cost Per Hire Analytics</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            select
            label="Period"
            value={period}
            onChange={handlePeriodChange}
            size="small"
            sx={{ minWidth: 150, mr: 2 }}
          >
            {periods.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Key metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Average Cost Per Hire</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {formatCurrency(costSummary.costPerHire)}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        vs Previous Period
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">
                          {formatCurrency(costSummary.previousPeriodCostPerHire || 0)}
                        </Typography>
                        {renderPercentChange(
                          costSummary.costPerHire,
                          costSummary.previousPeriodCostPerHire || 0
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Industry Average
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">
                          {formatCurrency(costSummary.industryAverage || 0)}
                        </Typography>
                        {renderPercentChange(
                          costSummary.costPerHire,
                          costSummary.industryAverage || 0
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Direct vs Indirect Costs
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body1">Direct Costs</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(costSummary.directCosts)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Indirect Costs</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(costSummary.indirectCosts)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Total</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(costSummary.totalCost)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Cost Breakdown
                  </Typography>
                  {/* Placeholder for a small chart */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 120,
                      mb: 1,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1,
                    }}
                  >
                    <PieChartIcon sx={{ fontSize: 64, color: '#1976d2' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Advertising:{' '}
                      {Math.round(
                        ((costSummary.byCategory['Advertising'] || 0) / costSummary.totalCost) * 100
                      )}
                      %
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Agency:{' '}
                      {Math.round(
                        ((costSummary.byCategory['Agency Fees'] || 0) / costSummary.totalCost) * 100
                      )}
                      %
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      HR Time:{' '}
                      {Math.round(
                        ((costSummary.byCategory['HR Time'] || 0) / costSummary.totalCost) * 100
                      )}
                      %
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Analysis Tabs */}
          <Paper sx={{ width: '100%', mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="cost per hire analysis tabs"
            >
              <Tab label="By Department" />
              <Tab label="By Category" />
              <Tab label="Cost Items" />
              <Tab label="Benchmarks" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Department analysis */}
              {tabValue === 0 && (
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 250,
                      mb: 3,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1,
                    }}
                  >
                    <BarChartIcon sx={{ fontSize: 80, color: '#1976d2' }} />
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Department</TableCell>
                          <TableCell align="right">Total Cost</TableCell>
                          <TableCell align="right">Hires</TableCell>
                          <TableCell align="right">Cost Per Hire</TableCell>
                          <TableCell align="right">vs Average</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(costSummary.byDepartment).map(([dept, cost]) => {
                          const hires = departmentHires[dept as keyof typeof departmentHires] || 0;
                          const deptCostPerHire = hires ? cost / hires : 0;
                          const vsAverage = deptCostPerHire - costSummary.costPerHire;

                          return (
                            <TableRow key={dept}>
                              <TableCell>{dept}</TableCell>
                              <TableCell align="right">{formatCurrency(cost)}</TableCell>
                              <TableCell align="right">{hires}</TableCell>
                              <TableCell align="right">{formatCurrency(deptCostPerHire)}</TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  color: vsAverage > 0 ? 'error.main' : 'success.main',
                                }}
                              >
                                {vsAverage > 0 ? '+' : ''}
                                {formatCurrency(vsAverage)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Category analysis */}
              {tabValue === 1 && (
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 250,
                      mb: 3,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1,
                    }}
                  >
                    <PieChartIcon sx={{ fontSize: 80, color: '#1976d2' }} />
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="right">% of Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(costSummary.byCategory).map(([category, amount]) => {
                          const catInfo = costCategories.find((c) => c.name === category);
                          const percentage = (amount / costSummary.totalCost) * 100;

                          return (
                            <TableRow key={category}>
                              <TableCell>{category}</TableCell>
                              <TableCell>{catInfo?.isDirectCost ? 'Direct' : 'Indirect'}</TableCell>
                              <TableCell align="right">{formatCurrency(amount)}</TableCell>
                              <TableCell align="right">{percentage.toFixed(1)}%</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Cost items list */}
              {tabValue === 2 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {costItems.map((item) => {
                        const category = costCategories.find((cat) => cat.id === item.categoryId);

                        return (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{category?.name}</TableCell>
                            <TableCell>{item.department}</TableCell>
                            <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Benchmarks */}
              {tabValue === 3 && (
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 250,
                      mb: 3,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1,
                    }}
                  >
                    <BarChartIcon sx={{ fontSize: 80, color: '#1976d2' }} />
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Benchmark</TableCell>
                          <TableCell align="right">Cost Per Hire</TableCell>
                          <TableCell align="right">Difference</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Your Organization</TableCell>
                          <TableCell align="right">
                            {formatCurrency(costSummary.costPerHire)}
                          </TableCell>
                          <TableCell align="right">-</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Industry Average</TableCell>
                          <TableCell align="right">{formatCurrency(4950)}</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                costSummary.costPerHire - 4950 > 0 ? 'error.main' : 'success.main',
                            }}
                          >
                            {formatCurrency(costSummary.costPerHire - 4950)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Tech Sector</TableCell>
                          <TableCell align="right">{formatCurrency(5200)}</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                costSummary.costPerHire - 5200 > 0 ? 'error.main' : 'success.main',
                            }}
                          >
                            {formatCurrency(costSummary.costPerHire - 5200)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Small Companies (&lt;100 employees)</TableCell>
                          <TableCell align="right">{formatCurrency(4100)}</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                costSummary.costPerHire - 4100 > 0 ? 'error.main' : 'success.main',
                            }}
                          >
                            {formatCurrency(costSummary.costPerHire - 4100)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Medium Companies (100-1000 employees)</TableCell>
                          <TableCell align="right">{formatCurrency(4800)}</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                costSummary.costPerHire - 4800 > 0 ? 'error.main' : 'success.main',
                            }}
                          >
                            {formatCurrency(costSummary.costPerHire - 4800)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Large Companies (&gt;1000 employees)</TableCell>
                          <TableCell align="right">{formatCurrency(5500)}</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                costSummary.costPerHire - 5500 > 0 ? 'error.main' : 'success.main',
                            }}
                          >
                            {formatCurrency(costSummary.costPerHire - 5500)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default CostPerHireAnalytics;
