import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Button,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  CircularProgress,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Tooltip,
  Alert,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  Info as InfoIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Code as CodeIcon,
  Assignment as AssignmentIcon,
  Compare as CompareIcon,
  FilterList as FilterListIcon,
  Settings as SettingsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useResumeParsing } from '../contexts/ResumeParsingContext';
import { useCandidateContext } from '../contexts/CandidateContext';
import { Candidate } from '../models/types';

const CandidateRanking = () => {
  const navigate = useNavigate();
  const { candidates } = useCandidateContext();
  const {
    rankCandidates,
    getTopSkillGaps,
    getAverageScores,
    getQualificationRate,
    getDuplicateCandidates,
    calculateCandidateFit,
  } = useResumeParsing();

  // State for selected job and candidates
  const [selectedJobId, setSelectedJobId] = useState<number>(1); // Default to job ID 1
  const [rankedCandidates, setRankedCandidates] = useState<
    Array<{
      candidateId: number;
      score: number;
      ranking: number;
      candidate?: Candidate;
      details?: any;
    }>
  >([]);

  // State for ranking weights
  const [rankingWeights, setRankingWeights] = useState({
    skillsWeight: 0.4,
    experienceWeight: 0.3,
    educationWeight: 0.2,
    questionnaireWeight: 0.1,
  });

  // State for metrics and insights
  const [topSkillGaps, setTopSkillGaps] = useState<string[]>([]);
  const [averageScores, setAverageScores] = useState<{
    overallAvg: number;
    skillsAvg: number;
    experienceAvg: number;
    educationAvg: number;
  }>({
    overallAvg: 0,
    skillsAvg: 0,
    experienceAvg: 0,
    educationAvg: 0,
  });
  const [qualificationRate, setQualificationRate] = useState(0);
  const [duplicates, setDuplicates] = useState<
    {
      candidateId: number;
      duplicateIds: number[];
      similarity: number;
    }[]
  >([]);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Filter states
  const [minScore, setMinScore] = useState(0);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [requiredSkillFilter, setRequiredSkillFilter] = useState('');
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);

  // Selected candidate for details
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [candidateDetails, setCandidateDetails] = useState<any>(null);

  // Job options - in a real app, these would come from an API or context
  const jobOptions = [
    { id: 1, title: 'Senior Frontend Developer' },
    { id: 2, title: 'UX Designer' },
    { id: 3, title: 'Full Stack Developer' },
  ];

  // Effect to load ranking when job changes
  useEffect(() => {
    if (selectedJobId) {
      loadRanking();
    }
  }, [selectedJobId, rankingWeights]);

  // Load candidate details when selected
  useEffect(() => {
    if (selectedCandidateId) {
      loadCandidateDetails(selectedCandidateId);
    } else {
      setCandidateDetails(null);
    }
  }, [selectedCandidateId]);

  // Load candidate ranking
  const loadRanking = async () => {
    setLoading(true);
    try {
      // Load job metrics and insights
      setTopSkillGaps(getTopSkillGaps(selectedJobId));
      setAverageScores(getAverageScores(selectedJobId));
      setQualificationRate(getQualificationRate(selectedJobId));
      setDuplicates(getDuplicateCandidates());

      // Get ranked candidates
      const ranked = await rankCandidates(selectedJobId, rankingWeights);

      // Enrich with candidate data
      const enrichedRanking = ranked.map((rank) => {
        const candidate = candidates.find((c) => c.id === rank.candidateId);
        return {
          ...rank,
          candidate,
        };
      });

      setRankedCandidates(enrichedRanking);
    } catch (error) {
      console.error('Error loading candidate ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load candidate details including fit calculation
  const loadCandidateDetails = async (candidateId: number) => {
    try {
      const details = await calculateCandidateFit(candidateId, selectedJobId);
      setCandidateDetails(details);
    } catch (error) {
      console.error('Error loading candidate details:', error);
      setCandidateDetails(null);
    }
  };

  // Handle weight changes
  const handleWeightChange =
    (name: keyof typeof rankingWeights) => (event: any, newValue: number | number[]) => {
      setRankingWeights((prev) => ({
        ...prev,
        [name]: typeof newValue === 'number' ? newValue : newValue[0],
      }));
    };

  // Get filtered candidates
  const getFilteredCandidates = () => {
    let filtered = [...rankedCandidates];

    // Apply minimum score filter
    if (minScore > 0) {
      filtered = filtered.filter((c) => c.score >= minScore / 100);
    }

    // Apply flagged only filter
    if (flaggedOnly && candidateDetails) {
      filtered = filtered.filter((c) => {
        // This would need proper implementation based on your data structure
        const hasFlags = c.details?.flags?.length > 0;
        return hasFlags;
      });
    }

    // Apply required skill filter
    if (requiredSkillFilter) {
      filtered = filtered.filter((c) => {
        // This would need proper implementation based on your data structure
        const candidateSkills =
          c.candidate?.professionalInfo.skills.map((s) => s.name.toLowerCase()) || [];
        return candidateSkills.includes(requiredSkillFilter.toLowerCase());
      });
    }

    // Apply duplicates only filter
    if (showDuplicatesOnly) {
      const duplicateCandidateIds = new Set<number>();
      duplicates.forEach((d) => {
        duplicateCandidateIds.add(d.candidateId);
        d.duplicateIds.forEach((id) => duplicateCandidateIds.add(id));
      });

      filtered = filtered.filter((c) => duplicateCandidateIds.has(c.candidateId));
    }

    return filtered;
  };

  // Check if a candidate has duplicates
  const hasDuplicates = (candidateId: number) => {
    return duplicates.some(
      (d) => d.candidateId === candidateId || d.duplicateIds.includes(candidateId)
    );
  };

  // Format percentage for display
  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  // Render star rating based on score
  const renderStarRating = (score: number) => {
    const fullStars = Math.floor(score * 5);
    const hasHalfStar = score * 5 - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} sx={{ color: 'primary.main' }} />
        ))}
        {hasHalfStar && <StarHalfIcon sx={{ color: 'primary.main' }} />}
        {[...Array(emptyStars)].map((_, i) => (
          <StarBorderIcon key={`empty-${i}`} sx={{ color: 'text.secondary' }} />
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI-Powered Candidate Ranking
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ranking Configuration
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Job</InputLabel>
              <Select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(Number(e.target.value))}
                label="Select Job"
              >
                {jobOptions.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" gutterBottom>
              Ranking Weights
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption">
                  Skills: {Math.round(rankingWeights.skillsWeight * 100)}%
                </Typography>
                <Slider
                  value={rankingWeights.skillsWeight}
                  onChange={handleWeightChange('skillsWeight')}
                  min={0}
                  max={1}
                  step={0.05}
                  aria-labelledby="skills-weight-slider"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption">
                  Experience: {Math.round(rankingWeights.experienceWeight * 100)}%
                </Typography>
                <Slider
                  value={rankingWeights.experienceWeight}
                  onChange={handleWeightChange('experienceWeight')}
                  min={0}
                  max={1}
                  step={0.05}
                  aria-labelledby="experience-weight-slider"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption">
                  Education: {Math.round(rankingWeights.educationWeight * 100)}%
                </Typography>
                <Slider
                  value={rankingWeights.educationWeight}
                  onChange={handleWeightChange('educationWeight')}
                  min={0}
                  max={1}
                  step={0.05}
                  aria-labelledby="education-weight-slider"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption">
                  Questionnaire: {Math.round(rankingWeights.questionnaireWeight * 100)}%
                </Typography>
                <Slider
                  value={rankingWeights.questionnaireWeight}
                  onChange={handleWeightChange('questionnaireWeight')}
                  min={0}
                  max={1}
                  step={0.05}
                  aria-labelledby="questionnaire-weight-slider"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">Ranked Candidates</Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tooltip title="Filter Candidates">
                  <IconButton size="small">
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>

                <FormControlLabel
                  control={
                    <Switch
                      checked={showDuplicatesOnly}
                      onChange={(e) => setShowDuplicatesOnly(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Duplicates"
                  sx={{ ml: 1 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={flaggedOnly}
                      onChange={(e) => setFlaggedOnly(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Flagged"
                  sx={{ ml: 1 }}
                />
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Candidate</TableCell>
                      <TableCell>Match Score</TableCell>
                      <TableCell>Flags</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredCandidates().map((candidate) => (
                      <TableRow
                        key={candidate.candidateId}
                        sx={{
                          cursor: 'pointer',
                          bgcolor:
                            selectedCandidateId === candidate.candidateId
                              ? 'action.selected'
                              : 'inherit',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => setSelectedCandidateId(candidate.candidateId)}
                      >
                        <TableCell>
                          <Chip
                            label={`#${candidate.ranking}`}
                            color={
                              candidate.ranking <= 3
                                ? 'success'
                                : candidate.ranking <= 10
                                  ? 'primary'
                                  : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {candidate.candidate?.personalInfo.firstName.charAt(0)}
                              {candidate.candidate?.personalInfo.lastName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {candidate.candidate?.personalInfo.firstName}{' '}
                                {candidate.candidate?.personalInfo.lastName}
                                {hasDuplicates(candidate.candidateId) && (
                                  <Tooltip title="Potential duplicate candidate">
                                    <CompareIcon
                                      fontSize="small"
                                      color="warning"
                                      sx={{ ml: 1, verticalAlign: 'middle' }}
                                    />
                                  </Tooltip>
                                )}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {candidate.candidate?.professionalInfo.title}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={candidate.score * 100}
                              sx={{ width: 100 }}
                              color={
                                candidate.score >= 0.8
                                  ? 'success'
                                  : candidate.score >= 0.6
                                    ? 'primary'
                                    : candidate.score >= 0.4
                                      ? 'warning'
                                      : 'error'
                              }
                            />
                            <Typography variant="body2">
                              {formatPercentage(candidate.score)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {candidate.details?.flags?.length > 0 ? (
                            <Chip
                              icon={<FlagIcon />}
                              label={candidate.details.flags.length}
                              size="small"
                              color="warning"
                            />
                          ) : (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="None"
                              size="small"
                              color="success"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/candidates/${candidate.candidateId}`);
                            }}
                          >
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {getFilteredCandidates().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Alert severity="info">No candidates match the current filters</Alert>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {selectedCandidateId && candidateDetails ? (
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">Candidate Fit Analysis</Typography>
                    {renderStarRating(candidateDetails.overallFit)}
                  </Box>
                }
                subheader={`Overall Match: ${formatPercentage(candidateDetails.overallFit)}`}
              />
              <Divider />
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Match Breakdown
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">Skills Match</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Typography variant="body2" fontWeight="bold">
                        {formatPercentage(candidateDetails.breakdown.skills)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={candidateDetails.breakdown.skills * 100}
                      color="primary"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WorkIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body2">Experience Match</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Typography variant="body2" fontWeight="bold">
                        {formatPercentage(candidateDetails.breakdown.experience)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={candidateDetails.breakdown.experience * 100}
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SchoolIcon sx={{ mr: 1, color: 'info.main' }} />
                      <Typography variant="body2">Education Match</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Typography variant="body2" fontWeight="bold">
                        {formatPercentage(candidateDetails.breakdown.education)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={candidateDetails.breakdown.education * 100}
                      color="info"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Grid>

                  {candidateDetails.breakdown.questionnaire !== null && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AssignmentIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography variant="body2">Questionnaire</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="body2" fontWeight="bold">
                          {formatPercentage(candidateDetails.breakdown.questionnaire)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={candidateDetails.breakdown.questionnaire * 100}
                        color="secondary"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Grid>
                  )}
                </Grid>

                {candidateDetails.flags.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                      Potential Issues
                    </Typography>

                    <Stack spacing={1}>
                      {candidateDetails.flags.map((flag: string, index: number) => (
                        <Alert key={index} severity="warning" icon={<FlagIcon />}>
                          {flag}
                        </Alert>
                      ))}
                    </Stack>
                  </>
                )}

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/candidates/${selectedCandidateId}`)}
                  >
                    View Full Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card sx={{ mb: 3 }}>
                <CardHeader title="Job Insights" />
                <Divider />
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Qualification Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={qualificationRate * 100}
                      size={60}
                      thickness={5}
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h5">{formatPercentage(qualificationRate)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        of candidates meet requirements
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Average Scores
                  </Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Overall
                      </Typography>
                      <Typography variant="body2">
                        {formatPercentage(averageScores.overallAvg)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Skills
                      </Typography>
                      <Typography variant="body2">
                        {formatPercentage(averageScores.skillsAvg)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Experience
                      </Typography>
                      <Typography variant="body2">
                        {formatPercentage(averageScores.experienceAvg)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Education
                      </Typography>
                      <Typography variant="body2">
                        {formatPercentage(averageScores.educationAvg)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle2" gutterBottom>
                    Top Skill Gaps
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {topSkillGaps.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" sx={{ mb: 1 }} />
                    ))}
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  title="Duplicate Candidates"
                  subheader={`${duplicates.length} potential duplicates found`}
                />
                <Divider />
                <CardContent>
                  {duplicates.length > 0 ? (
                    <Stack spacing={2}>
                      {duplicates.map((dup, index) => (
                        <Alert key={index} severity="warning" icon={<CompareIcon />}>
                          <Typography variant="body2">
                            Candidate #{dup.candidateId} may be a duplicate of{' '}
                            {dup.duplicateIds.join(', ')}
                          </Typography>
                          <Typography variant="caption">
                            Similarity: {formatPercentage(dup.similarity)}
                          </Typography>
                        </Alert>
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="success" icon={<CheckCircleIcon />}>
                      No duplicate candidates detected
                    </Alert>
                  )}

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={duplicates.length === 0}
                    onClick={() => setShowDuplicatesOnly(true)}
                  >
                    Review Duplicates
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CandidateRanking;
