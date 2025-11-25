import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axiosInstance from '../api/axiosInstance';
import { getCategoryIconSvg } from '../utils/categoryIcons.jsx';
import { CATEGORIES } from '../constants/categories';
import CategoryFilter from '../components/CategoryFilter';
import { useRegion } from '../context/RegionContext';
import './MapView.css';

// Create a reusable marker icon with Material Icons
const createIcon = (svg) =>
  L.divIcon({
    html: `
      <div class="map-pin">
        <div class="map-pin-icon">${svg}</div>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
  });

// Component to handle map view updates
const MapViewController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

const MapView = () => {
  const [searchParams] = useSearchParams();
  const regionSlug = searchParams.get('region');
  
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Initialize with all categories selected
  const [selectedCategories, setSelectedCategories] = useState(
    CATEGORIES.map(c => c.key)
  );

  const { regions, selectRegionBySlug, currentRegion } = useRegion();
  const [mapCenter, setMapCenter] = useState([32.0853, 34.7818]);
  const [mapZoom, setMapZoom] = useState(8);

  const loadRegionData = async () => {
    try {
      const region = await selectRegionBySlug(regionSlug);
      if (region) {
        setMapCenter([region.center.lat, region.center.lng]);
        setMapZoom(region.zoom);
      }
    } catch (err) {
      console.error('Error loading region:', err);
    }
  };

  const fetchPoints = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/points');
      setPoints(response.data);
    } catch (err) {
      console.error('Error fetching points:', err);
      setError(err.response?.data?.message || 'Failed to fetch points');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load region if specified in URL
    if (regionSlug) {
      loadRegionData();
    }
    fetchPoints();
  }, [regionSlug]);

  // Handle category filter toggle
  const handleToggleCategory = (categoryKey) => {
    if (categoryKey === 'SELECT_ALL') {
      setSelectedCategories(CATEGORIES.map(c => c.key));
    } else if (categoryKey === 'CLEAR_ALL') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(prev => 
        prev.includes(categoryKey)
          ? prev.filter(key => key !== categoryKey)
          : [...prev, categoryKey]
      );
    }
  };

  // Check if a point is inside the current region's polygon
  const isPointInRegion = (point) => {
    if (!currentRegion || !currentRegion.polygon) return true;

    // Simple point-in-polygon check (ray casting algorithm)
    const polygon = currentRegion.polygon;
    const x = point.lng;
    const y = point.lat;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0]; // lng
      const yi = polygon[i][1]; // lat
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  };

  // Filter points based on selected categories and region
  const filteredPoints = points.filter(point => {
    const matchesCategory = selectedCategories.includes(point.category);
    const matchesRegion = regionSlug ? isPointInRegion(point) : true;
    return matchesCategory && matchesRegion;
  });

  if (loading) {
    return (
      <div className="map-view-container">
        <div className="map-loading">Loading map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-view-container">
        <div className="map-error">
          <p>{error}</p>
          <button onClick={fetchPoints} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-view-container">
      <div className="map-header">
        <h1>Explore NomadLand Points</h1>
        <p>Discover amazing locations shared by our community</p>
        {currentRegion && (
          <div className="region-badge">
            <span className="material-icons">location_on</span>
            Viewing: {currentRegion.name}
          </div>
        )}
      </div>

      {/* Category Filter Bar */}
      <CategoryFilter 
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
      />

      <div className="map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="leaflet-map"
        >
          <MapViewController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Show region polygon if in region view */}
          {currentRegion && currentRegion.polygon && (
            <Polygon
              positions={currentRegion.polygon.map(coord => [coord[1], coord[0]])}
              pathOptions={{
                color: '#6e00ff',
                fillColor: '#6e00ff',
                fillOpacity: 0.08,
                weight: 2,
                dashArray: '10, 10'
              }}
            />
          )}

          {filteredPoints.map((point) => {
            // Ensure valid coordinates
            const lat = parseFloat(point.lat);
            const lng = parseFloat(point.lng);

            if (isNaN(lat) || isNaN(lng)) {
              console.warn(`Invalid coordinates for point ${point._id}`);
              return null;
            }

            // Get category-specific icon
            const svg = getCategoryIconSvg(point.category);
            const icon = createIcon(svg);

            return (
              <Marker
                key={point._id}
                position={[lat, lng]}
                icon={icon}
              >
                <Popup>
                  <div className="marker-popup">
                    <h3>{point.title}</h3>
                    <p className="popup-category">
                      {CATEGORIES.find(c => c.key === point.category)?.label || point.category}
                    </p>
                    
                    {point.images && point.images.length > 0 && (
                      <img
                        src={point.images[0]}
                        alt={point.title}
                        className="popup-image"
                      />
                    )}
                    
                    <Link to={`/points/${point._id}`} className="popup-link">
                      View Details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="map-stats">
        <p>
          Showing {filteredPoints.length} of {points.length} {points.length === 1 ? 'point' : 'points'}
          {selectedCategories.length < CATEGORIES.length && 
            ` (${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'} selected)`
          }
        </p>
      </div>
    </div>
  );
};

export default MapView;
