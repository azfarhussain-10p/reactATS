/**
 * React ATS Application - Login Component
 * 
 * Authentication page that handles user login and registration,
 * providing access to the application features based on user roles.
 * 
 * Copyright (c) 2024-2025 Syed Azfar Hussain - Principal Test Consultant at 10Pearls Pakistan
 * All rights reserved.
 * 
 * Licensed under the terms of 10Pearls proprietary license.
 * Unauthorized copying, redistribution, or use of this file is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';
import { announce } from '../components/ScreenReaderAnnouncer';
import { useAuth } from '../contexts/AuthContext';

// Safe announce function that won't throw errors
const safeAnnounce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
  try {
    announce(message, politeness);
  } catch (error) {
    console.log('Screen reader announcement failed:', message);
  }
};

function Login() {
  const [isActive, setIsActive] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!signInEmail.trim() || !signInPassword.trim()) {
      setError('Email and password are required');
      safeAnnounce('Login failed. Email and password are required.', 'assertive');
      return;
    }
    
    try {
      const success = await login(signInEmail, signInPassword);
      
      if (success) {
        safeAnnounce('Login successful. Redirecting to dashboard.', 'polite');
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
        safeAnnounce('Login failed. Invalid email or password.', 'assertive');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
      safeAnnounce('Login failed. An error occurred.', 'assertive');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setError('All fields are required for registration');
      safeAnnounce('Registration failed. All fields are required.', 'assertive');
      return;
    }
    
    try {
      const success = await register({
        email: signUpEmail,
        password: signUpPassword,
        firstName: signUpName.split(' ')[0],
        lastName: signUpName.split(' ').slice(1).join(' ') || '',
      });
      
      if (success) {
        safeAnnounce('Registration successful. Redirecting to dashboard.', 'polite');
        navigate('/dashboard');
      } else {
        setError('Registration failed. Please try again.');
        safeAnnounce('Registration failed. Please try again.', 'assertive');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration. Please try again.');
      safeAnnounce('Registration failed. An error occurred.', 'assertive');
    }
  };

  return (
    <>
      <div className="login-page">
        <div className={`container ${isActive ? 'active' : ''}`} id="container">
          <div className="form-container sign-up">
            <form onSubmit={handleSignUp}>
              <h1>Create Account</h1>
              <div className="social-icons">
                <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
                <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
                <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
              </div>
              <span>or use your email for registration</span>
              {error && <div className="error-message" role="alert">{error}</div>}
              <input 
                type="text" 
                placeholder="Name" 
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                required
                aria-label="Name"
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
                aria-label="Email"
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
                aria-label="Password"
              />
              <button type="submit">Sign Up</button>
            </form>
          </div>
          
          <div className="form-container sign-in">
            <form onSubmit={handleSignIn}>
              <h1>Sign In</h1>
              <div className="social-icons">
                <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
                <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
                <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
              </div>
              <span>or use your email password</span>
              {error && <div className="error-message" role="alert">{error}</div>}
              <input 
                type="email" 
                placeholder="Email" 
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
                aria-label="Email"
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
                aria-label="Password"
              />
              <Link to="/forgot-password">Forgot Your Password?</Link>
              <button type="submit">Sign In</button>
              <div className="demo-credentials">
                <p>Admin: admin@example.com / admin123</p>
                <p>Recruiter: demo@example.com / password</p>
              </div>
            </form>
          </div>
          
          <div className="toggle-container">
            <div className="toggle">
              <div className="toggle-panel toggle-left">
                <h1>Welcome Back!</h1>
                <p>Access recruitment tools for candidate management</p>
                <button className="hidden" onClick={() => setIsActive(false)}>Sign In</button>
              </div>
              <div className="toggle-panel toggle-right">
                <h1>Hello, Recruiter!</h1>
                <p>Join our ATS platform for efficient hiring</p>
                <button className="hidden" onClick={() => setIsActive(true)}>Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright-footer">
        &copy; 2024-2025 Syed Azfar Hussain - 10Pearls Pakistan. All rights reserved.
      </div>
    </>
  );
}

export default Login; 