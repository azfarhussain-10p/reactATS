import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Candidate, 
  Education, 
  Experience, 
  Skill, 
  Document, 
  Communication, 
  JobApplication,
  CandidateSource,
  CandidateStatus
} from '../models/types';
import mockCandidates from '../data/mockCandidates';

interface CandidateContextType {
  candidates: Candidate[];
  addCandidate: (candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => Candidate;
  updateCandidate: (id: number, updates: Partial<Candidate>) => Candidate | null;
  deleteCandidate: (id: number) => boolean;
  getCandidateById: (id: number) => Candidate | null;
  filterCandidates: (filters: CandidateFilters) => Candidate[];
  addEducation: (candidateId: number, education: Omit<Education, 'id'>) => boolean;
  updateEducation: (candidateId: number, educationId: string, updates: Partial<Education>) => boolean;
  deleteEducation: (candidateId: number, educationId: string) => boolean;
  addExperience: (candidateId: number, experience: Omit<Experience, 'id'>) => boolean;
  updateExperience: (candidateId: number, experienceId: string, updates: Partial<Experience>) => boolean;
  deleteExperience: (candidateId: number, experienceId: string) => boolean;
  addSkill: (candidateId: number, skill: Omit<Skill, 'id'>) => boolean;
  updateSkill: (candidateId: number, skillId: string, updates: Partial<Skill>) => boolean;
  deleteSkill: (candidateId: number, skillId: string) => boolean;
  addDocument: (candidateId: number, document: Omit<Document, 'id'>) => boolean;
  updateDocument: (candidateId: number, documentId: string, updates: Partial<Document>) => boolean;
  deleteDocument: (candidateId: number, documentId: string) => boolean;
  addCommunication: (candidateId: number, communication: Omit<Communication, 'id'>) => boolean;
  updateCommunication: (candidateId: number, communicationId: string, updates: Partial<Communication>) => boolean;
  deleteCommunication: (candidateId: number, communicationId: string) => boolean;
  addJobApplication: (candidateId: number, application: Omit<JobApplication, 'id'>) => boolean;
  updateJobApplication: (candidateId: number, applicationId: string, updates: Partial<JobApplication>) => boolean;
  deleteJobApplication: (candidateId: number, applicationId: string) => boolean;
  updateCandidateStatus: (candidateId: number, status: CandidateStatus) => boolean;
  getCandidatesStats: () => CandidateStats;
  getCandidatesByTag: (tag: string) => Candidate[];
  searchCandidates: (query: string) => Candidate[];
}

interface CandidateFilters {
  status?: CandidateStatus | 'all';
  source?: CandidateSource | 'all';
  jobId?: number;
  skills?: string[];
  tags?: string[];
  willingToRelocate?: boolean;
  minYearsOfExperience?: number;
  location?: string;
}

interface CandidateStats {
  total: number;
  byStatus: Record<CandidateStatus, number>;
  bySource: Record<CandidateSource, number>;
  byTag: Record<string, number>;
  avgRating: number;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

export const CandidateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);

  // Add a new candidate
  const addCandidate = (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newCandidate: Candidate = {
      ...candidateData,
      id: Math.max(0, ...candidates.map(c => c.id)) + 1,
      createdAt: now,
      updatedAt: now
    };
    
    setCandidates(prev => [...prev, newCandidate]);
    return newCandidate;
  };

  // Update an existing candidate
  const updateCandidate = (id: number, updates: Partial<Candidate>) => {
    let updatedCandidate: Candidate | null = null;
    
    setCandidates(prev => {
      const updated = prev.map(candidate => {
        if (candidate.id === id) {
          updatedCandidate = {
            ...candidate,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          return updatedCandidate;
        }
        return candidate;
      });
      
      return updated;
    });
    
    return updatedCandidate;
  };

  // Delete a candidate
  const deleteCandidate = (id: number) => {
    let success = false;
    
    setCandidates(prev => {
      const filtered = prev.filter(candidate => candidate.id !== id);
      success = filtered.length < prev.length;
      return filtered;
    });
    
    return success;
  };

  // Get a candidate by ID
  const getCandidateById = (id: number) => {
    return candidates.find(candidate => candidate.id === id) || null;
  };

  // Filter candidates based on multiple criteria
  const filterCandidates = (filters: CandidateFilters) => {
    return candidates.filter(candidate => {
      // Status filter
      if (filters.status && filters.status !== 'all' && candidate.status !== filters.status) {
        return false;
      }
      
      // Source filter
      if (filters.source && filters.source !== 'all' && candidate.source !== filters.source) {
        return false;
      }
      
      // Job ID filter
      if (filters.jobId && !candidate.jobApplications.some(app => app.jobId === filters.jobId)) {
        return false;
      }
      
      // Skills filter
      if (filters.skills && filters.skills.length > 0) {
        const candidateSkillNames = candidate.professionalInfo.skills.map(skill => skill.name.toLowerCase());
        if (!filters.skills.some(skill => candidateSkillNames.includes(skill.toLowerCase()))) {
          return false;
        }
      }
      
      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const candidateTags = candidate.professionalInfo.tags.map(tag => tag.toLowerCase());
        if (!filters.tags.some(tag => candidateTags.includes(tag.toLowerCase()))) {
          return false;
        }
      }
      
      // Willing to relocate filter
      if (filters.willingToRelocate !== undefined && candidate.personalInfo.willingToRelocate !== filters.willingToRelocate) {
        return false;
      }
      
      // Min years of experience filter
      if (filters.minYearsOfExperience !== undefined && candidate.professionalInfo.totalYearsOfExperience < filters.minYearsOfExperience) {
        return false;
      }
      
      // Location filter
      if (filters.location && !candidate.personalInfo.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  // Add education entry
  const addEducation = (candidateId: number, education: Omit<Education, 'id'>) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const newEducation = { ...education, id: uuidv4() };
    
    return Boolean(updateCandidate(candidateId, {
      education: [...candidate.education, newEducation],
      updatedAt: new Date().toISOString()
    }));
  };

  // Update education entry
  const updateEducation = (candidateId: number, educationId: string, updates: Partial<Education>) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const updatedEducation = candidate.education.map(edu => 
      edu.id === educationId ? { ...edu, ...updates } : edu
    );
    
    return Boolean(updateCandidate(candidateId, {
      education: updatedEducation,
      updatedAt: new Date().toISOString()
    }));
  };

  // Delete education entry
  const deleteEducation = (candidateId: number, educationId: string) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const filteredEducation = candidate.education.filter(edu => edu.id !== educationId);
    
    return Boolean(updateCandidate(candidateId, {
      education: filteredEducation,
      updatedAt: new Date().toISOString()
    }));
  };

  // Add experience entry
  const addExperience = (candidateId: number, experience: Omit<Experience, 'id'>) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const newExperience = { ...experience, id: uuidv4() };
    
    return Boolean(updateCandidate(candidateId, {
      experience: [...candidate.experience, newExperience],
      updatedAt: new Date().toISOString()
    }));
  };

  // Update experience entry
  const updateExperience = (candidateId: number, experienceId: string, updates: Partial<Experience>) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const updatedExperience = candidate.experience.map(exp => 
      exp.id === experienceId ? { ...exp, ...updates } : exp
    );
    
    return Boolean(updateCandidate(candidateId, {
      experience: updatedExperience,
      updatedAt: new Date().toISOString()
    }));
  };

  // Delete experience entry
  const deleteExperience = (candidateId: number, experienceId: string) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const filteredExperience = candidate.experience.filter(exp => exp.id !== experienceId);
    
    return Boolean(updateCandidate(candidateId, {
      experience: filteredExperience,
      updatedAt: new Date().toISOString()
    }));
  };

  // Add skill
  const addSkill = (candidateId: number, skill: Omit<Skill, 'id'>) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const newSkill = { ...skill, id: uuidv4() };
    
    return Boolean(updateCandidate(candidateId, {
      professionalInfo: {
        ...candidate.professionalInfo,
        skills: [...candidate.professionalInfo.skills, newSkill]
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // Update skill
  const updateSkill = (candidateId: number, skillId: string, updates: Partial<Skill>) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const updatedSkills = candidate.professionalInfo.skills.map(skill => 
      skill.id === skillId ? { ...skill, ...updates } : skill
    );
    
    return Boolean(updateCandidate(candidateId, {
      professionalInfo: {
        ...candidate.professionalInfo,
        skills: updatedSkills
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // Delete skill
  const deleteSkill = (candidateId: number, skillId: string) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const filteredSkills = candidate.professionalInfo.skills.filter(skill => skill.id !== skillId);
    
    return Boolean(updateCandidate(candidateId, {
      professionalInfo: {
        ...candidate.professionalInfo,
        skills: filteredSkills
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // Add document
  const addDocument = (candidateId: number, document: Omit<Document, 'id'>) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const newDocument = { ...document, id: uuidv4() };
    
    return Boolean(updateCandidate(candidateId, {
      documents: [...candidate.documents, newDocument],
      updatedAt: new Date().toISOString()
    }));
  };

  // Update document
  const updateDocument = (candidateId: number, documentId: string, updates: Partial<Document>) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const updatedDocuments = candidate.documents.map(doc => 
      doc.id === documentId ? { ...doc, ...updates } : doc
    );
    
    return Boolean(updateCandidate(candidateId, {
      documents: updatedDocuments,
      updatedAt: new Date().toISOString()
    }));
  };

  // Delete document
  const deleteDocument = (candidateId: number, documentId: string) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const filteredDocuments = candidate.documents.filter(doc => doc.id !== documentId);
    
    return Boolean(updateCandidate(candidateId, {
      documents: filteredDocuments,
      updatedAt: new Date().toISOString()
    }));
  };

  // Add communication
  const addCommunication = (candidateId: number, communication: Omit<Communication, 'id'>) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const newCommunication = { ...communication, id: uuidv4() };
    
    return Boolean(updateCandidate(candidateId, {
      communications: [...candidate.communications, newCommunication],
      updatedAt: new Date().toISOString()
    }));
  };

  // Update communication
  const updateCommunication = (candidateId: number, communicationId: string, updates: Partial<Communication>) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const updatedCommunications = candidate.communications.map(comm => 
      comm.id === communicationId ? { ...comm, ...updates } : comm
    );
    
    return Boolean(updateCandidate(candidateId, {
      communications: updatedCommunications,
      updatedAt: new Date().toISOString()
    }));
  };

  // Delete communication
  const deleteCommunication = (candidateId: number, communicationId: string) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const filteredCommunications = candidate.communications.filter(comm => comm.id !== communicationId);
    
    return Boolean(updateCandidate(candidateId, {
      communications: filteredCommunications,
      updatedAt: new Date().toISOString()
    }));
  };

  // Add job application
  const addJobApplication = (candidateId: number, application: Omit<JobApplication, 'id'>) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const newApplication = { ...application, id: uuidv4() };
    
    return Boolean(updateCandidate(candidateId, {
      jobApplications: [...candidate.jobApplications, newApplication],
      updatedAt: new Date().toISOString()
    }));
  };

  // Update job application
  const updateJobApplication = (candidateId: number, applicationId: string, updates: Partial<JobApplication>) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const updatedApplications = candidate.jobApplications.map(app => 
      app.id === applicationId ? { ...app, ...updates } : app
    );
    
    return Boolean(updateCandidate(candidateId, {
      jobApplications: updatedApplications,
      updatedAt: new Date().toISOString()
    }));
  };

  // Delete job application
  const deleteJobApplication = (candidateId: number, applicationId: string) => {
    const candidate = getCandidateById(candidateId);
    if (!candidate) return false;
    
    const filteredApplications = candidate.jobApplications.filter(app => app.id !== applicationId);
    
    return Boolean(updateCandidate(candidateId, {
      jobApplications: filteredApplications,
      updatedAt: new Date().toISOString()
    }));
  };

  // Update candidate status
  const updateCandidateStatus = (candidateId: number, status: CandidateStatus) => {
    return Boolean(updateCandidate(candidateId, { status }));
  };

  // Get candidate statistics
  const getCandidatesStats = (): CandidateStats => {
    const total = candidates.length;
    
    // Initialize status counts object
    const byStatus: Record<CandidateStatus, number> = {
      'New': 0,
      'Screening': 0,
      'Interview': 0,
      'Assessment': 0,
      'Offer': 0,
      'Hired': 0,
      'Rejected': 0,
      'Withdrawn': 0,
      'On Hold': 0
    };
    
    // Initialize source counts object
    const bySource: Record<CandidateSource, number> = {
      'Job Board': 0,
      'Referral': 0,
      'LinkedIn': 0,
      'Company Website': 0,
      'Recruitment Agency': 0,
      'Career Fair': 0,
      'Other Social Media': 0,
      'Direct Application': 0,
      'Other': 0
    };
    
    // Initialize tag counts
    const byTag: Record<string, number> = {};
    
    let totalRating = 0;
    let ratedCandidates = 0;
    
    candidates.forEach(candidate => {
      // Count by status
      byStatus[candidate.status]++;
      
      // Count by source
      bySource[candidate.source]++;
      
      // Count by tag
      candidate.professionalInfo.tags.forEach(tag => {
        byTag[tag] = (byTag[tag] || 0) + 1;
      });
      
      // Sum ratings
      if (candidate.rating) {
        totalRating += candidate.rating;
        ratedCandidates++;
      }
    });
    
    const avgRating = ratedCandidates > 0 ? totalRating / ratedCandidates : 0;
    
    return {
      total,
      byStatus,
      bySource,
      byTag,
      avgRating
    };
  };

  // Get candidates by tag
  const getCandidatesByTag = (tag: string) => {
    return candidates.filter(candidate => 
      candidate.professionalInfo.tags.some(t => 
        t.toLowerCase() === tag.toLowerCase()
      )
    );
  };

  // Search candidates
  const searchCandidates = (query: string) => {
    if (!query.trim()) return candidates;
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return candidates.filter(candidate => {
      const fullName = `${candidate.personalInfo.firstName} ${candidate.personalInfo.lastName}`.toLowerCase();
      const email = candidate.personalInfo.email.toLowerCase();
      const title = candidate.professionalInfo.title.toLowerCase();
      const summary = candidate.professionalInfo.summary.toLowerCase();
      const skills = candidate.professionalInfo.skills.map(s => s.name.toLowerCase());
      const jobTitles = candidate.jobApplications.map(a => a.jobTitle.toLowerCase());
      
      return (
        fullName.includes(normalizedQuery) ||
        email.includes(normalizedQuery) ||
        title.includes(normalizedQuery) ||
        summary.includes(normalizedQuery) ||
        skills.some(skill => skill.includes(normalizedQuery)) ||
        jobTitles.some(jobTitle => jobTitle.includes(normalizedQuery))
      );
    });
  };

  const value = {
    candidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    getCandidateById,
    filterCandidates,
    addEducation,
    updateEducation,
    deleteEducation,
    addExperience,
    updateExperience,
    deleteExperience,
    addSkill,
    updateSkill,
    deleteSkill,
    addDocument,
    updateDocument,
    deleteDocument,
    addCommunication,
    updateCommunication,
    deleteCommunication,
    addJobApplication,
    updateJobApplication,
    deleteJobApplication,
    updateCandidateStatus,
    getCandidatesStats,
    getCandidatesByTag,
    searchCandidates
  };

  return (
    <CandidateContext.Provider value={value}>
      {children}
    </CandidateContext.Provider>
  );
};

export const useCandidateContext = () => {
  const context = useContext(CandidateContext);
  if (!context) {
    throw new Error('useCandidateContext must be used within a CandidateProvider');
  }
  return context;
};

export default CandidateContext; 