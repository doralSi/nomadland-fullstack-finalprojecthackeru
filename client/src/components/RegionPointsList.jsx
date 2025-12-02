import React, { useState, useEffect } from 'react';
import { getPoints } from '../api/points';
import { isPointInsideRegion } from '../utils/isInsidePolygon';
import { CATEGORIES } from '../constants/categories';
import './RegionPointsList.css';

const RegionPointsList = ({ region }) => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Helper to get category info
  const getCategoryInfo = (categoryKey) => {
    const cat = CATEGORIES.find(c => c.key === categoryKey);
    return cat || { key: categoryKey, label: categoryKey, icon: 'LocationOn', materialIcon: 'location_on' };
  };

  useEffect(() => {
    if (region) {
      loadPoints();
    }
  }, [region]);

  const loadPoints = async () => {
    try {
      setLoading(true);
      const data = await getPoints();
      // Filter approved points for this region
      const approvedPoints = data.filter(p => {
        if (p.status !== 'approved') return false;
        if (!region) return false;
        return isPointInsideRegion(p.lat, p.lng, region);
      });
      setPoints(approvedPoints);
    } catch (err) {
      console.error('Error loading points:', err);
      setError('Failed to load points');
    } finally {
      setLoading(false);
    }
  };

  const filteredPoints = selectedCategory === 'all' 
    ? points 
    : points.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="region-points-container">
        <div className="points-loading">Loading points...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="region-points-container">
        <div className="points-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="region-points-container">
      <div className="points-header">
        <h3>Points of Interest</h3>
        <p className="points-count">{filteredPoints.length} {filteredPoints.length === 1 ? 'point' : 'points'}</p>
      </div>

      <div className="category-filters">
        <button
          key="all"
          className={`category-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          <span className="material-symbols-outlined">apps</span>
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`category-filter-btn ${selectedCategory === cat.key ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.key)}
          >
            <span className="material-symbols-outlined">{cat.materialIcon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {filteredPoints.length === 0 ? (
        <div className="no-points">
          <span className="material-symbols-outlined">explore_off</span>
          <p>No points found in this category</p>
          <p className="no-points-subtitle">Try selecting a different category or add a new point!</p>
        </div>
      ) : (
        <div className="points-list">
          {filteredPoints.map(point => (
            <div key={point._id} className="point-item">
              <div className="point-icon">
                <span className="material-symbols-outlined">
                  {getCategoryInfo(point.category).materialIcon}
                </span>
              </div>
              <div className="point-content">
                <h4>{point.title}</h4>
                <div className="point-meta">
                  <span className="point-category-badge">{point.category}</span>
                  {point.averageRating && (
                    <span className="point-rating">
                      <span className="material-symbols-outlined">star</span>
                      {point.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
                {point.description && (
                  <p className="point-description">{point.description}</p>
                )}
                <div className="point-location">
                  <span className="material-symbols-outlined">location_on</span>
                  {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegionPointsList;
