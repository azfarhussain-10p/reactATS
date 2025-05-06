import { v4 as uuidv4 } from 'uuid';
import { Candidate, Document, Education, Experience, Skill, ParsedResume } from '../models/types';
// Remove server-only imports that don't work in browser

interface CVParsingServiceConfig {
  enableAI: boolean;
  confidenceThreshold: number;
  supportedFileTypes: string[];
  maxFileSize: number; // in MB
}

export interface ParsedCVData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  professionalInfo: {
    title: string;
    summary: string;
    totalYearsOfExperience: number;
    currentEmployer?: string;
    skills: string[];
  };
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
  }>;
  experience: Array<{
    company: string;
    title: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description: string;
  }>;
  certifications: string[];
  languages: string[];
  confidenceScores: {
    overall: number;
    contact: number;
    education: number;
    experience: number;
    skills: number;
  };
}

/**
 * Service for parsing CVs/resumes and extracting structured data
 */
class CVParsingService {
  private static instance: CVParsingService;
  private config: CVParsingServiceConfig;

  private constructor() {
    this.config = {
      enableAI: true,
      confidenceThreshold: 0.65,
      supportedFileTypes: ['.pdf', '.doc', '.docx', '.txt'],
      maxFileSize: 10, // MB
    };
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): CVParsingService {
    if (!CVParsingService.instance) {
      CVParsingService.instance = new CVParsingService();
    }
    return CVParsingService.instance;
  }

  /**
   * Configure the service
   */
  public configure(config: Partial<CVParsingServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Parse a CV file and extract structured data
   * @param file The CV file to parse
   * @returns Promise with the parsed data
   */
  public async parseCV(file: File): Promise<ParsedCVData> {
    // Validate file
    this.validateFile(file);

    // Extract text content from file
    const textContent = await this.extractTextFromFile(file);

    // Parse the text content
    return this.parseTextContent(textContent, file.name);
  }

  /**
   * Parse raw text content from a CV
   * @param textContent The raw text content
   * @param filename Optional filename for context
   * @returns Parsed CV data
   */
  public async parseTextContent(textContent: string, filename?: string): Promise<ParsedCVData> {
    // This would normally call an AI service API for advanced parsing
    // For now, we'll implement a simulated parsing algorithm

    // Simulate processing time for realistic experience
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Divide the text into sections
    const sections = this.divideIntoSections(textContent);

    // Extract data from each section
    const personalInfo = this.extractPersonalInfo(sections.header, textContent);
    const professionalInfo = this.extractProfessionalInfo(
      sections.summary,
      sections.skills,
      textContent
    );
    const education = this.extractEducation(sections.education, textContent);
    const experience = this.extractExperience(sections.experience, textContent);
    const certifications = this.extractCertifications(sections.certifications, textContent);
    const languages = this.extractLanguages(sections.languages, textContent);

    // Calculate confidence scores
    const confidenceScores = this.calculateConfidenceScores({
      personalInfo,
      professionalInfo,
      education,
      experience,
    });

    return {
      personalInfo,
      professionalInfo,
      education,
      experience,
      certifications,
      languages,
      confidenceScores,
    };
  }

  /**
   * Convert parsed CV data to a Candidate object
   * @param parsedData The parsed CV data
   * @returns A candidate object with the parsed data
   */
  public convertToCandidateModel(
    parsedData: ParsedCVData
  ): Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'> {
    // Create skills array
    const skills: Skill[] = parsedData.professionalInfo.skills.map((skillName) => ({
      id: uuidv4(),
      name: skillName,
      level: 'Intermediate', // Default level since it's hard to detect from CV
      yearsOfExperience: null,
      verified: false,
    }));

    // Create education array
    const education: Education[] = parsedData.education.map((edu) => ({
      id: uuidv4(),
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.field,
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      current: edu.current || false,
      description: '',
      location: '',
    }));

    // Create experience array
    const experience: Experience[] = parsedData.experience.map((exp) => ({
      id: uuidv4(),
      company: exp.company,
      title: exp.title,
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      current: exp.current || false,
      description: exp.description,
    }));

    // Create document for the CV
    const documents: Document[] = [
      {
        id: uuidv4(),
        name: 'Resume',
        type: 'Resume',
        fileUrl: 'placeholder-url', // Would be replaced with actual URL after upload
        uploadDate: new Date().toISOString(),
        notes: 'Automatically parsed',
      },
    ];

    return {
      personalInfo: {
        firstName: parsedData.personalInfo.firstName,
        lastName: parsedData.personalInfo.lastName,
        email: parsedData.personalInfo.email,
        phone: parsedData.personalInfo.phone,
        location: parsedData.personalInfo.location,
        linkedin: parsedData.personalInfo.linkedin,
        github: parsedData.personalInfo.github,
        portfolio: parsedData.personalInfo.portfolio,
      },
      professionalInfo: {
        title: parsedData.professionalInfo.title,
        summary: parsedData.professionalInfo.summary,
        totalYearsOfExperience: parsedData.professionalInfo.totalYearsOfExperience,
        currentEmployer: parsedData.professionalInfo.currentEmployer,
        currentSalary: '',
        expectedSalary: '',
        noticePeriod: '',
        skills,
        tags: [],
      },
      education,
      experience,
      documents,
      source: 'Direct Application',
      sourceDetails: 'Self-registration via careers page',
      status: 'New',
      communications: [],
      jobApplications: [],
      notes: `Automatically created from CV with ${(parsedData.confidenceScores.overall * 100).toFixed(2)}% confidence.`,
    };
  }

  /**
   * Validate if the file can be processed
   */
  private validateFile(file: File): void {
    // Check file type
    const fileExtension = this.getFileExtension(file.name);
    if (!this.config.supportedFileTypes.includes(fileExtension)) {
      throw new Error(
        `Unsupported file type: ${fileExtension}. Supported types: ${this.config.supportedFileTypes.join(', ')}`
      );
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > this.config.maxFileSize) {
      throw new Error(
        `File too large (${fileSizeInMB.toFixed(2)} MB). Maximum size: ${this.config.maxFileSize} MB`
      );
    }
  }

  /**
   * Extract text content from a file
   * Browser-compatible version that only handles text files directly
   */
  private async extractTextFromFile(file: File): Promise<string> {
    const fileExtension = this.getFileExtension(file.name);

    // Extract text from TXT files - this is the only format we can handle directly in the browser
    if (fileExtension === '.txt') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }

    // For other formats, we need to notify the user that client-side parsing is limited
    if (fileExtension === '.pdf' || fileExtension === '.doc' || fileExtension === '.docx') {
      // For demo purposes, show a basic text representation
      return `This is a simulated text extraction from your ${fileExtension} file.

Since we're running in a browser environment which doesn't support full document parsing,
this is only a placeholder. In an actual implementation, we would:

1. Either use the server-side parsing service (recommended)
2. Or use specialized browser-compatible libraries for PDF/DOC parsing

Your file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)
Type: ${file.type}

For better results, please ensure the CV parsing server is running.`;
    }

    throw new Error(`Unsupported file type: ${fileExtension}`);
  }

  /**
   * Divide CV text into logical sections
   */
  private divideIntoSections(text: string): {
    header: string;
    summary: string;
    education: string;
    experience: string;
    skills: string;
    certifications: string;
    languages: string;
  } {
    // This is a simplified implementation
    // In a real parser, we would use NLP and pattern recognition

    const lines = text.split('\n');
    const sections: Record<string, string[]> = {
      header: [],
      summary: [],
      education: [],
      experience: [],
      skills: [],
      certifications: [],
      languages: [],
    };

    let currentSection = 'header';

    // First 5 lines are likely to be contact info
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      sections.header.push(lines[i]);
    }

    // Simple keyword-based section detection
    // This would be much more sophisticated in a real implementation
    for (let i = 5; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      if (line.includes('summary') || line.includes('profile') || line.includes('objective')) {
        currentSection = 'summary';
        continue;
      } else if (line.includes('education') || line.includes('academic')) {
        currentSection = 'education';
        continue;
      } else if (
        line.includes('experience') ||
        line.includes('employment') ||
        line.includes('work history')
      ) {
        currentSection = 'experience';
        continue;
      } else if (
        line.includes('skills') ||
        line.includes('technologies') ||
        line.includes('technical')
      ) {
        currentSection = 'skills';
        continue;
      } else if (line.includes('certifications') || line.includes('certificates')) {
        currentSection = 'certifications';
        continue;
      } else if (line.includes('languages') || line.includes('linguistic')) {
        currentSection = 'languages';
        continue;
      }

      sections[currentSection].push(lines[i]);
    }

    // Convert arrays back to strings
    return {
      header: sections.header.join('\n'),
      summary: sections.summary.join('\n'),
      education: sections.education.join('\n'),
      experience: sections.experience.join('\n'),
      skills: sections.skills.join('\n'),
      certifications: sections.certifications.join('\n'),
      languages: sections.languages.join('\n'),
    };
  }

  /**
   * Extract personal information from the CV
   */
  private extractPersonalInfo(headerText: string, fullText: string): ParsedCVData['personalInfo'] {
    // In a real implementation, this would use named entity recognition and pattern matching

    // Extract email using regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = fullText.match(emailRegex);
    const email = emailMatch ? emailMatch[0] : '';

    // Extract phone using regex - simplified pattern
    const phoneRegex = /(\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/;
    const phoneMatch = fullText.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // Extract LinkedIn URL
    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/;
    const linkedinMatch = fullText.match(linkedinRegex);
    const linkedin = linkedinMatch ? `https://www.${linkedinMatch[0]}` : undefined;

    // Extract GitHub URL
    const githubRegex = /github\.com\/[a-zA-Z0-9-]+/;
    const githubMatch = fullText.match(githubRegex);
    const github = githubMatch ? `https://www.${githubMatch[0]}` : undefined;

    // For name, take first line and try to split into first/last
    // This is very simplified compared to a real implementation
    const firstLine = headerText.split('\n')[0].trim();
    let firstName = '';
    let lastName = '';

    if (firstLine && !firstLine.includes('@') && !phoneRegex.test(firstLine)) {
      const nameParts = firstLine.split(' ');
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        firstName = firstLine;
      }
    } else {
      // Fallback name if we couldn't detect one
      firstName = 'Unknown';
      lastName = 'Candidate';
    }

    // Extract location - look for common patterns
    // In real implementation, we'd use address parsing and NER
    const locationMatches = fullText.match(/([A-Z][a-z]+,?\s*[A-Z]{2})/);
    const location = locationMatches ? locationMatches[0] : '';

    return {
      firstName,
      lastName,
      email,
      phone,
      location,
      linkedin,
      github,
    };
  }

  /**
   * Extract professional information from the CV
   */
  private extractProfessionalInfo(
    summaryText: string,
    skillsText: string,
    fullText: string
  ): ParsedCVData['professionalInfo'] {
    // Extract job title from the first few lines after the name
    const lines = fullText.split('\n').slice(1, 5);
    let title = '';

    for (const line of lines) {
      // Look for a line that's likely a job title
      // This is simplified; real implementation would be more sophisticated
      if (
        line.length > 0 &&
        line.length < 50 &&
        !line.includes('@') &&
        !line.includes('http') &&
        !line.match(/^\s*\d{3}[-\s]?\d{3}[-\s]?\d{4}\s*$/)
      ) {
        title = line.trim();
        break;
      }
    }

    if (!title) {
      title = 'Professional';
    }

    // Extract summary
    let summary = summaryText.trim();

    // If summary wasn't found in a dedicated section, try to find a paragraph
    if (!summary) {
      const paragraphs = fullText.split('\n\n');
      for (const paragraph of paragraphs) {
        if (paragraph.length > 100 && paragraph.length < 1000) {
          summary = paragraph.trim();
          break;
        }
      }
    }

    // Extract skills
    const skills: string[] = [];

    // Check for skills in the skills section
    const skillLines = skillsText.split('\n');
    for (const line of skillLines) {
      // Look for comma or bullet-point separated skills
      if (line.includes(',') || line.includes('•')) {
        const separatedSkills = line
          .split(/,|•/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        skills.push(...separatedSkills);
      } else if (line.trim().length > 0 && line.trim().length < 50) {
        // If it's a short line, it might be a single skill
        skills.push(line.trim());
      }
    }

    // If no skills were found in the skills section, scan the whole document
    if (skills.length === 0) {
      // Common tech skills to look for
      const commonSkills = [
        'JavaScript',
        'React',
        'Angular',
        'Vue',
        'Node.js',
        'TypeScript',
        'Python',
        'Java',
        'C#',
        'C++',
        'Ruby',
        'Go',
        'Swift',
        'PHP',
        'AWS',
        'Azure',
        'Google Cloud',
        'Docker',
        'Kubernetes',
        'SQL',
        'MongoDB',
        'PostgreSQL',
        'MySQL',
        'Redis',
        'HTML',
        'CSS',
        'SASS',
        'LESS',
        'Bootstrap',
        'Material UI',
        'Git',
        'GitHub',
        'GitLab',
        'Bitbucket',
        'Agile',
        'Scrum',
        'Kanban',
        'Jira',
        'Confluence',
      ];

      for (const skill of commonSkills) {
        if (fullText.toLowerCase().includes(skill.toLowerCase())) {
          skills.push(skill);
        }
      }
    }

    // Estimate years of experience
    // This would be more sophisticated in a real implementation
    let totalYearsOfExperience = 0;
    const yearsMatches = fullText.match(/(\d+)[\s]*(years|year|yr|yrs)/gi);
    if (yearsMatches && yearsMatches.length > 0) {
      // Take the largest number of years mentioned
      let maxYears = 0;
      for (const match of yearsMatches) {
        const num = parseInt(match.match(/\d+/)[0]);
        if (num > maxYears && num < 50) {
          // Reasonable upper limit
          maxYears = num;
        }
      }
      totalYearsOfExperience = maxYears;
    } else {
      // Fallback: estimate 1 year per job mentioned
      const experienceMatches = fullText.match(/experience/gi);
      totalYearsOfExperience = experienceMatches ? Math.min(experienceMatches.length, 15) : 1;
    }

    // Current employer - try to get from the most recent experience
    const currentEmployer = this.getCurrentEmployer(fullText);

    return {
      title,
      summary,
      totalYearsOfExperience,
      currentEmployer,
      skills: [...new Set(skills)], // Remove duplicates
    };
  }

  /**
   * Extract education information from the CV
   */
  private extractEducation(educationText: string, fullText: string): ParsedCVData['education'] {
    const education: ParsedCVData['education'] = [];

    // Common degree abbreviations and names to look for
    const degreeKeywords = [
      'Bachelor',
      'Master',
      'PhD',
      'Doctorate',
      'BSc',
      'BA',
      'BBA',
      'MA',
      'MSc',
      'MBA',
      'B.S.',
      'M.S.',
      'B.A.',
      'M.A.',
      'B.B.A.',
      'M.B.A.',
      'Ph.D.',
    ];

    // Common educational institution keywords
    const institutionKeywords = ['University', 'College', 'Institute', 'School', 'Academy'];

    // Split into paragraphs that might represent different education entries
    const paragraphs = educationText.split('\n\n');

    for (const paragraph of paragraphs) {
      if (paragraph.trim().length === 0) continue;

      const lines = paragraph.split('\n');
      let institution = '';
      let degree = '';
      let field = '';
      let startDate = '';
      let endDate = '';
      let current = false;

      // Try to identify the institution
      for (const line of lines) {
        for (const keyword of institutionKeywords) {
          if (line.includes(keyword)) {
            institution = line.trim();
            break;
          }
        }
        if (institution) break;
      }

      // If no institution was found, use the first line as a fallback
      if (!institution && lines.length > 0) {
        institution = lines[0].trim();
      }

      // Try to identify the degree
      for (const line of lines) {
        for (const keyword of degreeKeywords) {
          if (line.includes(keyword)) {
            degree = line.trim();

            // Try to extract the field of study
            const parts = line.split('in');
            if (parts.length > 1) {
              field = parts[1].trim();
            } else {
              const parts = line.split('of');
              if (parts.length > 1) {
                field = parts[1].trim();
              }
            }

            break;
          }
        }
        if (degree) break;
      }

      // Look for dates in the format 2010 - 2014 or similar
      for (const line of lines) {
        const datePattern = /(\d{4})\s*[-–—]\s*(\d{4}|present|current|now)/i;
        const dateMatch = line.match(datePattern);

        if (dateMatch) {
          startDate = dateMatch[1];
          endDate = dateMatch[2].toLowerCase();

          if (endDate === 'present' || endDate === 'current' || endDate === 'now') {
            current = true;
            endDate = '';
          }

          break;
        }
      }

      // Only add if we found at least an institution or degree
      if (institution || degree) {
        education.push({
          institution,
          degree: degree || 'Degree not specified',
          field: field || 'Field not specified',
          startDate,
          endDate,
          current,
        });
      }
    }

    return education;
  }

  /**
   * Extract experience information from the CV
   */
  private extractExperience(experienceText: string, fullText: string): ParsedCVData['experience'] {
    const experience: ParsedCVData['experience'] = [];

    // Split into paragraphs that might represent different job entries
    const paragraphs = experienceText.split('\n\n');

    for (const paragraph of paragraphs) {
      if (paragraph.trim().length === 0) continue;

      const lines = paragraph.split('\n');
      let company = '';
      let title = '';
      let location = '';
      let startDate = '';
      let endDate = '';
      let current = false;
      let description = '';

      // Company and title are typically in the first line or two
      if (lines.length > 0) {
        // Try to split "Company Name - Job Title" format
        const firstLine = lines[0].trim();
        const parts = firstLine.split(/[-–—|]/);

        if (parts.length >= 2) {
          company = parts[0].trim();
          title = parts[1].trim();
        } else {
          // If no clear separator, use first line as title and next line (if exists) as company
          title = firstLine;
          if (lines.length > 1) {
            company = lines[1].trim();
          }
        }
      }

      // Look for dates in the format 2010 - 2014 or similar
      for (const line of lines) {
        const datePattern = /(\d{4})\s*[-–—]\s*(\d{4}|present|current|now)/i;
        const dateMatch = line.match(datePattern);

        if (dateMatch) {
          startDate = dateMatch[1];
          endDate = dateMatch[2].toLowerCase();

          if (endDate === 'present' || endDate === 'current' || endDate === 'now') {
            current = true;
            endDate = '';
          }

          // Look for location in the same line as dates, often format "Location | 2010 - 2014"
          const locationParts = line.split(/[|,]/);
          if (locationParts.length > 1) {
            // The part without the date might be the location
            for (const part of locationParts) {
              if (!part.match(datePattern)) {
                location = part.trim();
                break;
              }
            }
          }

          break;
        }
      }

      // The rest is likely description
      // Skip the first 2-3 lines that were likely company, title, date
      const skipLines = 3;
      if (lines.length > skipLines) {
        description = lines.slice(skipLines).join('\n').trim();
      }

      // Only add if we have at least a company or title
      if (company || title) {
        experience.push({
          company: company || 'Company not specified',
          title: title || 'Position not specified',
          location,
          startDate,
          endDate,
          current,
          description,
        });
      }
    }

    return experience;
  }

  /**
   * Extract certifications from the CV
   */
  private extractCertifications(certificationsText: string, fullText: string): string[] {
    const certifications: string[] = [];

    // Split into lines that might represent different certifications
    const lines = certificationsText.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length > 0 && trimmedLine.length < 100) {
        certifications.push(trimmedLine);
      }
    }

    // If no certifications were found in the dedicated section, scan for common certifications
    if (certifications.length === 0) {
      const commonCertifications = [
        'AWS Certified',
        'Microsoft Certified',
        'Google Cloud Certified',
        'PMP',
        'CISSP',
        'CISA',
        'CompTIA',
        'Cisco Certified',
        'Certified ScrumMaster',
        'ITIL',
        'Six Sigma',
      ];

      for (const cert of commonCertifications) {
        if (fullText.includes(cert)) {
          // Try to extract the full certification name
          const regex = new RegExp(`${cert}[\\w\\s]+`, 'i');
          const match = fullText.match(regex);
          if (match) {
            certifications.push(match[0].trim());
          } else {
            certifications.push(cert);
          }
        }
      }
    }

    return certifications;
  }

  /**
   * Extract languages from the CV
   */
  private extractLanguages(languagesText: string, fullText: string): string[] {
    const languages: string[] = [];

    // Split into lines that might represent different languages
    const lines = languagesText.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length > 0 && trimmedLine.length < 50) {
        languages.push(trimmedLine);
      }
    }

    // If no languages were found in the dedicated section, scan for common languages
    if (languages.length === 0) {
      const commonLanguages = [
        'English',
        'Spanish',
        'French',
        'German',
        'Chinese',
        'Japanese',
        'Korean',
        'Arabic',
        'Russian',
        'Portuguese',
        'Italian',
        'Dutch',
        'Hindi',
        'Urdu',
        'Bengali',
        'Turkish',
      ];

      for (const lang of commonLanguages) {
        if (fullText.includes(lang)) {
          languages.push(lang);
        }
      }
    }

    return languages;
  }

  /**
   * Calculate confidence scores for the parsed data
   */
  private calculateConfidenceScores(data: {
    personalInfo: ParsedCVData['personalInfo'];
    professionalInfo: ParsedCVData['professionalInfo'];
    education: ParsedCVData['education'];
    experience: ParsedCVData['experience'];
  }): ParsedCVData['confidenceScores'] {
    // Calculate confidence for personal info
    const contactFields = [
      data.personalInfo.firstName,
      data.personalInfo.lastName,
      data.personalInfo.email,
      data.personalInfo.phone,
    ];
    const contactScore = contactFields.filter(Boolean).length / contactFields.length;

    // Calculate confidence for education
    const educationScore = data.education.length > 0 ? Math.min(1, data.education.length / 2) : 0;

    // Calculate confidence for experience
    const experienceScore =
      data.experience.length > 0 ? Math.min(1, data.experience.length / 3) : 0;

    // Calculate confidence for skills
    const skillsScore =
      data.professionalInfo.skills.length > 0
        ? Math.min(1, data.professionalInfo.skills.length / 5)
        : 0;

    // Calculate overall confidence (weighted average)
    const overall =
      contactScore * 0.3 + educationScore * 0.2 + experienceScore * 0.3 + skillsScore * 0.2;

    return {
      overall,
      contact: contactScore,
      education: educationScore,
      experience: experienceScore,
      skills: skillsScore,
    };
  }

  /**
   * Try to extract the current employer from the CV
   */
  private getCurrentEmployer(fullText: string): string | undefined {
    // Try to find present/current job
    const presentJobRegex =
      /([A-Z][a-zA-Z\s]+)(,|\||\s+at\s+)([A-Z][a-zA-Z\s]+).*?(present|current|now)/i;
    const match = fullText.match(presentJobRegex);

    if (match) {
      // The company name might be in group 1 or 3, depending on format
      return match[3] || match[1];
    }

    return undefined;
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.slice(lastDotIndex).toLowerCase() : '';
  }
}

export default CVParsingService;
