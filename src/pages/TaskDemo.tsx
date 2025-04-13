import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
  Slider,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import TaskManager from '../components/TaskManager';
import QueueService, { TaskStatus, TaskType } from '../services/QueueService';

// Demo user ID
const DEMO_USER_ID = 'demo-user-123';

// Task type definition
interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done';
}

// Mock initial data
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Review candidate applications',
    description: 'Review all new applications for the Senior Developer position',
    assignee: 'Jane Smith',
    dueDate: '2023-08-15',
    priority: 'High',
    status: 'In Progress'
  },
  {
    id: '2',
    title: 'Schedule technical interviews',
    description: 'Coordinate with the engineering team to schedule technical interviews',
    assignee: 'John Doe',
    dueDate: '2023-08-20',
    priority: 'Medium',
    status: 'To Do'
  },
  {
    id: '3',
    title: 'Update job descriptions',
    description: 'Update job descriptions for all open positions',
    assignee: 'Jane Smith',
    dueDate: '2023-08-10',
    priority: 'Low',
    status: 'Done'
  }
];

const TaskDemo: React.FC = () => {
  const [taskType, setTaskType] = useState<TaskType>(TaskType.DATA_EXPORT);
  const [priority, setPriority] = useState<number>(5);
  const [dataInput, setDataInput] = useState<string>('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  const queueService = QueueService.getInstance();
  
  const handleCreateTask = () => {
    try {
      // Parse JSON data if provided, otherwise use empty object
      const taskData = dataInput ? JSON.parse(dataInput) : {};
      
      // Create a new task
      const taskId = queueService.enqueue({
        type: taskType,
        data: taskData,
        userId: DEMO_USER_ID,
        priority
      });
      
      // Show success notification
      setNotification({
        type: 'success',
        message: `Task created successfully with ID: ${taskId}`
      });
      
      // Clear input
      setDataInput('');
      
      // Simulate task processing for demo purposes
      simulateTaskProcessing(taskId);
    } catch (error) {
      // Show error notification for JSON parsing
      setNotification({
        type: 'error',
        message: `Error creating task: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };
  
  const simulateTaskProcessing = (taskId: string) => {
    // Start processing after a brief delay
    setTimeout(() => {
      const task = queueService.getTask(taskId);
      if (task && task.status === TaskStatus.PENDING) {
        task.status = TaskStatus.PROCESSING;
        queueService.updateTaskProgress(taskId, 0);
        
        // Simulate progress updates
        let progress = 0;
        const intervalId = setInterval(() => {
          progress += Math.floor(Math.random() * 10) + 1;
          if (progress >= 100) {
            progress = 100;
            clearInterval(intervalId);
            
            // 80% chance of success, 20% chance of failure
            if (Math.random() < 0.8) {
              // Simulate successful completion
              const mockResults = getMockResultForTaskType(task.type);
              task.status = TaskStatus.COMPLETED;
              task.result = mockResults;
              task.completedAt = new Date();
            } else {
              // Simulate failure
              task.status = TaskStatus.FAILED;
              task.error = 'Simulated random failure for demonstration';
            }
          }
          
          queueService.updateTaskProgress(taskId, progress);
        }, 1000);
      }
    }, 1500);
  };
  
  const getMockResultForTaskType = (type: TaskType) => {
    switch (type) {
      case TaskType.DATA_EXPORT:
        return {
          fileUrl: 'https://example.com/exports/data.csv',
          exportedRows: Math.floor(Math.random() * 1000) + 100,
          timestamp: new Date().toISOString()
        };
      case TaskType.DATA_IMPORT:
        return {
          importedRows: Math.floor(Math.random() * 500) + 50,
          failedRows: Math.floor(Math.random() * 10),
          timestamp: new Date().toISOString()
        };
      case TaskType.EMAIL_CAMPAIGN:
        return {
          sentEmails: Math.floor(Math.random() * 200) + 20,
          failedEmails: Math.floor(Math.random() * 5),
          openRate: (Math.random() * 0.5 + 0.2).toFixed(2),
          timestamp: new Date().toISOString()
        };
      case TaskType.REPORT_GENERATION:
        return {
          reportUrl: 'https://example.com/reports/report.pdf',
          pageCount: Math.floor(Math.random() * 20) + 5,
          timestamp: new Date().toISOString()
        };
      case TaskType.BULK_UPDATE:
        return {
          updatedRecords: Math.floor(Math.random() * 300) + 30,
          failedUpdates: Math.floor(Math.random() * 8),
          timestamp: new Date().toISOString()
        };
      case TaskType.CANDIDATE_MATCHING:
        return {
          matchedCandidates: Math.floor(Math.random() * 50) + 5,
          averageMatchScore: (Math.random() * 0.4 + 0.6).toFixed(2),
          timestamp: new Date().toISOString()
        };
      default:
        return {
          status: 'completed',
          timestamp: new Date().toISOString()
        };
    }
  };
  
  // Reset form
  const resetForm = () => {
    setTaskType(TaskType.DATA_EXPORT);
    setPriority(5);
    setDataInput('');
    setCurrentTask(null);
  };
  
  // Handle dialog open for new task
  const handleOpenDialog = () => {
    resetForm();
    setOpenDialog(true);
  };
  
  // Handle dialog open for edit task
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setTaskType(task.type);
    setPriority(task.priority);
    setDataInput(JSON.stringify(task.data));
    setOpenDialog(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };
  
  // Handle form submit
  const handleSubmit = () => {
    if (!dataInput) {
      setNotification({
        type: 'error',
        message: 'Please fill out all required fields'
      });
      return;
    }
    
    const newTask: Task = {
      id: currentTask ? currentTask.id : Date.now().toString(),
      title: currentTask?.title || '',
      description: currentTask?.description || '',
      assignee: currentTask?.assignee || '',
      dueDate: currentTask?.dueDate || '',
      priority: currentTask?.priority || 'Medium',
      status: currentTask?.status || 'To Do'
    };
    
    if (currentTask) {
      // Update existing task
      setTasks(tasks.map(task => task.id === currentTask.id ? newTask : task));
      setNotification({
        type: 'success',
        message: 'Task updated successfully'
      });
    } else {
      // Add new task
      setTasks([...tasks, newTask]);
      setNotification({
        type: 'success',
        message: 'Task created successfully'
      });
    }
    
    handleCloseDialog();
  };
  
  // Handle delete task
  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    setNotification({
      type: 'success',
      message: 'Task deleted successfully'
    });
  };
  
  // Handle status change
  const handleStatusChange = (id: string, newStatus: 'To Do' | 'In Progress' | 'Done') => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: newStatus } : task
    ));
    setNotification({
      type: 'success',
      message: 'Status updated successfully'
    });
  };
  
  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  // Get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };
  
  // Get color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'info';
      case 'In Progress': return 'warning';
      case 'Done': return 'success';
      default: return 'default';
    }
  };
  
  const exampleDataJSON = `{
  "filters": {
    "status": "active",
    "dateRange": { "from": "2023-01-01", "to": "2023-12-31" }
  },
  "format": "csv",
  "includeHeaders": true
}`;
  
  const handleTaskUpdate = (task: any) => {
    if (task.status === TaskStatus.COMPLETED) {
      setNotification({
        type: 'success',
        message: `Task ${task.id} completed successfully!`
      });
    } else if (task.status === TaskStatus.FAILED) {
      setNotification({
        type: 'error',
        message: `Task ${task.id} failed: ${task.error}`
      });
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Async Task Processing Demo
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Create New Task
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Task Type</InputLabel>
              <Select
                value={taskType}
                label="Task Type"
                onChange={(e) => setTaskType(e.target.value as TaskType)}
              >
                <MenuItem value={TaskType.DATA_EXPORT}>Data Export</MenuItem>
                <MenuItem value={TaskType.DATA_IMPORT}>Data Import</MenuItem>
                <MenuItem value={TaskType.EMAIL_CAMPAIGN}>Email Campaign</MenuItem>
                <MenuItem value={TaskType.REPORT_GENERATION}>Report Generation</MenuItem>
                <MenuItem value={TaskType.BULK_UPDATE}>Bulk Update</MenuItem>
                <MenuItem value={TaskType.CANDIDATE_MATCHING}>Candidate Matching</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>
                Priority: {priority}
              </Typography>
              <Slider
                value={priority}
                onChange={(_, value) => setPriority(value as number)}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
            
            <TextField
              label="Task Data (JSON)"
              multiline
              rows={6}
              fullWidth
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              placeholder={exampleDataJSON}
              sx={{ mb: 3 }}
              variant="outlined"
            />
            
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={handleOpenDialog}
            >
              Create Task
            </Button>
          </Paper>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About Queue Service
              </Typography>
              <Typography variant="body2" paragraph>
                The Queue Service provides functionality to process long-running tasks asynchronously in the background, improving the responsiveness of the main application.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Features:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">• Task prioritization</Typography>
                <Typography variant="body2">• Real-time progress tracking</Typography>
                <Typography variant="body2">• Task status notifications</Typography>
                <Typography variant="body2">• Automatic retries for failed tasks</Typography>
                <Typography variant="body2">• Result download capability</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Task Manager Demo
            </Typography>
            <Typography variant="body2" paragraph>
              The TaskManager component provides a UI for monitoring and managing asynchronous tasks. It displays active tasks, allows for cancellation, and shows task history.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Try it out:
            </Typography>
            <Typography variant="body2" paragraph>
              1. Create a task using the form on the left
            </Typography>
            <Typography variant="body2" paragraph>
              2. Click the task icon in the bottom-right corner to open the TaskManager
            </Typography>
            <Typography variant="body2" paragraph>
              3. Monitor task progress, cancel tasks, or download results
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <img 
                src="https://via.placeholder.com/350x200?text=Task+Manager+Demo" 
                alt="Task Manager Demo"
                style={{ maxWidth: '100%', borderRadius: 8 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Task Manager Component (fixed position) */}
      <TaskManager userId={DEMO_USER_ID} onTask={handleTaskUpdate} />
      
      {/* Notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {notification && (
          <Alert 
            onClose={() => setNotification(null)} 
            severity={notification.type}
            variant="filled"
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
      
      {/* Task Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Task Title"
              name="title"
              value={currentTask?.title || ''}
              onChange={(e) => setCurrentTask(prev => prev ? { ...prev, title: e.target.value } : prev)}
            />
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Description"
              name="description"
              multiline
              rows={3}
              value={currentTask?.description || ''}
              onChange={(e) => setCurrentTask(prev => prev ? { ...prev, description: e.target.value } : prev)}
            />
            <Box display="flex" gap={2} mt={2}>
              <TextField
                required
                fullWidth
                id="assignee"
                label="Assignee"
                name="assignee"
                value={currentTask?.assignee || ''}
                onChange={(e) => setCurrentTask(prev => prev ? { ...prev, assignee: e.target.value } : prev)}
              />
              <TextField
                required
                fullWidth
                id="dueDate"
                label="Due Date"
                name="dueDate"
                type="date"
                value={currentTask?.dueDate || ''}
                onChange={(e) => setCurrentTask(prev => prev ? { ...prev, dueDate: e.target.value } : prev)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            <Box display="flex" gap={2} mt={2}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  value={currentTask?.priority || 'Medium'}
                  label="Priority"
                  onChange={(e) => setCurrentTask(prev => prev ? { ...prev, priority: e.target.value as any } : prev)}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  value={currentTask?.status || 'To Do'}
                  label="Status"
                  onChange={(e) => setCurrentTask(prev => prev ? { ...prev, status: e.target.value as any } : prev)}
                >
                  <MenuItem value="To Do">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskDemo; 