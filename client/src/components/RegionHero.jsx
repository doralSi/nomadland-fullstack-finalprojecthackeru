import React from 'react';
import './RegionHero.css';

const RegionHero = ({ name, subtitle, imageUrl, about, onBackClick }) => {
  return (
    <div 
      className="region-hero"
      style={{ 
        backgroundImage: imageUrl 
          ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${imageUrl})`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <button onClick={onBackClick} className="back-to-regions-btn">
        <span className="material-symbols-outlined">arrow_back</span>
        All Regions
      </button>
      
      <div className="region-hero-content">
        <h1>{name}</h1>
        {subtitle && <h2 className="region-hero-subtitle">{subtitle}</h2>}
      </div>
    </div>
  );
};

export default RegionHero;
