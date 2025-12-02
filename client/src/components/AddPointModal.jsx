import React, { useState } from 'react';
import { createPoint } from '../api/points';
import { CATEGORIES } from '../constants/categories';
import './AddPointModal.css';

const AddPointModal = ({ location, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0].key
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const pointData = {
        ...formData,
        lat: location.lat,
        lng: location.lng,
        language: 'en' // Default to English for now
      };

      await createPoint(pointData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create point');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Point</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter point name"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this place..."
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="form-group location-display">
            <label>Location</label>
            <div className="location-info">
              <span className="material-symbols-outlined">location_on</span>
              <span>
                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
              </span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Point'}
            </button>
          </div>
        </form>

        <div className="modal-info">
          <span className="material-symbols-outlined">info</span>
          <p>Your point will be reviewed by moderators before appearing on the map.</p>
        </div>
      </div>
    </div>
  );
};

export default AddPointModal;
