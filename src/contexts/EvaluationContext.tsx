import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EvaluationForm, EvaluationResponse } from '../models/types';

// Default Technical evaluation form
const technicalEvaluationForm: EvaluationForm = {
  id: '1',
  name: 'Technical Role Evaluation',
  isDefault: true,
  sections: [
    {
      id: 'technical',
      title: 'Technical Skills',
      description: "Evaluate the candidate's technical abilities and knowledge",
      weight: 40,
      criteria: [
        {
          id: 'techKnowledge',
          name: 'Technical Knowledge',
          description: 'Understanding of required technologies and concepts',
          type: 'rating',
          required: true,
          weight: 25,
        },
        {
          id: 'problemSolving',
          name: 'Problem Solving',
          description: 'Ability to analyze problems and create effective solutions',
          type: 'rating',
          required: true,
          weight: 25,
        },
        {
          id: 'codeQuality',
          name: 'Code Quality',
          description: 'Code organization, readability, and maintainability',
          type: 'rating',
          required: true,
          weight: 20,
        },
        {
          id: 'systemDesign',
          name: 'System Design',
          description: 'Ability to design scalable and efficient systems',
          type: 'rating',
          required: true,
          weight: 15,
        },
        {
          id: 'toolExperience',
          name: 'Tool Experience',
          description: 'Familiarity with required tools and frameworks',
          type: 'rating',
          required: true,
          weight: 15,
        },
      ],
    },
    {
      id: 'softSkills',
      title: 'Soft Skills',
      description: "Evaluate the candidate's communication and collaboration abilities",
      weight: 30,
      criteria: [
        {
          id: 'communication',
          name: 'Communication',
          description: 'Clear and effective verbal and written communication',
          type: 'rating',
          required: true,
          weight: 30,
        },
        {
          id: 'teamwork',
          name: 'Teamwork',
          description: 'Ability to work effectively in a team environment',
          type: 'rating',
          required: true,
          weight: 25,
        },
        {
          id: 'adaptability',
          name: 'Adaptability',
          description: 'Openness to new ideas and ability to adapt to change',
          type: 'rating',
          required: true,
          weight: 25,
        },
        {
          id: 'timeManagement',
          name: 'Time Management',
          description: 'Ability to prioritize and meet deadlines',
          type: 'rating',
          required: true,
          weight: 20,
        },
      ],
    },
    {
      id: 'culturalFit',
      title: 'Cultural Fit',
      description: "Evaluate the candidate's alignment with company values and culture",
      weight: 30,
      criteria: [
        {
          id: 'values',
          name: 'Company Values Alignment',
          description: 'Alignment with our core values and mission',
          type: 'rating',
          required: true,
          weight: 35,
        },
        {
          id: 'motivation',
          name: 'Motivation',
          description: 'Enthusiasm for the role and company',
          type: 'rating',
          required: true,
          weight: 35,
        },
        {
          id: 'growthPotential',
          name: 'Growth Potential',
          description: 'Capacity and desire for future growth',
          type: 'rating',
          required: true,
          weight: 30,
        },
      ],
    },
  ],
};

// Default Non-Technical evaluation form
const nonTechnicalEvaluationForm: EvaluationForm = {
  id: '2',
  name: 'Non-Technical Role Evaluation',
  isDefault: false,
  sections: [
    {
      id: 'professionalExperience',
      title: 'Professional Experience',
      description: "Evaluate the candidate's relevant experience and knowledge",
      weight: 35,
      criteria: [
        {
          id: 'domainKnowledge',
          name: 'Domain Knowledge',
          description: 'Understanding of the field and industry',
          type: 'rating',
          required: true,
          weight: 30,
        },
        {
          id: 'experienceRelevance',
          name: 'Experience Relevance',
          description: 'How well past experience aligns with role requirements',
          type: 'rating',
          required: true,
          weight: 30,
        },
        {
          id: 'accomplishments',
          name: 'Past Accomplishments',
          description: 'Significant achievements in previous roles',
          type: 'rating',
          required: true,
          weight: 20,
        },
        {
          id: 'toolProficiency',
          name: 'Tool Proficiency',
          description: 'Familiarity with relevant tools and software',
          type: 'rating',
          required: true,
          weight: 20,
        },
      ],
    },
    {
      id: 'softSkills',
      title: 'Soft Skills',
      description: "Evaluate the candidate's interpersonal and communication abilities",
      weight: 40,
      criteria: [
        {
          id: 'communication',
          name: 'Communication',
          description: 'Clear and effective verbal and written communication',
          type: 'rating',
          required: true,
          weight: 25,
        },
        {
          id: 'teamwork',
          name: 'Teamwork',
          description: 'Ability to collaborate and work effectively with others',
          type: 'rating',
          required: true,
          weight: 20,
        },
        {
          id: 'problemSolving',
          name: 'Problem Solving',
          description: 'Approach to analyzing and solving problems',
          type: 'rating',
          required: true,
          weight: 20,
        },
        {
          id: 'leadership',
          name: 'Leadership',
          description: 'Ability to guide and influence others',
          type: 'rating',
          required: true,
          weight: 20,
        },
        {
          id: 'adaptability',
          name: 'Adaptability',
          description: 'Openness to new ideas and ability to adapt to change',
          type: 'rating',
          required: true,
          weight: 15,
        },
      ],
    },
    {
      id: 'culturalFit',
      title: 'Cultural Fit',
      description: "Evaluate the candidate's alignment with company values and culture",
      weight: 25,
      criteria: [
        {
          id: 'values',
          name: 'Company Values Alignment',
          description: 'Alignment with our core values and mission',
          type: 'rating',
          required: true,
          weight: 35,
        },
        {
          id: 'motivation',
          name: 'Motivation',
          description: 'Enthusiasm for the role and company',
          type: 'rating',
          required: true,
          weight: 35,
        },
        {
          id: 'growthMindset',
          name: 'Growth Mindset',
          description: 'Willingness to learn and develop',
          type: 'rating',
          required: true,
          weight: 30,
        },
      ],
    },
  ],
};

// Default forms
const defaultForms: EvaluationForm[] = [technicalEvaluationForm, nonTechnicalEvaluationForm];

// Mock evaluation responses
const mockResponses: EvaluationResponse[] = [
  {
    id: uuidv4(),
    formId: '1',
    candidateId: 1,
    interviewerId: '2',
    interviewDate: '2023-11-20',
    submissionDate: '2023-11-20',
    responses: [
      { criteriaId: 'techKnowledge', value: 4 },
      { criteriaId: 'problemSolving', value: 4 },
      { criteriaId: 'codeQuality', value: 4 },
      { criteriaId: 'systemDesign', value: 3 },
      { criteriaId: 'toolExperience', value: 4 },
      { criteriaId: 'communication', value: 3 },
      { criteriaId: 'teamwork', value: 4 },
      { criteriaId: 'adaptability', value: 4 },
      { criteriaId: 'timeManagement', value: 3 },
      { criteriaId: 'values', value: 4 },
      { criteriaId: 'motivation', value: 5 },
      { criteriaId: 'growthPotential', value: 4 },
    ],
    scores: [
      { sectionId: 'technical', score: 3.8 },
      { sectionId: 'softSkills', score: 3.5 },
      { sectionId: 'culturalFit', score: 4.3 },
    ],
    overallScore: 3.8,
    recommendation: 'Hire',
    strengths: 'Strong React knowledge, good problem-solving approach, clean code structure.',
    improvements: 'Could improve on system design and state management.',
    notes: 'Good candidate overall, would be a strong addition to the team.',
    isComplete: true,
    reminderSent: false,
  },
];

// Context type
interface EvaluationContextType {
  forms: EvaluationForm[];
  responses: EvaluationResponse[];
  addForm: (form: Omit<EvaluationForm, 'id'>) => string;
  updateForm: (id: string, updates: Partial<EvaluationForm>) => boolean;
  deleteForm: (id: string) => boolean;
  getFormById: (id: string) => EvaluationForm | null;
  getDefaultForm: (isTechnical?: boolean) => EvaluationForm;
  setDefaultForm: (id: string) => boolean;
  addResponse: (response: Omit<EvaluationResponse, 'id'>) => string;
  updateResponse: (id: string, updates: Partial<EvaluationResponse>) => boolean;
  deleteResponse: (id: string) => boolean;
  getResponseById: (id: string) => EvaluationResponse | null;
  getResponsesForCandidate: (candidateId: number) => EvaluationResponse[];
  getCandidateScoreAverage: (candidateId: number) => number;
  calculateOverallScore: (
    responses: { criteriaId: string; value: number | string | boolean }[],
    formId: string
  ) => {
    sectionScores: { sectionId: string; score: number }[];
    overallScore: number;
  };
  sendReminderForIncompleteEvaluations: (days: number) => string[];
}

// Create context
const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

// Provider component
export const EvaluationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [forms, setForms] = useState<EvaluationForm[]>(defaultForms);
  const [responses, setResponses] = useState<EvaluationResponse[]>(mockResponses);

  // Add a new form
  const addForm = (formData: Omit<EvaluationForm, 'id'>) => {
    const newId = uuidv4();
    const newForm: EvaluationForm = {
      ...formData,
      id: newId,
    };

    setForms((prev) => [...prev, newForm]);
    return newId;
  };

  // Update a form
  const updateForm = (id: string, updates: Partial<EvaluationForm>) => {
    let updated = false;

    setForms((prev) => {
      const newForms = prev.map((form) => {
        if (form.id === id) {
          updated = true;
          return { ...form, ...updates };
        }
        return form;
      });

      return newForms;
    });

    return updated;
  };

  // Delete a form
  const deleteForm = (id: string) => {
    let deleted = false;

    // Check if we're trying to delete the default form
    const isDefault = forms.find((f) => f.id === id)?.isDefault;
    if (isDefault && forms.filter((f) => f.isDefault).length <= 1) {
      return false; // Don't delete the only default form
    }

    setForms((prev) => {
      const filtered = prev.filter((form) => {
        if (form.id === id) {
          deleted = true;
          return false;
        }
        return true;
      });

      // If we deleted a default form, set a new default
      if (deleted && isDefault && filtered.length > 0) {
        filtered[0].isDefault = true;
      }

      return filtered;
    });

    return deleted;
  };

  // Get a form by ID
  const getFormById = (id: string) => {
    return forms.find((form) => form.id === id) || null;
  };

  // Get the default form (technical or non-technical)
  const getDefaultForm = (isTechnical = true) => {
    if (isTechnical) {
      return forms.find((form) => form.isDefault && form.name.includes('Technical')) || forms[0];
    } else {
      return (
        forms.find((form) => form.isDefault && form.name.includes('Non-Technical')) || forms[1]
      );
    }
  };

  // Set a form as the default
  const setDefaultForm = (id: string) => {
    const form = getFormById(id);
    if (!form) return false;

    const isTechnical = form.name.includes('Technical');

    setForms((prev) =>
      prev.map((f) => ({
        ...f,
        isDefault: f.id === id || (f.isDefault && isTechnical !== f.name.includes('Technical')),
      }))
    );

    return true;
  };

  // Add a new response
  const addResponse = (responseData: Omit<EvaluationResponse, 'id'>) => {
    const newId = uuidv4();
    const newResponse: EvaluationResponse = {
      ...responseData,
      id: newId,
    };

    setResponses((prev) => [...prev, newResponse]);
    return newId;
  };

  // Update a response
  const updateResponse = (id: string, updates: Partial<EvaluationResponse>) => {
    let updated = false;

    setResponses((prev) => {
      const newResponses = prev.map((response) => {
        if (response.id === id) {
          updated = true;
          return { ...response, ...updates };
        }
        return response;
      });

      return newResponses;
    });

    return updated;
  };

  // Delete a response
  const deleteResponse = (id: string) => {
    let deleted = false;

    setResponses((prev) => {
      const filtered = prev.filter((response) => {
        if (response.id === id) {
          deleted = true;
          return false;
        }
        return true;
      });

      return filtered;
    });

    return deleted;
  };

  // Get a response by ID
  const getResponseById = (id: string) => {
    return responses.find((response) => response.id === id) || null;
  };

  // Get responses for a candidate
  const getResponsesForCandidate = (candidateId: number) => {
    return responses.filter((response) => response.candidateId === candidateId);
  };

  // Calculate average score for a candidate
  const getCandidateScoreAverage = (candidateId: number) => {
    const candidateResponses = getResponsesForCandidate(candidateId);
    if (candidateResponses.length === 0) return 0;

    const sum = candidateResponses.reduce((acc, response) => acc + response.overallScore, 0);
    return sum / candidateResponses.length;
  };

  // Calculate scores for a set of responses
  const calculateOverallScore = (
    criteriaResponses: { criteriaId: string; value: number | string | boolean }[],
    formId: string
  ) => {
    const form = getFormById(formId);
    if (!form) {
      return {
        sectionScores: [],
        overallScore: 0,
      };
    }

    // Calculate scores for each section
    const sectionScores = form.sections.map((section) => {
      const sectionCriteria = section.criteria.map((c) => c.id);

      // Filter responses to only include this section's criteria
      const sectionResponses = criteriaResponses.filter(
        (r) => sectionCriteria.includes(r.criteriaId) && typeof r.value === 'number'
      );

      if (sectionResponses.length === 0) {
        return { sectionId: section.id, score: 0 };
      }

      // Calculate weighted average for criteria in this section
      let totalWeightedScore = 0;
      let totalWeight = 0;

      sectionResponses.forEach((response) => {
        const criterion = section.criteria.find((c) => c.id === response.criteriaId);
        if (criterion && typeof response.value === 'number') {
          totalWeightedScore += response.value * criterion.weight;
          totalWeight += criterion.weight;
        }
      });

      const sectionScore = totalWeight === 0 ? 0 : totalWeightedScore / totalWeight;
      return { sectionId: section.id, score: sectionScore };
    });

    // Calculate overall weighted score based on section weights
    let totalWeightedScore = 0;
    let totalWeight = 0;

    sectionScores.forEach((sectionScore) => {
      const section = form.sections.find((s) => s.id === sectionScore.sectionId);
      if (section) {
        totalWeightedScore += sectionScore.score * section.weight;
        totalWeight += section.weight;
      }
    });

    const overallScore = totalWeight === 0 ? 0 : totalWeightedScore / totalWeight;

    return {
      sectionScores,
      overallScore,
    };
  };

  // Send reminders for incomplete evaluations
  const sendReminderForIncompleteEvaluations = (days: number) => {
    const remindedIds: string[] = [];

    // Find responses that are incomplete and haven't had reminders sent
    const incompleteResponses = responses.filter(
      (r) =>
        !r.isComplete &&
        !r.reminderSent &&
        new Date().getTime() - new Date(r.interviewDate).getTime() > days * 24 * 60 * 60 * 1000
    );

    if (incompleteResponses.length === 0) {
      return remindedIds;
    }

    // Update the responses to mark reminders as sent
    setResponses((prev) =>
      prev.map((response) => {
        if (
          !response.isComplete &&
          !response.reminderSent &&
          new Date().getTime() - new Date(response.interviewDate).getTime() >
            days * 24 * 60 * 60 * 1000
        ) {
          remindedIds.push(response.id);
          return { ...response, reminderSent: true };
        }
        return response;
      })
    );

    // In a real app, this would also send emails or notifications

    return remindedIds;
  };

  const value = {
    forms,
    responses,
    addForm,
    updateForm,
    deleteForm,
    getFormById,
    getDefaultForm,
    setDefaultForm,
    addResponse,
    updateResponse,
    deleteResponse,
    getResponseById,
    getResponsesForCandidate,
    getCandidateScoreAverage,
    calculateOverallScore,
    sendReminderForIncompleteEvaluations,
  };

  return <EvaluationContext.Provider value={value}>{children}</EvaluationContext.Provider>;
};

// Custom hook to use evaluation context
export const useEvaluation = () => {
  const context = useContext(EvaluationContext);
  if (context === undefined) {
    throw new Error('useEvaluation must be used within an EvaluationProvider');
  }
  return context;
};

export default EvaluationContext;
