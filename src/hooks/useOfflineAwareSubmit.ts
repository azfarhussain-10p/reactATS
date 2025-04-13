import { useState, useCallback } from 'react';
import { offlineAwareApiCall } from '../utils/offlineFormHandler';

interface UseOfflineAwareSubmitOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onOfflineQueued?: () => void;
}

interface SubmitState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isOfflineQueued: boolean;
  error: any | null;
  data: any | null;
}

/**
 * Hook to handle form submissions that work in offline mode
 * @param options Configuration options for the hook
 * @returns Object with submission state and submit function
 */
export const useOfflineAwareSubmit = (options: UseOfflineAwareSubmitOptions = {}) => {
  const { onSuccess, onError, onOfflineQueued } = options;
  
  const [state, setState] = useState<SubmitState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    isOfflineQueued: false,
    error: null,
    data: null
  });

  const submit = useCallback(
    async <T>(url: string, method: string = 'POST', data: any = null, customOptions = {}) => {
      setState({
        isLoading: true,
        isSuccess: false,
        isError: false,
        isOfflineQueued: false,
        error: null,
        data: null
      });
      
      try {
        const response = await offlineAwareApiCall<T>(url, method, data, customOptions);
        
        // Check if this was queued for offline processing
        if (
          response && 
          typeof response === 'object' && 
          'offlineQueued' in response && 
          (response as any).offlineQueued === true
        ) {
          setState({
            isLoading: false,
            isSuccess: false,
            isError: false,
            isOfflineQueued: true,
            error: null,
            data: response
          });
          
          if (onOfflineQueued) {
            onOfflineQueued();
          }
        } else {
          setState({
            isLoading: false,
            isSuccess: true,
            isError: false,
            isOfflineQueued: false,
            error: null,
            data: response
          });
          
          if (onSuccess) {
            onSuccess(response);
          }
        }
        
        return response;
      } catch (error) {
        setState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          isOfflineQueued: false,
          error,
          data: null
        });
        
        if (onError) {
          onError(error);
        }
        
        throw error;
      }
    },
    [onSuccess, onError, onOfflineQueued]
  );

  return {
    ...state,
    submit
  };
};

export default useOfflineAwareSubmit; 