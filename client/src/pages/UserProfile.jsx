import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>My Profile</h2>
        
        <div className="profile-info">
          <div className="profile-field">
            <label>Full Name</label>
            <div className="profile-value">{user.name || user.firstName || 'N/A'}</div>
          </div>

          <div className="profile-field">
            <label>Email</label>
            <div className="profile-value">{user.email}</div>
          </div>

          <div className="profile-field">
            <label>Account Type</label>
            <div className="profile-value">
              {user.role === 'admin' ? 'Admin' : user.role === 'mapRanger' ? 'Map Ranger' : 'Regular User'}
            </div>
          </div>

          <div className="profile-field">
            <label>Member Since</label>
            <div className="profile-value">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>

        <button onClick={handleEdit} className="btn btn-primary auth-submit-btn">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
