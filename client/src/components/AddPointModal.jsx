import React, { useState, useEffect } from 'react';
import { createPoint, updatePoint } from '../api/points';
import { CATEGORIES } from '../constants/categories';
import { toast } from 'react-toastify';
import './AddPointModal.css';

const AddPointModal = ({ location, regionSlug, onClose, onSuccess, editMode = false, pointData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0].key,
    isPrivate: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when in edit mode
  useEffect(() => {
    if (editMode && pointData) {
      setFormData({
        title: pointData.title || '',
        description: pointData.description || '',
        category: pointData.category || CATEGORIES[0].key,
        isPrivate: pointData.isPrivate || false
      });
    }
  }, [editMode, pointData]);

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
      if (editMode && pointData) {
        // Update existing point
        await updatePoint(pointData._id, formData);
        toast.success('Point updated successfully!');
      } else {
        // Create new point
        const newPointData = {
          ...formData,
          lat: location.lat,
          lng: location.lng,
          regionSlug: regionSlug,
          language: 'en' // Default to English for now
        };
        await createPoint(newPointData);
        toast.success('Point created successfully!');
      }
      onSuccess();
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} point`;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editMode ? 'Edit Point' : 'Add New Point'}</h2>
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

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              />
              <span>Private Point (only visible to you)</span>
            </label>
          </div>

          <div className="form-group location-display">
            <label>Location</label>
            <div className="location-info">
              <span className="material-symbols-outlined">location_on</span>
              <span>
                {editMode && pointData 
                  ? `Lat: ${pointData.lat.toFixed(6)}, Lng: ${pointData.lng.toFixed(6)}`
                  : `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`
                }
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
              {loading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Point' : 'Create Point')}
            </button>
          </div>
        </form>

        {!editMode && (
          <div className="modal-info">
            <span className="material-symbols-outlined">info</span>
            <p>Your point will be reviewed by moderators before appearing on the map.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPointModal;
