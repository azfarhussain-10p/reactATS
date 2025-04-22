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
  const [relatedJobs, setRelatedJobs] = useState([]);
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
        
        // Use jobsApi instead of careerApi until backend endpoints are ready
        const jobData = await jobsApi.getJobById(parseInt(id));
        setJob(jobData);
        
        // Fetch related jobs from the same department
        if (jobData && jobData.department) {
          try {
            const allJobs = await jobsApi.getAllJobs({ 
              department: jobData.department 
            });
            
            // Filter out the current job and limit to 3 related jobs
            const related = allJobs.filter(relatedJob => 
              relatedJob.id !== parseInt(id) && relatedJob.status === 'Active'
            ).slice(0, 3);
            
            setRelatedJobs(related);
          } catch (err) {
            console.error('Error fetching related jobs:', err);
            // Non-critical error, don't show to user
          }
        }
        
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
      
      // Use applicationsApi instead of careerApi
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

  const handleRelatedJobClick = (jobId) => {
    navigate(`/careers/job/${jobId}`);
    // Scroll to top when navigating to a related job
    window.scrollTo(0, 0);
  };

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
                {new Date(job.publishedAt || job.createdAt || job.postedDate).toLocaleDateString()}
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
              <h2>Compensation</h2>
              <div className="job-salary">
                <p>{job.salary}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="apply-section">
          <button 
            className="apply-button" 
            onClick={toggleApplicationForm}
          >
            {showApplicationForm ? 'Hide Application Form' : 'Apply for this Position'}
          </button>
          
          {showApplicationForm && (
            <div className="application-form-container">
              {submitStatus === 'success' ? (
                <div className="success-message">
                  <h3>Application Submitted!</h3>
                  <p>Thank you for your interest. We will review your application and contact you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="application-form">
                  <h3>Submit Your Application</h3>
                  
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
                      {formErrors.firstName && <div className="error-message">{formErrors.firstName}</div>}
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
                      {formErrors.lastName && <div className="error-message">{formErrors.lastName}</div>}
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
                      {formErrors.email && <div className="error-message">{formErrors.email}</div>}
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
                      {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="resume">Resume Link *</label>
                    <input
                      type="url"
                      id="resume"
                      name="resume"
                      placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                      value={formData.resume}
                      onChange={handleInputChange}
                      className={formErrors.resume ? 'error' : ''}
                    />
                    {formErrors.resume && <div className="error-message">{formErrors.resume}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="coverLetter">Cover Letter</label>
                    <textarea
                      id="coverLetter"
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="linkedInUrl">LinkedIn URL</label>
                      <input
                        type="url"
                        id="linkedInUrl"
                        name="linkedInUrl"
                        value={formData.linkedInUrl}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="portfolioUrl">Portfolio URL</label>
                      <input
                        type="url"
                        id="portfolioUrl"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="referredBy">How did you hear about us?</label>
                    <input
                      type="text"
                      id="referredBy"
                      name="referredBy"
                      value={formData.referredBy}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={submitStatus === 'submitting'}
                    >
                      {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={toggleApplicationForm}
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {submitStatus === 'error' && (
                    <div className="error-message">
                      There was an error submitting your application. Please try again later.
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
        
        {relatedJobs.length > 0 && (
          <div className="related-jobs-section">
            <h2>Similar Positions</h2>
            <div className="related-jobs">
              {relatedJobs.map(relatedJob => (
                <div 
                  key={relatedJob.id} 
                  className="related-job-card"
                  onClick={() => handleRelatedJobClick(relatedJob.id)}
                >
                  <h3>{relatedJob.title}</h3>
                  <div className="related-job-details">
                    <span>{relatedJob.location}</span>
                    <span>{relatedJob.type}</span>
                  </div>
                  <button className="view-job-btn">View Details</button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="job-share-section">
          <h3>Share this Job</h3>
          <div className="share-buttons">
            <button
              className="share-button linkedin"
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(`Job Opening: ${job.title}`)}`, '_blank')}
            >
              LinkedIn
            </button>
            <button
              className="share-button twitter"
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this job opening: ${job.title}`)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
            >
              Twitter
            </button>
            <button
              className="share-button email"
              onClick={() => window.location.href = `mailto:?subject=${encodeURIComponent(`Job Opening: ${job.title}`)}&body=${encodeURIComponent(`Check out this job opening: ${window.location.href}`)}`}
            >
              Email
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobDetailPage; 