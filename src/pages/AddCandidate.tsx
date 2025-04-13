import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  IconButton,
  Divider,
  Stack,
  FormHelperText,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

// Mock job openings for the dropdown
const jobOpenings = [
  { id: 1, title: 'Frontend Developer' },
  { id: 2, title: 'UX Designer' },
  { id: 3, title: 'Product Manager' },
  { id: 4, title: 'Backend Developer' },
  { id: 5, title: 'DevOps Engineer' },
];

interface EducationEntry {
  id: number;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

interface ExperienceEntry {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

function AddCandidate() {
  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    jobId: '',
    source: '',
    resumeFile: null as File | null,
    coverLetterFile: null as File | null,
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handler for form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handler for select field changes
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handler for file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: e.target.files![0],
      }));
      
      // Clear error for this field if exists
      if (errors[fieldName]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }
  };

  // Add a skill
  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  // Remove a skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // Add education entry
  const handleAddEducation = () => {
    const newEducation: EducationEntry = {
      id: Date.now(),
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
      current: false,
    };
    setEducation([...education, newEducation]);
  };

  // Update education entry
  const handleEducationChange = (id: number, field: keyof EducationEntry, value: any) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  // Remove education entry
  const handleRemoveEducation = (id: number) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  // Add experience entry
  const handleAddExperience = () => {
    const newExperience: ExperienceEntry = {
      id: Date.now(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    setExperience([...experience, newExperience]);
  };

  // Update experience entry
  const handleExperienceChange = (id: number, field: keyof ExperienceEntry, value: any) => {
    setExperience(experience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  // Remove experience entry
  const handleRemoveExperience = (id: number) => {
    setExperience(experience.filter(exp => exp.id !== id));
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.jobId) newErrors.jobId = "Please select a job position";
    if (!formData.resumeFile) newErrors.resumeFile = "Resume is required";
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Form data submitted:", {
        ...formData,
        skills,
        education,
        experience,
        fullName: `${formData.firstName} ${formData.lastName}`
      });
      setSubmitting(false);
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          location: '',
          jobId: '',
          source: '',
          resumeFile: null,
          coverLetterFile: null,
        });
        setSkills([]);
        setEducation([]);
        setExperience([]);
        setSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Add New Candidate
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Candidate added successfully!
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          
          {/* Basic Info Fields */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.jobId} required>
                <InputLabel>Position Applied For</InputLabel>
                <Select
                  name="jobId"
                  value={formData.jobId}
                  onChange={handleSelectChange}
                  label="Position Applied For"
                >
                  {jobOpenings.map((job) => (
                    <MenuItem key={job.id} value={job.id}>
                      {job.title}
                    </MenuItem>
                  ))}
                </Select>
                {errors.jobId && <FormHelperText>{errors.jobId}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="LinkedIn, Indeed, Referral, etc."
              />
            </Grid>
          </Grid>
          
          {/* Skills Section */}
          <Typography variant="h6" gutterBottom>
            Skills
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <TextField
                fullWidth
                label="Add Skill"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                sx={{ mr: 1 }}
              />
              <Button 
                variant="contained" 
                onClick={handleAddSkill}
                disabled={!currentSkill.trim()}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                />
              ))}
              {skills.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No skills added yet. Add some skills to help match this candidate with jobs.
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Education Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Education</Typography>
              <Button 
                startIcon={<AddIcon />} 
                onClick={handleAddEducation}
                variant="outlined"
              >
                Add Education
              </Button>
            </Box>
            
            {education.map((edu, index) => (
              <Paper key={edu.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1">Education #{index + 1}</Typography>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleRemoveEducation(edu.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Institution"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Degree / Field of Study"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="month"
                      value={edu.startDate}
                      onChange={(e) => handleEducationChange(edu.id, 'startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="month"
                      value={edu.endDate}
                      onChange={(e) => handleEducationChange(edu.id, 'endDate', e.target.value)}
                      disabled={edu.current}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            {education.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No education history added yet.
              </Typography>
            )}
          </Box>
          
          {/* Experience Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Work Experience</Typography>
              <Button 
                startIcon={<AddIcon />} 
                onClick={handleAddExperience}
                variant="outlined"
              >
                Add Experience
              </Button>
            </Box>
            
            {experience.map((exp, index) => (
              <Paper key={exp.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1">Experience #{index + 1}</Typography>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleRemoveExperience(exp.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={exp.position}
                      onChange={(e) => handleExperienceChange(exp.id, 'position', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(exp.id, 'startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(exp.id, 'endDate', e.target.value)}
                      disabled={exp.current}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                      placeholder="Describe roles, responsibilities, and achievements"
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            {experience.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No work experience added yet.
              </Typography>
            )}
          </Box>
          
          {/* Document Upload Section */}
          <Typography variant="h6" gutterBottom>
            Documents
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Resume *</Typography>
                <Box>
                  <input
                    accept=".pdf,.doc,.docx"
                    id="resume-file"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(e, 'resumeFile')}
                  />
                  <label htmlFor="resume-file">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                    >
                      {formData.resumeFile ? formData.resumeFile.name : 'Upload Resume'}
                    </Button>
                  </label>
                  {errors.resumeFile && (
                    <FormHelperText error>{errors.resumeFile}</FormHelperText>
                  )}
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Cover Letter (Optional)</Typography>
                <Box>
                  <input
                    accept=".pdf,.doc,.docx"
                    id="cover-letter-file"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(e, 'coverLetterFile')}
                  />
                  <label htmlFor="cover-letter-file">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                    >
                      {formData.coverLetterFile ? formData.coverLetterFile.name : 'Upload Cover Letter'}
                    </Button>
                  </label>
                </Box>
              </Stack>
            </Grid>
          </Grid>
          
          {/* Form Submission */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="button" 
              variant="outlined" 
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Add Candidate'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default AddCandidate; 