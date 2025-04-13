import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { FormBuilderProvider, useFormBuilder } from '../contexts/FormBuilderContext';
import { FormBuilderMain } from '../components/FormBuilder';

// Form list component that shows all available forms
const FormList = () => {
  const navigate = useNavigate();
  const { forms, createForm, deleteForm } = useFormBuilder();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [newFormDescription, setNewFormDescription] = useState('');

  const handleCreateForm = () => {
    if (newFormName.trim()) {
      const newForm = createForm(newFormName.trim(), newFormDescription.trim() || undefined);
      setCreateDialogOpen(false);
      setNewFormName('');
      setNewFormDescription('');
      navigate(`/application-forms/edit/${newForm.id}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Application Forms</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create New Form
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {forms.map(form => (
          <Grid item xs={12} md={6} lg={4} key={form.id}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 0, 
                borderRadius: 2, 
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ 
                p: 2, 
                bgcolor: form.settings.branding?.primaryColor || 'primary.main',
                color: 'white'
              }}>
                <Typography variant="h6">{form.name}</Typography>
              </Box>
              
              <Box sx={{ p: 2, flexGrow: 1 }}>
                {form.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {form.description}
                  </Typography>
                )}
                
                <Typography variant="body2" gutterBottom>
                  <strong>Pages:</strong> {form.pages.length}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Fields:</strong> {form.pages.reduce((count, page) => count + page.fields.length, 0)}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Last Updated:</strong> {new Date(form.updatedAt).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Divider />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                <IconButton size="small" onClick={() => navigate(`/application-forms/edit/${form.id}`)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                
                <IconButton size="small">
                  <DuplicateIcon fontSize="small" />
                </IconButton>
                
                <IconButton size="small">
                  <ViewIcon fontSize="small" />
                </IconButton>
                
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => deleteForm(form.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {/* Create Form Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Form</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Form Name"
            fullWidth
            value={newFormName}
            onChange={(e) => setNewFormName(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            value={newFormDescription}
            onChange={(e) => setNewFormDescription(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateForm} 
            variant="contained"
            disabled={!newFormName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Form Editor component
const FormEditor = ({ formId }: { formId: string }) => {
  const navigate = useNavigate();
  return (
    <FormBuilderMain 
      formId={formId} 
      onBack={() => navigate('/application-forms')} 
    />
  );
};

// Main Application Form Builder Page
const ApplicationFormBuilder = () => {
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Get formId from URL if available
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/edit/')) {
      const id = path.split('/edit/')[1];
      setCurrentFormId(id);
      setMode('edit');
    } else {
      setMode('list');
    }
  }, []);

  return (
    <FormBuilderProvider>
      {mode === 'list' ? (
        <FormList />
      ) : (
        <FormEditor formId={currentFormId || ''} />
      )}
    </FormBuilderProvider>
  );
};

export default ApplicationFormBuilder; 