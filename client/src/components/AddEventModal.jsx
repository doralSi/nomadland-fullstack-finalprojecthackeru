import React, { useState } from 'react';
import { createEvent } from '../api/events';
import './AddEventModal.css';

const AddEventModal = ({ region, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cost: '',
    startDate: '',
    endDate: '',
    time: '',
    repeat: 'none',
    lat: '',
    lng: ''
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
      // Validate dates
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        setError('End date must be after start date');
        setLoading(false);
        return;
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        cost: formData.cost || 'Free',
        startDate: formData.startDate,
        endDate: formData.endDate,
        time: formData.time,
        repeat: formData.repeat,
        location: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        },
        region: region._id,
        language: 'en' // Default to English for now
      };

      await createEvent(eventData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Event</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter event name"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the event..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="time">Time *</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cost">Cost</label>
              <input
                type="text"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="e.g., Free, $10, ₪50"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="repeat">Repeat</label>
            <select
              id="repeat"
              name="repeat"
              value={formData.repeat}
              onChange={handleChange}
            >
              <option value="none">No Repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lat">Latitude *</label>
              <input
                type="number"
                id="lat"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                required
                step="any"
                placeholder="e.g., 32.0853"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lng">Longitude *</label>
              <input
                type="number"
                id="lng"
                name="lng"
                value={formData.lng}
                onChange={handleChange}
                required
                step="any"
                placeholder="e.g., 34.7818"
              />
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
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>

        <div className="modal-info">
          <span className="material-symbols-outlined">info</span>
          <p>Your event will be reviewed by moderators before appearing publicly.</p>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
