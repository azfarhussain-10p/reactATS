import React from 'react';
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
import { FormFieldType, FormField, FormPage } from '../../models/types';
import { v4 as uuidv4 } from 'uuid';

// Map field types to icons
export const fieldTypeIcons: Record<FormFieldType, React.ReactElement> = {
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
export const fieldTypeDescriptions: Record<FormFieldType, string> = {
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

// Create default field from type
export const createDefaultField = (type: FormFieldType, pageId: string): FormField => {
  const fieldDefaults: Record<FormFieldType, Partial<FormField>> = {
    ShortText: {
      label: 'Text Field',
      placeholder: 'Enter text here',
      required: false,
    },
    LongText: {
      label: 'Paragraph Field',
      placeholder: 'Enter longer text here',
      required: false,
    },
    Email: {
      label: 'Email Address',
      placeholder: 'your@email.com',
      required: true,
    },
    Phone: {
      label: 'Phone Number',
      placeholder: '(123) 456-7890',
      required: false,
    },
    Number: {
      label: 'Number Field',
      placeholder: 'Enter a number',
      required: false,
      validation: {
        min: 0,
      },
    },
    Date: {
      label: 'Date Field',
      required: false,
    },
    SingleSelect: {
      label: 'Dropdown Field',
      required: false,
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
    },
    MultiSelect: {
      label: 'Multi-Select Field',
      required: false,
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
    },
    Checkbox: {
      label: 'Checkbox Field',
      required: false,
    },
    RadioGroup: {
      label: 'Radio Group Field',
      required: false,
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
    },
    FileUpload: {
      label: 'File Upload',
      description: 'Upload a file',
      required: false,
      validation: {
        acceptedFileTypes: ['.pdf', '.doc', '.docx'],
        maxFileSize: 5,
      },
    },
    Address: {
      label: 'Address',
      required: false,
    },
    Name: {
      label: 'Full Name',
      required: false,
    },
    Rating: {
      label: 'Rating',
      description: 'Rate from 1 to 5 stars',
      required: false,
    },
    Heading: {
      label: 'Section Heading',
      description: 'This is a section heading',
      required: false,
    },
    Divider: {
      label: '',
      required: false,
    },
  };

  const defaults = fieldDefaults[type] || {};
  return {
    id: uuidv4(),
    type,
    label: defaults.label || 'New Field',
    placeholder: defaults.placeholder || '',
    description: defaults.description || '',
    required: defaults.required !== undefined ? defaults.required : false,
    order: 0,
    width: 'full',
    options: defaults.options,
    validation: defaults.validation,
  };
};

// Calculate how fields should be displayed in a row based on their width
export const calculateFieldLayout = (fields: FormField[]): FormField[][] => {
  const rows: FormField[][] = [];
  let currentRow: FormField[] = [];
  let currentRowWidth = 0;

  // Sort fields by order
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  sortedFields.forEach((field) => {
    // Calculate field width as a fraction
    let fieldWidth: number;
    if (field.width === 'half') {
      fieldWidth = 0.5;
    } else if (field.width === 'third') {
      fieldWidth = 0.33;
    } else {
      fieldWidth = 1;
    }

    // Check if field fits in current row
    if (currentRowWidth + fieldWidth > 1) {
      // Start a new row
      rows.push(currentRow);
      currentRow = [field];
      currentRowWidth = fieldWidth;
    } else {
      // Add to current row
      currentRow.push(field);
      currentRowWidth += fieldWidth;
    }
  });

  // Add the last row if it has fields
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
};

// Convert snake_case or camelCase to Title Case
export const formatFieldType = (fieldType: string): string => {
  return fieldType
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
