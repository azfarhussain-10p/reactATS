import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
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
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import NotFound from '../pages/NotFound';
import Settings from '../pages/Settings';
import ReportViewer from '../components/ReportViewer';
import DashboardLayout from '../components/DashboardLayout';
import SecureRoute from '../components/SecureRoute';
import { useAuth } from '../contexts/AuthContext';
import TaskDemo from '../pages/TaskDemo';
// Import Career page components
import CareerPage from '../components/career/CareerPage';
import JobDetailPage from '../components/career/JobDetailPage';

// Define roles and permissions for routes
const ROLES = {
  ADMIN: 'admin',
  RECRUITER: 'recruiter',
  INTERVIEWER: 'interviewer',
  HIRING_MANAGER: 'hiring_manager',
  CANDIDATE: 'candidate',
};

const PERMISSIONS = {
  VIEW_CANDIDATES: 'view:candidates',
  EDIT_CANDIDATES: 'edit:candidates',
  DELETE_CANDIDATES: 'delete:candidates',
  VIEW_JOBS: 'view:jobs',
  EDIT_JOBS: 'edit:jobs',
  VIEW_REPORTS: 'view:reports',
  ADMIN_PANEL: 'admin:panel',
  MANAGE_USERS: 'manage:users',
  MANAGE_SETTINGS: 'manage:settings',
  SCHEDULE_INTERVIEWS: 'schedule:interviews',
  CONDUCT_INTERVIEWS: 'conduct:interviews',
  MANAGE_EVALUATIONS: 'manage:evaluations',
  VIEW_ANALYTICS: 'view:analytics',
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  // If auth is loading, show a simple loading indicator
  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Public Career Pages */}
      <Route path="/careers" element={<CareerPage />} />
      <Route path="/careers/job/:id" element={<JobDetailPage />} />
      <Route path="/career" element={<Navigate to="/careers" replace />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <SecureRoute>
            <DashboardLayout />
          </SecureRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard - accessible to all authenticated users */}
        <Route
          path="/dashboard"
          element={
            <SecureRoute>
              <Dashboard />
            </SecureRoute>
          }
        />

        {/* Job management routes - restricted by role/permission */}
        <Route
          path="/job-openings"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.VIEW_JOBS]}
              requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}
            >
              <JobBoard />
            </SecureRoute>
          }
        />

        {/* Candidate management routes */}
        <Route
          path="/candidates"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.VIEW_CANDIDATES]}
              requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}
            >
              <CandidatesList />
            </SecureRoute>
          }
        />

        <Route
          path="/candidates/:id"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.VIEW_CANDIDATES]}
              requiredRoles={[
                ROLES.ADMIN,
                ROLES.RECRUITER,
                ROLES.HIRING_MANAGER,
                ROLES.INTERVIEWER,
              ]}
            >
              <CandidateProfile />
            </SecureRoute>
          }
        />

        <Route
          path="/candidates/add"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.EDIT_CANDIDATES]}
              requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER]}
            >
              <AddCandidate />
            </SecureRoute>
          }
        />

        <Route
          path="/candidates/rankings"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.VIEW_CANDIDATES]}
              requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}
            >
              <CandidateRanking />
            </SecureRoute>
          }
        />

        {/* Interview management routes */}
        <Route
          path="/interviews"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.SCHEDULE_INTERVIEWS]}
              requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}
            >
              <InterviewScheduler />
            </SecureRoute>
          }
        />

        <Route
          path="/interviews/schedule/:id"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.SCHEDULE_INTERVIEWS]}
              requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}
            >
              <InterviewScheduler />
            </SecureRoute>
          }
        />

        <Route
          path="/interviews/feedback/:id"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.CONDUCT_INTERVIEWS]}
              requiredRoles={[
                ROLES.ADMIN,
                ROLES.RECRUITER,
                ROLES.HIRING_MANAGER,
                ROLES.INTERVIEWER,
              ]}
            >
              <InterviewerFeedbackForm />
            </SecureRoute>
          }
        />

        {/* Evaluation routes */}
        <Route
          path="/evaluation/:id"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.MANAGE_EVALUATIONS]}
              requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}
            >
              <CandidateEvaluation />
            </SecureRoute>
          }
        />

        {/* Pipeline management */}
        <Route
          path="/recruitment-pipeline"
          element={
            <SecureRoute requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}>
              <RecruitmentPipeline />
            </SecureRoute>
          }
        />

        <Route
          path="/pipeline"
          element={
            <SecureRoute requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}>
              <RecruitmentPipeline />
            </SecureRoute>
          }
        />

        {/* Analytics and reports */}
        <Route
          path="/analytics"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.VIEW_ANALYTICS]}
              requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}
            >
              <AdvancedAnalytics />
            </SecureRoute>
          }
        />

        <Route
          path="/advanced-analytics"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.VIEW_ANALYTICS]}
              requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}
            >
              <AdvancedAnalytics />
            </SecureRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}
              requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}
            >
              <Reports />
            </SecureRoute>
          }
        />

        <Route
          path="/reports/view/:id"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}
              requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}
            >
              <ReportViewer />
            </SecureRoute>
          }
        />

        <Route
          path="/reports/view"
          element={
            <SecureRoute
              requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}
              requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}
            >
              <ReportViewer />
            </SecureRoute>
          }
        />

        {/* Advanced tools - admin, recruiter only */}
        <Route
          path="/resume-parser"
          element={
            <SecureRoute requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER]}>
              <ResumeParser />
            </SecureRoute>
          }
        />

        <Route
          path="/skills-gap"
          element={
            <SecureRoute requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}>
              <SkillsGapAnalysis />
            </SecureRoute>
          }
        />

        <Route
          path="/job-distribution"
          element={
            <SecureRoute requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER]}>
              <JobDistribution />
            </SecureRoute>
          }
        />

        <Route
          path="/email-campaigns"
          element={
            <SecureRoute requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER]}>
              <EmailCampaigns />
            </SecureRoute>
          }
        />

        <Route
          path="/application-forms"
          element={
            <SecureRoute requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER]}>
              <ApplicationFormBuilder />
            </SecureRoute>
          }
        />

        <Route
          path="/application-forms/edit/:id"
          element={
            <SecureRoute requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER]}>
              <ApplicationFormBuilder />
            </SecureRoute>
          }
        />

        <Route
          path="/interview-kits"
          element={
            <SecureRoute requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}>
              <StructuredInterviewKitPage />
            </SecureRoute>
          }
        />

        <Route
          path="/document-sharing"
          element={
            <SecureRoute
              requiredRoles={[
                ROLES.ADMIN,
                ROLES.RECRUITER,
                ROLES.HIRING_MANAGER,
                ROLES.INTERVIEWER,
              ]}
            >
              <DocumentSharingPage />
            </SecureRoute>
          }
        />

        <Route
          path="/task-demo"
          element={
            <SecureRoute requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}>
              <TaskDemo />
            </SecureRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <SecureRoute requiredRoles={[ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]}>
              <Settings />
            </SecureRoute>
          }
        />

        {/* Default redirect for unknown routes inside dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Global 404 page for unknown routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
