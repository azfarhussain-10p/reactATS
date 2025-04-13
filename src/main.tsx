import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import Routes from './routes'
import { CandidateProvider } from './contexts/CandidateContext'
import { PipelineProvider } from './contexts/PipelineContext'
import { EvaluationProvider } from './contexts/EvaluationContext'
import { AnalyticsProvider } from './contexts/AnalyticsContext'
import { JobPostingProvider } from './contexts/JobPostingContext'
import { ResumeParsingProvider } from './contexts/ResumeParsingContext'
import { StructuredInterviewKitProvider } from './contexts/StructuredInterviewKitContext'
import { CollaborationProvider } from './contexts/CollaborationContext'

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
  <StrictMode>
    <BrowserRouter>
      <CandidateProvider>
        <PipelineProvider>
          <AnalyticsProvider>
            <EvaluationProvider>
              <JobPostingProvider>
                <ResumeParsingProvider>
                  <StructuredInterviewKitProvider>
                    <CollaborationProvider>
                      <Routes />
                    </CollaborationProvider>
                  </StructuredInterviewKitProvider>
                </ResumeParsingProvider>
              </JobPostingProvider>
            </EvaluationProvider>
          </AnalyticsProvider>
        </PipelineProvider>
      </CandidateProvider>
    </BrowserRouter>
  </StrictMode>,
)
