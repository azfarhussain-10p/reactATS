import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../../services/api';
import CareerHeader from './CareerHeader';
import './CareerPage.css';

const CareerPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [jobTypes, setJobTypes] = useState(['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [savedJobs, setSavedJobs] = useState(() => {
    const saved = localStorage.getItem('savedJobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [filters, setFilters] = useState({
    search: '',
    department: 'All',
    location: 'All',
    jobTypes: []
  });
  
  const mainRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Using jobsApi instead of careerApi until backend endpoints are ready
        let jobsData = [];
        let departmentsData = [];
        let locationsData = [];
        let jobTypesData = [];
        
        try {
          jobsData = await jobsApi.getAllJobs({ status: 'Active' });
        } catch (err) {
          console.error('Error fetching jobs:', err);
          // Continue with empty jobs array
        }
        
        try {
          departmentsData = await jobsApi.getDepartments();
        } catch (err) {
          console.error('Error fetching departments:', err);
          // Extract unique departments from jobs if API fails
          if (jobsData.length > 0) {
            departmentsData = [...new Set(jobsData.map(job => job.department))];
          }
        }
        
        try {
          locationsData = await jobsApi.getLocations();
        } catch (err) {
          console.error('Error fetching locations:', err);
          // Extract unique locations from jobs if API fails
          if (jobsData.length > 0) {
            locationsData = [...new Set(jobsData.map(job => job.location))];
          }
        }
        
        try {
          jobTypesData = await jobsApi.getJobTypes();
        } catch (err) {
          console.error('Error fetching job types:', err);
          // Use default job types
        }
        
        setJobs(jobsData);
        setFilteredJobs(jobsData);
        setDepartments(['All', ...departmentsData]);
        setLocations(['All', ...locationsData]);
        
        // Use API job types if available, otherwise fall back to the default
        if (jobTypesData && jobTypesData.length > 0) {
          setJobTypes(jobTypesData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load job listings. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Add scroll listener for back to top button
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Save to localStorage when savedJobs changes
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  useEffect(() => {
    if (jobs.length === 0) return;
    
    // Apply filters client-side until API search is available
    applyFilters(jobs);
  }, [filters, jobs]);

  const applyFilters = (jobsList) => {
    let result = [...jobsList];
    
    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase().trim();
      result = result.filter(job => 
        job.title.toLowerCase().includes(searchTerm) || 
        job.description.toLowerCase().includes(searchTerm) ||
        (job.skills && job.skills.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply department filter
    if (filters.department !== 'All') {
      result = result.filter(job => job.department === filters.department);
    }
    
    // Apply location filter
    if (filters.location !== 'All') {
      result = result.filter(job => job.location === filters.location);
    }
    
    // Apply job type filters
    if (filters.jobTypes.length > 0) {
      result = result.filter(job => 
        filters.jobTypes.includes(job.type)
      );
    }
    
    setFilteredJobs(result);
  };

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleJobTypeToggle = (type) => {
    setFilters(prevFilters => {
      const newJobTypes = prevFilters.jobTypes.includes(type)
        ? prevFilters.jobTypes.filter(t => t !== type)
        : [...prevFilters.jobTypes, type];
      
      return {
        ...prevFilters,
        jobTypes: newJobTypes
      };
    });
  };

  const handleJobClick = (id) => {
    navigate(`/careers/job/${id}`);
  };
  
  const toggleSaveJob = (e, jobId) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    setSavedJobs(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const clearAllFilters = () => {
    setFilters({
      search: '',
      department: 'All',
      location: 'All',
      jobTypes: []
    });
  };

  const handleSubscribe = async (email) => {
    try {
      // Mock subscription functionality until API is ready
      console.log('Subscribing email:', email, 'with preferences:', {
        departments: filters.department !== 'All' ? [filters.department] : [],
        locations: filters.location !== 'All' ? [filters.location] : [],
        jobTypes: filters.jobTypes
      });
      
      alert('Thank you for subscribing to job alerts!');
    } catch (err) {
      console.error('Error subscribing to job alerts:', err);
      alert('Sorry, there was an error subscribing to job alerts. Please try again later.');
    }
  };

  const handleContactSubmit = async (formData) => {
    try {
      // Mock contact form submission until API is ready
      console.log('Contact form submission:', formData);
      
      alert('Thank you for contacting us! We will get back to you soon.');
    } catch (err) {
      console.error('Error sending contact form:', err);
      alert('Sorry, there was an error sending your message. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="career-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="career-page">
        <div className="error-container">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CareerHeader />
      <div className="career-page" ref={mainRef}>
        <div className="career-hero">
          <div className="career-hero-content">
            <h1 className="animated-title">Join Our Team</h1>
            <p className="animated-subtitle">Discover exciting opportunities and start your journey with us</p>
            <div className="hero-cta">
              <button 
                onClick={() => mainRef.current.querySelector('.job-search-container').scrollIntoView({ behavior: 'smooth' })}
                className="pulse-button"
              >
                View Open Positions
              </button>
            </div>
          </div>
          <div className="hero-blur-overlay"></div>
        </div>
        
        <div className="job-search-container">
          <div className="search-box-container">
            <div className="search-box">
              <i className="search-icon">🔍</i>
              <input
                type="text"
                placeholder="Search for job title, skills, or keywords..."
                value={filters.search}
                onChange={handleSearchChange}
              />
              {filters.search && (
                <button 
                  className="clear-search"
                  onClick={() => setFilters({...filters, search: ''})}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div className="advanced-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Department</label>
                <select 
                  name="department" 
                  value={filters.department} 
                  onChange={handleFilterChange}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Location</label>
                <select 
                  name="location" 
                  value={filters.location} 
                  onChange={handleFilterChange}
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              
              <button 
                className="clear-filters-btn"
                onClick={clearAllFilters}
                disabled={filters.search === '' && filters.department === 'All' && filters.location === 'All' && filters.jobTypes.length === 0}
              >
                Clear Filters
              </button>
            </div>
            
            <div className="job-types-filter">
              <span className="filter-label">Job Type:</span>
              <div className="job-type-tags">
                {jobTypes.map(type => (
                  <button
                    key={type}
                    className={`job-type-tag ${filters.jobTypes.includes(type) ? 'active' : ''}`}
                    onClick={() => handleJobTypeToggle(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="results-controls">
            <div className="job-results-count">
              {filteredJobs.length} job{filteredJobs.length !== 1 && 's'} found
            </div>
            
            <div className="view-toggle">
              <button 
                className={`view-toggle-btn ${viewType === 'grid' ? 'active' : ''}`}
                onClick={() => setViewType('grid')}
                aria-label="Grid view"
              >
                <span className="grid-icon">▤</span>
              </button>
              <button 
                className={`view-toggle-btn ${viewType === 'list' ? 'active' : ''}`}
                onClick={() => setViewType('list')}
                aria-label="List view"
              >
                <span className="list-icon">☰</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className={`job-listings ${viewType === 'list' ? 'list-view' : 'grid-view'}`}>
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div 
                key={job.id} 
                className="job-card"
                onClick={() => handleJobClick(job.id)}
              >
                <div className="job-card-header">
                  <h3>{job.title}</h3>
                  <button 
                    className={`save-job-btn ${savedJobs.includes(job.id) ? 'saved' : ''}`}
                    onClick={(e) => toggleSaveJob(e, job.id)}
                    aria-label={savedJobs.includes(job.id) ? "Unsave job" : "Save job"}
                  >
                    {savedJobs.includes(job.id) ? '★' : '☆'}
                  </button>
                </div>
                
                <div className="job-card-details">
                  <div className="job-location">
                    <i className="location-icon">📍</i>
                    <span>{job.location}</span>
                  </div>
                  
                  <div className="job-department">
                    <i className="department-icon">🏢</i>
                    <span>{job.department}</span>
                  </div>
                  
                  <div className="job-type-badge">
                    <span className="job-type">{job.type}</span>
                  </div>
                </div>
                
                <p className="job-description-preview">
                  {job.description.length > 150 
                    ? `${job.description.substring(0, 150)}...` 
                    : job.description}
                </p>
                
                <div className="job-card-footer">
                  <span className="posted-date">
                    Posted: {new Date(job.publishedAt || job.createdAt || job.postedDate).toLocaleDateString()}
                  </span>
                  <button className="view-job-btn">View Details</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-jobs-found">
              <h3>No jobs found</h3>
              <p>Try adjusting your search filters or check back later for new opportunities.</p>
              <button className="reset-search-btn" onClick={clearAllFilters}>Reset Filters</button>
            </div>
          )}
        </div>
        
        {showBackToTop && (
          <button 
            className="back-to-top-btn" 
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            ↑
          </button>
        )}
        
        <div className="career-footer">
          <h2>Why Join Us?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon growth-icon">🚀</div>
              <h3>Growth & Learning</h3>
              <p>Continuous learning opportunities and career advancement</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon innovation-icon">💡</div>
              <h3>Innovation</h3>
              <p>Work on cutting-edge projects and technologies</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon culture-icon">🤝</div>
              <h3>Great Culture</h3>
              <p>Collaborative and inclusive work environment</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon benefits-icon">🎁</div>
              <h3>Great Benefits</h3>
              <p>Competitive compensation and comprehensive benefits</p>
            </div>
          </div>
          
          <div className="join-team-cta">
            <h3>Don't see what you're looking for?</h3>
            <p>We're always looking for talented individuals to join our team</p>
            <button 
              className="contact-us-btn"
              onClick={() => {
                // You can implement a modal or navigate to contact page
                const formData = {
                  name: prompt('Please enter your name:'),
                  email: prompt('Please enter your email:'),
                  message: prompt('Please enter your message:')
                };
                if (formData.name && formData.email && formData.message) {
                  handleContactSubmit(formData);
                }
              }}
            >
              Contact Us
            </button>
          </div>
          
          <div className="job-alerts-subscription">
            <h3>Stay Updated with New Opportunities</h3>
            <p>Subscribe to receive notifications when new positions match your interests</p>
            <div className="subscription-form">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                id="subscription-email"
                className="subscription-input"
              />
              <button 
                className="subscribe-btn"
                onClick={() => {
                  const email = document.getElementById('subscription-email').value;
                  if (email) {
                    handleSubscribe(email);
                    document.getElementById('subscription-email').value = '';
                  } else {
                    alert('Please enter your email address');
                  }
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CareerPage; 