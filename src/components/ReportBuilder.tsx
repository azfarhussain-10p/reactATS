import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  MoveUp as MoveUpIcon,
  MoveDown as MoveDownIcon,
  FormatAlignLeft as FormatIcon,
} from '@mui/icons-material';
import { useAdvancedDashboard } from '../contexts/AdvancedDashboardContext';

// Types
interface DataField {
  id: string;
  name: string;
  label: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  table: string;
}

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  conjunction?: 'AND' | 'OR';
}

interface CustomReport {
  id?: string;
  name: string;
  description: string;
  selectedFields: string[];
  filters: FilterCondition[];
  sortBy: string[];
  groupBy: string[];
  isPublic: boolean;
}

const MENU_ITEM_HEIGHT = 48;
const MENU_ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: MENU_ITEM_HEIGHT * 4.5 + MENU_ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Sample available fields - in a real app this would come from an API
const availableFields: DataField[] = [
  {
    id: 'candidate_name',
    name: 'candidate_name',
    label: 'Candidate Name',
    dataType: 'string',
    table: 'candidates',
  },
  { id: 'job_title', name: 'job_title', label: 'Job Title', dataType: 'string', table: 'jobs' },
  {
    id: 'department',
    name: 'department',
    label: 'Department',
    dataType: 'string',
    table: 'departments',
  },
  {
    id: 'application_date',
    name: 'application_date',
    label: 'Application Date',
    dataType: 'date',
    table: 'applications',
  },
  { id: 'status', name: 'status', label: 'Status', dataType: 'string', table: 'applications' },
  { id: 'salary', name: 'salary', label: 'Salary', dataType: 'number', table: 'offers' },
  { id: 'source', name: 'source', label: 'Source', dataType: 'string', table: 'candidates' },
  {
    id: 'time_to_hire',
    name: 'time_to_hire',
    label: 'Time to Hire (days)',
    dataType: 'number',
    table: 'metrics',
  },
  {
    id: 'cost_per_hire',
    name: 'cost_per_hire',
    label: 'Cost per Hire',
    dataType: 'number',
    table: 'metrics',
  },
  {
    id: 'interview_score',
    name: 'interview_score',
    label: 'Interview Score',
    dataType: 'number',
    table: 'interviews',
  },
  {
    id: 'is_active',
    name: 'is_active',
    label: 'Is Active',
    dataType: 'boolean',
    table: 'candidates',
  },
];

const operatorOptions = {
  string: ['equals', 'contains', 'starts with', 'ends with', 'is empty', 'is not empty'],
  number: ['equals', 'greater than', 'less than', 'between', 'is empty', 'is not empty'],
  date: ['equals', 'after', 'before', 'between', 'is empty', 'is not empty'],
  boolean: ['is true', 'is false'],
};

const ReportBuilder: React.FC = () => {
  const { reports, userRole } = useAdvancedDashboard();

  // State
  const [activeStep, setActiveStep] = useState(0);
  const [report, setReport] = useState<CustomReport>({
    name: '',
    description: '',
    selectedFields: [],
    filters: [],
    sortBy: [],
    groupBy: [],
    isPublic: false,
  });
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Function to handle field selection
  const handleFieldSelection = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setReport({
      ...report,
      selectedFields: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Function to add a new filter
  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: `filter-${Date.now()}`,
      field: '',
      operator: '',
      value: '',
      conjunction: report.filters.length > 0 ? 'AND' : undefined,
    };

    setReport({
      ...report,
      filters: [...report.filters, newFilter],
    });
  };

  // Function to update a filter
  const updateFilter = (id: string, key: keyof FilterCondition, value: any) => {
    setReport({
      ...report,
      filters: report.filters.map((filter) =>
        filter.id === id ? { ...filter, [key]: value } : filter
      ),
    });
  };

  // Function to remove a filter
  const removeFilter = (id: string) => {
    setReport({
      ...report,
      filters: report.filters.filter((filter) => filter.id !== id),
    });
  };

  // Handle sort order changes
  const handleSortSelection = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setReport({
      ...report,
      sortBy: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Handle group by changes
  const handleGroupSelection = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setReport({
      ...report,
      groupBy: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Navigate steps
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Preview report
  const handlePreviewReport = () => {
    // Simulate fetching preview data
    // In a real app, this would call an API with the report definition
    const mockData = [
      {
        candidate_name: 'John Doe',
        job_title: 'Software Engineer',
        department: 'Engineering',
        application_date: '2023-04-15',
        status: 'Hired',
        cost_per_hire: 4500,
      },
      {
        candidate_name: 'Jane Smith',
        job_title: 'Product Manager',
        department: 'Product',
        application_date: '2023-05-22',
        status: 'Interviewing',
        cost_per_hire: 0,
      },
      {
        candidate_name: 'Mike Johnson',
        job_title: 'UX Designer',
        department: 'Design',
        application_date: '2023-03-10',
        status: 'Hired',
        cost_per_hire: 3800,
      },
    ];

    setPreviewData(mockData);
    setIsPreviewOpen(true);
  };

  // Save report
  const handleSaveReport = async () => {
    setIsSaving(true);

    // In a real app, this would call an API to save the report
    setTimeout(() => {
      // Simulate saving
      console.log('Saving report:', report);
      setIsSaving(false);
      // After successful save, we could redirect or show a success message
    }, 1000);
  };

  // Define the steps for the report builder
  const steps = ['Basic Information', 'Select Fields', 'Add Filters', 'Configure Display'];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Custom Report Builder
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Create custom reports by selecting fields, adding filters, and configuring display
          options.
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Basic Information */}
        {activeStep === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Report Name"
                  value={report.name}
                  onChange={(e) => setReport({ ...report, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={report.description}
                  onChange={(e) => setReport({ ...report, description: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={report.isPublic}
                      onChange={(e) => setReport({ ...report, isPublic: e.target.checked })}
                    />
                  }
                  label="Make this report available to all users"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 2: Select Fields */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Fields to Include
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="field-select-label">Fields</InputLabel>
              <Select
                labelId="field-select-label"
                multiple
                value={report.selectedFields}
                onChange={handleFieldSelection}
                input={<OutlinedInput label="Fields" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const field = availableFields.find((f) => f.id === value);
                      return <Chip key={value} label={field?.label || value} />;
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {availableFields.map((field) => (
                  <MenuItem key={field.id} value={field.id}>
                    <Checkbox checked={report.selectedFields.indexOf(field.id) > -1} />
                    <ListItemText
                      primary={field.label}
                      secondary={`${field.table} (${field.dataType})`}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {report.selectedFields.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Selected Fields:
                </Typography>
                <Grid container spacing={1}>
                  {report.selectedFields.map((fieldId) => {
                    const field = availableFields.find((f) => f.id === fieldId);
                    return (
                      <Grid item key={fieldId}>
                        <Chip
                          label={field?.label || fieldId}
                          onDelete={() => {
                            setReport({
                              ...report,
                              selectedFields: report.selectedFields.filter((id) => id !== fieldId),
                            });
                          }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
          </Box>
        )}

        {/* Step 3: Add Filters */}
        {activeStep === 2 && (
          <Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">Filters</Typography>
              <Button startIcon={<AddIcon />} onClick={addFilter} variant="outlined">
                Add Filter
              </Button>
            </Box>

            {report.filters.length === 0 ? (
              <Typography color="textSecondary" sx={{ my: 3 }}>
                No filters added. All data will be included in the report.
              </Typography>
            ) : (
              report.filters.map((filter, index) => (
                <Card key={filter.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      {index > 0 && (
                        <Grid item xs={12} sm={2}>
                          <FormControl fullWidth size="small">
                            <Select
                              value={filter.conjunction || 'AND'}
                              onChange={(e) =>
                                updateFilter(filter.id, 'conjunction', e.target.value)
                              }
                            >
                              <MenuItem value="AND">AND</MenuItem>
                              <MenuItem value="OR">OR</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      )}

                      <Grid item xs={12} sm={index === 0 ? 4 : 2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Field</InputLabel>
                          <Select
                            label="Field"
                            value={filter.field}
                            onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                          >
                            {availableFields.map((field) => (
                              <MenuItem key={field.id} value={field.id}>
                                {field.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Operator</InputLabel>
                          <Select
                            label="Operator"
                            value={filter.operator}
                            onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                            disabled={!filter.field}
                          >
                            {filter.field &&
                              availableFields.find((f) => f.id === filter.field)?.dataType &&
                              operatorOptions[
                                availableFields.find((f) => f.id === filter.field)!.dataType
                              ].map((op) => (
                                <MenuItem key={op} value={op}>
                                  {op}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Value"
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                          disabled={!filter.operator || filter.operator.includes('empty')}
                        />
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <IconButton
                          color="error"
                          onClick={() => removeFilter(filter.id)}
                          aria-label="delete filter"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}

        {/* Step 4: Configure Display */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Display Options
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="sort-by-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    multiple
                    value={report.sortBy}
                    onChange={handleSortSelection}
                    input={<OutlinedInput label="Sort By" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const field = availableFields.find((f) => f.id === value);
                          return <Chip key={value} label={field?.label || value} />;
                        })}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {report.selectedFields.map((fieldId) => {
                      const field = availableFields.find((f) => f.id === fieldId);
                      return (
                        <MenuItem key={fieldId} value={fieldId}>
                          <Checkbox checked={report.sortBy.indexOf(fieldId) > -1} />
                          <ListItemText primary={field?.label || fieldId} />
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="group-by-label">Group By</InputLabel>
                  <Select
                    labelId="group-by-label"
                    multiple
                    value={report.groupBy}
                    onChange={handleGroupSelection}
                    input={<OutlinedInput label="Group By" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const field = availableFields.find((f) => f.id === value);
                          return <Chip key={value} label={field?.label || value} />;
                        })}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {report.selectedFields.map((fieldId) => {
                      const field = availableFields.find((f) => f.id === fieldId);
                      if (field?.dataType !== 'number') {
                        return (
                          <MenuItem key={fieldId} value={fieldId}>
                            <Checkbox checked={report.groupBy.indexOf(fieldId) > -1} />
                            <ListItemText primary={field?.label || fieldId} />
                          </MenuItem>
                        );
                      }
                      return null;
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <>
                <Button
                  variant="outlined"
                  onClick={handlePreviewReport}
                  sx={{ mr: 1 }}
                  startIcon={<PreviewIcon />}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveReport}
                  disabled={!report.name || report.selectedFields.length === 0 || isSaving}
                  startIcon={<SaveIcon />}
                >
                  {isSaving ? 'Saving...' : 'Save Report'}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && !report.name) ||
                  (activeStep === 1 && report.selectedFields.length === 0)
                }
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Report Preview: {report.name}</DialogTitle>
        <DialogContent dividers>
          {previewData && previewData.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {report.selectedFields.map((fieldId) => {
                      const field = availableFields.find((f) => f.id === fieldId);
                      return (
                        <th
                          key={fieldId}
                          style={{
                            padding: '8px',
                            textAlign: 'left',
                            borderBottom: '1px solid #ddd',
                          }}
                        >
                          {field?.label || fieldId}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {report.selectedFields.map((fieldId) => (
                        <td
                          key={fieldId}
                          style={{ padding: '8px', borderBottom: '1px solid #ddd' }}
                        >
                          {fieldId in row ? row[fieldId] : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Typography>No data available for preview.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportBuilder;
