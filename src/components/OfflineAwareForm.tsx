import React, { ReactNode, FormEvent, useState } from 'react';
import { Box, Alert, Snackbar, Button } from '@mui/material';
import useOfflineAwareSubmit from '../hooks/useOfflineAwareSubmit';

interface OfflineAwareFormProps {
  children: ReactNode;
  onSubmit: (data: any) => any;
  apiEndpoint: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  successMessage?: string;
  errorMessage?: string;
  offlineMessage?: string;
  showAlerts?: boolean;
  formData?: (formElement: HTMLFormElement) => any;
  customHeaders?: Record<string, string>;
}

/**
 * A form component that handles online/offline submissions
 * 
 * When online, it submits normally
 * When offline, it saves the submission for later and shows a message
 */
const OfflineAwareForm: React.FC<OfflineAwareFormProps> = ({
  children,
  onSubmit,
  apiEndpoint,
  method = 'POST',
  successMessage = 'Form submitted successfully!',
  errorMessage = 'Error submitting form. Please try again.',
  offlineMessage = 'You are offline. Form has been saved and will be submitted when you reconnect.',
  showAlerts = true,
  formData,
  customHeaders
}) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  const { 
    submit, 
    isLoading, 
    isSuccess, 
    isError, 
    isOfflineQueued,
    error, 
    data 
  } = useOfflineAwareSubmit({
    onSuccess: (responseData) => {
      if (showAlerts) {
        setAlertMessage(successMessage);
        setAlertSeverity('success');
        setAlertOpen(true);
      }
      
      if (onSubmit && typeof onSubmit === 'function') {
        onSubmit(responseData);
      }
    },
    onError: (error) => {
      if (showAlerts) {
        setAlertMessage(errorMessage);
        setAlertSeverity('error');
        setAlertOpen(true);
      }
    },
    onOfflineQueued: () => {
      if (showAlerts) {
        setAlertMessage(offlineMessage);
        setAlertSeverity('warning');
        setAlertOpen(true);
      }
      
      if (onSubmit && typeof onSubmit === 'function') {
        onSubmit({ offlineQueued: true, message: offlineMessage });
      }
    }
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    let submitData;
    
    if (formData && typeof formData === 'function') {
      // Use custom function to get form data
      submitData = formData(form);
    } else {
      // Get form data automatically
      const formElements = Array.from(form.elements) as HTMLFormElement[];
      submitData = {};
      
      formElements.forEach(element => {
        // Skip non-input elements and those without names
        if (!element.name || element.nodeName === 'BUTTON') return;
        
        if (element.type === 'checkbox') {
          submitData[element.name] = element.checked;
        } else if (element.type === 'radio') {
          if (element.checked) {
            submitData[element.name] = element.value;
          }
        } else if (element.type === 'file') {
          // For file inputs, get the files
          submitData[element.name] = element.files;
        } else {
          // For text, email, number, etc. inputs
          submitData[element.name] = element.value;
        }
      });
    }
    
    try {
      const result = await submit(apiEndpoint, method, submitData, { headers: customHeaders });
      // Form reset on success if not offline queued
      if (isSuccess && !isOfflineQueued) {
        form.reset();
      }
      return result;
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        {children}
        
        {/* If you want to show loading/disabled state on the submit button,
            you can wrap your submit button with this component and pass a ref */}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Button && child.props.type === 'submit') {
            return React.cloneElement(child, {
              disabled: isLoading || child.props.disabled,
              ...child.props
            });
          }
          return child;
        })}
      </form>
      
      {showAlerts && (
        <Snackbar
          open={alertOpen}
          autoHideDuration={6000}
          onClose={() => setAlertOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setAlertOpen(false)} 
            severity={alertSeverity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default OfflineAwareForm; 