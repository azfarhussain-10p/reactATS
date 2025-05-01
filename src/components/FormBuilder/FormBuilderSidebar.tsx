import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  TextFields as TextIcon,
  Subject as LongTextIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Numbers as NumberIcon,
  CalendarMonth as DateIcon,
  CheckBox as CheckboxIcon,
  RadioButtonChecked as RadioIcon,
  ArrowDropDownCircle as DropdownIcon,
  Upload as FileUploadIcon,
  Home as AddressIcon,
  Person as NameIcon,
  Star as RatingIcon,
  Title as HeadingIcon,
  HorizontalRule as DividerIcon,
  FormatListBulleted as MultiSelectIcon,
} from '@mui/icons-material';
import { FormFieldType } from '../../models/types';

// Map field types to icons
const fieldTypeIcons: Record<FormFieldType, React.ReactElement> = {
  ShortText: <TextIcon />,
  LongText: <LongTextIcon />,
  Email: <EmailIcon />,
  Phone: <PhoneIcon />,
  Number: <NumberIcon />,
  Date: <DateIcon />,
  SingleSelect: <DropdownIcon />,
  MultiSelect: <MultiSelectIcon />,
  Checkbox: <CheckboxIcon />,
  RadioGroup: <RadioIcon />,
  FileUpload: <FileUploadIcon />,
  Address: <AddressIcon />,
  Name: <NameIcon />,
  Rating: <RatingIcon />,
  Heading: <HeadingIcon />,
  Divider: <DividerIcon />,
};

// Field type descriptions
const fieldTypeDescriptions: Record<FormFieldType, string> = {
  ShortText: 'Single line text input',
  LongText: 'Multi-line text area',
  Email: 'Email address field with validation',
  Phone: 'Phone number field with formatting',
  Number: 'Numeric input with optional validation',
  Date: 'Date picker field',
  SingleSelect: 'Dropdown with single selection',
  MultiSelect: 'Dropdown with multiple selections',
  Checkbox: 'Single checkbox field',
  RadioGroup: 'Multiple choice with radio buttons',
  FileUpload: 'File upload with optional filtering',
  Address: 'Complete address fields group',
  Name: 'Name fields with first/last options',
  Rating: 'Star rating selection field',
  Heading: 'Section heading (non-input)',
  Divider: 'Visual divider (non-input)',
};

// Group field types by category
const fieldGroups = {
  'Basic Fields': ['ShortText', 'LongText', 'Email', 'Phone', 'Number', 'Date'] as FormFieldType[],
  'Choice Fields': ['SingleSelect', 'MultiSelect', 'Checkbox', 'RadioGroup'] as FormFieldType[],
  'Advanced Fields': ['FileUpload', 'Address', 'Name', 'Rating'] as FormFieldType[],
  'Layout Elements': ['Heading', 'Divider'] as FormFieldType[],
};

interface FormBuilderSidebarProps {
  onDragEnd: (result: any) => void;
}

const FormBuilderSidebar: React.FC<FormBuilderSidebarProps> = ({ onDragEnd }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: 280,
        height: '100%',
        overflow: 'auto',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Form Elements
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Drag elements to add them to your form
      </Typography>

      <Divider sx={{ my: 2 }} />

      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(fieldGroups).map(([groupName, fieldTypes]) => (
          <Box key={groupName} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              {groupName}
            </Typography>

            <Droppable droppableId={`sidebar-${groupName}`} isDropDisabled={true}>
              {(provided) => (
                <Paper
                  variant="outlined"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{ mb: 2 }}
                >
                  <List disablePadding>
                    {fieldTypes.map((fieldType, index) => (
                      <Draggable key={fieldType} draggableId={`new-${fieldType}`} index={index}>
                        {(provided, snapshot) => (
                          <Tooltip title={fieldTypeDescriptions[fieldType]} placement="right">
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                cursor: 'grab',
                                bgcolor: snapshot.isDragging ? 'action.hover' : 'transparent',
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&:last-child': {
                                  borderBottom: 'none',
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                {fieldTypeIcons[fieldType]}
                              </ListItemIcon>
                              <ListItemText primary={fieldType.replace(/([A-Z])/g, ' $1').trim()} />
                            </ListItem>
                          </Tooltip>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                </Paper>
              )}
            </Droppable>
          </Box>
        ))}
      </DragDropContext>
    </Box>
  );
};

export default FormBuilderSidebar;
