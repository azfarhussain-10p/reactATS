import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import JobBoard from '../pages/JobBoard';
import CandidatesList from '../pages/CandidatesList';
import CandidateProfile from '../pages/CandidateProfile';
import InterviewScheduler from '../pages/InterviewScheduler';
import AddCandidate from '../pages/AddCandidate';
import CandidateEvaluation from '../pages/CandidateEvaluation';
import RecruitmentPipeline from '../pages/RecruitmentPipeline';
import InterviewerFeedbackForm from '../pages/InterviewerFeedbackForm';
import CandidateRanking from '../pages/CandidateRanking';
import AdvancedAnalytics from '../pages/AdvancedAnalytics';
import Reports from '../pages/Reports';
import ResumeParser from '../pages/ResumeParser';
import SkillsGapAnalysis from '../pages/SkillsGapAnalysis';
import JobDistribution from '../pages/JobDistribution';
import EmailCampaigns from '../pages/EmailCampaigns';
import ApplicationFormBuilder from '../pages/ApplicationFormBuilder';
import StructuredInterviewKitPage from '../pages/StructuredInterviewKitPage';
import DocumentSharingPage from '../pages/DocumentSharingPage';
import Login from '../pages/Login';
import ReportViewer from '../components/ReportViewer';
import DashboardLayout from '../components/DashboardLayout';
import { AccessibilitySettings } from '../components/AccessibilityMenu';
// import Analytics from '../pages/Analytics';

// Force the initial state to false (not authenticated) to ensure login page is shown
localStorage.removeItem('isAuthenticated');

const AppRoutes = () => {
  // Get authentication state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    return authStatus === 'true';
  });

  // Set up a listener for login events
  useEffect(() => {
    const handleStorageChange = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(authStatus === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab authentication updates
    const handleAuthEvent = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(authStatus === 'true');
    };
    
    window.addEventListener('auth-change', handleAuthEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthEvent);
    };
  }, []);
  
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/job-openings" element={<JobBoard />} />
        <Route path="/candidates" element={<CandidatesList />} />
        <Route path="/candidates/:id" element={<CandidateProfile />} />
        <Route path="/candidates/add" element={<AddCandidate />} />
        <Route path="/candidates/rankings" element={<CandidateRanking />} />
        <Route path="/interviews" element={<InterviewScheduler />} />
        <Route path="/interviews/schedule/:id" element={<InterviewScheduler />} />
        <Route path="/recruitment-pipeline" element={<RecruitmentPipeline />} />
        <Route path="/interviews/feedback/:id" element={<InterviewerFeedbackForm />} />
        <Route path="/evaluation/:id" element={<CandidateEvaluation />} />
        <Route path="/analytics" element={<AdvancedAnalytics />} />
        <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/view/:id" element={<ReportViewer />} />
        <Route path="/reports/view" element={<ReportViewer />} />
        <Route path="/resume-parser" element={<ResumeParser />} />
        <Route path="/skills-gap" element={<SkillsGapAnalysis />} />
        <Route path="/job-distribution" element={<JobDistribution />} />
        <Route path="/email-campaigns" element={<EmailCampaigns />} />
        <Route path="/application-forms" element={<ApplicationFormBuilder />} />
        <Route path="/application-forms/edit/:id" element={<ApplicationFormBuilder />} />
        <Route path="/interview-kits" element={<StructuredInterviewKitPage />} />
        <Route path="/document-sharing" element={<DocumentSharingPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes; 