import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Autocomplete,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tooltip,
  IconButton,
  Tab,
  Tabs,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Add as AddIcon,
  InfoOutlined as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { useCandidateContext } from '../contexts/CandidateContext';

// Mock skills data
const mockSkills = [
  { name: 'JavaScript', category: 'Programming', demand: 92, supply: 75, trend: 'increasing' },
  { name: 'React', category: 'Frontend', demand: 88, supply: 70, trend: 'increasing' },
  { name: 'Python', category: 'Programming', demand: 85, supply: 72, trend: 'stable' },
  { name: 'AWS', category: 'Cloud', demand: 90, supply: 62, trend: 'increasing' },
  { name: 'DevOps', category: 'Operations', demand: 82, supply: 58, trend: 'increasing' },
  { name: 'Data Analysis', category: 'Data', demand: 79, supply: 64, trend: 'increasing' },
  { name: 'SQL', category: 'Database', demand: 76, supply: 80, trend: 'stable' },
  { name: 'Docker', category: 'DevOps', demand: 75, supply: 60, trend: 'increasing' },
  { name: 'UI/UX Design', category: 'Design', demand: 73, supply: 68, trend: 'increasing' },
  { name: 'Node.js', category: 'Backend', demand: 72, supply: 73, trend: 'stable' },
  { name: 'TypeScript', category: 'Programming', demand: 85, supply: 62, trend: 'increasing' },
  { name: 'Java', category: 'Programming', demand: 70, supply: 75, trend: 'decreasing' },
  {
    name: 'Product Management',
    category: 'Management',
    demand: 68,
    supply: 55,
    trend: 'increasing',
  },
  { name: 'Kubernetes', category: 'DevOps', demand: 75, supply: 48, trend: 'increasing' },
  { name: 'Angular', category: 'Frontend', demand: 65, supply: 70, trend: 'decreasing' },
  {
    name: 'Machine Learning',
    category: 'Data Science',
    demand: 80,
    supply: 45,
    trend: 'increasing',
  },
];

// Department data
const departments = [
  'All Departments',
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
  'HR',
];

// Gap status component
const GapStatus = ({ demand, supply }: { demand: number; supply: number }) => {
  const gap = demand - supply;
  let color = 'success.main';
  let status = 'Balanced';

  if (gap > 20) {
    color = 'error.main';
    status = 'Critical Shortage';
  } else if (gap > 10) {
    color = 'warning.main';
    status = 'Moderate Gap';
  } else if (gap > 0) {
    color = 'info.main';
    status = 'Minor Gap';
  } else if (gap < -10) {
    color = 'success.main';
    status = 'Oversupply';
  }

  return (
    <Typography variant="body2" color={color} sx={{ fontWeight: 'medium' }}>
      {status}
    </Typography>
  );
};

// Trend indicator component
const TrendIndicator = ({ trend }: { trend: string }) => {
  if (trend === 'increasing') {
    return <TrendingUpIcon fontSize="small" color="success" />;
  } else if (trend === 'decreasing') {
    return <TrendingDownIcon fontSize="small" color="error" />;
  }
  return null;
};

function SkillsGapAnalysis() {
  const candidateContext = useCandidateContext();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSkills, setFilteredSkills] = useState(mockSkills);

  // Log that we're using the candidate context
  useEffect(() => {
    console.log('Candidate context loaded', candidateContext.candidates.length);
  }, [candidateContext]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Handle department filter change
  const handleDepartmentChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedDepartment(event.target.value as string);
  };

  // Filter skills based on search and department
  useEffect(() => {
    let filtered = mockSkills;

    if (searchQuery) {
      filtered = filtered.filter(
        (skill) =>
          skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          skill.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // In a real app, you would filter by department here

    // Sort based on tab selection
    if (selectedTab === 0) {
      // Largest gaps first
      filtered = [...filtered].sort((a, b) => b.demand - b.supply - (a.demand - a.supply));
    } else if (selectedTab === 1) {
      // Highest demand first
      filtered = [...filtered].sort((a, b) => b.demand - a.demand);
    }

    setFilteredSkills(filtered);
  }, [searchQuery, selectedDepartment, selectedTab]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3, px: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Skills Gap Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Identify skill gaps in your organization and plan strategic hiring and training
          initiatives.
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search skills or categories"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" startIcon={<BarChartIcon />} sx={{ mr: 1 }}>
                Export Report
              </Button>
              <Button variant="contained" startIcon={<LightbulbIcon />}>
                Recommendations
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Critical Skill Gaps
              </Typography>
              <Typography variant="h4">
                {filteredSkills.filter((s) => s.demand - s.supply > 20).length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Skills with demand significantly exceeding supply
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                High-Demand Skills
              </Typography>
              <Typography variant="h4">
                {filteredSkills.filter((s) => s.demand > 80).length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Skills with top market demand (80%+ demand score)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Gap Score
              </Typography>
              <Typography variant="h4">
                {Math.round(
                  filteredSkills.reduce((sum, skill) => sum + (skill.demand - skill.supply), 0) /
                    filteredSkills.length
                )}
                %
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Average difference between demand and supply across all skills
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Skills Gap Table */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Largest Gaps" />
            <Tab label="Highest Demand" />
            <Tab label="By Category" />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Skill</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Demand</TableCell>
                <TableCell>Supply</TableCell>
                <TableCell>Gap</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSkills.map((skill) => (
                <TableRow key={skill.name}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {skill.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={skill.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {skill.demand}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={skill.demand}
                        sx={{
                          width: 60,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 'primary.main',
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {skill.supply}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={skill.supply}
                        sx={{
                          width: 60,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 'secondary.main',
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={skill.demand > skill.supply ? 'error.main' : 'success.main'}
                      fontWeight="medium"
                    >
                      {skill.demand > skill.supply ? '+' : ''}
                      {skill.demand - skill.supply}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <GapStatus demand={skill.demand} supply={skill.supply} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendIndicator trend={skill.trend} />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {skill.trend.charAt(0).toUpperCase() + skill.trend.slice(1)}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recommendations */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Strategic Recommendations
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WorkIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Hiring Priorities</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box>
                  {filteredSkills
                    .filter((s) => s.demand - s.supply > 15)
                    .slice(0, 3)
                    .map((skill) => (
                      <Box key={skill.name} sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {skill.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {skill.category} • Gap: {skill.demand - skill.supply}% •{' '}
                          {skill.trend.charAt(0).toUpperCase() + skill.trend.slice(1)} demand
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Emerging Skills to Monitor</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box>
                  {filteredSkills
                    .filter((s) => s.trend === 'increasing' && s.demand > 70)
                    .slice(0, 3)
                    .map((skill) => (
                      <Box key={skill.name} sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {skill.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {skill.category} • Demand: {skill.demand}% • Current supply:{' '}
                          {skill.supply}%
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SchoolIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Training Recommendations</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box>
                  {filteredSkills
                    .filter((s) => s.demand - s.supply > 10 && s.demand - s.supply <= 20)
                    .slice(0, 3)
                    .map((skill) => (
                      <Box key={skill.name} sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {skill.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {skill.category} • Current capability: {skill.supply}% • Target:{' '}
                          {Math.min(skill.supply + 15, 100)}%
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InfoIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Investment Advice</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" paragraph>
                  Based on current skill gap analysis, consider these strategic investments:
                </Typography>
                <Typography variant="body2" component="div">
                  • Allocate 40% of training budget to upskilling in{' '}
                  {filteredSkills.filter((s) => s.demand - s.supply > 15)[0]?.category ||
                    'high-demand areas'}
                </Typography>
                <Typography variant="body2" component="div">
                  • Invest in recruiting specialists for critical gaps
                </Typography>
                <Typography variant="body2" component="div">
                  • Develop internal training programs for moderate gap skills
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default SkillsGapAnalysis;
