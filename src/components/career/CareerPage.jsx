import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../../services/api';
import CareerHeader from './CareerHeader';
import './CareerPage.css';

const CareerPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    department: 'All',
    location: 'All'
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobs, departments, locations] = await Promise.all([
          jobsApi.getAllJobs({ status: 'published' }),
          jobsApi.getDepartments(),
          jobsApi.getLocations()
        ]);
        
        setJobs(jobs);
        setFilteredJobs(jobs);
        setDepartments(['All', ...departments]);
        setLocations(['All', ...locations]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load job listings. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...jobs];
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.department.toLowerCase().includes(searchTerm)
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
    
    setFilteredJobs(result);
  }, [filters, jobs]);

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

  const handleJobClick = (id) => {
    navigate(`/careers/job/${id}`);
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
      <div className="career-page">
        <div className="career-header">
          <div className="career-header-content">
            <h1>Join Our Team</h1>
            <p>Discover exciting opportunities and start your journey with us</p>
          </div>
        </div>
        
        <div className="job-search-container">
          <div className="search-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="filter-controls">
              <select 
                name="department" 
                value={filters.department} 
                onChange={handleFilterChange}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              
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
          </div>
          
          <div className="job-results-count">
            {filteredJobs.length} job{filteredJobs.length !== 1 && 's'} found
          </div>
        </div>
        
        <div className="job-listings">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div 
                key={job.id} 
                className="job-card"
                onClick={() => handleJobClick(job.id)}
              >
                <div className="job-card-header">
                  <h3>{job.title}</h3>
                  <span className="job-type">{job.type}</span>
                </div>
                
                <div className="job-card-details">
                  <div className="job-location">
                    <i className="location-icon"></i>
                    <span>{job.location}</span>
                  </div>
                  
                  <div className="job-department">
                    <i className="department-icon"></i>
                    <span>{job.department}</span>
                  </div>
                  
                  <div className="job-status">
                    <i className="status-icon"></i>
                    <span className={`status-badge ${job.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
                
                <p className="job-description-preview">
                  {job.description.length > 150 
                    ? `${job.description.substring(0, 150)}...` 
                    : job.description}
                </p>
                
                <div className="job-card-footer">
                  <span className="posted-date">
                    Posted: {new Date(job.publishedAt || job.createdAt).toLocaleDateString()}
                  </span>
                  <button className="view-job-btn">View Details</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-jobs-found">
              <h3>No jobs found</h3>
              <p>Try adjusting your search filters or check back later for new opportunities.</p>
            </div>
          )}
        </div>
        
        <div className="career-footer">
          <h2>Why Join Us?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon growth-icon"></div>
              <h3>Growth & Learning</h3>
              <p>Continuous learning opportunities and career advancement</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon innovation-icon"></div>
              <h3>Innovation</h3>
              <p>Work on cutting-edge projects and technologies</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon culture-icon"></div>
              <h3>Great Culture</h3>
              <p>Collaborative and inclusive work environment</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon benefits-icon"></div>
              <h3>Great Benefits</h3>
              <p>Competitive compensation and comprehensive benefits</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CareerPage; 