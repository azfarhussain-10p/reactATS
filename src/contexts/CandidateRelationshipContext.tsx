import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { announce } from '../components/ScreenReaderAnnouncer';

// Types
export interface CandidateRelationship {
  id: string;
  candidateId: string;
  candidateName: string;
  status: 'new' | 'contacted' | 'engaged' | 'nurturing' | 'inactive' | 'converted';
  engagementScore: number;
  lastContactDate: string | null;
  nextContactDate: string | null;
  notes: string;
  assignedTo: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipInteraction {
  id: string;
  relationshipId: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'event' | 'message' | 'social';
  subtype?: string;
  date: string;
  content: string;
  outcome?: string;
  nextSteps?: string;
  sentimentScore?: number; // -1 to 1 scale
  engagementImpact: number; // How much this interaction impacted engagement score
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: string;
}

export interface RelationshipTask {
  id: string;
  relationshipId: string;
  title: string;
  description: string;
  type: 'followup' | 'interview' | 'assessment' | 'outreach' | 'custom';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  completedOn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipMilestone {
  id: string;
  relationshipId: string;
  title: string;
  description: string;
  date: string;
  type: 'first_contact' | 'interview' | 'offer' | 'hire' | 'custom';
  status: 'planned' | 'reached' | 'missed';
  metadata: Record<string, any>;
}

export interface RelationshipAnalytics {
  relationshipId: string;
  responseTime: number; // Average in hours
  responseRate: number; // 0-1
  engagementTrend: Array<{ date: string; score: number }>;
  contactFrequency: number; // Contacts per month
  stageTransitions: Array<{ from: string; to: string; date: string }>;
}

interface CandidateRelationshipContextType {
  // State
  relationships: CandidateRelationship[];
  interactions: RelationshipInteraction[];
  tasks: RelationshipTask[];
  milestones: RelationshipMilestone[];
  relationshipAnalytics: Record<string, RelationshipAnalytics>;

  // Relationship CRUD operations
  createRelationship: (
    relationship: Omit<CandidateRelationship, 'id' | 'createdAt' | 'updatedAt' | 'engagementScore'>
  ) => CandidateRelationship;
  updateRelationship: (
    id: string,
    updates: Partial<CandidateRelationship>
  ) => CandidateRelationship | null;
  deleteRelationship: (id: string) => boolean;

  // Interaction management
  recordInteraction: (
    interaction: Omit<RelationshipInteraction, 'id' | 'createdAt'>
  ) => RelationshipInteraction;
  getInteractions: (relationshipId: string) => RelationshipInteraction[];
  deleteInteraction: (id: string) => boolean;

  // Task management
  createTask: (task: Omit<RelationshipTask, 'id' | 'createdAt' | 'updatedAt'>) => RelationshipTask;
  updateTask: (id: string, updates: Partial<RelationshipTask>) => RelationshipTask | null;
  completeTask: (id: string, notes?: string) => RelationshipTask | null;
  deleteTask: (id: string) => boolean;

  // Milestone management
  addMilestone: (milestone: Omit<RelationshipMilestone, 'id'>) => RelationshipMilestone;
  updateMilestone: (
    id: string,
    updates: Partial<RelationshipMilestone>
  ) => RelationshipMilestone | null;
  deleteMilestone: (id: string) => boolean;

  // Analytics
  getRelationshipAnalytics: (relationshipId: string) => RelationshipAnalytics | null;
  getEngagementHistory: (
    relationshipId: string
  ) => Array<{ date: string; score: number; event?: string }>;
  calculateRelationshipHealth: (relationshipId: string) => {
    score: number;
    insights: string[];
    recommendations: string[];
  };
}

// Sample data
const sampleRelationships: CandidateRelationship[] = [
  {
    id: '1',
    candidateId: 'c1',
    candidateName: 'Alex Johnson',
    status: 'engaged',
    engagementScore: 75,
    lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextContactDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Very promising developer. Referred by Sarah from Engineering.',
    assignedTo: 'recruiter1',
    tags: ['javascript', 'react', 'senior'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    candidateId: 'c2',
    candidateName: 'Maya Patel',
    status: 'nurturing',
    engagementScore: 60,
    lastContactDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    nextContactDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes:
      'Great product management background. Not looking to switch now but worth keeping in touch.',
    assignedTo: 'recruiter2',
    tags: ['product', 'management', 'saas'],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const sampleInteractions: RelationshipInteraction[] = [
  {
    id: '1',
    relationshipId: '1',
    type: 'email',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    content: 'Sent initial outreach email about senior developer position',
    outcome: 'Responded positively',
    nextSteps: 'Schedule initial call',
    sentimentScore: 0.8,
    engagementImpact: 15,
    metadata: { template: 'senior-dev-outreach' },
    createdBy: 'recruiter1',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    relationshipId: '1',
    type: 'call',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    content: 'Initial screening call. Discussed experience and interest in our company.',
    outcome: 'Interested in proceeding',
    nextSteps: 'Schedule technical interview',
    sentimentScore: 0.7,
    engagementImpact: 20,
    metadata: { duration: '25 minutes' },
    createdBy: 'recruiter1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const sampleTasks: RelationshipTask[] = [
  {
    id: '1',
    relationshipId: '1',
    title: 'Schedule technical interview',
    description: 'Coordinate with engineering team for technical assessment',
    type: 'interview',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'pending',
    assignedTo: 'recruiter1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const sampleMilestones: RelationshipMilestone[] = [
  {
    id: '1',
    relationshipId: '1',
    title: 'Initial Contact',
    description: 'First outreach via email',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'first_contact',
    status: 'reached',
    metadata: {},
  },
  {
    id: '2',
    relationshipId: '1',
    title: 'First Interview',
    description: 'Initial screening interview',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'interview',
    status: 'reached',
    metadata: { interviewer: 'recruiter1' },
  },
];

const sampleAnalytics: Record<string, RelationshipAnalytics> = {
  '1': {
    relationshipId: '1',
    responseTime: 8.5,
    responseRate: 0.9,
    engagementTrend: [
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), score: 40 },
      { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), score: 45 },
      { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), score: 60 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), score: 75 },
    ],
    contactFrequency: 3.5,
    stageTransitions: [
      {
        from: 'new',
        to: 'contacted',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        from: 'contacted',
        to: 'engaged',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
};

// Create context
const CandidateRelationshipContext = createContext<CandidateRelationshipContextType | undefined>(
  undefined
);

// Provider component
export const CandidateRelationshipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [relationships, setRelationships] = useState<CandidateRelationship[]>(sampleRelationships);
  const [interactions, setInteractions] = useState<RelationshipInteraction[]>(sampleInteractions);
  const [tasks, setTasks] = useState<RelationshipTask[]>(sampleTasks);
  const [milestones, setMilestones] = useState<RelationshipMilestone[]>(sampleMilestones);
  const [relationshipAnalytics, setRelationshipAnalytics] =
    useState<Record<string, RelationshipAnalytics>>(sampleAnalytics);

  // Create a new candidate relationship
  const createRelationship = (
    relationshipData: Omit<
      CandidateRelationship,
      'id' | 'createdAt' | 'updatedAt' | 'engagementScore'
    >
  ): CandidateRelationship => {
    const timestamp = new Date().toISOString();
    const newRelationship: CandidateRelationship = {
      ...relationshipData,
      id: uuidv4(),
      engagementScore: 10, // Initial score for new relationship
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setRelationships([...relationships, newRelationship]);
    announce(`Created new relationship with ${newRelationship.candidateName}`);
    return newRelationship;
  };

  // Update an existing relationship
  const updateRelationship = (
    id: string,
    updates: Partial<CandidateRelationship>
  ): CandidateRelationship | null => {
    const index = relationships.findIndex((rel) => rel.id === id);
    if (index === -1) return null;

    const updatedRelationship = {
      ...relationships[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedRelationships = [...relationships];
    updatedRelationships[index] = updatedRelationship;
    setRelationships(updatedRelationships);

    announce(`Updated relationship with ${updatedRelationship.candidateName}`);
    return updatedRelationship;
  };

  // Delete a relationship
  const deleteRelationship = (id: string): boolean => {
    const index = relationships.findIndex((rel) => rel.id === id);
    if (index === -1) return false;

    const candidateName = relationships[index].candidateName;
    const updatedRelationships = relationships.filter((rel) => rel.id !== id);
    setRelationships(updatedRelationships);

    // Also delete related items
    setInteractions(interactions.filter((interaction) => interaction.relationshipId !== id));
    setTasks(tasks.filter((task) => task.relationshipId !== id));
    setMilestones(milestones.filter((milestone) => milestone.relationshipId !== id));

    announce(`Deleted relationship with ${candidateName}`);
    return true;
  };

  // Record a new interaction
  const recordInteraction = (
    interactionData: Omit<RelationshipInteraction, 'id' | 'createdAt'>
  ): RelationshipInteraction => {
    const timestamp = new Date().toISOString();
    const newInteraction: RelationshipInteraction = {
      ...interactionData,
      id: uuidv4(),
      createdAt: timestamp,
    };

    setInteractions([...interactions, newInteraction]);

    // Update the relationship's last contact date and engagement score
    const relationshipIndex = relationships.findIndex(
      (rel) => rel.id === interactionData.relationshipId
    );
    if (relationshipIndex !== -1) {
      const updatedRelationship = {
        ...relationships[relationshipIndex],
        lastContactDate: interactionData.date,
        engagementScore: Math.min(
          100,
          relationships[relationshipIndex].engagementScore + interactionData.engagementImpact
        ),
        updatedAt: timestamp,
      };

      const updatedRelationships = [...relationships];
      updatedRelationships[relationshipIndex] = updatedRelationship;
      setRelationships(updatedRelationships);
    }

    announce(`Recorded new ${interactionData.type} interaction`);
    return newInteraction;
  };

  // Get interactions for a specific relationship
  const getInteractions = (relationshipId: string): RelationshipInteraction[] => {
    return interactions
      .filter((interaction) => interaction.relationshipId === relationshipId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Delete an interaction
  const deleteInteraction = (id: string): boolean => {
    const index = interactions.findIndex((interaction) => interaction.id === id);
    if (index === -1) return false;

    const updatedInteractions = interactions.filter((interaction) => interaction.id !== id);
    setInteractions(updatedInteractions);

    announce(`Deleted interaction`);
    return true;
  };

  // Create a new task
  const createTask = (
    taskData: Omit<RelationshipTask, 'id' | 'createdAt' | 'updatedAt'>
  ): RelationshipTask => {
    const timestamp = new Date().toISOString();
    const newTask: RelationshipTask = {
      ...taskData,
      id: uuidv4(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setTasks([...tasks, newTask]);
    announce(`Created new task: ${newTask.title}`);
    return newTask;
  };

  // Update an existing task
  const updateTask = (id: string, updates: Partial<RelationshipTask>): RelationshipTask | null => {
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) return null;

    const updatedTask = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    setTasks(updatedTasks);

    announce(`Updated task: ${updatedTask.title}`);
    return updatedTask;
  };

  // Mark a task as complete
  const completeTask = (id: string, notes?: string): RelationshipTask | null => {
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) return null;

    const updatedTask = {
      ...tasks[index],
      status: 'completed' as const,
      completedOn: new Date().toISOString(),
      description: notes
        ? `${tasks[index].description}\n\nCompletion notes: ${notes}`
        : tasks[index].description,
      updatedAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    setTasks(updatedTasks);

    announce(`Completed task: ${updatedTask.title}`);
    return updatedTask;
  };

  // Delete a task
  const deleteTask = (id: string): boolean => {
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) return false;

    const taskTitle = tasks[index].title;
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);

    announce(`Deleted task: ${taskTitle}`);
    return true;
  };

  // Add a milestone
  const addMilestone = (
    milestoneData: Omit<RelationshipMilestone, 'id'>
  ): RelationshipMilestone => {
    const newMilestone: RelationshipMilestone = {
      ...milestoneData,
      id: uuidv4(),
    };

    setMilestones([...milestones, newMilestone]);
    announce(`Added milestone: ${newMilestone.title}`);
    return newMilestone;
  };

  // Update a milestone
  const updateMilestone = (
    id: string,
    updates: Partial<RelationshipMilestone>
  ): RelationshipMilestone | null => {
    const index = milestones.findIndex((milestone) => milestone.id === id);
    if (index === -1) return null;

    const updatedMilestone = {
      ...milestones[index],
      ...updates,
    };

    const updatedMilestones = [...milestones];
    updatedMilestones[index] = updatedMilestone;
    setMilestones(updatedMilestones);

    announce(`Updated milestone: ${updatedMilestone.title}`);
    return updatedMilestone;
  };

  // Delete a milestone
  const deleteMilestone = (id: string): boolean => {
    const index = milestones.findIndex((milestone) => milestone.id === id);
    if (index === -1) return false;

    const milestoneTitle = milestones[index].title;
    const updatedMilestones = milestones.filter((milestone) => milestone.id !== id);
    setMilestones(updatedMilestones);

    announce(`Deleted milestone: ${milestoneTitle}`);
    return true;
  };

  // Get analytics for a relationship
  const getRelationshipAnalytics = (relationshipId: string): RelationshipAnalytics | null => {
    return relationshipAnalytics[relationshipId] || null;
  };

  // Get engagement history for a relationship
  const getEngagementHistory = (
    relationshipId: string
  ): Array<{ date: string; score: number; event?: string }> => {
    const analytics = relationshipAnalytics[relationshipId];
    if (!analytics) return [];

    // Create a basic history from the analytics trend
    const history = [...analytics.engagementTrend];

    // Enrich with events from interactions
    const relationshipInteractions = interactions.filter(
      (i) => i.relationshipId === relationshipId
    );
    relationshipInteractions.forEach((interaction) => {
      const existingIndex = history.findIndex(
        (h) => new Date(h.date).toDateString() === new Date(interaction.date).toDateString()
      );

      if (existingIndex !== -1) {
        history[existingIndex].event = interaction.type;
      } else {
        // Find the engagement score for this date by interpolating
        const sortedHistory = [...history].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        let score = 0;

        // Simple scoring - just use the last known score before this date
        const interactionTime = new Date(interaction.date).getTime();
        for (const entry of sortedHistory) {
          if (new Date(entry.date).getTime() <= interactionTime) {
            score = entry.score;
          } else {
            break;
          }
        }

        history.push({
          date: interaction.date,
          score: score + interaction.engagementImpact,
          event: interaction.type,
        });
      }
    });

    // Sort by date
    return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Calculate relationship health
  const calculateRelationshipHealth = (
    relationshipId: string
  ): { score: number; insights: string[]; recommendations: string[] } => {
    const relationship = relationships.find((r) => r.id === relationshipId);
    if (!relationship) {
      return { score: 0, insights: [], recommendations: ['Relationship not found'] };
    }

    const relationshipInteractions = interactions.filter(
      (i) => i.relationshipId === relationshipId
    );
    const analytics = relationshipAnalytics[relationshipId];

    // Simple analysis based on engagement score and recent activity
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Analyze last contact
    if (relationship.lastContactDate) {
      const daysSinceLastContact = Math.floor(
        (Date.now() - new Date(relationship.lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastContact > 30) {
        insights.push(`No contact in ${daysSinceLastContact} days`);
        recommendations.push('Schedule a follow-up to re-engage');
      }
    }

    // Analyze engagement trend
    if (analytics && analytics.engagementTrend.length >= 2) {
      const latest = analytics.engagementTrend[analytics.engagementTrend.length - 1].score;
      const previous = analytics.engagementTrend[analytics.engagementTrend.length - 2].score;

      if (latest < previous) {
        insights.push('Engagement is declining');
        recommendations.push('Consider personalized outreach or valuable content sharing');
      }
    }

    // Analyze interaction diversity
    const interactionTypes = new Set(relationshipInteractions.map((i) => i.type));
    if (interactionTypes.size <= 1 && relationshipInteractions.length > 1) {
      insights.push('Limited variety of interactions');
      recommendations.push('Diversify communication channels for better engagement');
    }

    // Calculate health score (0-100) based on engagement score and other factors
    let healthScore = relationship.engagementScore;

    // Adjust based on insights (each negative insight reduces score)
    healthScore -= insights.length * 5;

    // Ensure score is in valid range
    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      score: healthScore,
      insights,
      recommendations,
    };
  };

  const value: CandidateRelationshipContextType = {
    relationships,
    interactions,
    tasks,
    milestones,
    relationshipAnalytics,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    recordInteraction,
    getInteractions,
    deleteInteraction,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    getRelationshipAnalytics,
    getEngagementHistory,
    calculateRelationshipHealth,
  };

  return (
    <CandidateRelationshipContext.Provider value={value}>
      {children}
    </CandidateRelationshipContext.Provider>
  );
};

// Custom hook for consuming the context
export const useCandidateRelationship = () => {
  const context = useContext(CandidateRelationshipContext);
  if (context === undefined) {
    throw new Error('useCandidateRelationship must be used within a CandidateRelationshipProvider');
  }
  return context;
};
