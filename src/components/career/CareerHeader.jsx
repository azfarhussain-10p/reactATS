import React from 'react';
import { Link } from 'react-router-dom';
import './CareerHeader.css';

const CareerHeader = () => {
  return (
    <header className="career-site-header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/">
            <img src="/assets/10Pearls.png" alt="10Pearls Logo" className="company-logo" />
          </Link>
        </div>

        <nav className="career-navigation">
          <ul className="nav-links">
            <li>
              <Link to="/careers">Careers</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </nav>

        <div className="auth-links">
          <Link to="/login" className="login-link">
            Log In
          </Link>
          <Link to="/register" className="register-link">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default CareerHeader;
