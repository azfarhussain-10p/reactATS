import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import Routes from './routes/index'
import { AuthProvider } from './contexts/AuthContext'
import { CandidateProvider } from './contexts/CandidateContext'
import { PipelineProvider } from './contexts/PipelineContext'
import { EvaluationProvider } from './contexts/EvaluationContext'
import { AnalyticsProvider } from './contexts/AnalyticsContext'
import { JobPostingProvider } from './contexts/JobPostingContext'
import { ResumeParsingProvider } from './contexts/ResumeParsingContext'
import { StructuredInterviewKitProvider } from './contexts/StructuredInterviewKitContext'
import { CollaborationProvider } from './contexts/CollaborationContext'
import ScreenReaderAnnouncer from './components/ScreenReaderAnnouncer'
import { setupOfflineFormSync } from './utils/offlineFormHandler'

const container = document.getElementById('root')
const root = createRoot(container!)

// Initialize offline form synchronization
setupOfflineFormSync()

root.render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CandidateProvider>
          <PipelineProvider>
            <AnalyticsProvider>
              <EvaluationProvider>
                <JobPostingProvider>
                  <ResumeParsingProvider>
                    <StructuredInterviewKitProvider>
                      <CollaborationProvider>
                        <ScreenReaderAnnouncer />
                        <Routes />
                      </CollaborationProvider>
                    </StructuredInterviewKitProvider>
                  </ResumeParsingProvider>
                </JobPostingProvider>
              </EvaluationProvider>
            </AnalyticsProvider>
          </PipelineProvider>
        </CandidateProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });

  // Handle SW updates
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}
