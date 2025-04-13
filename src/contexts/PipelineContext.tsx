import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PipelineStage, RecruitmentPipeline, StageTask } from '../models/types';

// Define default pipeline stages
const defaultPipelineStages = [
  { id: 'Applied' as PipelineStage, name: 'Applied', order: 0, daysToComplete: 2 },
  { id: 'Screening' as PipelineStage, name: 'Screening', order: 1, daysToComplete: 5 },
  { id: 'First Interview' as PipelineStage, name: 'First Interview', order: 2, daysToComplete: 7 },
  { id: 'Technical Assessment' as PipelineStage, name: 'Technical Assessment', order: 3, daysToComplete: 5 },
  { id: 'Team Interview' as PipelineStage, name: 'Team Interview', order: 4, daysToComplete: 7 },
  { id: 'Final Interview' as PipelineStage, name: 'Final Interview', order: 5, daysToComplete: 5 },
  { id: 'Reference Check' as PipelineStage, name: 'Reference Check', order: 6, daysToComplete: 3 },
  { id: 'Offer' as PipelineStage, name: 'Offer', order: 7, daysToComplete: 5 },
  { id: 'Hired' as PipelineStage, name: 'Hired', order: 8 },
  { id: 'Rejected' as PipelineStage, name: 'Rejected', order: 9 },
  { id: 'Withdrawn' as PipelineStage, name: 'Withdrawn', order: 10 },
];

// Define default pipelines
const defaultPipelines: RecruitmentPipeline[] = [
  {
    id: uuidv4(),
    name: 'Standard Recruitment',
    stages: defaultPipelineStages,
    defaultPipeline: true
  },
  {
    id: uuidv4(),
    name: 'Technical Roles',
    stages: [
      ...defaultPipelineStages.slice(0, 3),
      { id: 'Technical Assessment' as PipelineStage, name: 'Technical Assessment', order: 3, daysToComplete: 7, requiredTasks: [] },
      { id: 'Pair Programming' as PipelineStage, name: 'Pair Programming', order: 4, daysToComplete: 3, requiredTasks: [] },
      ...defaultPipelineStages.slice(4),
    ],
    defaultPipeline: false
  },
  {
    id: uuidv4(),
    name: 'Executive Roles',
    stages: [
      { id: 'Applied' as PipelineStage, name: 'Applied', order: 0, daysToComplete: 2, requiredTasks: [] },
      { id: 'Screening' as PipelineStage, name: 'Initial Screening', order: 1, daysToComplete: 5, requiredTasks: [] },
      { id: 'First Interview' as PipelineStage, name: 'Department Interview', order: 2, daysToComplete: 7, requiredTasks: [] },
      { id: 'Team Interview' as PipelineStage, name: 'Executive Panel', order: 3, daysToComplete: 7, requiredTasks: [] },
      { id: 'Reference Check' as PipelineStage, name: 'Reference Check', order: 4, daysToComplete: 5, requiredTasks: [] },
      { id: 'Final Interview' as PipelineStage, name: 'CEO Interview', order: 5, daysToComplete: 5, requiredTasks: [] },
      { id: 'Offer' as PipelineStage, name: 'Offer', order: 6, daysToComplete: 7, requiredTasks: [] },
      { id: 'Hired' as PipelineStage, name: 'Hired', order: 7, requiredTasks: [] },
      { id: 'Rejected' as PipelineStage, name: 'Rejected', order: 8, requiredTasks: [] },
      { id: 'Withdrawn' as PipelineStage, name: 'Withdrawn', order: 9, requiredTasks: [] },
    ],
    defaultPipeline: false
  }
];

// Mock tasks
const defaultTasks: StageTask[] = [
  {
    id: uuidv4(),
    title: 'Review Resume',
    description: 'Initial review of candidate resume',
    assignedTo: 'HR Manager',
    dueDate: '',
    completed: false,
    required: true,
    stageId: 'Applied'
  },
  {
    id: uuidv4(),
    title: 'Phone Screening',
    description: 'Conduct initial phone screening call',
    assignedTo: 'Recruiter',
    dueDate: '',
    completed: false,
    required: true,
    stageId: 'Screening'
  },
  {
    id: uuidv4(),
    title: 'Technical Assessment',
    description: 'Send and evaluate technical assessment',
    assignedTo: 'Tech Lead',
    dueDate: '',
    completed: false,
    required: true,
    stageId: 'Technical Assessment'
  }
];

// Define context type
interface PipelineContextType {
  pipelines: RecruitmentPipeline[];
  tasks: StageTask[];
  addPipeline: (pipeline: Omit<RecruitmentPipeline, 'id'>) => string;
  updatePipeline: (id: string, updates: Partial<RecruitmentPipeline>) => boolean;
  deletePipeline: (id: string) => boolean;
  getPipelineById: (id: string) => RecruitmentPipeline | null;
  getDefaultPipeline: () => RecruitmentPipeline;
  setDefaultPipeline: (id: string) => boolean;
  addTask: (task: Omit<StageTask, 'id'>) => string;
  updateTask: (id: string, updates: Partial<StageTask>) => boolean;
  deleteTask: (id: string) => boolean;
  getTasksForStage: (stageId: PipelineStage) => StageTask[];
  getTasksForCandidate: (candidateId: number, stageId: PipelineStage) => StageTask[];
  completeTasks: (taskIds: string[]) => boolean;
}

// Create context
const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

// Provider component
export const PipelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pipelines, setPipelines] = useState<RecruitmentPipeline[]>(defaultPipelines);
  const [tasks, setTasks] = useState<StageTask[]>(defaultTasks);

  // Add a new pipeline
  const addPipeline = (pipelineData: Omit<RecruitmentPipeline, 'id'>) => {
    const newId = uuidv4();
    const newPipeline: RecruitmentPipeline = {
      ...pipelineData,
      id: newId
    };
    
    setPipelines(prev => [...prev, newPipeline]);
    return newId;
  };

  // Update a pipeline
  const updatePipeline = (id: string, updates: Partial<RecruitmentPipeline>) => {
    let updated = false;
    
    setPipelines(prev => {
      const newPipelines = prev.map(pipeline => {
        if (pipeline.id === id) {
          updated = true;
          return { ...pipeline, ...updates };
        }
        return pipeline;
      });
      
      return newPipelines;
    });
    
    return updated;
  };

  // Delete a pipeline
  const deletePipeline = (id: string) => {
    let deleted = false;
    
    setPipelines(prev => {
      const defaultExists = prev.some(p => p.defaultPipeline && p.id !== id);
      
      // Don't allow deleting the default pipeline if it's the only one
      if (!defaultExists && prev.find(p => p.id === id)?.defaultPipeline) {
        return prev;
      }
      
      const filtered = prev.filter(pipeline => {
        if (pipeline.id === id) {
          deleted = true;
          return false;
        }
        return true;
      });
      
      // If we deleted the default, set a new default
      if (deleted && prev.find(p => p.id === id)?.defaultPipeline && filtered.length > 0) {
        filtered[0].defaultPipeline = true;
      }
      
      return filtered;
    });
    
    return deleted;
  };

  // Get a pipeline by ID
  const getPipelineById = (id: string) => {
    return pipelines.find(pipeline => pipeline.id === id) || null;
  };

  // Get the default pipeline
  const getDefaultPipeline = () => {
    return pipelines.find(pipeline => pipeline.defaultPipeline) || pipelines[0];
  };

  // Set a pipeline as the default
  const setDefaultPipeline = (id: string) => {
    const pipeline = getPipelineById(id);
    if (!pipeline) return false;
    
    setPipelines(prev => 
      prev.map(p => ({
        ...p,
        defaultPipeline: p.id === id
      }))
    );
    
    return true;
  };

  // Add a new task
  const addTask = (taskData: Omit<StageTask, 'id'>) => {
    const newId = uuidv4();
    const newTask: StageTask = {
      ...taskData,
      id: newId
    };
    
    setTasks(prev => [...prev, newTask]);
    return newId;
  };

  // Update a task
  const updateTask = (id: string, updates: Partial<StageTask>) => {
    let updated = false;
    
    setTasks(prev => {
      const newTasks = prev.map(task => {
        if (task.id === id) {
          updated = true;
          return { ...task, ...updates };
        }
        return task;
      });
      
      return newTasks;
    });
    
    return updated;
  };

  // Delete a task
  const deleteTask = (id: string) => {
    let deleted = false;
    
    setTasks(prev => {
      const filtered = prev.filter(task => {
        if (task.id === id) {
          deleted = true;
          return false;
        }
        return true;
      });
      
      return filtered;
    });
    
    return deleted;
  };

  // Get tasks for a specific stage
  const getTasksForStage = (stageId: PipelineStage) => {
    return tasks.filter(task => task.stageId === stageId);
  };

  // Get tasks for a specific candidate in a stage
  // In a real implementation, we would have candidate-specific tasks
  const getTasksForCandidate = (candidateId: number, stageId: PipelineStage) => {
    // For this mock version, we'll just return stage tasks
    return getTasksForStage(stageId);
  };

  // Complete multiple tasks
  const completeTasks = (taskIds: string[]) => {
    let allCompleted = true;
    
    setTasks(prev => {
      const newTasks = prev.map(task => {
        if (taskIds.includes(task.id)) {
          return { ...task, completed: true };
        }
        return task;
      });
      
      return newTasks;
    });
    
    return allCompleted;
  };

  const value = {
    pipelines,
    tasks,
    addPipeline,
    updatePipeline,
    deletePipeline,
    getPipelineById,
    getDefaultPipeline,
    setDefaultPipeline,
    addTask,
    updateTask,
    deleteTask,
    getTasksForStage,
    getTasksForCandidate,
    completeTasks
  };

  return (
    <PipelineContext.Provider value={value}>
      {children}
    </PipelineContext.Provider>
  );
};

// Custom hook to use pipeline context
export const usePipeline = () => {
  const context = useContext(PipelineContext);
  if (context === undefined) {
    throw new Error('usePipeline must be used within a PipelineProvider');
  }
  return context;
};

export default PipelineContext; 