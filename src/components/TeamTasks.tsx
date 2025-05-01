import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Tooltip,
  FormHelperText,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  SelectChangeEvent,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Flag as FlagIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useCollaboration } from '../contexts/CollaborationContext';
import { Task } from '../models/types';
import { format, isPast, formatDistanceToNow } from 'date-fns';

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
      id={`tasks-tabpanel-${index}`}
      aria-labelledby={`tasks-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

interface TeamTasksProps {
  candidateId?: string;
  showAllTasks?: boolean;
}

const TeamTasks: React.FC<TeamTasksProps> = ({ candidateId, showAllTasks = false }) => {
  const {
    tasks,
    createTask,
    updateTask,
    completeTask,
    assignTask,
    getTasksByAssignee,
    getTasksByCandidate,
    teamMembers,
    currentUser,
    getTeamMemberById,
  } = useCollaboration();

  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // New/edit task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskCandidate, setTaskCandidate] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Form validation errors
  const [titleError, setTitleError] = useState('');
  const [assigneeError, setAssigneeError] = useState('');
  const [dueDateError, setDueDateError] = useState('');

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Filter tasks based on props and tab
  useEffect(() => {
    let tasksToShow: Task[];

    if (candidateId) {
      // When showing tasks for a specific candidate
      tasksToShow = getTasksByCandidate(candidateId);
    } else if (showAllTasks) {
      // When showing all tasks
      tasksToShow = [...tasks];
    } else if (currentUser) {
      // When showing tasks for current user
      tasksToShow = getTasksByAssignee(currentUser.id);
    } else {
      tasksToShow = [];
    }

    // Further filter based on tab
    if (tabValue === 0) {
      // Active tasks
      tasksToShow = tasksToShow.filter((task) => task.status !== 'completed');
    } else if (tabValue === 1) {
      // Completed tasks
      tasksToShow = tasksToShow.filter((task) => task.status === 'completed');
    }

    // Sort tasks
    tasksToShow.sort((a, b) => {
      // Sort by status (pending/in-progress first, then completed)
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      if (a.status === 'completed' && b.status !== 'completed') return 1;

      // Sort by priority
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      // Sort by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    setFilteredTasks(tasksToShow);
  }, [
    tasks,
    candidateId,
    showAllTasks,
    currentUser,
    tabValue,
    getTasksByAssignee,
    getTasksByCandidate,
  ]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenNewTaskDialog = () => {
    // Reset form
    setTaskTitle('');
    setTaskDescription('');
    setTaskAssignee(currentUser ? currentUser.id : '');
    setTaskCandidate(candidateId || '');
    setTaskDueDate(format(new Date(Date.now() + 86400000), "yyyy-MM-dd'T'HH:mm")); // Tomorrow
    setTaskPriority('medium');

    // Reset errors
    setTitleError('');
    setAssigneeError('');
    setDueDateError('');

    setNewTaskDialogOpen(true);
  };

  const handleCloseNewTaskDialog = () => {
    setNewTaskDialogOpen(false);
  };

  const handleOpenEditTaskDialog = (task: Task) => {
    setSelectedTask(task);

    // Populate form with task data
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskAssignee(task.assignedTo);
    setTaskCandidate(task.candidateId || '');
    setTaskDueDate(format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm"));
    setTaskPriority(task.priority);

    // Reset errors
    setTitleError('');
    setAssigneeError('');
    setDueDateError('');

    setEditTaskDialogOpen(true);
  };

  const handleCloseEditTaskDialog = () => {
    setEditTaskDialogOpen(false);
    setSelectedTask(null);
  };

  const handleOpenDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setConfirmDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialogOpen(false);
    setSelectedTask(null);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!taskTitle.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else {
      setTitleError('');
    }

    if (!taskAssignee) {
      setAssigneeError('Assignee is required');
      isValid = false;
    } else {
      setAssigneeError('');
    }

    if (!taskDueDate) {
      setDueDateError('Due date is required');
      isValid = false;
    } else {
      setDueDateError('');
    }

    return isValid;
  };

  const handleCreateTask = () => {
    if (!validateForm()) return;

    createTask({
      title: taskTitle,
      description: taskDescription,
      assignedTo: taskAssignee,
      assignedBy: currentUser ? currentUser.id : 'unknown',
      dueDate: taskDueDate,
      priority: taskPriority,
      candidateId: taskCandidate || undefined,
    });

    handleCloseNewTaskDialog();
  };

  const handleUpdateTask = () => {
    if (!validateForm() || !selectedTask) return;

    updateTask(selectedTask.id, {
      title: taskTitle,
      description: taskDescription,
      assignedTo: taskAssignee,
      dueDate: taskDueDate,
      priority: taskPriority,
      candidateId: taskCandidate || undefined,
      updatedAt: new Date().toISOString(),
    });

    handleCloseEditTaskDialog();
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      // In a real app, you'd call something like deleteTask(selectedTask.id)
      // For now we'll just close the dialog
      handleCloseDeleteDialog();
    }
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
  };

  const handleAssigneeChange = (event: SelectChangeEvent) => {
    setTaskAssignee(event.target.value);
  };

  const handlePriorityChange = (event: SelectChangeEvent) => {
    setTaskPriority(event.target.value as 'low' | 'medium' | 'high' | 'urgent');
  };

  const renderPriorityChip = (priority: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    switch (priority) {
      case 'low':
        color = 'info';
        break;
      case 'medium':
        color = 'success';
        break;
      case 'high':
        color = 'warning';
        break;
      case 'urgent':
        color = 'error';
        break;
      default:
        color = 'default';
    }

    return (
      <Chip
        size="small"
        label={priority.charAt(0).toUpperCase() + priority.slice(1)}
        color={color}
      />
    );
  };

  const renderStatusChip = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    let icon;

    switch (status) {
      case 'pending':
        color = 'warning';
        icon = <HourglassEmptyIcon fontSize="small" />;
        break;
      case 'in-progress':
        color = 'info';
        icon = <ScheduleIcon fontSize="small" />;
        break;
      case 'completed':
        color = 'success';
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      case 'overdue':
        color = 'error';
        icon = <FlagIcon fontSize="small" />;
        break;
      default:
        color = 'default';
        icon = null;
    }

    return (
      <Chip
        size="small"
        icon={icon}
        label={status
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
        color={color}
      />
    );
  };

  const renderDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const isPastDue = isPast(date) && date < new Date();

    return (
      <Typography
        variant="body2"
        color={isPastDue ? 'error' : 'text.secondary'}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
        {format(date, 'MMM dd, yyyy - h:mm a')}
        {isPastDue && <Chip label="Overdue" size="small" color="error" sx={{ ml: 1 }} />}
      </Typography>
    );
  };

  // Render tasks as cards for a more visual presentation
  const renderTaskCards = () => {
    if (filteredTasks.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No {tabValue === 0 ? 'active' : 'completed'} tasks
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {tabValue === 0 ? 'All current tasks have been completed' : 'No completed tasks yet'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenNewTaskDialog}
            sx={{ mt: 2 }}
          >
            Create New Task
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={2}>
        {filteredTasks.map((task) => {
          const assignee = getTeamMemberById(task.assignedTo);
          const assigner = getTeamMemberById(task.assignedBy);
          const isPastDue = isPast(new Date(task.dueDate)) && task.status !== 'completed';
          const isCurrentUserAssigned = currentUser && task.assignedTo === currentUser.id;

          return (
            <Grid item xs={12} md={6} lg={4} key={task.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: '4px solid',
                  borderColor: (theme) =>
                    isPastDue
                      ? theme.palette.error.main
                      : task.status === 'completed'
                        ? theme.palette.success.main
                        : task.priority === 'urgent'
                          ? theme.palette.error.main
                          : task.priority === 'high'
                            ? theme.palette.warning.main
                            : theme.palette.primary.main,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography
                      variant="h6"
                      component="div"
                      gutterBottom
                      noWrap
                      sx={{ maxWidth: '70%' }}
                    >
                      {task.title}
                    </Typography>
                    {renderPriorityChip(task.priority)}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {task.description}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      <strong>Assigned to:</strong>
                    </Typography>
                    <Chip
                      size="small"
                      avatar={
                        <Avatar src={assignee?.avatar} alt={assignee?.name || 'User'}>
                          {!assignee?.avatar && (assignee?.name?.charAt(0) || 'U')}
                        </Avatar>
                      }
                      label={assignee?.name || 'Unknown User'}
                      variant={isCurrentUserAssigned ? 'filled' : 'outlined'}
                      color={isCurrentUserAssigned ? 'primary' : 'default'}
                    />
                  </Box>

                  {renderDueDate(task.dueDate)}

                  <Box sx={{ mt: 1 }}>
                    {renderStatusChip(
                      isPastDue && task.status !== 'completed' ? 'overdue' : task.status
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <Tooltip title="Edit Task">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditTaskDialog(task)}
                        aria-label="edit task"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Task">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(task)}
                        aria-label="delete task"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {task.status !== 'completed' && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      Complete
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {candidateId ? 'Candidate Tasks' : showAllTasks ? 'All Recruitment Tasks' : 'My Tasks'}
        </Typography>

        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNewTaskDialog}>
          New Task
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="task tabs">
          <Tab label="Active Tasks" id="tasks-tab-0" aria-controls="tasks-tabpanel-0" />
          <Tab label="Completed Tasks" id="tasks-tab-1" aria-controls="tasks-tabpanel-1" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderTaskCards()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderTaskCards()}
      </TabPanel>

      {/* New Task Dialog */}
      <Dialog open={newTaskDialogOpen} onClose={handleCloseNewTaskDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Task Title"
            fullWidth
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            error={!!titleError}
            helperText={titleError}
            required
          />

          <TextField
            margin="normal"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />

          <FormControl fullWidth margin="normal" error={!!assigneeError} required>
            <InputLabel id="assignee-label">Assign To</InputLabel>
            <Select
              labelId="assignee-label"
              value={taskAssignee}
              onChange={handleAssigneeChange}
              label="Assign To"
            >
              {teamMembers.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={member.avatar}
                      alt={member.name}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    >
                      {!member.avatar && member.name.charAt(0)}
                    </Avatar>
                    {member.name} ({member.role})
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {assigneeError && <FormHelperText>{assigneeError}</FormHelperText>}
          </FormControl>

          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" error={!!dueDateError} required>
                <TextField
                  label="Due Date & Time"
                  type="datetime-local"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!!dueDateError}
                  helperText={dueDateError}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  value={taskPriority}
                  onChange={handlePriorityChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {!candidateId && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="candidate-label">Related Candidate (Optional)</InputLabel>
              <Select
                labelId="candidate-label"
                value={taskCandidate}
                onChange={(e) => setTaskCandidate(e.target.value)}
                label="Related Candidate (Optional)"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="candidate-1">John Smith (Frontend Developer)</MenuItem>
                <MenuItem value="candidate-2">Sarah Lee (UX Designer)</MenuItem>
                <MenuItem value="candidate-3">Michael Johnson (Product Manager)</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewTaskDialog}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained" color="primary">
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editTaskDialogOpen} onClose={handleCloseEditTaskDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Task Title"
            fullWidth
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            error={!!titleError}
            helperText={titleError}
            required
          />

          <TextField
            margin="normal"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />

          <FormControl fullWidth margin="normal" error={!!assigneeError} required>
            <InputLabel id="edit-assignee-label">Assign To</InputLabel>
            <Select
              labelId="edit-assignee-label"
              value={taskAssignee}
              onChange={handleAssigneeChange}
              label="Assign To"
            >
              {teamMembers.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={member.avatar}
                      alt={member.name}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    >
                      {!member.avatar && member.name.charAt(0)}
                    </Avatar>
                    {member.name} ({member.role})
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {assigneeError && <FormHelperText>{assigneeError}</FormHelperText>}
          </FormControl>

          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" error={!!dueDateError} required>
                <TextField
                  label="Due Date & Time"
                  type="datetime-local"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!!dueDateError}
                  helperText={dueDateError}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="edit-priority-label">Priority</InputLabel>
                <Select
                  labelId="edit-priority-label"
                  value={taskPriority}
                  onChange={handlePriorityChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {!candidateId && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="edit-candidate-label">Related Candidate (Optional)</InputLabel>
              <Select
                labelId="edit-candidate-label"
                value={taskCandidate}
                onChange={(e) => setTaskCandidate(e.target.value)}
                label="Related Candidate (Optional)"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="candidate-1">John Smith (Frontend Developer)</MenuItem>
                <MenuItem value="candidate-2">Sarah Lee (UX Designer)</MenuItem>
                <MenuItem value="candidate-3">Michael Johnson (Product Manager)</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditTaskDialog}>Cancel</Button>
          <Button onClick={handleUpdateTask} variant="contained" color="primary">
            Update Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the task "{selectedTask?.title}"? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteTask} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamTasks;
