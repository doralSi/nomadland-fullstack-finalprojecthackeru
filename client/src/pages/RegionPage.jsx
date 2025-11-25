import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import './RegionPage.css';

const RegionPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { selectRegionBySlug, currentRegion } = useRegion();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRegion = async () => {
      try {
        setLoading(true);
        setError(null);
        await selectRegionBySlug(slug);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load region');
      } finally {
        setLoading(false);
      }
    };

    loadRegion();
  }, [slug, selectRegionBySlug]);

  const handleExploreMap = () => {
    navigate(`/map?region=${slug}`);
  };

  const handleViewPoints = () => {
    navigate(`/points?region=${slug}`);
  };

  const handleAddPoint = () => {
    navigate(`/create-point?region=${slug}`);
  };

  const handleBackToGlobalMap = () => {
    navigate('/regions');
  };

  if (loading) {
    return (
      <div className="region-page-container">
        <div className="region-page-loading">Loading region...</div>
      </div>
    );
  }

  if (error || !currentRegion) {
    return (
      <div className="region-page-container">
        <div className="region-page-error">
          <h2>{error || 'Region not found'}</h2>
          <button onClick={handleBackToGlobalMap} className="back-btn">
            Back to Regions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="region-page-container">
      {/* Hero Banner */}
      <div 
        className="region-hero"
        style={{ 
          backgroundImage: currentRegion.heroImageUrl 
            ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${currentRegion.heroImageUrl})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="region-hero-content">
          <button onClick={handleBackToGlobalMap} className="back-to-regions-btn">
            <span className="material-icons">arrow_back</span>
            All Regions
          </button>
          <h1>{currentRegion.name}</h1>
          <p className="region-hero-subtitle">Digital Nomad Paradise</p>
        </div>
      </div>

      {/* Region Content */}
      <div className="region-content">
        <div className="region-description-section">
          <h2>About {currentRegion.name}</h2>
          <p>{currentRegion.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="region-actions">
          <button onClick={handleExploreMap} className="region-action-btn primary">
            <span className="material-icons">map</span>
            <div>
              <h3>Explore Map</h3>
              <p>Discover points of interest</p>
            </div>
          </button>

          <button onClick={handleViewPoints} className="region-action-btn">
            <span className="material-icons">list</span>
            <div>
              <h3>View All Points</h3>
              <p>Browse community recommendations</p>
            </div>
          </button>

          <button onClick={handleAddPoint} className="region-action-btn">
            <span className="material-icons">add_location</span>
            <div>
              <h3>Add a Point</h3>
              <p>Share your favorite place</p>
            </div>
          </button>
        </div>

        {/* Region Info Cards */}
        <div className="region-info-cards">
          <div className="info-card">
            <span className="material-icons">location_on</span>
            <h3>Location</h3>
            <p>Center: {currentRegion.center.lat.toFixed(4)}, {currentRegion.center.lng.toFixed(4)}</p>
          </div>

          <div className="info-card">
            <span className="material-icons">verified</span>
            <h3>Status</h3>
            <p>{currentRegion.isActive ? 'Active Community' : 'Inactive'}</p>
          </div>

          <div className="info-card">
            <span className="material-icons">public</span>
            <h3>Coverage</h3>
            <p>Region polygon defined</p>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="coming-soon-section">
          <h2>Coming Soon</h2>
          <div className="coming-soon-features">
            <div className="feature-item">
              <span className="material-icons">event</span>
              <h3>Local Events</h3>
              <p>Meetups, workshops, and community gatherings</p>
            </div>
            <div className="feature-item">
              <span className="material-icons">groups</span>
              <h3>Community Forum</h3>
              <p>Connect with fellow nomads</p>
            </div>
            <div className="feature-item">
              <span className="material-icons">star</span>
              <h3>Featured Places</h3>
              <p>Curated recommendations from locals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionPage;
