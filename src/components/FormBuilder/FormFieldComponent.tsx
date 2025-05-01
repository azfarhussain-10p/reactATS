import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Settings as SettingsIcon,
  KeyboardArrowDown as CollapseIcon,
  KeyboardArrowUp as ExpandIcon,
} from '@mui/icons-material';
import { Draggable } from 'react-beautiful-dnd';
import { FormField, FormFieldType } from '../../models/types';
import { fieldTypeIcons } from './FormBuilderUtils';

interface FormFieldComponentProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  onSelect: (fieldId: string) => void;
  onDelete: (fieldId: string) => void;
  onDuplicate: (fieldId: string) => void;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
}

const FormFieldComponent: React.FC<FormFieldComponentProps> = ({
  field,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onUpdate,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  // Render field preview based on its type
  const renderFieldPreview = () => {
    switch (field.type) {
      case 'ShortText':
        return (
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            disabled
          />
        );
      case 'LongText':
        return (
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            multiline
            rows={3}
            label={field.label}
            placeholder={field.placeholder}
            disabled
          />
        );
      case 'Email':
        return (
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            label={field.label}
            placeholder={field.placeholder || 'example@email.com'}
            disabled
            type="email"
          />
        );
      case 'SingleSelect':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{field.label}</InputLabel>
            <Select label={field.label} disabled value="">
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              )) || (
                <>
                  <MenuItem value="option1">Option 1</MenuItem>
                  <MenuItem value="option2">Option 2</MenuItem>
                  <MenuItem value="option3">Option 3</MenuItem>
                </>
              )}
            </Select>
          </FormControl>
        );
      case 'Heading':
        return (
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {field.label || 'Section Heading'}
          </Typography>
        );
      case 'Divider':
        return (
          <Box sx={{ width: '100%', pt: 1, pb: 1 }}>
            <Box sx={{ height: 1, bgcolor: 'divider', width: '100%' }} />
          </Box>
        );
      // Add more field type previews as needed
      default:
        return (
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            disabled
          />
        );
    }
  };

  return (
    <Draggable draggableId={field.id} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          elevation={isSelected || snapshot.isDragging ? 3 : 1}
          sx={{
            mb: 2,
            p: 2,
            position: 'relative',
            border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
            '&:hover': {
              boxShadow: 3,
            },
          }}
          onClick={() => onSelect(field.id)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box {...provided.dragHandleProps} sx={{ cursor: 'grab', mr: 1 }}>
              <DragIcon color="action" />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              {fieldTypeIcons[field.type] && <Box sx={{ mr: 1 }}>{fieldTypeIcons[field.type]}</Box>}
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {field.label || `Untitled ${field.type.replace(/([A-Z])/g, ' $1').trim()} Field`}
              </Typography>
            </Box>

            <Box>
              <Tooltip title="Required Toggle">
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={field.required}
                      onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
                      onClick={(e) => e.stopPropagation()}
                    />
                  }
                  label="Required"
                  sx={{ mr: 1 }}
                />
              </Tooltip>

              <Tooltip title="Duplicate Field">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(field.id);
                  }}
                >
                  <DuplicateIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete Field">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(field.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title={expanded ? 'Collapse Field' : 'Expand Field'}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                >
                  {expanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {field.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {field.description}
            </Typography>
          )}

          <Box sx={{ mt: 2 }}>{renderFieldPreview()}</Box>

          {expanded && isSelected && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom>
                Field Properties
              </Typography>

              <TextField
                label="Field Label"
                size="small"
                fullWidth
                value={field.label || ''}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Description"
                size="small"
                fullWidth
                value={field.description || ''}
                onChange={(e) => onUpdate(field.id, { description: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Placeholder"
                size="small"
                fullWidth
                value={field.placeholder || ''}
                onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Field Width</InputLabel>
                <Select
                  value={field.width || 'full'}
                  label="Field Width"
                  onChange={(e) =>
                    onUpdate(field.id, { width: e.target.value as 'full' | 'half' | 'third' })
                  }
                >
                  <MenuItem value="full">Full Width</MenuItem>
                  <MenuItem value="half">Half Width</MenuItem>
                  <MenuItem value="third">One Third</MenuItem>
                </Select>
              </FormControl>

              {/* Add more field-specific properties based on field type */}
              {(field.type === 'SingleSelect' ||
                field.type === 'MultiSelect' ||
                field.type === 'RadioGroup') && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Options
                  </Typography>
                  {field.options?.map((option, i) => (
                    <Box key={i} sx={{ display: 'flex', mb: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...(field.options || [])];
                          newOptions[i] = { ...newOptions[i], label: e.target.value };
                          onUpdate(field.id, { options: newOptions });
                        }}
                        sx={{ mr: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newOptions = [...(field.options || [])];
                          newOptions.splice(i, 1);
                          onUpdate(field.id, { options: newOptions });
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newOptions = [
                        ...(field.options || []),
                        {
                          value: `option${(field.options?.length || 0) + 1}`,
                          label: `Option ${(field.options?.length || 0) + 1}`,
                        },
                      ];
                      onUpdate(field.id, { options: newOptions });
                    }}
                    sx={{ mt: 1 }}
                  >
                    + Add Option
                  </IconButton>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      )}
    </Draggable>
  );
};

export default FormFieldComponent;
