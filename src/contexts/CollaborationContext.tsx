import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  CollaborativeNote,
  Message,
  TeamMember,
  CollaborationTask,
  DecisionVote,
  SharedDocument,
  UserRole,
} from '../models/types';
import { announce } from '../components/ScreenReaderAnnouncer';

// Mock team members data
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'Recruiter',
    department: 'HR',
    avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
    notifications: [
      { type: 'mention', channel: 'both' },
      { type: 'message', channel: 'both' },
      { type: 'task', channel: 'email' },
      { type: 'note', channel: 'in_app' },
      { type: 'candidate_update', channel: 'email' },
      { type: 'interview_feedback', channel: 'both' },
      { type: 'decision', channel: 'both' },
    ],
  },
  {
    id: '2',
    name: 'David Lee',
    email: 'david.lee@company.com',
    role: 'Hiring Manager',
    department: 'Engineering',
    avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
    notifications: [
      { type: 'mention', channel: 'both' },
      { type: 'message', channel: 'in_app' },
      { type: 'task', channel: 'both' },
      { type: 'note', channel: 'in_app' },
      { type: 'candidate_update', channel: 'email' },
      { type: 'interview_feedback', channel: 'both' },
      { type: 'decision', channel: 'both' },
    ],
  },
  {
    id: '3',
    name: 'Emily Chen',
    email: 'emily.chen@company.com',
    role: 'Interviewer',
    department: 'Engineering',
    avatarUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
    notifications: [
      { type: 'mention', channel: 'both' },
      { type: 'message', channel: 'both' },
      { type: 'task', channel: 'email' },
      { type: 'note', channel: 'none' },
      { type: 'candidate_update', channel: 'none' },
      { type: 'interview_feedback', channel: 'email' },
      { type: 'decision', channel: 'none' },
    ],
  },
  {
    id: '4',
    name: 'Michael Johnson',
    email: 'michael.johnson@company.com',
    role: 'HR Manager',
    department: 'HR',
    avatarUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
    notifications: [
      { type: 'mention', channel: 'both' },
      { type: 'message', channel: 'both' },
      { type: 'task', channel: 'both' },
      { type: 'note', channel: 'in_app' },
      { type: 'candidate_update', channel: 'both' },
      { type: 'interview_feedback', channel: 'both' },
      { type: 'decision', channel: 'both' },
    ],
  },
];

// Mock collaborative notes
const mockNotes: CollaborativeNote[] = [
  {
    id: '1',
    candidateId: 1,
    content:
      'Candidate showed strong problem-solving skills during the technical interview. @David Lee might want to focus on system design questions in the next round.',
    createdBy: '1', // Jane Smith
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    visibleTo: ['1', '2', '3', '4'], // Visible to all team members
    mentionedUsers: ['2'], // David Lee
    isPrivate: false,
    tags: ['technical', 'next_steps'],
  },
  {
    id: '2',
    candidateId: 1,
    content:
      "Verified candidate's references. All positive feedback about teamwork and communication skills.",
    createdBy: '4', // Michael Johnson
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    visibleTo: ['1', '4'], // Only visible to HR team
    isPrivate: true,
    tags: ['reference_check'],
  },
];

// Mock messages
const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1', // Jane Smith
    receiverIds: ['2', '3'], // David Lee, Emily Chen
    content:
      "Hi team, I've scheduled the technical interview for John Doe on Thursday at 2pm. @Emily Chen, can you join?",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: { '2': true, '3': false },
    relatedToCandidate: 1,
    mentionedUsers: ['3'], // Emily Chen
  },
  {
    id: '2',
    senderId: '3', // Emily Chen
    receiverIds: ['1'], // Jane Smith
    content: 'I can join the interview. Will there be any specific areas you want me to focus on?',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
    isRead: { '1': true },
    relatedToCandidate: 1,
  },
];

// Mock tasks
const mockTasks: CollaborationTask[] = [
  {
    id: '1',
    title: 'Schedule technical interview',
    description:
      'Coordinate with the engineering team to schedule a technical interview for John Doe',
    assignedBy: '4', // Michael Johnson
    assignedTo: ['1'], // Jane Smith
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'in_progress',
    relatedToCandidate: 1,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notifications: {
      reminderSent: false,
      dueDateApproaching: true,
    },
  },
  {
    id: '2',
    title: 'Prepare interview questions',
    description: 'Prepare custom React.js interview questions for senior developer role',
    assignedBy: '2', // David Lee
    assignedTo: ['2', '3'], // David Lee, Emily Chen
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    status: 'pending',
    relatedToCandidate: 1,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notifications: {
      reminderSent: false,
      dueDateApproaching: false,
    },
  },
];

// Mock decision votes
const mockVotes: DecisionVote[] = [
  {
    id: '1',
    candidateId: 1,
    jobId: 1,
    userId: '2', // David Lee
    decision: 'hire',
    comments: 'Strong technical skills and good culture fit.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isAnonymous: false,
  },
  {
    id: '2',
    candidateId: 1,
    jobId: 1,
    userId: '3', // Emily Chen
    decision: 'strong_hire',
    comments: 'Excellent problem-solving skills and communication.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    isAnonymous: false,
  },
];

// Mock shared documents
const mockDocuments: SharedDocument[] = [
  {
    id: '1',
    title: 'Interview Guide - Senior Developer Position',
    type: 'interview_notes',
    content:
      '# Interview Guide\n\n## Technical Assessment\n- Algorithm complexity analysis\n- React component design\n- System architecture questions\n\n## Behavioral Questions\n- Team conflict resolution\n- Project management approach\n- Communication style',
    createdBy: '2', // David Lee
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    sharedWith: ['1', '2', '3'], // Jane Smith, David Lee, Emily Chen
    jobId: 1,
    versionHistory: [
      {
        version: 1,
        updatedBy: '2',
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        changes: 'Initial document creation',
      },
    ],
  },
];

// Context interface
interface CollaborationContextType {
  // State
  teamMembers: TeamMember[];
  notes: CollaborativeNote[];
  messages: Message[];
  tasks: CollaborationTask[];
  votes: DecisionVote[];
  documents: SharedDocument[];
  currentUser: TeamMember; // Simulating current user

  // Team management
  getTeamMember: (id: string) => TeamMember | undefined;
  getTeamMembersByRole: (role: UserRole) => TeamMember[];
  updateTeamMemberNotifications: (
    id: string,
    notifications: { type: string; channel: string }[]
  ) => boolean;

  // Notes operations
  addNote: (note: Omit<CollaborativeNote, 'id' | 'createdAt'>) => CollaborativeNote;
  updateNote: (id: string, updates: Partial<CollaborativeNote>) => CollaborativeNote | undefined;
  deleteNote: (id: string) => boolean;
  getNotesByCandidate: (candidateId: number) => CollaborativeNote[];
  getNotesByMention: (userId: string) => CollaborativeNote[];

  // Messaging
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => Message;
  markMessageAsRead: (messageId: string, userId: string) => boolean;
  getMessageThread: (messageIds: string[]) => Message[];
  getUnreadMessageCount: (userId: string) => number;
  getMessagesForUser: (userId: string) => Message[];

  // Task management
  createTask: (
    task: Omit<CollaborationTask, 'id' | 'createdAt' | 'updatedAt' | 'notifications'>
  ) => CollaborationTask;
  updateTask: (id: string, updates: Partial<CollaborationTask>) => CollaborationTask | undefined;
  completeTask: (id: string, completedBy: string) => CollaborationTask | undefined;
  deleteTask: (id: string) => boolean;
  getTasksByAssignee: (userId: string) => CollaborationTask[];
  getTasksByCandidate: (candidateId: number) => CollaborationTask[];

  // Decision voting
  castVote: (vote: Omit<DecisionVote, 'id' | 'timestamp'>) => DecisionVote;
  updateVote: (id: string, updates: Partial<DecisionVote>) => DecisionVote | undefined;
  getVotesByCandidate: (candidateId: number) => DecisionVote[];
  getVoteSummary: (candidateId: number) => {
    strongHire: number;
    hire: number;
    neutral: number;
    reject: number;
    strongReject: number;
    averageScore: number;
    totalVotes: number;
  };

  // Document collaboration
  createDocument: (
    document: Omit<SharedDocument, 'id' | 'createdAt' | 'versionHistory'>
  ) => SharedDocument;
  updateDocument: (
    id: string,
    updates: { content: string; updatedBy: string }
  ) => SharedDocument | undefined;
  shareDocument: (id: string, userIds: string[]) => SharedDocument | undefined;
  getDocumentsByCandidate: (candidateId: number) => SharedDocument[];
}

// Create the context
const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

// Provider component
export const CollaborationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [notes, setNotes] = useState<CollaborativeNote[]>(mockNotes);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [tasks, setTasks] = useState<CollaborationTask[]>(mockTasks);
  const [votes, setVotes] = useState<DecisionVote[]>(mockVotes);
  const [documents, setDocuments] = useState<SharedDocument[]>(mockDocuments);

  // Setting the current user for simulation purposes
  const currentUser = mockTeamMembers[0]; // Jane Smith as current user

  // Team management functions
  const getTeamMember = (id: string): TeamMember | undefined => {
    return teamMembers.find((member) => member.id === id);
  };

  const getTeamMembersByRole = (role: UserRole): TeamMember[] => {
    return teamMembers.filter((member) => member.role === role);
  };

  const updateTeamMemberNotifications = (
    id: string,
    notifications: { type: string; channel: string }[]
  ): boolean => {
    const index = teamMembers.findIndex((member) => member.id === id);
    if (index === -1) return false;

    const updatedMember = {
      ...teamMembers[index],
      notifications: notifications as any[],
    };

    setTeamMembers((prev) => [...prev.slice(0, index), updatedMember, ...prev.slice(index + 1)]);

    announce(`Updated notification preferences for ${updatedMember.name}`);
    return true;
  };

  // Notes functions
  const addNote = (noteData: Omit<CollaborativeNote, 'id' | 'createdAt'>): CollaborativeNote => {
    const newNote: CollaborativeNote = {
      ...noteData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    setNotes((prev) => [...prev, newNote]);
    announce('Added new note');
    return newNote;
  };

  const updateNote = (
    id: string,
    updates: Partial<CollaborativeNote>
  ): CollaborativeNote | undefined => {
    const index = notes.findIndex((note) => note.id === id);
    if (index === -1) return undefined;

    const updatedNote = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => [...prev.slice(0, index), updatedNote, ...prev.slice(index + 1)]);

    announce('Updated note');
    return updatedNote;
  };

  const deleteNote = (id: string): boolean => {
    const index = notes.findIndex((note) => note.id === id);
    if (index === -1) return false;

    setNotes((prev) => prev.filter((note) => note.id !== id));
    announce('Deleted note');
    return true;
  };

  const getNotesByCandidate = (candidateId: number): CollaborativeNote[] => {
    return notes.filter((note) => note.candidateId === candidateId);
  };

  const getNotesByMention = (userId: string): CollaborativeNote[] => {
    return notes.filter((note) => note.mentionedUsers?.includes(userId));
  };

  // Implement remaining methods (messaging, tasks, voting, documents)
  // For brevity, I'll just implement the core functions and leave the rest as stubs

  const sendMessage = (messageData: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Message => {
    const newMessage: Message = {
      ...messageData,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      isRead: messageData.receiverIds.reduce((acc, id) => ({ ...acc, [id]: false }), {}),
    };

    setMessages((prev) => [...prev, newMessage]);
    announce('Sent new message');
    return newMessage;
  };

  const markMessageAsRead = (messageId: string, userId: string): boolean => {
    const index = messages.findIndex((message) => message.id === messageId);
    if (index === -1) return false;

    const message = messages[index];
    if (!message.receiverIds.includes(userId)) return false;

    const updatedMessage = {
      ...message,
      isRead: { ...message.isRead, [userId]: true },
    };

    setMessages((prev) => [...prev.slice(0, index), updatedMessage, ...prev.slice(index + 1)]);

    return true;
  };

  const getMessageThread = (messageIds: string[]): Message[] => {
    return messages
      .filter((message) => messageIds.includes(message.id))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const getUnreadMessageCount = (userId: string): number => {
    return messages.filter(
      (message) => message.receiverIds.includes(userId) && !message.isRead[userId]
    ).length;
  };

  const getMessagesForUser = (userId: string): Message[] => {
    return messages
      .filter((message) => message.receiverIds.includes(userId) || message.senderId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Task management functions
  const createTask = (
    taskData: Omit<CollaborationTask, 'id' | 'createdAt' | 'updatedAt' | 'notifications'>
  ): CollaborationTask => {
    const timestamp = new Date().toISOString();
    const newTask: CollaborationTask = {
      ...taskData,
      id: uuidv4(),
      createdAt: timestamp,
      updatedAt: timestamp,
      notifications: {
        reminderSent: false,
        dueDateApproaching: false,
      },
    };

    setTasks((prev) => [...prev, newTask]);
    announce(`Created new task: ${newTask.title}`);
    return newTask;
  };

  const updateTask = (
    id: string,
    updates: Partial<CollaborationTask>
  ): CollaborationTask | undefined => {
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) return undefined;

    const updatedTask = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev.slice(0, index), updatedTask, ...prev.slice(index + 1)]);

    announce(`Updated task: ${updatedTask.title}`);
    return updatedTask;
  };

  const completeTask = (id: string, completedBy: string): CollaborationTask | undefined => {
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) return undefined;

    const updatedTask = {
      ...tasks[index],
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      completedBy,
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev.slice(0, index), updatedTask, ...prev.slice(index + 1)]);

    announce(`Completed task: ${updatedTask.title}`);
    return updatedTask;
  };

  const deleteTask = (id: string): boolean => {
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) return false;

    setTasks((prev) => prev.filter((task) => task.id !== id));
    announce('Deleted task');
    return true;
  };

  const getTasksByAssignee = (userId: string): CollaborationTask[] => {
    return tasks.filter((task) => task.assignedTo.includes(userId));
  };

  const getTasksByCandidate = (candidateId: number): CollaborationTask[] => {
    return tasks.filter((task) => task.relatedToCandidate === candidateId);
  };

  // Decision voting functions
  const castVote = (voteData: Omit<DecisionVote, 'id' | 'timestamp'>): DecisionVote => {
    const newVote: DecisionVote = {
      ...voteData,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };

    setVotes((prev) => [...prev, newVote]);
    announce('Vote submitted');
    return newVote;
  };

  const updateVote = (id: string, updates: Partial<DecisionVote>): DecisionVote | undefined => {
    const index = votes.findIndex((vote) => vote.id === id);
    if (index === -1) return undefined;

    const updatedVote = {
      ...votes[index],
      ...updates,
      timestamp: new Date().toISOString(),
    };

    setVotes((prev) => [...prev.slice(0, index), updatedVote, ...prev.slice(index + 1)]);

    announce('Vote updated');
    return updatedVote;
  };

  const getVotesByCandidate = (candidateId: number): DecisionVote[] => {
    return votes.filter((vote) => vote.candidateId === candidateId);
  };

  const getVoteSummary = (
    candidateId: number
  ): {
    strongHire: number;
    hire: number;
    neutral: number;
    reject: number;
    strongReject: number;
    averageScore: number;
    totalVotes: number;
  } => {
    const candidateVotes = getVotesByCandidate(candidateId);

    const summary = {
      strongHire: candidateVotes.filter((v) => v.decision === 'strong_hire').length,
      hire: candidateVotes.filter((v) => v.decision === 'hire').length,
      neutral: candidateVotes.filter((v) => v.decision === 'neutral').length,
      reject: candidateVotes.filter((v) => v.decision === 'reject').length,
      strongReject: candidateVotes.filter((v) => v.decision === 'strong_reject').length,
      totalVotes: candidateVotes.length,
      averageScore: 0,
    };

    // Calculate average score on a scale of 1-5
    // 5 = strong_hire, 4 = hire, 3 = neutral, 2 = reject, 1 = strong_reject
    const scoreMap = {
      strong_hire: 5,
      hire: 4,
      neutral: 3,
      reject: 2,
      strong_reject: 1,
    };

    if (summary.totalVotes > 0) {
      const totalScore = candidateVotes.reduce((sum, vote) => sum + scoreMap[vote.decision], 0);
      summary.averageScore = totalScore / summary.totalVotes;
    }

    return summary;
  };

  // Document collaboration functions
  const createDocument = (
    documentData: Omit<SharedDocument, 'id' | 'createdAt' | 'versionHistory'>
  ): SharedDocument => {
    const timestamp = new Date().toISOString();
    const newDocument: SharedDocument = {
      ...documentData,
      id: uuidv4(),
      createdAt: timestamp,
      versionHistory: [
        {
          version: 1,
          updatedBy: documentData.createdBy,
          updatedAt: timestamp,
          changes: 'Initial document creation',
        },
      ],
    };

    setDocuments((prev) => [...prev, newDocument]);
    announce(`Created new document: ${newDocument.title}`);
    return newDocument;
  };

  const updateDocument = (
    id: string,
    updates: { content: string; updatedBy: string }
  ): SharedDocument | undefined => {
    const index = documents.findIndex((doc) => doc.id === id);
    if (index === -1) return undefined;

    const document = documents[index];
    const timestamp = new Date().toISOString();

    const updatedDocument = {
      ...document,
      content: updates.content,
      updatedBy: updates.updatedBy,
      updatedAt: timestamp,
      versionHistory: [
        ...(document.versionHistory || []),
        {
          version: (document.versionHistory?.length || 0) + 1,
          updatedBy: updates.updatedBy,
          updatedAt: timestamp,
          changes: 'Document updated',
        },
      ],
    };

    setDocuments((prev) => [...prev.slice(0, index), updatedDocument, ...prev.slice(index + 1)]);

    announce(`Updated document: ${updatedDocument.title}`);
    return updatedDocument;
  };

  const shareDocument = (id: string, userIds: string[]): SharedDocument | undefined => {
    const index = documents.findIndex((doc) => doc.id === id);
    if (index === -1) return undefined;

    const document = documents[index];
    const updatedDocument = {
      ...document,
      sharedWith: Array.from(new Set([...document.sharedWith, ...userIds])),
    };

    setDocuments((prev) => [...prev.slice(0, index), updatedDocument, ...prev.slice(index + 1)]);

    announce(`Shared document "${updatedDocument.title}" with ${userIds.length} users`);
    return updatedDocument;
  };

  const getDocumentsByCandidate = (candidateId: number): SharedDocument[] => {
    return documents.filter((doc) => doc.candidateId === candidateId);
  };

  const getDocumentsByJob = (jobId: number): SharedDocument[] => {
    return documents.filter((doc) => doc.jobId === jobId);
  };

  const contextValue: CollaborationContextType = {
    teamMembers,
    notes,
    messages,
    tasks,
    votes,
    documents,
    currentUser,

    // Team management
    getTeamMember,
    getTeamMembersByRole,
    updateTeamMemberNotifications,

    // Notes operations
    addNote,
    updateNote,
    deleteNote,
    getNotesByCandidate,
    getNotesByMention,

    // Messaging
    sendMessage,
    markMessageAsRead,
    getMessageThread,
    getUnreadMessageCount,
    getMessagesForUser,

    // Task management
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    getTasksByAssignee,
    getTasksByCandidate,

    // Decision voting
    castVote,
    updateVote,
    getVotesByCandidate,
    getVoteSummary,

    // Document collaboration
    createDocument,
    updateDocument,
    shareDocument,
    getDocumentsByCandidate,
    getDocumentsByJob,
  };

  return (
    <CollaborationContext.Provider value={contextValue}>{children}</CollaborationContext.Provider>
  );
};

// Custom hook for consuming the context
export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

export default CollaborationContext;
