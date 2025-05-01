import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset status messages
    setError('');
    setSuccess('');

    // Simple validation
    if (!email.trim()) {
      setError('Email is required');
      safeAnnounce('Password reset failed. Email is required.', 'assertive');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      safeAnnounce('Password reset failed. Please enter a valid email address.', 'assertive');
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would call an API to initiate password reset
      // For demo purposes, just show success message after a delay
      setTimeout(() => {
        setSuccess('Password reset instructions have been sent to your email.');
        safeAnnounce('Password reset instructions have been sent to your email.', 'polite');
        setEmail(''); // Clear form
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An error occurred. Please try again.');
      safeAnnounce('Password reset failed. An error occurred.', 'assertive');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container forgot-password-container">
        <div className="form-container forgot-password-form">
          <form onSubmit={handleSubmit}>
            <h1>Reset Your Password</h1>
            <p className="form-description">
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="success-message" role="alert">
                {success}
              </div>
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email Address"
            />

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Reset Password'}
            </button>

            <div className="form-links">
              <Link to="/login">Back to Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
