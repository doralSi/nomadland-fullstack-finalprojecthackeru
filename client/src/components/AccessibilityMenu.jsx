import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import './AccessibilityMenu.css';

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences, updatePreference, resetPreferences } = useAccessibility();

  console.log('AccessibilityMenu rendered!');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const fontSizes = [
    { value: 'small', label: 'S', title: 'Small' },
    { value: 'medium', label: 'M', title: 'Medium' },
    { value: 'large', label: 'L', title: 'Large' },
    { value: 'xlarge', label: 'XL', title: 'Extra Large' },
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleMenu}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          zIndex: 99999,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
          {isOpen ? 'close' : 'accessibility'}
        </span>
      </button>

      {/* Menu Panel */}
      {isOpen && (
        <>
          <div className="accessibility-overlay" onClick={toggleMenu} />
          <div className="accessibility-menu">
            <div className="accessibility-header">
              <h2>
                <span className="material-symbols-outlined">accessibility</span>
                Accessibility
              </h2>
            </div>

            <div className="accessibility-content">
              {/* Font Size */}
              <div className="accessibility-section">
                <label className="accessibility-label">
                  <span className="material-symbols-outlined">format_size</span>
                  Text Size
                </label>
                <div className="font-size-buttons">
                  {fontSizes.map(size => (
                    <button
                      key={size.value}
                      className={`font-size-btn ${preferences.fontSize === size.value ? 'active' : ''}`}
                      onClick={() => updatePreference('fontSize', size.value)}
                      title={size.title}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="accessibility-footer">
              <button className="reset-btn" onClick={resetPreferences}>
                <span className="material-symbols-outlined">refresh</span>
                Reset All Settings
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AccessibilityMenu;
