import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Slider,
  Chip,
  Divider,
  Card,
  CardContent,
  Stack,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  PersonSearch as PersonSearchIcon,
  Code as CodeIcon,
  Psychology as PsychologyIcon,
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  Score as ScoreIcon,
} from '@mui/icons-material';

// Mock candidate data - in a real app, this would come from an API
const mockCandidates = [
  {
    id: 1,
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '(555) 123-4567',
    role: 'Frontend Developer',
    status: 'Interview',
    interviewStage: 'Technical Interview',
    profileImage: '',
    resumeUrl: '#',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    role: 'UX Designer',
    status: 'Interview',
    interviewStage: 'Portfolio Review',
    profileImage: '',
    resumeUrl: '#',
  },
];

// Mock interviewers
const interviewers = [
  { id: 1, name: 'Emily Davis', role: 'Hiring Manager' },
  { id: 2, name: 'Robert Wilson', role: 'Tech Lead' },
  { id: 3, name: 'Amanda Miller', role: 'HR Manager' },
  { id: 4, name: 'David Lee', role: 'Senior Developer' },
];

// Evaluation form sections
const evaluationSections = {
  technicalSkills: [
    { id: 'techKnowledge', label: 'Technical Knowledge', required: true },
    { id: 'problemSolving', label: 'Problem Solving', required: true },
    { id: 'codingSkills', label: 'Coding Skills', required: false },
    { id: 'systemDesign', label: 'System Design', required: false },
  ],
  softSkills: [
    { id: 'communication', label: 'Communication', required: true },
    { id: 'teamwork', label: 'Teamwork', required: true },
    { id: 'adaptability', label: 'Adaptability', required: true },
  ],
  culturalFit: [
    { id: 'values', label: 'Company Values Alignment', required: true },
    { id: 'motivation', label: 'Motivation', required: true },
  ],
};

// Interview types
const interviewTypes = [
  'Technical Interview',
  'Behavioral Interview',
  'Portfolio Review',
  'System Design Interview',
  'Case Study',
  'Final Round',
];

// Recommendation options
const recommendationOptions = ['Strong Hire', 'Hire', 'Neutral', 'Reject', 'Strong Reject'];

// Mock previous evaluations
const previousEvaluations = [
  {
    id: 101,
    candidateId: 1,
    interviewerId: 2,
    interviewType: 'Technical Interview',
    date: '2023-11-20',
    overallRating: 4,
    strengths: 'Strong React knowledge, good problem-solving approach, clean code structure.',
    areas_for_improvement: 'Could improve on system design and state management.',
    recommendation: 'Hire',
    skills: {
      techKnowledge: 4,
      problemSolving: 4,
      codingSkills: 4,
      systemDesign: 3,
      communication: 3,
      teamwork: 4,
      adaptability: 4,
      values: 4,
      motivation: 5,
    },
  },
];

function CandidateEvaluation() {
  const { id } = useParams(); // Candidate ID from URL
  const navigate = useNavigate();
  const candidateId = id ? parseInt(id) : null;

  // State for the candidate data
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPrevEvaluations, setShowPrevEvaluations] = useState(false);
  const [prevEvaluations, setPrevEvaluations] = useState<any[]>([]);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  // Skill weights
  const [weights, setWeights] = useState({
    technicalSkills: 40,
    softSkills: 30,
    culturalFit: 30,
  });

  // Evaluation form state
  const [evaluation, setEvaluation] = useState({
    interviewerId: '',
    interviewType: '',
    overallRating: 0,
    strengths: '',
    areas_for_improvement: '',
    recommendation: '',
    notes: '',
    skills: {
      techKnowledge: 0,
      problemSolving: 0,
      codingSkills: 0,
      systemDesign: 0,
      communication: 0,
      teamwork: 0,
      adaptability: 0,
      values: 0,
      motivation: 0,
    },
  });

  // Validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Calculate scores based on current evaluation
  const calculateScores = () => {
    const technicalSkills = [
      evaluation.skills.techKnowledge,
      evaluation.skills.problemSolving,
      evaluation.skills.codingSkills,
      evaluation.skills.systemDesign,
    ].filter((score) => score > 0);

    const softSkills = [
      evaluation.skills.communication,
      evaluation.skills.teamwork,
      evaluation.skills.adaptability,
    ].filter((score) => score > 0);

    const culturalFit = [evaluation.skills.values, evaluation.skills.motivation].filter(
      (score) => score > 0
    );

    // Calculate average scores for each category
    const technicalScore =
      technicalSkills.length > 0
        ? technicalSkills.reduce((sum, score) => sum + score, 0) / technicalSkills.length
        : 0;

    const softScore =
      softSkills.length > 0
        ? softSkills.reduce((sum, score) => sum + score, 0) / softSkills.length
        : 0;

    const culturalScore =
      culturalFit.length > 0
        ? culturalFit.reduce((sum, score) => sum + score, 0) / culturalFit.length
        : 0;

    // Calculate weighted score
    const weightedScore =
      (technicalScore * weights.technicalSkills) / 100 +
      (softScore * weights.softSkills) / 100 +
      (culturalFit * weights.culturalFit) / 100;

    return {
      technical: technicalScore,
      soft: softScore,
      cultural: culturalScore,
      weighted: weightedScore,
      overall: evaluation.overallRating,
    };
  };

  // Get the scores
  const scores = calculateScores();

  // Fetch candidate data when component mounts
  useEffect(() => {
    // In a real app, this would fetch data from an API
    if (candidateId) {
      // Simulate API call
      setTimeout(() => {
        const foundCandidate = mockCandidates.find((c) => c.id === candidateId);
        if (foundCandidate) {
          setCandidate(foundCandidate);
          // Get previous evaluations for this candidate
          const candidateEvaluations = previousEvaluations.filter(
            (e) => e.candidateId === candidateId
          );
          setPrevEvaluations(candidateEvaluations);
        } else {
          setError('Candidate not found');
        }
        setLoading(false);
      }, 500);
    } else {
      setError('Invalid candidate ID');
      setLoading(false);
    }
  }, [candidateId]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEvaluation((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle select field changes
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setEvaluation((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle rating changes
  const handleRatingChange = (name: string, value: number | null) => {
    setEvaluation((prev) => ({
      ...prev,
      [name]: value || 0,
    }));

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle skill rating changes
  const handleSkillRatingChange = (skillId: string, value: number | null) => {
    setEvaluation((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillId]: value || 0,
      },
    }));

    // Clear error for this field if it exists
    if (formErrors[`skills.${skillId}`]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`skills.${skillId}`];
        return newErrors;
      });
    }
  };

  // Handle weights change
  const handleWeightChange = (type: string, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!evaluation.interviewerId) errors.interviewerId = 'Please select an interviewer';
    if (!evaluation.interviewType) errors.interviewType = 'Please select interview type';
    if (evaluation.overallRating === 0) errors.overallRating = 'Please provide an overall rating';
    if (!evaluation.recommendation) errors.recommendation = 'Please provide a recommendation';
    if (!evaluation.strengths.trim()) errors.strengths = 'Please provide candidate strengths';
    if (!evaluation.areas_for_improvement.trim())
      errors.areas_for_improvement = 'Please provide areas for improvement';

    // Check required skills ratings
    evaluationSections.technicalSkills.forEach((skill) => {
      if (skill.required && evaluation.skills[skill.id as keyof typeof evaluation.skills] === 0) {
        errors[`skills.${skill.id}`] = `Please rate ${skill.label}`;
      }
    });

    evaluationSections.softSkills.forEach((skill) => {
      if (skill.required && evaluation.skills[skill.id as keyof typeof evaluation.skills] === 0) {
        errors[`skills.${skill.id}`] = `Please rate ${skill.label}`;
      }
    });

    evaluationSections.culturalFit.forEach((skill) => {
      if (skill.required && evaluation.skills[skill.id as keyof typeof evaluation.skills] === 0) {
        errors[`skills.${skill.id}`] = `Please rate ${skill.label}`;
      }
    });

    return errors;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      // Scroll to the first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Get calculated scores
    const calculatedScores = calculateScores();

    // In a real app, this would send data to an API
    console.log('Submitting evaluation:', evaluation);
    console.log('Calculated scores:', calculatedScores);

    // Simulate API call
    setTimeout(() => {
      // Add the evaluation to previous evaluations
      const newEvaluation = {
        id: Date.now(),
        candidateId: candidateId,
        interviewerId: parseInt(evaluation.interviewerId as string),
        interviewType: evaluation.interviewType,
        date: new Date().toISOString().split('T')[0],
        overallRating: evaluation.overallRating,
        strengths: evaluation.strengths,
        areas_for_improvement: evaluation.areas_for_improvement,
        recommendation: evaluation.recommendation,
        notes: evaluation.notes,
        skills: { ...evaluation.skills },
        scores: calculatedScores,
      };

      setPrevEvaluations([...prevEvaluations, newEvaluation]);

      // Show success message
      setSuccess(true);

      // Reset form after a delay
      setTimeout(() => {
        // Reset form
        setEvaluation({
          interviewerId: '',
          interviewType: '',
          overallRating: 0,
          strengths: '',
          areas_for_improvement: '',
          recommendation: '',
          notes: '',
          skills: {
            techKnowledge: 0,
            problemSolving: 0,
            codingSkills: 0,
            systemDesign: 0,
            communication: 0,
            teamwork: 0,
            adaptability: 0,
            values: 0,
            motivation: 0,
          },
        });
        setSuccess(false);
      }, 3000);
    }, 1000);
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading candidate data...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/candidates')}>
          Back to Candidates
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      {/* Candidate Information */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="h5">{candidate.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {candidate.role}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography variant="body2">{candidate.email}</Typography>
              <Typography variant="body2">{candidate.phone}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
            <Chip
              label={candidate.status}
              color={candidate.status === 'Interview' ? 'primary' : 'default'}
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Current Stage: {candidate.interviewStage}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Success message */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Evaluation submitted successfully!
        </Alert>
      )}

      {/* Previous Evaluations Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Candidate Evaluation Form</Typography>
        <Button
          variant="outlined"
          onClick={() => setShowPrevEvaluations(true)}
          disabled={prevEvaluations.length === 0}
        >
          View Previous Evaluations ({prevEvaluations.length})
        </Button>
      </Box>

      {/* Main Form */}
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.interviewerId}>
              <InputLabel id="interviewer-label">Interviewer</InputLabel>
              <Select
                id="interviewerId"
                labelId="interviewer-label"
                name="interviewerId"
                value={evaluation.interviewerId}
                onChange={handleSelectChange}
                label="Interviewer"
              >
                {interviewers.map((interviewer) => (
                  <MenuItem key={interviewer.id} value={interviewer.id}>
                    {interviewer.name} - {interviewer.role}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.interviewerId && (
                <Typography color="error" variant="caption">
                  {formErrors.interviewerId}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.interviewType}>
              <InputLabel id="interview-type-label">Interview Type</InputLabel>
              <Select
                id="interviewType"
                labelId="interview-type-label"
                name="interviewType"
                value={evaluation.interviewType}
                onChange={handleSelectChange}
                label="Interview Type"
              >
                {interviewTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.interviewType && (
                <Typography color="error" variant="caption">
                  {formErrors.interviewType}
                </Typography>
              )}
            </FormControl>
          </Grid>
        </Grid>

        {/* Technical Skills Section */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }} color="primary">
          Technical Skills Assessment
        </Typography>
        <Grid container spacing={3}>
          {evaluationSections.technicalSkills.map((skill) => (
            <Grid item xs={12} sm={6} key={skill.id}>
              <Box id={`skills.${skill.id}`}>
                <Typography variant="body2" gutterBottom>
                  {skill.label} {skill.required && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <Rating
                  name={`skills.${skill.id}`}
                  value={evaluation.skills[skill.id as keyof typeof evaluation.skills]}
                  onChange={(_, value) => handleSkillRatingChange(skill.id, value)}
                  precision={1}
                  max={5}
                />
                {formErrors[`skills.${skill.id}`] && (
                  <Typography color="error" variant="caption" display="block">
                    {formErrors[`skills.${skill.id}`]}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Soft Skills Section */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }} color="primary">
          Soft Skills Assessment
        </Typography>
        <Grid container spacing={3}>
          {evaluationSections.softSkills.map((skill) => (
            <Grid item xs={12} sm={6} key={skill.id}>
              <Box id={`skills.${skill.id}`}>
                <Typography variant="body2" gutterBottom>
                  {skill.label} {skill.required && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <Rating
                  name={`skills.${skill.id}`}
                  value={evaluation.skills[skill.id as keyof typeof evaluation.skills]}
                  onChange={(_, value) => handleSkillRatingChange(skill.id, value)}
                  precision={1}
                  max={5}
                />
                {formErrors[`skills.${skill.id}`] && (
                  <Typography color="error" variant="caption" display="block">
                    {formErrors[`skills.${skill.id}`]}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Cultural Fit Section */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }} color="primary">
          Cultural Fit Assessment
        </Typography>
        <Grid container spacing={3}>
          {evaluationSections.culturalFit.map((skill) => (
            <Grid item xs={12} sm={6} key={skill.id}>
              <Box id={`skills.${skill.id}`}>
                <Typography variant="body2" gutterBottom>
                  {skill.label} {skill.required && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <Rating
                  name={`skills.${skill.id}`}
                  value={evaluation.skills[skill.id as keyof typeof evaluation.skills]}
                  onChange={(_, value) => handleSkillRatingChange(skill.id, value)}
                  precision={1}
                  max={5}
                />
                {formErrors[`skills.${skill.id}`] && (
                  <Typography color="error" variant="caption" display="block">
                    {formErrors[`skills.${skill.id}`]}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Overall Evaluation */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }} color="primary">
          Overall Candidate Scores
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2">Technical Skills: {weights.technicalSkills}%</Typography>
            <Slider
              value={weights.technicalSkills}
              onChange={(_, value) => handleWeightChange('technicalSkills', value as number)}
              min={0}
              max={100}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2">Soft Skills: {weights.softSkills}%</Typography>
            <Slider
              value={weights.softSkills}
              onChange={(_, value) => handleWeightChange('softSkills', value as number)}
              min={0}
              max={100}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2">Cultural Fit: {weights.culturalFit}%</Typography>
            <Slider
              value={weights.culturalFit}
              onChange={(_, value) => handleWeightChange('culturalFit', value as number)}
              min={0}
              max={100}
            />
          </Grid>
        </Grid>

        {/* Score Details */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Typography variant="subtitle2">Technical Skills Score</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="h5" sx={{ mr: 1 }}>
                {scores.technical.toFixed(1)}
              </Typography>
              <Rating value={scores.technical} precision={0.1} readOnly />
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="subtitle2">Soft Skills Score</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="h5" sx={{ mr: 1 }}>
                {scores.soft.toFixed(1)}
              </Typography>
              <Rating value={scores.soft} precision={0.1} readOnly />
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="subtitle2">Cultural Fit Score</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="h5" sx={{ mr: 1 }}>
                {scores.cultural.toFixed(1)}
              </Typography>
              <Rating value={scores.cultural} precision={0.1} readOnly />
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="subtitle2">Weighted Overall Score</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="h5" sx={{ mr: 1 }}>
                {scores.weighted.toFixed(1)}
              </Typography>
              <Rating value={scores.weighted} precision={0.1} readOnly />
            </Box>
          </Grid>
        </Grid>

        {/* Overall Assessment Section */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }} color="primary">
          Overall Assessment
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }} id="overallRating">
              <Typography variant="body2" gutterBottom>
                Overall Rating <span style={{ color: 'red' }}>*</span>
              </Typography>
              <Rating
                name="overallRating"
                value={evaluation.overallRating}
                onChange={(_, value) => handleRatingChange('overallRating', value)}
                precision={1}
                max={5}
                size="large"
                emptyIcon={<StarBorderIcon fontSize="inherit" />}
              />
              {formErrors.overallRating && (
                <Typography color="error" variant="caption" display="block">
                  {formErrors.overallRating}
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="strengths"
              name="strengths"
              label="Strengths"
              multiline
              rows={3}
              fullWidth
              value={evaluation.strengths}
              onChange={handleChange}
              required
              error={!!formErrors.strengths}
              helperText={formErrors.strengths}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="areas_for_improvement"
              name="areas_for_improvement"
              label="Areas for Improvement"
              multiline
              rows={3}
              fullWidth
              value={evaluation.areas_for_improvement}
              onChange={handleChange}
              required
              error={!!formErrors.areas_for_improvement}
              helperText={formErrors.areas_for_improvement}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="notes"
              name="notes"
              label="Additional Notes"
              multiline
              rows={2}
              fullWidth
              value={evaluation.notes}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth error={!!formErrors.recommendation}>
              <FormLabel id="recommendation-label">
                Recommendation <span style={{ color: 'red' }}>*</span>
              </FormLabel>
              <RadioGroup
                aria-labelledby="recommendation-label"
                name="recommendation"
                value={evaluation.recommendation}
                onChange={handleChange}
                row
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
              {formErrors.recommendation && (
                <Typography color="error" variant="caption">
                  {formErrors.recommendation}
                </Typography>
              )}
            </FormControl>
          </Grid>
        </Grid>

        {/* Form Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => navigate(`/candidates/${candidateId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" startIcon={<SendIcon />}>
            Submit Evaluation
          </Button>
        </Box>
      </Box>

      {/* Previous Evaluations Dialog */}
      <Dialog
        open={showPrevEvaluations}
        onClose={() => setShowPrevEvaluations(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Previous Evaluations</DialogTitle>
        <DialogContent dividers>
          {prevEvaluations.length > 0 ? (
            <Stack spacing={2}>
              {prevEvaluations.map((evaluation) => {
                const interviewer = interviewers.find((i) => i.id === evaluation.interviewerId);
                return (
                  <Card key={evaluation.id} variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1">
                            {evaluation.interviewType} ({evaluation.date})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Interviewer: {interviewer ? interviewer.name : 'Unknown'} (
                            {interviewer ? interviewer.role : ''})
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Rating value={evaluation.overallRating} readOnly size="small" />
                          <Chip
                            label={evaluation.recommendation}
                            size="small"
                            color={
                              evaluation.recommendation.includes('Strong Hire')
                                ? 'success'
                                : evaluation.recommendation.includes('Hire')
                                  ? 'primary'
                                  : evaluation.recommendation.includes('Neutral')
                                    ? 'default'
                                    : 'error'
                            }
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2">Strengths</Typography>
                      <Typography variant="body2" paragraph>
                        {evaluation.strengths}
                      </Typography>

                      <Typography variant="subtitle2">Areas for Improvement</Typography>
                      <Typography variant="body2" paragraph>
                        {evaluation.areas_for_improvement}
                      </Typography>

                      {evaluation.notes && (
                        <>
                          <Typography variant="subtitle2">Additional Notes</Typography>
                          <Typography variant="body2" paragraph>
                            {evaluation.notes}
                          </Typography>
                        </>
                      )}

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2">Skills Assessment</Typography>
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        {Object.entries(evaluation.skills)
                          .filter(([_, value]) => value > 0)
                          .map(([key, value]) => {
                            let label = key;
                            // Find the label for this skill
                            for (const section of Object.values(evaluationSections)) {
                              const found = section.find((s) => s.id === key);
                              if (found) {
                                label = found.label;
                                break;
                              }
                            }
                            return (
                              <Grid item xs={6} sm={4} key={key}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <Typography variant="body2">{label}:</Typography>
                                  <Rating value={value as number} readOnly size="small" />
                                </Box>
                              </Grid>
                            );
                          })}
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Typography>No previous evaluations found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPrevEvaluations(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CandidateEvaluation;
