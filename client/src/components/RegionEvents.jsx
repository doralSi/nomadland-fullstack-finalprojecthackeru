import React, { useState, useEffect } from 'react';
import { getEvents } from '../api/events';
import { isPointInsideRegion } from '../utils/isInsidePolygon';
import EventCard from './EventCard';
import AddEventModal from './AddEventModal';
import './RegionEvents.css';

const RegionEvents = ({ region }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [groupedEvents, setGroupedEvents] = useState({
    today: [],
    tomorrow: [],
    thisWeek: []
  });

  useEffect(() => {
    if (region) {
      loadEvents();
    }
  }, [region]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const data = await getEvents(null, today.toISOString(), endDate.toISOString());
      // Filter events for this region
      const regionEvents = data.filter(event => {
        if (!event.location || !region) return false;
        return isPointInsideRegion(event.location.lat, event.location.lng, region);
      });
      setEvents(regionEvents);
      groupEventsByDate(regionEvents);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const groupEventsByDate = (eventsList) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const grouped = {
      today: [],
      tomorrow: [],
      thisWeek: []
    };

    eventsList.forEach(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate.getTime() === today.getTime()) {
        grouped.today.push(event);
      } else if (eventDate.getTime() === tomorrow.getTime()) {
        grouped.tomorrow.push(event);
      } else if (eventDate >= tomorrow && eventDate < nextWeek) {
        grouped.thisWeek.push(event);
      }
    });

    setGroupedEvents(grouped);
  };

  const handleEventCreated = () => {
    setShowAddModal(false);
    loadEvents();
  };

  if (loading) {
    return (
      <div className="region-events-container">
        <div className="events-loading">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="region-events-container">
        <div className="events-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="region-events-container">
      <div className="events-header">
        <h3>Upcoming Events</h3>
        <button className="add-event-btn" onClick={() => setShowAddModal(true)}>
          <span className="material-symbols-outlined">add</span>
          Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <span className="material-symbols-outlined">event_busy</span>
          <p>No events scheduled yet</p>
          <p className="no-events-subtitle">Be the first to create an event!</p>
        </div>
      ) : (
        <>
          {groupedEvents.today.length > 0 && (
            <div className="events-section">
              <h4 className="events-section-title">
                <span className="material-symbols-outlined">today</span>
                Today
              </h4>
              <div className="events-grid">
                {groupedEvents.today.map(event => (
                  <EventCard key={event._id} event={event} mode="daily" />
                ))}
              </div>
            </div>
          )}

          {groupedEvents.tomorrow.length > 0 && (
            <div className="events-section">
              <h4 className="events-section-title">
                <span className="material-symbols-outlined">event</span>
                Tomorrow
              </h4>
              <div className="events-grid">
                {groupedEvents.tomorrow.map(event => (
                  <EventCard key={event._id} event={event} mode="daily" />
                ))}
              </div>
            </div>
          )}

          {groupedEvents.thisWeek.length > 0 && (
            <div className="events-section">
              <h4 className="events-section-title">
                <span className="material-symbols-outlined">date_range</span>
                This Week
              </h4>
              <div className="events-grid">
                {groupedEvents.thisWeek.map(event => (
                  <EventCard key={event._id} event={event} mode="daily" />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <AddEventModal
          region={region}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleEventCreated}
        />
      )}
    </div>
  );
};

export default RegionEvents;
