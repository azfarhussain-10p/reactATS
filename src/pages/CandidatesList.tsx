import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  InputAdornment,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Card,
  CardContent,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Stack,
  Grid
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  GetApp as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data for candidates
interface Candidate {
  id: number;
  name: string;
  email: string;
  position: string;
  status: string;
  stage: string;
  appliedDate: string;
  source: string;
  skills: string[];
  imageUrl?: string;
}

const mockCandidates: Candidate[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    position: 'Senior React Developer',
    status: 'In Process',
    stage: 'Technical Interview',
    appliedDate: '2023-04-10',
    source: 'LinkedIn',
    skills: ['React', 'TypeScript', 'Node.js']
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    position: 'UX Designer',
    status: 'New',
    stage: 'Screening',
    appliedDate: '2023-04-12',
    source: 'Indeed',
    skills: ['UI/UX', 'Figma', 'User Research']
  },
  {
    id: 3,
    name: 'Emily Brown',
    email: 'emily.brown@example.com',
    position: 'Frontend Developer',
    status: 'In Process',
    stage: 'Phone Screening',
    appliedDate: '2023-04-08',
    source: 'Referral',
    skills: ['JavaScript', 'HTML/CSS', 'React']
  },
  {
    id: 4,
    name: 'Robert Wilson',
    email: 'robert.wilson@example.com',
    position: 'Product Manager',
    status: 'In Process',
    stage: 'Technical Interview',
    appliedDate: '2023-04-05',
    source: 'Company Website',
    skills: ['Product Strategy', 'Agile', 'User Stories']
  },
  {
    id: 5,
    name: 'Linda Garcia',
    email: 'linda.garcia@example.com',
    position: 'QA Engineer',
    status: 'Offer',
    stage: 'Offer Sent',
    appliedDate: '2023-03-29',
    source: 'LinkedIn',
    skills: ['Manual Testing', 'Automation', 'JIRA']
  }
];

// Status color mapping
const statusColors: Record<string, string> = {
  'New': 'info',
  'In Process': 'primary',
  'On Hold': 'warning',
  'Rejected': 'error',
  'Offer': 'success',
  'Hired': 'success'
};

const CandidatesList: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(mockCandidates);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [positionFilter, setPositionFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Menu and dialog state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Add new state variables for the email and interview dialogs
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState<Candidate | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [interviewCandidate, setInterviewCandidate] = useState<number | null>(null);
  
  // Add these state variables for interview scheduling form
  const [interviewDate, setInterviewDate] = useState<string>('');
  const [interviewTime, setInterviewTime] = useState<string>('');
  const [interviewType, setInterviewType] = useState<string>('Technical');
  const [interviewerName, setInterviewerName] = useState<string>('');
  const [interviewNotes, setInterviewNotes] = useState<string>('');
  
  // Get unique positions and sources for filters
  const positions = ['All', ...Array.from(new Set(candidates.map(c => c.position)))];
  const sources = ['All', ...Array.from(new Set(candidates.map(c => c.source)))];
  
  // Apply filters and search
  useEffect(() => {
    let result = [...candidates];
    
    // Apply search
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(candidate => 
        candidate.name.toLowerCase().includes(lowerCaseSearch) || 
        candidate.email.toLowerCase().includes(lowerCaseSearch) ||
        candidate.position.toLowerCase().includes(lowerCaseSearch) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(lowerCaseSearch))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(candidate => candidate.status === statusFilter);
    }
    
    // Apply position filter
    if (positionFilter !== 'All') {
      result = result.filter(candidate => candidate.position === positionFilter);
    }
    
    // Apply source filter
    if (sourceFilter !== 'All') {
      result = result.filter(candidate => candidate.source === sourceFilter);
    }
    
    setFilteredCandidates(result);
    setPage(0); // Reset to first page on filter change
  }, [candidates, searchTerm, statusFilter, positionFilter, sourceFilter]);
  
  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, candidateId: number) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCandidateId(candidateId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCandidateId(null);
  };
  
  const handleViewProfile = () => {
    if (selectedCandidateId) {
      navigate(`/candidates/${selectedCandidateId}`);
    }
    handleMenuClose();
  };
  
  const handleEdit = () => {
    if (selectedCandidateId) {
      // Update to use the correct path for editing - create this route in routes/index.tsx
      setSnackbarMessage('Edit functionality will be implemented soon');
      setSnackbarOpen(true);
      // For now, stay on the current page instead of navigating to a non-existent route
      // navigate(`/candidates/edit/${selectedCandidateId}`);
    }
    handleMenuClose();
  };
  
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
    // Don't close the menu until the user makes a decision
  };
  
  const handleDeleteCandidate = () => {
    if (selectedCandidateId) {
      // Actually filter out the candidate with the selected ID
      const updatedCandidates = candidates.filter(c => c.id !== selectedCandidateId);
      setCandidates(updatedCandidates);
      setSnackbarMessage('Candidate deleted successfully');
      setSnackbarOpen(true);
      setSelectedCandidateId(null);
    }
    setOpenDeleteDialog(false);
  };
  
  const handleSendEmail = () => {
    // Instead of just showing a snackbar, implement a dialog for sending emails
    if (selectedCandidateId) {
      const candidate = candidates.find(c => c.id === selectedCandidateId);
      if (candidate) {
        setEmailDialogOpen(true);
        setEmailRecipient(candidate);
      }
    }
    handleMenuClose();
  };
  
  const handleScheduleInterview = () => {
    if (selectedCandidateId) {
      // Open the interview scheduling dialog directly instead of navigating away
      setInterviewDialogOpen(true);
      setInterviewCandidate(selectedCandidateId);
      
      // Reset form fields
      setInterviewDate('');
      setInterviewTime('');
      setInterviewType('Technical');
      setInterviewerName('');
      setInterviewNotes('');
    }
    handleMenuClose();
  };
  
  // Handle scheduling an interview
  const handleScheduleInterviewSubmit = () => {
    // Validate form fields
    if (!interviewDate || !interviewTime || !interviewerName) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarOpen(true);
      return;
    }
    
    // Here you would typically save the interview to your backend
    // For now we'll just show a success message
    const candidateName = candidates.find(c => c.id === interviewCandidate)?.name;
    setSnackbarMessage(`Interview scheduled with ${candidateName} on ${interviewDate} at ${interviewTime}`);
    setSnackbarOpen(true);
    
    // Close the dialog and reset form
    setInterviewDialogOpen(false);
    setInterviewCandidate(null);
    setInterviewDate('');
    setInterviewTime('');
    setInterviewType('Technical');
    setInterviewerName('');
    setInterviewNotes('');
  };
  
  // Handle sending an email
  const handleSendEmailSubmit = () => {
    setSnackbarMessage(`Email sent to ${emailRecipient?.name}`);
    setSnackbarOpen(true);
    setEmailDialogOpen(false);
    setEmailSubject('');
    setEmailBody('');
    setEmailRecipient(null);
  };
  
  const handleExportCandidates = () => {
    try {
      // Create CSV content from the filteredCandidates data
      const headers = ['Name', 'Email', 'Position', 'Status', 'Stage', 'Applied Date', 'Source', 'Skills'];
      
      let csvContent = headers.join(',') + '\n';
      
      filteredCandidates.forEach(candidate => {
        // Format skills as a semicolon-separated string inside quotes
        const skillsFormatted = `"${candidate.skills.join('; ')}"`;
        
        // Create a row with candidate data
        const row = [
          candidate.name,
          candidate.email,
          candidate.position,
          candidate.status,
          candidate.stage,
          new Date(candidate.appliedDate).toLocaleDateString(),
          candidate.source,
          skillsFormatted
        ];
        
        csvContent += row.join(',') + '\n';
      });
      
      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a link element and trigger the download
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `candidates_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSnackbarMessage('Candidates data exported successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Export failed:', error);
      setSnackbarMessage('Failed to export candidates data');
      setSnackbarOpen(true);
    }
  };
  
  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Candidates List</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/candidates/add')}
        >
          Add Candidate
        </Button>
      </Box>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search candidates by name, email, position, or skills"
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
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="In Process">In Process</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Offer">Offer</MenuItem>
                  <MenuItem value="Hired">Hired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="position-filter-label">Position</InputLabel>
                <Select
                  labelId="position-filter-label"
                  id="position-filter"
                  value={positionFilter}
                  label="Position"
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  {positions.map(position => (
                    <MenuItem key={position} value={position}>
                      {position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="source-filter-label">Source</InputLabel>
                <Select
                  labelId="source-filter-label"
                  id="source-filter"
                  value={sourceFilter}
                  label="Source"
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  {sources.map(source => (
                    <MenuItem key={source} value={source}>
                      {source}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCandidates}
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <TableContainer component={Paper}>
        <Table aria-label="candidates table">
          <TableHead>
            <TableRow>
              <TableCell>Candidate</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCandidates
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((candidate) => (
                <TableRow 
                  hover 
                  key={candidate.id}
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {candidate.imageUrl ? 
                          <img src={candidate.imageUrl} alt={candidate.name} style={{ width: '100%', height: '100%' }} /> : 
                          candidate.name.charAt(0)
                        }
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {candidate.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {candidate.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{candidate.position}</TableCell>
                  <TableCell>
                    <Chip 
                      label={candidate.status} 
                      size="small" 
                      color={(statusColors[candidate.status] as any) || 'default'}
                      variant={candidate.status === 'New' ? 'outlined' : 'filled'}
                    />
                  </TableCell>
                  <TableCell>{candidate.stage}</TableCell>
                  <TableCell>{new Date(candidate.appliedDate).toLocaleDateString()}</TableCell>
                  <TableCell>{candidate.source}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {candidate.skills.slice(0, 2).map((skill, index) => (
                        <Chip 
                          key={index} 
                          label={skill} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                      {candidate.skills.length > 2 && (
                        <Chip 
                          label={`+${candidate.skills.length - 2}`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="View Profile">
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/candidates/${candidate.id}`);
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Schedule Interview">
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/interviews/schedule/${candidate.id}`);
                          }}
                        >
                          <AssignmentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, candidate.id);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              
            {filteredCandidates.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No candidates found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCandidates.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Action Menu - With added animations */}
      <div
        style={{
          position: 'fixed',
          zIndex: 1300,
          top: anchorEl ? anchorEl.getBoundingClientRect().bottom + 'px' : '0px',
          left: anchorEl ? (anchorEl.getBoundingClientRect().right - 180) + 'px' : '0px',
          display: Boolean(anchorEl) ? 'block' : 'none',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          borderRadius: '4px',
          width: '180px',
          overflow: 'hidden',
          opacity: Boolean(anchorEl) ? 1 : 0,
          transform: Boolean(anchorEl) ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '4px 0',
          }}
        >
          {/* Menu items with animation */}
          {[
            { 
              icon: <VisibilityIcon style={{ fontSize: '18px' }} />, 
              text: 'View Profile', 
              color: '#1976d2', 
              textColor: '#000000',
              onClick: handleViewProfile 
            },
            { 
              icon: <EditIcon style={{ fontSize: '18px' }} />, 
              text: 'Edit', 
              color: '#1976d2', 
              textColor: '#000000',
              onClick: handleEdit 
            },
            { 
              icon: <EmailIcon style={{ fontSize: '18px' }} />, 
              text: 'Send Email', 
              color: '#1976d2', 
              textColor: '#000000',
              onClick: handleSendEmail 
            },
            { 
              icon: <AssignmentIcon style={{ fontSize: '18px' }} />, 
              text: 'Schedule Interview', 
              color: '#1976d2', 
              textColor: '#000000',
              onClick: handleScheduleInterview 
            },
            {
              isDivider: true
            },
            { 
              icon: <DeleteIcon style={{ fontSize: '18px' }} />, 
              text: 'Delete', 
              color: '#d32f2f', 
              textColor: '#d32f2f',
              onClick: handleOpenDeleteDialog,
              hoverColor: '#fff0f0'
            }
          ].map((item, index) => (
            item.isDivider ? 
            <div 
              key={`divider-${index}`} 
              style={{ 
                height: '1px', 
                margin: '4px 0', 
                backgroundColor: '#e0e0e0' 
              }} 
            /> : 
            <div 
              key={`item-${index}`}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                opacity: 0,
                transform: 'translateX(-8px)',
                animation: Boolean(anchorEl) ? 
                  `menuItemFadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards ${80 + index * 40}ms` : 
                  'none'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = item.hoverColor || '#f0f7ff'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <div style={{ marginRight: '12px', color: item.color }}>
                {item.icon}
              </div>
              <div style={{ color: item.textColor, fontWeight: 400, fontSize: '14px' }}>
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Animation keyframes - Add to the top level of the component */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes menuItemFadeIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}} />
      
      {/* Click capture to close menu when clicking outside */}
      {Boolean(anchorEl) && (
        <div
          onClick={handleMenuClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1200,
          }}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this candidate? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteCandidate} 
            color="error" 
            variant="contained" 
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Email Dialog */}
      <Dialog 
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Send Email to {emailRecipient?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="To"
              value={emailRecipient?.email || ''}
              disabled
              margin="normal"
            />
            <TextField
              fullWidth
              label="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Message"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              multiline
              rows={6}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSendEmailSubmit}
            disabled={!emailSubject || !emailBody}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Interview Dialog - Updated with full scheduling form */}
      <Dialog
        open={interviewDialogOpen}
        onClose={() => setInterviewDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Schedule Interview</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Candidate: {interviewCandidate && candidates.find(c => c.id === interviewCandidate)?.name}
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time"
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Interview Type</InputLabel>
                  <Select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    label="Interview Type"
                  >
                    <MenuItem value="Technical">Technical</MenuItem>
                    <MenuItem value="HR">HR</MenuItem>
                    <MenuItem value="Cultural Fit">Cultural Fit</MenuItem>
                    <MenuItem value="Coding Challenge">Coding Challenge</MenuItem>
                    <MenuItem value="System Design">System Design</MenuItem>
                    <MenuItem value="Final">Final</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Interviewer Name"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes or Preparation Instructions"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  multiline
                  rows={4}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterviewDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleScheduleInterviewSubmit}
          >
            Schedule Interview
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CandidatesList; 