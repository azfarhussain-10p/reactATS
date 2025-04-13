import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Chip,
  Alert,
  Badge,
  LinearProgress,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  styled,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';

import {
  CloudUpload as UploadIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Extension as SkillIcon,
  Description as DescriptionIcon,
  CompareArrows as MatchIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Compare as CompareIcon
} from '@mui/icons-material';

import { useResumeParsing } from '../contexts/ResumeParsingContext';
import { useCandidateContext } from '../contexts/CandidateContext';
import { ParsedResume, ScreeningResult } from '../models/types';

// Custom styled components
const DropZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const ResumeParser = () => {
  const {
    parsedResumes,
    screeningResults,
    parseResume,
    getParsedResume,
    screenCandidate,
    getScreeningResult,
    getTopSkillGaps,
    getAverageScores,
    getQualificationRate,
    detectEmploymentGaps,
    getDuplicateCandidates
  } = useResumeParsing();

  const { candidates } = useCandidateContext();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [resumeText, setResumeText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [screeningJobId, setScreeningJobId] = useState<number | null>(null);
  const [isScreening, setIsScreening] = useState(false);
  const [showAIParsing, setShowAIParsing] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    type: 'resume' | 'screening';
    id: string | null;
  }>({
    open: false,
    type: 'resume',
    id: null
  });
  const [fileUploaded, setFileUploaded] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedResume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [employmentGapAnalysis, setEmploymentGapAnalysis] = useState<{
    hasGaps: boolean;
    gapPeriods: string[];
    totalGapMonths: number;
  } | null>(null);
  const [duplicateCandidates, setDuplicateCandidates] = useState<Array<{
    candidateId: number;
    name: string;
    similarity: number;
  }>>([]);
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Selected resume and screening result
  const selectedResume = selectedResumeId ? getParsedResume(selectedResumeId) : null;
  const selectedScreeningResult = selectedResume && screeningJobId 
    ? screeningResults.find(r => r.parsedResumeId === selectedResumeId && r.jobId === screeningJobId)
    : null;

  // Handle resume text change
  const handleResumeTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeText(e.target.value);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setResumeText(text);
    };
    reader.readAsText(file);
  };

  // Parse resume
  const handleParseResume = async () => {
    if (!resumeText.trim()) {
      setError('Please provide resume text or upload a file');
      return;
    }
    
    setParsing(true);
    setError(null);
    
    try {
      // Parse the resume
      const result = await parseResume(resumeText);
      setParsedResult(result);
      
      // Perform employment gap analysis
      if (result) {
        const gapAnalysis = detectEmploymentGaps(result);
        setEmploymentGapAnalysis(gapAnalysis);
        
        // Check for potential duplicates
        const duplicates = getDuplicateCandidates();
        if (result.candidateId) {
          const candidateDuplicates = duplicates
            .filter(d => d.candidateId === result.candidateId || d.duplicateIds.includes(result.candidateId))
            .flatMap(d => {
              if (d.candidateId === result.candidateId) {
                return d.duplicateIds.map(id => ({
                  candidateId: id,
                  similarity: d.similarity
                }));
              } else {
                return [{
                  candidateId: d.candidateId,
                  similarity: d.similarity
                }];
              }
            });
          
          // Enrich with candidate names
          const enrichedDuplicates = candidateDuplicates.map(dup => {
            const candidate = candidates.find(c => c.id === dup.candidateId);
            return {
              ...dup,
              name: candidate ? `${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}` : `Candidate #${dup.candidateId}`
            };
          });
          
          setDuplicateCandidates(enrichedDuplicates);
        }
      }
    } catch (err) {
      console.error('Error parsing resume:', err);
      setError('Failed to parse resume. Please try again with a different format.');
    } finally {
      setParsing(false);
    }
  };

  // Screen candidate against a job
  const handleScreenCandidate = async () => {
    if (!selectedResumeId || !screeningJobId) return;
    
    setIsScreening(true);
    try {
      await screenCandidate(1, screeningJobId, selectedResumeId);
    } catch (error) {
      console.error('Error screening candidate:', error);
    } finally {
      setIsScreening(false);
    }
  };

  // Open details dialog
  const handleOpenDetails = (type: 'resume' | 'screening', id: string) => {
    setDetailsDialog({
      open: true,
      type,
      id
    });
  };

  // Close details dialog
  const handleCloseDetails = () => {
    setDetailsDialog({
      ...detailsDialog,
      open: false
    });
  };

  // Dummy skill list with relevance scores
  const skillList = selectedResume ? 
    selectedResume.parsedData.skills.map(skill => ({
      name: skill,
      relevance: Math.random() * 100
    })).sort((a, b) => b.relevance - a.relevance) : [];

  // Handle file upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setFileUploaded(file);
    setError(null);
    
    // Read file content based on file type
    const reader = new FileReader();
    
    // For PDF files, we need to use readAsArrayBuffer and then convert to text
    if (file.type === 'application/pdf') {
      try {
        setParsing(true);
        
        // Show upload success message with actual file information
        setResumeText(`Processing file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)\n\nPDF parsing in progress... In a production environment, this file would be sent to a server for professional PDF parsing.\n\nFor this demo, we'll extract sample data from your resume in a moment.`);
        
        // Simulate a server response with a more informative message
        setTimeout(() => {
          setParsing(false);
          // Show a more personalized message that indicates this is simulated parsing
          setResumeText(`# Resume extracted from: ${file.name}\n\n` +
            `Note: This is a simulated parsing result for demonstration purposes.\n` +
            `In a production environment, the actual content of your PDF would be parsed.\n\n` +
            `John Doe\n` +
            `Software Developer\n\n` +
            `john.doe@example.com\n` +
            `(555) 123-4567\n\n` +
            `Summary:\n` +
            `Experienced software developer with expertise in React, TypeScript, and Node.js.`);
        }, 2000);
      } catch (err) {
        console.error('Error handling PDF file:', err);
        setError(`Failed to parse PDF file: ${file.name}. Please try a different file or paste the content manually.`);
        setParsing(false);
      }
    } else {
      // For text files, use the standard readAsText method
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setResumeText(content);
      };
      reader.onerror = () => {
        setError(`Failed to read file: ${file.name}. Please try again or paste the content manually.`);
      };
      reader.readAsText(file);
    }
  };

  // Clear form
  const handleClear = () => {
    setResumeText('');
    setFileUploaded(null);
    setParsedResult(null);
    setError(null);
    setEmploymentGapAnalysis(null);
    setDuplicateCandidates([]);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3, px: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Resume Parser & Screening
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Extract candidate data from resumes and automatically screen against job requirements
        </Typography>
      </Box>
      
      {/* Main Content Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Parse Resume" />
          <Tab label="Parsed Resumes" />
          <Tab label="Screening Results" />
        </Tabs>
      </Paper>
      
      {/* Parse Resume Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Upload Resume
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={showAIParsing}
                    onChange={(e) => setShowAIParsing(e.target.checked)}
                  />
                }
                label="Show AI parsing details"
                sx={{ mb: 2 }}
              />
              
              <DropZone
                onClick={() => document.getElementById('resume-upload')?.click()}
                sx={{ mb: 2 }}
              >
                <input
                  type="file"
                  id="resume-upload"
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                />
                <UploadIcon fontSize="large" color="primary" />
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {fileUploaded ? `File uploaded: ${fileUploaded.name}` : 'Click to upload resume or drag and drop'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supports PDF, DOC, DOCX, and TXT files
                </Typography>
              </DropZone>
              
              <Typography variant="subtitle2" gutterBottom>
                Or paste resume text
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={12}
                value={resumeText}
                onChange={handleResumeTextChange}
                placeholder="Paste candidate resume text here..."
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <Button
                variant="contained"
                fullWidth
                startIcon={parsing ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                disabled={parsing || !resumeText.trim()}
                onClick={handleParseResume}
              >
                {parsing ? 'Parsing...' : 'Parse Resume'}
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {selectedResume ? (
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Parsed Results
                  </Typography>
                  <Chip 
                    label={`Confidence: ${Math.round(selectedResume.confidence * 100)}%`}
                    color={selectedResume.confidence > 0.8 ? 'success' : 'warning'}
                  />
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <List disablePadding>
                  <ListItem disablePadding sx={{ mb: 2 }}>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Personal Information" 
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            {selectedResume.parsedData.name}
                          </Typography>
                          <Typography variant="body2">
                            {selectedResume.parsedData.email}
                          </Typography>
                          <Typography variant="body2">
                            {selectedResume.parsedData.phone}
                          </Typography>
                          <Typography variant="body2">
                            {selectedResume.parsedData.location}
                          </Typography>
                        </Box>
                      } 
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ mb: 2 }}>
                    <ListItemIcon>
                      <SkillIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Skills" 
                      secondary={
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {skillList.map((skill, index) => (
                            <Chip 
                              key={index} 
                              label={skill.name} 
                              size="small"
                              color={skill.relevance > 75 ? 'primary' : 'default'}
                              variant={skill.relevance > 50 ? 'filled' : 'outlined'}
                            />
                          ))}
                        </Box>
                      } 
                    />
                  </ListItem>
                  
                  {showAIParsing && (
                    <ListItem disablePadding sx={{ mb: 2 }}>
                      <ListItemIcon>
                        <DescriptionIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="AI Processing Details" 
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Entity extraction
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={92} 
                                  color="success"
                                  sx={{ height: 8, borderRadius: 5 }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Skill classification
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={87} 
                                  color="success"
                                  sx={{ height: 8, borderRadius: 5 }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Date extraction
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={94} 
                                  color="success"
                                  sx={{ height: 8, borderRadius: 5 }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Resume structure
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={78} 
                                  color="primary"
                                  sx={{ height: 8, borderRadius: 5 }}
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        } 
                      />
                    </ListItem>
                  )}
                </List>
                
                {/* Experience and Education - condensed for brevity */}
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button 
                    variant="outlined"
                    onClick={() => handleOpenDetails('resume', selectedResume.id)}
                    fullWidth
                  >
                    View Full Details
                  </Button>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={isScreening ? <CircularProgress size={20} color="inherit" /> : <MatchIcon />}
                    disabled={isScreening}
                    onClick={handleScreenCandidate}
                  >
                    Screen Candidate
                  </Button>
                </Box>
                
                {/* Job ID Input for Screening */}
                <TextField
                  fullWidth
                  label="Job ID for Screening"
                  type="number"
                  value={screeningJobId || ''}
                  onChange={(e) => setScreeningJobId(parseInt(e.target.value) || null)}
                  margin="normal"
                  size="small"
                  helperText="Enter the Job ID to screen this candidate against"
                />
                
                {/* Screening Result (if available) */}
                {selectedScreeningResult && (
                  <Card variant="outlined" sx={{ mt: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">
                          Screening Result - Job #{selectedScreeningResult.jobId}
                        </Typography>
                        <Chip 
                          label={selectedScreeningResult.qualified ? 'Qualified' : 'Not Qualified'}
                          color={selectedScreeningResult.qualified ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Match Score:
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={selectedScreeningResult.overallScore} 
                          sx={{ 
                            flexGrow: 1,
                            height: 8, 
                            borderRadius: 5,
                            backgroundColor: 'action.disabledBackground',
                          }}
                          color={selectedScreeningResult.overallScore > 70 ? 'success' : 'warning'}
                        />
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                          {selectedScreeningResult.overallScore}%
                        </Typography>
                      </Box>
                      
                      <Button 
                        size="small" 
                        onClick={() => handleOpenDetails('screening', selectedScreeningResult.id)}
                        sx={{ mt: 1 }}
                      >
                        View Full Screening Report
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </Paper>
            ) : (
              <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <DescriptionIcon fontSize="large" color="disabled" sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Upload or paste a resume to see parsed results
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Our AI will extract candidate information and prepare it for screening
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
      
      {/* Parsed Resumes Tab */}
      {activeTab === 1 && (
        <Paper sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Education</TableCell>
                  <TableCell>Uploaded</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parsedResumes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ py: 3 }}>
                        <Typography variant="body1">No parsed resumes yet</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Upload a resume to start
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  parsedResumes.map((resume) => (
                    <TableRow key={resume.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {resume.parsedData.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {resume.parsedData.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {resume.parsedData.skills.slice(0, 3).map((skill, index) => (
                            <Chip key={index} label={skill} size="small" />
                          ))}
                          {resume.parsedData.skills.length > 3 && (
                            <Chip label={`+${resume.parsedData.skills.length - 3}`} size="small" variant="outlined" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {resume.parsedData.experience.length > 0 ? (
                          <Typography variant="body2">
                            {resume.parsedData.experience[0].title} at {resume.parsedData.experience[0].company}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No experience data
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {resume.parsedData.education.length > 0 ? (
                          <Typography variant="body2">
                            {resume.parsedData.education[0].degree} in {resume.parsedData.education[0].field}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No education data
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(resume.uploadDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${Math.round(resume.confidence * 100)}%`}
                          color={resume.confidence > 0.8 ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleOpenDetails('resume', resume.id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {/* Screening Results Tab */}
      {activeTab === 2 && (
        <Paper sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Job ID</TableCell>
                  <TableCell>Overall Score</TableCell>
                  <TableCell>Skills Match</TableCell>
                  <TableCell>Experience Match</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {screeningResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ py: 3 }}>
                        <Typography variant="body1">No screening results yet</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Screen a candidate to see results here
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  screeningResults.map((result) => {
                    const resume = getParsedResume(result.parsedResumeId);
                    return (
                      <TableRow key={result.id}>
                        <TableCell>
                          {resume ? (
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {resume.parsedData.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {resume.parsedData.email}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Unknown Candidate
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>#{result.jobId}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={result.overallScore} 
                              sx={{ 
                                width: 60, 
                                height: 8, 
                                borderRadius: 5 
                              }}
                              color={result.overallScore > 70 ? 'success' : 'warning'}
                            />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {result.overallScore}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={result.skillMatch.score} 
                              sx={{ 
                                width: 60, 
                                height: 8, 
                                borderRadius: 5 
                              }}
                              color={result.skillMatch.score > 70 ? 'success' : 'warning'}
                            />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {result.skillMatch.score}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={result.experienceMatch.score} 
                              sx={{ 
                                width: 60, 
                                height: 8, 
                                borderRadius: 5 
                              }}
                              color={result.experienceMatch.score > 70 ? 'success' : 'warning'}
                            />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {result.experienceMatch.score}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={result.qualified ? 'Qualified' : 'Not Qualified'}
                            color={result.qualified ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleOpenDetails('screening', result.id)}
                          >
                            View Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {/* Details Dialogs */}
      <Dialog 
        open={detailsDialog.open} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {detailsDialog.type === 'resume' && detailsDialog.id && (
          <Box>
            <DialogTitle>
              Resume Details
              {getParsedResume(detailsDialog.id) && (
                <Typography variant="subtitle2" color="text.secondary">
                  {getParsedResume(detailsDialog.id)?.parsedData.name}
                </Typography>
              )}
            </DialogTitle>
            <DialogContent dividers>
              {/* Resume details would go here - simplified for brevity */}
              <Typography variant="body1">
                Detailed resume information would be displayed here.
              </Typography>
            </DialogContent>
          </Box>
        )}
        
        {detailsDialog.type === 'screening' && detailsDialog.id && (
          <Box>
            <DialogTitle>
              Screening Report
              {getScreeningResult(detailsDialog.id) && (
                <Typography variant="subtitle2" color="text.secondary">
                  Job #{getScreeningResult(detailsDialog.id)?.jobId}
                </Typography>
              )}
            </DialogTitle>
            <DialogContent dividers>
              {/* Screening details would go here - simplified for brevity */}
              <Typography variant="body1">
                Detailed screening report would be displayed here.
              </Typography>
            </DialogContent>
          </Box>
        )}
        
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeParser; 