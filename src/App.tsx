import React, { useState, useEffect } from 'react';
import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
  createTheme,
  responsiveFontSizes,
  PaletteMode
} from '@mui/material';
import { AccessibilitySettings } from './components/AccessibilityMenu';
import ScreenReaderAnnouncer from './components/ScreenReaderAnnouncer';
import './styles/accessibilityStyles.css';
import { AdvancedAnalyticsProvider } from './contexts/AdvancedAnalyticsContext';
import { CandidateProvider } from './contexts/CandidateContext';
import { JobPostingProvider } from './contexts/JobPostingContext';
import { PipelineProvider } from './contexts/PipelineContext';
import { EvaluationProvider } from './contexts/EvaluationContext';
import { ResumeParsingProvider } from './contexts/ResumeParsingContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { EmailCampaignProvider } from './contexts/EmailCampaignContext';
import { FormBuilderProvider } from './contexts/FormBuilderContext';
import { ATSIntegrationProvider } from './contexts/ATSIntegrationContext';
import { AdvancedDashboardProvider } from './contexts/AdvancedDashboardContext';
import { AuthProvider } from './contexts/AuthContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './routes';
import { useNavigate, useLocation } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get preferred mode from localStorage or system preference
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      return savedMode === 'true' ? 'dark' : 'light';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  });
  
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(() => {
    // Try to load saved settings from localStorage
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Failed to parse saved accessibility settings', e);
      }
    }
    return {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      keyboardFocusVisible: true,
      fontSizeMultiplier: 1,
    };
  });

  // Create a theme that respects accessibility settings and dark mode
  const theme = React.useMemo(() => {
    const isDarkMode = mode === 'dark';
    let theme = createTheme({
      palette: {
        mode: mode,
        primary: {
          main: accessibilitySettings.highContrast ? '#0000EE' : '#1976d2',
          dark: accessibilitySettings.highContrast ? '#00008B' : '#115293',
          light: accessibilitySettings.highContrast ? '#6666FF' : '#4791db',
          contrastText: '#ffffff',
        },
        secondary: {
          main: accessibilitySettings.highContrast ? '#551A8B' : '#9c27b0',
          dark: accessibilitySettings.highContrast ? '#4B0082' : '#7b1fa2',
          light: accessibilitySettings.highContrast ? '#8A2BE2' : '#ba68c8',
          contrastText: '#ffffff',
        },
        error: {
          main: accessibilitySettings.highContrast ? '#B22222' : '#d32f2f',
        },
        success: {
          main: accessibilitySettings.highContrast ? '#008000' : '#2e7d32',
        },
        background: isDarkMode ? {
          default: '#121212',
          paper: '#1e1e1e',
        } : {
          default: accessibilitySettings.highContrast ? '#FFFFFF' : '#f5f5f5',
          paper: accessibilitySettings.highContrast ? '#FFFFFF' : '#ffffff',
        },
        text: isDarkMode ? {
          primary: '#ffffff',
          secondary: '#b0b0b0',
        } : {
          primary: accessibilitySettings.highContrast ? '#000000' : '#212121',
          secondary: accessibilitySettings.highContrast ? '#444444' : '#757575',
        },
      },
      typography: {
        fontSize: accessibilitySettings.largeText ? 16 : 14,
      },
      components: {
        MuiButton: {
          defaultProps: {
            disableElevation: accessibilitySettings.reducedMotion,
          },
          styleOverrides: {
            root: {
              transition: accessibilitySettings.reducedMotion ? 'none' : undefined,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              transition: accessibilitySettings.reducedMotion ? 'none' : undefined,
            },
          },
        },
        MuiCssBaseline: {
          styleOverrides: {
            '@keyframes pulse': {
              '0%': {
                opacity: 0.6,
                transform: 'scale(1)',
              },
              '50%': {
                opacity: 1,
                transform: 'scale(1.1)',
              },
              '100%': {
                opacity: 0.6,
                transform: 'scale(1)',
              }
            },
            '@keyframes spin': {
              '0%': {
                transform: 'rotate(0deg)',
              },
              '100%': {
                transform: 'rotate(360deg)',
              }
            },
            body: {
              transition: accessibilitySettings.reducedMotion ? 'none' : 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
              '& *': {
                transition: accessibilitySettings.reducedMotion ? 'none !important' : undefined,
                animation: accessibilitySettings.reducedMotion ? 'none !important' : undefined,
              },
            },
            ':focus-visible': {
              outline: accessibilitySettings.keyboardFocusVisible ? '3px solid #1976d2' : 'none',
              outlineOffset: '2px',
            },
          },
        },
      },
    });
    
    // Apply responsive font sizes if largeText is enabled
    if (accessibilitySettings.largeText) {
      theme = responsiveFontSizes(theme);
    }
    
    return theme;
  }, [accessibilitySettings, mode]);

  // Update body classes based on accessibility settings
  useEffect(() => {
    // High contrast mode
    if (accessibilitySettings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Large text mode
    if (accessibilitySettings.largeText) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }
    
    // Reduced motion
    if (accessibilitySettings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
    
    // Keyboard focus visibility
    if (accessibilitySettings.keyboardFocusVisible) {
      document.body.classList.add('keyboard-focus-visible');
    } else {
      document.body.classList.remove('keyboard-focus-visible');
    }
    
    // Set CSS variables
    document.documentElement.style.setProperty(
      '--font-size-multiplier', 
      accessibilitySettings.fontSizeMultiplier.toString()
    );
  }, [accessibilitySettings]);

  // Handle the accessibility settings change
  const handleAccessibilityChange = (settings: AccessibilitySettings) => {
    setAccessibilitySettings(settings);
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  };

  // Handle theme change
  const toggleDarkMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('darkMode', newMode === 'dark' ? 'true' : 'false');
  };

  return (
    <ThemeProvider value={{ isDarkMode: mode === 'dark', toggleDarkMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <ScreenReaderAnnouncer />
        <AuthProvider>
          <SecurityProvider>
            <ATSIntegrationProvider>
              <AdvancedDashboardProvider>
                <AdvancedAnalyticsProvider>
                  <CandidateProvider>
                    <JobPostingProvider>
                      <PipelineProvider>
                        <EvaluationProvider>
                          <ResumeParsingProvider>
                            <AnalyticsProvider>
                              <EmailCampaignProvider>
                                <FormBuilderProvider>
                                  <AppRoutes />
                                </FormBuilderProvider>
                              </EmailCampaignProvider>
                            </AnalyticsProvider>
                          </ResumeParsingProvider>
                        </EvaluationProvider>
                      </PipelineProvider>
                    </JobPostingProvider>
                  </CandidateProvider>
                </AdvancedAnalyticsProvider>
              </AdvancedDashboardProvider>
            </ATSIntegrationProvider>
          </SecurityProvider>
        </AuthProvider>
        
        {/* Skip links for keyboard users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;
