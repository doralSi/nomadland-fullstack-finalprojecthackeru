import React, { createContext, useState, useContext, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  // Load saved preferences from localStorage
  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem('accessibility-preferences');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const initialPreferences = loadPreferences() || {
    fontSize: 'medium',
  };

  const [preferences, setPreferences] = useState(initialPreferences);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    applyAccessibilitySettings(preferences);
  }, [preferences]);

  const applyAccessibilitySettings = (settings) => {
    const root = document.documentElement;

    // Font Size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    };
    root.style.setProperty('--base-font-size', fontSizes[settings.fontSize]);
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetPreferences = () => {
    const defaults = {
      fontSize: 'medium',
    };
    setPreferences(defaults);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        updatePreference,
        resetPreferences,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};
