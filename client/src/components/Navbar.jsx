import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          NomadLand
        </Link>
        
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          
          <li className="navbar-item">
            <Link to="/regions" className="navbar-link">Regions</Link>
          </li>
          
          <li className="navbar-item">
            <Link to="/map" className="navbar-link">Map</Link>
          </li>
          
          {isAuthenticated ? (
            <>
              <li className="navbar-item">
                <Link to="/points" className="navbar-link">Points</Link>
              </li>
              <li className="navbar-item">
                <Link to="/create-point" className="navbar-link">Create Point</Link>
              </li>
              <li className="navbar-item">
                <span className="navbar-user">Welcome, {user?.firstName || user?.email}</span>
              </li>
              <li className="navbar-item">
                <button onClick={logout} className="navbar-button">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link">Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
