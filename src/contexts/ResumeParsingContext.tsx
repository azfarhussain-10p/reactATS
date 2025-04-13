import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  ParsedResume, 
  ScreeningResult, 
  ScreeningQuestionnaire,
  QuestionnaireResponse,
  Candidate
} from '../models/types';

// Mock parsed resumes
const mockParsedResumes: ParsedResume[] = [
  {
    id: uuidv4(),
    candidateId: 1,
    rawText: "John Doe\njohndoe@example.com\n(555) 123-4567\nExperienced Frontend Developer...",
    parsedData: {
      name: "John Doe",
      email: "johndoe@example.com",
      phone: "(555) 123-4567",
      location: "San Francisco, CA",
      summary: "Experienced Frontend Developer with 5+ years of expertise in React and TypeScript...",
      skills: ["JavaScript", "React", "TypeScript", "HTML", "CSS", "Redux", "Jest", "Webpack"],
      experience: [
        {
          company: "Tech Solutions Inc.",
          title: "Senior Frontend Developer",
          duration: "3 years",
          startDate: "2020-01",
          endDate: "2023-04",
          description: "Led development of customer-facing applications using React and TypeScript."
        },
        {
          company: "Web Innovate",
          title: "Frontend Developer",
          duration: "2 years",
          startDate: "2018-02",
          endDate: "2019-12",
          description: "Built responsive web applications and maintained legacy code."
        }
      ],
      education: [
        {
          institution: "University of Technology",
          degree: "Bachelor of Science",
          field: "Computer Science",
          graduationDate: "2018"
        }
      ],
      certifications: ["React Certification", "AWS Developer Associate"],
      languages: ["English", "Spanish"],
      websites: ["https://johndoe.dev", "https://github.com/johndoe"]
    },
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Processed",
    confidence: 0.92
  },
  {
    id: uuidv4(),
    candidateId: 2,
    rawText: "Jane Smith\njanesmith@example.com\n(555) 987-6543\nCreative UX/UI Designer...",
    parsedData: {
      name: "Jane Smith",
      email: "janesmith@example.com",
      phone: "(555) 987-6543",
      location: "New York, NY",
      summary: "Creative UX/UI Designer with a passion for creating intuitive user experiences...",
      skills: ["UI/UX Design", "Figma", "Adobe XD", "Sketch", "Prototyping", "User Research", "HTML/CSS"],
      experience: [
        {
          company: "Design Studio",
          title: "Senior UI/UX Designer",
          duration: "4 years",
          startDate: "2019-06",
          endDate: "2023-04",
          description: "Created user interfaces for web and mobile applications."
        },
        {
          company: "Creative Agency",
          title: "UI Designer",
          duration: "2 years",
          startDate: "2017-05",
          endDate: "2019-05",
          description: "Designed website layouts and branding materials."
        }
      ],
      education: [
        {
          institution: "Design Institute",
          degree: "Bachelor of Fine Arts",
          field: "Graphic Design",
          graduationDate: "2017"
        }
      ],
      certifications: ["Certified UX Designer"],
      languages: ["English", "French"],
      websites: ["https://janesmith.design", "https://dribbble.com/janesmith"]
    },
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Processed",
    confidence: 0.88
  }
];

// Mock screening results
const mockScreeningResults: ScreeningResult[] = [
  {
    id: uuidv4(),
    candidateId: 1,
    jobId: 1,
    parsedResumeId: mockParsedResumes[0].id,
    overallScore: 87,
    skillMatch: {
      score: 90,
      requiredSkillsFound: ["JavaScript", "React", "TypeScript"],
      requiredSkillsMissing: ["Node.js"],
      preferredSkillsFound: ["Redux", "Jest"]
    },
    experienceMatch: {
      score: 85,
      yearsOfRelevantExperience: 5,
      relevantCompanies: ["Tech Solutions Inc."],
      relevantRoles: ["Senior Frontend Developer", "Frontend Developer"]
    },
    educationMatch: {
      score: 100,
      requiredEducationMet: true,
      relevantDegrees: ["Bachelor of Science"],
      relevantFields: ["Computer Science"]
    },
    employmentGaps: {
      hasGaps: false,
      gapPeriods: [],
      totalGapMonths: 0
    },
    keywordMatch: {
      score: 80,
      keywordsFound: {
        "frontend": 3,
        "react": 2,
        "typescript": 2,
        "development": 1
      }
    },
    screened: true,
    qualified: true,
    notes: "Strong technical skills, good experience match.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: uuidv4(),
    candidateId: 2,
    jobId: 2,
    parsedResumeId: mockParsedResumes[1].id,
    overallScore: 75,
    skillMatch: {
      score: 85,
      requiredSkillsFound: ["UI/UX Design", "Figma", "Prototyping"],
      requiredSkillsMissing: ["Adobe Illustrator"],
      preferredSkillsFound: ["User Research"]
    },
    experienceMatch: {
      score: 80,
      yearsOfRelevantExperience: 6,
      relevantCompanies: ["Design Studio"],
      relevantRoles: ["Senior UI/UX Designer", "UI Designer"]
    },
    educationMatch: {
      score: 90,
      requiredEducationMet: true,
      relevantDegrees: ["Bachelor of Fine Arts"],
      relevantFields: ["Graphic Design"]
    },
    employmentGaps: {
      hasGaps: false,
      gapPeriods: [],
      totalGapMonths: 0
    },
    keywordMatch: {
      score: 70,
      keywordsFound: {
        "design": 4,
        "ux": 2,
        "ui": 3,
        "user": 1
      }
    },
    screened: true,
    qualified: true,
    notes: "Good design background, could use more direct product experience.",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock questionnaires
const mockQuestionnaires: ScreeningQuestionnaire[] = [
  {
    id: uuidv4(),
    jobId: 1,
    title: "Frontend Developer Screening",
    questions: [
      {
        id: uuidv4(),
        text: "How many years of experience do you have with React?",
        type: "MultipleChoice",
        options: ["Less than 1 year", "1-2 years", "3-5 years", "More than 5 years"],
        isRequired: true,
        isDisqualifying: true,
        correctAnswer: "3-5 years"
      },
      {
        id: uuidv4(),
        text: "Are you familiar with TypeScript?",
        type: "YesNo",
        isRequired: true,
        isDisqualifying: true,
        correctAnswer: true
      },
      {
        id: uuidv4(),
        text: "Describe your experience with state management libraries like Redux or MobX.",
        type: "Text",
        isRequired: false,
        isDisqualifying: false
      }
    ],
    passingScore: 70,
    isActive: true
  }
];

// Context interface (update with enhanced functionality)
interface ResumeParsingContextType {
  parsedResumes: ParsedResume[];
  screeningResults: ScreeningResult[];
  questionnaires: ScreeningQuestionnaire[];
  questionnaireResponses: QuestionnaireResponse[];
  
  // Resume parsing
  parseResume: (resumeText: string, candidateId?: number) => Promise<ParsedResume>;
  getParsedResume: (id: string) => ParsedResume | undefined;
  getParsedResumeByCandidate: (candidateId: number) => ParsedResume | undefined;
  
  // Screening
  screenCandidate: (candidateId: number, jobId: number, parsedResumeId: string) => Promise<ScreeningResult>;
  getScreeningResult: (id: string) => ScreeningResult | undefined;
  getCandidateScreeningResults: (candidateId: number) => ScreeningResult[];
  getJobScreeningResults: (jobId: number) => ScreeningResult[];
  
  // Questionnaires
  createQuestionnaire: (jobId: number, title: string, questions: any[]) => ScreeningQuestionnaire;
  getQuestionnaire: (id: string) => ScreeningQuestionnaire | undefined;
  getJobQuestionnaires: (jobId: number) => ScreeningQuestionnaire[];
  submitQuestionnaireResponse: (candidateId: number, questionnaireId: string, jobId: number, answers: any[]) => Promise<QuestionnaireResponse>;
  
  // Enhanced AI features (new or improved)
  detectEmploymentGaps: (resume: ParsedResume) => { hasGaps: boolean; gapPeriods: string[]; totalGapMonths: number };
  getDuplicateCandidates: () => { candidateId: number, duplicateIds: number[], similarity: number }[];
  getTopSkillGaps: (jobId: number) => string[];
  getAverageScores: (jobId: number) => {
    overallAvg: number;
    skillsAvg: number;
    experienceAvg: number;
    educationAvg: number;
  };
  getQualificationRate: (jobId: number) => number;
  
  // Advanced ranking features (new)
  rankCandidates: (jobId: number, considerationFactors?: {
    skillsWeight?: number;
    experienceWeight?: number;
    educationWeight?: number;
    questionnaireWeight?: number;
  }) => Promise<Array<{ candidateId: number; score: number; ranking: number; }>>;
  getKeywordWeights: (jobId: number) => Record<string, number>;
  setKeywordWeights: (jobId: number, weights: Record<string, number>) => void;
  calculateCandidateFit: (candidateId: number, jobId: number) => Promise<{
    overallFit: number;
    breakdown: {
      skills: number;
      experience: number;
      education: number;
      questionnaire: number | null;
    };
    flags: string[];
  }>;
}

// Create the context
const ResumeParsingContext = createContext<ResumeParsingContextType | undefined>(undefined);

export const ResumeParsingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [parsedResumes, setParsedResumes] = useState<ParsedResume[]>(mockParsedResumes);
  const [screeningResults, setScreeningResults] = useState<ScreeningResult[]>(mockScreeningResults);
  const [questionnaires, setQuestionnaires] = useState<ScreeningQuestionnaire[]>(mockQuestionnaires || []);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<QuestionnaireResponse[]>([]);
  
  // New state variables for enhanced features
  const [keywordWeights, setAllKeywordWeights] = useState<Record<number, Record<string, number>>>({});

  // Parse resume from text
  const parseResume = async (resumeText: string, candidateId?: number): Promise<ParsedResume> => {
    // In a real app, this would call an API or AI service
    
    // Simulate parsing process
    return new Promise(resolve => {
      setTimeout(() => {
        // Very simple parsing logic (this would be done by an AI in a real app)
        const lines = resumeText.split('\n');
        const nameMatch = lines[0];
        const emailMatch = lines.find(line => line.includes('@')) || '';
        const phoneMatch = lines.find(line => line.includes('(') && line.includes(')')) || '';
        
        const newParsedResume: ParsedResume = {
          id: uuidv4(),
          candidateId,
          rawText: resumeText,
          parsedData: {
            name: nameMatch,
            email: emailMatch,
            phone: phoneMatch,
            location: "Unknown",
            summary: lines.slice(3).join(' ').substring(0, 200),
            skills: ["JavaScript", "React"], // Would be extracted in a real parser
            experience: [{
              company: "Company name would be extracted",
              title: "Position title would be extracted",
              duration: "Duration would be calculated",
              description: "Job description would be extracted"
            }],
            education: [{
              institution: "University name would be extracted",
              degree: "Degree would be extracted",
              field: "Field would be extracted",
              graduationDate: "2020"
            }],
            certifications: [],
            languages: ["English"],
            websites: []
          },
          uploadDate: new Date().toISOString(),
          status: "Processed",
          confidence: 0.7
        };
        
        setParsedResumes(prev => [...prev, newParsedResume]);
        resolve(newParsedResume);
      }, 1000); // Simulate processing time
    });
  };

  // Get parsed resume by ID
  const getParsedResume = (id: string) => {
    return parsedResumes.find(resume => resume.id === id);
  };

  // Get parsed resume by candidate ID
  const getParsedResumeByCandidate = (candidateId: number) => {
    return parsedResumes.find(resume => resume.candidateId === candidateId);
  };

  // Screen a candidate against a job
  const screenCandidate = async (candidateId: number, jobId: number, parsedResumeId: string): Promise<ScreeningResult> => {
    return new Promise(resolve => {
      setTimeout(() => {
        // Get the parsed resume
        const parsedResume = getParsedResume(parsedResumeId);
        if (!parsedResume) {
          throw new Error(`Parsed resume with ID ${parsedResumeId} not found`);
        }
        
        // In a real app, this would compare against actual job requirements
        const requiredSkills = ["JavaScript", "React", "TypeScript"];
        const preferredSkills = ["Redux", "Jest", "Node.js"];
        
        const candidateSkills = parsedResume.parsedData.skills;
        
        // Calculate skill match
        const requiredSkillsFound = requiredSkills.filter(skill => 
          candidateSkills.includes(skill)
        );
        const requiredSkillsMissing = requiredSkills.filter(skill => 
          !candidateSkills.includes(skill)
        );
        const preferredSkillsFound = preferredSkills.filter(skill => 
          candidateSkills.includes(skill)
        );
        
        const skillMatchScore = Math.round(
          (requiredSkillsFound.length / requiredSkills.length) * 100
        );
        
        // Calculate experience match (simplified)
        const relevantExperience = parsedResume.parsedData.experience.filter(exp => 
          exp.title.toLowerCase().includes("developer") || exp.title.toLowerCase().includes("engineer")
        );
        
        // Calculate total years of experience
        const yearsOfRelevantExperience = relevantExperience.reduce((sum, exp) => {
          // Parse duration like "3 years" or calculate from dates
          const years = parseInt(exp.duration) || 1;
          return sum + years;
        }, 0);
        
        const experienceMatchScore = Math.min(100, yearsOfRelevantExperience * 20);
        
        // Calculate education match
        const hasRelevantDegree = parsedResume.parsedData.education.some(edu => 
          edu.field.toLowerCase().includes("computer") || 
          edu.field.toLowerCase().includes("software") ||
          edu.field.toLowerCase().includes("engineering")
        );
        
        // Create the screening result
        const screeningResult: ScreeningResult = {
          id: uuidv4(),
          candidateId,
          jobId,
          parsedResumeId,
          overallScore: Math.round((skillMatchScore + experienceMatchScore + (hasRelevantDegree ? 100 : 50)) / 3),
          skillMatch: {
            score: skillMatchScore,
            requiredSkillsFound,
            requiredSkillsMissing,
            preferredSkillsFound
          },
          experienceMatch: {
            score: experienceMatchScore,
            yearsOfRelevantExperience,
            relevantCompanies: relevantExperience.map(exp => exp.company),
            relevantRoles: relevantExperience.map(exp => exp.title)
          },
          educationMatch: {
            score: hasRelevantDegree ? 100 : 50,
            requiredEducationMet: hasRelevantDegree,
            relevantDegrees: parsedResume.parsedData.education.map(edu => edu.degree),
            relevantFields: parsedResume.parsedData.education.map(edu => edu.field)
          },
          employmentGaps: {
            hasGaps: false, // Would be calculated in a real app
            gapPeriods: [],
            totalGapMonths: 0
          },
          keywordMatch: {
            score: 75, // Would be calculated in a real app
            keywordsFound: {
              "javascript": 2,
              "react": 1
            }
          },
          screened: true,
          qualified: skillMatchScore >= 70,
          notes: skillMatchScore >= 70 
            ? "Candidate meets required skills" 
            : "Candidate missing some required skills",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setScreeningResults(prev => [...prev, screeningResult]);
        resolve(screeningResult);
      }, 2000); // Simulate processing time
    });
  };

  // Get screening result by ID
  const getScreeningResult = (id: string) => {
    return screeningResults.find(result => result.id === id);
  };

  // Get all screening results for a candidate
  const getCandidateScreeningResults = (candidateId: number) => {
    return screeningResults.filter(result => result.candidateId === candidateId);
  };

  // Get all screening results for a job
  const getJobScreeningResults = (jobId: number) => {
    return screeningResults.filter(result => result.jobId === jobId);
  };

  // Create a questionnaire
  const createQuestionnaire = (jobId: number, title: string, questions: any[]) => {
    const newQuestionnaire: ScreeningQuestionnaire = {
      id: uuidv4(),
      jobId,
      title,
      questions: questions.map(q => ({
        id: uuidv4(),
        ...q
      })),
      passingScore: 70,
      isActive: true
    };
    
    setQuestionnaires(prev => [...prev, newQuestionnaire]);
    return newQuestionnaire;
  };

  // Get questionnaire by ID
  const getQuestionnaire = (id: string) => {
    return questionnaires.find(q => q.id === id);
  };

  // Get all questionnaires for a job
  const getJobQuestionnaires = (jobId: number) => {
    return questionnaires.filter(q => q.jobId === jobId);
  };

  // Submit questionnaire response
  const submitQuestionnaireResponse = async (
    candidateId: number, 
    questionnaireId: string, 
    jobId: number, 
    answers: any[]
  ): Promise<QuestionnaireResponse> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const questionnaire = getQuestionnaire(questionnaireId);
        if (!questionnaire) {
          throw new Error(`Questionnaire with ID ${questionnaireId} not found`);
        }
        
        // Calculate score based on matching answers to correct answers
        let correctAnswers = 0;
        let totalQuestions = questionnaire.questions.length;
        
        const scoredAnswers = answers.map(answer => {
          const question = questionnaire.questions.find(q => q.id === answer.questionId);
          if (question && question.correctAnswer && answer.answer === question.correctAnswer) {
            correctAnswers++;
          }
          return answer;
        });
        
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const passed = score >= questionnaire.passingScore;
        
        const response: QuestionnaireResponse = {
          id: uuidv4(),
          candidateId,
          questionnaireId,
          jobId,
          answers: scoredAnswers,
          score,
          passed,
          submittedAt: new Date().toISOString()
        };
        
        setQuestionnaireResponses(prev => [...prev, response]);
        resolve(response);
      }, 1000);
    });
  };

  // Enhanced employment gap detection
  const detectEmploymentGaps = (resume: ParsedResume): { 
    hasGaps: boolean; 
    gapPeriods: string[]; 
    totalGapMonths: number 
  } => {
    const { experience } = resume.parsedData;
    if (!experience || experience.length < 2) {
      return { hasGaps: false, gapPeriods: [], totalGapMonths: 0 };
    }

    // Sort experiences by start date (newest first)
    const sortedExperience = [...experience].sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    const gaps: { start: Date; end: Date }[] = [];
    let totalGapMonths = 0;

    // Compare each experience with the next one to find gaps
    for (let i = 0; i < sortedExperience.length - 1; i++) {
      const currentJob = sortedExperience[i];
      const nextJob = sortedExperience[i + 1];

      if (!currentJob.startDate || !nextJob.endDate) continue;

      const currentJobStart = new Date(currentJob.startDate);
      const nextJobEnd = nextJob.endDate ? new Date(nextJob.endDate) : new Date();

      // If there's a gap of more than 1 month
      if (currentJobStart.getTime() - nextJobEnd.getTime() > 30 * 24 * 60 * 60 * 1000) {
        const gap = {
          start: nextJobEnd,
          end: currentJobStart
        };

        gaps.push(gap);

        // Calculate gap duration in months
        const gapMonths = 
          (currentJobStart.getFullYear() - nextJobEnd.getFullYear()) * 12 +
          (currentJobStart.getMonth() - nextJobEnd.getMonth());
        
        totalGapMonths += gapMonths;
      }
    }

    // Format gap periods as strings
    const gapPeriods = gaps.map(gap => {
      const startMonth = gap.start.toLocaleString('default', { month: 'short' });
      const endMonth = gap.end.toLocaleString('default', { month: 'short' });
      return `${startMonth} ${gap.start.getFullYear()} - ${endMonth} ${gap.end.getFullYear()}`;
    });

    return {
      hasGaps: gaps.length > 0,
      gapPeriods,
      totalGapMonths
    };
  };

  // Improved duplicate candidate detection
  const getDuplicateCandidates = () => {
    const duplicates: { candidateId: number; duplicateIds: number[]; similarity: number }[] = [];
    const processedCandidates = new Set<number>();

    // For each resume
    parsedResumes.forEach(resume => {
      if (!resume.candidateId || processedCandidates.has(resume.candidateId)) return;
      
      const similarCandidates: { id: number; similarity: number }[] = [];
      
      // Check against other resumes
      parsedResumes.forEach(otherResume => {
        if (!otherResume.candidateId || otherResume.candidateId === resume.candidateId) return;
        
        const similarity = calculateResumeSimilarity(resume, otherResume);
        
        if (similarity > 0.7) { // 70% similarity threshold
          similarCandidates.push({
            id: otherResume.candidateId,
            similarity
          });
        }
      });
      
      if (similarCandidates.length > 0) {
        // Add to duplicates
        duplicates.push({
          candidateId: resume.candidateId,
          duplicateIds: similarCandidates.map(c => c.id),
          similarity: similarCandidates.reduce((sum, c) => sum + c.similarity, 0) / similarCandidates.length
        });
        
        // Mark as processed
        processedCandidates.add(resume.candidateId);
        similarCandidates.forEach(c => processedCandidates.add(c.id));
      }
    });
    
    return duplicates;
  };

  // Helper function to calculate similarity between two resumes
  const calculateResumeSimilarity = (resume1: ParsedResume, resume2: ParsedResume): number => {
    const { parsedData: data1 } = resume1;
    const { parsedData: data2 } = resume2;
    
    // Compare different fields and calculate similarity scores
    
    // Email similarity (exact match is high signal)
    const emailSimilarity = data1.email === data2.email ? 1 : 0;
    
    // Name similarity
    const nameSimilarity = calculateStringSimilarity(data1.name.toLowerCase(), data2.name.toLowerCase());
    
    // Phone similarity
    const normalizedPhone1 = data1.phone.replace(/\D/g, '');
    const normalizedPhone2 = data2.phone.replace(/\D/g, '');
    const phoneSimilarity = normalizedPhone1 === normalizedPhone2 ? 1 : 0;
    
    // Skills similarity
    const skillsSet1 = new Set(data1.skills.map(s => s.toLowerCase()));
    const skillsSet2 = new Set(data2.skills.map(s => s.toLowerCase()));
    const commonSkills = [...skillsSet1].filter(skill => skillsSet2.has(skill)).length;
    const skillsSimilarity = 
      commonSkills / Math.max(1, (skillsSet1.size + skillsSet2.size) / 2);
    
    // Experience similarity
    let experienceSimilarity = 0;
    if (data1.experience.length && data2.experience.length) {
      // Compare most recent roles
      const role1 = data1.experience[0];
      const role2 = data2.experience[0];
      const titleSimilarity = calculateStringSimilarity(
        role1.title.toLowerCase(), 
        role2.title.toLowerCase()
      );
      const companySimilarity = calculateStringSimilarity(
        role1.company.toLowerCase(), 
        role2.company.toLowerCase()
      );
      experienceSimilarity = (titleSimilarity + companySimilarity) / 2;
    }
    
    // Calculate weighted average
    return (
      emailSimilarity * 0.3 +  // Email is a strong signal
      nameSimilarity * 0.25 +  // Name is important
      phoneSimilarity * 0.2 +  // Phone is important
      skillsSimilarity * 0.15 + // Skills provide context
      experienceSimilarity * 0.1 // Experience is supplementary
    );
  };

  // Helper function to calculate string similarity using Levenshtein distance
  const calculateStringSimilarity = (str1: string, str2: string): number => {
    if (str1 === str2) return 1;
    
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Initialize the distance matrix
    const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
    
    // Fill the first row and column
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    // Fill the rest of the matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    // Calculate normalized similarity (0 to 1)
    const maxLen = Math.max(len1, len2);
    if (maxLen === 0) return 1; // Both strings are empty
    
    const distance = matrix[len1][len2];
    return 1 - distance / maxLen;
  };
  
  // New function: Get keyword weights for a job
  const getKeywordWeights = (jobId: number): Record<string, number> => {
    return keywordWeights[jobId] || {};
  };
  
  // New function: Set keyword weights for a job
  const setKeywordWeights = (jobId: number, weights: Record<string, number>): void => {
    setAllKeywordWeights(prev => ({
      ...prev,
      [jobId]: weights
    }));
  };
  
  // New function: AI-based candidate ranking
  const rankCandidates = async (
    jobId: number, 
    considerationFactors?: {
      skillsWeight?: number;
      experienceWeight?: number;
      educationWeight?: number;
      questionnaireWeight?: number;
    }
  ): Promise<Array<{ candidateId: number; score: number; ranking: number; }>> => {
    // Default weights
    const weights = {
      skills: considerationFactors?.skillsWeight ?? 0.4,
      experience: considerationFactors?.experienceWeight ?? 0.3,
      education: considerationFactors?.educationWeight ?? 0.2,
      questionnaire: considerationFactors?.questionnaireWeight ?? 0.1
    };
    
    // Get all screening results for this job
    const jobResults = screeningResults.filter(result => result.jobId === jobId);
    
    if (jobResults.length === 0) {
      return [];
    }
    
    // Calculate scores for each candidate
    const candidateScores = await Promise.all(
      jobResults.map(async result => {
        const fit = await calculateCandidateFit(result.candidateId, jobId);
        
        return {
          candidateId: result.candidateId,
          score: fit.overallFit,
          details: fit
        };
      })
    );
    
    // Sort by score (descending)
    const sortedCandidates = candidateScores
      .sort((a, b) => b.score - a.score)
      .map((candidate, index) => ({
        candidateId: candidate.candidateId,
        score: candidate.score,
        ranking: index + 1
      }));
    
    return sortedCandidates;
  };
  
  // New function: Calculate candidate fit
  const calculateCandidateFit = async (
    candidateId: number, 
    jobId: number
  ): Promise<{
    overallFit: number;
    breakdown: {
      skills: number;
      experience: number;
      education: number;
      questionnaire: number | null;
    };
    flags: string[];
  }> => {
    // Get screening result
    const result = screeningResults.find(
      r => r.candidateId === candidateId && r.jobId === jobId
    );
    
    if (!result) {
      throw new Error(`No screening result found for candidate ${candidateId} and job ${jobId}`);
    }
    
    // Get questionnaire response
    const jobQuestionnaires = getJobQuestionnaires(jobId);
    let questionnaireScore: number | null = null;
    
    if (jobQuestionnaires.length > 0) {
      const responses = questionnaireResponses.filter(
        r => r.candidateId === candidateId && r.jobId === jobId
      );
      
      if (responses.length > 0) {
        // Calculate average questionnaire score if multiple exist
        questionnaireScore = responses.reduce((sum, r) => sum + r.score, 0) / responses.length;
      }
    }
    
    // Get parsed resume
    const resume = getParsedResumeByCandidate(candidateId);
    
    // Identify red flags
    const flags: string[] = [];
    
    if (result.skillMatch.requiredSkillsMissing.length > 0) {
      flags.push(`Missing ${result.skillMatch.requiredSkillsMissing.length} required skills`);
    }
    
    if (resume) {
      const gapAnalysis = detectEmploymentGaps(resume);
      if (gapAnalysis.hasGaps && gapAnalysis.totalGapMonths > 6) {
        flags.push(`Has employment gaps totaling ${gapAnalysis.totalGapMonths} months`);
      }
    }
    
    if (result.experienceMatch.yearsOfRelevantExperience < 2) {
      flags.push(`Limited relevant experience (${result.experienceMatch.yearsOfRelevantExperience} years)`);
    }
    
    // Calculate overall fit
    const breakdown = {
      skills: result.skillMatch.score / 100,
      experience: result.experienceMatch.score / 100,
      education: result.educationMatch.score / 100,
      questionnaire: questionnaireScore !== null ? questionnaireScore / 100 : null
    };
    
    // Calculate weighted score
    let overallFit = 0;
    let totalWeight = 0;
    
    overallFit += breakdown.skills * 0.4;
    totalWeight += 0.4;
    
    overallFit += breakdown.experience * 0.3;
    totalWeight += 0.3;
    
    overallFit += breakdown.education * 0.2;
    totalWeight += 0.2;
    
    if (breakdown.questionnaire !== null) {
      overallFit += breakdown.questionnaire * 0.1;
      totalWeight += 0.1;
    }
    
    // Normalize to account for missing questionnaire
    overallFit = totalWeight > 0 ? overallFit / totalWeight : 0;
    
    // Apply penalty for each flag
    const flagPenalty = 0.05; // 5% penalty per flag
    overallFit = Math.max(0, overallFit - (flags.length * flagPenalty));
    
    return {
      overallFit,
      breakdown,
      flags
    };
  };

  // Get top skill gaps for a job
  const getTopSkillGaps = (jobId: number) => {
    const jobResults = getJobScreeningResults(jobId);
    
    // Aggregate all missing skills
    const skillGaps: Record<string, number> = {};
    
    jobResults.forEach(result => {
      result.skillMatch.requiredSkillsMissing.forEach(skill => {
        if (!skillGaps[skill]) {
          skillGaps[skill] = 0;
        }
        skillGaps[skill]++;
      });
    });
    
    // Sort skills by frequency
    return Object.entries(skillGaps)
      .sort((a, b) => b[1] - a[1])
      .map(([skill]) => skill);
  };

  // Get average scores for a job
  const getAverageScores = (jobId: number) => {
    const jobResults = getJobScreeningResults(jobId);
    
    if (jobResults.length === 0) {
      return {
        overallAvg: 0,
        skillsAvg: 0,
        experienceAvg: 0,
        educationAvg: 0
      };
    }
    
    const overallSum = jobResults.reduce((sum, result) => sum + result.overallScore, 0);
    const skillsSum = jobResults.reduce((sum, result) => sum + result.skillMatch.score, 0);
    const experienceSum = jobResults.reduce((sum, result) => sum + result.experienceMatch.score, 0);
    const educationSum = jobResults.reduce((sum, result) => sum + result.educationMatch.score, 0);
    
    return {
      overallAvg: Math.round(overallSum / jobResults.length),
      skillsAvg: Math.round(skillsSum / jobResults.length),
      experienceAvg: Math.round(experienceSum / jobResults.length),
      educationAvg: Math.round(educationSum / jobResults.length)
    };
  };

  // Get qualification rate for a job
  const getQualificationRate = (jobId: number) => {
    const jobResults = getJobScreeningResults(jobId);
    
    if (jobResults.length === 0) {
      return 0;
    }
    
    const qualifiedCount = jobResults.filter(result => result.qualified).length;
    return Math.round((qualifiedCount / jobResults.length) * 100);
  };

  // Context value
  const contextValue: ResumeParsingContextType = {
    parsedResumes,
    screeningResults,
    questionnaires,
    questionnaireResponses,
    parseResume,
    getParsedResume,
    getParsedResumeByCandidate,
    screenCandidate,
    getScreeningResult,
    getCandidateScreeningResults,
    getJobScreeningResults,
    createQuestionnaire,
    getQuestionnaire,
    getJobQuestionnaires,
    submitQuestionnaireResponse,
    detectEmploymentGaps,
    getDuplicateCandidates,
    getTopSkillGaps,
    getAverageScores,
    getQualificationRate,
    rankCandidates,
    getKeywordWeights,
    setKeywordWeights,
    calculateCandidateFit
  };

  return (
    <ResumeParsingContext.Provider value={contextValue}>
      {children}
    </ResumeParsingContext.Provider>
  );
};

export const useResumeParsing = () => {
  const context = useContext(ResumeParsingContext);
  if (context === undefined) {
    throw new Error('useResumeParsing must be used within a ResumeParsingProvider');
  }
  return context;
};

export default ResumeParsingContext; 