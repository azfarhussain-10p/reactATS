import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { announce } from '../components/ScreenReaderAnnouncer';

function Login() {
  const [isActive, setIsActive] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!signInEmail.trim() || !signInPassword.trim()) {
      setError('Email and password are required');
      announce('Login failed. Email and password are required.', 'assertive');
      return;
    }
    
    // Admin login
    if (signInEmail === 'admin@example.com' && signInPassword === 'admin123') {
      // Set authentication flag
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'admin');
      
      // Dispatch event for same-tab navigation
      window.dispatchEvent(new Event('auth-change'));
      
      announce('Login successful. Redirecting to dashboard.', 'polite');
      navigate('/dashboard');
    } 
    // Recruiter login
    else if (signInEmail === 'demo@example.com' && signInPassword === 'password') {
      // Set authentication flag
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'recruiter');
      
      // Dispatch event for same-tab navigation
      window.dispatchEvent(new Event('auth-change'));
      
      announce('Login successful. Redirecting to dashboard.', 'polite');
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
      announce('Login failed. Invalid email or password.', 'assertive');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setError('All fields are required for registration');
      announce('Registration failed. All fields are required.', 'assertive');
      return;
    }
    
    // In a real app, would call API to register
    // Mock successful registration
    setError('');
    announce('Registration successful. You can now sign in.', 'polite');
    setIsActive(false);
  };

  return (
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
            {error && <div className="error-message">{error}</div>}
            <input 
              type="text" 
              placeholder="Name" 
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
              required
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
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
            {error && <div className="error-message">{error}</div>}
            <input 
              type="email" 
              placeholder="Email" 
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              required
            />
            <a href="#">Forget Your Password?</a>
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
              <p>Enter your personal details to use all of site features</p>
              <button className="hidden" onClick={() => setIsActive(false)}>Sign In</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button className="hidden" onClick={() => setIsActive(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 