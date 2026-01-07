import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { getUserPointsInRegion } from '../api/personalMaps';
import { deletePoint, updatePoint, removeFromFavorites } from '../api/points';
import { useAuth } from '../context/AuthContext';
import { getCategoryIcon, createPersonalPointIcon, createPointIcon } from '../utils/mapIcons';
import { MapViewController } from '../components/map/MapHelpers';
import { toast } from 'react-toastify';
import '../utils/leafletConfig';
import PointSidePanel from '../components/PointSidePanel';
import AddPointModal from '../components/AddPointModal';
import RegionHero from '../components/RegionHero';
import axiosInstance from '../api/axiosInstance';
import { useConfirm } from '../hooks/useConfirm';
import { useAlert } from '../hooks/useAlert';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';
import './PersonalRegionMap.css';

const PersonalRegionMap = () => {
  const { regionSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [region, setRegion] = useState(null);
  const [createdPoints, setCreatedPoints] = useState([]);
  const [favoritePoints, setFavoritePoints] = useState([]);
  const [reviewedPoints, setReviewedPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPoint, setEditingPoint] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  
  const confirmDialog = useConfirm();
  const alertDialog = useAlert();

  useEffect(() => {
    if (user && regionSlug) {
      fetchRegionData();
    }
  }, [user, regionSlug]);

  const fetchRegionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserPointsInRegion(regionSlug);
      setRegion(response.region);
      setCreatedPoints(response.createdPoints || []);
      setFavoritePoints(response.favoritePoints || []);
      setReviewedPoints(response.reviewedPoints || []);
    } catch (err) {
      console.error('Error fetching region data:', err);
      setError(err.response?.data?.message || 'Failed to load region data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoint = async (pointId) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Point',
      message: 'Are you sure you want to delete this point?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await deletePoint(pointId);
      toast.success('Point deleted successfully');
      fetchRegionData();
    } catch (err) {
      console.error('Error deleting point:', err);
      toast.error(err.response?.data?.message || 'Failed to delete point');
    }
  };

  const handleEditPoint = async (pointId, updates) => {
    try {
      await updatePoint(pointId, updates);
      await alertDialog.alert({
        type: 'success',
        title: 'Success',
        message: 'Point updated successfully'
      });
      setEditingPoint(null);
      setShowEditModal(false);
      fetchRegionData();
    } catch (err) {
      console.error('Error updating point:', err);
      await alertDialog.alert({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Failed to update point'
      });
    }
  };

  const openEditModal = (point) => {
    setEditingPoint(point);
    setShowEditModal(true);
    setSelectedPoint(null);
  };

  const closeEditModal = () => {
    setEditingPoint(null);
    setShowEditModal(false);
  };

  const handlePointUpdated = () => {
    setEditingPoint(null);
    setShowEditModal(false);
    fetchRegionData();
  };

  const handleRemoveFromFavorites = async (pointId) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Remove Favorite',
      message: 'Remove this point from your favorites?',
      confirmText: 'Remove',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await removeFromFavorites(pointId);
      toast.success('Removed from favorites');
      fetchRegionData();
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast.error(err.response?.data?.message || 'Failed to remove favorite');
    }
  };

  const handleEditReview = async (reviewId, updates) => {
    try {
      await axiosInstance.put(`/reviews/${reviewId}`, updates);
      await alertDialog.alert({
        type: 'success',
        title: 'Success',
        message: 'Review updated successfully'
      });
      setEditingReview(null);
      fetchRegionData();
    } catch (err) {
      console.error('Error updating review:', err);
      await alertDialog.alert({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Failed to update review'
      });
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
      await axiosInstance.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted successfully');
      fetchRegionData();
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const getReviewCount = (point) => {
    return point.reviewCount || 0;
  };

  if (!user) {
    return (
      <div className="personal-region-map-container">
        <div className="no-auth">
          <p>Please log in to view your personal map</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="personal-region-map-container">
        <div className="loading">Loading your map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="personal-region-map-container">
        <div className="error">{error}</div>
        <button onClick={fetchRegionData} className="btn-retry">
          Try Again
        </button>
      </div>
    );
  }

  if (!region) {
    return (
      <div className="personal-region-map-container">
        <div className="error">Region not found</div>
      </div>
    );
  }

  return (
    <div className="personal-region-map-container">
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
      
      {/* Hero Section */}
      <RegionHero 
        name={region.name}
        subtitle="Personal Map"
        imageUrl={region.heroImageUrl}
        onBackClick={() => navigate(-1)}
        buttonText="My Maps"
      />

      {/* Map Section */}
      <div className="region-map-section">
        {/* Legend - single line above map */}
        <div className="map-header-with-legend">
          <div className="legend-container-inline">
            <div className="legend">
              <div className="legend-item">
                <div className="legend-icon public-icon">
                  <span className="material-symbols-outlined">public</span>
                </div>
                <span>Public</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon private-icon">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <span>Private</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon favorite-icon">
                  <span className="material-symbols-outlined">favorite</span>
                </div>
                <span>Favorites</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon reviewed-icon">
                  <span className="material-symbols-outlined">rate_review</span>
                </div>
                <span>Reviewed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="region-map-container">
          <MapContainer
            center={[region.center.lat, region.center.lng]}
            zoom={region.zoom}
            className="region-leaflet-map"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
          <MapViewController center={region.center} zoom={region.zoom} />

          {/* Region polygon */}
          {region.polygon && (
            <Polygon
              positions={region.polygon.map(coord => [coord[1], coord[0]])}
              pathOptions={{
                color: '#667eea',
                fillColor: '#667eea',
                fillOpacity: 0.05,
                weight: 2
              }}
            />
          )}

          {/* Render created points */}
          {createdPoints.map((point) => {
            const pointType = point.isPrivate ? 'private' : 'public';
            const isSelected = selectedPoint?._id === point._id;
            return (
              <Marker
                key={`created-${point._id}`}
                position={[point.lat, point.lng]}
                icon={createPointIcon(point.category, pointType, isSelected)}
                eventHandlers={{
                  click: () => setSelectedPoint(point)
                }}
              />
            );
          })}

          {/* Render favorite points */}
          {favoritePoints.map((point) => {
            const isSelected = selectedPoint?._id === point._id;
            return (
              <Marker
                key={`favorite-${point._id}`}
                position={[point.lat, point.lng]}
                icon={createPersonalPointIcon(point.category, 'favorite', isSelected)}
                eventHandlers={{
                  click: () => setSelectedPoint(point)
                }}
              />
            );
          })}

          {/* Render reviewed points */}
          {reviewedPoints.map((point) => {
            const isSelected = selectedPoint?._id === point._id;
            return (
              <Marker
                key={`reviewed-${point._id}`}
                position={[point.lat, point.lng]}
                icon={createPersonalPointIcon(point.category, 'reviewed', isSelected)}
                eventHandlers={{
                  click: () => setSelectedPoint(point)
                }}
              />
            );
          })}
        </MapContainer>

        {/* Point Side Panel */}
        {selectedPoint && (
          <PointSidePanel
            point={selectedPoint}
            onClose={() => setSelectedPoint(null)}
            onToggleFavorite={
              favoritePoints.some(p => p._id === selectedPoint._id)
                ? () => handleRemoveFromFavorites(selectedPoint._id)
                : null
            }
            isFavorite={favoritePoints.some(p => p._id === selectedPoint._id)}
            onDelete={
              createdPoints.some(p => p._id === selectedPoint._id && p.isPrivate)
                ? () => handleDeletePoint(selectedPoint._id)
                : null
            }
            showOnlyUserReview={reviewedPoints.some(p => p._id === selectedPoint._id)}
            userReviewId={reviewedPoints.find(p => p._id === selectedPoint._id)?.userReview?._id}
            onDeleteReview={
              reviewedPoints.some(p => p._id === selectedPoint._id)
                ? () => handleDeleteReview(reviewedPoints.find(p => p._id === selectedPoint._id)?.userReview?._id)
                : null
            }
            onEdit={openEditModal}
          />
        )}
        </div>
      </div>

      {/* Edit Point Modal */}
      {editingPoint && (
        <div className="modal-overlay" onClick={() => setEditingPoint(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Point</h2>
              <button className="modal-close-btn" onClick={() => setEditingPoint(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleEditPoint(editingPoint._id, {
                  title: formData.get('title'),
                  description: formData.get('description'),
                  category: formData.get('category'),
                });
              }}
              className="modal-form"
            >
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  defaultValue={editingPoint.title}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  defaultValue={editingPoint.category}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={editingPoint.description}
                  rows={4}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingPoint(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="modal-overlay" onClick={() => setEditingReview(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Review</h2>
              <button className="modal-close-btn" onClick={() => setEditingReview(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleEditReview(editingReview._id, {
                  rating: parseInt(formData.get('rating')),
                  comment: formData.get('comment'),
                });
              }}
              className="modal-form"
            >
              <div className="form-group">
                <label htmlFor="rating">Rating</label>
                <select
                  id="rating"
                  name="rating"
                  defaultValue={editingReview.rating}
                  required
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {'⭐'.repeat(num)} ({num})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comment">Comment</label>
                <textarea
                  id="comment"
                  name="comment"
                  defaultValue={editingReview.comment}
                  rows={6}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingReview(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Point Modal using AddPointModal */}
      {showEditModal && editingPoint && (
        <AddPointModal
          location={{ lat: editingPoint.lat, lng: editingPoint.lng }}
          regionSlug={regionSlug}
          onClose={closeEditModal}
          onSuccess={handlePointUpdated}
          editMode={true}
          pointData={editingPoint}
        />
      )}
    </div>
  );
};

export default PersonalRegionMap;
