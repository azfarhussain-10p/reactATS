import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsApi, applicationsApi } from '../../services/api';
import CareerHeader from './CareerHeader';
import './JobDetailPage.css';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resume: '',
    coverLetter: '',
    linkedInUrl: '',
    portfolioUrl: '',
    referredBy: '',
    source: 'Career Page'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const jobData = await jobsApi.getJobById(parseInt(id));
        setJob(jobData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear the error for this field when the user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!formData.resume.trim()) {
      errors.resume = 'Resume link is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitStatus('submitting');
      
      const applicationData = {
        jobId: parseInt(id),
        ...formData
      };
      
      await applicationsApi.createApplication(applicationData);
      
      setSubmitStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        resume: '',
        coverLetter: '',
        linkedInUrl: '',
        portfolioUrl: '',
        referredBy: '',
        source: 'Career Page'
      });
      
      // Hide form after successful submission
      setTimeout(() => {
        setShowApplicationForm(false);
        setSubmitStatus(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting application:', err);
      setSubmitStatus('error');
    }
  };

  const toggleApplicationForm = () => {
    setShowApplicationForm(!showApplicationForm);
    setSubmitStatus(null);
  };

  const goBack = () => {
    navigate('/careers');
  };

  if (loading) {
    return (
      <div className="job-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-detail-page">
        <div className="error-container">
          <h2>Oops!</h2>
          <p>{error || 'Job not found'}</p>
          <button onClick={goBack}>Back to Jobs</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CareerHeader />
      <div className="job-detail-page">
        <div className="back-button-container">
          <button className="back-button" onClick={goBack}>
            <span className="back-arrow">←</span> Back to Jobs
          </button>
        </div>
        
        <div className="job-header">
          <h1>{job.title}</h1>
          <div className="job-meta">
            <div className="job-meta-item">
              <span className="meta-label">Department:</span>
              <span className="meta-value">{job.department}</span>
            </div>
            <div className="job-meta-item">
              <span className="meta-label">Location:</span>
              <span className="meta-value">{job.location}</span>
            </div>
            <div className="job-meta-item">
              <span className="meta-label">Job Type:</span>
              <span className="meta-value">{job.type}</span>
            </div>
            <div className="job-meta-item">
              <span className="meta-label">Posted:</span>
              <span className="meta-value">
                {new Date(job.publishedAt || job.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="job-content">
          <div className="job-section">
            <h2>Description</h2>
            <div className="job-description">
              <p>{job.description}</p>
            </div>
          </div>
          
          <div className="job-section">
            <h2>Requirements</h2>
            <div className="job-requirements">
              {Array.isArray(job.requirements) ? (
                <ul>
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              ) : (
                <p>{job.requirements}</p>
              )}
            </div>
          </div>
          
          <div className="job-section">
            <h2>Responsibilities</h2>
            <div className="job-responsibilities">
              {Array.isArray(job.responsibilities) ? (
                <ul>
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              ) : (
                <p>{job.responsibilities}</p>
              )}
            </div>
          </div>
          
          {job.benefits && (
            <div className="job-section">
              <h2>Benefits</h2>
              <div className="job-benefits">
                {Array.isArray(job.benefits) ? (
                  <ul>
                    {job.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{job.benefits}</p>
                )}
              </div>
            </div>
          )}
          
          {job.salary && (
            <div className="job-section">
              <h2>Salary</h2>
              <div className="job-salary">
                {typeof job.salary === 'object' ? (
                  <p>{job.salary.currency} {job.salary.min} - {job.salary.max}</p>
                ) : (
                  <p>{job.salary}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="application-section">
          {!showApplicationForm ? (
            <button className="apply-btn" onClick={toggleApplicationForm}>
              Apply for this Position
            </button>
          ) : (
            <div className="application-form-container">
              <h2>Apply for {job.title}</h2>
              
              {submitStatus === 'success' && (
                <div className="success-message">
                  <span className="check-icon">✓</span>
                  <p>Your application has been submitted successfully! We'll be in touch soon.</p>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="error-message">
                  <p>There was an error submitting your application. Please try again.</p>
                </div>
              )}
              
              {submitStatus !== 'success' && (
                <form className="application-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={formErrors.firstName ? 'error' : ''}
                      />
                      {formErrors.firstName && <span className="error-text">{formErrors.firstName}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={formErrors.lastName ? 'error' : ''}
                      />
                      {formErrors.lastName && <span className="error-text">{formErrors.lastName}</span>}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={formErrors.email ? 'error' : ''}
                      />
                      {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phone">Phone *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={formErrors.phone ? 'error' : ''}
                      />
                      {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="resume">Resume URL *</label>
                    <input
                      type="text"
                      id="resume"
                      name="resume"
                      value={formData.resume}
                      onChange={handleInputChange}
                      placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                      className={formErrors.resume ? 'error' : ''}
                    />
                    {formErrors.resume && <span className="error-text">{formErrors.resume}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="coverLetter">Cover Letter</label>
                    <textarea
                      id="coverLetter"
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      rows="5"
                      placeholder="Tell us why you're interested in this position and why you'd be a good fit."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="linkedInUrl">LinkedIn Profile</label>
                    <input
                      type="text"
                      id="linkedInUrl"
                      name="linkedInUrl"
                      value={formData.linkedInUrl}
                      onChange={handleInputChange}
                      placeholder="https://www.linkedin.com/in/yourprofile"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="portfolioUrl">Portfolio/Website</label>
                    <input
                      type="text"
                      id="portfolioUrl"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleInputChange}
                      placeholder="https://your-portfolio.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="referredBy">Referred By</label>
                    <input
                      type="text"
                      id="referredBy"
                      name="referredBy"
                      value={formData.referredBy}
                      onChange={handleInputChange}
                      placeholder="Name of person who referred you (if applicable)"
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={toggleApplicationForm}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={submitStatus === 'submitting'}>
                      {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobDetailPage; 