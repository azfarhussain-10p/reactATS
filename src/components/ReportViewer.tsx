import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Stack,
  IconButton,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  FileCopy as CopyIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material';
import { useAdvancedDashboard } from '../contexts/AdvancedDashboardContext';

/**
 * Component for running and displaying reports from the AdvancedDashboardContext
 */
const ReportViewer: React.FC<{ reportId?: string }> = ({ reportId }) => {
  const { 
    reports,
    getReportsForRole,
    userRole,
    runReport,
    exportReport
  } = useAdvancedDashboard();

  const [selectedReportId, setSelectedReportId] = useState<string>(reportId || '');
  const [reportParameters, setReportParameters] = useState<Record<string, any>>({});
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availableReports, setAvailableReports] = useState<any[]>([]);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);

  // Get reports available for the current role
  useEffect(() => {
    setAvailableReports(getReportsForRole(userRole));
  }, [userRole, reports, getReportsForRole]);

  // Set the default report if one is passed in props
  useEffect(() => {
    if (reportId) {
      setSelectedReportId(reportId);
      const report = reports.find(r => r.id === reportId);
      if (report) {
        // Initialize with default parameter values
        const defaultParams: Record<string, any> = {};
        report.parameters.forEach(param => {
          if (param.defaultValue !== undefined) {
            defaultParams[param.name] = param.defaultValue;
          }
        });
        setReportParameters(defaultParams);
      }
    }
  }, [reportId, reports]);

  // When selected report changes, reset parameters
  useEffect(() => {
    if (selectedReportId) {
      const report = reports.find(r => r.id === selectedReportId);
      if (report) {
        // Initialize with default parameter values
        const defaultParams: Record<string, any> = {};
        report.parameters.forEach(param => {
          if (param.defaultValue !== undefined) {
            defaultParams[param.name] = param.defaultValue;
          }
        });
        setReportParameters(defaultParams);
      }
      // Reset report data
      setReportData(null);
      setLastRunTime(null);
    }
  }, [selectedReportId, reports]);

  const handleReportChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedReportId(event.target.value as string);
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setReportParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleRunReport = async () => {
    if (!selectedReportId) {
      setError('Please select a report to run');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await runReport(selectedReportId, reportParameters);
      setReportData(result);
      setLastRunTime(new Date());
    } catch (err) {
      setError('Error running report: ' + (err instanceof Error ? err.message : String(err)));
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async (format: 'pdf' | 'csv' | 'excel') => {
    if (!selectedReportId) {
      setError('Please select a report to export');
      return;
    }

    try {
      setIsLoading(true);
      const report = reports.find(r => r.id === selectedReportId);
      
      if (!report) {
        setError('Report not found');
        return;
      }
      
      if (!report.exportFormats.includes(format)) {
        setError(`Export format ${format} not supported for this report`);
        return;
      }
      
      const blob = await exportReport(selectedReportId, format, reportParameters);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error exporting report: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Report Viewer</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="report-select-label">Select Report</InputLabel>
              <Select
                labelId="report-select-label"
                value={selectedReportId}
                label="Select Report"
                onChange={handleReportChange as any}
              >
                <MenuItem value="">
                  <em>Select a report</em>
                </MenuItem>
                {availableReports.map(report => (
                  <MenuItem key={report.id} value={report.id}>
                    {report.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button 
              variant="contained" 
              disabled={!selectedReportId || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
              onClick={handleRunReport}
              sx={{ mr: 2 }}
            >
              Run Report
            </Button>
            
            {selectedReport && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {selectedReport.exportFormats.includes('pdf') && (
                  <Button 
                    variant="outlined" 
                    disabled={isLoading}
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExportReport('pdf')}
                    size="small"
                  >
                    PDF
                  </Button>
                )}
                {selectedReport.exportFormats.includes('csv') && (
                  <Button 
                    variant="outlined" 
                    disabled={isLoading}
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExportReport('csv')}
                    size="small"
                  >
                    CSV
                  </Button>
                )}
                {selectedReport.exportFormats.includes('excel') && (
                  <Button 
                    variant="outlined" 
                    disabled={isLoading}
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExportReport('excel')}
                    size="small"
                  >
                    Excel
                  </Button>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
        
        {selectedReport && selectedReport.parameters.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" sx={{ mb: 2 }}>Report Parameters</Typography>
            
            <Grid container spacing={2}>
              {selectedReport.parameters.map(param => (
                <Grid item xs={12} md={3} key={param.name}>
                  {param.type === 'string' && (
                    <TextField
                      label={param.name}
                      value={reportParameters[param.name] || ''}
                      onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {param.type === 'number' && (
                    <TextField
                      label={param.name}
                      type="number"
                      value={reportParameters[param.name] || ''}
                      onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value))}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {param.type === 'date' && (
                    <TextField
                      label={param.name}
                      type="date"
                      value={reportParameters[param.name] || ''}
                      onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                  {param.type === 'select' && (
                    <FormControl fullWidth size="small">
                      <InputLabel>{param.name}</InputLabel>
                      <Select
                        value={reportParameters[param.name] || ''}
                        label={param.name}
                        onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      >
                        {param.options?.map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      {selectedReport && reportData && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">{selectedReport.name}</Typography>
              {lastRunTime && (
                <Typography variant="body2" color="textSecondary">
                  Last run: {lastRunTime.toLocaleTimeString()} on {lastRunTime.toLocaleDateString()}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {selectedReport.description}
            </Typography>
            
            {/* Report Results Table */}
            <Table size="small">
              <TableHead>
                <TableRow>
                  {Object.keys(reportData[0]).map(key => (
                    <TableCell key={key}>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index}>
                    {Object.entries(row).map(([key, value]) => (
                      <TableCell key={key}>
                        {typeof value === 'number' && key.includes('cost') 
                          ? `$${value.toLocaleString()}`
                          : String(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          
          {/* Summary Cards */}
          <Grid container spacing={3}>
            {/* Department Summary */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Department Summary</Typography>
                  <Box sx={{ mt: 2 }}>
                    {reportData.map((row, index) => (
                      <Box key={index} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{row.department}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {row.positions_filled} positions
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Time to Fill */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Time to Fill</Typography>
                  {reportData.map((row, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2">{row.department}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Box
                          sx={{
                            width: `${Math.min(100, (row.avg_time_to_fill / 40) * 100)}%`,
                            height: 8,
                            bgcolor: 'primary.main',
                            borderRadius: 1,
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2">{row.avg_time_to_fill.toFixed(1)} days</Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Cost Analysis */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Cost Analysis</Typography>
                  {reportData.map((row, index) => (
                    <Box key={index} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">{row.department}</Typography>
                      <Typography variant="body2" color="primary">
                        ${row.cost_per_hire.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Average Cost per Hire</Typography>
                    <Typography variant="body1" color="primary">
                      ${(reportData.reduce((sum, row) => sum + row.cost_per_hire, 0) / reportData.length).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* No report selected or no data yet */}
      {(!selectedReportId || !reportData) && !isLoading && !error && (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <ViewListIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            {!selectedReportId 
              ? 'Select a report from the dropdown to get started' 
              : 'Run the report to view results'}
          </Typography>
        </Paper>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading report data...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReportViewer; 