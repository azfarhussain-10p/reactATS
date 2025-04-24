import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

// Types
interface SecurityConfig {
  csrfHeaderName: string;
  csrfEnabled: boolean;
  rateLimitMax: number;
  rateLimitTimeWindowMs: number;
  encryptionEnabled: boolean;
}

interface SecurityState {
  config: SecurityConfig;
  csrfToken: string | null;
  rateLimitRemaining: number;
  securityInitialized: boolean;
}

interface SecurityContextType extends SecurityState {
  refreshCsrfToken: () => Promise<string | null>;
  encrypt: (data: string) => Promise<string>;
  decrypt: (encryptedData: string) => Promise<string>;
}

// Default security configuration
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  csrfHeaderName: 'X-CSRF-Token',
  csrfEnabled: true,
  rateLimitMax: 100,
  rateLimitTimeWindowMs: 60000, // 1 minute
  encryptionEnabled: true,
};

// API URL from env or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create context
const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [securityState, setSecurityState] = useState<SecurityState>({
    config: DEFAULT_SECURITY_CONFIG,
    csrfToken: null,
    rateLimitRemaining: DEFAULT_SECURITY_CONFIG.rateLimitMax,
    securityInitialized: false,
  });

  // Initialize security on mount
  useEffect(() => {
    const initSecurity = async () => {
      try {
        // Fetch security configuration from API
        const configResponse = await axios.get(`${API_URL}/security/config`);
        
        if (configResponse.data) {
          setSecurityState(prev => ({
            ...prev,
            config: {
              ...prev.config,
              ...configResponse.data,
            },
          }));
        }
      } catch (error) {
        console.warn('Could not fetch security config, using defaults:', error);
      }

      try {
        // Get initial CSRF token
        await refreshCsrfToken();
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }

      setSecurityState(prev => ({
        ...prev,
        securityInitialized: true,
      }));
    };

    initSecurity();
  }, []);

  // Configure request interceptors for security headers and CSRF
  useEffect(() => {
    // Request interceptor for adding security headers and CSRF token
    const requestInterceptor = axios.interceptors.request.use(
      async config => {
        // Add CSRF token if enabled
        if (securityState.config.csrfEnabled && securityState.csrfToken) {
          config.headers[securityState.config.csrfHeaderName] = securityState.csrfToken;
        }

        // Add additional security headers
        config.headers['X-Content-Type-Options'] = 'nosniff';
        config.headers['X-Frame-Options'] = 'DENY';
        config.headers['X-XSS-Protection'] = '1; mode=block';
        
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling security-related responses
    const responseInterceptor = axios.interceptors.response.use(
      response => {
        // Update rate limit info if present in headers
        const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
        if (rateLimitRemaining) {
          setSecurityState(prev => ({
            ...prev,
            rateLimitRemaining: parseInt(rateLimitRemaining, 10),
          }));
        }

        // Update CSRF token if present in headers
        const newCsrfToken = response.headers[securityState.config.csrfHeaderName.toLowerCase()];
        if (newCsrfToken) {
          setSecurityState(prev => ({
            ...prev,
            csrfToken: newCsrfToken,
          }));
        }

        return response;
      },
      async error => {
        // Handle 403 errors (CSRF or permission issues)
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          // If it's a CSRF issue, try to refresh the token
          if (error.response.headers['x-csrf-error']) {
            try {
              await refreshCsrfToken();
              // Retry the request with the new token
              if (error.config) {
                return axios(error.config);
              }
            } catch (refreshError) {
              console.error('Failed to refresh CSRF token:', refreshError);
            }
          }
        }

        // Handle 429 rate limit errors
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.warn('Rate limit exceeded. Please try again later.');
          // Update rate limit info
          const rateLimitReset = error.response.headers['x-ratelimit-reset'];
          if (rateLimitReset) {
            const resetTime = parseInt(rateLimitReset, 10);
            console.log(`Rate limit will reset at ${new Date(resetTime).toLocaleTimeString()}`);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [securityState.config, securityState.csrfToken]);

  // Method to refresh CSRF token
  const refreshCsrfToken = async (): Promise<string | null> => {
    if (!securityState.config.csrfEnabled) {
      return null;
    }
    
    try {
      const response = await axios.get(`${API_URL}/security/csrf-token`);
      const newToken = response.data.token;
      
      if (newToken) {
        setSecurityState(prev => ({
          ...prev,
          csrfToken: newToken,
        }));
        return newToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error refreshing CSRF token:', error);
      return null;
    }
  };

  // Client-side encryption method (using crypto-js in a real implementation)
  const encrypt = async (data: string): Promise<string> => {
    if (!securityState.config.encryptionEnabled) {
      return data;
    }
    
    try {
      // In a real implementation, this would use a library like crypto-js
      // For now, we'll just simulate encryption with Base64 encoding
      // const encrypted = CryptoJS.AES.encrypt(data, encryptionKey).toString();
      const encrypted = btoa(data);
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  };

  // Client-side decryption method
  const decrypt = async (encryptedData: string): Promise<string> => {
    if (!securityState.config.encryptionEnabled) {
      return encryptedData;
    }
    
    try {
      // In a real implementation, this would use a library like crypto-js
      // For now, we'll just simulate decryption with Base64 decoding
      // const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey).toString(CryptoJS.enc.Utf8);
      const decrypted = atob(encryptedData);
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  };

  // Context value
  const value: SecurityContextType = {
    ...securityState,
    refreshCsrfToken,
    encrypt,
    decrypt,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

// Hook for using the security context
export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  
  return context;
};

export default SecurityContext; 