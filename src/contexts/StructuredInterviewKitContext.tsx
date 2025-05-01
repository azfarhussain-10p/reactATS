import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import {
  QuestionCategory,
  DifficultyLevel,
  ScoringCriteria,
  InterviewQuestion,
  KitQuestion,
  InterviewKit,
  InterviewStage,
  InterviewScheduleTemplate,
  RubricItem,
} from '../models/types';

// Mock data for question categories
const mockCategories: QuestionCategory[] = [
  {
    id: '1',
    name: 'Technical Skills',
    description: 'Questions to assess technical knowledge and abilities',
  },
  {
    id: '2',
    name: 'Problem Solving',
    description: 'Questions to evaluate analytical and problem-solving abilities',
  },
  {
    id: '3',
    name: 'Communication',
    description: 'Questions to assess verbal and written communication skills',
  },
  {
    id: '4',
    name: 'Leadership',
    description: 'Questions to evaluate leadership potential and experience',
  },
  {
    id: '5',
    name: 'Cultural Fit',
    description: 'Questions to assess alignment with company values and culture',
  },
];

// Mock data for difficulty levels
const mockDifficultyLevels: DifficultyLevel[] = [
  { id: '1', name: 'Entry Level', description: 'For junior positions, 0-2 years of experience' },
  { id: '2', name: 'Junior', description: 'For positions requiring 1-3 years of experience' },
  { id: '3', name: 'Mid-Level', description: 'For positions requiring 3-5 years of experience' },
  { id: '4', name: 'Senior', description: 'For positions requiring 5+ years of experience' },
  { id: '5', name: 'Expert', description: 'For specialized or leadership roles' },
];

// Mock data for scoring criteria
const mockScoringCriteria: ScoringCriteria[] = [
  {
    id: '1',
    name: 'Technical Proficiency',
    description: "Evaluates the candidate's technical knowledge and skills",
  },
  {
    id: '2',
    name: 'Problem-Solving Ability',
    description: 'Assesses how the candidate approaches and solves problems',
  },
  {
    id: '3',
    name: 'Communication Skills',
    description: 'Evaluates how effectively the candidate communicates',
  },
];

// Mock data for rubric items
const mockRubricItems: RubricItem[] = [
  {
    id: 'rub-1',
    criteriaId: '1',
    score: 1,
    description: 'Little to no relevant technical knowledge',
  },
  {
    id: 'rub-2',
    criteriaId: '1',
    score: 2,
    description: 'Basic understanding but significant gaps',
  },
  { id: 'rub-3', criteriaId: '1', score: 3, description: 'Adequate knowledge for the role' },
  { id: 'rub-4', criteriaId: '1', score: 4, description: 'Strong technical knowledge and skills' },
  { id: 'rub-5', criteriaId: '1', score: 5, description: 'Exceptional technical expertise' },
  { id: 'rub-6', criteriaId: '2', score: 1, description: 'Unable to solve basic problems' },
  {
    id: 'rub-7',
    criteriaId: '2',
    score: 3,
    description: 'Adequately solves problems with some guidance',
  },
  {
    id: 'rub-8',
    criteriaId: '2',
    score: 5,
    description: 'Exceptional problem-solving with innovative approaches',
  },
  {
    id: 'rub-9',
    criteriaId: '3',
    score: 1,
    description: 'Poor communication, difficult to understand',
  },
  {
    id: 'rub-10',
    criteriaId: '3',
    score: 3,
    description: 'Clear communication with occasional issues',
  },
  {
    id: 'rub-11',
    criteriaId: '3',
    score: 5,
    description: 'Exceptional communicator, articulate and engaging',
  },
];

// Mock data for interview questions
const mockQuestions: InterviewQuestion[] = [
  {
    id: '1',
    question: 'Explain the difference between REST and GraphQL.',
    categoryId: '1',
    difficultyLevelId: '3',
    expectedAnswer:
      'A good answer should compare both technologies, highlighting that REST is a style of API design using standard HTTP methods while GraphQL is a query language for APIs allowing clients to request exactly what they need.',
    rubricItems: ['rub-1', 'rub-3', 'rub-5'],
    timeGuidelineMinutes: 10,
    followUpQuestions: [
      'What are the pros and cons of each approach?',
      'When would you choose one over the other?',
    ],
  },
  {
    id: '2',
    question:
      'Describe a situation where you had to explain a complex technical concept to a non-technical stakeholder.',
    categoryId: '3',
    difficultyLevelId: '2',
    expectedAnswer:
      'Looking for examples that demonstrate ability to translate technical concepts, adapt communication style, and ensure understanding.',
    rubricItems: ['rub-9', 'rub-10', 'rub-11'],
    timeGuidelineMinutes: 8,
  },
  {
    id: '3',
    question: 'Design a system that can handle processing 10,000 requests per second.',
    categoryId: '2',
    difficultyLevelId: '5',
    expectedAnswer:
      'Candidate should discuss load balancing, caching strategies, database optimization, horizontal scaling, and potential bottlenecks.',
    rubricItems: ['rub-6', 'rub-7', 'rub-8'],
    timeGuidelineMinutes: 15,
    followUpQuestions: [
      'How would you monitor this system?',
      'What failure scenarios should we prepare for?',
    ],
  },
];

// Mock data for interview kits
const mockInterviewKits: InterviewKit[] = [
  {
    id: '1',
    name: 'Senior Frontend Developer Kit',
    description: 'Comprehensive interview kit for senior frontend developer positions',
    questions: [
      { id: 'kq-1', questionId: '1', order: 1, isRequired: true },
      { id: 'kq-2', questionId: '3', order: 2, isRequired: true },
    ],
    totalTimeMinutes: 60,
    createdBy: 'user789',
    createdAt: '2023-04-15T09:00:00Z',
    updatedAt: '2023-05-10T14:20:00Z',
    status: 'active',
    difficultyLevelId: '4',
  },
  {
    id: '2',
    name: 'Junior Developer Technical Interview',
    description: 'Basic technical assessment for junior developers',
    questions: [
      { id: 'kq-3', questionId: '1', order: 1, isRequired: true },
      { id: 'kq-4', questionId: '2', order: 2, isRequired: false },
    ],
    totalTimeMinutes: 45,
    createdBy: 'user456',
    createdAt: '2023-05-12T11:30:00Z',
    updatedAt: '2023-05-12T11:30:00Z',
    status: 'draft',
    difficultyLevelId: '2',
  },
];

// Mock data for interview stages
const mockInterviewStages: InterviewStage[] = [
  {
    id: '1',
    name: 'Initial Technical Screening',
    description: 'First technical evaluation to assess basic skills',
    order: 1,
    kitId: '2',
    durationMinutes: 45,
    isOptional: false,
  },
  {
    id: '2',
    name: 'In-depth Technical Interview',
    description: 'Comprehensive technical assessment',
    order: 2,
    kitId: '1',
    durationMinutes: 60,
    isOptional: false,
  },
  {
    id: '3',
    name: 'Cultural Fit and Team Interview',
    description: 'Assessment of soft skills and team compatibility',
    order: 3,
    kitId: null, // Custom questions, not from a kit
    durationMinutes: 30,
    isOptional: true,
  },
];

// Mock data for interview schedule templates
const mockScheduleTemplates: InterviewScheduleTemplate[] = [
  {
    id: '1',
    name: 'Standard Engineering Interview Process',
    description: 'Standard interview process for engineering roles',
    stages: [mockInterviewStages[0], mockInterviewStages[1], mockInterviewStages[2]],
    totalDurationMinutes: 135,
    createdBy: 'user789',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2023-06-01T10:00:00Z',
    status: 'active',
  },
  {
    id: '2',
    name: 'Executive Leadership Interview Process',
    description: 'Comprehensive interview process for leadership positions',
    stages: [mockInterviewStages[2]],
    totalDurationMinutes: 30,
    createdBy: 'user123',
    createdAt: '2023-06-05T14:30:00Z',
    updatedAt: '2023-06-10T09:15:00Z',
    status: 'active',
  },
];

interface StructuredInterviewKitContextType {
  loading: boolean;

  // Data collections
  questionCategories: QuestionCategory[];
  difficultyLevels: DifficultyLevel[];
  scoringCriteria: ScoringCriteria[];
  rubricItems: RubricItem[];
  interviewQuestions: InterviewQuestion[];
  interviewKits: InterviewKit[];
  scheduleTemplates: InterviewScheduleTemplate[];

  // Question Categories CRUD
  createQuestionCategory: (category: Omit<QuestionCategory, 'id'>) => void;
  updateQuestionCategory: (id: string, updatedCategory: Partial<QuestionCategory>) => void;
  deleteQuestionCategory: (id: string) => void;

  // Difficulty Levels CRUD
  createDifficultyLevel: (level: Omit<DifficultyLevel, 'id'>) => void;
  updateDifficultyLevel: (id: string, updatedLevel: Partial<DifficultyLevel>) => void;
  deleteDifficultyLevel: (id: string) => void;

  // Scoring Criteria CRUD
  createScoringCriteria: (criteria: Omit<ScoringCriteria, 'id'>) => void;
  updateScoringCriteria: (id: string, updatedCriteria: Partial<ScoringCriteria>) => void;
  deleteScoringCriteria: (id: string) => void;

  // Rubric Items CRUD
  createRubricItem: (item: Omit<RubricItem, 'id'>) => void;
  updateRubricItem: (id: string, updatedItem: Partial<RubricItem>) => void;
  deleteRubricItem: (id: string) => void;

  // Interview Questions CRUD
  createInterviewQuestion: (question: Omit<InterviewQuestion, 'id'>) => void;
  updateInterviewQuestion: (id: string, updatedQuestion: Partial<InterviewQuestion>) => void;
  deleteInterviewQuestion: (id: string) => void;

  // Interview Kits CRUD
  createInterviewKit: (kit: Omit<InterviewKit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInterviewKit: (id: string, updatedKit: Partial<InterviewKit>) => void;
  deleteInterviewKit: (id: string) => void;

  // Schedule Templates CRUD
  createScheduleTemplate: (
    template: Omit<InterviewScheduleTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  updateScheduleTemplate: (id: string, updatedTemplate: Partial<InterviewScheduleTemplate>) => void;
  deleteScheduleTemplate: (id: string) => void;
}

const StructuredInterviewKitContext = createContext<StructuredInterviewKitContextType | undefined>(
  undefined
);

export const useStructuredInterviewKit = (): StructuredInterviewKitContextType => {
  const context = useContext(StructuredInterviewKitContext);
  if (!context) {
    throw new Error(
      'useStructuredInterviewKit must be used within a StructuredInterviewKitProvider'
    );
  }
  return context;
};

interface StructuredInterviewKitProviderProps {
  children: ReactNode;
}

export const StructuredInterviewKitProvider = ({
  children,
}: StructuredInterviewKitProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [questionCategories, setQuestionCategories] = useState<QuestionCategory[]>(mockCategories);
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>(mockDifficultyLevels);
  const [scoringCriteria, setScoringCriteria] = useState<ScoringCriteria[]>(mockScoringCriteria);
  const [rubricItems, setRubricItems] = useState<RubricItem[]>(mockRubricItems);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>(mockQuestions);
  const [interviewKits, setInterviewKits] = useState<InterviewKit[]>(mockInterviewKits);
  const [scheduleTemplates, setScheduleTemplates] =
    useState<InterviewScheduleTemplate[]>(mockScheduleTemplates);

  // Simulate loading data from API
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Helper function to generate a unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Question Categories CRUD operations
  const createQuestionCategory = (category: Omit<QuestionCategory, 'id'>) => {
    const newCategory: QuestionCategory = {
      ...category,
      id: `cat-${generateId()}`,
    };
    setQuestionCategories([...questionCategories, newCategory]);
  };

  const updateQuestionCategory = (id: string, updatedCategory: Partial<QuestionCategory>) => {
    setQuestionCategories(
      questionCategories.map((category) =>
        category.id === id ? { ...category, ...updatedCategory } : category
      )
    );
  };

  const deleteQuestionCategory = (id: string) => {
    setQuestionCategories(questionCategories.filter((category) => category.id !== id));
  };

  // Difficulty Levels CRUD operations
  const createDifficultyLevel = (level: Omit<DifficultyLevel, 'id'>) => {
    const newLevel: DifficultyLevel = {
      ...level,
      id: `diff-${generateId()}`,
    };
    setDifficultyLevels([...difficultyLevels, newLevel]);
  };

  const updateDifficultyLevel = (id: string, updatedLevel: Partial<DifficultyLevel>) => {
    setDifficultyLevels(
      difficultyLevels.map((level) => (level.id === id ? { ...level, ...updatedLevel } : level))
    );
  };

  const deleteDifficultyLevel = (id: string) => {
    setDifficultyLevels(difficultyLevels.filter((level) => level.id !== id));
  };

  // Scoring Criteria CRUD operations
  const createScoringCriteria = (criteria: Omit<ScoringCriteria, 'id'>) => {
    const newCriteria: ScoringCriteria = {
      ...criteria,
      id: `sc-${generateId()}`,
    };
    setScoringCriteria([...scoringCriteria, newCriteria]);
  };

  const updateScoringCriteria = (id: string, updatedCriteria: Partial<ScoringCriteria>) => {
    setScoringCriteria(
      scoringCriteria.map((criteria) =>
        criteria.id === id ? { ...criteria, ...updatedCriteria } : criteria
      )
    );
  };

  const deleteScoringCriteria = (id: string) => {
    setScoringCriteria(scoringCriteria.filter((criteria) => criteria.id !== id));
  };

  // Rubric Items CRUD operations
  const createRubricItem = (item: Omit<RubricItem, 'id'>) => {
    const newItem: RubricItem = {
      ...item,
      id: `rub-${generateId()}`,
    };
    setRubricItems([...rubricItems, newItem]);
  };

  const updateRubricItem = (id: string, updatedItem: Partial<RubricItem>) => {
    setRubricItems(
      rubricItems.map((item) => (item.id === id ? { ...item, ...updatedItem } : item))
    );
  };

  const deleteRubricItem = (id: string) => {
    setRubricItems(rubricItems.filter((item) => item.id !== id));
  };

  // Interview Questions CRUD operations
  const createInterviewQuestion = (question: Omit<InterviewQuestion, 'id'>) => {
    const newQuestion: InterviewQuestion = {
      ...question,
      id: `q-${generateId()}`,
    };
    setInterviewQuestions([...interviewQuestions, newQuestion]);
  };

  const updateInterviewQuestion = (id: string, updatedQuestion: Partial<InterviewQuestion>) => {
    setInterviewQuestions(
      interviewQuestions.map((question) =>
        question.id === id ? { ...question, ...updatedQuestion } : question
      )
    );
  };

  const deleteInterviewQuestion = (id: string) => {
    setInterviewQuestions(interviewQuestions.filter((question) => question.id !== id));
  };

  // Interview Kits CRUD operations
  const createInterviewKit = (kit: Omit<InterviewKit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newKit: InterviewKit = {
      ...kit,
      id: `kit-${generateId()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInterviewKits([...interviewKits, newKit]);
  };

  const updateInterviewKit = (id: string, updatedKit: Partial<InterviewKit>) => {
    setInterviewKits(
      interviewKits.map((kit) =>
        kit.id === id
          ? {
              ...kit,
              ...updatedKit,
              updatedAt: new Date().toISOString(),
            }
          : kit
      )
    );
  };

  const deleteInterviewKit = (id: string) => {
    setInterviewKits(interviewKits.filter((kit) => kit.id !== id));
  };

  // Schedule Templates CRUD operations
  const createScheduleTemplate = (
    template: Omit<InterviewScheduleTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newTemplate: InterviewScheduleTemplate = {
      ...template,
      id: `template-${generateId()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setScheduleTemplates([...scheduleTemplates, newTemplate]);
  };

  const updateScheduleTemplate = (
    id: string,
    updatedTemplate: Partial<InterviewScheduleTemplate>
  ) => {
    setScheduleTemplates(
      scheduleTemplates.map((template) =>
        template.id === id
          ? {
              ...template,
              ...updatedTemplate,
              updatedAt: new Date().toISOString(),
            }
          : template
      )
    );
  };

  const deleteScheduleTemplate = (id: string) => {
    setScheduleTemplates(scheduleTemplates.filter((template) => template.id !== id));
  };

  // Provide the context value
  const contextValue: StructuredInterviewKitContextType = {
    loading,
    questionCategories,
    difficultyLevels,
    scoringCriteria,
    rubricItems,
    interviewQuestions,
    interviewKits,
    scheduleTemplates,
    createQuestionCategory,
    updateQuestionCategory,
    deleteQuestionCategory,
    createDifficultyLevel,
    updateDifficultyLevel,
    deleteDifficultyLevel,
    createScoringCriteria,
    updateScoringCriteria,
    deleteScoringCriteria,
    createRubricItem,
    updateRubricItem,
    deleteRubricItem,
    createInterviewQuestion,
    updateInterviewQuestion,
    deleteInterviewQuestion,
    createInterviewKit,
    updateInterviewKit,
    deleteInterviewKit,
    createScheduleTemplate,
    updateScheduleTemplate,
    deleteScheduleTemplate,
  };

  return (
    <StructuredInterviewKitContext.Provider value={contextValue}>
      {children}
    </StructuredInterviewKitContext.Provider>
  );
};
