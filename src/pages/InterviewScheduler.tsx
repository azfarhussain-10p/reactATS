import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Event as EventIcon,
  GroupAdd as GroupAddIcon,
  Videocam as VideocamIcon,
  Room as RoomIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

// Mock candidates
const candidates = [
  { id: 1, name: 'John Doe', role: 'Frontend Developer' },
  { id: 2, name: 'Jane Smith', role: 'UX Designer' },
  { id: 3, name: 'Mike Johnson', role: 'Backend Developer' },
  { id: 4, name: 'Sara Williams', role: 'Product Manager' },
];

// Mock jobs
const jobs = [
  { id: 1, title: 'Frontend Developer' },
  { id: 2, title: 'UX Designer' },
  { id: 3, title: 'Product Manager' },
  { id: 4, title: 'Backend Developer' },
];

// Mock team members
const teamMembers = [
  { id: 1, name: 'Emily Davis', role: 'Hiring Manager' },
  { id: 2, name: 'Robert Wilson', role: 'Tech Lead' },
  { id: 3, name: 'Amanda Miller', role: 'HR Manager' },
  { id: 4, name: 'David Lee', role: 'Senior Developer' },
];

// Mock interview types
const interviewTypes = [
  'Technical Interview',
  'Cultural Fit',
  'HR Screening',
  'Take-Home Assignment Review',
  'Pair Programming',
  'System Design',
  'Final Round',
];

// Mock scheduled interviews
const initialInterviews = [
  {
    id: 1,
    candidateId: 1,
    jobId: 1,
    interviewType: 'Technical Interview',
    start: new Date('2023-12-15T10:00:00'),
    end: new Date('2023-12-15T11:00:00'),
    interviewers: [1, 2],
    location: 'Video Call',
    notes: 'Focus on React and TypeScript skills',
    status: 'Scheduled',
  },
  {
    id: 2,
    candidateId: 2,
    jobId: 2,
    interviewType: 'Cultural Fit',
    start: new Date('2023-12-16T14:00:00'),
    end: new Date('2023-12-16T15:00:00'),
    interviewers: [1, 3],
    location: 'Office - Room 203',
    notes: 'Assess team fit and communication skills',
    status: 'Scheduled',
  },
  {
    id: 3,
    candidateId: 3,
    jobId: 4,
    interviewType: 'Technical Interview',
    start: new Date('2023-12-14T11:30:00'),
    end: new Date('2023-12-14T12:30:00'),
    interviewers: [2, 4],
    location: 'Video Call',
    notes: 'Focus on backend technologies and system design',
    status: 'Completed',
  },
];

interface InterviewForm {
  candidateId: number | '';
  jobId: number | '';
  interviewType: string;
  start: dayjs.Dayjs | null;
  end: dayjs.Dayjs | null;
  interviewers: number[];
  location: string;
  notes: string;
}

function InterviewScheduler() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState(initialInterviews);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<InterviewForm>({
    candidateId: '',
    jobId: '',
    interviewType: '',
    start: null,
    end: null,
    interviewers: [],
    location: '',
    notes: '',
  });
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Check for URL param to pre-select candidate
  useEffect(() => {
    if (id) {
      const candidateId = parseInt(id, 10);
      if (!isNaN(candidateId) && candidates.some((c) => c.id === candidateId)) {
        // Open the dialog automatically with the candidate pre-selected
        setFormData({
          candidateId: candidateId,
          jobId: '',
          interviewType: '',
          start: dayjs(),
          end: dayjs().add(1, 'hour'),
          interviewers: [],
          location: '',
          notes: '',
        });
        setOpen(true);
      }
    }
  }, [id]);

  // Open dialog for new interview
  const handleNewInterview = () => {
    setIsEdit(false);
    setFormData({
      candidateId: '',
      jobId: '',
      interviewType: '',
      start: dayjs(),
      end: dayjs().add(1, 'hour'),
      interviewers: [],
      location: '',
      notes: '',
    });
    setOpen(true);
  };

  // Open dialog for editing
  const handleEditInterview = (id: number) => {
    const interview = interviews.find((i) => i.id === id);
    if (interview) {
      setIsEdit(true);
      setCurrentId(id);
      setFormData({
        candidateId: interview.candidateId,
        jobId: interview.jobId,
        interviewType: interview.interviewType,
        start: dayjs(interview.start),
        end: dayjs(interview.end),
        interviewers: interview.interviewers,
        location: interview.location,
        notes: interview.notes,
      });
      setOpen(true);
    }
  };

  // Delete interview
  const handleDeleteInterview = (id: number) => {
    setInterviews(interviews.filter((i) => i.id !== id));
  };

  // Handle form field changes
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle multiple interviewers selection
  const handleInterviewerChange = (e: any) => {
    setFormData({
      ...formData,
      interviewers: e.target.value,
    });
  };

  // Handle date/time changes
  const handleDateChange = (dateField: 'start' | 'end', newDate: dayjs.Dayjs | null) => {
    setFormData({
      ...formData,
      [dateField]: newDate,
    });
  };

  // Validate form
  const validateForm = () => {
    if (!formData.candidateId) return 'Please select a candidate';
    if (!formData.jobId) return 'Please select a job position';
    if (!formData.interviewType) return 'Please select an interview type';
    if (!formData.start) return 'Please select a start time';
    if (!formData.end) return 'Please select an end time';
    if (formData.interviewers.length === 0) return 'Please select at least one interviewer';
    if (!formData.location) return 'Please specify a location';
    if (formData.start && formData.end && formData.start.isAfter(formData.end)) {
      return 'End time must be after start time';
    }
    return '';
  };

  // Handle form submission
  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    setTimeout(() => {
      if (isEdit && currentId) {
        setInterviews(
          interviews.map((interview) =>
            interview.id === currentId
              ? {
                  ...interview,
                  candidateId: formData.candidateId as number,
                  jobId: formData.jobId as number,
                  interviewType: formData.interviewType,
                  start: formData.start?.toDate() as Date,
                  end: formData.end?.toDate() as Date,
                  interviewers: formData.interviewers,
                  location: formData.location,
                  notes: formData.notes,
                }
              : interview
          )
        );
      } else {
        setInterviews([
          ...interviews,
          {
            id: Math.max(0, ...interviews.map((i) => i.id)) + 1,
            candidateId: formData.candidateId as number,
            jobId: formData.jobId as number,
            interviewType: formData.interviewType,
            start: formData.start?.toDate() as Date,
            end: formData.end?.toDate() as Date,
            interviewers: formData.interviewers,
            location: formData.location,
            notes: formData.notes,
            status: 'Scheduled',
          },
        ]);
      }

      setSuccess(true);
      setSubmitting(false);

      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
        // Redirect to main interviews page if came from a candidate-specific URL
        if (id) {
          navigate('/interviews');
        }
      }, 1500);
    }, 1000);
  };

  // Helper to get candidate name by id
  const getCandidateName = (id: number) => {
    const candidate = candidates.find((c) => c.id === id);
    return candidate ? candidate.name : 'Unknown';
  };

  // Helper to get job title by id
  const getJobTitle = (id: number) => {
    const job = jobs.find((j) => j.id === id);
    return job ? job.title : 'Unknown';
  };

  // Helper to get interviewer names
  const getInterviewerNames = (ids: number[]) => {
    return ids
      .map((id) => {
        const member = teamMembers.find((m) => m.id === id);
        return member ? member.name : 'Unknown';
      })
      .join(', ');
  };

  // Filter interviews based on status
  const filteredInterviews = interviews.filter((interview) => {
    if (filterStatus === 'all') return true;
    return interview.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Interview Scheduler</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNewInterview}>
          Schedule Interview
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Filter by Status:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Candidate</strong>
              </TableCell>
              <TableCell>
                <strong>Position</strong>
              </TableCell>
              <TableCell>
                <strong>Type</strong>
              </TableCell>
              <TableCell>
                <strong>Date & Time</strong>
              </TableCell>
              <TableCell>
                <strong>Interviewers</strong>
              </TableCell>
              <TableCell>
                <strong>Location</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInterviews.length > 0 ? (
              filteredInterviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell>{getCandidateName(interview.candidateId)}</TableCell>
                  <TableCell>{getJobTitle(interview.jobId)}</TableCell>
                  <TableCell>{interview.interviewType}</TableCell>
                  <TableCell>
                    {interview.start.toLocaleDateString()} <br />
                    {interview.start.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    - {interview.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>{getInterviewerNames(interview.interviewers)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {interview.location.includes('Video') ? (
                        <VideocamIcon fontSize="small" sx={{ mr: 1 }} />
                      ) : (
                        <RoomIcon fontSize="small" sx={{ mr: 1 }} />
                      )}
                      {interview.location}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={interview.status}
                      color={
                        interview.status === 'Scheduled'
                          ? 'primary'
                          : interview.status === 'Completed'
                            ? 'success'
                            : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEditInterview(interview.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteInterview(interview.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No interviews found matching the filter.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Interview Form Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Interview' : 'Schedule New Interview'}</DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Interview {isEdit ? 'updated' : 'scheduled'} successfully!
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1, mx: -1 }}>
            <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Candidate</InputLabel>
                <Select
                  name="candidateId"
                  value={formData.candidateId}
                  onChange={handleChange}
                  label="Candidate"
                >
                  {candidates.map((candidate) => (
                    <MenuItem key={candidate.id} value={candidate.id}>
                      {candidate.name} - {candidate.role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Position</InputLabel>
                <Select
                  name="jobId"
                  value={formData.jobId}
                  onChange={handleChange}
                  label="Position"
                >
                  {jobs.map((job) => (
                    <MenuItem key={job.id} value={job.id}>
                      {job.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: '100%', p: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Interview Type</InputLabel>
                <Select
                  name="interviewType"
                  value={formData.interviewType}
                  onChange={handleChange}
                  label="Interview Type"
                >
                  {interviewTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Start Time"
                  value={formData.start}
                  onChange={(newValue) => handleDateChange('start', newValue)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="End Time"
                  value={formData.end}
                  onChange={(newValue) => handleDateChange('end', newValue)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ width: '100%', p: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Interviewers</InputLabel>
                <Select
                  multiple
                  name="interviewers"
                  value={formData.interviewers}
                  onChange={handleInterviewerChange}
                  label="Interviewers"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((value) => {
                        const member = teamMembers.find((m) => m.id === value);
                        return (
                          <Chip key={value} label={member ? member.name : 'Unknown'} size="small" />
                        );
                      })}
                    </Box>
                  )}
                >
                  {teamMembers.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: '100%', p: 1 }}>
              <TextField
                fullWidth
                required
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Video Call, Office - Room 203, etc."
                InputProps={{
                  startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>
            <Box sx={{ width: '100%', p: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add interview instructions, focus areas, or preparation notes..."
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Submitting...' : isEdit ? 'Update Interview' : 'Schedule Interview'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InterviewScheduler;
