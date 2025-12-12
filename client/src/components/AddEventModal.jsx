import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polygon } from 'react-leaflet';
import { createEvent } from '../api/events';
import { isPointInsidePolygon, polygonToLeafletFormat } from '../utils/isInsidePolygon';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './AddEventModal.css';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AddEventModal = ({ region, onClose, onSuccess }) => {
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
    repeat: 'none',
    lat: centerCoords[0] || '',
    lng: centerCoords[1] || ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Debug: Check region data
  console.log('Region data:', region);
  console.log('Region polygon:', region?.polygon);
  console.log('Region polygon length:', region?.polygon?.length);
  console.log('Region polygon first item:', region?.polygon?.[0]);
  console.log('Region center:', region?.center);
  console.log('Region center type:', typeof region?.center);
  console.log('Region center lat:', region?.center?.lat);
  console.log('Region center lng:', region?.center?.lng);
  console.log('centerCoords:', centerCoords);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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

      const response = await axios.post('http://localhost:5000/api/upload/image', formData, {
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
          setError('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }

      const time = `${formData.hour}:${formData.minute}`;

      const eventData = {
        title: formData.title,
        description: formData.description,
        cost: formData.cost || 'Free',
        startDate: formData.startDate,
        endDate: formData.endDate,
        time: time,
        repeat: formData.repeat,
        location: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        },
        region: region._id,
        language: 'en', // Default to English for now
        imageUrl: imageUrl
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

          <div className="form-row three-cols">
            <div className="form-group">
              <label htmlFor="hour">Hour *</label>
              <select
                id="hour"
                name="hour"
                value={formData.hour}
                onChange={handleChange}
                required
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return <option key={hour} value={hour}>{hour}</option>;
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="minute">Minutes *</label>
              <select
                id="minute"
                name="minute"
                value={formData.minute}
                onChange={handleChange}
                required
              >
                <option value="00">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
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
