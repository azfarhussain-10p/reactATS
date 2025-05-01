import React, { useState, Component, ErrorInfo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Badge,
  Alert,
  Snackbar,
  Container,
  InputAdornment,
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  FileCopy as DuplicateIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  Done as CheckIcon,
  MoreVert as MoreVertIcon,
  BarChart as AnalyticsIcon,
  FormatListBulleted as StepsIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
  Mail as TemplateIcon,
  Timeline as CampaignIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

import { useEmailCampaign } from '../contexts/EmailCampaignContext';
import { EmailCampaignProvider } from '../contexts/EmailCampaignContext';
import { EmailTrigger, EmailTemplateType, PipelineStage } from '../models/types';

// Component to format template variables
const FormattedTemplateText = ({ text }: { text: string }) => {
  return (
    <>
      {text.split(/(\{\{[^}]+\}\})/).map((part, index) => {
        if (part.match(/\{\{[^}]+\}\}/)) {
          // Extract variable name without brackets
          const variableName = part.replace(/\{\{|\}\}/g, '');
          return (
            <Chip
              key={index}
              label={variableName}
              size="small"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                height: '22px',
                backgroundColor: 'primary.50',
                color: 'primary.dark',
                mx: 0.5,
                fontWeight: 'medium',
                border: '1px solid',
                borderColor: 'primary.100',
              }}
            />
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" component="div">
              Something went wrong loading the Email Campaigns
            </Typography>
            <Typography variant="body1">
              {this.state.errorMessage || 'Please try refreshing the page or contact support.'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Alert>
        </Container>
      );
    }
    return this.props.children;
  }
}

const EmailCampaigns = () => {
  // Local state to track context errors
  const [contextError, setContextError] = useState<string | null>(null);

  // Safely get email campaign context with fallbacks
  let emailCampaign;

  try {
    emailCampaign = useEmailCampaign();
  } catch (error) {
    console.warn('Email Campaign context not available:', error);
    setContextError('Email Campaign context not available');

    // Create fallback functionality
    emailCampaign = {
      templates: [],
      campaigns: [],
      createTemplate: () => ({
        id: '',
        name: '',
        type: 'Custom',
        subject: '',
        body: '',
        variables: [],
        isDefault: false,
        createdAt: '',
        updatedAt: '',
      }),
      updateTemplate: () => undefined,
      deleteTemplate: () => false,
      getCampaignById: () => undefined,
      createCampaign: () => ({
        id: '',
        name: '',
        description: '',
        active: false,
        steps: [],
        createdAt: '',
        updatedAt: '',
        stats: { totalSent: 0, opens: 0, clicks: 0, responses: 0 },
      }),
      updateCampaign: () => undefined,
      deleteCampaign: () => false,
      activateCampaign: () => false,
      deactivateCampaign: () => false,
      getCampaignSteps: () => [],
      addCampaignStep: () => ({
        id: '',
        campaignId: '',
        order: 0,
        trigger: 'Manual',
        templateId: '',
        active: false,
        personalized: false,
      }),
      updateCampaignStep: () => undefined,
      deleteCampaignStep: () => false,
      reorderCampaignSteps: () => false,
      emailLogs: [],
      getEmailLogsByCampaign: () => [],
      getEmailLogsByCandidate: () => [],
      createEmailLog: () => ({
        id: '',
        campaignId: '',
        stepId: '',
        templateId: '',
        candidateId: 0,
        to: '',
        subject: '',
        body: '',
        status: 'Draft',
        sentAt: '',
        createdAt: '',
      }),
      updateEmailLogStatus: () => undefined,
      previewEmail: () => ({ subject: '', body: '' }),
      sendTestEmail: async () => false,
      processEmailTriggers: async () => 0,
      getCampaignPerformance: () => ({
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        responseRate: 0,
        stepPerformance: [],
      }),
    };
  }

  const {
    templates,
    campaigns,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    activateCampaign,
    deactivateCampaign,
    getCampaignSteps,
    addCampaignStep,
    getCampaignPerformance,
  } = emailCampaign;

  // State for active tab
  const [activeTab, setActiveTab] = useState(0);

  // State for dialogs
  const [newTemplateDialog, setNewTemplateDialog] = useState(false);
  const [editTemplateDialog, setEditTemplateDialog] = useState<string | null>(null);
  const [newCampaignDialog, setNewCampaignDialog] = useState(false);
  const [campaignDetailsDialog, setCampaignDetailsDialog] = useState<string | null>(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState<{
    type: 'template' | 'campaign';
    id: string;
  } | null>(null);
  const [analyticsDialog, setAnalyticsDialog] = useState<string | null>(null);
  const [stepsDialog, setStepsDialog] = useState<string | null>(null);
  const [templatePreviewDialog, setTemplatePreviewDialog] = useState<string | null>(null);

  // State for search/filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');

  // State for form data
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    type: 'Custom' as EmailTemplateType,
    subject: '',
    body: '',
    isDefault: false,
  });

  const [campaignFormData, setCampaignFormData] = useState({
    name: '',
    description: '',
    jobId: '',
    active: true,
  });

  // State for template preview
  const [previewData, setPreviewData] = useState({
    candidateName: 'John Doe',
    jobTitle: 'Software Engineer',
    companyName: 'Tech Solutions Inc.',
    recruiterName: 'Jane Smith',
    schedulingLink: 'https://calendly.com/example',
    applicationDate: new Date().toLocaleDateString(),
  });

  // Variables organized by categories
  const variableCategories = [
    {
      name: 'Candidate',
      variables: ['candidateName', 'email', 'phone', 'applicationDate'],
    },
    {
      name: 'Job',
      variables: ['jobTitle', 'jobId', 'department', 'location'],
    },
    {
      name: 'Company',
      variables: ['companyName', 'companyAddress', 'websiteUrl'],
    },
    {
      name: 'Recruiter',
      variables: ['recruiterName', 'recruiterEmail', 'recruiterPhone', 'schedulingLink'],
    },
  ];

  // Filtered templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'All' || template.type === filterType;

    return matchesSearch && matchesType;
  });

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle template form change
  const handleTemplateFormChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value, checked } = e.target as HTMLInputElement;

    if (name === 'isDefault') {
      setTemplateFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setTemplateFormData((prev) => ({ ...prev, [name as string]: value }));
    }
  };

  // Handle campaign form change
  const handleCampaignFormChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value, checked } = e.target as HTMLInputElement;

    if (name === 'active') {
      setCampaignFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setCampaignFormData((prev) => ({ ...prev, [name as string]: value }));
    }
  };

  // Open new template dialog
  const handleOpenNewTemplateDialog = () => {
    setTemplateFormData({
      name: '',
      type: 'Custom',
      subject: '',
      body: '',
      isDefault: false,
    });
    setNewTemplateDialog(true);
  };

  // Open edit template dialog
  const handleOpenEditTemplateDialog = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setTemplateFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body,
      isDefault: template.isDefault,
    });

    setEditTemplateDialog(templateId);
  };

  // Save template
  const handleSaveTemplate = () => {
    if (!templateFormData.name || !templateFormData.subject || !templateFormData.body) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error',
      });
      return;
    }

    if (editTemplateDialog) {
      // Update existing template
      updateTemplate(editTemplateDialog, {
        name: templateFormData.name,
        type: templateFormData.type,
        subject: templateFormData.subject,
        body: templateFormData.body,
        isDefault: templateFormData.isDefault,
      });

      setSnackbar({
        open: true,
        message: 'Template updated successfully',
        severity: 'success',
      });

      setEditTemplateDialog(null);
    } else {
      // Create new template
      createTemplate({
        name: templateFormData.name,
        type: templateFormData.type,
        subject: templateFormData.subject,
        body: templateFormData.body,
        isDefault: templateFormData.isDefault,
        variables: extractVariables(templateFormData.body),
      });

      setSnackbar({
        open: true,
        message: 'Template created successfully',
        severity: 'success',
      });

      setNewTemplateDialog(false);
    }
  };

  // Extract variables from template body
  const extractVariables = (body: string): string[] => {
    const regex = /{{([^{}]+)}}/g;
    const matches = body.match(regex) || [];
    return [...new Set(matches.map((match) => match.slice(2, -2)))];
  };

  // Open new campaign dialog
  const handleOpenNewCampaignDialog = () => {
    setCampaignFormData({
      name: '',
      description: '',
      jobId: '',
      active: true,
    });
    setNewCampaignDialog(true);
  };

  // Save campaign
  const handleSaveCampaign = () => {
    if (!campaignFormData.name) {
      setSnackbar({
        open: true,
        message: 'Please enter a campaign name',
        severity: 'error',
      });
      return;
    }

    createCampaign({
      name: campaignFormData.name,
      description: campaignFormData.description,
      jobId: campaignFormData.jobId ? parseInt(campaignFormData.jobId) : undefined,
      active: campaignFormData.active,
    });

    setSnackbar({
      open: true,
      message: 'Campaign created successfully',
      severity: 'success',
    });

    setNewCampaignDialog(false);
  };

  // Toggle campaign active status
  const handleToggleCampaignStatus = (campaignId: string, currentStatus: boolean) => {
    if (currentStatus) {
      deactivateCampaign(campaignId);
    } else {
      activateCampaign(campaignId);
    }

    setSnackbar({
      open: true,
      message: `Campaign ${currentStatus ? 'paused' : 'activated'} successfully`,
      severity: 'success',
    });
  };

  // Open campaign details dialog
  const handleOpenCampaignDetails = (campaignId: string) => {
    setCampaignDetailsDialog(campaignId);
  };

  // Open campaign analytics dialog
  const handleOpenAnalyticsDialog = (campaignId: string) => {
    setAnalyticsDialog(campaignId);
  };

  // Open campaign steps dialog
  const handleOpenStepsDialog = (campaignId: string) => {
    setStepsDialog(campaignId);
  };

  // Delete template or campaign
  const handleConfirmDelete = () => {
    if (!confirmDeleteDialog) return;

    if (confirmDeleteDialog.type === 'template') {
      const success = deleteTemplate(confirmDeleteDialog.id);

      setSnackbar({
        open: true,
        message: success
          ? 'Template deleted successfully'
          : 'Cannot delete template that is in use',
        severity: success ? 'success' : 'error',
      });
    } else {
      deleteCampaign(confirmDeleteDialog.id);

      setSnackbar({
        open: true,
        message: 'Campaign deleted successfully',
        severity: 'success',
      });
    }

    setConfirmDeleteDialog(null);
  };

  // Duplicate template
  const handleDuplicateTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const newTemplate = createTemplate({
      name: `${template.name} (Copy)`,
      type: template.type,
      subject: template.subject,
      body: template.body,
      isDefault: false,
      variables: template.variables,
    });

    setSnackbar({
      open: true,
      message: 'Template duplicated successfully',
      severity: 'success',
    });
  };

  // Preview template with sample data
  const handlePreviewTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setTemplatePreviewDialog(templateId);
  };

  // Apply template variables to content
  const applyVariables = (content: string, data: Record<string, string>) => {
    let result = content;

    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });

    return result;
  };

  return (
    <Box>
      {contextError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {contextError} - Some features may be limited. Please refresh the page or contact support
          if this persists.
        </Alert>
      )}

      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Email Campaigns
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Campaigns" />
            <Tab label="Email Templates" />
          </Tabs>
        </Box>

        {/* Search and filter bar */}
        <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
          <TextField
            placeholder={`Search ${activeTab === 0 ? 'campaigns' : 'templates'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            variant="outlined"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {activeTab === 1 && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Template Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Template Type"
              >
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="ApplicationConfirmation">Application Confirmation</MenuItem>
                <MenuItem value="InterviewInvitation">Interview Invitation</MenuItem>
                <MenuItem value="InterviewReminder">Interview Reminder</MenuItem>
                <MenuItem value="InterviewFollowUp">Interview Follow-Up</MenuItem>
                <MenuItem value="OfferLetter">Offer Letter</MenuItem>
                <MenuItem value="RejectionLetter">Rejection Letter</MenuItem>
                <MenuItem value="OnboardingInstructions">Onboarding Instructions</MenuItem>
                <MenuItem value="Custom">Custom</MenuItem>
              </Select>
            </FormControl>
          )}

          <Button
            variant="contained"
            startIcon={activeTab === 0 ? <CampaignIcon /> : <TemplateIcon />}
            onClick={activeTab === 0 ? handleOpenNewCampaignDialog : handleOpenNewTemplateDialog}
          >
            {activeTab === 0 ? 'New Campaign' : 'New Template'}
          </Button>
        </Box>

        {/* Campaigns Tab */}
        {activeTab === 0 && (
          <>
            <Grid container spacing={3}>
              {filteredCampaigns.map((campaign) => {
                const performance = getCampaignPerformance(campaign.id);
                const steps = getCampaignSteps(campaign.id);

                return (
                  <Grid item xs={12} md={6} lg={4} key={campaign.id}>
                    <Card>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6">{campaign.name}</Typography>
                          <Chip
                            label={campaign.active ? 'Active' : 'Paused'}
                            color={campaign.active ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {campaign.description}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Tooltip title="Number of steps">
                            <Chip
                              icon={<StepsIcon />}
                              label={steps.length}
                              variant="outlined"
                              size="small"
                            />
                          </Tooltip>

                          <Tooltip title="Emails sent">
                            <Chip
                              icon={<SendIcon />}
                              label={campaign.stats.totalSent}
                              variant="outlined"
                              size="small"
                            />
                          </Tooltip>

                          <Tooltip title="Open rate">
                            <Chip
                              icon={<EmailIcon />}
                              label={`${Math.round(performance.openRate * 100)}%`}
                              variant="outlined"
                              size="small"
                            />
                          </Tooltip>
                        </Box>
                      </CardContent>

                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<StepsIcon />}
                          onClick={() => handleOpenStepsDialog(campaign.id)}
                        >
                          Steps
                        </Button>

                        <Button
                          size="small"
                          startIcon={<AnalyticsIcon />}
                          onClick={() => handleOpenAnalyticsDialog(campaign.id)}
                        >
                          Analytics
                        </Button>

                        <Box sx={{ flexGrow: 1 }} />

                        <IconButton
                          size="small"
                          onClick={() => handleToggleCampaignStatus(campaign.id, campaign.active)}
                        >
                          {campaign.active ? <PauseIcon /> : <StartIcon />}
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() =>
                            setConfirmDeleteDialog({ type: 'campaign', id: campaign.id })
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}

              {filteredCampaigns.length === 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    {searchTerm
                      ? 'No campaigns found matching your search.'
                      : 'No campaigns found. Create your first email campaign by clicking the "New Campaign" button.'}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {/* Email Templates Tab */}
        {activeTab === 1 && (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Default</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{template.type}</TableCell>
                      <TableCell>
                        <FormattedTemplateText text={template.subject} />
                      </TableCell>
                      <TableCell>
                        {template.isDefault ? <CheckIcon color="success" /> : null}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Template">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditTemplateDialog(template.id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Preview Template">
                          <IconButton
                            size="small"
                            onClick={() => handlePreviewTemplate(template.id)}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Duplicate Template">
                          <IconButton
                            size="small"
                            onClick={() => handleDuplicateTemplate(template.id)}
                          >
                            <DuplicateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Template">
                          <IconButton
                            size="small"
                            onClick={() =>
                              setConfirmDeleteDialog({ type: 'template', id: template.id })
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredTemplates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {searchTerm || filterType !== 'All'
                          ? 'No templates found matching your filters.'
                          : 'No templates found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* New/Edit Template Dialog */}
        <Dialog
          open={newTemplateDialog || editTemplateDialog !== null}
          onClose={() => {
            setNewTemplateDialog(false);
            setEditTemplateDialog(null);
          }}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            {editTemplateDialog ? 'Edit Email Template' : 'Create Email Template'}
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                {/* Template Editor Form */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Template Name"
                      name="name"
                      value={templateFormData.name}
                      onChange={handleTemplateFormChange}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Template Type</InputLabel>
                      <Select
                        name="type"
                        value={templateFormData.type}
                        onChange={handleTemplateFormChange as any}
                        label="Template Type"
                      >
                        <MenuItem value="ApplicationConfirmation">
                          Application Confirmation
                        </MenuItem>
                        <MenuItem value="InterviewInvitation">Interview Invitation</MenuItem>
                        <MenuItem value="InterviewReminder">Interview Reminder</MenuItem>
                        <MenuItem value="InterviewFollowUp">Interview Follow-Up</MenuItem>
                        <MenuItem value="OfferLetter">Offer Letter</MenuItem>
                        <MenuItem value="RejectionLetter">Rejection Letter</MenuItem>
                        <MenuItem value="OnboardingInstructions">Onboarding Instructions</MenuItem>
                        <MenuItem value="Custom">Custom</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Email Subject
                    </Typography>
                    <TextField
                      placeholder="Enter subject line with variables like {'{{candidateName}}'}"
                      name="subject"
                      value={templateFormData.subject}
                      onChange={handleTemplateFormChange}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: templateFormData.subject && (
                          <InputAdornment position="start">
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', maxWidth: '100%' }}>
                              <FormattedTemplateText text={templateFormData.subject} />
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                      // Hide the actual input text as we'll show the formatted version
                      sx={{
                        '& .MuiInputBase-input': templateFormData.subject
                          ? {
                              opacity: 0,
                              height: 0,
                              p: 0,
                            }
                          : {},
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        You can use variables like {'{{candidateName}}'}, {'{{jobTitle}}'}, etc.
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => setTemplateFormData((prev) => ({ ...prev, subject: '' }))}
                        sx={{ minWidth: 'auto', p: 0, fontSize: '0.75rem' }}
                      >
                        Clear
                      </Button>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: 'info.50',
                          border: '1px solid',
                          borderColor: 'info.100',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" color="info.dark">
                          <strong>Using Template Variables</strong>
                        </Typography>
                        <Typography variant="body2" color="info.dark" sx={{ mt: 1 }}>
                          Variables are placeholders that get replaced with actual data when the
                          email is sent. To use a variable, enclose it in double curly braces like:{' '}
                          <code>{'{{variableName}}'}</code>
                        </Typography>
                        <Typography variant="body2" color="info.dark" sx={{ mt: 1 }}>
                          Click on any variable in the sidebar to insert it at the current cursor
                          position.
                        </Typography>
                      </Paper>
                    </Box>

                    <Typography variant="subtitle2" gutterBottom>
                      Email Body
                    </Typography>
                    <TextField
                      name="body"
                      value={templateFormData.body}
                      onChange={handleTemplateFormChange}
                      multiline
                      rows={12}
                      fullWidth
                      required
                      placeholder="Enter your email content here. Use HTML for formatting and {'{{variables}}'} for dynamic content."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={templateFormData.isDefault}
                          onChange={handleTemplateFormChange}
                          name="isDefault"
                        />
                      }
                      label="Set as default template for this type"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                {/* Right Side: Variable picker and live preview */}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Available Variables
                      </Typography>

                      <Tabs value={0} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
                        {variableCategories.map((category, index) => (
                          <Tab key={index} label={category.name} />
                        ))}
                      </Tabs>

                      {variableCategories.map((category, categoryIndex) => (
                        <Box
                          key={categoryIndex}
                          sx={{ mb: 2, display: categoryIndex === 0 ? 'block' : 'none' }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mb: 1, display: 'block' }}
                          >
                            {category.name} Variables
                          </Typography>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {category.variables.map((variable) => (
                              <Chip
                                key={variable}
                                label={`{{${variable}}}`}
                                size="small"
                                sx={{
                                  m: 0.5,
                                  fontFamily: 'monospace',
                                  fontWeight: 'medium',
                                  cursor: 'pointer',
                                  bgcolor: 'primary.50',
                                  '&:hover': {
                                    bgcolor: 'primary.100',
                                  },
                                }}
                                onClick={() => {
                                  setTemplateFormData((prev) => ({
                                    ...prev,
                                    body: prev.body + `{{${variable}}}`,
                                  }));
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      ))}

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Live Preview
                      </Typography>

                      <Paper
                        sx={{
                          p: 2,
                          mb: 2,
                          maxHeight: 400,
                          overflow: 'auto',
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          Subject: {applyVariables(templateFormData.subject, previewData)}
                        </Typography>

                        <Divider sx={{ my: 1 }} />

                        <Box sx={{ mt: 2 }}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: applyVariables(templateFormData.body, previewData),
                            }}
                          />
                        </Box>
                      </Paper>

                      <Typography variant="caption" color="text.secondary">
                        *This is a preview with sample data. The actual email may look different.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => {
                setNewTemplateDialog(false);
                setEditTemplateDialog(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveTemplate}>
              Save Template
            </Button>
          </DialogActions>
        </Dialog>

        {/* Template Preview Dialog */}
        <Dialog
          open={templatePreviewDialog !== null}
          onClose={() => setTemplatePreviewDialog(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Template Preview</DialogTitle>

          <DialogContent>
            {templatePreviewDialog &&
              (() => {
                const template = templates.find((t) => t.id === templatePreviewDialog);
                if (!template) return null;

                return (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        {template.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Type: {template.type}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                    </Box>

                    <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Original Subject:
                        </Typography>
                        <Box sx={{ p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                          <FormattedTemplateText text={template.subject} />
                        </Box>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Rendered Subject:
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {applyVariables(template.subject, previewData)}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Email Body:
                        </Typography>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: applyVariables(template.body, previewData),
                          }}
                        />
                      </Box>
                    </Paper>

                    <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Sample Data Used:
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(previewData).map(([key, value]) => (
                          <Grid item xs={6} key={key}>
                            <Typography variant="body2">
                              <strong>{key}:</strong> {value}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </>
                );
              })()}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setTemplatePreviewDialog(null)}>Close</Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => {
                if (templatePreviewDialog) {
                  handleOpenEditTemplateDialog(templatePreviewDialog);
                  setTemplatePreviewDialog(null);
                }
              }}
            >
              Edit Template
            </Button>
          </DialogActions>
        </Dialog>

        {/* New Campaign Dialog */}
        <Dialog
          open={newCampaignDialog}
          onClose={() => setNewCampaignDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create Email Campaign</DialogTitle>

          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Campaign Name"
                  name="name"
                  value={campaignFormData.name}
                  onChange={handleCampaignFormChange}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={campaignFormData.description}
                  onChange={handleCampaignFormChange}
                  multiline
                  rows={2}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Job ID (Optional)"
                  name="jobId"
                  value={campaignFormData.jobId}
                  onChange={handleCampaignFormChange}
                  fullWidth
                  helperText="Leave blank to apply to all jobs"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={campaignFormData.active}
                      onChange={handleCampaignFormChange}
                      name="active"
                    />
                  }
                  label="Activate campaign immediately"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setNewCampaignDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveCampaign}>
              Create Campaign
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Delete Dialog */}
        <Dialog open={confirmDeleteDialog !== null} onClose={() => setConfirmDeleteDialog(null)}>
          <DialogTitle>Confirm Delete</DialogTitle>

          <DialogContent>
            <Typography>
              Are you sure you want to delete this {confirmDeleteDialog?.type}? This action cannot
              be undone.
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setConfirmDeleteDialog(null)}>Cancel</Button>
            <Button color="error" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Campaign Steps Dialog */}
        <Dialog
          open={stepsDialog !== null}
          onClose={() => setStepsDialog(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Campaign Steps</DialogTitle>

          <DialogContent>
            {stepsDialog && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {campaigns.find((c) => c.id === stepsDialog)?.name || 'Campaign Steps'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure the sequence of emails to be sent in this campaign
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </Box>

                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell width="5%">Order</TableCell>
                        <TableCell width="25%">Trigger</TableCell>
                        <TableCell width="30%">Template</TableCell>
                        <TableCell width="15%">Delay</TableCell>
                        <TableCell width="10%">Active</TableCell>
                        <TableCell width="15%">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getCampaignSteps(stepsDialog).length > 0 ? (
                        getCampaignSteps(stepsDialog).map((step, index) => (
                          <TableRow key={step.id}>
                            <TableCell>
                              <Typography fontWeight="bold">{index + 1}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={step.trigger}
                                size="small"
                                sx={{
                                  bgcolor:
                                    step.trigger === 'ApplicationReceived'
                                      ? 'primary.light'
                                      : step.trigger === 'SpecificStage'
                                        ? 'secondary.light'
                                        : 'default',
                                  fontWeight: 'medium',
                                }}
                              />
                              {step.trigger === 'SpecificStage' && step.triggerSpecifics?.stage && (
                                <Typography variant="caption" display="block" mt={0.5}>
                                  Stage: {step.triggerSpecifics.stage}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {templates.find((t) => t.id === step.templateId)?.name ||
                                'Unknown Template'}
                            </TableCell>
                            <TableCell>
                              {step.triggerSpecifics?.delayDays
                                ? `${step.triggerSpecifics.delayDays} days`
                                : 'No delay'}
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={step.active}
                                size="small"
                                onChange={() => {
                                  setSnackbar({
                                    open: true,
                                    message:
                                      'Status toggled - This feature will be fully functional in the next release',
                                    severity: 'info',
                                  });
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Edit Step">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSnackbar({
                                      open: true,
                                      message:
                                        'Edit step functionality will be available in the next release',
                                      severity: 'info',
                                    });
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Step">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSnackbar({
                                      open: true,
                                      message:
                                        'Delete step functionality will be available in the next release',
                                      severity: 'info',
                                    });
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Box sx={{ py: 2 }}>
                              <Typography variant="body1" color="text.secondary" gutterBottom>
                                No steps defined for this campaign yet
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Add steps to define when emails should be sent to candidates
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Quick Guide: Campaign Steps
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Steps are executed in order when trigger conditions are met
                    <br />
                    • Each step uses an email template from your template library
                    <br />
                    • You can add delays to space out communication with candidates
                    <br />• Disable individual steps without removing them from the sequence
                  </Typography>
                </Paper>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={() => {
                    setSnackbar({
                      open: true,
                      message: 'Step creation will be available in the next release',
                      severity: 'info',
                    });
                  }}
                >
                  Add Campaign Step
                </Button>
              </>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setStepsDialog(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Campaign Analytics Dialog */}
        <Dialog
          open={analyticsDialog !== null}
          onClose={() => setAnalyticsDialog(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Campaign Analytics</DialogTitle>

          <DialogContent>
            {analyticsDialog && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {campaigns.find((c) => c.id === analyticsDialog)?.name || 'Campaign Analytics'}
                  </Typography>
                  <Divider />
                </Box>

                {(() => {
                  const performance = getCampaignPerformance(analyticsDialog);
                  return (
                    <>
                      <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Delivery Rate
                            </Typography>
                            <Typography variant="h4">
                              {Math.round(performance.deliveryRate * 100)}%
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Open Rate
                            </Typography>
                            <Typography variant="h4">
                              {Math.round(performance.openRate * 100)}%
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Click Rate
                            </Typography>
                            <Typography variant="h4">
                              {Math.round(performance.clickRate * 100)}%
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Response Rate
                            </Typography>
                            <Typography variant="h4">
                              {Math.round(performance.responseRate * 100)}%
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      <Typography variant="h6" gutterBottom>
                        Step Performance
                      </Typography>

                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Step</TableCell>
                              <TableCell align="right">Sent</TableCell>
                              <TableCell align="right">Opened</TableCell>
                              <TableCell align="right">Clicked</TableCell>
                              <TableCell align="right">Responded</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {performance.stepPerformance.length > 0 ? (
                              performance.stepPerformance.map((step) => (
                                <TableRow key={step.stepId}>
                                  <TableCell>{step.name}</TableCell>
                                  <TableCell align="right">{step.sent}</TableCell>
                                  <TableCell align="right">
                                    {step.opened} (
                                    {step.sent > 0
                                      ? Math.round((step.opened / step.sent) * 100)
                                      : 0}
                                    %)
                                  </TableCell>
                                  <TableCell align="right">
                                    {step.clicked} (
                                    {step.sent > 0
                                      ? Math.round((step.clicked / step.sent) * 100)
                                      : 0}
                                    %)
                                  </TableCell>
                                  <TableCell align="right">
                                    {step.responded} (
                                    {step.sent > 0
                                      ? Math.round((step.responded / step.sent) * 100)
                                      : 0}
                                    %)
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} align="center">
                                  No data available for this campaign yet
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  );
                })()}
              </>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setAnalyticsDialog(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

// Wrapper component to ensure all necessary providers are available
function EmailCampaignsWithProvider() {
  return (
    <ErrorBoundary>
      <EmailCampaignProvider>
        <EmailCampaigns />
      </EmailCampaignProvider>
    </ErrorBoundary>
  );
}

export default EmailCampaignsWithProvider;
