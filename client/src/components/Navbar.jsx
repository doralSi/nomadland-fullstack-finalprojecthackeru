import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegionsDropdown from './RegionsDropdown';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          NomadLand
        </Link>

        <button 
          className="navbar-hamburger"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>
        
        <ul className={`navbar-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={closeMobileMenu}>Home</Link>
          </li>
          
          <li className="navbar-item">
            <Link to="/about" className="navbar-link" onClick={closeMobileMenu}>About</Link>
          </li>
          
          <li className="navbar-item">
            <RegionsDropdown onNavigate={closeMobileMenu} />
          </li>
          
          {isAuthenticated ? (
            <>
              <li className="navbar-item">
                <Link to="/me/maps" className="navbar-link" onClick={closeMobileMenu}>My Maps</Link>
              </li>
              {(user?.role === 'mapRanger' || user?.role === 'admin') && (
                <li className="navbar-item">
                  <Link to="/map-ranger" className="navbar-link navbar-link-highlight" onClick={closeMobileMenu}>
                    🗺️ Map Ranger Panel
                  </Link>
                </li>
              )}
              {user?.role === 'admin' && (
                <li className="navbar-item">
                  <Link to="/admin" className="navbar-link" onClick={closeMobileMenu}>
                    Admin Panel
                  </Link>
                </li>
              )}
              <li className="navbar-item">
                <span className="navbar-user">Welcome, {user?.firstName || user?.name || user?.email}</span>
              </li>
              <li className="navbar-item">
                <Link to="/profile" className="navbar-icon-button" title="My Profile" onClick={closeMobileMenu}>
                  <span className="material-symbols-outlined">
                    account_circle
                  </span>
                </Link>
              </li>
              <li className="navbar-item">
                <button onClick={toggleDarkMode} className="navbar-icon-button" title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
                  <span className="material-symbols-outlined">
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-button">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link" onClick={closeMobileMenu}>Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link" onClick={closeMobileMenu}>Register</Link>
              </li>
              <li className="navbar-item">
                <button onClick={toggleDarkMode} className="navbar-icon-button" title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
                  <span className="material-symbols-outlined">
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
