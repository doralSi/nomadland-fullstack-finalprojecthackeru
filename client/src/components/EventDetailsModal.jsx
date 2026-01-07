import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axiosInstance';
import { useConfirm } from '../hooks/useConfirm';
import { useAlert } from '../hooks/useAlert';
import { toast } from 'react-toastify';
import ConfirmDialog from './ConfirmDialog';
import AlertDialog from './AlertDialog';
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

const EventDetailsModal = ({ event, onClose, onShowOnMap, region, onEventDeleted, onEdit }) => {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(event.rsvps?.length || 0);
  const [hasRSVPd, setHasRSVPd] = useState(
    user && event.rsvps?.some(rsvp => rsvp.user?._id === user.id || rsvp.user === user.id)
  );
  const [rsvpLoading, setRsvpLoading] = useState(false);
  
  const confirmDialog = useConfirm();
  const alertDialog = useAlert();

  if (!event) return null;

  const handleDelete = async () => {
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      setDeleting(true);
      await axios.delete(`/events/${event.templateId || event._id}`);
      await alertDialog.alert({
        type: 'success',
        title: 'Success',
        message: 'Event deleted successfully'
      });
      if (onEventDeleted) {
        onEventDeleted();
      }
      onClose();
    } catch (err) {
      console.error('Error deleting event:', err);
      await alertDialog.alert({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Failed to delete event'
      });
      setDeleting(false);
    }
  };

  const isOwner = user && event.createdBy && event.createdBy._id === user.id;
  const isAdmin = user && user.role === 'admin';
  const canDelete = isOwner || isAdmin;
  const canEdit = isOwner; // Only owner can edit their event

  const handleRSVP = async () => {
    if (!user) {
      toast.info('Please login to RSVP');
      return;
    }

    try {
      setRsvpLoading(true);
      const templateId = event.templateId || event._id;
      
      if (hasRSVPd) {
        await axios.delete(`/events/${templateId}/rsvp`);
        setRsvpCount(prev => prev - 1);
        setHasRSVPd(false);
        toast.success('RSVP cancelled');
      } else {
        await axios.post(`/events/${templateId}/rsvp`);
        setRsvpCount(prev => prev + 1);
        setHasRSVPd(true);
        toast.success("You're going!");
      }
    } catch (err) {
      console.error('RSVP error:', err);
      toast.error(err.response?.data?.message || 'Failed to update RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleShare = (platform) => {
    const eventUrl = window.location.origin + `/event/${event.templateId || event._id}`;
    const title = event.title;
    const description = event.description;

    switch (platform) {
      case 'link':
        navigator.clipboard.writeText(eventUrl);
        alert('Link copied to clipboard!');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + eventUrl)}`;
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + '\n' + eventUrl)}`, '_blank');
        break;
      default:
        break;
    }
  };

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
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.config.onConfirm}
        message={confirmDialog.config.message}
        title={confirmDialog.config.title}
        confirmText={confirmDialog.config.confirmText}
        cancelText={confirmDialog.config.cancelText}
      />
      
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={alertDialog.handleClose}
        message={alertDialog.config.message}
        title={alertDialog.config.title}
        type={alertDialog.config.type}
        confirmText={alertDialog.config.confirmText}
      />
      
      <div className="event-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn-top" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Edit Button - Only for owner */}
        {canEdit && onEdit && (
          <button 
            className="modal-edit-btn-top" 
            onClick={() => onEdit(event)}
            title="Edit Event"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
        )}

        {/* Delete Button - Only for owner or admin */}
        {canDelete && (
          <button 
            className="modal-delete-btn-top" 
            onClick={handleDelete}
            disabled={deleting}
            title="Delete event"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        )}

        {/* Hero Image */}
        {event.imageUrl && (
          <div className="event-modal-image">
            <img src={event.imageUrl} alt={event.title} />
          </div>
        )}

        {/* Content */}
        <div className="event-modal-content">
          {/* Title - Centered */}
          <h1 className="event-modal-title">{event.title}</h1>

          {/* Event Details - Full Width Rows */}
          <div className="event-details-list">
            {/* Date */}
            <div className="event-detail-row">
              <div className="detail-icon">
                <span className="material-symbols-outlined">event</span>
              </div>
              <div className="detail-label">Date</div>
              <div className="detail-value">
                {formatDate(event.date || event.startDate)}
                {event.endDate && event.startDate !== event.endDate && 
                  ` - ${formatDate(event.endDate)}`}
              </div>
            </div>

            {/* All Day Event Badge */}
            {event.isAllDay && (
              <div className="event-detail-row">
                <div className="detail-icon">
                  <span className="material-symbols-outlined">today</span>
                </div>
                <div className="detail-label">Duration</div>
                <div className="detail-value">All-day event</div>
              </div>
            )}

            {/* Time and Duration */}
            {!event.isAllDay && event.time && (
              <div className="event-detail-row">
                <div className="detail-icon">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div className="detail-label">Time</div>
                <div className="detail-value">
                  {formatTime(event.time)}
                  {event.duration && ` (${event.duration} ${event.duration === 1 ? 'hour' : 'hours'})`}
                </div>
              </div>
            )}

            {/* Cost */}
            {event.cost && (
              <div className="event-detail-row">
                <div className="detail-icon">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div className="detail-label">Cost</div>
                <div className="detail-value">{event.cost}</div>
              </div>
            )}

            {/* Region */}
            {(region || event.region) && (
              <div className="event-detail-row">
                <div className="detail-icon">
                  <span className="material-symbols-outlined">map</span>
                </div>
                <div className="detail-label">Region</div>
                <div className="detail-value">
                  {region?.name || event.region?.name || 'Unknown'}
                </div>
              </div>
            )}

            {/* Repeat */}
            {event.repeat && event.repeat !== 'none' && (
              <div className="event-detail-row">
                <div className="detail-icon">
                  <span className="material-symbols-outlined">repeat</span>
                </div>
                <div className="detail-label">Repeats</div>
                <div className="detail-value">
                  {event.repeat.charAt(0).toUpperCase() + event.repeat.slice(1)}
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
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[event.location.lat, event.location.lng]} />
                </MapContainer>
              </div>
            </div>
          )}

          {/* RSVP and Share Section */}
          <div className="event-rsvp-share-section">
            {/* RSVP */}
            <div className="event-rsvp">
              <button 
                className={`rsvp-btn ${hasRSVPd ? 'active' : ''}`}
                onClick={handleRSVP}
                disabled={rsvpLoading || !user}
                title={!user ? 'Login to RSVP' : hasRSVPd ? 'Cancel RSVP' : 'RSVP to this event'}
              >
                <span className="material-symbols-outlined">
                  {hasRSVPd ? 'check_circle' : 'person_add'}
                </span>
                <span className="rsvp-count">{rsvpCount}</span>
              </button>
              <span className="rsvp-label">
                {hasRSVPd ? 'You\'re going!' : 'RSVP'}
              </span>
            </div>

            {/* Share Buttons */}
            <div className="event-share">
              <span className="share-label">Share:</span>
              <button 
                className="share-btn"
                onClick={() => handleShare('link')}
                title="Copy link"
              >
                <span className="material-symbols-outlined">link</span>
              </button>
              <button 
                className="share-btn"
                onClick={() => handleShare('email')}
                title="Share via email"
              >
                <span className="material-symbols-outlined">mail</span>
              </button>
              <button 
                className="share-btn whatsapp"
                onClick={() => handleShare('whatsapp')}
                title="Share via WhatsApp"
              >
                <span className="material-symbols-outlined">chat</span>
              </button>
            </div>
          </div>

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
                <span>Created by {event.createdBy.username || event.createdBy.email || 'Community Member'}</span>
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
    templateId: PropTypes.string,
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
      _id: PropTypes.string,
      username: PropTypes.string,
      email: PropTypes.string
    }),
    rsvps: PropTypes.arrayOf(PropTypes.shape({
      user: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          _id: PropTypes.string,
          username: PropTypes.string,
          email: PropTypes.string
        })
      ]),
      date: PropTypes.string
    })),
    createdAt: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  onShowOnMap: PropTypes.func,
  onEventDeleted: PropTypes.func,
  onEdit: PropTypes.func,
  region: PropTypes.object
};

export default EventDetailsModal;
