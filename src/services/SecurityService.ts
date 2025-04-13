import axios from 'axios';
import { jwtDecode, JwtPayload as BaseJwtPayload } from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';

// Custom JwtPayload interface extending the base one
interface JwtPayload extends BaseJwtPayload {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  firstName: string;
  lastName: string;
}

// Security configuration interface
interface SecurityConfig {
  jwtExpirationMinutes: number;
  csrfHeaderName: string;
  csrfEnabled: boolean;
  rateLimitMax: number;
  rateLimitTimeWindowMs: number;
  passwordMinLength: number;
  passwordRequireSpecialChar: boolean;
  passwordRequireNumber: boolean;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  secureHttpHeadersEnabled: boolean;
  sessionTimeoutMinutes: number;
  encryptionEnabled: boolean;
  mfaEnabled: boolean;
}

// Security event types
enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// Mock bcrypt implementation (in a real app, this would use the actual bcrypt library)
class BcryptMock {
  private static saltRounds = 10;

  static async hash(password: string): Promise<string> {
    // Simple mock implementation - DO NOT use in production
    const salt = uuidv4().substring(0, 8);
    return `${salt}:${this.mockHash(password, salt)}`;
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    // Simple mock implementation - DO NOT use in production
    const [salt, storedHash] = hash.split(':');
    return this.mockHash(password, salt) === storedHash;
  }

  private static mockHash(password: string, salt: string): string {
    // This is a very simple mock, not secure at all
    // In a real app, use actual bcrypt
    return btoa(`${password}${salt}`).substring(0, 24);
  }
}

/**
 * Comprehensive security service that implements security best practices
 */
class SecurityService {
  private static instance: SecurityService;
  private config: SecurityConfig;
  private csrfToken: string | null = null;
  private securityEvents: Array<{type: SecurityEventType, timestamp: Date, details?: any}> = [];
  private rateLimitCounters: Map<string, {count: number, resetTime: number}> = new Map();
  private activeTokens: Set<string> = new Set();
  private refreshTokens: Map<string, string> = new Map(); // userId -> refreshToken

  // API URL from env or default
  private apiUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  private constructor() {
    // Default security configuration
    this.config = {
      jwtExpirationMinutes: 60,
      csrfHeaderName: 'X-CSRF-Token',
      csrfEnabled: true,
      rateLimitMax: 100,
      rateLimitTimeWindowMs: 60000, // 1 minute
      passwordMinLength: 10,
      passwordRequireSpecialChar: true,
      passwordRequireNumber: true,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      secureHttpHeadersEnabled: true,
      sessionTimeoutMinutes: 30,
      encryptionEnabled: true,
      mfaEnabled: false,
    };

    // Set up interceptors for security headers
    this.setupInterceptors();
    
    // Generate initial CSRF token
    this.refreshCsrfToken();
    
    // Load security configuration (async operation)
    this.loadSecurityConfig();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Sets up interceptors for security headers and request monitoring
   */
  private setupInterceptors(): void {
    // Request interceptor for adding security headers and CSRF token
    axios.interceptors.request.use(
      config => {
        if (this.config.secureHttpHeadersEnabled) {
          // Add security headers (similar to helmet.js)
          config.headers['X-Content-Type-Options'] = 'nosniff';
          config.headers['X-Frame-Options'] = 'DENY';
          config.headers['X-XSS-Protection'] = '1; mode=block';
          config.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
          config.headers['Referrer-Policy'] = 'same-origin';
          config.headers['Feature-Policy'] = "camera 'none'; microphone 'none'";
        }

        // Add CSRF token if enabled
        if (this.config.csrfEnabled && this.csrfToken) {
          config.headers[this.config.csrfHeaderName] = this.csrfToken;
        }

        // Apply rate limiting
        const endpoint = config.url || '';
        this.checkRateLimit(endpoint);

        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor for handling security-related responses
    axios.interceptors.response.use(
      response => {
        // Update CSRF token if present in headers
        const newCsrfToken = response.headers[this.config.csrfHeaderName.toLowerCase()];
        if (newCsrfToken) {
          this.csrfToken = newCsrfToken;
        }

        return response;
      },
      async error => {
        if (axios.isAxiosError(error)) {
          // Handle 401 Unauthorized (expired token)
          if (error.response?.status === 401) {
            // Try to refresh token
            const refreshed = await this.refreshToken();
            if (refreshed && error.config) {
              // Retry the request with new token
              return axios(error.config);
            }
          }

          // Handle 403 Forbidden (CSRF or permission issues)
          if (error.response?.status === 403) {
            // If it's a CSRF issue, try to refresh the token
            if (error.response.headers['x-csrf-error']) {
              this.refreshCsrfToken();
              if (error.config) {
                return axios(error.config);
              }
            }

            // Log permission denied event
            this.logSecurityEvent(SecurityEventType.PERMISSION_DENIED, {
              url: error.config?.url,
              method: error.config?.method,
            });
          }

          // Handle 429 Too Many Requests (rate limit)
          if (error.response?.status === 429) {
            this.logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, {
              url: error.config?.url,
              method: error.config?.method,
            });
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Load security configuration from API
   */
  private async loadSecurityConfig(): Promise<void> {
    try {
      const response = await axios.get(`${this.apiUrl}/security/config`);
      if (response.data) {
        this.config = {
          ...this.config,
          ...response.data,
        };
      }
    } catch (error) {
      console.warn('Could not fetch security config, using defaults:', error);
    }
  }

  /**
   * Refresh CSRF token
   */
  public async refreshCsrfToken(): Promise<string | null> {
    if (!this.config.csrfEnabled) {
      return null;
    }

    try {
      // In a real app, this would be an API call to get a new CSRF token
      // For now, we'll generate a UUID
      this.csrfToken = uuidv4();
      return this.csrfToken;
    } catch (error) {
      console.error('Error refreshing CSRF token:', error);
      return null;
    }
  }

  /**
   * Check if password meets security requirements
   */
  public validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check length
    if (password.length < this.config.passwordMinLength) {
      errors.push(`Password must be at least ${this.config.passwordMinLength} characters long`);
    }

    // Check for uppercase if required
    if (this.config.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase if required
    if (this.config.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check for number if required
    if (this.config.passwordRequireNumber && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Check for special character if required
    if (this.config.passwordRequireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Hash a password using bcrypt
   */
  public async hashPassword(password: string): Promise<string> {
    return await BcryptMock.hash(password);
  }

  /**
   * Verify a password against a hash
   */
  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await BcryptMock.compare(password, hash);
  }

  /**
   * Authenticate a user with JWT
   */
  public async authenticate(email: string, password: string): Promise<{ token: string; user: any } | null> {
    try {
      // In a real app, this would call the backend API
      // For this example, we'll simulate a response
      const mockResponse = await this.mockAuthApiCall(email, password);

      if (mockResponse.success) {
        // Add token to active tokens
        this.activeTokens.add(mockResponse.token);

        // Log successful login
        this.logSecurityEvent(SecurityEventType.LOGIN_SUCCESS, { email });

        return {
          token: mockResponse.token,
          user: mockResponse.user,
        };
      } else {
        // Log failed login attempt
        this.logSecurityEvent(SecurityEventType.LOGIN_FAILURE, { email });
        return null;
      }
    } catch (error) {
      // Log failed login attempt
      this.logSecurityEvent(SecurityEventType.LOGIN_FAILURE, { email, error });
      return null;
    }
  }

  /**
   * Verify a JWT token and extract user information
   */
  public verifyToken(token: string): { valid: boolean; payload?: JwtPayload } {
    try {
      // Check if token is in active tokens list
      if (!this.activeTokens.has(token)) {
        return { valid: false };
      }

      // Decode the token
      const decoded = jwtDecode<JwtPayload>(token);

      // Check expiration
      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        // Token has expired
        this.activeTokens.delete(token);
        return { valid: false };
      }

      return { valid: true, payload: decoded };
    } catch (error) {
      console.error('Error verifying token:', error);
      return { valid: false };
    }
  }

  /**
   * Refresh an expired JWT token
   */
  public async refreshToken(): Promise<string | null> {
    try {
      // In a real app, this would call the backend API with a refresh token
      // For this example, we'll simulate a response
      const mockRefreshResponse = await this.mockRefreshTokenApiCall();

      if (mockRefreshResponse.success) {
        this.activeTokens.add(mockRefreshResponse.token);
        return mockRefreshResponse.token;
      }

      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Log a user out
   */
  public logout(token: string): void {
    // Remove token from active tokens
    this.activeTokens.delete(token);

    // Log logout event
    this.logSecurityEvent(SecurityEventType.LOGOUT);

    // In a real app, you would also call the backend to invalidate the token
  }

  /**
   * Check if a user has a specific permission
   */
  public hasPermission(token: string, permission: string): boolean {
    const verification = this.verifyToken(token);
    if (!verification.valid || !verification.payload) {
      return false;
    }

    return verification.payload.permissions.includes(permission);
  }

  /**
   * Check if a user has a specific role
   */
  public hasRole(token: string, role: string | string[]): boolean {
    const verification = this.verifyToken(token);
    if (!verification.valid || !verification.payload) {
      return false;
    }

    const userRole = verification.payload.role;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return userRole === role;
  }

  /**
   * Apply rate limiting for an endpoint
   */
  private checkRateLimit(endpoint: string): void {
    const now = Date.now();
    const limit = this.config.rateLimitMax;
    const windowMs = this.config.rateLimitTimeWindowMs;

    let counter = this.rateLimitCounters.get(endpoint);
    
    if (!counter || now > counter.resetTime) {
      // Create new counter or reset expired counter
      counter = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      // Increment existing counter
      counter.count++;
      
      // Check if limit exceeded
      if (counter.count > limit) {
        this.logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, { endpoint });
        throw new Error(`Rate limit exceeded for endpoint: ${endpoint}`);
      }
    }
    
    this.rateLimitCounters.set(endpoint, counter);
  }

  /**
   * Log a security event
   */
  private logSecurityEvent(type: SecurityEventType, details?: any): void {
    const event = {
      type,
      timestamp: new Date(),
      details,
    };
    
    this.securityEvents.push(event);
    
    // In a real app, you would also send this to the backend for logging
    console.log(`Security event: ${type}`, details);
  }

  /**
   * Get security events (for admin purposes)
   */
  public getSecurityEvents(): Array<{type: SecurityEventType, timestamp: Date, details?: any}> {
    return [...this.securityEvents];
  }

  /**
   * Client-side encryption
   */
  public encrypt(data: string): string {
    if (!this.config.encryptionEnabled) {
      return data;
    }
    
    // In a real app, use a proper encryption library
    // This is a simple Base64 encoding for demonstration
    return btoa(data);
  }

  /**
   * Client-side decryption
   */
  public decrypt(encryptedData: string): string {
    if (!this.config.encryptionEnabled) {
      return encryptedData;
    }
    
    // In a real app, use a proper encryption library
    // This is a simple Base64 decoding for demonstration
    return atob(encryptedData);
  }

  /**
   * Mock API call for authentication
   * In a real app, this would be an actual API call
   */
  private async mockAuthApiCall(email: string, password: string): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock user database
    const users = [
      {
        id: '1',
        email: 'admin@example.com',
        passwordHash: await BcryptMock.hash('admin123'),
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        permissions: ['view:candidates', 'edit:candidates', 'delete:candidates', 'view:jobs', 'edit:jobs', 'view:reports', 'admin:panel', 'manage:users', 'manage:settings', 'view:analytics', 'schedule:interviews', 'conduct:interviews', 'manage:evaluations']
      },
      {
        id: '2',
        email: 'demo@example.com',
        passwordHash: await BcryptMock.hash('password'),
        firstName: 'Recruiter',
        lastName: 'User',
        role: 'recruiter',
        permissions: ['view:candidates', 'edit:candidates', 'view:jobs', 'edit:jobs', 'view:reports', 'schedule:interviews', 'view:analytics']
      }
    ];

    // Special case for demo credentials in development mode
    if (import.meta.env.DEV) {
      if (email === 'admin@example.com' && password === 'admin123') {
        const user = users[0];
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = 60 * this.config.jwtExpirationMinutes;
        
        // User data without sensitive information
        const userData = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions
        };
        
        // Create a mock JWT token
        const tokenPayload = {
          sub: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          firstName: user.firstName,
          lastName: user.lastName,
          iat: now,
          exp: now + expiresIn
        };
        
        // Encode the token payload as base64
        const tokenString = btoa(JSON.stringify(tokenPayload));
        const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenString}.mock-signature`;
        
        return {
          success: true,
          token: mockToken,
          refreshToken: 'mock-refresh-token',
          user: userData
        };
      }
      
      if (email === 'demo@example.com' && password === 'password') {
        const user = users[1];
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = 60 * this.config.jwtExpirationMinutes;
        
        // User data without sensitive information
        const userData = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions
        };
        
        // Create a mock JWT token
        const tokenPayload = {
          sub: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          firstName: user.firstName,
          lastName: user.lastName,
          iat: now,
          exp: now + expiresIn
        };
        
        // Encode the token payload as base64
        const tokenString = btoa(JSON.stringify(tokenPayload));
        const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenString}.mock-signature`;
        
        return {
          success: true,
          token: mockToken,
          refreshToken: 'mock-refresh-token',
          user: userData
        };
      }
    }
    
    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Verify password
    const passwordValid = await BcryptMock.compare(password, user.passwordHash);
    if (!passwordValid) {
      return { success: false, message: 'Invalid password' };
    }
    
    // Create JWT token
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 60 * this.config.jwtExpirationMinutes;
    
    // Generate refresh token and store it
    const refreshToken = uuidv4();
    this.refreshTokens.set(user.id, refreshToken);
    
    // User data without sensitive information
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions
    };
    
    // Create a mock JWT token
    // In a real app, this would be created by the backend
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      firstName: user.firstName,
      lastName: user.lastName,
      iat: now,
      exp: now + expiresIn
    };
    
    // Encode the token payload as base64
    const tokenString = btoa(JSON.stringify(tokenPayload));
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenString}.mock-signature`;
    
    return {
      success: true,
      token: mockToken,
      refreshToken,
      user: userData
    };
  }

  /**
   * Mock API call for token refresh
   * In a real app, this would be an actual API call
   */
  private async mockRefreshTokenApiCall(): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real app, this would validate the refresh token and issue a new JWT
    // For this example, we'll just return a new token
    
    // Create JWT token
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 60 * this.config.jwtExpirationMinutes;
    
    // Mock user for the new token
    const userData = {
      id: '1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      permissions: ['view:candidates', 'edit:candidates', 'delete:candidates', 'view:jobs', 'edit:jobs', 'view:reports', 'admin:panel', 'manage:users', 'manage:settings', 'view:analytics']
    };
    
    // Create a mock JWT token
    const tokenPayload = {
      sub: userData.id,
      email: userData.email,
      role: userData.role,
      permissions: userData.permissions,
      firstName: userData.firstName,
      lastName: userData.lastName,
      iat: now,
      exp: now + expiresIn
    };
    
    // Encode the token payload as base64
    const tokenString = btoa(JSON.stringify(tokenPayload));
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenString}.mock-signature`;
    
    return {
      success: true,
      token: mockToken
    };
  }

  /**
   * Register a new user securely
   */
  public async registerUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ success: boolean; message?: string; token?: string; user?: any }> {
    // Validate password
    const passwordValidation = this.validatePassword(userData.password);
    if (!passwordValidation.valid) {
      return {
        success: false,
        message: passwordValidation.errors.join(', ')
      };
    }
    
    try {
      // In a real app, this would call the backend API
      // For this example, we'll simulate a response
      
      // Hash the password
      const passwordHash = await this.hashPassword(userData.password);
      
      // Create a new user
      const newUser = {
        id: uuidv4(),
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'recruiter', // Default role for new users
        permissions: ['view:candidates', 'view:jobs'] // Default permissions
      };
      
      // Create JWT token
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = 60 * this.config.jwtExpirationMinutes;
      
      // User data without sensitive information
      const userResponse = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        permissions: newUser.permissions
      };
      
      // Create a mock JWT token
      const tokenPayload = {
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        iat: now,
        exp: now + expiresIn
      };
      
      // Encode the token payload as base64
      const tokenString = btoa(JSON.stringify(tokenPayload));
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenString}.mock-signature`;
      
      // Add token to active tokens
      this.activeTokens.add(mockToken);
      
      return {
        success: true,
        token: mockToken,
        user: userResponse
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  }

  /**
   * Request a password reset
   */
  public async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // In a real app, this would call the backend API to send a reset email
      // For this example, we'll just simulate a response
      
      // Log the password reset request event
      this.logSecurityEvent(SecurityEventType.PASSWORD_RESET_REQUEST, { email });
      
      return {
        success: true,
        message: 'Password reset link has been sent to your email'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to request password reset'
      };
    }
  }

  /**
   * Change a user's password
   */
  public async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    // Validate new password
    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return {
        success: false,
        message: passwordValidation.errors.join(', ')
      };
    }
    
    try {
      // In a real app, this would call the backend API
      // For this example, we'll just simulate a response
      
      // Log the password change event
      this.logSecurityEvent(SecurityEventType.PASSWORD_CHANGE, { userId });
      
      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to change password'
      };
    }
  }

  /**
   * Check for suspicious activity
   */
  public checkForSuspiciousActivity(userId: string, action: string, context: any): boolean {
    // In a real app, this would implement a more sophisticated detection algorithm
    // For this example, we'll just do a simple check
    
    // For demonstration, we'll flag any action from a different IP than usual
    const isKnownIP = context.ip === '127.0.0.1';
    
    if (!isKnownIP) {
      // Log suspicious activity
      this.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        userId,
        action,
        context
      });
      
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
export default SecurityService;
export const securityService = SecurityService.getInstance(); 