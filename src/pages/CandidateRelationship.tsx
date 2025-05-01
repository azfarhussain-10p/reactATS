import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Mail as MailIcon,
  Call as CallIcon,
  Event as EventIcon,
  Group as GroupIcon,
  PersonAdd as ReferralIcon,
  LinkedIn as LinkedInIcon,
  Cached as SyncIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  BusinessCenter as BusinessCenterIcon,
} from '@mui/icons-material';
import { useCRM } from '../contexts/CRMContext';

// Tab panel component
function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`crm-tabpanel-${index}`}
      aria-labelledby={`crm-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `crm-tab-${index}`,
    'aria-controls': `crm-tabpanel-${index}`,
  };
}

const CandidateRelationship: React.FC = () => {
  const {
    talentPools,
    nurtureCampaigns,
    recruitmentEvents,
    referrals,
    alumniNetwork,
    externalIntegrations,
    createTalentPool,
    createCampaign,
    createEvent,
  } = useCRM();

  const [tabValue, setTabValue] = useState(0);
  const [isNewPoolDialogOpen, setIsNewPoolDialogOpen] = useState(false);
  const [isNewCampaignDialogOpen, setIsNewCampaignDialogOpen] = useState(false);
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);

  // Form states
  const [newPoolForm, setNewPoolForm] = useState({
    name: '',
    description: '',
    criteria: {},
  });

  const [newCampaignForm, setNewCampaignForm] = useState({
    name: '',
    description: '',
    status: 'draft' as const,
  });

  const [newEventForm, setNewEventForm] = useState({
    name: '',
    description: '',
    type: 'career_fair' as const,
    location: '',
    virtual: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'planned' as const,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateTalentPool = () => {
    createTalentPool(newPoolForm);
    setIsNewPoolDialogOpen(false);
    setNewPoolForm({ name: '', description: '', criteria: {} });
  };

  const handleCreateCampaign = () => {
    createCampaign({
      ...newCampaignForm,
      targetAudience: { criteria: {} },
      steps: [],
    });
    setIsNewCampaignDialogOpen(false);
    setNewCampaignForm({ name: '', description: '', status: 'draft' });
  };

  const handleCreateEvent = () => {
    createEvent({
      ...newEventForm,
      startDate: new Date(newEventForm.startDate),
      endDate: new Date(newEventForm.endDate),
    });
    setIsNewEventDialogOpen(false);
    setNewEventForm({
      name: '',
      description: '',
      type: 'career_fair',
      location: '',
      virtual: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: 'planned',
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="CRM Tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Talent Pools" icon={<GroupIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab
            label="Nurture Campaigns"
            icon={<MailIcon />}
            iconPosition="start"
            {...a11yProps(1)}
          />
          <Tab
            label="Recruitment Events"
            icon={<EventIcon />}
            iconPosition="start"
            {...a11yProps(2)}
          />
          <Tab
            label="Referral Program"
            icon={<ReferralIcon />}
            iconPosition="start"
            {...a11yProps(3)}
          />
          <Tab
            label="Alumni Network"
            icon={<SchoolIcon />}
            iconPosition="start"
            {...a11yProps(4)}
          />
          <Tab label="Integrations" icon={<SyncIcon />} iconPosition="start" {...a11yProps(5)} />
        </Tabs>
      </Box>

      {/* Talent Pools Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Talent Pools</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsNewPoolDialogOpen(true)}
          >
            Create Talent Pool
          </Button>
        </Box>

        <Grid container spacing={3}>
          {talentPools.length > 0 ? (
            talentPools.map((pool) => (
              <Grid item xs={12} md={6} lg={4} key={pool.id}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {pool.name}
                      </Typography>
                      <Chip
                        label={`${pool.candidateCount} candidates`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {pool.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button size="small" startIcon={<MailIcon />}>
                        Message
                      </Button>
                      <Button size="small" startIcon={<EditIcon />}>
                        Edit
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No talent pools created yet. Create your first talent pool to segment candidates.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Nurture Campaigns Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Nurture Campaigns</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsNewCampaignDialogOpen(true)}
          >
            Create Campaign
          </Button>
        </Box>

        <Grid container spacing={3}>
          {nurtureCampaigns.length > 0 ? (
            nurtureCampaigns.map((campaign) => (
              <Grid item xs={12} md={6} key={campaign.id}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {campaign.name}
                      </Typography>
                      <Chip
                        label={campaign.status}
                        color={
                          campaign.status === 'active'
                            ? 'success'
                            : campaign.status === 'paused'
                              ? 'warning'
                              : campaign.status === 'completed'
                                ? 'info'
                                : 'default'
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {campaign.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Enrolled: {campaign.metrics.candidatesEnrolled} candidates
                      </Typography>
                      <Typography variant="caption" display="block" gutterBottom>
                        Engagement: {(campaign.metrics.engagementRate * 100).toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={campaign.metrics.engagementRate * 100}
                        sx={{ height: 5, borderRadius: 5 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        size="small"
                        color={campaign.status === 'active' ? 'warning' : 'success'}
                      >
                        {campaign.status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                      <Button size="small" startIcon={<EditIcon />}>
                        Edit
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No nurture campaigns created yet. Create your first campaign to automate candidate
                  engagement.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Recruitment Events Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Recruitment Events</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsNewEventDialogOpen(true)}
          >
            Create Event
          </Button>
        </Box>

        <Grid container spacing={3}>
          {recruitmentEvents.length > 0 ? (
            recruitmentEvents.map((event) => (
              <Grid item xs={12} md={6} key={event.id}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {event.name}
                      </Typography>
                      <Chip
                        label={event.status}
                        color={
                          event.status === 'active'
                            ? 'success'
                            : event.status === 'completed'
                              ? 'info'
                              : event.status === 'cancelled'
                                ? 'error'
                                : 'default'
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {event.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {new Date(event.startDate).toLocaleDateString()} - {event.location}
                      {event.virtual && ' (Virtual)'}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={2}>
                        <Typography variant="caption">
                          Registered: {event.metrics.registrationCount}
                        </Typography>
                        <Typography variant="caption">
                          Attended: {event.metrics.attendanceCount}
                        </Typography>
                        <Typography variant="caption">
                          Hired: {event.metrics.hiringConversions}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button size="small" startIcon={<PersonIcon />}>
                        Attendees
                      </Button>
                      <Button size="small" startIcon={<EditIcon />}>
                        Edit
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No recruitment events created yet. Create your first event to engage with
                  candidates.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Referral Program Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Referral Program</Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Referral
          </Button>
        </Box>

        {referrals.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Referrer</TableCell>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date Referred</TableCell>
                  <TableCell>Reward Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>{referral.referrerName}</TableCell>
                    <TableCell>{referral.candidateName}</TableCell>
                    <TableCell>{referral.jobTitle || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={referral.status}
                        color={
                          referral.status === 'hired'
                            ? 'success'
                            : referral.status === 'rejected'
                              ? 'error'
                              : referral.status === 'interviewing'
                                ? 'info'
                                : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(referral.dateReferred).toLocaleDateString()}</TableCell>
                    <TableCell>{referral.reward?.status || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton size="small" aria-label="edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No referrals recorded yet. Start adding candidate referrals from your employees.
            </Typography>
          </Paper>
        )}
      </TabPanel>

      {/* Alumni Network Tab */}
      <TabPanel value={tabValue} index={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Alumni Network</Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Alumni
          </Button>
        </Box>

        <Grid container spacing={3}>
          {alumniNetwork.length > 0 ? (
            alumniNetwork.map((alumnus) => (
              <Grid item xs={12} md={4} key={alumnus.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>{alumnus.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {alumnus.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {alumnus.previousRole}, {alumnus.department}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Current:</strong> {alumnus.currentRole || 'Unknown'} at{' '}
                      {alumnus.currentCompany || 'Unknown'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Engagement:
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={alumnus.engagementScore * 10}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          flexGrow: 1,
                          backgroundColor: 'grey.300',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button size="small" startIcon={<MailIcon />}>
                        Contact
                      </Button>
                      <IconButton size="small" aria-label="LinkedIn">
                        <LinkedInIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No alumni in the network yet. Start adding former employees to build your alumni
                  network.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* External Integrations Tab */}
      <TabPanel value={tabValue} index={5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">External CRM Integrations</Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Integration
          </Button>
        </Box>

        <Grid container spacing={3}>
          {externalIntegrations.length > 0 ? (
            externalIntegrations.map((integration) => (
              <Grid item xs={12} md={6} key={integration.id}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {integration.name}
                      </Typography>
                      <Chip
                        label={integration.status}
                        color={
                          integration.status === 'active'
                            ? 'success'
                            : integration.status === 'error'
                              ? 'error'
                              : 'default'
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Type: {integration.type.charAt(0).toUpperCase() + integration.type.slice(1)}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Last synced: {new Date(integration.lastSync).toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button size="small" startIcon={<SyncIcon />}>
                        Sync Now
                      </Button>
                      <Button size="small" startIcon={<EditIcon />}>
                        Configure
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No external integrations configured yet. Connect with your existing CRM systems.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Dialogs */}
      {/* New Talent Pool Dialog */}
      <Dialog open={isNewPoolDialogOpen} onClose={() => setIsNewPoolDialogOpen(false)}>
        <DialogTitle>Create New Talent Pool</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Pool Name"
            fullWidth
            variant="outlined"
            value={newPoolForm.name}
            onChange={(e) => setNewPoolForm({ ...newPoolForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newPoolForm.description}
            onChange={(e) => setNewPoolForm({ ...newPoolForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewPoolDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTalentPool} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Campaign Dialog */}
      <Dialog open={isNewCampaignDialogOpen} onClose={() => setIsNewCampaignDialogOpen(false)}>
        <DialogTitle>Create New Nurture Campaign</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Campaign Name"
            fullWidth
            variant="outlined"
            value={newCampaignForm.name}
            onChange={(e) => setNewCampaignForm({ ...newCampaignForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newCampaignForm.description}
            onChange={(e) =>
              setNewCampaignForm({ ...newCampaignForm, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewCampaignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCampaign} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Event Dialog */}
      <Dialog open={isNewEventDialogOpen} onClose={() => setIsNewEventDialogOpen(false)}>
        <DialogTitle>Create New Recruitment Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Name"
            fullWidth
            variant="outlined"
            value={newEventForm.name}
            onChange={(e) => setNewEventForm({ ...newEventForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newEventForm.description}
            onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={newEventForm.type}
              label="Event Type"
              onChange={(e) => setNewEventForm({ ...newEventForm, type: e.target.value as any })}
            >
              <MenuItem value="career_fair">Career Fair</MenuItem>
              <MenuItem value="webinar">Webinar</MenuItem>
              <MenuItem value="workshop">Workshop</MenuItem>
              <MenuItem value="interview_day">Interview Day</MenuItem>
              <MenuItem value="networking">Networking Event</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            variant="outlined"
            value={newEventForm.location}
            onChange={(e) => setNewEventForm({ ...newEventForm, location: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={newEventForm.virtual}
                  onChange={(e) => setNewEventForm({ ...newEventForm, virtual: e.target.checked })}
                />
              }
              label="Virtual Event"
            />
          </FormGroup>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={newEventForm.startDate}
              onChange={(e) => setNewEventForm({ ...newEventForm, startDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={newEventForm.endDate}
              onChange={(e) => setNewEventForm({ ...newEventForm, endDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewEventDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateEvent} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CandidateRelationship;
