import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import { getEvents } from '../api/events';
import RegionHero from '../components/RegionHero';
import CategoryFilterBar from '../components/CategoryFilterBar';
import RegionMap from '../components/RegionMap';
import CalendarView from '../components/CalendarView';
import EventDetailsModal from '../components/EventDetailsModal';
import AddEventModal from '../components/AddEventModal';
import { isPointInsideRegion } from '../utils/isInsidePolygon';
import './RegionPage.css';

const RegionPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { selectRegionBySlug, currentRegion } = useRegion();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventToShowOnMap, setEventToShowOnMap] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const loadRegion = async () => {
      try {
        setLoading(true);
        setError(null);
        await selectRegionBySlug(slug);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load region');
      } finally {
        setLoading(false);
      }
    };

    loadRegion();
  }, [slug, selectRegionBySlug]);

  useEffect(() => {
    if (currentRegion) {
      loadEvents();
    }
  }, [currentRegion]);

  const loadEvents = async () => {
    try {
      // Get events for the entire year to support calendar navigation
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Start from last month
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // End one year from now
      
      const data = await getEvents(null, startDate.toISOString(), endDate.toISOString());
      // Filter events for this region based on location
      const regionEvents = data.filter(event => {
        if (!event.location) return false;
        return isPointInsideRegion(event.location.lat, event.location.lng, currentRegion);
      });
      setEvents(regionEvents);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  const handleBackToGlobalMap = () => {
    navigate('/');
  };

  const handleCategorySelect = (categories) => {
    setSelectedCategories(categories);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleShowEventOnMap = (event) => {
    setShowEventDetails(false);
    setEventToShowOnMap(event);
    
    // Scroll to map
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Clear the event highlight after 5 seconds
    setTimeout(() => {
      setEventToShowOnMap(null);
    }, 5000);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowAddEventModal(true);
  };

  const handleEventCreated = () => {
    setShowAddEventModal(false);
    setEditingEvent(null);
    loadEvents(); // Refresh events
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowAddEventModal(true);
    setShowEventDetails(false);
  };

  if (loading) {
    return (
      <div className="region-page-container">
        <div className="region-page-loading">Loading region...</div>
      </div>
    );
  }

  if (error || !currentRegion) {
    return (
      <div className="region-page-container">
        <div className="region-page-error">
          <h2>{error || 'Region not found'}</h2>
          <button onClick={handleBackToGlobalMap} className="back-btn">
            Back to Regions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="region-page-container">
      <RegionHero 
        name={currentRegion.name}
        subtitle="Digital Nomad Paradise"
        imageUrl={currentRegion.heroImageUrl}
        about={currentRegion.description}
        onBackClick={handleBackToGlobalMap}
        buttonText="Back to Map"
      />

      <div className="region-about-section">
        <h2>About {currentRegion.name}</h2>
        <p>{currentRegion.description}</p>
      </div>

      <CategoryFilterBar 
        selectedCategories={selectedCategories}
        onSelectCategory={handleCategorySelect}
      />

      <div ref={mapRef}>
        <RegionMap 
          region={currentRegion} 
          selectedCategories={selectedCategories}
          eventToShow={eventToShowOnMap}
        />
      </div>

      <CalendarView
        events={events}
        region={currentRegion}
        onEventClick={handleEventClick}
        onAddEvent={handleAddEvent}
      />

      {showEventDetails && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          region={currentRegion}
          onClose={() => setShowEventDetails(false)}
          onShowOnMap={handleShowEventOnMap}
          onEventDeleted={loadEvents}
          onEdit={handleEditEvent}
        />
      )}

      {showAddEventModal && (
        <AddEventModal
          region={currentRegion}
          onClose={() => {
            setShowAddEventModal(false);
            setEditingEvent(null);
          }}
          onSuccess={handleEventCreated}
          editMode={!!editingEvent}
          eventData={editingEvent}
        />
      )}
    </div>
  );
};

export default RegionPage;
