import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPoints, addToFavorites, removeFromFavorites } from '../api/points';
import { polygonToLeafletFormat, isPointInsideRegion } from '../utils/isInsidePolygon';
import { CATEGORIES } from '../constants/categories';
import { useAuth } from '../context/AuthContext';
import AddPointModal from './AddPointModal';
import PointSidePanel from './PointSidePanel';
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
const createPointIcon = (categoryKey, isSelected = false) => {
  const iconName = getCategoryIcon(categoryKey);
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="map-marker category-${categoryKey} ${isSelected ? 'selected-marker' : ''}">
        <span class="material-symbols-outlined">${iconName}</span>
      </div>
    `,
    iconSize: isSelected ? [48, 48] : [32, 32],
    iconAnchor: isSelected ? [24, 48] : [16, 32],
    popupAnchor: [0, -32]
  });
};

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

// Component to capture map instance
const MapInstanceCapture = ({ onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
  return null;
};

const RegionMap = ({ region, selectedCategories = [], eventToShow = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [showAddPointModal, setShowAddPointModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [searchMarker, setSearchMarker] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReviewFormModal, setShowReviewFormModal] = useState(false);
  const [pointReviews, setPointReviews] = useState([]);
  const [favoritePoints, setFavoritePoints] = useState([]);
  const eventMarkerRef = useRef(null);

  useEffect(() => {
    loadPoints();
    if (user) {
      loadFavorites();
    }
  }, [region, user]);

  const loadFavorites = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setFavoritePoints(data.user.favoritePoints || []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  // Effect to zoom to event location when eventToShow changes
  useEffect(() => {
    if (eventToShow && eventToShow.location && mapInstance) {
      console.log('🎯 Showing event on map:', eventToShow);
      console.log('📍 Event location:', eventToShow.location);
      
      mapInstance.flyTo([eventToShow.location.lat, eventToShow.location.lng], 15, {
        duration: 1.5
      });
      
      // Open the event marker popup after zoom animation
      setTimeout(() => {
        if (eventMarkerRef.current) {
          console.log('🎈 Opening event popup');
          eventMarkerRef.current.openPopup();
        } else {
          console.log('❌ Event marker ref not available');
        }
      }, 1600); // Slightly after the flyTo animation (1.5s)
    } else {
      if (eventToShow) {
        console.log('⚠️ Event to show:', eventToShow);
        console.log('⚠️ Has location?', !!eventToShow.location);
        console.log('⚠️ Map instance?', !!mapInstance);
      }
    }
  }, [eventToShow, mapInstance]);

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

  // Filter points based on selected categories
  const filteredPoints = selectedCategories.length === 0 
    ? points 
    : points.filter(point => selectedCategories.includes(point.category));

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

  const getReviewCount = (point) => {
    return point.reviewCount || 0;
  };

  const handleViewReviews = async (point) => {
    setSelectedPoint(point);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews/${point._id}`);
      const data = await response.json();
      setPointReviews(data);
      setShowReviewModal(true);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setPointReviews([]);
      setShowReviewModal(true);
    }
  };

  const handleWriteReview = (point) => {
    setSelectedPoint(point);
    setShowReviewFormModal(true);
  };

  const handleReviewSubmitted = () => {
    setShowReviewFormModal(false);
    loadPoints(); // Refresh to get updated averages
    if (selectedPoint) {
      // Refresh reviews if modal is open
      handleViewReviews(selectedPoint);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Refresh reviews
        if (selectedPoint) {
          handleViewReviews(selectedPoint);
        }
        loadPoints(); // Refresh to get updated averages
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert('Failed to delete review');
    }
  };

  const handleToggleFavorite = async (pointId) => {
    if (!user) {
      alert('Please log in to add favorites');
      navigate('/login');
      return;
    }

    try {
      const isFavorite = favoritePoints.includes(pointId);
      if (isFavorite) {
        await removeFromFavorites(pointId);
        setFavoritePoints(prev => prev.filter(id => id !== pointId));
      } else {
        await addToFavorites(pointId);
        setFavoritePoints(prev => [...prev, pointId]);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      alert(err.response?.data?.message || 'Failed to update favorite');
    }
  };

  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = [];

    // 1. Search in our filtered points
    const matchingPoints = filteredPoints.filter(point =>
      point.title.toLowerCase().includes(query.toLowerCase()) ||
      point.description?.toLowerCase().includes(query.toLowerCase())
    );

    matchingPoints.forEach(point => {
      results.push({
        type: 'point',
        id: point._id,
        name: point.title,
        description: point.description,
        lat: point.lat,
        lng: point.lng,
        category: point.category
      });
    });

    // 2. Search in geographic locations using Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query + ', ' + region.name)}&limit=5`
      );
      const geoResults = await response.json();

      geoResults.forEach(result => {
        results.push({
          type: 'location',
          name: result.display_name,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        });
      });
    } catch (err) {
      console.error('Geocoding error:', err);
    }

    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSelectSearchResult = (result) => {
    if (!mapInstance) return;

    // Zoom to location
    mapInstance.setView([result.lat, result.lng], 16, { animate: true });

    // Remove existing search marker if any
    if (searchMarker && mapInstance.hasLayer(searchMarker)) {
      mapInstance.removeLayer(searchMarker);
    }

    // Add marker for location type results
    if (result.type === 'location') {
      const marker = L.marker([result.lat, result.lng], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="map-marker search-marker">
              <span class="material-symbols-outlined">search</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
      }).addTo(mapInstance);

      marker.bindPopup(`
        <div style="text-align: center;">
          <strong>${result.name}</strong><br/>
          <button onclick="window.dispatchEvent(new CustomEvent('addPointAtLocation', { detail: { lat: ${result.lat}, lng: ${result.lng} } }))" 
                  style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Add Point Here
          </button>
        </div>
      `).openPopup();

      setSearchMarker(marker);
    }

    setShowSearchResults(false);
    setSearchQuery('');
  };

  // Listen for add point at location event
  useEffect(() => {
    const handleAddPointAtLocation = (e) => {
      const { lat, lng } = e.detail;
      if (isPointInsideRegion(lat, lng, region)) {
        setSelectedLocation({ lat, lng });
        setShowAddPointModal(true);
        if (searchMarker && mapInstance.hasLayer(searchMarker)) {
          mapInstance.removeLayer(searchMarker);
        }
      } else {
        alert('This location is outside the region boundary.');
      }
    };

    window.addEventListener('addPointAtLocation', handleAddPointAtLocation);
    return () => window.removeEventListener('addPointAtLocation', handleAddPointAtLocation);
  }, [region, searchMarker, mapInstance]);

  if (!region) {
    return <div className="region-map-error">No region data</div>;
  }

  const polygonPositions = polygonToLeafletFormat(region.polygon);

  return (
    <div className="region-map-section">
      <div className="region-map-header">
        <h2>Explore {region.name}</h2>
        
        {/* Search Bar */}
        <div className="map-search-container">
          <div className="map-search-input-wrapper">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              className="map-search-input"
              placeholder="Search points or places..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((result, index) => (
                <div
                  key={`${result.type}-${result.id || index}`}
                  className="search-result-item"
                  onClick={() => handleSelectSearchResult(result)}
                >
                  <span className="material-symbols-outlined result-icon">
                    {result.type === 'point' ? getCategoryIcon(result.category) : 'location_on'}
                  </span>
                  <div className="result-info">
                    <div className="result-name">{result.name}</div>
                    {result.description && (
                      <div className="result-description">{result.description}</div>
                    )}
                    <div className="result-type">
                      {result.type === 'point' ? '📍 User Point' : '🗺️ Map Location'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="region-map-container">
        <MapContainer
          center={[region.center.lat, region.center.lng]}
          zoom={region.zoom || 12}
          minZoom={10}
          maxZoom={18}
          className="region-leaflet-map"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MapBounds region={region} />
          <MapClickHandler isAddingPoint={isAddingPoint} onMapClick={handleMapClick} />
          <MapInstanceCapture onMapReady={setMapInstance} />

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

          {/* Points markers - filtered by selected categories */}
          {filteredPoints.map((point) => (
            <Marker
              key={point._id}
              position={[point.lat, point.lng]}
              icon={createPointIcon(point.category, selectedPoint?._id === point._id)}
              eventHandlers={{
                click: () => {
                  // Only logged-in users can view point details
                  if (!user) {
                    return;
                  }
                  setSelectedPoint(point);
                  // Center map on selected point
                  if (mapInstance) {
                    mapInstance.panTo([point.lat, point.lng], {
                      animate: true,
                      duration: 0.5
                    });
                  }
                }
              }}
            />
          ))}


          {/* Event marker - temporary highlight when viewing event */}
          {eventToShow && eventToShow.location && (
            <Marker
              ref={eventMarkerRef}
              position={[eventToShow.location.lat, eventToShow.location.lng]}
              icon={L.divIcon({
                className: 'custom-event-marker',
                html: `
                  <div class="event-marker-highlight">
                    <span class="material-symbols-outlined">location_on</span>
                  </div>
                `,
                iconSize: [48, 48],
                iconAnchor: [24, 48],
                popupAnchor: [0, -48]
              })}
            >
              <Popup autoClose={false} closeOnClick={false}>
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>{eventToShow.title}</h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {new Date(eventToShow.startDate || eventToShow.date).toLocaleDateString()}
                  </p>
                  {eventToShow.cost && (
                    <p style={{ margin: '4px 0 0 0', color: '#667eea', fontWeight: '600', fontSize: '14px' }}>
                      {eventToShow.cost}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Side Panel for selected point */}
        {selectedPoint && (
          <PointSidePanel
            point={selectedPoint}
            onClose={() => setSelectedPoint(null)}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favoritePoints.includes(selectedPoint._id)}
          />
        )}

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

      {/* Review Form Modal */}
      {showReviewFormModal && selectedPoint && (
        <div className="modal-overlay" onClick={() => setShowReviewFormModal(false)}>
          <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Write a Review for {selectedPoint.title}</h2>
              <button className="modal-close-btn" onClick={() => setShowReviewFormModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <ReviewFormInline 
              pointId={selectedPoint._id} 
              onSuccess={handleReviewSubmitted}
              onCancel={() => setShowReviewFormModal(false)}
            />
          </div>
        </div>
      )}

      {/* View Reviews Modal */}
      {showReviewModal && selectedPoint && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content reviews-modal-redesigned" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="reviews-modal-header">
              <h2 className="reviews-modal-title">Reviews for {selectedPoint.title}</h2>
              <button className="reviews-modal-close" onClick={() => setShowReviewModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="reviews-modal-body">
              {pointReviews.length === 0 ? (
                <div className="empty-state">
                  <span className="material-symbols-outlined">rate_review</span>
                  <p>No reviews yet. Be the first to write one!</p>
                </div>
              ) : (
                <div className="reviews-list">
                  {pointReviews.map((review) => {
                    const isOwner = user && review.userId?._id === user.id;
                    const isAdmin = user && user.role === 'admin';
                    const canDelete = isOwner || isAdmin;
                    
                    return (
                    <div key={review._id} className="review-card">
                      {/* Review Header - Avatar + Name + Date */}
                      <div className="review-header">
                        <div className="review-avatar">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="review-author-details">
                          <div className="review-author-name">
                            {review.userId?.name || 'Anonymous'}
                          </div>
                          <div className="review-date">
                            {new Date(review.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                        {canDelete && (
                          <button
                            className="review-delete-btn"
                            onClick={() => handleDeleteReview(review._id)}
                            title="Delete review"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        )}
                      </div>
                      
                      {/* Stats Row */}
                      <div className="stats-row">
                        <div className="stat-pill">
                          <span className="material-symbols-outlined">star</span>
                          <span>{review.ratingOverall}</span>
                        </div>
                        <div className="stat-pill">
                          <span className="material-symbols-outlined">payments</span>
                          <span>{review.ratingPrice}</span>
                        </div>
                        <div className="stat-pill">
                          <span className="material-symbols-outlined">
                            {review.ratingAccessibilityArrival >= 4 ? 'directions_car' : 
                             review.ratingAccessibilityArrival >= 2 ? 'directions_walk' : 'hiking'}
                          </span>
                          <span>{review.ratingAccessibilityArrival}</span>
                        </div>
                        <div className="stat-pill">
                          <span className="material-symbols-outlined">accessible</span>
                          <span>{review.ratingAccessibilityDisability}</span>
                        </div>
                      </div>
                      
                      {/* Review Text */}
                      {review.text && (
                        <div className="review-text">{review.text}</div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline Review Form Component
const ReviewFormInline = ({ pointId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    text: '',
    ratingOverall: 5,
    ratingPrice: 5,
    ratingAccessibilityArrival: 5,
    ratingAccessibilityDisability: 5
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews/${pointId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit review');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form-professional">
      {error && <div className="error-message">{error}</div>}
      
      {/* Review Text Section */}
      <div className="form-section">
        <label className="section-label">Your Review</label>
        <textarea
          className="review-textarea-pro"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          required
          minLength={5}
          rows={4}
          placeholder="Share your experience..."
        />
      </div>

      {/* Overall Rating Section */}
      <div className="form-section">
        <label className="section-label">Overall Rating</label>
        <div className="star-rating-professional">
          {[1, 2, 3, 4, 5].map(n => (
            <span
              key={n}
              className={`star-pro ${formData.ratingOverall >= n ? 'filled' : ''}`}
              onClick={() => setFormData({ ...formData, ratingOverall: n })}
            >
              <span className="material-symbols-outlined">
                {formData.ratingOverall >= n ? 'star' : 'star_outline'}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Price Level Section */}
      <div className="form-section">
        <label className="section-label">Price Level</label>
        <div className="price-rating-professional">
          {[1, 2, 3, 4, 5].map(n => (
            <span
              key={n}
              className={`dollar-pro ${formData.ratingPrice >= n ? 'filled' : ''}`}
              onClick={() => setFormData({ ...formData, ratingPrice: n })}
            >
              <span className="material-symbols-outlined">attach_money</span>
            </span>
          ))}
        </div>
      </div>

      {/* Difficulty Section */}
      <div className="form-section">
        <label className="section-label">Difficulty to Reach</label>
        <div className="segmented-control">
          <button
            type="button"
            className={`segment ${formData.ratingAccessibilityArrival === 5 ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, ratingAccessibilityArrival: 5 })}
          >
            <span className="material-symbols-outlined">directions_car</span>
            <span className="segment-label">Easy</span>
          </button>
          <button
            type="button"
            className={`segment ${formData.ratingAccessibilityArrival === 3 ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, ratingAccessibilityArrival: 3 })}
          >
            <span className="material-symbols-outlined">directions_walk</span>
            <span className="segment-label">Moderate</span>
          </button>
          <button
            type="button"
            className={`segment ${formData.ratingAccessibilityArrival === 1 ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, ratingAccessibilityArrival: 1 })}
          >
            <span className="material-symbols-outlined">hiking</span>
            <span className="segment-label">Hard</span>
          </button>
        </div>
      </div>

      {/* Accessibility Section */}
      <div className="form-section">
        <label className="section-label">Accessibility</label>
        <div className="toggle-pair">
          <button
            type="button"
            className={`toggle-option ${formData.ratingAccessibilityDisability === 5 ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, ratingAccessibilityDisability: 5 })}
          >
            Accessible
          </button>
          <button
            type="button"
            className={`toggle-option ${formData.ratingAccessibilityDisability === 1 ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, ratingAccessibilityDisability: 1 })}
          >
            Not Accessible
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="form-actions-professional">
        <button type="button" onClick={onCancel} className="btn-cancel-pro">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-submit-pro">
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

export default RegionMap;
