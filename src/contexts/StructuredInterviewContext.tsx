import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  InterviewQuestion,
  InterviewKit,
  InterviewScheduleTemplate,
  QuestionCategory,
  DifficultyLevel,
  UserRole,
} from '../models/types';
import { announce } from '../components/ScreenReaderAnnouncer';

// Mock data for interview questions
const mockQuestions: InterviewQuestion[] = [
  {
    id: '1',
    question: 'Can you explain the difference between useMemo and useCallback in React?',
    category: 'technical',
    difficultyLevel: 'intermediate',
    expectedAnswer:
      'Both are hooks for optimization. useMemo memoizes a computed value and only recalculates it when dependencies change. useCallback memoizes a function definition to prevent unnecessary re-renders of child components that receive the function as a prop.',
    scoringRubric: [
      {
        criteria: 'Technical accuracy',
        weightage: 40,
        excellentResponse:
          'Explains both hooks accurately, including their purpose, usage scenarios, and performance implications',
        goodResponse: 'Explains both hooks with minor inaccuracies or omissions',
        averageResponse: 'Basic understanding shown, but lacks depth',
        poorResponse: 'Incorrect explanation or unable to explain',
      },
      {
        criteria: 'Real-world application',
        weightage: 30,
        excellentResponse: 'Provides concrete examples of when and why to use each hook',
        goodResponse: 'Provides general usage scenarios',
        averageResponse: 'Mentions basic use cases without elaboration',
        poorResponse: 'Cannot provide realistic use cases',
      },
      {
        criteria: 'Understanding of optimization principles',
        weightage: 30,
        excellentResponse:
          "Demonstrates deep understanding of React's rendering behavior and optimization principles",
        goodResponse: 'Shows general understanding of optimization concepts',
        averageResponse: 'Basic awareness of performance considerations',
        poorResponse: 'No understanding of optimization principles',
      },
    ],
    tags: ['react', 'hooks', 'optimization', 'frontend'],
    isAntibiased: true,
    followUpQuestions: [
      'In what situations would you prefer useMemo over useCallback?',
      'How would you measure if these optimizations are actually improving performance?',
    ],
    createdBy: '2', // David Lee
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    roles: ['1', '5'], // Frontend Developer roles
  },
  {
    id: '2',
    question:
      'Describe a time when you had to give difficult feedback to a team member. How did you approach it and what was the outcome?',
    category: 'behavioral',
    difficultyLevel: 'intermediate',
    expectedAnswer:
      "A strong answer would demonstrate the candidate's communication skills, empathy, and ability to handle difficult conversations. They should describe a specific situation, their thoughtful approach to providing feedback, and a positive or constructive outcome.",
    scoringRubric: [
      {
        criteria: 'Communication approach',
        weightage: 35,
        excellentResponse:
          'Describes a structured, empathetic approach with specific techniques used',
        goodResponse:
          "Explains a thoughtful approach with consideration for the recipient's feelings",
        averageResponse: 'Describes a basic feedback approach with some consideration',
        poorResponse: 'Describes an insensitive or unprofessional approach',
      },
      {
        criteria: 'Self-awareness',
        weightage: 35,
        excellentResponse:
          'Demonstrates high self-awareness and reflection on own communication style',
        goodResponse: 'Shows awareness of their impact on others',
        averageResponse: 'Some recognition of their role in the interaction',
        poorResponse: 'No self-reflection or awareness',
      },
      {
        criteria: 'Outcome and learning',
        weightage: 30,
        excellentResponse: 'Describes concrete positive outcomes and personal learning',
        goodResponse: 'Explains some positive results and takeaways',
        averageResponse: 'Mentions basic outcomes without depth',
        poorResponse: 'No positive outcomes or learning described',
      },
    ],
    tags: ['communication', 'leadership', 'feedback', 'teamwork'],
    isAntibiased: true,
    followUpQuestions: [
      'What would you do differently if you had to give that feedback again?',
      'How do you prefer to receive difficult feedback yourself?',
    ],
    createdBy: '4', // Michael Johnson
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    roles: ['1', '2', '3', '4', '5'], // All roles
  },
  {
    id: '3',
    question: 'Given a binary tree, write a function to determine if it is balanced.',
    category: 'technical',
    difficultyLevel: 'advanced',
    expectedAnswer:
      'A height-balanced binary tree is a binary tree in which the depth of the two subtrees of every node never differs by more than 1. The solution involves writing a recursive function that calculates the height of each subtree and checks if the difference is within the allowed range.',
    scoringRubric: [
      {
        criteria: 'Algorithm design',
        weightage: 40,
        excellentResponse: 'Designs an efficient O(n) solution with clear reasoning',
        goodResponse: 'Proposes a working solution with minor inefficiencies',
        averageResponse: 'Basic approach with significant inefficiencies',
        poorResponse: 'Unable to design a working algorithm',
      },
      {
        criteria: 'Code implementation',
        weightage: 40,
        excellentResponse: 'Clean, optimized code with proper handling of edge cases',
        goodResponse: 'Working code with minor issues or missed edge cases',
        averageResponse: 'Code with logical errors that could be easily corrected',
        poorResponse: 'Unable to translate algorithm to working code',
      },
      {
        criteria: 'Analysis and optimization',
        weightage: 20,
        excellentResponse: 'Accurate analysis of time/space complexity with optimization insights',
        goodResponse: 'Correct complexity analysis with some optimization ideas',
        averageResponse: 'Basic understanding of efficiency concerns',
        poorResponse: 'Incorrect or no complexity analysis',
      },
    ],
    tags: ['algorithms', 'binary tree', 'recursion', 'data structures'],
    isAntibiased: true,
    followUpQuestions: [
      'How would you modify your solution if the tree had millions of nodes?',
      'Can you think of an iterative solution to this problem?',
    ],
    createdBy: '3', // Emily Chen
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    roles: ['1', '5'], // Technical roles
  },
];

// Mock data for interview kits
const mockInterviewKits: InterviewKit[] = [
  {
    id: '1',
    name: 'Frontend Developer Technical Interview',
    description:
      'A structured technical interview kit for evaluating frontend developer candidates, focusing on React, JavaScript, and web fundamentals.',
    forRoles: ['1', '5'], // Frontend Developer roles
    interviewType: 'technical',
    duration: 60, // 60 minutes
    questions: [
      { questionId: '1', required: true, order: 1 }, // React hooks question
      { questionId: '3', required: false, order: 2 }, // Binary tree question
    ],
    instructions:
      "This interview should assess the candidate's technical knowledge and problem-solving abilities. Start with a brief introduction, then proceed with the required questions. If time permits, ask the optional questions. Allow time for the candidate to ask questions at the end.",
    createdBy: '2', // David Lee
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    isTemplate: true,
    postInterviewReflectionPrompts: [
      "What were the candidate's strengths and weaknesses in technical knowledge?",
      'How well did the candidate communicate their thought process?',
      'Do they have the technical skills required for this position?',
    ],
  },
  {
    id: '2',
    name: 'Leadership Behavioral Interview',
    description:
      'A comprehensive behavioral interview kit for evaluating leadership qualities, communication skills, and cultural fit.',
    forRoles: ['2', '3', '4'], // Management roles
    interviewType: 'behavioral',
    duration: 45, // 45 minutes
    questions: [
      { questionId: '2', required: true, order: 1 }, // Feedback question
    ],
    instructions:
      "Focus on assessing the candidate's leadership style, communication skills, and past experiences. Use follow-up questions to dig deeper into their responses. Look for specific examples and outcomes in their answers.",
    createdBy: '4', // Michael Johnson
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    isTemplate: true,
    postInterviewReflectionPrompts: [
      'Does the candidate demonstrate leadership qualities?',
      'How would their communication style fit with our team?',
      'What evidence did they provide of their ability to handle difficult situations?',
    ],
  },
];

// Mock data for interview schedule templates
const mockScheduleTemplates: InterviewScheduleTemplate[] = [
  {
    id: '1',
    name: 'Frontend Developer Interview Process',
    description: 'Complete interview process for frontend developer positions',
    forRoles: ['1', '5'], // Frontend Developer roles
    stages: [
      {
        name: 'Initial Technical Screen',
        description: 'Brief technical assessment to evaluate basic qualifications',
        interviewKitId: '1', // Frontend Developer Technical Interview
        duration: 30, // 30 minutes
        interviewers: {
          count: 1,
          roles: ['Recruiter'],
        },
        order: 1,
      },
      {
        name: 'In-depth Technical Interview',
        description: 'Detailed evaluation of technical skills and problem-solving abilities',
        interviewKitId: '1', // Frontend Developer Technical Interview
        duration: 60, // 60 minutes
        interviewers: {
          count: 2,
          roles: ['Hiring Manager', 'Interviewer'],
        },
        order: 2,
      },
      {
        name: 'Team Fit and Cultural Interview',
        description: 'Assessment of cultural fit and team compatibility',
        interviewKitId: '2', // Leadership Behavioral Interview
        duration: 45, // 45 minutes
        interviewers: {
          count: 1,
          roles: ['Team Member'],
        },
        order: 3,
      },
    ],
    createdBy: '1', // Jane Smith
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Context interface
interface StructuredInterviewContextType {
  // State
  questions: InterviewQuestion[];
  interviewKits: InterviewKit[];
  scheduleTemplates: InterviewScheduleTemplate[];

  // Question management
  addQuestion: (
    question: Omit<InterviewQuestion, 'id' | 'createdAt' | 'updatedAt'>
  ) => InterviewQuestion;
  updateQuestion: (
    id: string,
    updates: Partial<InterviewQuestion>
  ) => InterviewQuestion | undefined;
  deleteQuestion: (id: string) => boolean;
  getQuestionById: (id: string) => InterviewQuestion | undefined;
  getQuestionsByCategory: (category: QuestionCategory) => InterviewQuestion[];
  getQuestionsByDifficulty: (level: DifficultyLevel) => InterviewQuestion[];
  getQuestionsByRole: (roleId: string) => InterviewQuestion[];

  // Interview kit management
  createInterviewKit: (kit: Omit<InterviewKit, 'id' | 'createdAt' | 'updatedAt'>) => InterviewKit;
  updateInterviewKit: (id: string, updates: Partial<InterviewKit>) => InterviewKit | undefined;
  deleteInterviewKit: (id: string) => boolean;
  getInterviewKitById: (id: string) => InterviewKit | undefined;
  getInterviewKitsByRole: (roleId: string) => InterviewKit[];
  getInterviewKitsByType: (type: InterviewKit['interviewType']) => InterviewKit[];

  // Schedule template management
  createScheduleTemplate: (
    template: Omit<InterviewScheduleTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ) => InterviewScheduleTemplate;
  updateScheduleTemplate: (
    id: string,
    updates: Partial<InterviewScheduleTemplate>
  ) => InterviewScheduleTemplate | undefined;
  deleteScheduleTemplate: (id: string) => boolean;
  getScheduleTemplateById: (id: string) => InterviewScheduleTemplate | undefined;
  getScheduleTemplatesByRole: (roleId: string) => InterviewScheduleTemplate[];
}

// Create the context
const StructuredInterviewContext = createContext<StructuredInterviewContextType | undefined>(
  undefined
);

// Provider component
export const StructuredInterviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>(mockQuestions);
  const [interviewKits, setInterviewKits] = useState<InterviewKit[]>(mockInterviewKits);
  const [scheduleTemplates, setScheduleTemplates] =
    useState<InterviewScheduleTemplate[]>(mockScheduleTemplates);

  // Question management functions
  const addQuestion = (
    questionData: Omit<InterviewQuestion, 'id' | 'createdAt' | 'updatedAt'>
  ): InterviewQuestion => {
    const timestamp = new Date().toISOString();
    const newQuestion: InterviewQuestion = {
      ...questionData,
      id: uuidv4(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setQuestions((prev) => [...prev, newQuestion]);
    announce('Added new interview question');
    return newQuestion;
  };

  const updateQuestion = (
    id: string,
    updates: Partial<InterviewQuestion>
  ): InterviewQuestion | undefined => {
    const index = questions.findIndex((q) => q.id === id);
    if (index === -1) return undefined;

    const updatedQuestion = {
      ...questions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setQuestions((prev) => [...prev.slice(0, index), updatedQuestion, ...prev.slice(index + 1)]);

    announce('Updated interview question');
    return updatedQuestion;
  };

  const deleteQuestion = (id: string): boolean => {
    // Check if the question is used in any interview kit
    const isUsedInKit = interviewKits.some((kit) => kit.questions.some((q) => q.questionId === id));

    if (isUsedInKit) {
      announce('Cannot delete question. It is used in one or more interview kits.');
      return false;
    }

    setQuestions((prev) => prev.filter((q) => q.id !== id));
    announce('Deleted interview question');
    return true;
  };

  const getQuestionById = (id: string): InterviewQuestion | undefined => {
    return questions.find((q) => q.id === id);
  };

  const getQuestionsByCategory = (category: QuestionCategory): InterviewQuestion[] => {
    return questions.filter((q) => q.category === category);
  };

  const getQuestionsByDifficulty = (level: DifficultyLevel): InterviewQuestion[] => {
    return questions.filter((q) => q.difficultyLevel === level);
  };

  const getQuestionsByRole = (roleId: string): InterviewQuestion[] => {
    return questions.filter((q) => q.roles.includes(roleId));
  };

  // Interview kit management functions
  const createInterviewKit = (
    kitData: Omit<InterviewKit, 'id' | 'createdAt' | 'updatedAt'>
  ): InterviewKit => {
    const timestamp = new Date().toISOString();
    const newKit: InterviewKit = {
      ...kitData,
      id: uuidv4(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setInterviewKits((prev) => [...prev, newKit]);
    announce(`Created new interview kit: ${newKit.name}`);
    return newKit;
  };

  const updateInterviewKit = (
    id: string,
    updates: Partial<InterviewKit>
  ): InterviewKit | undefined => {
    const index = interviewKits.findIndex((kit) => kit.id === id);
    if (index === -1) return undefined;

    const updatedKit = {
      ...interviewKits[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setInterviewKits((prev) => [...prev.slice(0, index), updatedKit, ...prev.slice(index + 1)]);

    announce(`Updated interview kit: ${updatedKit.name}`);
    return updatedKit;
  };

  const deleteInterviewKit = (id: string): boolean => {
    // Check if the kit is used in any schedule template
    const isUsedInTemplate = scheduleTemplates.some((template) =>
      template.stages.some((stage) => stage.interviewKitId === id)
    );

    if (isUsedInTemplate) {
      announce('Cannot delete interview kit. It is used in one or more schedule templates.');
      return false;
    }

    setInterviewKits((prev) => prev.filter((kit) => kit.id !== id));
    announce('Deleted interview kit');
    return true;
  };

  const getInterviewKitById = (id: string): InterviewKit | undefined => {
    return interviewKits.find((kit) => kit.id === id);
  };

  const getInterviewKitsByRole = (roleId: string): InterviewKit[] => {
    return interviewKits.filter((kit) => kit.forRoles.includes(roleId));
  };

  const getInterviewKitsByType = (type: InterviewKit['interviewType']): InterviewKit[] => {
    return interviewKits.filter((kit) => kit.interviewType === type);
  };

  // Schedule template management functions
  const createScheduleTemplate = (
    templateData: Omit<InterviewScheduleTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): InterviewScheduleTemplate => {
    const timestamp = new Date().toISOString();
    const newTemplate: InterviewScheduleTemplate = {
      ...templateData,
      id: uuidv4(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setScheduleTemplates((prev) => [...prev, newTemplate]);
    announce(`Created new schedule template: ${newTemplate.name}`);
    return newTemplate;
  };

  const updateScheduleTemplate = (
    id: string,
    updates: Partial<InterviewScheduleTemplate>
  ): InterviewScheduleTemplate | undefined => {
    const index = scheduleTemplates.findIndex((template) => template.id === id);
    if (index === -1) return undefined;

    const updatedTemplate = {
      ...scheduleTemplates[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setScheduleTemplates((prev) => [
      ...prev.slice(0, index),
      updatedTemplate,
      ...prev.slice(index + 1),
    ]);

    announce(`Updated schedule template: ${updatedTemplate.name}`);
    return updatedTemplate;
  };

  const deleteScheduleTemplate = (id: string): boolean => {
    setScheduleTemplates((prev) => prev.filter((template) => template.id !== id));
    announce('Deleted schedule template');
    return true;
  };

  const getScheduleTemplateById = (id: string): InterviewScheduleTemplate | undefined => {
    return scheduleTemplates.find((template) => template.id === id);
  };

  const getScheduleTemplatesByRole = (roleId: string): InterviewScheduleTemplate[] => {
    return scheduleTemplates.filter((template) => template.forRoles.includes(roleId));
  };

  const contextValue: StructuredInterviewContextType = {
    questions,
    interviewKits,
    scheduleTemplates,

    // Question management
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById,
    getQuestionsByCategory,
    getQuestionsByDifficulty,
    getQuestionsByRole,

    // Interview kit management
    createInterviewKit,
    updateInterviewKit,
    deleteInterviewKit,
    getInterviewKitById,
    getInterviewKitsByRole,
    getInterviewKitsByType,

    // Schedule template management
    createScheduleTemplate,
    updateScheduleTemplate,
    deleteScheduleTemplate,
    getScheduleTemplateById,
    getScheduleTemplatesByRole,
  };

  return (
    <StructuredInterviewContext.Provider value={contextValue}>
      {children}
    </StructuredInterviewContext.Provider>
  );
};

// Custom hook for consuming the context
export const useStructuredInterview = () => {
  const context = useContext(StructuredInterviewContext);
  if (context === undefined) {
    throw new Error('useStructuredInterview must be used within a StructuredInterviewProvider');
  }
  return context;
};

export default StructuredInterviewContext;
