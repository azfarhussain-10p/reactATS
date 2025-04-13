import React, { useState } from 'react';
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
  Snackbar
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
  Timeline as CampaignIcon
} from '@mui/icons-material';

import { useEmailCampaign } from '../contexts/EmailCampaignContext';
import { EmailTrigger, EmailTemplateType, PipelineStage } from '../models/types';

const EmailCampaigns = () => {
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
    getCampaignPerformance
  } = useEmailCampaign();

  // State for active tab
  const [activeTab, setActiveTab] = useState(0);
  
  // State for dialogs
  const [newTemplateDialog, setNewTemplateDialog] = useState(false);
  const [editTemplateDialog, setEditTemplateDialog] = useState<string | null>(null);
  const [newCampaignDialog, setNewCampaignDialog] = useState(false);
  const [campaignDetailsDialog, setCampaignDetailsDialog] = useState<string | null>(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState<{type: 'template' | 'campaign', id: string} | null>(null);
  
  // State for form data
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    type: 'Custom' as EmailTemplateType,
    subject: '',
    body: '',
    isDefault: false
  });
  
  const [campaignFormData, setCampaignFormData] = useState({
    name: '',
    description: '',
    jobId: '',
    active: true
  });
  
  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle template form change
  const handleTemplateFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    
    if (name === 'isDefault') {
      setTemplateFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setTemplateFormData(prev => ({ ...prev, [name as string]: value }));
    }
  };
  
  // Handle campaign form change
  const handleCampaignFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    
    if (name === 'active') {
      setCampaignFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setCampaignFormData(prev => ({ ...prev, [name as string]: value }));
    }
  };
  
  // Open new template dialog
  const handleOpenNewTemplateDialog = () => {
    setTemplateFormData({
      name: '',
      type: 'Custom',
      subject: '',
      body: '',
      isDefault: false
    });
    setNewTemplateDialog(true);
  };
  
  // Open edit template dialog
  const handleOpenEditTemplateDialog = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    setTemplateFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body,
      isDefault: template.isDefault
    });
    
    setEditTemplateDialog(templateId);
  };
  
  // Save template
  const handleSaveTemplate = () => {
    if (!templateFormData.name || !templateFormData.subject || !templateFormData.body) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
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
        isDefault: templateFormData.isDefault
      });
      
      setSnackbar({
        open: true,
        message: 'Template updated successfully',
        severity: 'success'
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
        variables: extractVariables(templateFormData.body)
      });
      
      setSnackbar({
        open: true,
        message: 'Template created successfully',
        severity: 'success'
      });
      
      setNewTemplateDialog(false);
    }
  };
  
  // Extract variables from template body
  const extractVariables = (body: string): string[] => {
    const regex = /{{([^{}]+)}}/g;
    const matches = body.match(regex) || [];
    return [...new Set(matches.map(match => match.slice(2, -2)))];
  };
  
  // Open new campaign dialog
  const handleOpenNewCampaignDialog = () => {
    setCampaignFormData({
      name: '',
      description: '',
      jobId: '',
      active: true
    });
    setNewCampaignDialog(true);
  };
  
  // Save campaign
  const handleSaveCampaign = () => {
    if (!campaignFormData.name) {
      setSnackbar({
        open: true,
        message: 'Please enter a campaign name',
        severity: 'error'
      });
      return;
    }
    
    createCampaign({
      name: campaignFormData.name,
      description: campaignFormData.description,
      jobId: campaignFormData.jobId ? parseInt(campaignFormData.jobId) : undefined,
      active: campaignFormData.active
    });
    
    setSnackbar({
      open: true,
      message: 'Campaign created successfully',
      severity: 'success'
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
      severity: 'success'
    });
  };
  
  // Open campaign details dialog
  const handleOpenCampaignDetails = (campaignId: string) => {
    setCampaignDetailsDialog(campaignId);
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
        severity: success ? 'success' : 'error'
      });
    } else {
      deleteCampaign(confirmDeleteDialog.id);
      
      setSnackbar({
        open: true,
        message: 'Campaign deleted successfully',
        severity: 'success'
      });
    }
    
    setConfirmDeleteDialog(null);
  };
  
  return (
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
      
      {/* Campaigns Tab */}
      {activeTab === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Active Campaigns
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenNewCampaignDialog}
            >
              Create Campaign
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {campaigns.map(campaign => {
              const performance = getCampaignPerformance(campaign.id);
              const steps = getCampaignSteps(campaign.id);
              
              return (
                <Grid item xs={12} md={6} lg={4} key={campaign.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          {campaign.name}
                        </Typography>
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
                        onClick={() => handleOpenCampaignDetails(campaign.id)}
                      >
                        Steps
                      </Button>
                      
                      <Button 
                        size="small" 
                        startIcon={<AnalyticsIcon />}
                        onClick={() => handleOpenCampaignDetails(campaign.id)}
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
                        onClick={() => setConfirmDeleteDialog({ type: 'campaign', id: campaign.id })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
            
            {campaigns.length === 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  No campaigns found. Create your first email campaign by clicking the "Create Campaign" button.
                </Alert>
              </Grid>
            )}
          </Grid>
        </>
      )}
      
      {/* Email Templates Tab */}
      {activeTab === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Email Templates
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenNewTemplateDialog}
            >
              Create Template
            </Button>
          </Box>
          
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
                {templates.map(template => (
                  <TableRow key={template.id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>{template.type}</TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell>
                      {template.isDefault ? <CheckIcon color="success" /> : null}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenEditTemplateDialog(template.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => setConfirmDeleteDialog({ type: 'template', id: template.id })}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                
                {templates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No templates found
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editTemplateDialog ? 'Edit Email Template' : 'Create Email Template'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Email Subject"
                name="subject"
                value={templateFormData.subject}
                onChange={handleTemplateFormChange}
                fullWidth
                required
                helperText="You can use variables like {{candidateName}}, {{jobTitle}}, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Email Body"
                name="body"
                value={templateFormData.body}
                onChange={handleTemplateFormChange}
                multiline
                rows={8}
                fullWidth
                required
                helperText="Use HTML formatting and variables like {{candidateName}}, {{jobTitle}}, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Available Variables:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['candidateName', 'jobTitle', 'companyName', 'recruiterName', 'schedulingLink', 'applicationDate'].map(variable => (
                    <Chip 
                      key={variable} 
                      label={`{{${variable}}}`}
                      size="small"
                      onClick={() => {
                        setTemplateFormData(prev => ({
                          ...prev,
                          body: prev.body + `{{${variable}}}`
                        }));
                      }}
                    />
                  ))}
                </Box>
              </Box>
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
          <Button 
            variant="contained" 
            onClick={handleSaveTemplate}
          >
            Save Template
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
        <DialogTitle>
          Create Email Campaign
        </DialogTitle>
        
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
          <Button onClick={() => setNewCampaignDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveCampaign}
          >
            Create Campaign
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteDialog !== null}
        onClose={() => setConfirmDeleteDialog(null)}
      >
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {confirmDeleteDialog?.type}? This action cannot be undone.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialog(null)}>
            Cancel
          </Button>
          <Button 
            color="error" 
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailCampaigns; 