import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import Routes from './routes'
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

const container = document.getElementById('root')
const root = createRoot(container!)

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
