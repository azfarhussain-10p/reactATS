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
  Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon,
  BusinessCenter as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as SalaryIcon,
  DateRange as DateIcon,
  People as PeopleIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';

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

// Mock data for job listings
const initialJobs: Job[] = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    location: 'New York, NY',
    department: 'Engineering',
    type: 'Full-time',
    experience: '3-5 years',
    salary: '$100,000 - $130,000',
    postedDate: '2023-07-15',
    description: 'We are looking for a skilled Frontend Developer with experience in React and TypeScript.',
    responsibilities: [
      'Develop responsive web applications',
      'Implement UI/UX designs',
      'Optimize application performance'
    ],
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      'Strong knowledge of React, TypeScript, and modern JavaScript',
      'Experience with CSS frameworks like Material-UI'
    ],
    benefits: 'Health insurance, 401k matching, flexible work hours, remote work options',
    status: 'Active',
    applicants: 25,
    isFeatured: true
  },
  {
    id: 2,
    title: 'UX Designer',
    location: 'Remote',
    department: 'Design',
    type: 'Full-time',
    experience: '2-4 years',
    salary: '$85,000 - $110,000',
    postedDate: '2023-07-20',
    description: 'Join our design team to create beautiful and intuitive user experiences.',
    responsibilities: [
      'Create wireframes and prototypes',
      'Conduct user research',
      'Collaborate with developers'
    ],
    requirements: [
      'Portfolio demonstrating UX design skills',
      'Experience with Figma, Sketch, or similar tools',
      'Understanding of user-centered design principles'
    ],
    benefits: 'Health insurance, flexible work hours, professional development budget',
    status: 'Active',
    applicants: 18
  },
  {
    id: 3,
    title: 'DevOps Engineer',
    location: 'San Francisco, CA',
    department: 'Operations',
    type: 'Full-time',
    experience: '4-6 years',
    salary: '$120,000 - $150,000',
    postedDate: '2023-07-10',
    description: 'Help us build and maintain our cloud infrastructure and CI/CD pipelines.',
    responsibilities: [
      'Manage AWS infrastructure',
      'Implement CI/CD pipelines',
      'Monitor system performance'
    ],
    requirements: [
      'Experience with AWS, Docker, and Kubernetes',
      'Knowledge of CI/CD tools like Jenkins or CircleCI',
      'Programming skills in Python or Go'
    ],
    benefits: 'Competitive salary, equity options, health benefits, flexible work arrangements',
    status: 'Active',
    applicants: 12,
    isFeatured: true
  }
];

const JobOpenings: React.FC = () => {
  // State
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(initialJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Get unique departments, locations, and types for filters
  const departments = ['All', ...Array.from(new Set(jobs.map(job => job.department)))];
  const locations = ['All', ...Array.from(new Set(jobs.map(job => job.location)))];
  const types = ['All', ...Array.from(new Set(jobs.map(job => job.type)))];

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Toggle bookmark
  const handleToggleBookmark = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? { ...job, isBookmarked: !job.isBookmarked } 
        : job
    ));
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...jobs];
    
    // Apply search
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(lowerCaseSearch) || 
        job.description.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // Apply department filter
    if (departmentFilter !== 'All') {
      result = result.filter(job => job.department === departmentFilter);
    }
    
    // Apply location filter
    if (locationFilter !== 'All') {
      result = result.filter(job => job.location === locationFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'All') {
      result = result.filter(job => job.type === typeFilter);
    }
    
    // Only show active jobs
    result = result.filter(job => job.status === 'Active');
    
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
                      <MenuItem key={index} value={dept}>{dept}</MenuItem>
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
                      <MenuItem key={index} value={loc}>{loc}</MenuItem>
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
                      <MenuItem key={index} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Job Listings */}
      <Grid container spacing={3}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <Grid item xs={12} md={6} lg={4} key={job.id}>
              <Card 
                elevation={job.isFeatured ? 3 : 1}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  border: job.isFeatured ? '1px solid #f0c14b' : 'none'
                }}
              >
                {job.isFeatured && (
                  <Chip 
                    label="Featured" 
                    color="primary" 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10,
                      bgcolor: '#f0c14b',
                      color: 'black'
                    }} 
                  />
                )}
                
                <CardActionArea sx={{ flexGrow: 1 }}>
                  <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Typography variant="h6" gutterBottom>{job.title}</Typography>
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
                    
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      mb: 1
                    }}>
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
                  
                  <Tooltip title={job.isBookmarked ? "Remove Bookmark" : "Bookmark"}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleToggleBookmark(job.id, e)}
                      color={job.isBookmarked ? "primary" : "default"}
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
    </Box>
  );
};

export default JobOpenings; 