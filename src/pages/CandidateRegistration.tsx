import React, { useState, useEffect } from 'react';
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
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CVParsingService, { ParsedCVData } from '../services/CVParsingService';
import { useCandidateContext } from '../contexts/CandidateContext';
import jobsApi from '../services/jobsApi';
import CVParsingAPI from '../services/CVParsingAPI';

// Define the steps for registration
const steps = ['Upload Resume', 'Review Information', 'Complete Registration'];

const CandidateRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { addCandidate } = useCandidateContext();
  const cvParsingService = CVParsingService.getInstance();

  // State for stepper
  const [activeStep, setActiveStep] = useState(0);

  // State for form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    title: '',
    summary: '',
    currentEmployer: '',
    yearsOfExperience: '',
  });

  // State for skills, education, experience
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [education, setEducation] = useState<
    Array<{
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate: string;
      current: boolean;
    }>
  >([]);
  const [experience, setExperience] = useState<
    Array<{
      company: string;
      title: string;
      location: string;
      startDate: string;
      endDate: string;
      current: boolean;
      description: string;
    }>
  >([]);

  // State for file upload
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCVData | null>(null);
  const [confidence, setConfidence] = useState<number>(0);

  // State for form validation and submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if user came from job details page
  const [applyingToJobId, setApplyingToJobId] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);

  // Effect to populate form data from parsed CV when available
  useEffect(() => {
    if (parsedData) {
      setFormData({
        firstName: parsedData.personalInfo.firstName,
        lastName: parsedData.personalInfo.lastName,
        email: parsedData.personalInfo.email,
        phone: parsedData.personalInfo.phone,
        location: parsedData.personalInfo.location,
        linkedin: parsedData.personalInfo.linkedin || '',
        github: parsedData.personalInfo.github || '',
        title: parsedData.professionalInfo.title,
        summary: parsedData.professionalInfo.summary,
        currentEmployer: parsedData.professionalInfo.currentEmployer || '',
        yearsOfExperience: parsedData.professionalInfo.totalYearsOfExperience.toString(),
      });

      setSkills(parsedData.professionalInfo.skills);
      setEducation(
        parsedData.education.map((edu) => ({
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          current: edu.current || false,
        }))
      );

      setExperience(
        parsedData.experience.map((exp) => ({
          company: exp.company,
          title: exp.title,
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          current: exp.current || false,
          description: exp.description,
        }))
      );

      setConfidence(parsedData.confidenceScores.overall);
    }
  }, [parsedData]);

  // Effect to check if user is applying to a specific job
  useEffect(() => {
    const jobId = sessionStorage.getItem('applyToJobId');
    if (jobId) {
      setApplyingToJobId(jobId);
      // Fetch job details
      const fetchJobDetails = async () => {
        try {
          const job = await jobsApi.getJobById(parseInt(jobId));
          setJobDetails(job);
        } catch (error) {
          console.error('Error fetching job details:', error);
        }
      };
      fetchJobDetails();
      // Clear the session storage
      sessionStorage.removeItem('applyToJobId');
    }
  }, []);

  // Handle file upload and CV parsing
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setResumeFile(file);
    setParseError(null);

    // Automatically start parsing
    await parseResume(file);
  };

  // Parse the resume file
  const parseResume = async (file: File) => {
    setIsParsing(true);
    setParseError(null);

    try {
      let parsedData;
      let parsingMethod = '';

      // Always try server-side parsing first
      try {
        console.log('Attempting server-side CV parsing...');
        const isServerParsingAvailable = await CVParsingAPI.isAvailable();

        if (isServerParsingAvailable) {
          parsedData = await CVParsingAPI.parseCV(file);
          parsingMethod = 'server';
          console.log('✅ Server-side parsing successful');
        } else {
          throw new Error('Server-side parsing service not available');
        }
      } catch (serverError) {
        console.warn('⚠️ Server-side parsing failed:', serverError);
        console.log('Falling back to client-side parsing...');

        // Fall back to client-side parsing
        parsedData = await cvParsingService.parseCV(file);
        parsingMethod = 'client';

        // Show a warning for non-text files since browser parsing is limited
        const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        if (fileExt !== '.txt') {
          console.warn(`Limited parsing capability for ${fileExt} files in browser environment`);
          // We'll still proceed, but the data might not be as good
        }
      }

      setParsedData(parsedData);

      // Calculate confidence level for UI feedback
      const confidence = parsedData.confidenceScores.overall;
      setConfidence(confidence);

      // Log parsing results
      console.log(
        `CV Parsing complete with ${parsingMethod}-side parsing (${(confidence * 100).toFixed(1)}% confidence)`,
        parsedData
      );

      // Show warning if client-side parsing was used for non-text files
      if (
        parsingMethod === 'client' &&
        file.name.slice(file.name.lastIndexOf('.')).toLowerCase() !== '.txt'
      ) {
        setParseError(
          'Warning: Limited parsing capabilities in browser. For better results, ensure the CV parsing server is running.'
        );
      }

      // Automatically move to next step after successful parsing
      setActiveStep(1);
    } catch (error) {
      console.error('Resume parsing error:', error);
      setParseError(error instanceof Error ? error.message : 'Failed to parse resume');
    } finally {
      setIsParsing(false);
    }
  };

  // Handle form field changes
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

  // Handle select field changes
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

  // Handle skills
  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // Handle education
  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false,
      },
    ]);
  };

  const handleEducationChange = (index: number, field: string, value: any) => {
    const updatedEducation = [...education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value,
    };
    setEducation(updatedEducation);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Handle experience
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        company: '',
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ]);
  };

  const handleExperienceChange = (index: number, field: string, value: any) => {
    const updatedExperience = [...experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value,
    };
    setExperience(updatedExperience);
  };

  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is not valid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!resumeFile) newErrors.resume = 'Resume is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Convert form data to candidate model
      if (parsedData) {
        const candidateData = cvParsingService.convertToCandidateModel(parsedData);

        // Override with any edited form values
        candidateData.personalInfo.firstName = formData.firstName;
        candidateData.personalInfo.lastName = formData.lastName;
        candidateData.personalInfo.email = formData.email;
        candidateData.personalInfo.phone = formData.phone;
        candidateData.personalInfo.location = formData.location;
        candidateData.personalInfo.linkedin = formData.linkedin || undefined;
        candidateData.personalInfo.github = formData.github || undefined;

        candidateData.professionalInfo.title = formData.title;
        candidateData.professionalInfo.summary = formData.summary;
        candidateData.professionalInfo.currentEmployer = formData.currentEmployer || undefined;
        candidateData.professionalInfo.totalYearsOfExperience =
          parseInt(formData.yearsOfExperience) || 0;

        // Replace skills, education, and experience
        candidateData.professionalInfo.skills = skills.map((name) => ({
          id: Math.random().toString(36).substring(2, 11),
          name,
          level: 'Intermediate',
          yearsOfExperience: null,
          verified: false,
        }));

        // If the user is applying to a specific job, add job application data
        if (applyingToJobId && jobDetails) {
          candidateData.jobApplications = [
            {
              id: Math.random().toString(36).substring(2, 11),
              jobId: parseInt(applyingToJobId),
              jobTitle: jobDetails.title,
              status: 'Applied',
              applicationDate: new Date().toISOString(),
              source: 'Career Site',
              notes: `Applied through CV parsing registration`,
              coverLetter: '',
            },
          ];
        }

        // Create the candidate
        const newCandidate = await addCandidate(candidateData);
        console.log('Created candidate:', newCandidate);

        setSuccess(true);
        setActiveStep(3); // Move to success step
      }
    } catch (error) {
      console.error('Error creating candidate:', error);
      setErrors({ submit: 'Failed to register candidate. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation between steps
  const handleNext = () => {
    if (activeStep === 0 && !resumeFile) {
      setErrors({ resume: 'Please upload your resume before continuing' });
      return;
    }

    if (activeStep === 1) {
      // Validate essential fields before final step
      const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
      const newErrors: Record<string, string> = {};

      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Render the appropriate step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0: // Upload Resume
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Let's start by uploading your resume. We'll extract your information automatically.
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack spacing={2} alignItems="center">
                  <Typography variant="h6" align="center">
                    Upload Your Resume
                  </Typography>

                  <Box sx={{ width: '100%', textAlign: 'center' }}>
                    <input
                      accept=".pdf,.doc,.docx,.txt"
                      id="resume-upload"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <label htmlFor="resume-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        size="large"
                      >
                        Select Resume File
                      </Button>
                    </label>
                  </Box>

                  {resumeFile && (
                    <Alert severity="success" icon={<CheckIcon />}>
                      {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
                    </Alert>
                  )}

                  {errors.resume && <FormHelperText error>{errors.resume}</FormHelperText>}

                  {isParsing && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <Typography variant="body2" align="center" gutterBottom>
                        Analyzing your resume...
                      </Typography>
                      <LinearProgress />
                    </Box>
                  )}

                  {parseError && (
                    <Alert severity="error" sx={{ width: '100%' }}>
                      {parseError}
                    </Alert>
                  )}

                  <Typography variant="body2" color="text.secondary" align="center">
                    Supported formats: PDF, DOC, DOCX, TXT
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <Typography variant="body2" color="text.secondary" paragraph>
              Your resume will be automatically parsed to extract your skills, experience, and
              education. You'll be able to review and edit all information before submission.
            </Typography>
          </Box>
        );

      case 1: // Review Information
        return (
          <Box sx={{ mt: 3 }}>
            {confidence > 0 && (
              <Alert severity={confidence > 0.8 ? 'success' : 'info'} sx={{ mb: 3 }}>
                Information was extracted with {Math.round(confidence * 100)}% confidence. Please
                review and correct any details below.
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>

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
                <TextField
                  fullWidth
                  label="LinkedIn Profile"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://www.linkedin.com/in/yourprofile"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GitHub Profile"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>
              Professional Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Employer"
                  name="currentEmployer"
                  value={formData.currentEmployer}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  name="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Professional Summary"
                  name="summary"
                  multiline
                  rows={4}
                  value={formData.summary}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            {/* Skills Section */}
            <Typography variant="h6" gutterBottom>
              Skills
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={9}>
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
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddSkill}
                  sx={{ height: '100%' }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
              {skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                  color="primary"
                  variant="outlined"
                />
              ))}
              {skills.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No skills added yet. Add some skills to stand out.
                </Typography>
              )}
            </Box>

            {/* Education Section */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Education</Typography>
                <Button startIcon={<AddIcon />} onClick={handleAddEducation}>
                  Add Education
                </Button>
              </Box>

              {education.map((edu, index) => (
                <Accordion key={index} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      {edu.institution ? edu.institution : `Education Entry ${index + 1}`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Institution"
                          value={edu.institution}
                          onChange={(e) =>
                            handleEducationChange(index, 'institution', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Degree"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Field of Study"
                          value={edu.field}
                          onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label="Start Date"
                          value={edu.startDate}
                          onChange={(e) =>
                            handleEducationChange(index, 'startDate', e.target.value)
                          }
                          placeholder="YYYY-MM"
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label="End Date"
                          value={edu.endDate}
                          onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                          placeholder="YYYY-MM"
                          disabled={edu.current}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                          color="error"
                          onClick={() => handleRemoveEducation(index)}
                          startIcon={<DeleteIcon />}
                        >
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}

              {education.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No education history added yet.
                </Typography>
              )}
            </Box>

            {/* Experience Section */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Work Experience</Typography>
                <Button startIcon={<AddIcon />} onClick={handleAddExperience}>
                  Add Experience
                </Button>
              </Box>

              {experience.map((exp, index) => (
                <Accordion key={index} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      {exp.title && exp.company
                        ? `${exp.title} at ${exp.company}`
                        : exp.title || exp.company || `Experience Entry ${index + 1}`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Job Title"
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Company"
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Location"
                          value={exp.location}
                          onChange={(e) =>
                            handleExperienceChange(index, 'location', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Start Date"
                          value={exp.startDate}
                          onChange={(e) =>
                            handleExperienceChange(index, 'startDate', e.target.value)
                          }
                          placeholder="YYYY-MM"
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="End Date"
                          value={exp.endDate}
                          onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                          placeholder="YYYY-MM"
                          disabled={exp.current}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={3}
                          value={exp.description}
                          onChange={(e) =>
                            handleExperienceChange(index, 'description', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          color="error"
                          onClick={() => handleRemoveExperience(index)}
                          startIcon={<DeleteIcon />}
                        >
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}

              {experience.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No work experience added yet.
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 2: // Complete Registration
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review and Complete Your Registration
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Please review your information carefully before submitting. Once submitted, your
              profile will be created and you'll be able to apply for positions.
            </Alert>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{`${formData.firstName} ${formData.lastName}`}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">{formData.location || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{formData.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">{formData.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Resume
                  </Typography>
                  <Typography variant="body1">{resumeFile?.name || 'Not uploaded'}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Professional Summary
              </Typography>
              <Typography variant="body1" paragraph>
                {formData.summary || 'No summary provided'}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Skills ({skills.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {skills.map((skill, index) => (
                  <Chip key={index} label={skill} color="primary" size="small" />
                ))}
                {skills.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No skills provided
                  </Typography>
                )}
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Education ({education.length})
              </Typography>
              {education.length > 0 ? (
                <List dense>
                  {education.map((edu, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${edu.degree} in ${edu.field}`}
                        secondary={`${edu.institution} (${edu.startDate}${edu.current ? ' - Present' : edu.endDate ? ` - ${edu.endDate}` : ''})`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No education history provided
                </Typography>
              )}

              <Typography variant="subtitle1" gutterBottom>
                Experience ({experience.length})
              </Typography>
              {experience.length > 0 ? (
                <List dense>
                  {experience.map((exp, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${exp.title} at ${exp.company}`}
                        secondary={`${exp.location} (${exp.startDate}${exp.current ? ' - Present' : exp.endDate ? ` - ${exp.endDate}` : ''})`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No work experience provided
                </Typography>
              )}
            </Paper>

            {errors.submit && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.submit}
              </Alert>
            )}
          </Box>
        );

      default:
        return <Box>Unknown step</Box>;
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {applyingToJobId
            ? `Apply to ${jobDetails?.title || 'Job'} with CV`
            : 'Candidate Registration'}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {applyingToJobId
            ? "Submit your resume to apply for this position. We'll automatically extract your information to make the process easier."
            : "Create your candidate profile by uploading your resume. We'll automatically extract your information to make the process easier."}
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {success ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {applyingToJobId ? 'Application Submitted Successfully!' : 'Registration Successful!'}
            </Typography>
            <Typography variant="body1" paragraph>
              {applyingToJobId
                ? 'Your application has been submitted. We will review your qualifications and get back to you soon.'
                : 'Your profile has been created. You can now log in and apply for jobs.'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(applyingToJobId ? '/careers' : '/login')}
            >
              {applyingToJobId ? 'Back to Careers' : 'Go to Login'}
            </Button>
          </Box>
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {getStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}

              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeStep === 0 && (!resumeFile || isParsing)}
                >
                  {activeStep === steps.length - 2 ? 'Review' : 'Next'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default CandidateRegistration;
