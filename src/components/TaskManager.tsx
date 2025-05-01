import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Button,
  Alert,
  IconButton,
  Drawer,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Assignment as TaskIcon,
  RestartAlt as RetryIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import QueueService, { TaskStatus, QueuedTask, TaskType } from '../services/QueueService';

// Task type to display name mapping
const taskTypeLabels: Record<TaskType, string> = {
  [TaskType.DATA_EXPORT]: 'Data Export',
  [TaskType.DATA_IMPORT]: 'Data Import',
  [TaskType.EMAIL_CAMPAIGN]: 'Email Campaign',
  [TaskType.REPORT_GENERATION]: 'Report Generation',
  [TaskType.BULK_UPDATE]: 'Bulk Update',
  [TaskType.CANDIDATE_MATCHING]: 'Candidate Matching',
};

// Color mappings for different statuses
const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: '#faad14',
  [TaskStatus.PROCESSING]: '#1890ff',
  [TaskStatus.COMPLETED]: '#52c41a',
  [TaskStatus.FAILED]: '#f5222d',
  [TaskStatus.CANCELLED]: '#8c8c8c',
};

interface TaskItemProps {
  task: QueuedTask;
  onRetry?: (task: QueuedTask) => void;
  onCancel?: (taskId: string) => void;
  onDownload?: (task: QueuedTask) => void;
  onDelete?: (taskId: string) => void;
}

// Component to display a single task
const TaskItem: React.FC<TaskItemProps> = ({ task, onRetry, onCancel, onDownload, onDelete }) => {
  const getStatusIcon = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED:
        return <SuccessIcon sx={{ color: statusColors[TaskStatus.COMPLETED] }} />;
      case TaskStatus.FAILED:
        return <ErrorIcon sx={{ color: statusColors[TaskStatus.FAILED] }} />;
      case TaskStatus.PENDING:
        return <PendingIcon sx={{ color: statusColors[TaskStatus.PENDING] }} />;
      case TaskStatus.PROCESSING:
        return (
          <CircularProgress
            size={20}
            thickness={5}
            sx={{ color: statusColors[TaskStatus.PROCESSING] }}
          />
        );
      case TaskStatus.CANCELLED:
        return <CloseIcon sx={{ color: statusColors[TaskStatus.CANCELLED] }} />;
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ my: 1, p: 2, position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ mr: 1 }}>{getStatusIcon()}</Box>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          {taskTypeLabels[task.type] || task.type}
        </Typography>
        <Chip
          size="small"
          label={task.status}
          sx={{
            backgroundColor: `${statusColors[task.status]}20`,
            color: statusColors[task.status],
            fontWeight: 'bold',
          }}
        />
      </Box>

      <Box sx={{ mt: 1, mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Created: {task.createdAt.toLocaleString()}
        </Typography>
        {task.completedAt && (
          <Typography variant="body2" color="text.secondary">
            Completed: {task.completedAt.toLocaleString()}
          </Typography>
        )}
      </Box>

      {task.status === TaskStatus.PROCESSING && (
        <Box sx={{ my: 1 }}>
          <LinearProgress variant="determinate" value={task.progress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Progress: {task.progress}%
          </Typography>
        </Box>
      )}

      {task.error && (
        <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
          {task.error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        {task.status === TaskStatus.FAILED && onRetry && (
          <Tooltip title="Retry">
            <IconButton size="small" onClick={() => onRetry(task)} sx={{ mr: 1 }}>
              <RetryIcon />
            </IconButton>
          </Tooltip>
        )}

        {task.status === TaskStatus.PENDING && onCancel && (
          <Tooltip title="Cancel">
            <IconButton size="small" onClick={() => onCancel(task.id)} sx={{ mr: 1 }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        )}

        {task.status === TaskStatus.COMPLETED && task.result && onDownload && (
          <Tooltip title="Download result">
            <IconButton size="small" onClick={() => onDownload(task)} sx={{ mr: 1 }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        )}

        {(task.status === TaskStatus.COMPLETED ||
          task.status === TaskStatus.FAILED ||
          task.status === TaskStatus.CANCELLED) &&
          onDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete(task.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
      </Box>
    </Paper>
  );
};

interface TaskManagerProps {
  userId: string;
  onTask?: (task: QueuedTask) => void;
}

// Main TaskManager component
const TaskManager: React.FC<TaskManagerProps> = ({ userId, onTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<QueuedTask[]>([]);
  const [activeTasks, setActiveTasks] = useState<QueuedTask[]>([]);
  const queueService = QueueService.getInstance();

  // Load tasks when component mounts
  useEffect(() => {
    const loadTasks = () => {
      const userTasks = queueService.getUserTasks(userId);
      setTasks(userTasks);

      // Set active tasks (pending or processing)
      setActiveTasks(
        userTasks.filter(
          (task) => task.status === TaskStatus.PENDING || task.status === TaskStatus.PROCESSING
        )
      );
    };

    // Load initial tasks
    loadTasks();

    // Set up interval to refresh tasks
    const intervalId = setInterval(loadTasks, 3000);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [userId]);

  // Set up task subscriptions
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to all tasks
    tasks.forEach((task) => {
      const unsubscribe = queueService.subscribeToTask(task.id, (updatedTask) => {
        setTasks((prevTasks) => prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));

        // Update active tasks
        setActiveTasks((prevActiveTasks) => {
          const filtered = prevActiveTasks.filter((t) => t.id !== updatedTask.id);
          if (
            updatedTask.status === TaskStatus.PENDING ||
            updatedTask.status === TaskStatus.PROCESSING
          ) {
            return [...filtered, updatedTask];
          }
          return filtered;
        });

        // Call onTask callback if provided
        if (onTask) {
          onTask(updatedTask);
        }
      });

      unsubscribers.push(unsubscribe);
    });

    // Clean up subscriptions on unmount or when tasks change
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [tasks.map((t) => t.id).join(',')]);

  const handleRetry = (task: QueuedTask) => {
    // Create a new task with the same data
    queueService.enqueue({
      type: task.type,
      data: task.data,
      userId: task.userId,
      priority: task.priority,
    });
  };

  const handleCancel = (taskId: string) => {
    queueService.cancelTask(taskId);
  };

  const handleDownload = (task: QueuedTask) => {
    // Implementation depends on the result type
    // This is a basic example for downloading JSON
    if (task.result) {
      const blob = new Blob([JSON.stringify(task.result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `task-${task.id}-result.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDelete = (taskId: string) => {
    // Note: The actual task deletion would typically be handled by the QueueService
    // For now, we'll just update our local state
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Task button with badge showing active tasks count */}
      <Tooltip title="Task Manager">
        <Badge
          badgeContent={activeTasks.length}
          color="primary"
          overlap="circular"
          variant="dot"
          invisible={activeTasks.length === 0}
        >
          <IconButton
            onClick={toggleDrawer}
            color="inherit"
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              zIndex: 1200,
              width: 56,
              height: 56,
            }}
          >
            <TaskIcon />
          </IconButton>
        </Badge>
      </Tooltip>

      {/* Task drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, maxWidth: '100%' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Task Manager
          </Typography>
          <IconButton onClick={toggleDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>

        {activeTasks.length > 0 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Active Tasks ({activeTasks.length})
            </Typography>
            {activeTasks.map((task) => (
              <TaskItem key={task.id} task={task} onCancel={handleCancel} />
            ))}
          </Box>
        )}

        <Divider />

        <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Recent Tasks
          </Typography>

          {tasks.filter(
            (task) => task.status !== TaskStatus.PENDING && task.status !== TaskStatus.PROCESSING
          ).length === 0 ? (
            <Alert severity="info">No completed tasks yet</Alert>
          ) : (
            tasks
              .filter(
                (task) =>
                  task.status !== TaskStatus.PENDING && task.status !== TaskStatus.PROCESSING
              )
              .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
              .map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onRetry={handleRetry}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default TaskManager;
