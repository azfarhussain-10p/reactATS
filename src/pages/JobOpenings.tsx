import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Button,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  BusinessCenter as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as SalaryIcon,
  DateRange as DateIcon,
  People as PeopleIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';
import { jobsApi } from '../services/api';
import { amber, deepPurple, purple } from '@mui/material/colors';

// Define Job interface
interface Job {
  id: number;
  title: string;
  location: string;
  department: string;
  type: string;
  experience: string;
  salary: string;
  postedDate: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string;
  status: 'Active' | 'On-Hold' | 'Closed' | 'Draft';
  applicants: number;
  isFeatured?: boolean;
  isBookmarked?: boolean;
}

const JobOpenings: React.FC = () => {
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingDropdowns, setLoadingDropdowns] = useState({
    departments: false,
    locations: false,
    types: false,
  });

  // State for dropdown options
  const [departments, setDepartments] = useState<string[]>(['All']);
  const [locations, setLocations] = useState<string[]>(['All']);
  const [types, setTypes] = useState<string[]>(['All']);

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Toggle bookmark
  const handleToggleBookmark = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setJobs(
      jobs.map((job) => (job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job))
    );
  };

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobsData = await jobsApi.getAllJobs();
        // Add isBookmarked property to each job
        const jobsWithBookmarks = jobsData.map((job: Job) => ({
          ...job,
          isBookmarked: false,
        }));
        setJobs(jobsWithBookmarks);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again later.');
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDropdowns((prev) => ({ ...prev, departments: true }));
        const data = await jobsApi.getDepartments();
        setDepartments(['All', ...data]);
        setLoadingDropdowns((prev) => ({ ...prev, departments: false }));
      } catch (err) {
        console.error('Error fetching departments:', err);
        // Fallback to client-side filtering if API fails
        const uniqueDepartments = Array.from(new Set(jobs.map((job) => job.department)));
        setDepartments(['All', ...uniqueDepartments]);
        setLoadingDropdowns((prev) => ({ ...prev, departments: false }));
      }
    };

    fetchDepartments();
  }, [jobs]);

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingDropdowns((prev) => ({ ...prev, locations: true }));
        const data = await jobsApi.getLocations();
        setLocations(['All', ...data]);
        setLoadingDropdowns((prev) => ({ ...prev, locations: false }));
      } catch (err) {
        console.error('Error fetching locations:', err);
        // Fallback to client-side filtering if API fails
        const uniqueLocations = Array.from(new Set(jobs.map((job) => job.location)));
        setLocations(['All', ...uniqueLocations]);
        setLoadingDropdowns((prev) => ({ ...prev, locations: false }));
      }
    };

    fetchLocations();
  }, [jobs]);

  // Fetch job types from API
  useEffect(() => {
    const fetchJobTypes = async () => {
      try {
        setLoadingDropdowns((prev) => ({ ...prev, types: true }));
        const data = await jobsApi.getJobTypes();
        setTypes(['All', ...data]);
        setLoadingDropdowns((prev) => ({ ...prev, types: false }));
      } catch (err) {
        console.error('Error fetching job types:', err);
        // Fallback to client-side filtering if API fails
        const uniqueTypes = Array.from(new Set(jobs.map((job) => job.type)));
        setTypes(['All', ...uniqueTypes]);
        setLoadingDropdowns((prev) => ({ ...prev, types: false }));
      }
    };

    fetchJobTypes();
  }, [jobs]);

  // Apply filters and search
  useEffect(() => {
    let result = [...jobs];

    // Apply search
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerCaseSearch) ||
          job.description.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Apply department filter
    if (departmentFilter !== 'All') {
      result = result.filter((job) => job.department === departmentFilter);
    }

    // Apply location filter
    if (locationFilter !== 'All') {
      result = result.filter((job) => job.location === locationFilter);
    }

    // Apply type filter
    if (typeFilter !== 'All') {
      result = result.filter((job) => job.type === typeFilter);
    }

    // Only show active jobs
    result = result.filter((job) => job.status === 'Active');

    // Sort results: Featured jobs first, then by posted date (newest first)
    result.sort((a, b) => {
      // First sort by featured status
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;

      // Then sort by posted date (newest first)
      const dateA = new Date(a.postedDate).getTime();
      const dateB = new Date(b.postedDate).getTime();
      return dateB - dateA;
    });

    setFilteredJobs(result);
  }, [jobs, searchTerm, departmentFilter, locationFilter, typeFilter]);

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Job Openings</Typography>
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search jobs by title or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    label="Department"
                    onChange={(e: SelectChangeEvent) => setDepartmentFilter(e.target.value)}
                  >
                    {departments.map((dept, index) => (
                      <MenuItem key={index} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={locationFilter}
                    label="Location"
                    onChange={(e: SelectChangeEvent) => setLocationFilter(e.target.value)}
                  >
                    {locations.map((loc, index) => (
                      <MenuItem key={index} value={loc}>
                        {loc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Job Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Job Type"
                    onChange={(e: SelectChangeEvent) => setTypeFilter(e.target.value)}
                  >
                    {types.map((type, index) => (
                      <MenuItem key={index} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading indicator */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Job Listings */}
      {!loading && (
        <Grid container spacing={3}>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Grid item xs={12} md={6} lg={4} key={job.id}>
                <Card
                  elevation={job.isFeatured ? 3 : 1}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: job.isFeatured ? '1px solid #f0c14b' : 'none',
                  }}
                >
                  {/* Status tags container */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      display: 'flex',
                      flexDirection: 'row-reverse',
                      gap: 1,
                      zIndex: 1,
                    }}
                  >
                    {job.status === 'Draft' && (
                      <Chip
                        label="DRAFT"
                        color="warning"
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                        }}
                      />
                    )}

                    {job.status === 'Active' && (
                      <Chip label="Active" color="success" size="small" />
                    )}

                    {job.isFeatured && (
                      <Chip
                        icon={
                          <StarIcon
                            fontSize="small"
                            sx={{
                              color: amber[500],
                              animation: 'pulse 1.5s infinite',
                              '@keyframes pulse': {
                                '0%': { opacity: 0.7 },
                                '50%': { opacity: 1 },
                                '100%': { opacity: 0.7 },
                              },
                            }}
                          />
                        }
                        label="Featured"
                        size="small"
                        sx={{
                          background: `linear-gradient(45deg, ${deepPurple[700]} 0%, ${purple[500]} 100%)`,
                          color: '#ffffff',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          '&:hover': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                          },
                          transition: 'all 0.3s ease',
                          '& .MuiChip-label': {
                            color: '#ffffff',
                          },
                          '& .MuiChip-icon': {
                            color: amber[500],
                          },
                        }}
                      />
                    )}
                  </Box>

                  <CardActionArea sx={{ flexGrow: 1 }}>
                    <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Typography variant="h6" gutterBottom>
                          {job.title}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.location}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={1}>
                        <BusinessIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.department}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={1}>
                        <SalaryIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.salary}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          mb: 1,
                        }}
                      >
                        {job.description}
                      </Typography>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center">
                          <PeopleIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.applicants} applicants
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center">
                          <DateIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            Posted: {formatDate(job.postedDate)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, pt: 0 }}>
                    <Button
                      size="small"
                      color="primary"
                      variant="contained"
                      sx={{ flexGrow: 1, mr: 1 }}
                    >
                      Apply Now
                    </Button>

                    <Tooltip title={job.isBookmarked ? 'Remove Bookmark' : 'Bookmark'}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleToggleBookmark(job.id, e)}
                        color={job.isBookmarked ? 'primary' : 'default'}
                      >
                        {job.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No jobs found matching your criteria
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your filters or search terms
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default JobOpenings;
