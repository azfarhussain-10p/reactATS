import React from 'react';
import { Box, Paper, Typography, IconButton, TextField, Divider, useTheme } from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Droppable } from 'react-beautiful-dnd';
import FormFieldComponent from './FormFieldComponent';
import { FormPage, FormField } from '../../models/types';
import { calculateFieldLayout } from './FormBuilderUtils';

interface FormPageComponentProps {
  page: FormPage;
  pageIndex: number;
  activeFieldId: string | null;
  onFieldSelect: (fieldId: string) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldDuplicate: (fieldId: string) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onPageUpdate: (updates: Partial<FormPage>) => void;
  onPageDelete: () => void;
}

const FormPageComponent: React.FC<FormPageComponentProps> = ({
  page,
  pageIndex,
  activeFieldId,
  onFieldSelect,
  onFieldDelete,
  onFieldDuplicate,
  onFieldUpdate,
  onPageUpdate,
  onPageDelete,
}) => {
  const theme = useTheme();
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [title, setTitle] = React.useState(page.title);
  const [description, setDescription] = React.useState(page.description || '');

  const handleTitleSave = () => {
    onPageUpdate({ title, description });
    setEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 4,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {editingTitle ? (
            <TextField
              fullWidth
              variant="standard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              InputProps={{
                style: { color: theme.palette.primary.contrastText },
              }}
            />
          ) : (
            `Page ${pageIndex + 1}: ${page.title}`
          )}
        </Typography>

        {editingTitle ? (
          <IconButton
            size="small"
            onClick={handleTitleSave}
            sx={{ color: theme.palette.primary.contrastText }}
          >
            <SaveIcon />
          </IconButton>
        ) : (
          <IconButton
            size="small"
            onClick={() => setEditingTitle(true)}
            sx={{ color: theme.palette.primary.contrastText }}
          >
            <EditIcon />
          </IconButton>
        )}

        <IconButton
          size="small"
          onClick={onPageDelete}
          sx={{ color: theme.palette.primary.contrastText }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      {editingTitle && (
        <Box sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Page Description"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="small"
          />
        </Box>
      )}

      {!editingTitle && page.description && (
        <Box sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
          <Typography variant="body2" color="text.secondary">
            {page.description}
          </Typography>
        </Box>
      )}

      <Divider />

      <Droppable droppableId={`page-${page.id}`}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              p: 3,
              minHeight: 200,
              bgcolor: snapshot.isDraggingOver ? 'action.hover' : theme.palette.background.paper,
              transition: 'background-color 0.2s ease',
            }}
          >
            {page.fields.length > 0 ? (
              page.fields
                .sort((a, b) => a.order - b.order)
                .map((field, index) => (
                  <FormFieldComponent
                    key={field.id}
                    field={field}
                    index={index}
                    isSelected={activeFieldId === field.id}
                    onSelect={onFieldSelect}
                    onDelete={onFieldDelete}
                    onDuplicate={onFieldDuplicate}
                    onUpdate={onFieldUpdate}
                  />
                ))
            ) : (
              <Box
                sx={{
                  height: 150,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Drag and drop fields here or
                </Typography>
                <IconButton size="small" sx={{ ml: 1 }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
};

export default FormPageComponent;
