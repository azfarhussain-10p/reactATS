import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Chip,
  Stack,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  BarChart as BarChartIcon,
  TimelineOutlined as TimelineIcon,
  BubbleChart as BubbleChartIcon,
  TrendingUp as TrendingUpIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { useAdvancedAnalytics } from '../contexts/AdvancedAnalyticsContext';
import { useAnalytics } from '../contexts/AnalyticsContext';

const mockCandidateData = {
  id: 'c-12345',
  name: 'Alex Johnson',
  education: "Master's in Computer Science",
  years_experience: 6,
  skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
  previous_roles: ['Senior Frontend Developer', 'Web Developer'],
  interview_score: 8.5,
  technical_assessment: 92,
  culture_fit: 'Strong',
  location: 'Remote',
  desired_salary: 120000,
};

const mockJobData = {
  id: 'j-7890',
  title: 'Senior Full Stack Developer',
  department: 'Engineering',
  team_size: 8,
  required_skills: ['React', 'Node.js', 'AWS', 'MongoDB'],
  education_requirement: "Bachelor's in Computer Science or related field",
  experience_requirement: 5,
  location: 'Remote',
  salary_range: [110000, 135000],
};

const PredictiveAnalytics: React.FC = () => {
  const theme = useTheme();
  const {
    predictiveModels,
    createPredictiveModel,
    trainModel,
    predictOutcome,
    visualizations,
    createVisualization,
    runCorrelationAnalysis,
    runTrendAnalysis,
    runSegmentAnalysis,
    correlations,
    trends,
    segments,
  } = useAdvancedAnalytics();

  const [activeTab, setActiveTab] = useState<'models' | 'visualizations' | 'analysis'>('models');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predictionInput, setPredictionInput] = useState<'candidate' | 'job'>('candidate');

  // For correlation analysis
  const [correlationFactors, setCorrelationFactors] = useState({
    factorA: 'years_experience',
    factorB: 'time_to_hire',
  });
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  useEffect(() => {
    if (predictiveModels.length > 0 && !selectedModelId) {
      setSelectedModelId(predictiveModels[0].id);
    }
  }, [predictiveModels, selectedModelId]);

  const selectedModel = selectedModelId
    ? predictiveModels.find((model) => model.id === selectedModelId)
    : null;

  const handleModelSelection = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedModelId(event.target.value as string);
    setPredictionResult(null);
  };

  const handleTrainModel = async () => {
    if (!selectedModelId) return;

    setIsTraining(true);
    try {
      await trainModel(selectedModelId);
    } catch (error) {
      console.error('Error training model:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const handlePredictOutcome = async () => {
    if (!selectedModelId) return;

    setIsPredicting(true);
    setPredictionResult(null);

    try {
      const data = predictionInput === 'candidate' ? mockCandidateData : mockJobData;
      const result = await predictOutcome(selectedModelId, data);
      setPredictionResult(result);
    } catch (error) {
      console.error('Error predicting outcome:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleRunCorrelation = async () => {
    setIsRunningAnalysis(true);
    try {
      await runCorrelationAnalysis(correlationFactors.factorA, correlationFactors.factorB);
    } catch (error) {
      console.error('Error running correlation analysis:', error);
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  const renderPredictionResult = () => {
    if (!predictionResult) return null;

    if (selectedModel?.type === 'hiring-success') {
      const { probability, confidence } = predictionResult;
      return (
        <Card sx={{ mt: 3, bgcolor: probability > 0.7 ? '#e8f5e9' : '#ffebee' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Hiring Success Prediction
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Probability of successful hire: <strong>{(probability * 100).toFixed(1)}%</strong>
              </Typography>
              <LinearProgress
                variant="determinate"
                value={probability * 100}
                color={probability > 0.7 ? 'success' : 'error'}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Confidence Score: {(confidence * 100).toFixed(1)}%
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              {probability > 0.7
                ? 'This candidate has a high probability of being a successful hire.'
                : 'This candidate may not be the best fit for this position.'}
            </Typography>
          </CardContent>
        </Card>
      );
    } else if (selectedModel?.type === 'time-to-hire') {
      const { days, rangeMin, rangeMax } = predictionResult;
      return (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Time-to-Hire Prediction
            </Typography>
            <Typography variant="h3" align="center" gutterBottom>
              {days} days
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Estimated range: {rangeMin}-{rangeMax} days
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Based on historical data and the attributes of this position, we estimate it will take
              approximately {days} days to fill.
            </Typography>
          </CardContent>
        </Card>
      );
    } else if (selectedModel?.type === 'candidate-quality') {
      const { score, topSkills } = predictionResult;
      return (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Candidate Quality Prediction
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  m: 2,
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={score * 10}
                  size={100}
                  thickness={5}
                  color={score > 7 ? 'success' : score > 5 ? 'info' : 'error'}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" component="div" color="text.secondary">
                    {score.toFixed(1)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Top Skills Match:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {topSkills.map((skill: string, index: number) => (
                  <Chip
                    key={index}
                    label={skill}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Prediction Result
          </Typography>
          <pre style={{ overflow: 'auto' }}>{JSON.stringify(predictionResult, null, 2)}</pre>
        </CardContent>
      </Card>
    );
  };

  const renderModelsSection = () => (
    <Grid container spacing={3}>
      {/* Left panel - Model selection and management */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Predictive Models
          </Typography>
          <FormControl fullWidth sx={{ mb: 3, mt: 2 }}>
            <InputLabel id="model-select-label">Select Model</InputLabel>
            <Select
              labelId="model-select-label"
              value={selectedModelId || ''}
              label="Select Model"
              onChange={handleModelSelection}
              disabled={predictiveModels.length === 0}
            >
              {predictiveModels.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedModel && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Model Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Type"
                    secondary={selectedModel.type
                      .replace('-', ' ')
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Accuracy"
                    secondary={`${(selectedModel.accuracy * 100).toFixed(1)}%`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Trained"
                    secondary={new Date(selectedModel.lastTrainedAt).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Description" secondary={selectedModel.description} />
                </ListItem>
              </List>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleTrainModel}
                  disabled={isTraining}
                  startIcon={isTraining ? <CircularProgress size={20} /> : <ScienceIcon />}
                  fullWidth
                >
                  {isTraining ? 'Training...' : 'Retrain Model'}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Grid>

      {/* Right panel - Prediction interface */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Prediction
          </Typography>

          {selectedModel ? (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Use this model to predict outcomes for new data.
                </Typography>

                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select input data:
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant={predictionInput === 'candidate' ? 'contained' : 'outlined'}
                      onClick={() => setPredictionInput('candidate')}
                    >
                      Candidate Data
                    </Button>
                    <Button
                      variant={predictionInput === 'job' ? 'contained' : 'outlined'}
                      onClick={() => setPredictionInput('job')}
                    >
                      Job Data
                    </Button>
                  </Stack>
                </FormControl>

                <Box
                  sx={{
                    maxHeight: 200,
                    overflow: 'auto',
                    bgcolor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    mb: 3,
                  }}
                >
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify(
                      predictionInput === 'candidate' ? mockCandidateData : mockJobData,
                      null,
                      2
                    )}
                  </pre>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePredictOutcome}
                  disabled={isPredicting}
                  startIcon={isPredicting ? <CircularProgress size={20} /> : null}
                >
                  {isPredicting ? 'Processing...' : 'Run Prediction'}
                </Button>
              </Box>

              {/* Display prediction results */}
              {renderPredictionResult()}
            </>
          ) : (
            <Alert severity="info">Please select a model from the list to make predictions.</Alert>
          )}
        </Paper>
      </Grid>
    </Grid>
  );

  const renderVisualizationsSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant="h6">Advanced Visualizations</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                createVisualization({
                  name: 'New Network Visualization',
                  type: 'network',
                  config: {
                    nodeSize: 'value',
                    edgeWidth: 'strength',
                    colorBy: 'group',
                  },
                  dataSource: 'skills_relationships',
                });
              }}
            >
              Create New
            </Button>
          </Box>

          <Grid container spacing={3}>
            {visualizations.map((viz) => (
              <Grid item xs={12} md={6} key={viz.id}>
                <Card>
                  <CardHeader
                    title={viz.name}
                    subheader={`Type: ${viz.type.charAt(0).toUpperCase() + viz.type.slice(1)}`}
                    action={
                      <IconButton aria-label="settings">
                        <EditIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Box
                      sx={{
                        height: 200,
                        bgcolor: 'grey.100',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 1,
                      }}
                    >
                      {viz.type === 'network' && (
                        <BubbleChartIcon sx={{ fontSize: 80, color: 'primary.light' }} />
                      )}
                      {viz.type === 'sankey' && (
                        <TimelineIcon sx={{ fontSize: 80, color: 'secondary.light' }} />
                      )}
                      {viz.type === 'heatmap' && (
                        <BarChartIcon sx={{ fontSize: 80, color: 'error.light' }} />
                      )}
                      {viz.type === 'scatter' && (
                        <TrendingUpIcon sx={{ fontSize: 80, color: 'success.light' }} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Data source: {viz.dataSource}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button size="small" startIcon={<DownloadIcon />}>
                        Export
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderDataAnalysisSection = () => (
    <Grid container spacing={3}>
      {/* Correlation Analysis */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Correlation Analysis
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Factor A</InputLabel>
            <Select
              value={correlationFactors.factorA}
              label="Factor A"
              onChange={(e) =>
                setCorrelationFactors({
                  ...correlationFactors,
                  factorA: e.target.value as string,
                })
              }
            >
              <MenuItem value="years_experience">Years of Experience</MenuItem>
              <MenuItem value="education_level">Education Level</MenuItem>
              <MenuItem value="technical_score">Technical Score</MenuItem>
              <MenuItem value="interview_score">Interview Score</MenuItem>
              <MenuItem value="time_to_hire">Time to Hire</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Factor B</InputLabel>
            <Select
              value={correlationFactors.factorB}
              label="Factor B"
              onChange={(e) =>
                setCorrelationFactors({
                  ...correlationFactors,
                  factorB: e.target.value as string,
                })
              }
            >
              <MenuItem value="performance_rating">Performance Rating</MenuItem>
              <MenuItem value="retention_months">Retention (Months)</MenuItem>
              <MenuItem value="promotion_speed">Promotion Speed</MenuItem>
              <MenuItem value="time_to_hire">Time to Hire</MenuItem>
              <MenuItem value="salary">Salary</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleRunCorrelation}
            disabled={isRunningAnalysis}
            startIcon={isRunningAnalysis ? <CircularProgress size={20} /> : null}
          >
            {isRunningAnalysis ? 'Analyzing...' : 'Run Analysis'}
          </Button>

          {/* Results */}
          {correlations.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Recent Results
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Factors</TableCell>
                      <TableCell align="right">Coefficient</TableCell>
                      <TableCell align="right">Significance</TableCell>
                      <TableCell align="right">Sample Size</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {correlations.slice(0, 5).map((corr) => (
                      <TableRow key={corr.id}>
                        <TableCell>
                          {corr.factorA} vs {corr.factorB}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={corr.coefficient.toFixed(3)}
                            color={Math.abs(corr.coefficient) > 0.5 ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{corr.significance.toFixed(3)}</TableCell>
                        <TableCell align="right">{corr.sampleSize}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Trend Analysis */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Trend Analysis
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FormControl sx={{ mr: 2, flexGrow: 1 }}>
              <InputLabel>Metric</InputLabel>
              <Select value="time_to_hire" label="Metric">
                <MenuItem value="time_to_hire">Time to Hire</MenuItem>
                <MenuItem value="cost_per_hire">Cost per Hire</MenuItem>
                <MenuItem value="quality_of_hire">Quality of Hire</MenuItem>
                <MenuItem value="retention_rate">Retention Rate</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: 120 }}>
              <InputLabel>Period</InputLabel>
              <Select value="monthly" label="Period">
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>

            <Button
              sx={{ ml: 2 }}
              variant="contained"
              onClick={() => runTrendAnalysis('time_to_hire', 'monthly')}
            >
              Analyze
            </Button>
          </Box>

          {/* Results */}
          {trends.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  height: 200,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                }}
              >
                <TimelineIcon sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
                <Typography variant="body2">
                  Trend chart would render here in a real application
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Latest Analysis: {trends[0].name}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Growth Rate
                      </Typography>
                      <Typography variant="h6">
                        {(trends[0].growthRate * 100).toFixed(1)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Data Points
                      </Typography>
                      <Typography variant="h6">{trends[0].data.length}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Segment Analysis */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant="h6">Segment Analysis</Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => runSegmentAnalysis('department')}
            >
              Run New Analysis
            </Button>
          </Box>

          {segments.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Segment</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Avg. Time to Hire</TableCell>
                    <TableCell align="right">Conversion Rate</TableCell>
                    <TableCell align="right">Offer Acceptance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {segments[0].segments.map((segment) => (
                    <TableRow key={segment.name}>
                      <TableCell>{segment.name}</TableCell>
                      <TableCell align="right">{segment.count}</TableCell>
                      <TableCell align="right">{segment.metrics.avg_time_to_hire} days</TableCell>
                      <TableCell align="right">
                        {(segment.metrics.conversion_rate * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        {(segment.metrics.offer_acceptance * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No segment analysis data available. Run a new analysis to see results.
            </Alert>
          )}
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Predictive Analytics & Machine Learning
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Use AI models to predict hiring outcomes, analyze trends, and gain insights from your
          recruitment data.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant={activeTab === 'models' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('models')}
            startIcon={<ScienceIcon />}
          >
            Predictive Models
          </Button>
          <Button
            variant={activeTab === 'visualizations' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('visualizations')}
            startIcon={<BubbleChartIcon />}
          >
            Advanced Visualizations
          </Button>
          <Button
            variant={activeTab === 'analysis' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('analysis')}
            startIcon={<TimelineIcon />}
          >
            Data Analysis
          </Button>
        </Stack>
      </Box>

      {activeTab === 'models' && renderModelsSection()}
      {activeTab === 'visualizations' && renderVisualizationsSection()}
      {activeTab === 'analysis' && renderDataAnalysisSection()}
    </Box>
  );
};

export default PredictiveAnalytics;
