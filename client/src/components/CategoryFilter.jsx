import React from 'react';
import { CATEGORIES } from '../constants/categories';
import './CategoryFilter.css';

const CategoryFilter = ({ selectedCategories, onToggleCategory }) => {
  const handleCategoryClick = (categoryKey) => {
    onToggleCategory(categoryKey);
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === CATEGORIES.length) {
      // If all selected, deselect all
      onToggleCategory('CLEAR_ALL');
    } else {
      // Otherwise, select all
      onToggleCategory('SELECT_ALL');
    }
  };

  const allSelected = selectedCategories.length === CATEGORIES.length;

  return (
    <div className="category-filter">
      <div className="filter-header">
        <h3>Filter by Category</h3>
        <button 
          className={`select-all-btn ${allSelected ? 'all-selected' : ''}`}
          onClick={handleSelectAll}
        >
          {allSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>
      
      <div className="category-buttons">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategories.includes(category.key);
          
          return (
            <button
              key={category.key}
              className={`category-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.key)}
              title={category.label}
            >
              <span className="material-symbols-outlined">
                {category.materialIcon}
              </span>
              <span className="category-label">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
