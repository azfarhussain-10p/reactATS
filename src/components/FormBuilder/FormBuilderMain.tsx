import React, { useState } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  IconButton,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Drawer,
  useTheme,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  PlayArrow as PreviewIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  HourglassEmpty as HourglassIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
} from '@mui/icons-material';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useFormBuilder } from '../../contexts/FormBuilderContext';
import FormBuilderSidebar from './FormBuilderSidebar';
import FormPageComponent from './FormPageComponent';
import { createDefaultField } from './FormBuilderUtils';
import { FormFieldType } from '../../models/types';

interface FormBuilderMainProps {
  formId?: string;
  onBack?: () => void;
}

const FormBuilderMain: React.FC<FormBuilderMainProps> = ({ formId, onBack }) => {
  const theme = useTheme();
  const {
    forms,
    activeForm,
    activePage,
    activeField,
    createForm,
    updateForm,
    deleteForm,
    setActiveForm,
    addPage,
    updatePage,
    deletePage,
    reorderPages,
    setActivePage,
    addField,
    updateField,
    deleteField,
    reorderFields,
    duplicateField,
    setActiveField,
    addCondition,
    updateCondition,
    deleteCondition,
  } = useFormBuilder();

  // Local state
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(activeForm?.name || '');
  const [description, setDescription] = useState(activeForm?.description || '');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Common props for Select components to ensure visibility
  const menuProps = {
    PaperProps: {
      sx: {
        bgcolor: 'background.paper',
        color: 'text.primary',
      },
    },
  };

  // Initialize form if not set
  React.useEffect(() => {
    if (formId && !activeForm) {
      setActiveForm(formId);
    } else if (!activeForm && forms.length > 0) {
      setActiveForm(forms[0].id);
    }
  }, [formId, activeForm, forms, setActiveForm]);

  // Set local state when active form changes
  React.useEffect(() => {
    if (activeForm) {
      setTitle(activeForm.name);
      setDescription(activeForm.description || '');
    }
  }, [activeForm]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid area
    if (!destination) return;

    // Same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Check if this is a new field being added from sidebar
    if (source.droppableId.startsWith('sidebar-')) {
      // Extract the field type from the draggableId
      const fieldType = draggableId.replace('new-', '') as FormFieldType;

      // Get the page ID from the destination
      const pageId = destination.droppableId.replace('page-', '');

      if (activeForm && activePage) {
        // Create a new field of this type
        const newField = createDefaultField(fieldType, pageId);

        // Set the order based on destination index
        newField.order = destination.index;

        // Add it to the form
        addField(activeForm.id, pageId, newField);

        // Update the order of other fields
        const updatedFields = [...activePage.fields];
        updatedFields.forEach((field) => {
          if (field.order >= destination.index) {
            updateField(activeForm.id, pageId, field.id, { order: field.order + 1 });
          }
        });
      }
      return;
    }

    // Reordering fields within a page
    if (source.droppableId.startsWith('page-') && destination.droppableId.startsWith('page-')) {
      const sourcePageId = source.droppableId.replace('page-', '');
      const destPageId = destination.droppableId.replace('page-', '');

      if (activeForm) {
        // If moving within the same page
        if (sourcePageId === destPageId) {
          reorderFields(activeForm.id, sourcePageId, source.index, destination.index);
        } else {
          // Moving between pages - more complex logic would go here
          // For now, basic implementation
          const sourcePage = activeForm.pages.find((p) => p.id === sourcePageId);
          const destPage = activeForm.pages.find((p) => p.id === destPageId);

          if (sourcePage && destPage) {
            // Find the field being moved
            const field = sourcePage.fields.find((f) => f.id === draggableId);

            if (field) {
              // Delete from source
              deleteField(activeForm.id, sourcePageId, field.id);

              // Add to destination with new order
              const fieldCopy = { ...field, order: destination.index };
              addField(activeForm.id, destPageId, fieldCopy);

              // Update order of other fields in destination page
              destPage.fields.forEach((f) => {
                if (f.id !== field.id && f.order >= destination.index) {
                  updateField(activeForm.id, destPageId, f.id, { order: f.order + 1 });
                }
              });
            }
          }
        }
      }
    }
  };

  const handleTitleSave = () => {
    if (activeForm) {
      updateForm(activeForm.id, { name: title, description });
      setEditingTitle(false);
    }
  };

  const handleAddPage = () => {
    if (activeForm) {
      const newPage = addPage(activeForm.id);
      setActivePage(newPage.id);
    }
  };

  const handleSaveForm = () => {
    if (activeForm) {
      // In a real app, this would make an API call to save
      console.log('Form saved:', activeForm);
      alert('Form saved successfully!');
    }
  };

  if (!activeForm) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          No Form Selected
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            const newForm = createForm('New Form');
            setActiveForm(newForm.id);
          }}
        >
          Create New Form
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top Bar */}
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          {onBack && (
            <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 2 }}>
              <BackIcon />
            </IconButton>
          )}

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            {editingTitle ? (
              <TextField
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="standard"
                sx={{ mr: 2, minWidth: 200 }}
                autoFocus
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                }}
              />
            ) : (
              <Typography variant="h6" component="div" sx={{ mr: 2 }}>
                {activeForm.name}
              </Typography>
            )}

            <IconButton color="inherit" onClick={() => setEditingTitle(!editingTitle)}>
              <EditIcon />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
            sx={{
              mx: 1,
              fontWeight: 'bold',
              boxShadow: 2,
            }}
          >
            Settings
          </Button>

          <Button startIcon={<PreviewIcon />} onClick={() => setPreviewOpen(true)} sx={{ mx: 1 }}>
            Preview
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveForm}
          >
            Save Form
          </Button>
        </Toolbar>

        <Divider />

        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, bgcolor: 'background.paper' }}
        >
          <Tab label="Form Builder" />
          <Tab label="Logic & Conditions" />
          <Tab label="Submissions" />
        </Tabs>
      </AppBar>

      {/* Main Content */}
      {currentTab === 0 && (
        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          {/* Left Sidebar - Form Elements */}
          <FormBuilderSidebar onDragEnd={handleDragEnd} />

          {/* Main Form Building Area */}
          <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Container maxWidth="md">
                {editingTitle && (
                  <Paper sx={{ mb: 3, p: 2 }}>
                    <TextField
                      fullWidth
                      label="Form Description"
                      multiline
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Button variant="contained" size="small" onClick={handleTitleSave}>
                      Save Details
                    </Button>
                  </Paper>
                )}

                {/* Form Pages */}
                {activeForm.pages.map((page, index) => (
                  <FormPageComponent
                    key={page.id}
                    page={page}
                    pageIndex={index}
                    activeFieldId={activeField?.id || null}
                    onFieldSelect={setActiveField}
                    onFieldDelete={(fieldId) => deleteField(activeForm.id, page.id, fieldId)}
                    onFieldDuplicate={(fieldId) => duplicateField(activeForm.id, page.id, fieldId)}
                    onFieldUpdate={(fieldId, updates) =>
                      updateField(activeForm.id, page.id, fieldId, updates)
                    }
                    onPageUpdate={(updates) => updatePage(activeForm.id, page.id, updates)}
                    onPageDelete={() => deletePage(activeForm.id, page.id)}
                  />
                ))}

                {/* Add Page Button */}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddPage}
                  fullWidth
                  sx={{ py: 2, textTransform: 'none' }}
                >
                  Add New Page
                </Button>
              </Container>
            </DragDropContext>
          </Box>
        </Box>
      )}

      {/* Logic & Conditions Tab */}
      {currentTab === 1 && (
        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          <Container maxWidth="md">
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Conditional Logic
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Set up conditions to control when fields are shown or hidden based on user
                responses.
              </Typography>

              {activeForm.conditions.length === 0 ? (
                <Box
                  sx={{ textAlign: 'center', py: 4, borderRadius: 1, bgcolor: 'background.paper' }}
                >
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    No conditions have been created yet.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      if (activeForm) {
                        // Add a default empty condition
                        addCondition(activeForm.id, {});
                      }
                    }}
                  >
                    Add Your First Condition
                  </Button>
                </Box>
              ) : (
                <>
                  {/* List existing conditions */}
                  {activeForm.conditions.map((condition) => {
                    // Find the field this condition applies to
                    const field = activeForm.pages
                      .flatMap((p) => p.fields)
                      .find((f) => f.id === condition.fieldId);

                    return (
                      <Paper
                        key={condition.id}
                        sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                          }}
                        >
                          <Typography variant="subtitle1">
                            {field ? `Condition for: ${field.label}` : 'Select a field'}
                          </Typography>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => deleteCondition(activeForm.id, condition.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                              <InputLabel id="field-select-label">Field</InputLabel>
                              <Select
                                labelId="field-select-label"
                                value={condition.fieldId || ''}
                                label="Field"
                                onChange={(e) =>
                                  updateCondition(activeForm.id, condition.id, {
                                    fieldId: e.target.value,
                                  })
                                }
                                MenuProps={menuProps}
                              >
                                {activeForm.pages
                                  .flatMap((page) => page.fields)
                                  .map((field) => (
                                    <MenuItem
                                      key={field.id}
                                      value={field.id}
                                      sx={{ color: 'text.primary' }}
                                    >
                                      {field.label || `Field ${field.id.slice(0, 4)}`}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                              <InputLabel id="operator-select-label">Operator</InputLabel>
                              <Select
                                labelId="operator-select-label"
                                value={condition.operator || 'equals'}
                                label="Operator"
                                onChange={(e) =>
                                  updateCondition(activeForm.id, condition.id, {
                                    operator: e.target.value,
                                  })
                                }
                                MenuProps={menuProps}
                              >
                                <MenuItem value="equals" sx={{ color: 'text.primary' }}>
                                  Equals
                                </MenuItem>
                                <MenuItem value="notEquals" sx={{ color: 'text.primary' }}>
                                  Not Equals
                                </MenuItem>
                                <MenuItem value="contains" sx={{ color: 'text.primary' }}>
                                  Contains
                                </MenuItem>
                                <MenuItem value="greaterThan" sx={{ color: 'text.primary' }}>
                                  Greater Than
                                </MenuItem>
                                <MenuItem value="lessThan" sx={{ color: 'text.primary' }}>
                                  Less Than
                                </MenuItem>
                                <MenuItem value="isAnyOf" sx={{ color: 'text.primary' }}>
                                  Is Any Of
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={5}>
                            {condition.operator === 'isAnyOf' ? (
                              <TextField
                                fullWidth
                                size="small"
                                label="Values (comma-separated)"
                                value={condition.values?.join(', ') || ''}
                                onChange={(e) => {
                                  const values = e.target.value.split(',').map((v) => v.trim());
                                  updateCondition(activeForm.id, condition.id, { values });
                                }}
                              />
                            ) : (
                              <TextField
                                fullWidth
                                size="small"
                                label="Value"
                                value={condition.value || ''}
                                onChange={(e) =>
                                  updateCondition(activeForm.id, condition.id, {
                                    value: e.target.value,
                                  })
                                }
                              />
                            )}
                          </Grid>
                        </Grid>
                      </Paper>
                    );
                  })}

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        if (activeForm) {
                          addCondition(activeForm.id, {});
                        }
                      }}
                    >
                      Add Another Condition
                    </Button>
                  </Box>
                </>
              )}
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Apply Conditions to Fields
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select a field and apply a condition to control when it's displayed.
              </Typography>

              {activeForm.pages.map((page) => (
                <Box key={page.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Page: {page.title || `Page ${page.order + 1}`}
                  </Typography>

                  {page.fields.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
                      No fields on this page.
                    </Typography>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Field</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Condition</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {page.fields.map((field) => (
                            <TableRow key={field.id}>
                              <TableCell>
                                {field.label || `Field ${field.id.slice(0, 4)}`}
                              </TableCell>
                              <TableCell>{field.type}</TableCell>
                              <TableCell>
                                {field.conditionId
                                  ? // Find and display the condition details
                                    (() => {
                                      const condition = activeForm.conditions.find(
                                        (c) => c.id === field.conditionId
                                      );
                                      const triggerField = condition
                                        ? activeForm.pages
                                            .flatMap((p) => p.fields)
                                            .find((f) => f.id === condition.fieldId)
                                        : null;

                                      return condition ? (
                                        <Typography variant="body2">
                                          When {triggerField?.label || 'field'} {condition.operator}{' '}
                                          {condition.value || condition.values?.join(', ')}
                                        </Typography>
                                      ) : (
                                        'Invalid condition'
                                      );
                                    })()
                                  : 'Always shown'}
                              </TableCell>
                              <TableCell>
                                <FormControl fullWidth size="small">
                                  <InputLabel id="condition-select-label">
                                    Apply Condition
                                  </InputLabel>
                                  <Select
                                    labelId="condition-select-label"
                                    value={field.conditionId || ''}
                                    displayEmpty
                                    label="Apply Condition"
                                    MenuProps={menuProps}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value) {
                                        updateField(activeForm.id, page.id, field.id, {
                                          conditionId: value,
                                        });
                                      } else {
                                        // Remove condition
                                        const { conditionId, ...rest } = field;
                                        updateField(activeForm.id, page.id, field.id, rest);
                                      }
                                    }}
                                  >
                                    <MenuItem value="" sx={{ color: 'text.primary' }}>
                                      No condition (always show)
                                    </MenuItem>
                                    {activeForm.conditions.map((cond) => (
                                      <MenuItem
                                        key={cond.id}
                                        value={cond.id}
                                        sx={{ color: 'text.primary' }}
                                      >
                                        {(() => {
                                          const triggerField = activeForm.pages
                                            .flatMap((p) => p.fields)
                                            .find((f) => f.id === cond.fieldId);
                                          return `When ${triggerField?.label || 'field'} ${cond.operator} ${cond.value || cond.values?.join(', ')}`;
                                        })()}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              ))}
            </Paper>
          </Container>
        </Box>
      )}

      {/* Submissions Tab */}
      {currentTab === 2 && (
        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          <Container maxWidth="md">
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Form Submissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                View and manage submissions for this form.
              </Typography>

              {/* Mock submission data - in a real app this would come from an API */}
              {activeForm.submissions && activeForm.submissions.length > 0 ? (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Submission ID</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activeForm.submissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>{submission.id.slice(0, 8)}</TableCell>
                            <TableCell>{new Date(submission.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                              {submission.status === 'completed' ? (
                                <Box
                                  sx={{
                                    color: 'success.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  <CheckIcon fontSize="small" sx={{ mr: 0.5 }} /> Completed
                                </Box>
                              ) : submission.status === 'in_progress' ? (
                                <Box
                                  sx={{ color: 'info.main', display: 'flex', alignItems: 'center' }}
                                >
                                  <HourglassIcon fontSize="small" sx={{ mr: 0.5 }} /> In Progress
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    color: 'text.secondary',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} /> Abandoned
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button size="small" startIcon={<VisibilityIcon />}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="outlined" startIcon={<GetAppIcon />}>
                      Export as CSV
                    </Button>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{ textAlign: 'center', py: 4, borderRadius: 1, bgcolor: 'background.paper' }}
                >
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    No submissions yet.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submissions will appear here after users complete your form.
                  </Typography>
                </Box>
              )}
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Submission Settings
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={activeForm.settings.storeSubmissions ?? true}
                    onChange={(e) =>
                      updateForm(activeForm.id, {
                        settings: { ...activeForm.settings, storeSubmissions: e.target.checked },
                      })
                    }
                  />
                }
                label="Store form submissions"
                sx={{ display: 'block', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={activeForm.settings.notifyOnSubmission ?? false}
                    onChange={(e) =>
                      updateForm(activeForm.id, {
                        settings: { ...activeForm.settings, notifyOnSubmission: e.target.checked },
                      })
                    }
                  />
                }
                label="Email notification on new submissions"
                sx={{ display: 'block', mb: 2 }}
              />

              {activeForm.settings.notifyOnSubmission && (
                <TextField
                  label="Notification Email Addresses (comma-separated)"
                  fullWidth
                  value={activeForm.settings.notificationEmails || ''}
                  onChange={(e) =>
                    updateForm(activeForm.id, {
                      settings: { ...activeForm.settings, notificationEmails: e.target.value },
                    })
                  }
                  sx={{ mb: 2 }}
                />
              )}

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="default-status-label">
                  Default Status for New Submissions
                </InputLabel>
                <Select
                  labelId="default-status-label"
                  value={activeForm.settings.defaultSubmissionStatus || 'new'}
                  label="Default Status for New Submissions"
                  onChange={(e) =>
                    updateForm(activeForm.id, {
                      settings: { ...activeForm.settings, defaultSubmissionStatus: e.target.value },
                    })
                  }
                  MenuProps={menuProps}
                >
                  <MenuItem value="new" sx={{ color: 'text.primary' }}>
                    New
                  </MenuItem>
                  <MenuItem value="review" sx={{ color: 'text.primary' }}>
                    Needs Review
                  </MenuItem>
                  <MenuItem value="approved" sx={{ color: 'text.primary' }}>
                    Approved
                  </MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // In a real app, this would save the settings
                  console.log('Submission settings saved');
                  alert('Settings saved successfully!');
                }}
              >
                Save Submission Settings
              </Button>
            </Paper>
          </Container>
        </Box>
      )}

      {/* Form Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          zIndex: 9999,
          '& .MuiDialog-paper': {
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 24,
          },
          '& .MuiInputLabel-root': {
            color: 'text.secondary',
          },
          '& .MuiOutlinedInput-root': {
            color: 'text.primary',
          },
          '& .MuiInputBase-input': {
            color: 'text.primary',
          },
          '& .MuiFormLabel-root': {
            color: 'text.primary',
          },
          '& .MuiSwitch-root': {
            opacity: 1,
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6">Form Settings</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, color: 'text.primary' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                General Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={activeForm.settings.saveProgress}
                    onChange={(e) =>
                      updateForm(activeForm.id, {
                        settings: { ...activeForm.settings, saveProgress: e.target.checked },
                      })
                    }
                  />
                }
                label="Allow saving progress"
                sx={{ display: 'block', mb: 2 }}
              />

              {activeForm.settings.saveProgress && (
                <TextField
                  label="Auto-save interval (seconds)"
                  type="number"
                  value={activeForm.settings.autoSaveInterval || 30}
                  onChange={(e) =>
                    updateForm(activeForm.id, {
                      settings: {
                        ...activeForm.settings,
                        autoSaveInterval: Number(e.target.value),
                      },
                    })
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                />
              )}

              <TextField
                label="Confirmation Message"
                multiline
                rows={2}
                value={activeForm.settings.confirmationMessage}
                onChange={(e) =>
                  updateForm(activeForm.id, {
                    settings: { ...activeForm.settings, confirmationMessage: e.target.value },
                  })
                }
                fullWidth
                sx={{ mb: 2 }}
              />

              <TextField
                label="Redirect URL (optional)"
                value={activeForm.settings.redirectUrl || ''}
                onChange={(e) =>
                  updateForm(activeForm.id, {
                    settings: { ...activeForm.settings, redirectUrl: e.target.value },
                  })
                }
                fullWidth
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                File Attachments
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={activeForm.settings.allowFileAttachments}
                    onChange={(e) =>
                      updateForm(activeForm.id, {
                        settings: {
                          ...activeForm.settings,
                          allowFileAttachments: e.target.checked,
                        },
                      })
                    }
                  />
                }
                label="Allow file attachments"
                sx={{ display: 'block', mb: 2 }}
              />

              {activeForm.settings.allowFileAttachments && (
                <TextField
                  label="Max attachment size (MB)"
                  type="number"
                  value={activeForm.settings.maxAttachmentSize || 5}
                  onChange={(e) =>
                    updateForm(activeForm.id, {
                      settings: {
                        ...activeForm.settings,
                        maxAttachmentSize: Number(e.target.value),
                      },
                    })
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                />
              )}

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Branding
              </Typography>
              <TextField
                label="Primary Color"
                type="color"
                value={activeForm.settings.branding?.primaryColor || '#1976d2'}
                onChange={(e) =>
                  updateForm(activeForm.id, {
                    settings: {
                      ...activeForm.settings,
                      branding: {
                        ...activeForm.settings.branding,
                        primaryColor: e.target.value,
                      },
                    },
                  })
                }
                fullWidth
                sx={{ mb: 2 }}
              />

              <TextField
                label="Logo URL (optional)"
                value={activeForm.settings.branding?.logo || ''}
                onChange={(e) =>
                  updateForm(activeForm.id, {
                    settings: {
                      ...activeForm.settings,
                      branding: {
                        ...activeForm.settings.branding,
                        logo: e.target.value,
                      },
                    },
                  })
                }
                fullWidth
                sx={{ mb: 2 }}
              />

              <TextField
                label="Font Family"
                value={activeForm.settings.branding?.fontFamily || 'Roboto, sans-serif'}
                onChange={(e) =>
                  updateForm(activeForm.id, {
                    settings: {
                      ...activeForm.settings,
                      branding: {
                        ...activeForm.settings.branding,
                        fontFamily: e.target.value,
                      },
                    },
                  })
                }
                fullWidth
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Button onClick={() => setSettingsOpen(false)} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setSettingsOpen(false);
              // Notify the user
              alert('Settings saved successfully!');
            }}
            variant="contained"
            color="primary"
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Form Preview</Typography>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                bgcolor: activeForm.settings.branding?.primaryColor || theme.palette.primary.main,
                color: '#fff',
                p: 3,
                mb: 3,
                borderRadius: 1,
              }}
            >
              <Typography variant="h5" gutterBottom>
                {activeForm.name}
              </Typography>
              {activeForm.description && (
                <Typography variant="body1">{activeForm.description}</Typography>
              )}
            </Box>

            {/* Preview content would render a read-only version of the form */}
            <Typography variant="body1" sx={{ mb: 2 }}>
              This is a preview of your form. In a real application, this would render the actual
              form fields with validation but without the builder UI.
            </Typography>

            <Button variant="contained" sx={{ mt: 2 }}>
              Submit Form
            </Button>
          </Paper>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FormBuilderMain;
