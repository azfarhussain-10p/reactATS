import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Chip,
  Button,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  TextField,
  IconButton,
  ListItemIcon,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  School as EducationIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Chat as ChatIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Attachment as AttachmentIcon,
  PictureAsPdf as PdfIcon,
  RateReview as RateReviewIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

// Mock data - in a real app, this would come from an API or props
const candidatesData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '(555) 123-4567',
    location: 'New York, NY',
    role: 'Frontend Developer',
    status: 'Interview',
    appliedDate: '2023-11-15',
    profileImage: '',
    resumeUrl: '#',
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Material UI', 'Redux'],
    experience: [
      {
        id: 1,
        company: 'Previous Company',
        position: 'Frontend Developer',
        duration: 'Jan 2020 - Present',
        description:
          'Developed and maintained web applications using React and TypeScript. Collaborated with design and backend teams to implement new features.',
      },
      {
        id: 2,
        company: 'Another Company',
        position: 'Web Developer',
        duration: 'Jun 2018 - Dec 2019',
        description:
          'Built responsive websites using JavaScript, HTML, and CSS. Worked on performance optimization and accessibility improvements.',
      },
    ],
    education: [
      {
        id: 1,
        institution: 'University of Technology',
        degree: 'Bachelor of Science in Computer Science',
        duration: '2014 - 2018',
        gpa: '3.8/4.0',
      },
    ],
    interviewNotes: [
      {
        id: 1,
        date: '2023-11-20',
        interviewer: 'Jane Smith',
        title: 'Technical Interview',
        notes:
          'Strong technical skills, especially in React and TypeScript. Good problem-solving approach. Could improve communication of complex concepts.',
      },
    ],
    documents: [
      {
        id: 1,
        name: 'Resume.pdf',
        type: 'pdf',
        size: '1.2 MB',
        uploaded: '2023-11-15',
      },
      {
        id: 2,
        name: 'Cover Letter.pdf',
        type: 'pdf',
        size: '0.8 MB',
        uploaded: '2023-11-15',
      },
    ],
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    location: 'San Francisco, CA',
    role: 'UX Designer',
    status: 'Screening',
    appliedDate: '2023-11-12',
    profileImage: '',
    resumeUrl: '#',
    skills: ['UI/UX', 'Figma', 'User Research', 'Wireframing', 'Prototyping'],
    experience: [
      {
        id: 1,
        company: 'Design Studio',
        position: 'UX Designer',
        duration: 'Mar 2020 - Present',
        description: 'Created user-centered designs and prototypes for various clients.',
      },
    ],
    education: [
      {
        id: 1,
        institution: 'Design Institute',
        degree: 'Bachelor of Fine Arts in Design',
        duration: '2016 - 2020',
        gpa: '3.9/4.0',
      },
    ],
    interviewNotes: [],
    documents: [
      {
        id: 1,
        name: 'Portfolio.pdf',
        type: 'pdf',
        size: '4.5 MB',
        uploaded: '2023-11-12',
      },
    ],
  },
];

// Status color mapping
const statusColors: Record<
  string,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  Applied: 'default',
  Screening: 'info',
  Interview: 'primary',
  Offer: 'success',
  Hired: 'secondary',
  Rejected: 'error',
};

function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [candidateData, setCandidateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch candidate data
    setLoading(true);
    setTimeout(() => {
      const candidate = candidatesData.find((c) => c.id === Number(id));
      if (candidate) {
        setCandidateData(candidate);
        setError(false);
      } else {
        setError(true);
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEvaluateCandidate = () => {
    navigate(`/candidates/${id}/evaluate`);
  };

  const handleGoBack = () => {
    navigate('/candidates');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Typography>Loading candidate profile...</Typography>
      </Box>
    );
  }

  if (error || !candidateData) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Candidate not found. The candidate you're looking for may not exist or has been removed.
        </Alert>
        <Button variant="contained" onClick={handleGoBack}>
          Go Back to Candidates List
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      {/* Header section with basic info */}
      <Paper sx={{ mb: 3, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <Avatar
            src={candidateData.profileImage}
            alt={candidateData.name}
            sx={{ width: 120, height: 120, mr: 3, mb: { xs: 2, md: 0 } }}
          >
            {candidateData.name.charAt(0)}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
              }}
            >
              <Typography variant="h4" component="h1" gutterBottom>
                {candidateData.name}
              </Typography>

              <Box sx={{ display: 'flex', mt: { xs: 1, sm: 0 } }}>
                <Chip
                  label={candidateData.status}
                  color={statusColors[candidateData.status]}
                  sx={{ mr: 1 }}
                />
                <Button variant="contained" sx={{ mr: 1 }}>
                  Change Status
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RateReviewIcon />}
                  onClick={handleEvaluateCandidate}
                >
                  Evaluate
                </Button>
              </Box>
            </Box>

            <Typography variant="h6" color="text.secondary" gutterBottom>
              {candidateData.role}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, mb: 1 }}>
                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>{candidateData.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, mb: 1 }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>{candidateData.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, mb: 1 }}>
                <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>{candidateData.location}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>
                  Applied: {new Date(candidateData.appliedDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabs for different sections */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="candidate profile tabs">
          <Tab label="Overview" />
          <Tab label="Experience" />
          <Tab label="Education" />
          <Tab label="Interview Notes" />
          <Tab label="Documents" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box>
        {/* Overview Tab */}
        {tabValue === 0 && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1, mr: { md: 2 } }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Skills</Typography>
                </Box>
                <Box>
                  {candidateData.skills.map((skill: string) => (
                    <Chip key={skill} label={skill} sx={{ m: 0.5 }} />
                  ))}
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Recent Activity</Typography>
                </Box>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Technical Interview Scheduled"
                      secondary="Nov 25, 2023 at 10:00 AM"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ChatIcon color="info" />
                    </ListItemIcon>
                    <ListItemText primary="Phone Screening Completed" secondary="Nov 18, 2023" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Application Reviewed" secondary="Nov 16, 2023" />
                  </ListItem>
                </List>
              </Paper>
            </Box>

            <Box sx={{ flex: 1, mt: { xs: 3, md: 0 } }}>
              <Paper sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Notes</Typography>
                  <IconButton onClick={() => setEditingNotes(!editingNotes)}>
                    {editingNotes ? <CheckCircleIcon /> : <EditIcon />}
                  </IconButton>
                </Box>

                {editingNotes ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this candidate..."
                    variant="outlined"
                  />
                ) : (
                  <Typography>{notes || 'No notes added yet.'}</Typography>
                )}
              </Paper>
            </Box>
          </Box>
        )}

        {/* Experience Tab */}
        {tabValue === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Work Experience
            </Typography>
            {candidateData.experience.map((exp: any) => (
              <Box key={exp.id} sx={{ mb: 3 }}>
                <Typography variant="h6">{exp.position}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {exp.company}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {exp.duration}
                </Typography>
                <Typography variant="body1" paragraph>
                  {exp.description}
                </Typography>
                <Divider />
              </Box>
            ))}
          </Paper>
        )}

        {/* Education Tab */}
        {tabValue === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Education
            </Typography>
            {candidateData.education.map((edu: any) => (
              <Box key={edu.id} sx={{ mb: 3 }}>
                <Typography variant="h6">{edu.degree}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {edu.institution}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {edu.duration}
                </Typography>
                <Typography variant="body1">GPA: {edu.gpa}</Typography>
                <Divider />
              </Box>
            ))}
          </Paper>
        )}

        {/* Interview Notes Tab */}
        {tabValue === 3 && (
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
            >
              <Typography variant="h6">Interview Notes</Typography>
              <Button variant="contained">Add Interview Note</Button>
            </Box>

            {candidateData.interviewNotes.map((note: any) => (
              <Card key={note.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">{note.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(note.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Interviewer: {note.interviewer}
                  </Typography>
                  <Typography variant="body1">{note.notes}</Typography>
                </CardContent>
              </Card>
            ))}

            {candidateData.interviewNotes.length === 0 && (
              <Typography>No interview notes available.</Typography>
            )}
          </Paper>
        )}

        {/* Documents Tab */}
        {tabValue === 4 && (
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
            >
              <Typography variant="h6">Documents</Typography>
              <Button variant="contained" startIcon={<AttachmentIcon />}>
                Upload Document
              </Button>
            </Box>

            <List>
              {candidateData.documents.map((doc: any) => (
                <ListItem
                  key={doc.id}
                  secondaryAction={
                    <Button size="small" variant="outlined">
                      View
                    </Button>
                  }
                >
                  <ListItemIcon>
                    <PdfIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.name}
                    secondary={`${doc.size} • Uploaded on ${new Date(doc.uploaded).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>

            {candidateData.documents.length === 0 && (
              <Typography>No documents available.</Typography>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
}

export default CandidateProfile;
