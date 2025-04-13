import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  TeamMember, 
  CollaborativeNote,
  Message, 
  Conversation, 
  Task, 
  DecisionVote,
  SharedDocument
} from '../models/types';

// Mock data for team members
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Hiring Manager',
    department: 'Engineering',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Recruiter',
    department: 'HR',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    role: 'Technical Interviewer',
    department: 'Engineering',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    role: 'HR Director',
    department: 'HR',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
  }
];

// Mock data for collaborative notes
const mockNotes: CollaborativeNote[] = [
  {
    id: '1',
    candidateId: 'c101',
    content: 'Candidate has strong problem-solving skills but needs to improve communication.',
    createdBy: '1',
    createdAt: '2023-06-15T14:30:00Z',
    updatedAt: '2023-06-15T14:30:00Z',
    mentions: ['2'],
    isPrivate: false
  },
  {
    id: '2',
    candidateId: 'c102',
    content: 'Discussed salary expectations. Candidate is looking for at least $120K.',
    createdBy: '2',
    createdAt: '2023-06-16T09:15:00Z',
    updatedAt: '2023-06-16T11:20:00Z',
    mentions: [],
    isPrivate: true,
    visibility: ['2', '4']
  }
];

// Mock data for conversations
const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Engineering Candidate Review',
    participants: ['1', '2', '3'],
    createdAt: '2023-06-10T09:00:00Z',
    updatedAt: '2023-06-14T16:45:00Z',
    candidateId: 'c101'
  }
];

// Mock data for messages
const mockMessages: Message[] = [
  {
    id: '1',
    conversationId: '1',
    content: 'What did you think about the technical assessment?',
    sender: '1',
    timestamp: '2023-06-14T15:30:00Z',
    isRead: true,
    mentions: ['3']
  },
  {
    id: '2',
    conversationId: '1',
    content: 'I was impressed with the solution. Clean code and well documented.',
    sender: '3',
    timestamp: '2023-06-14T15:35:00Z',
    isRead: true,
    mentions: []
  },
  {
    id: '3',
    conversationId: '1',
    content: 'Should we move forward with the next interview stage?',
    sender: '2',
    timestamp: '2023-06-14T16:45:00Z',
    isRead: false,
    mentions: ['1', '3']
  }
];

// Mock data for tasks
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Schedule technical interview',
    description: 'Coordinate with the engineering team for a technical assessment',
    assignedTo: '2',
    assignedBy: '4',
    dueDate: '2023-06-20T17:00:00Z',
    status: 'pending',
    priority: 'high',
    createdAt: '2023-06-16T10:00:00Z',
    updatedAt: '2023-06-16T10:00:00Z',
    candidateId: 'c101'
  },
  {
    id: '2',
    title: 'Review candidate portfolio',
    description: 'Check the portfolio links provided in the application',
    assignedTo: '3',
    assignedBy: '1',
    dueDate: '2023-06-18T17:00:00Z',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2023-06-15T14:00:00Z',
    updatedAt: '2023-06-16T09:30:00Z',
    candidateId: 'c102'
  }
];

// Mock data for decision votes
const mockVotes: DecisionVote[] = [
  {
    id: '1',
    candidateId: 'c101',
    voterId: '1',
    decision: 'hire',
    reasoning: 'Strong technical skills and good culture fit.',
    timestamp: '2023-06-15T16:00:00Z',
    isAnonymous: false
  },
  {
    id: '2',
    candidateId: 'c101',
    voterId: '3',
    decision: 'hire',
    reasoning: 'Excellent problem-solving abilities and communication skills.',
    timestamp: '2023-06-15T17:30:00Z',
    isAnonymous: false
  }
];

// Mock data for shared documents
const mockDocuments: SharedDocument[] = [
  {
    id: '1',
    title: 'John Doe Resume',
    url: 'https://example.com/storage/resumes/johndoe.pdf',
    type: 'resume',
    uploadedBy: '2',
    uploadedAt: '2023-06-10T11:00:00Z',
    lastModified: '2023-06-10T11:00:00Z',
    candidateId: 'c101',
    permissions: {
      canView: ['1', '2', '3', '4'],
      canEdit: ['2']
    },
    version: 1
  },
  {
    id: '2',
    title: 'Technical Assessment Results',
    url: 'https://example.com/storage/assessments/tech_result_c102.pdf',
    type: 'other',
    uploadedBy: '3',
    uploadedAt: '2023-06-14T14:00:00Z',
    lastModified: '2023-06-14T14:00:00Z',
    candidateId: 'c102',
    permissions: {
      canView: ['1', '2', '3'],
      canEdit: ['3']
    },
    version: 1
  }
];

// Define context type
interface CollaborativeToolsContextType {
  // Team Members
  teamMembers: TeamMember[];
  getTeamMember: (id: string) => TeamMember | undefined;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => TeamMember;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => TeamMember | undefined;
  removeTeamMember: (id: string) => boolean;
  
  // Notes
  notes: CollaborativeNote[];
  getNotesByCandidateId: (candidateId: string) => CollaborativeNote[];
  addNote: (note: Omit<CollaborativeNote, 'id'>) => CollaborativeNote;
  updateNote: (id: string, updates: Partial<CollaborativeNote>) => CollaborativeNote | undefined;
  deleteNote: (id: string) => boolean;
  
  // Conversations
  conversations: Conversation[];
  getConversation: (id: string) => Conversation | undefined;
  addConversation: (conversation: Omit<Conversation, 'id'>) => Conversation;
  updateConversation: (id: string, updates: Partial<Conversation>) => Conversation | undefined;
  deleteConversation: (id: string) => boolean;
  
  // Messages
  messages: Message[];
  getMessagesByConversationId: (conversationId: string) => Message[];
  addMessage: (message: Omit<Message, 'id'>) => Message;
  updateMessage: (id: string, updates: Partial<Message>) => Message | undefined;
  deleteMessage: (id: string) => boolean;
  markMessagesAsRead: (messageIds: string[]) => boolean;
  
  // Tasks
  tasks: Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
  getTasksByCandidate: (candidateId: string) => Task[];
  addTask: (task: Omit<Task, 'id'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => Task | undefined;
  deleteTask: (id: string) => boolean;
  
  // Decision Votes
  votes: DecisionVote[];
  getVotesByCandidate: (candidateId: string) => DecisionVote[];
  addVote: (vote: Omit<DecisionVote, 'id'>) => DecisionVote;
  updateVote: (id: string, updates: Partial<DecisionVote>) => DecisionVote | undefined;
  deleteVote: (id: string) => boolean;
  
  // Shared Documents
  documents: SharedDocument[];
  getDocumentsByCandidate: (candidateId: string) => SharedDocument[];
  addDocument: (document: Omit<SharedDocument, 'id'>) => SharedDocument;
  updateDocument: (id: string, updates: Partial<SharedDocument>) => SharedDocument | undefined;
  deleteDocument: (id: string) => boolean;
}

// Create the context
const CollaborativeToolsContext = createContext<CollaborativeToolsContextType | undefined>(undefined);

// Provider component
export const CollaborativeToolsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [notes, setNotes] = useState<CollaborativeNote[]>(mockNotes);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [votes, setVotes] = useState<DecisionVote[]>(mockVotes);
  const [documents, setDocuments] = useState<SharedDocument[]>(mockDocuments);

  // Team Members functions
  const getTeamMember = (id: string) => teamMembers.find(member => member.id === id);

  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember = { ...member, id: Date.now().toString() };
    setTeamMembers([...teamMembers, newMember]);
    return newMember;
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    const memberIndex = teamMembers.findIndex(member => member.id === id);
    if (memberIndex === -1) return undefined;
    
    const updatedMember = { ...teamMembers[memberIndex], ...updates };
    const newTeamMembers = [...teamMembers];
    newTeamMembers[memberIndex] = updatedMember;
    setTeamMembers(newTeamMembers);
    return updatedMember;
  };

  const removeTeamMember = (id: string) => {
    const memberIndex = teamMembers.findIndex(member => member.id === id);
    if (memberIndex === -1) return false;
    
    const newTeamMembers = [...teamMembers];
    newTeamMembers.splice(memberIndex, 1);
    setTeamMembers(newTeamMembers);
    return true;
  };

  // Notes functions
  const getNotesByCandidateId = (candidateId: string) => 
    notes.filter(note => note.candidateId === candidateId);

  const addNote = (note: Omit<CollaborativeNote, 'id'>) => {
    const newNote = { ...note, id: Date.now().toString() };
    setNotes([...notes, newNote]);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<CollaborativeNote>) => {
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex === -1) return undefined;
    
    const updatedNote = { ...notes[noteIndex], ...updates, updatedAt: new Date().toISOString() };
    const newNotes = [...notes];
    newNotes[noteIndex] = updatedNote;
    setNotes(newNotes);
    return updatedNote;
  };

  const deleteNote = (id: string) => {
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex === -1) return false;
    
    const newNotes = [...notes];
    newNotes.splice(noteIndex, 1);
    setNotes(newNotes);
    return true;
  };

  // Conversations functions
  const getConversation = (id: string) => 
    conversations.find(conversation => conversation.id === id);

  const addConversation = (conversation: Omit<Conversation, 'id'>) => {
    const newConversation = { 
      ...conversation, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setConversations([...conversations, newConversation]);
    return newConversation;
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    const convIndex = conversations.findIndex(conv => conv.id === id);
    if (convIndex === -1) return undefined;
    
    const updatedConversation = { 
      ...conversations[convIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    const newConversations = [...conversations];
    newConversations[convIndex] = updatedConversation;
    setConversations(newConversations);
    return updatedConversation;
  };

  const deleteConversation = (id: string) => {
    const convIndex = conversations.findIndex(conv => conv.id === id);
    if (convIndex === -1) return false;
    
    const newConversations = [...conversations];
    newConversations.splice(convIndex, 1);
    setConversations(newConversations);

    // Also delete associated messages
    const newMessages = messages.filter(message => message.conversationId !== id);
    setMessages(newMessages);
    
    return true;
  };

  // Messages functions
  const getMessagesByConversationId = (conversationId: string) => 
    messages.filter(message => message.conversationId === conversationId);

  const addMessage = (message: Omit<Message, 'id'>) => {
    const newMessage = { ...message, id: Date.now().toString() };
    setMessages([...messages, newMessage]);
    
    // Update conversation updatedAt time
    if (message.conversationId) {
      updateConversation(message.conversationId, {});
    }
    
    return newMessage;
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    const msgIndex = messages.findIndex(msg => msg.id === id);
    if (msgIndex === -1) return undefined;
    
    const updatedMessage = { ...messages[msgIndex], ...updates };
    const newMessages = [...messages];
    newMessages[msgIndex] = updatedMessage;
    setMessages(newMessages);
    return updatedMessage;
  };

  const deleteMessage = (id: string) => {
    const msgIndex = messages.findIndex(msg => msg.id === id);
    if (msgIndex === -1) return false;
    
    const newMessages = [...messages];
    newMessages.splice(msgIndex, 1);
    setMessages(newMessages);
    return true;
  };

  const markMessagesAsRead = (messageIds: string[]) => {
    const newMessages = [...messages];
    let updated = false;
    
    messageIds.forEach(id => {
      const msgIndex = newMessages.findIndex(msg => msg.id === id);
      if (msgIndex !== -1 && !newMessages[msgIndex].isRead) {
        newMessages[msgIndex] = { ...newMessages[msgIndex], isRead: true };
        updated = true;
      }
    });
    
    if (updated) {
      setMessages(newMessages);
    }
    
    return updated;
  };

  // Tasks functions
  const getTasksByAssignee = (assigneeId: string) => 
    tasks.filter(task => task.assignedTo === assigneeId);

  const getTasksByCandidate = (candidateId: string) => 
    tasks.filter(task => task.candidateId === candidateId);

  const addTask = (task: Omit<Task, 'id'>) => {
    const now = new Date().toISOString();
    const newTask = { 
      ...task, 
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return undefined;
    
    const updatedTask = { 
      ...tasks[taskIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    setTasks(newTasks);
    return updatedTask;
  };

  const deleteTask = (id: string) => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return false;
    
    const newTasks = [...tasks];
    newTasks.splice(taskIndex, 1);
    setTasks(newTasks);
    return true;
  };

  // Decision Votes functions
  const getVotesByCandidate = (candidateId: string) => 
    votes.filter(vote => vote.candidateId === candidateId);

  const addVote = (vote: Omit<DecisionVote, 'id'>) => {
    const newVote = { 
      ...vote, 
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setVotes([...votes, newVote]);
    return newVote;
  };

  const updateVote = (id: string, updates: Partial<DecisionVote>) => {
    const voteIndex = votes.findIndex(vote => vote.id === id);
    if (voteIndex === -1) return undefined;
    
    const updatedVote = { 
      ...votes[voteIndex], 
      ...updates, 
      timestamp: new Date().toISOString() 
    };
    const newVotes = [...votes];
    newVotes[voteIndex] = updatedVote;
    setVotes(newVotes);
    return updatedVote;
  };

  const deleteVote = (id: string) => {
    const voteIndex = votes.findIndex(vote => vote.id === id);
    if (voteIndex === -1) return false;
    
    const newVotes = [...votes];
    newVotes.splice(voteIndex, 1);
    setVotes(newVotes);
    return true;
  };

  // Shared Documents functions
  const getDocumentsByCandidate = (candidateId: string) => 
    documents.filter(doc => doc.candidateId === candidateId);

  const addDocument = (document: Omit<SharedDocument, 'id'>) => {
    const now = new Date().toISOString();
    const newDocument = { 
      ...document, 
      id: Date.now().toString(),
      uploadedAt: now,
      lastModified: now,
      version: 1
    };
    setDocuments([...documents, newDocument]);
    return newDocument;
  };

  const updateDocument = (id: string, updates: Partial<SharedDocument>) => {
    const docIndex = documents.findIndex(doc => doc.id === id);
    if (docIndex === -1) return undefined;
    
    const updatedDocument = { 
      ...documents[docIndex], 
      ...updates, 
      lastModified: new Date().toISOString(),
      version: documents[docIndex].version + 1
    };
    const newDocuments = [...documents];
    newDocuments[docIndex] = updatedDocument;
    setDocuments(newDocuments);
    return updatedDocument;
  };

  const deleteDocument = (id: string) => {
    const docIndex = documents.findIndex(doc => doc.id === id);
    if (docIndex === -1) return false;
    
    const newDocuments = [...documents];
    newDocuments.splice(docIndex, 1);
    setDocuments(newDocuments);
    return true;
  };

  const value = {
    // Team Members
    teamMembers,
    getTeamMember,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    
    // Notes
    notes,
    getNotesByCandidateId,
    addNote,
    updateNote,
    deleteNote,
    
    // Conversations
    conversations,
    getConversation,
    addConversation,
    updateConversation,
    deleteConversation,
    
    // Messages
    messages,
    getMessagesByConversationId,
    addMessage,
    updateMessage,
    deleteMessage,
    markMessagesAsRead,
    
    // Tasks
    tasks,
    getTasksByAssignee,
    getTasksByCandidate,
    addTask,
    updateTask,
    deleteTask,
    
    // Decision Votes
    votes,
    getVotesByCandidate,
    addVote,
    updateVote,
    deleteVote,
    
    // Shared Documents
    documents,
    getDocumentsByCandidate,
    addDocument,
    updateDocument,
    deleteDocument,
  };

  return (
    <CollaborativeToolsContext.Provider value={value}>
      {children}
    </CollaborativeToolsContext.Provider>
  );
};

// Custom hook for using the context
export const useCollaborativeTools = () => {
  const context = useContext(CollaborativeToolsContext);
  if (context === undefined) {
    throw new Error('useCollaborativeTools must be used within a CollaborativeToolsProvider');
  }
  return context;
}; 