import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants/categories';
import './CategoryFilterBar.css';

const CategoryFilterBar = ({ selectedCategories = [], onSelectCategory }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCategoryClick = (categoryKey) => {
    if (categoryKey === null) {
      // "All" button clicked - clear all selections
      onSelectCategory([]);
    } else {
      // Toggle category selection
      if (selectedCategories.includes(categoryKey)) {
        onSelectCategory(selectedCategories.filter(c => c !== categoryKey));
      } else {
        onSelectCategory([...selectedCategories, categoryKey]);
      }
    }
    
    // Close mobile menu after selection (optional - you can remove this if you want it to stay open)
    // setShowMobileMenu(false);
  };

  const getSelectedCategoryLabels = () => {
    if (selectedCategories.length === 0) return 'All Categories';
    if (selectedCategories.length === 1) {
      const cat = CATEGORIES.find(c => c.key === selectedCategories[0]);
      return cat ? cat.label : 'Filter';
    }
    return `${selectedCategories.length} Categories`;
  };

  // Mobile view
  if (isMobile) {
    return (
      <div className="category-filter-bar mobile">
        <div className="category-filter-mobile-header">
          <button
            className="mobile-filter-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span className="material-symbols-outlined">tune</span>
            <span className="filter-label">{getSelectedCategoryLabels()}</span>
            <span className="material-symbols-outlined">
              {showMobileMenu ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>

        {showMobileMenu && (
          <div className="category-filter-dropdown">
            <div className="category-filter-dropdown-content">
              <button
                className={`category-filter-chip ${selectedCategories.length === 0 ? 'active' : ''}`}
                onClick={() => handleCategoryClick(null)}
                title="All Categories"
              >
                <span className="material-symbols-outlined">grid_view</span>
                <span className="category-label">All</span>
              </button>
              
              {CATEGORIES.map((category) => (
                <button
                  key={category.key}
                  className={`category-filter-chip ${selectedCategories.includes(category.key) ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category.key)}
                  title={category.label}
                >
                  <span className="material-symbols-outlined">{category.materialIcon}</span>
                  <span className="category-label">{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="category-filter-bar">
      <div className="category-filter-bar-content">
        <button
          className={`category-filter-chip ${selectedCategories.length === 0 ? 'active' : ''}`}
          onClick={() => handleCategoryClick(null)}
          title="All Categories"
        >
          <span className="material-symbols-outlined">grid_view</span>
          <span className="category-label">All</span>
        </button>
        
        {CATEGORIES.map((category) => (
          <button
            key={category.key}
            className={`category-filter-chip ${selectedCategories.includes(category.key) ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category.key)}
            title={category.label}
          >
            <span className="material-symbols-outlined">{category.materialIcon}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilterBar;
