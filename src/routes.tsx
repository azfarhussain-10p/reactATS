/**
 * React ATS Application - Routes Configuration
 * 
 * Copyright (c) 2024-2025 Syed Azfar Hussain - Principal Test Consultant at 10Pearls Pakistan
 * All rights reserved.
 * 
 * Licensed under the terms of 10Pearls proprietary license.
 * Unauthorized copying, redistribution, or use of this file is strictly prohibited.
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import { useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import AuthCheck from './components/AuthCheck';

// Lazy-loaded components for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Candidates = lazy(() => import('./pages/CandidatesList'));
const CandidateDetail = lazy(() => import('./pages/CandidateDetail'));
const AddCandidate = lazy(() => import('./pages/AddCandidate'));
const JobOpenings = lazy(() => import('./pages/JobOpenings'));
const JobDetail = lazy(() => import('./pages/JobBoard'));
const Interviews = lazy(() => import('./pages/InterviewScheduler'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/AdvancedAnalytics'));
const UserManagement = lazy(() => import('./pages/Reports'));
const RecruitmentPipeline = lazy(() => import('./pages/RecruitmentPipeline'));
const ProfilePage = lazy(() => import('./pages/CandidateProfile'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

// Feature pages
const DocumentSharingPage = lazy(() => import('./pages/DocumentSharingPage'));
const SkillsGapAnalysis = lazy(() => import('./pages/SkillsGapAnalysis'));
const EmailCampaigns = lazy(() => import('./pages/EmailCampaigns'));
const StructuredInterviewKitPage = lazy(() => import('./pages/StructuredInterviewKitPage'));
const ResumeParser = lazy(() => import('./pages/ResumeParser'));
const Reports = lazy(() => import('./pages/Reports'));
const JobDistribution = lazy(() => import('./pages/JobDistribution'));

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<AuthCheck />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/candidates/:id" element={<CandidateDetail />} />
            <Route path="/candidates/add" element={<AddCandidate />} />
            <Route path="/job-openings" element={<JobOpenings />} />
            <Route path="/job-openings/:id" element={<JobDetail />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/recruitment-pipeline" element={<RecruitmentPipeline />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Feature routes */}
            <Route path="/document-sharing" element={<DocumentSharingPage />} />
            <Route path="/skills-gap" element={<SkillsGapAnalysis />} />
            <Route path="/email-campaigns" element={<EmailCampaigns />} />
            <Route path="/interview-kits" element={<StructuredInterviewKitPage />} />
            <Route path="/resume-parser" element={<ResumeParser />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/job-distribution" element={<JobDistribution />} />
            
            {/* Admin routes */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/user-management" element={<UserManagement />} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 