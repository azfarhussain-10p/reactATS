import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available languages
export const availableLanguages = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  ar: 'العربية',
  hi: 'हिन्दी',
};

// Define language direction by language code
export const languageDirections: Record<string, 'ltr' | 'rtl'> = {
  en: 'ltr',
  es: 'ltr',
  fr: 'ltr',
  de: 'ltr',
  zh: 'ltr',
  ja: 'ltr',
  ar: 'rtl',
  hi: 'ltr',
};

// Interface for internationalization context
interface InternationalizationContextType {
  currentLanguage: string;
  direction: 'ltr' | 'rtl';
  setLanguage: (language: string) => void;
  translate: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date | string) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

// Create context
const InternationalizationContext = createContext<InternationalizationContextType | undefined>(
  undefined
);

// Translation data store - in a real app, this would be loaded from a server or JSON files
const translations: Record<string, Record<string, string>> = {
  en: {
    'app.title': 'ATS Application',
    'app.subtitle': 'Applicant Tracking System',
    'nav.dashboard': 'Dashboard',
    'nav.candidates': 'Candidates',
    'nav.jobs': 'Job Board',
    'nav.interviews': 'Interviews',
    'nav.analytics': 'Analytics',
    'nav.reports': 'Reports',
    'nav.documents': 'Documents',
    'login.title': 'Sign In',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Sign In',
    'login.forgot': 'Forgot Password?',
    'login.register': 'Sign Up',
    'candidate.personal': 'Personal Information',
    'candidate.professional': 'Professional Information',
    'candidate.education': 'Education',
    'candidate.experience': 'Experience',
    'candidate.skills': 'Skills',
    'job.title': 'Job Title',
    'job.department': 'Department',
    'job.location': 'Location',
    'job.type': 'Job Type',
    'job.salary': 'Salary',
    'job.description': 'Description',
    'job.requirements': 'Requirements',
    'job.responsibilities': 'Responsibilities',
    'job.status': 'Status',
    'footer.privacyPolicy': 'Privacy Policy',
    'footer.termsOfService': 'Terms of Service',
    'footer.dataProtection': 'Data Protection',
    'gdpr.notice': 'This application processes personal data in compliance with GDPR regulations.',
    'ccpa.notice': 'California residents have specific privacy rights under CCPA.',
    'compliance.dataRetention': 'Data Retention',
    'compliance.candidateConsent': 'Candidate Consent',
    'compliance.dataAccess': 'Data Access Request',
    'compliance.dataDeletion': 'Data Deletion Request',
    'compliance.eeoc': 'Equal Employment Opportunity',
    'compliance.anonymizedReview': 'Anonymized Review',
    'compliance.geoCompliance': 'Geolocation Compliance',
  },
  es: {
    'app.title': 'Aplicación ATS',
    'app.subtitle': 'Sistema de Seguimiento de Candidatos',
    'nav.dashboard': 'Tablero',
    'nav.candidates': 'Candidatos',
    'nav.jobs': 'Bolsa de Trabajo',
    'nav.interviews': 'Entrevistas',
    'nav.analytics': 'Análisis',
    'nav.reports': 'Informes',
    'nav.documents': 'Documentos',
    'login.title': 'Iniciar Sesión',
    'login.email': 'Correo Electrónico',
    'login.password': 'Contraseña',
    'login.submit': 'Iniciar Sesión',
    'login.forgot': '¿Olvidó su Contraseña?',
    'login.register': 'Registrarse',
    'candidate.personal': 'Información Personal',
    'candidate.professional': 'Información Profesional',
    'candidate.education': 'Educación',
    'candidate.experience': 'Experiencia',
    'candidate.skills': 'Habilidades',
    'job.title': 'Título del Trabajo',
    'job.department': 'Departamento',
    'job.location': 'Ubicación',
    'job.type': 'Tipo de Trabajo',
    'job.salary': 'Salario',
    'job.description': 'Descripción',
    'job.requirements': 'Requisitos',
    'job.responsibilities': 'Responsabilidades',
    'job.status': 'Estado',
    'footer.privacyPolicy': 'Política de Privacidad',
    'footer.termsOfService': 'Términos de Servicio',
    'footer.dataProtection': 'Protección de Datos',
    'gdpr.notice': 'Esta aplicación procesa datos personales de acuerdo con las regulaciones GDPR.',
    'ccpa.notice':
      'Los residentes de California tienen derechos específicos de privacidad bajo CCPA.',
    'compliance.dataRetention': 'Retención de Datos',
    'compliance.candidateConsent': 'Consentimiento del Candidato',
    'compliance.dataAccess': 'Solicitud de Acceso a Datos',
    'compliance.dataDeletion': 'Solicitud de Eliminación de Datos',
    'compliance.eeoc': 'Igualdad de Oportunidades de Empleo',
    'compliance.anonymizedReview': 'Revisión Anónima',
    'compliance.geoCompliance': 'Cumplimiento de Geolocalización',
  },
  // Add more languages as needed
};

// Provider component
export const InternationalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try to get language preference from localStorage or use browser language as fallback
  const getBrowserLanguage = (): string => {
    // Get browser language (first 2 chars)
    const browserLang = navigator.language.slice(0, 2);

    // Check if browser language is supported
    return browserLang in availableLanguages ? browserLang : 'en';
  };

  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return savedLanguage || getBrowserLanguage();
  });

  // Keep track of text direction based on language
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(
    languageDirections[currentLanguage] || 'ltr'
  );

  // Update direction when language changes
  useEffect(() => {
    setDirection(languageDirections[currentLanguage] || 'ltr');

    // Update the dir attribute on the html element
    document.documentElement.dir = languageDirections[currentLanguage] || 'ltr';

    // Save preference to localStorage
    localStorage.setItem('preferredLanguage', currentLanguage);
  }, [currentLanguage]);

  // Function to change the language
  const setLanguage = (language: string) => {
    if (language in availableLanguages) {
      setCurrentLanguage(language);
    }
  };

  // Function to translate a key with optional parameters
  const translate = (key: string, params?: Record<string, string | number>): string => {
    // Get the translation from the current language
    const translation = translations[currentLanguage]?.[key] || translations.en[key] || key;

    // If no parameters, return the translation as is
    if (!params) {
      return translation;
    }

    // Replace parameters in the translation
    return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
      return acc.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
    }, translation);
  };

  // Format a date according to the current language
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleDateString(currentLanguage, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format a number according to the current language
  const formatNumber = (num: number): string => {
    return num.toLocaleString(currentLanguage);
  };

  // Format currency according to the current language
  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return amount.toLocaleString(currentLanguage, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    });
  };

  // Context value
  const value: InternationalizationContextType = {
    currentLanguage,
    direction,
    setLanguage,
    translate,
    formatDate,
    formatNumber,
    formatCurrency,
  };

  return (
    <InternationalizationContext.Provider value={value}>
      {children}
    </InternationalizationContext.Provider>
  );
};

// Custom hook for using the internationalization context
export const useInternationalization = (): InternationalizationContextType => {
  const context = useContext(InternationalizationContext);

  if (context === undefined) {
    throw new Error('useInternationalization must be used within an InternationalizationProvider');
  }

  return context;
};

// Shorthand hook for translations
export const useTranslate = () => {
  const { translate } = useInternationalization();
  return translate;
};
