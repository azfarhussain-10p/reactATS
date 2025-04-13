import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as DuplicateIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useStructuredInterviewKit } from '../contexts/StructuredInterviewKitContext';
import { 
  InterviewKit, 
  InterviewQuestion, 
  QuestionCategory, 
  DifficultyLevel,
  ScoringCriteria,
  InterviewScheduleTemplate
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
      id={`interview-tabpanel-${index}`}
      aria-labelledby={`interview-tab-${index}`}
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

export default function StructuredInterviewKits() {
  const [tabValue, setTabValue] = useState(0);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [openKitDialog, setOpenKitDialog] = useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [selectedKit, setSelectedKit] = useState<InterviewKit | null>(null);
  const [kitDetailsOpen, setKitDetailsOpen] = useState<string | null>(null);
  
  const { 
    questions,
    categories,
    difficultyLevels,
    scoringCriteria,
    interviewKits,
    scheduleTemplates,
    getQuestionsByCategory,
    getQuestionsByKit,
    getCategoryById,
    getDifficultyLevelById,
    getScoringCriteriaById,
    duplicateInterviewKit
  } = useStructuredInterviewKit();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenKitDetails = (kitId: string) => {
    setKitDetailsOpen(kitId === kitDetailsOpen ? null : kitId);
  };

  const handleDuplicateKit = (kitId: string) => {
    duplicateInterviewKit(kitId);
  };

  const renderQuestionList = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Interview Questions</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenQuestionDialog(true)}
          >
            Add Question
          </Button>
        </Box>
        
        <Paper elevation={2}>
          {categories.map((category) => (
            <Accordion key={category.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{category.name}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                  {getQuestionsByCategory(category.id).length} questions
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {getQuestionsByCategory(category.id).map((question) => {
                    const difficultyLevel = getDifficultyLevelById(question.difficultyLevelId);
                    
                    return (
                      <ListItem key={question.id} divider>
                        <ListItemText
                          primary={question.question}
                          secondary={
                            <React.Fragment>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Chip 
                                  size="small" 
                                  label={difficultyLevel?.name || 'Unknown'} 
                                  color={
                                    difficultyLevel?.value <= 2 ? 'success' : 
                                    difficultyLevel?.value <= 4 ? 'warning' : 'error'
                                  }
                                />
                                {question.tags.map((tag) => (
                                  <Chip key={tag} size="small" label={tag} variant="outlined" />
                                ))}
                              </Box>
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" aria-label="edit">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      </Box>
    );
  };

  const renderKitList = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Interview Kits</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenKitDialog(true)}
          >
            Create Kit
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          {interviewKits.map((kit) => (
            <Grid item xs={12} md={6} key={kit.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{kit.name}</Typography>
                    <Chip 
                      size="small" 
                      label={getDifficultyLevelById(kit.difficultyLevelId)?.name || 'Unknown'}
                      color={
                        getDifficultyLevelById(kit.difficultyLevelId)?.value <= 2 ? 'success' : 
                        getDifficultyLevelById(kit.difficultyLevelId)?.value <= 4 ? 'warning' : 'error'
                      }
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary">
                    {kit.description}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      {kit.questions.length} questions | {kit.totalTimeMinutes} minutes
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {kit.status.charAt(0).toUpperCase() + kit.status.slice(1)}
                    </Typography>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<ExpandMoreIcon />}
                    onClick={() => handleOpenKitDetails(kit.id)}
                  >
                    {kitDetailsOpen === kit.id ? 'Hide Details' : 'View Details'}
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<DuplicateIcon />}
                    onClick={() => handleDuplicateKit(kit.id)}
                  >
                    Duplicate
                  </Button>
                </CardActions>
                
                {kitDetailsOpen === kit.id && (
                  <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" gutterBottom>Questions:</Typography>
                    <List dense>
                      {getQuestionsByKit(kit.id).map((question, index) => (
                        <ListItem key={question.id} divider={index < getQuestionsByKit(kit.id).length - 1}>
                          <ListItemText
                            primary={question.question}
                            secondary={`${getCategoryById(question.categoryId)?.name || 'Unknown'} • ${
                              getDifficultyLevelById(question.difficultyLevelId)?.name || 'Unknown'
                            }`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Scoring Criteria:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {kit.requiredScoringCriteriaIds.map((criteriaId) => {
                        const criteria = getScoringCriteriaById(criteriaId);
                        return criteria ? (
                          <Chip key={criteriaId} label={criteria.name} size="small" />
                        ) : null;
                      })}
                    </Box>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderTemplateList = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Interview Schedule Templates</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenTemplateDialog(true)}
          >
            Create Template
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          {scheduleTemplates.map((template) => (
            <Grid item xs={12} md={6} key={template.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{template.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {template.description}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      {template.stages.length} stages | {template.totalDurationMinutes} minutes
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Applicable for:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {template.jobRoleIds.length > 0 ? (
                        template.jobRoleIds.map((roleId) => (
                          <Chip key={roleId} label={`Role ${roleId}`} size="small" variant="outlined" />
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary">All roles</Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions>
                  <Button size="small" startIcon={<EditIcon />}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<DuplicateIcon />}>
                    Duplicate
                  </Button>
                  <Button size="small" startIcon={<DeleteIcon />}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderScoringCriteria = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Scoring Criteria</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
          >
            Add Criteria
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          {scoringCriteria.map((criteria) => (
            <Grid item xs={12} md={6} key={criteria.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{criteria.name}</Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {criteria.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>Scoring Rubric:</Typography>
                  <List dense>
                    {criteria.rubric.map((item, index) => (
                      <ListItem key={index} divider={index < criteria.rubric.length - 1}>
                        <ListItemText
                          primary={`${item.score} - ${item.description}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                
                <Divider />
                
                <CardActions>
                  <Button size="small" startIcon={<EditIcon />}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<DeleteIcon />}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Add mock dialogs (in a real implementation these would be complete forms)
  const renderQuestionDialog = () => (
    <Dialog open={openQuestionDialog} onClose={() => setOpenQuestionDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>Add Interview Question</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Question"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            placeholder="Enter the interview question..."
          />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select label="Category">
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Difficulty Level</InputLabel>
                <Select label="Difficulty Level">
                  {difficultyLevels.map(level => (
                    <MenuItem key={level.id} value={level.id}>
                      {level.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <TextField
            label="Expected Answer"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            placeholder="Describe what a good answer to this question would include..."
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Scoring Criteria</InputLabel>
            <Select multiple label="Scoring Criteria">
              {scoringCriteria.map(criteria => (
                <MenuItem key={criteria.id} value={criteria.id}>
                  {criteria.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Tags (comma separated)"
            fullWidth
            margin="normal"
            placeholder="e.g., technical, behavior, leadership"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenQuestionDialog(false)}>Cancel</Button>
        <Button variant="contained" onClick={() => setOpenQuestionDialog(false)}>Save</Button>
      </DialogActions>
    </Dialog>
  );

  const renderKitDialog = () => (
    <Dialog open={openKitDialog} onClose={() => setOpenKitDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>Create Interview Kit</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Kit Name"
            fullWidth
            margin="normal"
            placeholder="e.g., Frontend Developer Technical Interview"
          />
          
          <TextField
            label="Description"
            multiline
            rows={2}
            fullWidth
            margin="normal"
            placeholder="Brief description of this interview kit's purpose..."
          />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Difficulty Level</InputLabel>
                <Select label="Difficulty Level">
                  {difficultyLevels.map(level => (
                    <MenuItem key={level.id} value={level.id}>
                      {level.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total Time (minutes)"
                type="number"
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 15, step: 5 } }}
                defaultValue={60}
              />
            </Grid>
          </Grid>
          
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Questions</Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              No questions added yet. Click "Add Question" to include questions in this kit.
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />}>
              Add Question
            </Button>
          </Paper>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Required Scoring Criteria</InputLabel>
            <Select multiple label="Required Scoring Criteria">
              {scoringCriteria.map(criteria => (
                <MenuItem key={criteria.id} value={criteria.id}>
                  {criteria.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenKitDialog(false)}>Cancel</Button>
        <Button variant="contained" onClick={() => setOpenKitDialog(false)}>Save</Button>
      </DialogActions>
    </Dialog>
  );

  const renderTemplateDialog = () => (
    <Dialog open={openTemplateDialog} onClose={() => setOpenTemplateDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>Create Interview Schedule Template</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Template Name"
            fullWidth
            margin="normal"
            placeholder="e.g., Senior Developer Hiring Process"
          />
          
          <TextField
            label="Description"
            multiline
            rows={2}
            fullWidth
            margin="normal"
            placeholder="Brief description of this interview schedule template..."
          />
          
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Interview Stages</Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              No stages added yet. Click "Add Stage" to build your interview schedule.
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />}>
              Add Stage
            </Button>
          </Paper>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Applicable For:</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Departments</InputLabel>
                  <Select multiple label="Departments">
                    <MenuItem value="engineering">Engineering</MenuItem>
                    <MenuItem value="product">Product</MenuItem>
                    <MenuItem value="design">Design</MenuItem>
                    <MenuItem value="marketing">Marketing</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Job Roles</InputLabel>
                  <Select multiple label="Job Roles">
                    <MenuItem value="dev_jr">Junior Developer</MenuItem>
                    <MenuItem value="dev_mid">Mid-level Developer</MenuItem>
                    <MenuItem value="dev_sr">Senior Developer</MenuItem>
                    <MenuItem value="dev_lead">Lead Developer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenTemplateDialog(false)}>Cancel</Button>
        <Button variant="contained" onClick={() => setOpenTemplateDialog(false)}>Save</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="interview management tabs">
          <Tab label="Interview Kits" />
          <Tab label="Questions" />
          <Tab label="Templates" />
          <Tab label="Scoring Criteria" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {renderKitList()}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {renderQuestionList()}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {renderTemplateList()}
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        {renderScoringCriteria()}
      </TabPanel>

      {renderQuestionDialog()}
      {renderKitDialog()}
      {renderTemplateDialog()}
    </Box>
  );
} 