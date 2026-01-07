import React from 'react';
import PropTypes from 'prop-types';
import './EventCard.css';

const EventCard = ({ event, mode = 'daily', onClick, onEdit }) => {
  const formatTime = (timeString) => {
    return timeString;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (mode === 'weekly') {
    // Compact mode for week view
    return (
      <div className="event-card compact" onClick={onClick}>
        <div className="event-card-time">
          <span className="material-icons">schedule</span>
          {formatTime(event.time)}
        </div>
        <div className="event-card-title">{event.title}</div>
        {event.cost && (
          <div className="event-card-cost">
            <span className="material-icons">payments</span>
            {event.cost}
          </div>
        )}
      </div>
    );
  }

  // Daily mode - full card
  return (
    <div className="event-card full" onClick={onClick}>
      {event.imageUrl && (
        <div className="event-card-image">
          <img src={event.imageUrl} alt={event.title} />
          {event.cost && (
            <div className="event-card-cost-badge">{event.cost}</div>
          )}
        </div>
      )}
      <div className="event-card-content">
        <div className="event-card-header">
          <h3>{event.title}</h3>
          <div className="event-card-time">
            <span className="material-icons">schedule</span>
            {formatTime(event.time)}
          </div>
        </div>
        {event.description && (
          <p className="event-card-description">
            {event.description.length > 120
              ? event.description.substring(0, 120) + '...'
              : event.description}
          </p>
        )}
        <div className="event-card-footer">
          <div className="event-card-location">
            <span className="material-icons">place</span>
            {event.region?.name || 'Location'}
          </div>
          {!event.imageUrl && event.cost && (
            <div className="event-card-cost">
              <span className="material-icons">payments</span>
              {event.cost}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    cost: PropTypes.string,
    time: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number
    }),
    region: PropTypes.shape({
      name: PropTypes.string,
      slug: PropTypes.string
    })
  }).isRequired,
  mode: PropTypes.oneOf(['daily', 'weekly']),
  onClick: PropTypes.func,
  onEdit: PropTypes.func
};

export default EventCard;
