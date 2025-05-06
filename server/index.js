const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Configure CORS
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.'));
    }
  },
});

// Status endpoint to check if server is running
app.get('/api/parse-cv/status', (req, res) => {
  res.json({ status: 'available' });
});

// CV Parsing endpoint
app.post('/api/parse-cv', upload.single('cvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    let textContent = '';

    // Extract text based on file type
    if (fileExt === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      textContent = pdfData.text;
    } else if (fileExt === '.doc' || fileExt === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      textContent = result.value;
    } else if (fileExt === '.txt') {
      textContent = fs.readFileSync(filePath, 'utf8');
    }

    // Simple parsing logic - in a real implementation, this would be more sophisticated
    const parsedData = parseTextContent(textContent);

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.json(parsedData);
  } catch (error) {
    console.error('Error parsing CV:', error);
    res.status(500).json({ error: 'Failed to parse CV', message: error.message });
  }
});

// Simple parsing function
function parseTextContent(text) {
  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : '';

  // Extract phone
  const phoneRegex = /(\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Extract LinkedIn URL
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/;
  const linkedinMatch = text.match(linkedinRegex);
  const linkedin = linkedinMatch ? `https://www.${linkedinMatch[0]}` : undefined;

  // Extract GitHub URL
  const githubRegex = /github\.com\/[a-zA-Z0-9-]+/;
  const githubMatch = text.match(githubRegex);
  const github = githubMatch ? `https://www.${githubMatch[0]}` : undefined;

  // Extract name - first few lines that aren't email/phone
  const lines = text.split('\n');
  let firstName = '';
  let lastName = '';

  for (const line of lines.slice(0, 5)) {
    if (!line.includes('@') && !phoneRegex.test(line) && line.trim().length > 0) {
      const nameParts = line.trim().split(' ');
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
        break;
      }
    }
  }

  if (!firstName) {
    firstName = 'Unknown';
    lastName = 'Candidate';
  }

  // Extract skills
  const skillKeywords = [
    'JavaScript',
    'TypeScript',
    'React',
    'Angular',
    'Vue',
    'Node.js',
    'Express',
    'HTML',
    'CSS',
    'SASS',
    'LESS',
    'Python',
    'Java',
    'C#',
    'C++',
    'PHP',
    'Ruby',
    'Swift',
    'Kotlin',
    'SQL',
    'NoSQL',
    'MongoDB',
    'MySQL',
    'PostgreSQL',
    'Oracle',
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'GCP',
    'Git',
    'Jenkins',
    'CI/CD',
    'Agile',
    'Scrum',
    'Kanban',
    'Project Management',
    'Team Leadership',
  ];

  const skills = [];
  for (const skill of skillKeywords) {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      skills.push(skill);
    }
  }

  // Extract education and experience sections
  const educationIndex = text.toLowerCase().indexOf('education');
  const experienceIndex = text.toLowerCase().indexOf('experience');

  let educationText = '';
  let experienceText = '';

  if (educationIndex >= 0) {
    educationText = text.substring(
      educationIndex,
      experienceIndex >= 0 ? experienceIndex : text.length
    );
  }

  if (experienceIndex >= 0) {
    experienceText = text.substring(
      experienceIndex,
      educationIndex > experienceIndex ? educationIndex : text.length
    );
  }

  // Simple implementation of education parsing
  const education = [];
  const degreeKeywords = ['Bachelor', 'Master', 'PhD', 'BSc', 'MSc', 'MBA'];

  // Very simplified education parsing
  for (const line of educationText.split('\n')) {
    for (const keyword of degreeKeywords) {
      if (line.includes(keyword)) {
        education.push({
          institution: 'University', // Simplified
          degree: line.trim(),
          field: '',
          startDate: '',
          endDate: '',
          current: false,
        });
        break;
      }
    }
  }

  // Simple implementation of experience parsing
  const experience = [];

  // Very simplified experience parsing
  let currentExp = null;
  for (const line of experienceText.split('\n')) {
    if (line.trim().length === 0) continue;

    // Check if line might be a job title
    if (line.length < 60 && !line.startsWith(' ') && !line.startsWith('\t')) {
      if (currentExp) {
        experience.push(currentExp);
      }
      currentExp = {
        company: 'Company', // Simplified
        title: line.trim(),
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      };
    } else if (currentExp) {
      currentExp.description += line.trim() + ' ';
    }
  }

  if (currentExp) {
    experience.push(currentExp);
  }

  // Return structured data with confidence scores
  return {
    personalInfo: {
      firstName,
      lastName,
      email,
      phone,
      location: '',
      linkedin,
      github,
    },
    professionalInfo: {
      title: '',
      summary: '',
      totalYearsOfExperience: 0,
      currentEmployer: '',
      skills,
    },
    education,
    experience,
    certifications: [],
    languages: [],
    confidenceScores: {
      overall: 0.7,
      contact: email && phone ? 0.9 : 0.5,
      education: education.length > 0 ? 0.7 : 0.3,
      experience: experience.length > 0 ? 0.7 : 0.3,
      skills: skills.length > 0 ? 0.8 : 0.4,
    },
  };
}

// Start the server
app.listen(PORT, () => {
  console.log(`CV Parsing Server running on port ${PORT}`);
});
