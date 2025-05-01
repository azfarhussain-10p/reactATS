import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Menu,
  Alert,
  Card,
  CardContent,
  CardActions,
  Divider,
  Badge,
  LinearProgress,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
  Assignment as TaskIcon,
  Email as EmailIcon,
  VideoCall as VideoCallIcon,
  MoveDown as MoveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Star as StarIcon,
  PersonSearch as PersonSearchIcon,
} from '@mui/icons-material';
import { usePipeline } from '../contexts/PipelineContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { formatDistanceToNow } from 'date-fns';

// Mock data for candidates in pipeline stages
const mockCandidateApplications = [
  {
    id: 'app1',
    candidateId: 1,
    candidateName: 'John Doe',
    candidateImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    stage: 'Technical Assessment',
    jobTitle: 'Senior Frontend Developer',
    daysInStage: 3,
    totalDaysInProcess: 10,
    interviewDate: '2023-12-15T10:00:00',
    hasOverdueTasks: true,
    rating: 4.5,
    flagged: false,
  },
  {
    id: 'app2',
    candidateId: 2,
    candidateName: 'Jane Smith',
    candidateImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    stage: 'Screening',
    jobTitle: 'UX Designer',
    daysInStage: 1,
    totalDaysInProcess: 2,
    interviewDate: '2023-12-16T14:00:00',
    hasOverdueTasks: false,
    rating: 0,
    flagged: false,
  },
  {
    id: 'app3',
    candidateId: 3,
    candidateName: 'Mike Johnson',
    candidateImage: '',
    stage: 'Applied',
    jobTitle: 'Backend Developer',
    daysInStage: 2,
    totalDaysInProcess: 2,
    interviewDate: null,
    hasOverdueTasks: true,
    rating: 0,
    flagged: false,
  },
  {
    id: 'app4',
    candidateId: 4,
    candidateName: 'Sara Williams',
    candidateImage: 'https://randomuser.me/api/portraits/women/4.jpg',
    stage: 'First Interview',
    jobTitle: 'Product Manager',
    daysInStage: 5,
    totalDaysInProcess: 8,
    interviewDate: '2023-12-18T11:00:00',
    hasOverdueTasks: false,
    rating: 4.0,
    flagged: true,
    flagReason: 'Salary expectations too high',
  },
  {
    id: 'app5',
    candidateId: 5,
    candidateName: 'Alex Brown',
    candidateImage: '',
    stage: 'First Interview',
    jobTitle: 'Frontend Developer',
    daysInStage: 2,
    totalDaysInProcess: 6,
    interviewDate: '2023-12-18T15:30:00',
    hasOverdueTasks: false,
    rating: 3.5,
    flagged: false,
  },
  {
    id: 'app6',
    candidateId: 6,
    candidateName: 'Emily Davis',
    candidateImage: 'https://randomuser.me/api/portraits/women/6.jpg',
    stage: 'Applied',
    jobTitle: 'Marketing Manager',
    daysInStage: 1,
    totalDaysInProcess: 1,
    interviewDate: null,
    hasOverdueTasks: false,
    rating: 0,
    flagged: false,
  },
];

// Function to organize candidates by stage
const organizeCandidatesByStage = (candidates, stages) => {
  const result = {};

  // Initialize all stages with empty arrays
  stages.forEach((stage) => {
    result[stage.id] = [];
  });

  // Add candidates to their respective stages
  candidates.forEach((candidate) => {
    if (result[candidate.stage]) {
      result[candidate.stage].push(candidate);
    }
  });

  return result;
};

function RecruitmentPipeline() {
  const { pipelines, getDefaultPipeline, tasks, getTasksForStage } = usePipeline();

  const [currentPipeline, setCurrentPipeline] = useState(getDefaultPipeline());
  const [candidatesByStage, setCandidatesByStage] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [filterJob, setFilterJob] = useState('all');
  const [showTasksDialog, setShowTasksDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedStageTasks, setSelectedStageTasks] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [targetStage, setTargetStage] = useState('');
  const [showFlagged, setShowFlagged] = useState(false);

  // Initialize candidates by stage
  useEffect(() => {
    setLoading(true);
    // In a real app, this would fetch from an API
    const organized = organizeCandidatesByStage(mockCandidateApplications, currentPipeline.stages);
    setCandidatesByStage(organized);
    setFilteredCandidates(mockCandidateApplications);
    setLoading(false);
  }, [currentPipeline]);

  // Apply filters
  useEffect(() => {
    let filtered = [...mockCandidateApplications];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.candidateName.toLowerCase().includes(term) ||
          candidate.jobTitle.toLowerCase().includes(term)
      );
    }

    if (filterJob !== 'all') {
      filtered = filtered.filter((candidate) => candidate.jobTitle === filterJob);
    }

    if (showFlagged) {
      filtered = filtered.filter((candidate) => candidate.flagged);
    }

    setFilteredCandidates(filtered);

    const organized = organizeCandidatesByStage(filtered, currentPipeline.stages);
    setCandidatesByStage(organized);
  }, [searchTerm, filterJob, showFlagged, currentPipeline]);

  // Handle candidate drag and drop
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // No destination or same destination = no change
    if (
      !destination ||
      (destination.droppableId === source.droppableId && destination.index === source.index)
    ) {
      return;
    }

    // Find the candidate that was moved
    const candidateApp = filteredCandidates.find((c) => c.id === draggableId);
    if (!candidateApp) return;

    // Update the candidate's stage
    const updatedCandidates = filteredCandidates.map((c) => {
      if (c.id === draggableId) {
        return { ...c, stage: destination.droppableId };
      }
      return c;
    });

    // Update the state
    setFilteredCandidates(updatedCandidates);

    // Reorganize candidates by stage
    const organized = organizeCandidatesByStage(updatedCandidates, currentPipeline.stages);
    setCandidatesByStage(organized);

    // In a real app, this would also make an API call to update the backend
  };

  // Open candidate tasks dialog
  const handleOpenTasks = (candidate) => {
    setSelectedCandidate(candidate);
    const stageTasks = getTasksForStage(candidate.stage);
    setSelectedStageTasks(stageTasks);
    setShowTasksDialog(true);
  };

  // Open candidate actions menu
  const handleOpenMenu = (event, candidate) => {
    setAnchorEl(event.currentTarget);
    setSelectedCandidate(candidate);
  };

  // Close candidate actions menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Open the move candidate dialog
  const handleOpenMoveDialog = () => {
    setMoveDialogOpen(true);
    handleCloseMenu();
  };

  // Move candidate to a different stage
  const handleMoveCandidate = () => {
    if (!targetStage || !selectedCandidate) return;

    // Update the candidate's stage
    const updatedCandidates = filteredCandidates.map((c) => {
      if (c.id === selectedCandidate.id) {
        return { ...c, stage: targetStage };
      }
      return c;
    });

    // Update the state
    setFilteredCandidates(updatedCandidates);

    // Reorganize candidates by stage
    const organized = organizeCandidatesByStage(updatedCandidates, currentPipeline.stages);
    setCandidatesByStage(organized);

    setMoveDialogOpen(false);
    setTargetStage('');

    // In a real app, this would also make an API call to update the backend
  };

  // Flag or unflag a candidate
  const handleToggleFlag = () => {
    if (!selectedCandidate) return;

    // Update the candidate's flagged status
    const updatedCandidates = filteredCandidates.map((c) => {
      if (c.id === selectedCandidate.id) {
        return { ...c, flagged: !c.flagged };
      }
      return c;
    });

    // Update the state
    setFilteredCandidates(updatedCandidates);

    // Reorganize candidates by stage
    const organized = organizeCandidatesByStage(updatedCandidates, currentPipeline.stages);
    setCandidatesByStage(organized);

    handleCloseMenu();

    // In a real app, this would also make an API call to update the backend
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', py: 3, px: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h5">Recruitment Pipeline</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            placeholder="Search candidates..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Pipeline</InputLabel>
            <Select
              value={currentPipeline.id}
              label="Pipeline"
              onChange={(e) => {
                const selected = pipelines.find((p) => p.id === e.target.value);
                if (selected) setCurrentPipeline(selected);
              }}
            >
              {pipelines.map((pipeline) => (
                <MenuItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            startIcon={<FilterIcon />}
            variant={showFlagged ? 'contained' : 'outlined'}
            onClick={() => setShowFlagged(!showFlagged)}
            size="small"
          >
            Flagged
          </Button>
        </Box>
      </Box>

      {loading ? (
        <LinearProgress sx={{ mb: 2 }} />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{ display: 'flex', overflowX: 'auto', pb: 2 }}>
            {currentPipeline.stages
              .filter((stage) => !['Rejected', 'Withdrawn'].includes(stage.id))
              .sort((a, b) => a.order - b.order)
              .map((stage) => (
                <Box
                  key={stage.id}
                  sx={{
                    minWidth: 280,
                    maxWidth: 280,
                    mr: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'calc(100vh - 200px)',
                  }}
                >
                  <Paper
                    sx={{
                      p: 1,
                      mb: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {stage.name}
                      </Typography>
                      <Typography variant="caption">
                        {candidatesByStage[stage.id]?.length || 0} candidates
                      </Typography>
                    </Box>
                    {stage.daysToComplete && (
                      <Tooltip title={`Target: ${stage.daysToComplete} days`}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimeIcon fontSize="small" />
                          <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {stage.daysToComplete}d
                          </Typography>
                        </Box>
                      </Tooltip>
                    )}
                  </Paper>

                  <Droppable droppableId={stage.id}>
                    {(provided) => (
                      <Paper
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{
                          p: 1,
                          flexGrow: 1,
                          overflowY: 'auto',
                        }}
                      >
                        {candidatesByStage[stage.id]?.length > 0 ? (
                          candidatesByStage[stage.id].map((candidate, index) => (
                            <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  sx={{
                                    mb: 1,
                                    boxShadow: snapshot.isDragging ? 3 : 1,
                                    border: candidate.flagged ? '1px solid #f44336' : 'none',
                                  }}
                                >
                                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        badgeContent={
                                          candidate.rating > 0 ? (
                                            <Tooltip title={`Rating: ${candidate.rating}/5`}>
                                              <Box
                                                sx={{
                                                  bgcolor: 'background.paper',
                                                  borderRadius: '50%',
                                                  width: 18,
                                                  height: 18,
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                }}
                                              >
                                                <StarIcon
                                                  sx={{ fontSize: 14, color: 'warning.main' }}
                                                />
                                              </Box>
                                            </Tooltip>
                                          ) : null
                                        }
                                      >
                                        <Avatar
                                          src={candidate.candidateImage}
                                          sx={{ width: 32, height: 32, mr: 1 }}
                                        >
                                          {candidate.candidateName.charAt(0)}
                                        </Avatar>
                                      </Badge>
                                      <Box sx={{ ml: 1 }}>
                                        <Typography variant="subtitle2" noWrap>
                                          {candidate.candidateName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                          {candidate.jobTitle}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ ml: 'auto' }}>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => handleOpenMenu(e, candidate)}
                                        >
                                          <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Box>

                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mt: 1,
                                      }}
                                    >
                                      <Tooltip
                                        title={`${candidate.daysInStage} days in this stage`}
                                      >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <TimeIcon fontSize="small" color="action" />
                                          <Typography variant="caption" sx={{ ml: 0.5 }}>
                                            {candidate.daysInStage}d
                                          </Typography>
                                        </Box>
                                      </Tooltip>

                                      {candidate.interviewDate && (
                                        <Tooltip
                                          title={`Interview: ${new Date(candidate.interviewDate).toLocaleString()}`}
                                        >
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CalendarIcon fontSize="small" color="primary" />
                                            <Typography variant="caption" sx={{ ml: 0.5 }}>
                                              {new Date(
                                                candidate.interviewDate
                                              ).toLocaleDateString()}
                                            </Typography>
                                          </Box>
                                        </Tooltip>
                                      )}

                                      {candidate.hasOverdueTasks && (
                                        <Tooltip title="Has overdue tasks">
                                          <WarningIcon fontSize="small" color="error" />
                                        </Tooltip>
                                      )}
                                    </Box>
                                  </CardContent>
                                  <CardActions sx={{ p: 0.5 }}>
                                    <Button
                                      size="small"
                                      startIcon={<TaskIcon fontSize="small" />}
                                      onClick={() => handleOpenTasks(candidate)}
                                    >
                                      Tasks
                                    </Button>
                                    <IconButton
                                      size="small"
                                      component="a"
                                      href={`/candidates/${candidate.candidateId}`}
                                    >
                                      <Tooltip title="View Profile">
                                        <PersonSearchIcon fontSize="small" />
                                      </Tooltip>
                                    </IconButton>
                                  </CardActions>
                                </Card>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <Typography
                            variant="body2"
                            align="center"
                            color="text.secondary"
                            sx={{ py: 2 }}
                          >
                            No candidates in this stage
                          </Typography>
                        )}
                        {provided.placeholder}
                      </Paper>
                    )}
                  </Droppable>
                </Box>
              ))}
          </Box>
        </DragDropContext>
      )}

      {/* Task dialog */}
      <Dialog
        open={showTasksDialog}
        onClose={() => setShowTasksDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Stage Tasks - {selectedCandidate?.candidateName}</DialogTitle>
        <DialogContent>
          {selectedStageTasks.length > 0 ? (
            <List>
              {selectedStageTasks.map((task) => (
                <ListItem key={task.id}>
                  <ListItemIcon>
                    <Checkbox edge="start" checked={task.completed} />
                  </ListItemIcon>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                        <br />
                        Assigned to: {task.assignedTo}
                        {task.dueDate && ` | Due: ${task.dueDate}`}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography align="center" sx={{ py: 2 }}>
              No tasks found for this stage
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTasksDialog(false)}>Close</Button>
          <Button variant="contained" onClick={() => setShowTasksDialog(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleOpenMoveDialog}>
          <ListItemIcon>
            <MoveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move to Stage</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleFlag}>
          <ListItemIcon>
            <FlagIcon fontSize="small" color={selectedCandidate?.flagged ? 'error' : 'inherit'} />
          </ListItemIcon>
          <ListItemText>
            {selectedCandidate?.flagged ? 'Remove Flag' : 'Flag Candidate'}
          </ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <CalendarIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Schedule Interview</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Email</ListItemText>
        </MenuItem>
        <MenuItem component="a" href={`/candidates/${selectedCandidate?.candidateId}`}>
          <ListItemIcon>
            <PersonSearchIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MenuItem>
      </Menu>

      {/* Move Dialog */}
      <Dialog
        open={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Move Candidate to Stage</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Target Stage</InputLabel>
            <Select
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value)}
              label="Target Stage"
            >
              {currentPipeline.stages.map((stage) => (
                <MenuItem key={stage.id} value={stage.id}>
                  {stage.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleMoveCandidate} disabled={!targetStage}>
            Move
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RecruitmentPipeline;
