import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  FileCopy as DuplicateIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useStructuredInterviewKit } from '../contexts/StructuredInterviewKitContext';
import {
  InterviewKit,
  InterviewQuestion,
  QuestionCategory,
  DifficultyLevel,
  ScoringCriteria,
  InterviewScheduleTemplate,
} from '../models/types';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StructuredInterviewKitManager() {
  const {
    loading,
    questionCategories,
    difficultyLevels,
    scoringCriteria,
    questions,
    interviewKits,
    scheduleTemplates,
    addInterviewKit,
    updateInterviewKit,
    deleteInterviewKit,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addScheduleTemplate,
    updateScheduleTemplate,
    deleteScheduleTemplate,
  } = useStructuredInterviewKit();

  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'kit' | 'question' | 'template'>('kit');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (
    type: 'kit' | 'question' | 'template',
    mode: 'add' | 'edit',
    item?: any
  ) => {
    setDialogType(type);
    setDialogMode(mode);
    setCurrentItem(item || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentItem(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Simplified save handler for demonstration purposes
  const handleSave = () => {
    try {
      if (dialogType === 'kit') {
        if (dialogMode === 'add') {
          addInterviewKit(currentItem as InterviewKit);
        } else {
          updateInterviewKit(currentItem as InterviewKit);
        }
      } else if (dialogType === 'question') {
        if (dialogMode === 'add') {
          addQuestion(currentItem as InterviewQuestion);
        } else {
          updateQuestion(currentItem as InterviewQuestion);
        }
      } else if (dialogType === 'template') {
        if (dialogMode === 'add') {
          addScheduleTemplate(currentItem as InterviewScheduleTemplate);
        } else {
          updateScheduleTemplate(currentItem as InterviewScheduleTemplate);
        }
      }

      handleCloseDialog();
      showNotification(
        `${dialogType} ${dialogMode === 'add' ? 'added' : 'updated'} successfully!`,
        'success'
      );
    } catch (error) {
      showNotification(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  };

  const handleDelete = (type: 'kit' | 'question' | 'template', id: string) => {
    try {
      if (type === 'kit') {
        deleteInterviewKit(id);
      } else if (type === 'question') {
        deleteQuestion(id);
      } else if (type === 'template') {
        deleteScheduleTemplate(id);
      }

      showNotification(`${type} deleted successfully!`, 'success');
    } catch (error) {
      showNotification(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Structured Interview Kit Manager
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="interview kit tabs">
            <Tab label="Interview Kits" id="interview-kit-tab-0" />
            <Tab label="Question Bank" id="interview-kit-tab-1" />
            <Tab label="Schedule Templates" id="interview-kit-tab-2" />
          </Tabs>
        </Box>

        {/* Interview Kits Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Interview Kits</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('kit', 'add')}
            >
              New Kit
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Questions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {interviewKits.map((kit) => (
                  <TableRow key={kit.id}>
                    <TableCell>{kit.name}</TableCell>
                    <TableCell>{kit.description}</TableCell>
                    <TableCell>
                      {difficultyLevels.find((d) => d.id === kit.difficultyLevelId)?.name ||
                        'Unknown'}
                    </TableCell>
                    <TableCell>{kit.questions.length}</TableCell>
                    <TableCell>
                      <Chip
                        label={kit.status}
                        color={
                          kit.status === 'active'
                            ? 'success'
                            : kit.status === 'draft'
                              ? 'warning'
                              : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog('kit', 'edit', kit)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete('kit', kit.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <DuplicateIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Questions Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Question Bank</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('question', 'add')}
            >
              New Question
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Question</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Time (min)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>{question.question}</TableCell>
                    <TableCell>
                      {questionCategories.find((c) => c.id === question.categoryId)?.name ||
                        'Unknown'}
                    </TableCell>
                    <TableCell>
                      {difficultyLevels.find((d) => d.id === question.difficultyLevelId)?.name ||
                        'Unknown'}
                    </TableCell>
                    <TableCell>{question.timeGuidelineMinutes}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('question', 'edit', question)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete('question', question.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Schedule Templates Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Schedule Templates</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('template', 'add')}
            >
              New Template
            </Button>
          </Box>

          {scheduleTemplates.map((template) => (
            <Accordion key={template.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <Typography>{template.name}</Typography>
                  <Box>
                    <Chip
                      label={template.status}
                      color={
                        template.status === 'active'
                          ? 'success'
                          : template.status === 'draft'
                            ? 'warning'
                            : 'default'
                      }
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2">{template.totalDurationMinutes} minutes</Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>

                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order</TableCell>
                        <TableCell>Stage</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Kit</TableCell>
                        <TableCell>Optional</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {template.stages
                        .sort((a, b) => a.order - b.order)
                        .map((stage) => (
                          <TableRow key={stage.id}>
                            <TableCell>{stage.order}</TableCell>
                            <TableCell>{stage.name}</TableCell>
                            <TableCell>{stage.durationMinutes} min</TableCell>
                            <TableCell>
                              {stage.kitId
                                ? interviewKits.find((k) => k.id === stage.kitId)?.name || 'Unknown'
                                : 'N/A'}
                            </TableCell>
                            <TableCell>{stage.isOptional ? 'Yes' : 'No'}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog('template', 'edit', template)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => handleDelete('template', template.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </TabPanel>
      </Box>

      {/* Dialog for adding/editing (simplified for demo) */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add' : 'Edit'}{' '}
          {dialogType === 'kit'
            ? 'Interview Kit'
            : dialogType === 'question'
              ? 'Question'
              : 'Schedule Template'}
        </DialogTitle>
        <DialogContent>
          {/* Simplified form content - in a real app, you'd have proper forms with validation */}
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Form fields would go here based on the type ({dialogType}) and mode ({dialogMode})
          </Typography>

          {dialogType === 'kit' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField label="Name" fullWidth />
              <TextField label="Description" fullWidth multiline rows={3} />
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select label="Difficulty Level">
                  {difficultyLevels.map((level) => (
                    <MenuItem key={level.id} value={level.id}>
                      {level.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status">
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {dialogType === 'question' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField label="Question" fullWidth multiline rows={3} />
              <TextField label="Expected Answer" fullWidth multiline rows={3} />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select label="Category">
                  {questionCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select label="Difficulty Level">
                  {difficultyLevels.map((level) => (
                    <MenuItem key={level.id} value={level.id}>
                      {level.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Scoring Criteria</InputLabel>
                <Select label="Scoring Criteria">
                  {scoringCriteria.map((criteria) => (
                    <MenuItem key={criteria.id} value={criteria.id}>
                      {criteria.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Time Guideline (minutes)" type="number" fullWidth />
            </Box>
          )}

          {dialogType === 'template' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField label="Template Name" fullWidth />
              <TextField label="Description" fullWidth multiline rows={3} />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status">
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Interview Stages
              </Typography>

              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Stage editor would go here - allowing adding, reordering, and configuring stages
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
