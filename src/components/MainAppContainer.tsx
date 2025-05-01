import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Container } from '@mui/material';
import CustomizableDashboard from './CustomizableDashboard';
import CostPerHireAnalytics from './CostPerHireAnalytics';
import CRMIntegration from './CRMIntegration';
import AdvancedAnalyticsIntegration from './AdvancedAnalyticsIntegration';
import StructuredInterviewKit from './StructuredInterviewKit';
import ReportBuilder from './ReportBuilder';

// Providers
import { AdvancedAnalyticsProvider } from '../contexts/AdvancedAnalyticsContext';
import { AdvancedDashboardProvider } from '../contexts/AdvancedDashboardContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import { CRMProvider } from '../contexts/CRMContext';
import { TalentPoolSegmentationProvider } from '../contexts/TalentPoolSegmentationContext';
import { CandidateRelationshipProvider } from '../contexts/CandidateRelationshipContext';
import { RecruiterPerformanceAnalyticsProvider } from '../contexts/RecruiterPerformanceAnalyticsContext';
import { StructuredInterviewKitProvider } from '../contexts/StructuredInterviewKitContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Add a new tab panel for Structured Interview Kit
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

// Main application container that demonstrates all new features
const MainAppContainer: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const [analyticsTabValue, setAnalyticsTabValue] = React.useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAnalyticsTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setAnalyticsTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container>
          <Typography variant="h4" component="h1" sx={{ my: 3 }}>
            React ATS - Enhanced Features
          </Typography>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="application features"
            sx={{ mb: 2 }}
          >
            <Tab label="Customizable Dashboards" {...a11yProps(0)} />
            <Tab label="Cost Per Hire Analytics" {...a11yProps(1)} />
            <Tab label="CRM Features" {...a11yProps(2)} />
            <Tab label="Advanced Analytics" {...a11yProps(3)} />
            <Tab label="Structured Interview Kit" {...a11yProps(4)} />
          </Tabs>
        </Container>
      </Box>

      <Container>
        {/* Wrap each tab panel in necessary providers */}
        <TabPanel value={tabValue} index={0}>
          <AdvancedDashboardProvider>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Customizable Dashboards for Different User Roles
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Create and customize dashboards tailored to specific user roles. Drag and drop
              widgets, configure metrics, and save personalized views.
            </Typography>
            <CustomizableDashboard />
          </AdvancedDashboardProvider>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AnalyticsProvider>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Cost Per Hire Calculation and Analysis
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Track and analyze recruitment costs with detailed breakdowns by department, role, and
              cost category. Compare against industry benchmarks and historical trends.
            </Typography>
            <CostPerHireAnalytics />
          </AnalyticsProvider>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <CRMProvider>
            <TalentPoolSegmentationProvider>
              <CandidateRelationshipProvider>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Advanced CRM Functionalities
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Our enhanced CRM system includes:
                </Typography>
                <Box component="ul" sx={{ mb: 3, pl: 4 }}>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Talent Pool Segmentation:</strong> Create and manage dynamic candidate
                      segments
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Candidate Relationship Tracking:</strong> Monitor all touchpoints and
                      engagement levels
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Automated Nurture Campaigns:</strong> Design multi-step candidate
                      engagement flows
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Event Management:</strong> Organize and track recruitment events
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Engagement Scoring:</strong> Quantify and analyze candidate engagement
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Referral Program Management:</strong> Track and incentivize employee
                      referrals
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Alumni Network Tracking:</strong> Stay connected with former employees
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>External CRM Integration:</strong> Connect with systems like
                      Salesforce, HubSpot, etc.
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                  Note: This tab demonstrates the architecture and integration points for the CRM
                  features. The actual UI components would be implemented based on specific design
                  requirements.
                </Typography>
                <CRMIntegration />
              </CandidateRelationshipProvider>
            </TalentPoolSegmentationProvider>
          </CRMProvider>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <AnalyticsProvider>
            <AdvancedAnalyticsProvider>
              <RecruiterPerformanceAnalyticsProvider>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Advanced Analytics and Reporting
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Our enhanced analytics system includes:
                </Typography>
                <Box component="ul" sx={{ mb: 3, pl: 4 }}>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Customizable Dashboards:</strong> Role-specific analytics views
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Cost-per-hire Calculations:</strong> Detailed cost tracking and
                      analysis
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Recruiter Performance Analytics:</strong> Measure and optimize
                      recruiter effectiveness
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Custom Report Builder:</strong> Create and export tailored reports
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs
                    value={analyticsTabValue}
                    onChange={handleAnalyticsTabChange}
                    aria-label="analytics features"
                  >
                    <Tab label="Overview" />
                    <Tab label="Report Builder" />
                  </Tabs>
                </Box>

                <Box role="tabpanel" hidden={analyticsTabValue !== 0}>
                  {analyticsTabValue === 0 && (
                    <>
                      <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                        This tab demonstrates the architecture and integration points for the
                        advanced analytics features. The actual UI components would be implemented
                        based on specific design requirements.
                      </Typography>
                      <AdvancedAnalyticsIntegration />
                    </>
                  )}
                </Box>

                <Box role="tabpanel" hidden={analyticsTabValue !== 1}>
                  {analyticsTabValue === 1 && (
                    <AdvancedDashboardProvider>
                      <ReportBuilder />
                    </AdvancedDashboardProvider>
                  )}
                </Box>
              </RecruiterPerformanceAnalyticsProvider>
            </AdvancedAnalyticsProvider>
          </AnalyticsProvider>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <StructuredInterviewKitProvider>
            <Box sx={{ my: 2 }}>
              <Typography variant="h5" gutterBottom>
                Structured Interview Kit
              </Typography>
              <Typography paragraph>
                Create and manage standardized interview kits to ensure consistent candidate
                evaluation
              </Typography>
              <StructuredInterviewKit standalone={true} />
            </Box>
          </StructuredInterviewKitProvider>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default MainAppContainer;
