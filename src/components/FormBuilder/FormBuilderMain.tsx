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
  FormControlLabel
} from '@mui/material';
import { 
  Add as AddIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  PlayArrow as PreviewIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
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
    setActiveForm,
    addPage,
    updatePage,
    deletePage,
    setActivePage,
    addField,
    updateField,
    deleteField,
    reorderFields,
    duplicateField,
    setActiveField
  } = useFormBuilder();

  // Local state
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(activeForm?.name || '');
  const [description, setDescription] = useState(activeForm?.description || '');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

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
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
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
        updatedFields.forEach(field => {
          if (field.order >= destination.index) {
            updateField(activeForm.id, pageId, field.id, { order: field.order + 1 });
          }
        });
      }
      return;
    }
    
    // Reordering fields within a page
    if (
      source.droppableId.startsWith('page-') &&
      destination.droppableId.startsWith('page-')
    ) {
      const sourcePageId = source.droppableId.replace('page-', '');
      const destPageId = destination.droppableId.replace('page-', '');
      
      if (activeForm) {
        // If moving within the same page
        if (sourcePageId === destPageId) {
          reorderFields(activeForm.id, sourcePageId, source.index, destination.index);
        } else {
          // Moving between pages - more complex logic would go here
          // For now, basic implementation
          const sourcePage = activeForm.pages.find(p => p.id === sourcePageId);
          const destPage = activeForm.pages.find(p => p.id === destPageId);
          
          if (sourcePage && destPage) {
            // Find the field being moved
            const field = sourcePage.fields.find(f => f.id === draggableId);
            
            if (field) {
              // Delete from source
              deleteField(activeForm.id, sourcePageId, field.id);
              
              // Add to destination with new order
              const fieldCopy = { ...field, order: destination.index };
              addField(activeForm.id, destPageId, fieldCopy);
              
              // Update order of other fields in destination page
              destPage.fields.forEach(f => {
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
        <Typography variant="h5" gutterBottom>No Form Selected</Typography>
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
            startIcon={<SettingsIcon />} 
            onClick={() => setSettingsOpen(true)}
            sx={{ mx: 1 }}
          >
            Settings
          </Button>
          
          <Button 
            startIcon={<PreviewIcon />} 
            onClick={() => setPreviewOpen(true)}
            sx={{ mx: 1 }}
          >
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
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={handleTitleSave}
                    >
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
                    onFieldUpdate={(fieldId, updates) => updateField(activeForm.id, page.id, fieldId, updates)}
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
      
      {/* Form Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Form Settings</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>General Settings</Typography>
              <FormControlLabel
                control={
                  <Switch 
                    checked={activeForm.settings.saveProgress} 
                    onChange={(e) => updateForm(activeForm.id, { 
                      settings: { ...activeForm.settings, saveProgress: e.target.checked } 
                    })}
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
                  onChange={(e) => updateForm(activeForm.id, { 
                    settings: { ...activeForm.settings, autoSaveInterval: Number(e.target.value) } 
                  })}
                  fullWidth
                  sx={{ mb: 2 }}
                />
              )}
              
              <TextField
                label="Confirmation Message"
                multiline
                rows={2}
                value={activeForm.settings.confirmationMessage}
                onChange={(e) => updateForm(activeForm.id, { 
                  settings: { ...activeForm.settings, confirmationMessage: e.target.value } 
                })}
                fullWidth
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Redirect URL (optional)"
                value={activeForm.settings.redirectUrl || ''}
                onChange={(e) => updateForm(activeForm.id, { 
                  settings: { ...activeForm.settings, redirectUrl: e.target.value } 
                })}
                fullWidth
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>File Attachments</Typography>
              <FormControlLabel
                control={
                  <Switch 
                    checked={activeForm.settings.allowFileAttachments} 
                    onChange={(e) => updateForm(activeForm.id, { 
                      settings: { ...activeForm.settings, allowFileAttachments: e.target.checked } 
                    })}
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
                  onChange={(e) => updateForm(activeForm.id, { 
                    settings: { ...activeForm.settings, maxAttachmentSize: Number(e.target.value) } 
                  })}
                  fullWidth
                  sx={{ mb: 2 }}
                />
              )}
              
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Branding</Typography>
              <TextField
                label="Primary Color"
                type="color"
                value={activeForm.settings.branding?.primaryColor || '#1976d2'}
                onChange={(e) => updateForm(activeForm.id, { 
                  settings: { 
                    ...activeForm.settings, 
                    branding: { 
                      ...activeForm.settings.branding,
                      primaryColor: e.target.value 
                    } 
                  } 
                })}
                fullWidth
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Logo URL (optional)"
                value={activeForm.settings.branding?.logo || ''}
                onChange={(e) => updateForm(activeForm.id, { 
                  settings: { 
                    ...activeForm.settings, 
                    branding: { 
                      ...activeForm.settings.branding,
                      logo: e.target.value 
                    } 
                  } 
                })}
                fullWidth
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Font Family"
                value={activeForm.settings.branding?.fontFamily || 'Roboto, sans-serif'}
                onChange={(e) => updateForm(activeForm.id, { 
                  settings: { 
                    ...activeForm.settings, 
                    branding: { 
                      ...activeForm.settings.branding,
                      fontFamily: e.target.value 
                    } 
                  } 
                })}
                fullWidth
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button onClick={() => setSettingsOpen(false)} variant="contained">Save Settings</Button>
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
            <Box sx={{ 
              bgcolor: activeForm.settings.branding?.primaryColor || theme.palette.primary.main,
              color: '#fff',
              p: 3,
              mb: 3,
              borderRadius: 1
            }}>
              <Typography variant="h5" gutterBottom>
                {activeForm.name}
              </Typography>
              {activeForm.description && (
                <Typography variant="body1">
                  {activeForm.description}
                </Typography>
              )}
            </Box>
            
            {/* Preview content would render a read-only version of the form */}
            <Typography variant="body1" sx={{ mb: 2 }}>
              This is a preview of your form. In a real application, this would render the actual form fields with validation but without the builder UI.
            </Typography>
            
            <Button variant="contained" sx={{ mt: 2 }}>Submit Form</Button>
          </Paper>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FormBuilderMain; 