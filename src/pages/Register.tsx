import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset status messages
    setError('');
    setSuccess('');

    // Simple validation
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('All fields are required');
      safeAnnounce('Registration failed. All fields are required.', 'assertive');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      safeAnnounce('Registration failed. Passwords do not match.', 'assertive');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      safeAnnounce(
        'Registration failed. Password must be at least 6 characters long.',
        'assertive'
      );
      return;
    }

    try {
      // In a real app, this would call an API to register the user
      // For demo purposes, just show success message
      setSuccess('Registration successful! You can now login.');
      safeAnnounce('Registration successful! You can now login.', 'polite');

      // Clear the form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration. Please try again.');
      safeAnnounce('Registration failed. An error occurred.', 'assertive');
    }
  };

  return (
    <div className="login-page">
      <div className="container register-container">
        <div className="form-container register-form">
          <form onSubmit={handleRegister}>
            <h1>Create Account</h1>
            <div className="social-icons">
              <a href="#" className="icon">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your email for registration</span>

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
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-label="Name"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-label="Confirm Password"
            />
            <button type="submit">Register</button>
            <p className="login-link">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
