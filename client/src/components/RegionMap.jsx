import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPoints } from '../api/points';
import { getEvents } from '../api/events';
import { polygonToLeafletFormat, isPointInsideRegion } from '../utils/isInsidePolygon';
import { CATEGORIES } from '../constants/categories';
import AddPointModal from './AddPointModal';
import './RegionMap.css';

// Helper function to get category icon
const getCategoryIcon = (categoryKey) => {
  const item = CATEGORIES.find(c => c.key === categoryKey);
  return item ? item.materialIcon : 'location_on';
};

// Helper function to get category label
const getCategoryLabel = (categoryKey) => {
  const item = CATEGORIES.find(c => c.key === categoryKey);
  return item ? item.label : categoryKey;
};

// Create custom DivIcon for points based on category
const createPointIcon = (categoryKey) => {
  const iconName = getCategoryIcon(categoryKey);
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="map-marker category-${categoryKey}">
        <span class="material-symbols-outlined">${iconName}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Create custom DivIcon for events
const createEventIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="map-marker event-marker">
        <span class="material-symbols-outlined">event</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Fix Leaflet default marker icon issue (keep for compatibility)
// Fix Leaflet default marker icon issue (keep for compatibility)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map bounds
const MapBounds = ({ region }) => {
  const map = useMap();

  useEffect(() => {
    if (region && region.polygon && region.polygon.length > 0) {
      const bounds = polygonToLeafletFormat(region.polygon);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [region, map]);

  return null;
};

// Component to handle map clicks for adding points
const MapClickHandler = ({ isAddingPoint, onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (isAddingPoint) {
        onMapClick(e.latlng);
      }
    }
  });

  return null;
};

const RegionMap = ({ region }) => {
  const [points, setPoints] = useState([]);
  const [events, setEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [showAddPointModal, setShowAddPointModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPoints();
  }, [region]);

  const loadPoints = async () => {
    try {
      setLoading(true);
      const data = await getPoints();
      // Filter approved points for this region based on polygon
      const approvedPoints = data.filter(p => {
        if (p.status !== 'approved') return false;
        // Check if point is within region polygon
        return isPointInsideRegion(p.lat, p.lng, region);
      });
      setPoints(approvedPoints);
    } catch (err) {
      console.error('Error loading points:', err);
      setError('Failed to load points');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      // Get events for the next 7 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const data = await getEvents(null, startDate.toISOString(), endDate.toISOString());
      // Filter events for this region based on location
      const regionEvents = data.filter(event => {
        if (!event.location) return false;
        return isPointInsideRegion(event.location.lat, event.location.lng, region);
      });
      setEvents(regionEvents);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  const handleFabClick = () => {
    setIsAddingPoint(true);
  };

  const handleMapClick = (latlng) => {
    const { lat, lng } = latlng;
    
    // Validate location is inside region
    if (isPointInsideRegion(lat, lng, region)) {
      setSelectedLocation({ lat, lng });
      setShowAddPointModal(true);
      setIsAddingPoint(false);
    } else {
      alert('Points can only be added inside this region.');
      setIsAddingPoint(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddPointModal(false);
    setSelectedLocation(null);
    setIsAddingPoint(false);
  };

  const handlePointCreated = () => {
    setShowAddPointModal(false);
    setSelectedLocation(null);
    setIsAddingPoint(false);
    loadPoints(); // Refresh points
  };

  const handleToggleEvents = async () => {
    if (!showEvents && events.length === 0) {
      await loadEvents();
    }
    setShowEvents(!showEvents);
  };

  if (!region) {
    return <div className="region-map-error">No region data</div>;
  }

  const polygonPositions = polygonToLeafletFormat(region.polygon);

  return (
    <div className="region-map-section">
      <div className="region-map-header">
        <h2>Explore {region.name}</h2>
        <div className="map-controls">
          <button 
            className={`toggle-events-btn ${showEvents ? 'active' : ''}`}
            onClick={handleToggleEvents}
          >
            <span className="material-symbols-outlined">event</span>
            {showEvents ? 'Hide Events' : 'Show Events'}
          </button>
        </div>
      </div>

      <div className="region-map-container">
        <MapContainer
          center={[region.center.lat, region.center.lng]}
          zoom={region.zoom || 12}
          className="region-leaflet-map"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapBounds region={region} />
          <MapClickHandler isAddingPoint={isAddingPoint} onMapClick={handleMapClick} />

          {/* Region polygon */}
          <Polygon
            positions={polygonPositions}
            pathOptions={{
              color: '#667eea',
              fillColor: '#667eea',
              fillOpacity: 0.1,
              weight: 2
            }}
          />

          {/* Points markers */}
          {points.map((point) => (
            <Marker
              key={point._id}
              position={[point.lat, point.lng]}
              icon={createPointIcon(point.category)}
            >
              <Popup>
                <div className="point-popup">
                  <h3>{point.title}</h3>
                  {point.category && <p className="point-category">{getCategoryLabel(point.category)}</p>}
                  {point.description && <p>{point.description}</p>}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Event markers */}
          {showEvents && events.map((event) => (
            <Marker
              key={event._id}
              position={[event.location.lat, event.location.lng]}
              icon={createEventIcon()}
            >
              <Popup>
                <div className="event-popup">
                  <h3>{event.title}</h3>
                  <p className="event-date">{new Date(event.date).toLocaleDateString()}</p>
                  {event.description && <p>{event.description}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Action Button */}
        <button 
          className={`map-fab ${isAddingPoint ? 'active' : ''}`}
          onClick={handleFabClick}
          title="Add Point"
        >
          <span className="material-symbols-outlined">add</span>
        </button>

        {isAddingPoint && (
          <div className="map-instruction-tooltip">
            Click on map to choose location
          </div>
        )}
      </div>

      {showAddPointModal && selectedLocation && (
        <AddPointModal
          location={selectedLocation}
          onClose={handleCloseModal}
          onSuccess={handlePointCreated}
        />
      )}
    </div>
  );
};

export default RegionMap;
