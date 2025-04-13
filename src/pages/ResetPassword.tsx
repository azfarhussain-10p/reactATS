import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';
import { announce } from '../components/ScreenReaderAnnouncer';

// Safe announce function that won't throw errors
const safeAnnounce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
  try {
    announce(message, politeness);
  } catch (error) {
    console.log('Screen reader announcement failed:', message);
  }
};

function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    // In a real app, this would verify the token with an API call
    // For demo purposes, we'll just validate the token format
    if (!token || token.length < 20) {
      setTokenValid(false);
      setError('Invalid or expired password reset link. Please request a new one.');
      safeAnnounce('Invalid or expired password reset link. Please request a new one.', 'assertive');
    }
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenValid) {
      return;
    }
    
    // Reset status messages
    setError('');
    setSuccess('');
    
    // Simple validation
    if (!password.trim() || !confirmPassword.trim()) {
      setError('All fields are required');
      safeAnnounce('Password reset failed. All fields are required.', 'assertive');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      safeAnnounce('Password reset failed. Passwords do not match.', 'assertive');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      safeAnnounce('Password reset failed. Password must be at least 6 characters long.', 'assertive');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would call an API to reset the password
      // For demo purposes, just show success message after a delay
      setTimeout(() => {
        setSuccess('Your password has been reset successfully. You will be redirected to login page.');
        safeAnnounce('Your password has been reset successfully.', 'polite');
        
        // Clear form
        setPassword('');
        setConfirmPassword('');
        setIsSubmitting(false);
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An error occurred while resetting your password. Please try again.');
      safeAnnounce('Password reset failed. An error occurred.', 'assertive');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container reset-password-container">
        <div className="form-container reset-password-form">
          {!tokenValid ? (
            <div className="token-error">
              <h1>Error</h1>
              <p className="error-message" role="alert">{error}</p>
              <Link to="/forgot-password" className="button-link">
                Request New Reset Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1>Reset Your Password</h1>
              <p className="form-description">
                Please enter your new password below.
              </p>
              
              {error && <div className="error-message" role="alert">{error}</div>}
              {success && <div className="success-message" role="alert">{success}</div>}
              
              <input 
                type="password" 
                placeholder="New Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="New Password"
              />
              
              <input 
                type="password" 
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-label="Confirm Password"
              />
              
              <button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
              
              <div className="form-links">
                <Link to="/login">Back to Login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword; 