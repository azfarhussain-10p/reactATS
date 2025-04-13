import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { securityService } from '../services/SecurityService';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'recruiter' | 'interviewer' | 'hiring_manager' | 'candidate';
  permissions: string[];
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  firstName: string;
  lastName: string;
  exp: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  checkPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL from env or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          // Verify token expiration
          const decoded = jwtDecode<JwtPayload>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired, try to refresh
            const refreshed = await refreshToken();
            if (!refreshed) {
              // Refresh failed, clear storage
              localStorage.removeItem('auth_token');
              setAuthState({
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
                error: 'Session expired. Please login again.',
              });
            }
          } else {
            // Valid token, set up auth state
            setupAuthState(token);
          }
        } catch (error) {
          console.error('Error parsing token:', error);
          localStorage.removeItem('auth_token');
          setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: 'Invalid authentication token. Please login again.',
          });
        }
      } else {
        // No token found
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Set up auth headers for API requests
  useEffect(() => {
    if (authState.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authState.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [authState.token]);

  // Set up auth state from token
  const setupAuthState = (token: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      
      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role as User['role'],
        permissions: decoded.permissions || [],
      };
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null,
      });
      
      // Set token and user role in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('userRole', user.role);
      
      // Set up auth header for API requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return true;
    } catch (error) {
      console.error('Error setting up auth state:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: 'Error processing authentication. Please try again.',
      });
      
      localStorage.removeItem('auth_token');
      localStorage.removeItem('userRole');
      delete axios.defaults.headers.common['Authorization'];
      
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Use SecurityService for authentication
      const authResult = await securityService.authenticate(email, password);
      
      if (authResult && authResult.token) {
        setupAuthState(authResult.token);
        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Login failed. Invalid credentials.',
        }));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Login failed. Please check your credentials and try again.',
      }));
      
      return false;
    }
  };

  const logout = () => {
    if (authState.token) {
      securityService.logout(authState.token);
    }
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userRole');
    delete axios.defaults.headers.common['Authorization'];
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
    });

    // Trigger auth change event for other tabs
    window.dispatchEvent(new Event('auth-change'));
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Use SecurityService for registration
      const result = await securityService.registerUser(userData);
      
      if (result.success && result.token) {
        setupAuthState(result.token);
        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.message || 'Registration failed. Please try again.',
        }));
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Registration failed. Please try again.',
      }));
      
      return false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      // Use SecurityService for token refresh
      const newToken = await securityService.refreshToken();
      
      if (newToken) {
        setupAuthState(newToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!authState.isAuthenticated || !authState.user) {
      return false;
    }
    
    return authState.user.permissions.includes(permission);
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!authState.isAuthenticated || !authState.user) {
      return false;
    }
    
    if (Array.isArray(role)) {
      return role.includes(authState.user.role);
    }
    
    return authState.user.role === role;
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!authState.isAuthenticated || !authState.user) {
      return false;
    }
    
    try {
      const response = await axios.put(`${API_URL}/auth/user`, userData);
      
      if (response.data.user) {
        setAuthState(prev => ({
          ...prev,
          user: { ...prev.user!, ...response.data.user },
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    refreshToken,
    checkPermission,
    hasRole,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Higher-order component to protect routes that require authentication
export const withAuth = <P extends Object>(
  Component: React.ComponentType<P>,
  requiredPermission?: string,
  requiredRole?: string | string[]
) => {
  const WithAuth: React.FC<P> = (props) => {
    const { isAuthenticated, loading, checkPermission, hasRole } = useAuth();
    
    if (loading) {
      return <div>Loading authentication...</div>;
    }
    
    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }
    
    if (requiredPermission && !checkPermission(requiredPermission)) {
      return <div>You don't have permission to access this page.</div>;
    }
    
    if (requiredRole && !hasRole(requiredRole)) {
      return <div>Your role doesn't allow access to this page.</div>;
    }
    
    return <Component {...props} />;
  };
  
  return WithAuth;
};

export default AuthContext; 