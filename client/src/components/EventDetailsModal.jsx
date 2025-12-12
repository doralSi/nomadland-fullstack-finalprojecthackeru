import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './EventDetailsModal.css';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EventDetailsModal = ({ event, onClose, onShowOnMap, region }) => {
  if (!event) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const handleShowOnMap = () => {
    if (event.location && onShowOnMap) {
      onShowOnMap(event);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="event-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header with Image Background */}
        {event.imageUrl ? (
          <div className="event-modal-hero" style={{ backgroundImage: `url(${event.imageUrl})` }}>
            <div className="event-modal-hero-overlay">
              <button className="modal-close-btn-top" onClick={onClose}>
                <span className="material-symbols-outlined">close</span>
              </button>
              <h1 className="event-hero-title">{event.title}</h1>
            </div>
          </div>
        ) : (
          <div className="event-modal-header-simple">
            <h2>{event.title}</h2>
            <button className="modal-close-btn" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="event-modal-content">

          {/* Event Details */}
          <div className="event-details-grid">
            {/* Date & Time */}
            <div className="event-detail-item">
              <div className="detail-icon">
                <span className="material-symbols-outlined">event</span>
              </div>
              <div className="detail-content">
                <div className="detail-label">Date</div>
                <div className="detail-value">
                  {formatDate(event.date || event.startDate)}
                </div>
              </div>
            </div>

            {event.time && (
              <div className="event-detail-item">
                <div className="detail-icon">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div className="detail-content">
                  <div className="detail-label">Time</div>
                  <div className="detail-value">{formatTime(event.time)}</div>
                </div>
              </div>
            )}

            {/* Cost */}
            {event.cost && (
              <div className="event-detail-item">
                <div className="detail-icon">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div className="detail-content">
                  <div className="detail-label">Cost</div>
                  <div className="detail-value">{event.cost}</div>
                </div>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="event-detail-item">
                <div className="detail-icon">
                  <span className="material-symbols-outlined">place</span>
                </div>
                <div className="detail-content">
                  <div className="detail-label">Location</div>
                  <div className="detail-value">
                    {event.location.name || `${event.location.lat.toFixed(4)}, ${event.location.lng.toFixed(4)}`}
                  </div>
                </div>
              </div>
            )}

            {/* Region */}
            {(region || event.region) && (
              <div className="event-detail-item">
                <div className="detail-icon">
                  <span className="material-symbols-outlined">map</span>
                </div>
                <div className="detail-content">
                  <div className="detail-label">Region</div>
                  <div className="detail-value">
                    {region?.name || event.region?.name || 'Unknown'}
                  </div>
                </div>
              </div>
            )}

            {/* Repeat */}
            {event.repeat && event.repeat !== 'none' && (
              <div className="event-detail-item">
                <div className="detail-icon">
                  <span className="material-symbols-outlined">repeat</span>
                </div>
                <div className="detail-content">
                  <div className="detail-label">Repeats</div>
                  <div className="detail-value">
                    {event.repeat.charAt(0).toUpperCase() + event.repeat.slice(1)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="event-description-section">
              <h3>
                <span className="material-symbols-outlined">description</span>
                About this event
              </h3>
              <p>{event.description}</p>
            </div>
          )}

          {/* Location Map */}
          {event.location && (
            <div className="event-map-section">
              <h3>
                <span className="material-symbols-outlined">place</span>
                Location
              </h3>
              <div className="event-map-container">
                <MapContainer
                  center={[event.location.lat, event.location.lng]}
                  zoom={13}
                  style={{ height: '250px', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[event.location.lat, event.location.lng]} />
                </MapContainer>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="event-modal-actions">
            {event.location && onShowOnMap && (
              <button 
                className="event-action-btn primary"
                onClick={handleShowOnMap}
              >
                <span className="material-symbols-outlined">map</span>
                Show on Map
              </button>
            )}
            
            {event.location && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${event.location.lat},${event.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="event-action-btn secondary"
              >
                <span className="material-symbols-outlined">directions</span>
                Get Directions
              </a>
            )}
          </div>

          {/* Footer Info */}
          <div className="event-modal-footer">
            {event.createdBy && (
              <div className="event-creator-info">
                <span className="material-symbols-outlined">person</span>
                <span>Created by {event.createdBy.username || 'Community Member'}</span>
              </div>
            )}
            {event.createdAt && (
              <div className="event-created-date">
                Added {new Date(event.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

EventDetailsModal.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    cost: PropTypes.string,
    time: PropTypes.string,
    date: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    repeat: PropTypes.string,
    location: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
      name: PropTypes.string
    }),
    region: PropTypes.shape({
      name: PropTypes.string,
      slug: PropTypes.string
    }),
    createdBy: PropTypes.shape({
      username: PropTypes.string
    }),
    createdAt: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  onShowOnMap: PropTypes.func,
  region: PropTypes.object
};

export default EventDetailsModal;
