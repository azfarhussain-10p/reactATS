import { Candidate, CandidateStatus, CandidateSource, PipelineStage } from '../models/types';

// Create a basic candidate factory function
const createCandidate = (
  id: number,
  firstName: string,
  lastName: string,
  role: string,
  status: CandidateStatus,
  source: CandidateSource,
  createdAt: string
): Candidate => {
  // Helper function to map candidate status to pipeline stage
  const mapStatusToStage = (status: CandidateStatus): PipelineStage => {
    switch (status) {
      case 'New':
        return 'Applied';
      case 'Screening':
        return 'Screening';
      case 'Interview':
        return 'First Interview';
      case 'Assessment':
        return 'Technical Assessment';
      case 'Offer':
        return 'Offer';
      case 'Hired':
        return 'Hired';
      case 'Rejected':
        return 'Rejected';
      case 'Withdrawn':
        return 'Withdrawn';
      case 'On Hold':
        return 'Applied';
      default:
        return 'Applied';
    }
  };

  return {
    id,
    personalInfo: {
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+1-555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      location: ['New York, NY', 'San Francisco, CA', 'Austin, TX', 'Chicago, IL', 'Seattle, WA'][
        Math.floor(Math.random() * 5)
      ],
      willingToRelocate: Math.random() > 0.5,
    },
    professionalInfo: {
      title: role,
      summary: `Experienced ${role} with a passion for building great products.`,
      totalYearsOfExperience: Math.floor(2 + Math.random() * 10),
      skills: [
        {
          id: '1',
          name: 'JavaScript',
          proficiency: 'Advanced',
          endorsed: true,
        },
        {
          id: '2',
          name: 'React',
          proficiency: 'Intermediate',
          endorsed: false,
        },
        {
          id: '3',
          name: 'TypeScript',
          proficiency: 'Beginner',
          endorsed: false,
        },
      ],
      tags: ['frontend', 'developer', 'javascript'],
    },
    education: [
      {
        id: '1',
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        level: "Bachelor's Degree",
        startDate: '2015-09-01',
        endDate: '2019-05-30',
        current: false,
        description: 'Graduated with honors',
      },
    ],
    experience: [
      {
        id: '1',
        company: 'Tech Company Inc.',
        title: 'Software Developer',
        location: 'San Francisco, CA',
        startDate: '2019-06-01',
        endDate: '2022-05-30',
        current: false,
        description: 'Developed web applications using React and Node.js',
        achievements: ['Improved application performance by 30%', 'Implemented CI/CD pipeline'],
      },
      {
        id: '2',
        company: 'Current Employer',
        title: role,
        location: 'Remote',
        startDate: '2022-06-01',
        endDate: '',
        current: true,
        description: 'Working on enterprise applications',
        achievements: ['Leading a team of 3 developers', 'Architected new microservices'],
      },
    ],
    documents: [
      {
        id: '1',
        name: 'Resume',
        type: 'Resume',
        fileUrl: 'https://example.com/resume.pdf',
        uploadDate: createdAt,
      },
    ],
    communications: [],
    notes: '',
    source,
    status,
    jobApplications: [
      {
        id: '1',
        jobId: 1,
        jobTitle: 'Senior Frontend Developer',
        applicationDate: createdAt,
        status: status,
        stage: mapStatusToStage(status),
        stageHistory: [
          {
            stage: 'Applied',
            enteredAt: createdAt,
            exitedAt:
              status !== 'New'
                ? new Date(new Date(createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
                : undefined,
            daysInStage:
              status !== 'New'
                ? 2
                : Math.floor(
                    (new Date().getTime() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000)
                  ),
            completedTasks: [],
          },
        ],
        interviews: [],
      },
    ],
    createdAt,
    updatedAt: new Date().toISOString(),
  };
};

// Create mock candidate data
const mockCandidates: Candidate[] = [
  createCandidate(
    1,
    'John',
    'Doe',
    'Frontend Developer',
    'New',
    'Job Board',
    '2023-11-15T10:00:00Z'
  ),
  createCandidate(
    2,
    'Jane',
    'Smith',
    'UX Designer',
    'Screening',
    'LinkedIn',
    '2023-11-10T09:30:00Z'
  ),
  createCandidate(
    3,
    'Robert',
    'Johnson',
    'Backend Developer',
    'Interview',
    'Referral',
    '2023-11-05T14:15:00Z'
  ),
  createCandidate(
    4,
    'Emily',
    'Wilson',
    'Product Manager',
    'Offer',
    'Company Website',
    '2023-10-25T11:20:00Z'
  ),
  createCandidate(
    5,
    'Michael',
    'Brown',
    'DevOps Engineer',
    'Hired',
    'Job Board',
    '2023-10-20T16:45:00Z'
  ),
  createCandidate(
    6,
    'Sarah',
    'Davis',
    'Data Scientist',
    'New',
    'Direct Application',
    '2023-11-18T08:50:00Z'
  ),
  createCandidate(
    7,
    'David',
    'Miller',
    'Mobile Developer',
    'Rejected',
    'Career Fair',
    '2023-11-01T13:10:00Z'
  ),
  createCandidate(
    8,
    'Jessica',
    'Taylor',
    'Project Manager',
    'Screening',
    'Recruitment Agency',
    '2023-11-12T15:30:00Z'
  ),
  createCandidate(
    9,
    'Daniel',
    'Anderson',
    'Full Stack Developer',
    'Interview',
    'LinkedIn',
    '2023-11-08T10:45:00Z'
  ),
  createCandidate(
    10,
    'Amanda',
    'Thomas',
    'UI Designer',
    'Hired',
    'Referral',
    '2023-10-15T09:00:00Z'
  ),
];

export default mockCandidates;
