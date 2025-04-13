import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  CircularProgress, 
  Container, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Divider, 
  FormControl, 
  Grid, 
  IconButton, 
  InputLabel, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemSecondaryAction, 
  ListItemText, 
  MenuItem, 
  Paper, 
  Select, 
  Tab, 
  Tabs, 
  TextField, 
  Typography 
} from '@mui/material';
import { 
  Add as AddIcon, 
  Create as EditIcon, 
  Delete as DeleteIcon, 
  AccessTime as TimeIcon, 
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  Spellcheck as SpellcheckIcon
} from '@mui/icons-material';
import { useStructuredInterviewKit } from '../contexts/StructuredInterviewKitContext';
import { InterviewKit, InterviewQuestion, QuestionCategory } from '../models/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`interview-kit-tabpanel-${index}`}
      aria-labelledby={`interview-kit-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `interview-kit-tab-${index}`,
    'aria-controls': `interview-kit-tabpanel-${index}`,
  };
}

export default function StructuredInterviewKit() {
  const {
    loading,
    questionCategories,
    difficultyLevels,
    scoringCriteria,
    interviewQuestions,
    interviewKits,
    scheduleTemplates,
    createInterviewKit,
    updateInterviewKit,
    deleteInterviewKit,
    createInterviewQuestion,
  } = useStructuredInterviewKit();

  const [tabValue, setTabValue] = useState(0);
  const [selectedKit, setSelectedKit] = useState<InterviewKit | null>(null);
  const [openNewQuestionDialog, setOpenNewQuestionDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<InterviewQuestion>>({
    question: '',
    expectedAnswer: '',
    categoryId: '',
    difficultyLevelId: '',
    rubricItems: [],
    timeGuidelineMinutes: 5,
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleKitSelect = (kit: InterviewKit) => {
    setSelectedKit(kit);
  };

  const handleOpenNewQuestionDialog = () => {
    setOpenNewQuestionDialog(true);
  };

  const handleCloseNewQuestionDialog = () => {
    setOpenNewQuestionDialog(false);
    setNewQuestion({
      question: '',
      expectedAnswer: '',
      categoryId: '',
      difficultyLevelId: '',
      rubricItems: [],
      timeGuidelineMinutes: 5,
    });
  };

  const handleSubmitNewQuestion = () => {
    if (
      newQuestion.question &&
      newQuestion.expectedAnswer &&
      newQuestion.categoryId &&
      newQuestion.difficultyLevelId
    ) {
      createInterviewQuestion({
        ...newQuestion as InterviewQuestion,
        id: `question-${Date.now()}`,
        followUpQuestions: [],
      });
      handleCloseNewQuestionDialog();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Structured Interview Kits
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create and manage standardized interview kits to ensure consistent candidate evaluation
        </Typography>
        <Divider />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="interview kit tabs">
          <Tab label="Interview Kits" {...a11yProps(0)} />
          <Tab label="Question Bank" {...a11yProps(1)} />
          <Tab label="Schedule Templates" {...a11yProps(2)} />
          <Tab label="Settings" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Available Interview Kits</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => {
              createInterviewKit({
                id: `kit-${Date.now()}`,
                name: "New Interview Kit",
                description: "A new interview kit",
                status: "draft",
                difficultyLevelId: difficultyLevels[0]?.id || "",
                questions: [],
                totalTimeMinutes: 0,
                createdBy: "current-user",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }}
          >
            Create New Kit
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ height: '100%' }}>
              <List component="nav" aria-label="interview kits list">
                {interviewKits.map((kit) => (
                  <ListItem 
                    button 
                    key={kit.id}
                    selected={selectedKit?.id === kit.id}
                    onClick={() => handleKitSelect(kit)}
                  >
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={kit.name} 
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {kit.questions.length} Questions
                          </Typography>
                          {` — ${kit.description.substring(0, 40)}${kit.description.length > 40 ? '...' : ''}`}
                        </>
                      }
                    />
                    <Chip 
                      label={kit.status} 
                      size="small" 
                      color={kit.status === 'active' ? 'success' : kit.status === 'draft' ? 'default' : 'error'} 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            {selectedKit ? (
              <Card elevation={3}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" component="h2">
                      {selectedKit.name}
                    </Typography>
                    <Box>
                      <IconButton aria-label="edit" size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        aria-label="delete" 
                        size="small" 
                        color="error"
                        onClick={() => {
                          deleteInterviewKit(selectedKit.id);
                          setSelectedKit(null);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedKit.description}
                  </Typography>

                  <Box display="flex" alignItems="center" mb={2}>
                    <TimeIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Total time: {selectedKit.totalTimeMinutes} minutes
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" gutterBottom>
                    Questions ({selectedKit.questions.length})
                  </Typography>

                  {selectedKit.questions.length > 0 ? (
                    <List>
                      {selectedKit.questions
                        .sort((a, b) => a.order - b.order)
                        .map((kitQuestion) => {
                          const question = interviewQuestions.find(q => q.id === kitQuestion.questionId);
                          const category = questionCategories.find(c => c.id === question?.categoryId);
                          
                          return question ? (
                            <ListItem key={kitQuestion.id}>
                              <ListItemIcon>
                                {kitQuestion.isRequired ? (
                                  <CheckCircleIcon color="primary" />
                                ) : (
                                  <CheckCircleIcon color="disabled" />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={question.question}
                                secondary={
                                  <React.Fragment>
                                    <Typography component="span" variant="body2" color="text.primary">
                                      {category?.name} • {question.timeGuidelineMinutes} min
                                    </Typography>
                                  </React.Fragment>
                                }
                              />
                            </ListItem>
                          ) : null;
                        })}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No questions added to this kit yet. Add questions from the Question Bank.
                    </Typography>
                  )}

                  <Box mt={3}>
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />}
                      onClick={() => setTabValue(1)}
                    >
                      Add Questions from Bank
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  border: '1px dashed #ccc',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <Typography variant="body1" color="text.secondary" align="center">
                  Select an interview kit from the list to view details, or create a new one.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Question Bank</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenNewQuestionDialog}
          >
            Add New Question
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Filter Questions
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="category-filter-label">Category</InputLabel>
                <Select
                  labelId="category-filter-label"
                  label="Category"
                  defaultValue=""
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {questionCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="difficulty-filter-label">Difficulty</InputLabel>
                <Select
                  labelId="difficulty-filter-label"
                  label="Difficulty"
                  defaultValue=""
                >
                  <MenuItem value="">All Difficulty Levels</MenuItem>
                  {difficultyLevels.map((level) => (
                    <MenuItem key={level.id} value={level.id}>
                      {level.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={3}>
              <List>
                {interviewQuestions.map((question) => {
                  const category = questionCategories.find(c => c.id === question.categoryId);
                  const difficultyLevel = difficultyLevels.find(d => d.id === question.difficultyLevelId);
                  
                  return (
                    <React.Fragment key={question.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={question.question}
                          secondary={
                            <React.Fragment>
                              <Box display="flex" alignItems="center" mt={1} mb={1}>
                                <CategoryIcon fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography component="span" variant="body2" color="text.primary" sx={{ mr: 2 }}>
                                  {category?.name}
                                </Typography>
                                <SpellcheckIcon fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography component="span" variant="body2" color="text.primary" sx={{ mr: 2 }}>
                                  {difficultyLevel?.name}
                                </Typography>
                                <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography component="span" variant="body2" color="text.primary">
                                  {question.timeGuidelineMinutes} min
                                </Typography>
                              </Box>
                              <Typography component="span" variant="body2" color="text.secondary">
                                Expected Answer: {question.expectedAnswer}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" aria-label="edit">
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Dialog open={openNewQuestionDialog} onClose={handleCloseNewQuestionDialog} maxWidth="md" fullWidth>
          <DialogTitle>Add New Interview Question</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Question"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Expected Answer"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={newQuestion.expectedAnswer}
              onChange={(e) => setNewQuestion({...newQuestion, expectedAnswer: e.target.value})}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    value={newQuestion.categoryId}
                    label="Category"
                    onChange={(e) => setNewQuestion({...newQuestion, categoryId: e.target.value})}
                  >
                    {questionCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="difficulty-select-label">Difficulty Level</InputLabel>
                  <Select
                    labelId="difficulty-select-label"
                    value={newQuestion.difficultyLevelId}
                    label="Difficulty Level"
                    onChange={(e) => setNewQuestion({...newQuestion, difficultyLevelId: e.target.value})}
                  >
                    {difficultyLevels.map((level) => (
                      <MenuItem key={level.id} value={level.id}>
                        {level.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  type="number"
                  label="Time Guideline (minutes)"
                  variant="outlined"
                  fullWidth
                  value={newQuestion.timeGuidelineMinutes}
                  onChange={(e) => setNewQuestion({...newQuestion, timeGuidelineMinutes: Number(e.target.value)})}
                  InputProps={{ inputProps: { min: 1, max: 60 } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNewQuestionDialog}>Cancel</Button>
            <Button onClick={handleSubmitNewQuestion} variant="contained" color="primary">
              Add Question
            </Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Interview Schedule Templates</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
          >
            Create New Template
          </Button>
        </Box>

        <Grid container spacing={3}>
          {scheduleTemplates.map((template) => (
            <Grid item key={template.id} xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">{template.name}</Typography>
                    <Chip 
                      label={template.status} 
                      size="small" 
                      color={template.status === 'active' ? 'success' : template.status === 'draft' ? 'default' : 'error'} 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {template.description}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TimeIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Total duration: {template.totalDurationMinutes} minutes
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Interview Stages:
                  </Typography>
                  <List dense>
                    {template.stages
                      .sort((a, b) => a.order - b.order)
                      .map((stage) => {
                        const kit = stage.kitId 
                          ? interviewKits.find(k => k.id === stage.kitId) 
                          : null;
                        
                        return (
                          <ListItem key={stage.id}>
                            <ListItemText 
                              primary={`${stage.order}. ${stage.name} (${stage.durationMinutes} min)`}
                              secondary={kit ? `Using kit: ${kit.name}` : 'No interview kit assigned'}
                            />
                          </ListItem>
                        );
                      })}
                  </List>
                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button 
                      startIcon={<EditIcon />} 
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      startIcon={<DeleteIcon />} 
                      color="error" 
                      size="small"
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Question Categories
              </Typography>
              <List>
                {questionCategories.map((category) => (
                  <ListItem key={category.id}>
                    <ListItemText 
                      primary={category.name} 
                      secondary={category.description} 
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Button 
                startIcon={<AddIcon />} 
                variant="outlined" 
                sx={{ mt: 2 }}
              >
                Add Category
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Difficulty Levels
              </Typography>
              <List>
                {difficultyLevels.map((level) => (
                  <ListItem key={level.id}>
                    <ListItemText 
                      primary={level.name} 
                      secondary={level.description} 
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Button 
                startIcon={<AddIcon />} 
                variant="outlined" 
                sx={{ mt: 2 }}
              >
                Add Difficulty Level
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Scoring Criteria
              </Typography>
              <List>
                {scoringCriteria.map((criteria) => (
                  <ListItem key={criteria.id}>
                    <ListItemText 
                      primary={criteria.name} 
                      secondary={criteria.description} 
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Button 
                startIcon={<AddIcon />} 
                variant="outlined" 
                sx={{ mt: 2 }}
              >
                Add Scoring Criteria
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
} 