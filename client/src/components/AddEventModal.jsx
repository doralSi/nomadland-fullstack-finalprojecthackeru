import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from 'react-leaflet';
import { createEvent, updateEvent } from '../api/events';
import { isPointInsidePolygon, polygonToLeafletFormat } from '../utils/isInsidePolygon';
import axiosInstance from '../api/axiosInstance';
import '../utils/leafletConfig';
import 'leaflet/dist/leaflet.css';
import './AddEventModal.css';

const AddEventModal = ({ region, onClose, onSuccess, editMode = false, eventData = null }) => {
  // Get center coordinates - support both array and object formats
  const getCenterCoords = () => {
    if (!region?.center) return [0, 0];
    if (Array.isArray(region.center)) {
      return region.center;
    }
    if (region.center.lat && region.center.lng) {
      return [region.center.lat, region.center.lng];
    }
    return [0, 0];
  };

  const centerCoords = getCenterCoords();
  const polygonPositions = region?.polygon ? polygonToLeafletFormat(region.polygon) : [];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cost: '',
    startDate: '',
    endDate: '',
    hour: '12',
    minute: '00',
    duration: '1',
    isAllDay: false,
    repeat: 'none',
    lat: centerCoords[0] || '',
    lng: centerCoords[1] || ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Initialize form data when in edit mode
  useEffect(() => {
    if (editMode && eventData) {
      // Handle both old format (date) and new format (startDate/endDate)
      const dateStr = eventData.startDate || eventData.date;
      const endDateStr = eventData.endDate || eventData.date;
      
      let startDateFormatted = '';
      let endDateFormatted = '';
      
      try {
        if (dateStr) {
          const eventStart = new Date(dateStr);
          if (!isNaN(eventStart.getTime())) {
            startDateFormatted = eventStart.toISOString().split('T')[0];
          }
        }
        
        if (endDateStr) {
          const eventEnd = new Date(endDateStr);
          if (!isNaN(eventEnd.getTime())) {
            endDateFormatted = eventEnd.toISOString().split('T')[0];
          }
        }
      } catch (err) {
        console.error('Error parsing dates:', err);
      }
      
      const eventTime = eventData.time || '12:00';
      const [hour, minute] = eventTime.split(':');
      
      const centerLat = region?.center?.lat || (Array.isArray(region?.center) ? region.center[0] : 0);
      const centerLng = region?.center?.lng || (Array.isArray(region?.center) ? region.center[1] : 0);
      
      setFormData({
        title: eventData.title || '',
        description: eventData.description || '',
        cost: eventData.cost || '',
        startDate: startDateFormatted,
        endDate: endDateFormatted,
        hour: hour || '12',
        minute: minute || '00',
        duration: '1',
        isAllDay: !eventData.time,
        repeat: eventData.repeat || 'none',
        lat: eventData.location?.lat || centerLat || '',
        lng: eventData.location?.lng || centerLng || ''
      });
      
      if (eventData.imageUrl) {
        setImagePreview(eventData.imageUrl);
      }
    }
  }, [editMode, eventData, region]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axiosInstance.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.imageUrl) {
        return response.data.imageUrl;
      } else {
        throw new Error('Invalid upload response');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      throw new Error(err.response?.data?.message || 'Failed to upload image');
    }
  };

  // Component for handling map clicks
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        // Check if point is inside region polygon
        if (region?.polygon) {
          const isInside = isPointInsidePolygon(
            e.latlng.lat,
            e.latlng.lng,
            region.polygon
          );
          
          if (!isInside) {
            setError('Please select a location within the region boundaries');
            return;
          }
        }
        
        setError(''); // Clear any previous errors
        setFormData({
          ...formData,
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      },
    });

    return formData.lat && formData.lng ? (
      <Marker position={[formData.lat, formData.lng]} />
    ) : null;
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

      // Validate location
      if (!formData.lat || !formData.lng) {
        setError('Please select a location on the map');
        setLoading(false);
        return;
      }

      let imageUrl = '';
      if (imageFile) {
        try {
          imageUrl = await uploadImage();
        } catch (err) {
          console.error('Image upload failed:', err);
          setError('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      } else if (editMode && imagePreview) {
        // If editing and no new image, keep the existing one
        imageUrl = imagePreview;
      }

      // Multi-day events or all-day events don't need time
      const isMultiDay = formData.startDate !== formData.endDate;
      const time = (formData.isAllDay || isMultiDay) ? null : `${formData.hour}:00`;

      const eventPayload = {
        title: formData.title,
        description: formData.description,
        cost: formData.cost || 'Free',
        startDate: formData.startDate,
        endDate: formData.endDate,
        time: time,
        duration: (formData.isAllDay || isMultiDay) ? null : parseInt(formData.duration),
        isAllDay: formData.isAllDay || isMultiDay,
        repeat: formData.repeat,
        location: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        },
        region: region._id,
        language: 'en', // Default to English for now
        imageUrl: imageUrl
      };
      
      if (editMode && eventData) {
        await updateEvent(eventData.templateId, eventPayload);
      } else {
        await createEvent(eventPayload);
      }
      
      onSuccess();
    } catch (err) {
      console.error('Event operation failed:', err);
      setError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} event`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editMode ? 'Edit Event' : 'Add New Event'}</h2>
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

          {/* Image Upload */}
          <div className="form-group image-upload-section">
            <label>Event Image</label>
            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Event preview" className="event-image-preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={handleRemoveImage}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ) : (
              <div className="image-upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                <span className="material-symbols-outlined">add_photo_alternate</span>
                <p>Click to upload event image</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
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
{/* All Day Event Checkbox */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isAllDay"
                checked={formData.isAllDay}
                onChange={handleChange}
              />
              <span>All-day event (or multi-day event)</span>
            </label>
          </div>

          {/* Time fields - only show if not all-day and single day */}
          {!formData.isAllDay && formData.startDate === formData.endDate && (
            <div className="form-row three-cols">
              <div className="form-group">
                <label htmlFor="hour">Start Hour *</label>
                <select
                  id="hour"
                  name="hour"
                  value={formData.hour}
                  onChange={handleChange}
                  required
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return <option key={hour} value={hour}>{hour}:00</option>;
                  })}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration (hours) *</label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const hours = i + 1;
                    return <option key={hours} value={hours}>{hours} {hours === 1 ? 'hour' : 'hours'}</option>;
                  })}
                </select>
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
          )}

          {/* Cost field for all-day events */}
          {formData.isAllDay && (
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
          )}

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

          {/* Map for Location Selection */}
          <div className="form-group map-selection-group">
            <label>Select Location on Map *</label>
            <div className="map-container-modal">
              <MapContainer
                center={centerCoords}
                zoom={region ? 11 : 8}
                style={{ height: '400px', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {polygonPositions.length > 0 && (
                  <Polygon
                    positions={polygonPositions}
                    pathOptions={{
                      color: '#4a5fc1',
                      fillColor: '#667eea',
                      fillOpacity: 0.2,
                      weight: 3,
                      opacity: 1,
                      dashArray: '5, 10'
                    }}
                  />
                )}
                <LocationMarker />
              </MapContainer>
            </div>
            {formData.lat && formData.lng && (
              <p className="location-coords">
                Selected: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
              </p>
            )}
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
              {loading 
                ? (editMode ? 'Updating...' : 'Creating...') 
                : (editMode ? 'Update Event' : 'Create Event')
              }
            </button>
          </div>
        </form>

        <div className="modal-info">
          <span className="material-symbols-outlined">info</span>
          <p>Your event will be published immediately after creation.</p>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
