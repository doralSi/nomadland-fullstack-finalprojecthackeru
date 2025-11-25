import React from 'react';
import { CATEGORIES } from '../constants/categories';
import HikingIcon from '@mui/icons-material/Hiking';
import OpacityIcon from '@mui/icons-material/Opacity';
import LandscapeIcon from '@mui/icons-material/Landscape';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import MuseumIcon from '@mui/icons-material/Museum';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PoolIcon from '@mui/icons-material/Pool';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ChurchIcon from '@mui/icons-material/Church';
import './CategoryFilter.css';

// Map category keys to Material Icon components
const iconComponents = {
  trail: HikingIcon,
  spring: OpacityIcon,
  viewpoint: LandscapeIcon,
  beach: BeachAccessIcon,
  restaurant: RestaurantIcon,
  cafe: LocalCafeIcon,
  culture: MuseumIcon,
  market: StorefrontIcon,
  pool: PoolIcon,
  transit: DirectionsBusIcon,
  workspace: LaptopMacIcon,
  kids: ChildCareIcon,
  medical: LocalHospitalIcon,
  sports: SportsSoccerIcon,
  religion: ChurchIcon,
};

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
          const IconComponent = iconComponents[category.key];
          const isActive = selectedCategories.includes(category.key);
          
          return (
            <button
              key={category.key}
              className={`category-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.key)}
              title={category.label}
            >
              {IconComponent && <IconComponent className="category-icon" />}
              <span className="category-label">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
