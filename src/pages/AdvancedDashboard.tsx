import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  CircularProgress,
  Menu,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  TableChart as TableChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  InsertChartOutlined as MetricIcon,
} from '@mui/icons-material';
import { useAdvancedDashboard } from '../contexts/AdvancedDashboardContext';

// Mock component for charts - in a real app, use a charting library like recharts, visx, or nivo
function ChartPlaceholder({
  type,
  title,
  height,
}: {
  type: string;
  title: string;
  height: number;
}) {
  return (
    <Box
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        borderRadius: 1,
        p: 2,
        border: '1px dashed',
        borderColor: 'divider',
      }}
    >
      {type === 'bar' && <BarChartIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />}
      {type === 'line' && <LineChartIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />}
      {type === 'pie' && <PieChartIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />}
      {type === 'table' && <TableChartIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />}
      {type === 'metric' && <MetricIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />}
      <Typography variant="body1" color="textSecondary">
        {title} Chart
      </Typography>
    </Box>
  );
}

// Widget component
function DashboardWidget({
  widget,
  onEdit,
  onDelete,
}: {
  widget: any;
  onEdit: (widgetId: string) => void;
  onDelete: (widgetId: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(widget.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(widget.id);
    handleMenuClose();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={widget.name}
        action={
          <>
            <IconButton aria-label="settings" onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
              <MenuItem onClick={handleEdit}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
              </MenuItem>
              <MenuItem onClick={handleDelete}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ShareIcon fontSize="small" sx={{ mr: 1 }} /> Share
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Export
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <RefreshIcon fontSize="small" sx={{ mr: 1 }} /> Refresh
              </MenuItem>
            </Menu>
          </>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ flexGrow: 1, p: 1 }}>
        {widget.type === 'chart' && (
          <ChartPlaceholder
            type={widget.settings?.chartType || 'bar'}
            title={widget.name}
            height={200}
          />
        )}
        {widget.type === 'metric' && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h3" color="primary" gutterBottom>
              {widget.dataSource === 'open_positions_count'
                ? '24'
                : widget.dataSource === 'time_to_fill'
                  ? '32'
                  : widget.dataSource === 'cost_per_hire'
                    ? '$3,250'
                    : '42'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {widget.name}
            </Typography>
            {widget.settings?.showTrend && (
              <Chip label="+12% vs previous period" color="success" size="small" sx={{ mt: 1 }} />
            )}
          </Box>
        )}
        {widget.type === 'table' && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Department</TableCell>
                <TableCell align="right">Positions</TableCell>
                <TableCell align="right">Time to Fill</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Engineering</TableCell>
                <TableCell align="right">12</TableCell>
                <TableCell align="right">34 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Marketing</TableCell>
                <TableCell align="right">5</TableCell>
                <TableCell align="right">28 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sales</TableCell>
                <TableCell align="right">8</TableCell>
                <TableCell align="right">23 days</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AdvancedDashboard() {
  const {
    dashboards,
    currentDashboard,
    setCurrentDashboard,
    userRole,
    setUserRole,
    getDashboardsForRole,
    createDashboard,
    addWidget,
    removeWidget,
    calculateCostPerHire,
    calculateROI,
    getTopPerformingRecruiters,
  } = useAdvancedDashboard();

  const [availableDashboards, setAvailableDashboards] = useState<any[]>([]);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
  const [isCreateDashboardDialogOpen, setIsCreateDashboardDialogOpen] = useState(false);
  const [newDashboardForm, setNewDashboardForm] = useState({
    name: '',
    description: '',
    isDefault: false,
    role: '',
  });
  const [newWidgetForm, setNewWidgetForm] = useState({
    name: '',
    type: 'chart',
    dataSource: '',
    chartType: 'bar',
  });

  useEffect(() => {
    // Get dashboards available for the current role
    setAvailableDashboards(getDashboardsForRole(userRole));
  }, [userRole, dashboards, getDashboardsForRole]);

  const handleRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setUserRole(event.target.value as string);
  };

  const handleDashboardChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCurrentDashboard(event.target.value as string);
  };

  const handleCreateDashboard = () => {
    createDashboard({
      name: newDashboardForm.name,
      description: newDashboardForm.description,
      isDefault: newDashboardForm.isDefault,
      widgets: [],
      createdBy: userRole,
      role: newDashboardForm.role || undefined,
    });
    setIsCreateDashboardDialogOpen(false);
    setNewDashboardForm({
      name: '',
      description: '',
      isDefault: false,
      role: '',
    });
  };

  const handleAddWidget = () => {
    if (!currentDashboard) return;

    addWidget(currentDashboard.id, {
      name: newWidgetForm.name,
      type: newWidgetForm.type as any,
      dataSource: newWidgetForm.dataSource,
      settings: {
        chartType: newWidgetForm.chartType,
        showLegend: true,
        colors: ['#1976d2', '#2196f3', '#64b5f6', '#bbdefb'],
        showTrend: true,
      },
      position: {
        x: 0,
        y: 0,
        width: 6,
        height: 4,
      },
      permissions: [userRole],
    });
    setIsAddWidgetDialogOpen(false);
    setNewWidgetForm({
      name: '',
      type: 'chart',
      dataSource: '',
      chartType: 'bar',
    });
  };

  const handleEditWidget = (widgetId: string) => {
    // In a real app, implement widget editing logic
    console.log('Edit widget:', widgetId);
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!currentDashboard) return;
    removeWidget(currentDashboard.id, widgetId);
  };

  // Placeholders for key metrics
  const costPerHire = calculateCostPerHire();
  const roi = calculateROI();
  const topRecruiters = getTopPerformingRecruiters(3);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Advanced Analytics Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="user-role-label">Role</InputLabel>
            <Select
              labelId="user-role-label"
              value={userRole}
              label="Role"
              onChange={handleRoleChange as any}
              size="small"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="recruiter">Recruiter</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="dashboard-select-label">Dashboard</InputLabel>
            <Select
              labelId="dashboard-select-label"
              value={currentDashboard?.id || ''}
              label="Dashboard"
              onChange={handleDashboardChange as any}
              size="small"
            >
              {availableDashboards.map((dash) => (
                <MenuItem key={dash.id} value={dash.id}>
                  {dash.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDashboardDialogOpen(true)}
          >
            New Dashboard
          </Button>
        </Box>
      </Box>

      {currentDashboard && (
        <>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Box>
              <Typography variant="h5">{currentDashboard.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {currentDashboard.description}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsAddWidgetDialogOpen(true)}
            >
              Add Widget
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Key Metrics */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Key Recruitment Metrics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="body2" color="textSecondary">
                        Average Cost per Hire
                      </Typography>
                      <Typography variant="h4" color="primary">
                        ${costPerHire.toFixed(0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="body2" color="textSecondary">
                        Time to Fill (Days)
                      </Typography>
                      <Typography variant="h4" color="primary">
                        32
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="body2" color="textSecondary">
                        ROI
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {roi.roi.toFixed(1)}x
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="body2" color="textSecondary">
                        Cost Savings
                      </Typography>
                      <Typography variant="h4" color="primary">
                        ${(roi.costSavings / 1000).toFixed(0)}K
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Dashboard Widgets */}
            {currentDashboard.widgets.map((widget, index) => (
              <Grid item key={widget.id} xs={12} md={widget.position.width >= 6 ? 6 : 4}>
                <DashboardWidget
                  widget={widget}
                  onEdit={handleEditWidget}
                  onDelete={handleDeleteWidget}
                />
              </Grid>
            ))}

            {/* Add placeholder widgets if no widgets exist */}
            {currentDashboard.widgets.length === 0 && (
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title="Time to Fill by Department" />
                    <CardContent>
                      <ChartPlaceholder type="bar" title="Time to Fill" height={250} />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title="Hiring by Source" />
                    <CardContent>
                      <ChartPlaceholder type="pie" title="Hiring Sources" height={250} />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title="Top Performers" />
                    <CardContent>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Recruiter</TableCell>
                            <TableCell align="right">Hires</TableCell>
                            <TableCell align="right">TTF</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {topRecruiters.map((recruiter) => (
                            <TableRow key={recruiter.recruiterId}>
                              <TableCell>{recruiter.recruiterName}</TableCell>
                              <TableCell align="right">
                                {recruiter.metrics.candidatesHired}
                              </TableCell>
                              <TableCell align="right">
                                {recruiter.metrics.timeToFill.toFixed(1)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title="Offer Acceptance Rate" />
                    <CardContent>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h3" color="primary" gutterBottom>
                          78%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Last 30 days
                        </Typography>
                        <Chip
                          label="+5% vs previous period"
                          color="success"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title="Active Requisitions" />
                    <CardContent>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h3" color="primary" gutterBottom>
                          24
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Open positions
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Chip label="Engineering: 10" size="small" />
                          <Chip label="Marketing: 5" size="small" />
                          <Chip label="Sales: 9" size="small" />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>
        </>
      )}

      {/* Create Dashboard Dialog */}
      <Dialog
        open={isCreateDashboardDialogOpen}
        onClose={() => setIsCreateDashboardDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Dashboard</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Dashboard Name"
            fullWidth
            variant="outlined"
            value={newDashboardForm.name}
            onChange={(e) => setNewDashboardForm({ ...newDashboardForm, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newDashboardForm.description}
            onChange={(e) =>
              setNewDashboardForm({ ...newDashboardForm, description: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Specific to Role (Optional)</InputLabel>
            <Select
              value={newDashboardForm.role}
              label="Specific to Role (Optional)"
              onChange={(e) =>
                setNewDashboardForm({ ...newDashboardForm, role: e.target.value as string })
              }
            >
              <MenuItem value="">
                <em>None (Available to all)</em>
              </MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="recruiter">Recruiter</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={newDashboardForm.isDefault}
              onChange={(e) =>
                setNewDashboardForm({ ...newDashboardForm, isDefault: e.target.checked })
              }
              id="default-dashboard-checkbox"
            />
            <InputLabel htmlFor="default-dashboard-checkbox" sx={{ ml: 1 }}>
              Set as default dashboard
            </InputLabel>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDashboardDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateDashboard}
            disabled={!newDashboardForm.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Widget Dialog */}
      <Dialog
        open={isAddWidgetDialogOpen}
        onClose={() => setIsAddWidgetDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Widget</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Widget Name"
            fullWidth
            variant="outlined"
            value={newWidgetForm.name}
            onChange={(e) => setNewWidgetForm({ ...newWidgetForm, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Widget Type</InputLabel>
            <Select
              value={newWidgetForm.type}
              label="Widget Type"
              onChange={(e) =>
                setNewWidgetForm({ ...newWidgetForm, type: e.target.value as string })
              }
            >
              <MenuItem value="chart">Chart</MenuItem>
              <MenuItem value="metric">Metric/KPI</MenuItem>
              <MenuItem value="table">Table</MenuItem>
              <MenuItem value="list">List</MenuItem>
            </Select>
          </FormControl>

          {newWidgetForm.type === 'chart' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={newWidgetForm.chartType}
                label="Chart Type"
                onChange={(e) =>
                  setNewWidgetForm({ ...newWidgetForm, chartType: e.target.value as string })
                }
              >
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
                <MenuItem value="area">Area Chart</MenuItem>
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Data Source</InputLabel>
            <Select
              value={newWidgetForm.dataSource}
              label="Data Source"
              onChange={(e) =>
                setNewWidgetForm({ ...newWidgetForm, dataSource: e.target.value as string })
              }
            >
              <MenuItem value="time_to_hire_department">Time to Hire by Department</MenuItem>
              <MenuItem value="open_positions_count">Open Positions Count</MenuItem>
              <MenuItem value="cost_per_hire">Cost per Hire</MenuItem>
              <MenuItem value="recruiter_velocity">Recruiter Performance</MenuItem>
              <MenuItem value="source_effectiveness">Source Effectiveness</MenuItem>
              <MenuItem value="candidate_pipeline">Candidate Pipeline</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddWidgetDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddWidget}
            disabled={!newWidgetForm.name || !newWidgetForm.dataSource}
          >
            Add Widget
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdvancedDashboard;
