import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants/categories';
import { getPriceLabel, getAccessibilityArrivalLabel, getAccessibilityDisabilityIcon } from '../utils/ratingHelpers';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import './PointSidePanel.css';
import './ReviewForm.css';

const PointSidePanel = ({ 
  point, 
  onClose, 
  onToggleFavorite, 
  isFavorite,
  onWriteReview,
  onViewDetails,
  onDelete = null,
  showOnlyUserReview = false,
  userReviewId = null,
  onDeleteReview = null,
  onEdit = null
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user can edit this point
  const canEditPoint = () => {
    if (!user || !point) return false;

    // Admin can edit any point
    if (user.role === 'admin') return true;

    // Map Ranger can edit points in their assigned regions
    if (user.role === 'mapRanger' && user.rangerRegions?.includes(point.regionSlug)) {
      return true;
    }

    // Regular user can only edit their own private points
    if (point.createdBy?._id === user.id || point.createdBy === user.id) {
      // For regular users, only allow editing private points
      if (user.role === 'user') {
        return point.isPrivate === true;
      }
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (point) {
      fetchReviews();
    }
  }, [point]);

  const fetchReviews = async () => {
    if (!point) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews/point/${point._id}`);
      const data = await response.json();
      console.log('📝 Reviews received:', data);
      console.log('📝 First review userId:', data[0]?.userId);
      
      // Filter to show only user's review if in personal map
      if (showOnlyUserReview && userReviewId) {
        const userReview = data.find(r => r._id === userReviewId);
        setReviews(userReview ? [userReview] : []);
      } else {
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    fetchReviews();
  };

  const handleReviewEdit = (review) => {
    setEditingReview(review);
    setShowReviewForm(false);
  };

  const handleCancelReviewEdit = () => {
    setEditingReview(null);
  };

  const handleReviewDeleted = () => {
    fetchReviews();
  };

  if (!point) return null;

  const category = CATEGORIES.find(c => c.key === point.category);
  const accessibilityIcon = getAccessibilityDisabilityIcon(point.averageAccessibilityDisability);
  const userHasReviewed = user && reviews.some(r => r.userId?._id === user.id);

  return (
    <div className="point-side-panel">
      <div className="side-panel-header">
        <button className="close-btn" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="side-panel-content">
        {/* Image Section */}
        {point.images && point.images[0] && (
          <div className="panel-image">
            <img src={point.images[0]} alt={point.title} />
          </div>
        )}

        {/* Title and Category */}
        <div className="panel-main-info">
          <div className="panel-title-section">
            <h2 className="panel-title">{point.title}</h2>
            {category && (
              <div className="panel-category">
                <span className="material-symbols-outlined">{category.materialIcon}</span>
                <span>{category.label}</span>
              </div>
            )}
            
            {/* Point Type Badge - shown in personal maps */}
            {showOnlyUserReview && (
              <div className="point-type-badge reviewed">
                <span className="material-symbols-outlined">rate_review</span>
                <span>You Reviewed This</span>
              </div>
            )}
            {!showOnlyUserReview && isFavorite && (
              <div className="point-type-badge favorite">
                <span className="material-symbols-outlined">favorite</span>
                <span>Favorite Point</span>
              </div>
            )}
            {!showOnlyUserReview && !isFavorite && point.isPrivate && (
              <div className="point-type-badge private">
                <span className="material-symbols-outlined">lock</span>
                <span>Private Point</span>
              </div>
            )}
            {!showOnlyUserReview && !isFavorite && !point.isPrivate && onDelete === null && (
              <div className="point-type-badge public">
                <span className="material-symbols-outlined">public</span>
                <span>Public Point</span>
              </div>
            )}
          </div>

          {/* Description */}
          {point.description && (
            <p className="panel-description">{point.description}</p>
          )}

          {/* Ratings Summary */}
          <div className="panel-ratings-grid">
            {/* Overall Rating */}
            {point.averageRating && (
              <div className="rating-item">
                <div className="rating-icon">
                  <span className="material-symbols-outlined">star</span>
                </div>
                <div className="rating-info">
                  <div className="rating-label">Rating</div>
                  <div className="rating-value">{point.averageRating.toFixed(1)}/5</div>
                </div>
              </div>
            )}

            {/* Price Level */}
            {point.averagePriceLevel && (
              <div className="rating-item">
                <div className="rating-icon">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div className="rating-info">
                  <div className="rating-label">Price</div>
                  <div className="rating-value">{getPriceLabel(point.averagePriceLevel)}</div>
                </div>
              </div>
            )}

            {/* Accessibility Arrival */}
            {point.averageAccessibilityArrival && (
              <div className="rating-item">
                <div className="rating-icon">
                  <span className="material-symbols-outlined">directions_car</span>
                </div>
                <div className="rating-info">
                  <div className="rating-label">Arrival</div>
                  <div className="rating-value">{getAccessibilityArrivalLabel(point.averageAccessibilityArrival)}</div>
                </div>
              </div>
            )}

            {/* Accessibility Disability */}
            <div className="rating-item">
              <div className={`rating-icon ${accessibilityIcon.accessible ? 'accessible' : 'not-accessible'}`}>
                <span className="material-symbols-outlined">{accessibilityIcon.icon}</span>
              </div>
              <div className="rating-info">
                <div className="rating-label">Accessible</div>
                <div className="rating-value">
                  {point.averageAccessibilityDisability 
                    ? (point.averageAccessibilityDisability >= 3 ? 'Yes' : 'No')
                    : 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="panel-actions">
            {/* Edit Point - only if user has permission */}
            {user && canEditPoint() && onEdit && (
              <button 
                className="action-btn primary"
                onClick={() => onEdit(point)}
              >
                <span className="material-symbols-outlined">edit</span>
                Edit Point
              </button>
            )}
            
            {/* Favorite/Remove Favorite - only if onToggleFavorite is provided */}
            {user && onToggleFavorite && (
              <button 
                className={`action-btn ${isFavorite ? 'favorited' : ''}`}
                onClick={() => onToggleFavorite(point._id)}
              >
                <span className="material-symbols-outlined">
                  {isFavorite ? 'heart_broken' : 'favorite_border'}
                </span>
                {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
              </button>
            )}
            
            {/* Delete Point - only for private points */}
            {user && onDelete && (
              <button 
                className="action-btn danger"
                onClick={onDelete}
              >
                <span className="material-symbols-outlined">delete</span>
                Delete Point
              </button>
            )}
            
            {/* Write Review - only if not in review-only mode and hasn't reviewed */}
            {user && !userHasReviewed && !showOnlyUserReview && (
              <button 
                className="action-btn primary"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                <span className="material-symbols-outlined">rate_review</span>
                Write Review
              </button>
            )}
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && user && !editingReview && (
          <div className="panel-review-form">
            <h3>Write a Review</h3>
            <ReviewForm
              pointId={point._id}
              onReviewAdded={handleReviewAdded}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        )}

        {/* Edit Review Form */}
        {editingReview && user && (
          <div className="panel-review-form">
            <h3>Edit Your Review</h3>
            <ReviewForm
              pointId={point._id}
              onReviewAdded={handleReviewAdded}
              onCancel={handleCancelReviewEdit}
              editMode={true}
              reviewData={editingReview}
            />
          </div>
        )}

        {/* Reviews Section */}
        <div className="panel-reviews-section">
          <h3 className="reviews-title">
            Reviews ({reviews.length})
          </h3>
          <div className="reviews-scroll-container">
            {loading ? (
              <div className="loading-reviews">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="no-reviews">
                <span className="material-symbols-outlined">rate_review</span>
                <p>No reviews yet. Be the first to write one!</p>
              </div>
            ) : (
              <ReviewList
                reviews={reviews}
                currentUserId={user?.id}
                isAdmin={user?.role === 'admin'}
                onReviewDeleted={handleReviewDeleted}
                onReviewEdit={handleReviewEdit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointSidePanel;
