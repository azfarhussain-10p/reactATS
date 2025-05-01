import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Rating,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Chip,
  Avatar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  LinearProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Save as SaveIcon,
  Send as SendIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Cancel as CancelIcon,
  Create as CreateIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Compare as CompareIcon,
} from '@mui/icons-material';
import { useEvaluation } from '../contexts/EvaluationContext';

// Mock candidate data for testing
const mockCandidate = {
  id: 1,
  name: 'John Doe',
  role: 'Senior Frontend Developer',
  interviewDate: '2023-12-15',
  interviewType: 'Technical Interview',
  interviewers: ['David Lee', 'Emily Chen'],
  profile: {
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    experience: '7 years',
  },
};

// Recommendation options
const recommendationOptions = ['Strong Hire', 'Hire', 'Neutral', 'Reject', 'Strong Reject'];

function InterviewerFeedbackForm() {
  const { id: candidateId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getDefaultForm,
    forms,
    getFormById,
    calculateOverallScore,
    addResponse,
    getResponsesForCandidate,
  } = useEvaluation();

  // States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [candidate, setCandidate] = useState(mockCandidate);

  // Form states
  const [selectedFormId, setSelectedFormId] = useState('');
  const [formData, setFormData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<{ criteriaId: string; value: any }[]>([]);
  const [textResponses, setTextResponses] = useState({
    strengths: '',
    improvements: '',
    notes: '',
    recommendation: '',
  });

  // Dialog states
  const [openFormSelector, setOpenFormSelector] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [previousEvaluations, setPreviousEvaluations] = useState<any[]>([]);

  // Initialize the form data
  useEffect(() => {
    if (!candidateId) {
      setError('No candidate ID provided');
      setLoading(false);
      return;
    }

    // In a real app, this would fetch candidate data from an API
    setLoading(true);

    // Get previous evaluations for this candidate
    const prevEvals = getResponsesForCandidate(Number(candidateId));
    setPreviousEvaluations(prevEvals);

    // Set default form
    const defaultForm = getDefaultForm(true); // assuming technical role by default
    setSelectedFormId(defaultForm.id);
    setFormData(defaultForm);

    // Initialize empty responses for all criteria
    const initialResponses = defaultForm.sections.flatMap((section) =>
      section.criteria.map((criterion) => ({
        criteriaId: criterion.id,
        value:
          criterion.type === 'rating'
            ? 0
            : criterion.type === 'boolean'
              ? false
              : criterion.type === 'select'
                ? ''
                : '',
      }))
    );
    setResponses(initialResponses);

    setLoading(false);
  }, [candidateId]);

  // Handle form selection change
  const handleFormChange = (formId: string) => {
    const selectedForm = getFormById(formId);
    if (!selectedForm) return;

    setSelectedFormId(formId);
    setFormData(selectedForm);

    // Initialize empty responses for all criteria in the new form
    const initialResponses = selectedForm.sections.flatMap((section) =>
      section.criteria.map((criterion) => ({
        criteriaId: criterion.id,
        value:
          criterion.type === 'rating'
            ? 0
            : criterion.type === 'boolean'
              ? false
              : criterion.type === 'select'
                ? ''
                : '',
      }))
    );
    setResponses(initialResponses);
    setCurrentStep(0);
  };

  // Handle response changes for ratings
  const handleRatingChange = (criteriaId: string, value: number | null) => {
    setResponses((prev) =>
      prev.map((response) =>
        response.criteriaId === criteriaId ? { ...response, value: value || 0 } : response
      )
    );
  };

  // Handle response changes for text inputs
  const handleTextInputChange = (criteriaId: string, value: string) => {
    setResponses((prev) =>
      prev.map((response) =>
        response.criteriaId === criteriaId ? { ...response, value } : response
      )
    );
  };

  // Handle response changes for boolean inputs
  const handleBooleanChange = (criteriaId: string, value: boolean) => {
    setResponses((prev) =>
      prev.map((response) =>
        response.criteriaId === criteriaId ? { ...response, value } : response
      )
    );
  };

  // Handle response changes for select inputs
  const handleSelectChange = (criteriaId: string, value: string) => {
    setResponses((prev) =>
      prev.map((response) =>
        response.criteriaId === criteriaId ? { ...response, value } : response
      )
    );
  };

  // Handle text area changes (strengths, improvements, notes)
  const handleTextAreaChange = (field: keyof typeof textResponses, value: string) => {
    setTextResponses((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Go to the next step
  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, formData.sections.length));
  };

  // Go to the previous step
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Validate the current section
  const validateCurrentSection = () => {
    if (!formData) return true;

    const currentSection = formData.sections[currentStep];
    if (!currentSection) return true;

    const requiredCriteria = currentSection.criteria.filter((c) => c.required);

    for (const criterion of requiredCriteria) {
      const response = responses.find((r) => r.criteriaId === criterion.id);

      if (!response) return false;

      if (criterion.type === 'rating' && (!response.value || response.value === 0)) {
        return false;
      }

      if (criterion.type === 'text' && (!response.value || response.value.trim() === '')) {
        return false;
      }

      if (criterion.type === 'select' && (!response.value || response.value === '')) {
        return false;
      }
    }

    return true;
  };

  // Validate the final submission
  const validateSubmission = () => {
    if (!formData) return false;

    // Check all required criteria across all sections
    for (const section of formData.sections) {
      const requiredCriteria = section.criteria.filter((c) => c.required);

      for (const criterion of requiredCriteria) {
        const response = responses.find((r) => r.criteriaId === criterion.id);

        if (!response) return false;

        if (criterion.type === 'rating' && (!response.value || response.value === 0)) {
          return false;
        }

        if (criterion.type === 'text' && (!response.value || response.value.trim() === '')) {
          return false;
        }

        if (criterion.type === 'select' && (!response.value || response.value === '')) {
          return false;
        }
      }
    }

    // Check required text responses
    if (!textResponses.strengths.trim()) return false;
    if (!textResponses.improvements.trim()) return false;
    if (!textResponses.recommendation) return false;

    return true;
  };

  // Calculate the current scores
  const calculateScores = () => {
    if (!formData) return { sectionScores: [], overallScore: 0 };
    return calculateOverallScore(responses, formData.id);
  };

  // Get the calculated scores
  const scores = calculateScores();

  // Handle form submission
  const handleSubmit = () => {
    if (!validateSubmission()) {
      setError('Please complete all required fields before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    // Prepare the response object
    const formResponse = {
      formId: selectedFormId,
      candidateId: Number(candidateId),
      interviewerId: '2', // In a real app, this would be the current user's ID
      interviewDate: new Date().toISOString(),
      submissionDate: new Date().toISOString(),
      responses,
      scores: scores.sectionScores,
      overallScore: scores.overallScore,
      recommendation: textResponses.recommendation,
      strengths: textResponses.strengths,
      improvements: textResponses.improvements,
      notes: textResponses.notes,
      isComplete: true,
      reminderSent: false,
    };

    // In a real app, this would be an API call
    setTimeout(() => {
      try {
        // Add the response to our context
        addResponse(formResponse);

        setSuccess(true);
        setSubmitting(false);

        // Reset after success
        setTimeout(() => {
          navigate(-1); // Go back to previous page
        }, 2000);
      } catch (err) {
        setError('An error occurred while submitting the evaluation.');
        setSubmitting(false);
      }
    }, 1000);
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading evaluation form...</Typography>
      </Box>
    );
  }

  // Render error state
  if (error && !formData) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 2 }}>
      {/* Header with candidate info */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={candidate.profile.image} sx={{ width: 64, height: 64, mr: 2 }}>
                {candidate.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5">{candidate.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {candidate.role}
                </Typography>
                <Box sx={{ display: 'flex', mt: 1 }}>
                  <Chip
                    label={candidate.interviewType}
                    size="small"
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`Interview Date: ${new Date(candidate.interviewDate).toLocaleDateString()}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CompareIcon />}
                onClick={() => setCompareDialogOpen(true)}
                disabled={previousEvaluations.length === 0}
              >
                Compare Evaluations
              </Button>
              <Button
                variant="outlined"
                startIcon={<CreateIcon />}
                onClick={() => setOpenFormSelector(true)}
              >
                Change Form
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Success message */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Evaluation submitted successfully!
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stepper for sections */}
      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {formData.sections.map((section, index) => (
          <Step key={section.id}>
            <StepLabel>{section.title}</StepLabel>
          </Step>
        ))}
        <Step>
          <StepLabel>Summary</StepLabel>
        </Step>
      </Stepper>

      {/* Current section form */}
      {currentStep < formData.sections.length ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {formData.sections[currentStep].title}
            </Typography>
            {formData.sections[currentStep].description && (
              <Typography variant="body2" color="text.secondary" paragraph>
                {formData.sections[currentStep].description}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              {formData.sections[currentStep].criteria.map((criterion) => (
                <Grid item xs={12} key={criterion.id}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {criterion.name}
                      {criterion.required && <span style={{ color: 'red' }}> *</span>}
                    </Typography>

                    {criterion.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {criterion.description}
                      </Typography>
                    )}

                    {/* Render the appropriate input based on criterion type */}
                    {criterion.type === 'rating' && (
                      <Rating
                        name={criterion.id}
                        value={responses.find((r) => r.criteriaId === criterion.id)?.value || 0}
                        onChange={(_, value) => handleRatingChange(criterion.id, value)}
                        size="large"
                        precision={0.5}
                        emptyIcon={<StarBorderIcon fontSize="inherit" />}
                      />
                    )}

                    {criterion.type === 'text' && (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={responses.find((r) => r.criteriaId === criterion.id)?.value || ''}
                        onChange={(e) => handleTextInputChange(criterion.id, e.target.value)}
                        placeholder={`Enter your evaluation for ${criterion.name}`}
                      />
                    )}

                    {criterion.type === 'boolean' && (
                      <FormControl component="fieldset">
                        <RadioGroup
                          value={
                            responses.find((r) => r.criteriaId === criterion.id)?.value
                              ? 'yes'
                              : 'no'
                          }
                          onChange={(e) =>
                            handleBooleanChange(criterion.id, e.target.value === 'yes')
                          }
                          row
                        >
                          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                          <FormControlLabel value="no" control={<Radio />} label="No" />
                        </RadioGroup>
                      </FormControl>
                    )}

                    {criterion.type === 'select' && criterion.options && (
                      <FormControl fullWidth>
                        <Select
                          value={responses.find((r) => r.criteriaId === criterion.id)?.value || ''}
                          onChange={(e) => handleSelectChange(criterion.id, e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            <em>Select an option</em>
                          </MenuItem>
                          {criterion.options.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ) : (
        // Summary step
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Evaluation Summary
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Please provide your overall assessment of the candidate.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Candidate Strengths <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={textResponses.strengths}
                  onChange={(e) => handleTextAreaChange('strengths', e.target.value)}
                  placeholder="What are the candidate's key strengths? What impressed you most?"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Areas for Improvement <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={textResponses.improvements}
                  onChange={(e) => handleTextAreaChange('improvements', e.target.value)}
                  placeholder="What areas could the candidate improve? What skills or experiences are they missing?"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Additional Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={textResponses.notes}
                  onChange={(e) => handleTextAreaChange('notes', e.target.value)}
                  placeholder="Any additional comments or observations about the candidate."
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Hiring Recommendation <span style={{ color: 'red' }}>*</span>
                </Typography>
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={textResponses.recommendation}
                    onChange={(e) => handleTextAreaChange('recommendation', e.target.value)}
                  >
                    {recommendationOptions.map((option) => (
                      <FormControlLabel
                        key={option}
                        value={option}
                        control={<Radio />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Section Scores
                </Typography>
                <List>
                  {scores.sectionScores.map((score) => {
                    const section = formData.sections.find((s) => s.id === score.sectionId);
                    return (
                      <ListItem key={score.sectionId}>
                        <ListItemText
                          primary={section ? section.title : score.sectionId}
                          secondary={`Score: ${score.score.toFixed(1)} / 5.0`}
                        />
                        <Rating value={score.score} precision={0.1} readOnly />
                      </ListItem>
                    );
                  })}
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Overall Score"
                      secondary={`${scores.overallScore.toFixed(1)} / 5.0`}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    <Rating value={scores.overallScore} precision={0.1} readOnly size="large" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<CancelIcon />}>
          Cancel
        </Button>

        <Box>
          {currentStep > 0 && (
            <Button variant="outlined" onClick={handleBack} sx={{ mr: 1 }} startIcon={<BackIcon />}>
              Back
            </Button>
          )}

          {currentStep < formData.sections.length ? (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ForwardIcon />}
              disabled={!validateCurrentSection()}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              endIcon={<SendIcon />}
              disabled={submitting || !validateSubmission()}
            >
              {submitting ? 'Submitting...' : 'Submit Evaluation'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Form selector dialog */}
      <Dialog
        open={openFormSelector}
        onClose={() => setOpenFormSelector(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Evaluation Form</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Choose the most appropriate evaluation form for this candidate.
          </Typography>
          <List>
            {forms.map((form) => (
              <ListItem
                key={form.id}
                button
                selected={selectedFormId === form.id}
                onClick={() => handleFormChange(form.id)}
              >
                <ListItemIcon>
                  <AssignmentIcon color={form.isDefault ? 'primary' : 'action'} />
                </ListItemIcon>
                <ListItemText
                  primary={form.name}
                  secondary={`${form.sections.length} sections • ${form.sections.reduce((acc, section) => acc + section.criteria.length, 0)} criteria`}
                />
                {selectedFormId === form.id && <CheckIcon color="primary" />}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFormSelector(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenFormSelector(false)}>
            Confirm Selection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Compare evaluations dialog */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Previous Evaluations</DialogTitle>
        <DialogContent>
          {previousEvaluations.length > 0 ? (
            <>
              <Typography variant="body2" color="text.secondary" paragraph>
                Compare previous evaluations for this candidate.
              </Typography>

              <Grid container spacing={2}>
                {previousEvaluations.map((evaluation) => {
                  const form = getFormById(evaluation.formId);

                  return (
                    <Grid item xs={12} key={evaluation.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">{form?.name || 'Evaluation'}</Typography>
                            <Box>
                              <Chip
                                label={evaluation.recommendation}
                                color={
                                  evaluation.recommendation === 'Strong Hire'
                                    ? 'success'
                                    : evaluation.recommendation === 'Hire'
                                      ? 'primary'
                                      : evaluation.recommendation === 'Neutral'
                                        ? 'default'
                                        : 'error'
                                }
                                size="small"
                              />
                            </Box>
                          </Box>

                          <Typography variant="body2" color="text.secondary">
                            <strong>Date:</strong>{' '}
                            {new Date(evaluation.submissionDate).toLocaleDateString()}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            <strong>Overall Score:</strong> {evaluation.overallScore.toFixed(1)} /
                            5.0
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Rating value={evaluation.overallScore} precision={0.1} readOnly />
                          </Box>

                          <Typography variant="subtitle2" sx={{ mt: 2 }}>
                            Strengths
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {evaluation.strengths}
                          </Typography>

                          <Typography variant="subtitle2">Areas for Improvement</Typography>
                          <Typography variant="body2" paragraph>
                            {evaluation.improvements}
                          </Typography>

                          {evaluation.notes && (
                            <>
                              <Typography variant="subtitle2">Additional Notes</Typography>
                              <Typography variant="body2">{evaluation.notes}</Typography>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          ) : (
            <Typography align="center" sx={{ py: 2 }}>
              No previous evaluations found for this candidate.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InterviewerFeedbackForm;
