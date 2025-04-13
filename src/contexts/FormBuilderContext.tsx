import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  CustomApplicationForm,
  FormField,
  FormFieldType,
  FormPage,
  FormCondition
} from '../models/types';

// Default form settings
const defaultSettings = {
  saveProgress: true,
  autoSaveInterval: 30,
  confirmationMessage: 'Thank you for submitting your application.',
  allowFileAttachments: true,
  maxAttachmentSize: 5, // in MB
  branding: {
    primaryColor: '#1976d2',
    fontFamily: 'Roboto, sans-serif'
  }
};

// Sample form for initialization
const sampleForm: CustomApplicationForm = {
  id: uuidv4(),
  name: 'General Application Form',
  description: 'Standard application form for all positions',
  isDefault: true,
  pages: [
    {
      id: uuidv4(),
      title: 'Personal Information',
      description: 'Tell us about yourself',
      order: 0,
      fields: [
        {
          id: uuidv4(),
          type: 'Name',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          required: true,
          order: 0,
          width: 'full',
        },
        {
          id: uuidv4(),
          type: 'Email',
          label: 'Email Address',
          placeholder: 'Enter your email address',
          required: true,
          order: 1,
          width: 'full',
        },
        {
          id: uuidv4(),
          type: 'Phone',
          label: 'Phone Number',
          placeholder: 'Enter your phone number',
          required: true,
          order: 2,
          width: 'full',
        }
      ]
    },
    {
      id: uuidv4(),
      title: 'Professional Information',
      description: 'Tell us about your professional experience',
      order: 1,
      fields: [
        {
          id: uuidv4(),
          type: 'FileUpload',
          label: 'Resume/CV',
          description: 'Upload your resume or CV',
          required: true,
          order: 0,
          width: 'full',
          validation: {
            acceptedFileTypes: ['.pdf', '.doc', '.docx'],
            maxFileSize: 5
          }
        },
        {
          id: uuidv4(),
          type: 'LongText',
          label: 'Professional Summary',
          placeholder: 'Briefly describe your professional experience',
          required: true,
          order: 1,
          width: 'full',
        }
      ]
    }
  ],
  conditions: [],
  settings: defaultSettings,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Context type definition
interface FormBuilderContextType {
  forms: CustomApplicationForm[];
  activeForm: CustomApplicationForm | null;
  activePage: FormPage | null;
  activeField: FormField | null;
  
  // Form operations
  createForm: (name: string, description?: string) => CustomApplicationForm;
  updateForm: (formId: string, updates: Partial<CustomApplicationForm>) => void;
  deleteForm: (formId: string) => void;
  setActiveForm: (formId: string) => void;
  
  // Page operations
  addPage: (formId: string, pageData?: Partial<FormPage>) => FormPage;
  updatePage: (formId: string, pageId: string, updates: Partial<FormPage>) => void;
  deletePage: (formId: string, pageId: string) => void;
  reorderPages: (formId: string, sourceIndex: number, destinationIndex: number) => void;
  setActivePage: (pageId: string) => void;
  
  // Field operations
  addField: (formId: string, pageId: string, fieldData?: Partial<FormField>) => FormField;
  updateField: (formId: string, pageId: string, fieldId: string, updates: Partial<FormField>) => void;
  deleteField: (formId: string, pageId: string, fieldId: string) => void;
  reorderFields: (formId: string, pageId: string, sourceIndex: number, destinationIndex: number) => void;
  duplicateField: (formId: string, pageId: string, fieldId: string) => FormField;
  setActiveField: (fieldId: string) => void;
  
  // Conditional logic
  addCondition: (formId: string, condition: Partial<FormCondition>) => FormCondition;
  updateCondition: (formId: string, conditionId: string, updates: Partial<FormCondition>) => void;
  deleteCondition: (formId: string, conditionId: string) => void;
  
  // Form preview and publishing
  getFormPreview: (formId: string) => CustomApplicationForm | null;
  publishForm: (formId: string, jobId?: number) => void;
}

// Create the context
const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined);

// Provider component
export const FormBuilderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [forms, setForms] = useState<CustomApplicationForm[]>([sampleForm]);
  const [activeFormId, setActiveFormId] = useState<string | null>(sampleForm.id);
  const [activePageId, setActivePageId] = useState<string | null>(sampleForm.pages[0].id);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  
  // Computed values
  const activeForm = forms.find(form => form.id === activeFormId) || null;
  const activePage = activeForm?.pages.find(page => page.id === activePageId) || null;
  const activeField = activePage?.fields.find(field => field.id === activeFieldId) || null;
  
  // Form operations
  const createForm = (name: string, description?: string): CustomApplicationForm => {
    const newForm: CustomApplicationForm = {
      id: uuidv4(),
      name,
      description,
      isDefault: false,
      pages: [
        {
          id: uuidv4(),
          title: 'Page 1',
          order: 0,
          fields: []
        }
      ],
      conditions: [],
      settings: defaultSettings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setForms(prev => [...prev, newForm]);
    setActiveFormId(newForm.id);
    setActivePageId(newForm.pages[0].id);
    setActiveFieldId(null);
    
    return newForm;
  };
  
  const updateForm = (formId: string, updates: Partial<CustomApplicationForm>) => {
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
  };
  
  const deleteForm = (formId: string) => {
    // Don't delete if it's the last form
    if (forms.length === 1) return;
    
    setForms(prev => prev.filter(form => form.id !== formId));
    
    // If we're deleting the active form, set a new active form
    if (activeFormId === formId) {
      const remainingForm = forms.find(form => form.id !== formId);
      if (remainingForm) {
        setActiveFormId(remainingForm.id);
        setActivePageId(remainingForm.pages[0]?.id || null);
        setActiveFieldId(null);
      }
    }
  };
  
  const setActiveForm = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      setActiveFormId(formId);
      setActivePageId(form.pages[0]?.id || null);
      setActiveFieldId(null);
    }
  };
  
  // Page operations
  const addPage = (formId: string, pageData?: Partial<FormPage>): FormPage => {
    const form = forms.find(f => f.id === formId);
    if (!form) throw new Error(`Form with ID ${formId} not found`);
    
    const newPage: FormPage = {
      id: uuidv4(),
      title: pageData?.title || `Page ${form.pages.length + 1}`,
      description: pageData?.description || '',
      order: form.pages.length,
      fields: []
    };
    
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form, 
            pages: [...form.pages, newPage],
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
    
    setActivePageId(newPage.id);
    setActiveFieldId(null);
    
    return newPage;
  };
  
  const updatePage = (formId: string, pageId: string, updates: Partial<FormPage>) => {
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form, 
            pages: form.pages.map(page => {
              if (page.id === pageId) {
                return { ...page, ...updates };
              }
              return page;
            }),
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
  };
  
  const deletePage = (formId: string, pageId: string) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;
    
    // Don't delete if it's the last page
    if (form.pages.length === 1) return;
    
    // Get updated pages with correct order after deletion
    const updatedPages = form.pages
      .filter(page => page.id !== pageId)
      .map((page, index) => ({ ...page, order: index }));
    
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form, 
            pages: updatedPages,
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
    
    // If we're deleting the active page, set a new active page
    if (activePageId === pageId) {
      setActivePageId(updatedPages[0]?.id || null);
      setActiveFieldId(null);
    }
  };
  
  const reorderPages = (formId: string, sourceIndex: number, destinationIndex: number) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;
    
    const newPages = [...form.pages];
    const [removed] = newPages.splice(sourceIndex, 1);
    newPages.splice(destinationIndex, 0, removed);
    
    // Update order property for each page
    const updatedPages = newPages.map((page, index) => ({
      ...page,
      order: index
    }));
    
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form, 
            pages: updatedPages,
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
  };
  
  const setActivePage = (pageId: string) => {
    setActivePageId(pageId);
    setActiveFieldId(null);
  };
  
  // Field operations
  const addField = (formId: string, pageId: string, fieldData?: Partial<FormField>): FormField => {
    const form = forms.find(f => f.id === formId);
    if (!form) throw new Error(`Form with ID ${formId} not found`);
    
    const page = form.pages.find(p => p.id === pageId);
    if (!page) throw new Error(`Page with ID ${pageId} not found`);
    
    const newField: FormField = {
      id: uuidv4(),
      type: fieldData?.type || 'ShortText',
      label: fieldData?.label || 'New Field',
      placeholder: fieldData?.placeholder || '',
      description: fieldData?.description || '',
      required: fieldData?.required !== undefined ? fieldData.required : false,
      order: page.fields.length,
      width: fieldData?.width || 'full',
      ...fieldData
    };
    
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form, 
            pages: form.pages.map(page => {
              if (page.id === pageId) {
                return {
                  ...page,
                  fields: [...page.fields, newField]
                };
              }
              return page;
            }),
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
    
    setActiveFieldId(newField.id);
    
    return newField;
  };
  
  const updateField = (formId: string, pageId: string, fieldId: string, updates: Partial<FormField>) => {
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form, 
            pages: form.pages.map(page => {
              if (page.id === pageId) {
                return {
                  ...page,
                  fields: page.fields.map(field => {
                    if (field.id === fieldId) {
                      return { ...field, ...updates };
                    }
                    return field;
                  })
                };
              }
              return page;
            }),
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
  };
  
  const deleteField = (formId: string, pageId: string, fieldId: string) => {
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form, 
            pages: form.pages.map(page => {
              if (page.id === pageId) {
                // Get updated fields with correct order after deletion
                const updatedFields = page.fields
                  .filter(field => field.id !== fieldId)
                  .map((field, index) => ({ ...field, order: index }));
                
                return {
                  ...page,
                  fields: updatedFields
                };
              }
              return page;
            }),
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
    
    // If we're deleting the active field, clear the active field
    if (activeFieldId === fieldId) {
      setActiveFieldId(null);
    }
  };
  
  const reorderFields = (formId: string, pageId: string, sourceIndex: number, destinationIndex: number) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;
    
    const page = form.pages.find(p => p.id === pageId);
    if (!page) return;
    
    const newFields = [...page.fields];
    const [removed] = newFields.splice(sourceIndex, 1);
    newFields.splice(destinationIndex, 0, removed);
    
    // Update order property for each field
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      order: index
    }));
    
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form, 
            pages: form.pages.map(page => {
              if (page.id === pageId) {
                return {
                  ...page,
                  fields: updatedFields
                };
              }
              return page;
            }),
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
  };
  
  const duplicateField = (formId: string, pageId: string, fieldId: string): FormField => {
    const form = forms.find(f => f.id === formId);
    if (!form) throw new Error(`Form with ID ${formId} not found`);
    
    const page = form.pages.find(p => p.id === pageId);
    if (!page) throw new Error(`Page with ID ${pageId} not found`);
    
    const field = page.fields.find(f => f.id === fieldId);
    if (!field) throw new Error(`Field with ID ${fieldId} not found`);
    
    // Create a duplicate with a new ID and appended name
    const duplicate: FormField = {
      ...field,
      id: uuidv4(),
      label: `${field.label} (Copy)`,
      order: page.fields.length
    };
    
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form, 
            pages: form.pages.map(page => {
              if (page.id === pageId) {
                return {
                  ...page,
                  fields: [...page.fields, duplicate]
                };
              }
              return page;
            }),
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
    
    setActiveFieldId(duplicate.id);
    
    return duplicate;
  };
  
  const setActiveField = (fieldId: string) => {
    setActiveFieldId(fieldId);
  };
  
  // Conditional logic
  const addCondition = (formId: string, condition: Partial<FormCondition>): FormCondition => {
    const newCondition: FormCondition = {
      id: uuidv4(),
      fieldId: condition.fieldId || '',
      operator: condition.operator || 'equals',
      value: condition.value || '',
      values: condition.values || []
    };
    
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form, 
            conditions: [...form.conditions, newCondition],
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
    
    return newCondition;
  };
  
  const updateCondition = (formId: string, conditionId: string, updates: Partial<FormCondition>) => {
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form, 
            conditions: form.conditions.map(condition => {
              if (condition.id === conditionId) {
                return { ...condition, ...updates };
              }
              return condition;
            }),
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
  };
  
  const deleteCondition = (formId: string, conditionId: string) => {
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form, 
            conditions: form.conditions.filter(c => c.id !== conditionId),
            // Also remove references to this condition from any fields
            pages: form.pages.map(page => ({
              ...page,
              fields: page.fields.map(field => {
                if (field.conditionId === conditionId) {
                  const { conditionId, ...rest } = field;
                  return rest;
                }
                return field;
              })
            })),
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
  };
  
  // Form preview and publishing
  const getFormPreview = (formId: string): CustomApplicationForm | null => {
    return forms.find(form => form.id === formId) || null;
  };
  
  const publishForm = (formId: string, jobId?: number) => {
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          return { 
            ...form,
            jobId,
            updatedAt: new Date().toISOString() 
          };
        }
        return form;
      })
    );
    
    // In a real app, this would make an API call to publish the form
    console.log(`Form ${formId} published${jobId ? ` for job ${jobId}` : ''}`);
  };
  
  // Context value
  const value = {
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
    getFormPreview,
    publishForm
  };
  
  return (
    <FormBuilderContext.Provider value={value}>
      {children}
    </FormBuilderContext.Provider>
  );
};

// Custom hook to use the context
export const useFormBuilder = () => {
  const context = useContext(FormBuilderContext);
  if (context === undefined) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  return context;
}; 