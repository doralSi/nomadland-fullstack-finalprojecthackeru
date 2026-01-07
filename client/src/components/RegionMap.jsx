import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPoints, addToFavorites, removeFromFavorites } from '../api/points';
import { polygonToLeafletFormat, isPointInsideRegion } from '../utils/isInsidePolygon';
import { useAuth } from '../context/AuthContext';
import { getCategoryIcon, getCategoryLabel, createPointIcon } from '../utils/mapIcons';
import { MapBounds, MapClickHandler, MapInstanceCapture } from './map/MapHelpers';
import PlaceSearchBar from './map/PlaceSearchBar';
import { useFavorites } from '../hooks/useFavorites';
import { useConfirm } from '../hooks/useConfirm';
import { useAlert } from '../hooks/useAlert';
import { toast } from 'react-toastify';
import ConfirmDialog from './ConfirmDialog';
import AlertDialog from './AlertDialog';
import '../utils/leafletConfig';
import AddPointModal from './AddPointModal';
import PointSidePanel from './PointSidePanel';
import './RegionMap.css';

const RegionMap = ({ region, selectedCategories = [], eventToShow = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [showAddPointModal, setShowAddPointModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editingPoint, setEditingPoint] = useState(null);
  const [error, setError] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReviewFormModal, setShowReviewFormModal] = useState(false);
  const [pointReviews, setPointReviews] = useState([]);
  const [searchMarker, setSearchMarker] = useState(null);
  const eventMarkerRef = useRef(null);
  
  const confirmDialog = useConfirm();
  const alertDialog = useAlert();

  // Use custom hook for favorites
  const { favoritePoints, setFavoritePoints, loadFavorites, isFavorite } = useFavorites(user);

  useEffect(() => {
    loadPoints();
    if (user) {
      loadFavorites();
    }
  }, [region, user, loadFavorites]);

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
    setEditingPoint(null);
  };

  const handleEditPoint = (point) => {
    setEditingPoint(point);
    setSelectedLocation({ lat: point.lat, lng: point.lng });
    setShowAddPointModal(true);
    setSelectedPoint(null);
  };

  const handlePointCreated = () => {
    setShowAddPointModal(false);
    setSelectedLocation(null);
    setIsAddingPoint(false);
    setEditingPoint(null);
    loadPoints(); // Refresh points
  };

  const getReviewCount = (point) => {
    return point.reviewCount || 0;
  };

  const handleViewReviews = async (point) => {
    setSelectedPoint(point);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews/point/${point._id}`);
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
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

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
        await alertDialog.alert({
          type: 'success',
          title: 'Success',
          message: 'Review deleted successfully'
        });
      } else {
        const data = await response.json();
        await alertDialog.alert({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to delete review'
        });
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      await alertDialog.alert({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete review'
      });
    }
  };

  const handleToggleFavorite = async (pointId) => {
    if (!user) {
      toast.info('Please log in to add favorites');
      navigate('/login');
      return;
    }

    try {
      const isFavorite = favoritePoints.includes(pointId);
      if (isFavorite) {
        await removeFromFavorites(pointId);
        setFavoritePoints(prev => prev.filter(id => id !== pointId));
        toast.success('Removed from favorites');
      } else {
        await addToFavorites(pointId);
        setFavoritePoints(prev => [...prev, pointId]);
        toast.success('Added to favorites');
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      toast.error(err.response?.data?.message || 'Failed to update favorite');
    }
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
      
      <div className="region-map-header">
        <h2>Explore {region.name}</h2>
        
        {/* Search Bar */}
        <PlaceSearchBar
          mapInstance={mapInstance}
          points={filteredPoints}
          region={region}
          searchMarker={searchMarker}
          setSearchMarker={setSearchMarker}
        />
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
            onEdit={handleEditPoint}
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
          regionSlug={region.slug}
          onClose={handleCloseModal}
          onSuccess={handlePointCreated}
          editMode={!!editingPoint}
          pointData={editingPoint}
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews/point/${pointId}`, {
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
