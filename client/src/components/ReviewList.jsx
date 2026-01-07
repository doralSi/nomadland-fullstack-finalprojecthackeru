import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useConfirm } from '../hooks/useConfirm';
import { useAlert } from '../hooks/useAlert';
import ConfirmDialog from './ConfirmDialog';
import AlertDialog from './AlertDialog';
import './ReviewList.css';

const ReviewList = ({ reviews, currentUserId, isAdmin, onReviewDeleted, onReviewEdit }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  
  const confirmDialog = useConfirm();
  const alertDialog = useAlert();

  const handleDelete = async (reviewId) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      setDeletingId(reviewId);
      setError('');
      await axiosInstance.delete(`/reviews/${reviewId}`);
      onReviewDeleted(reviewId);
      await alertDialog.alert({
        type: 'success',
        title: 'Success',
        message: 'Review deleted successfully'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review');
      await alertDialog.alert({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Failed to delete review'
      });
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <span className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star-filled' : 'star-empty'}>
            ★
          </span>
        ))}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  if (reviews.length === 0) {
    return (
      <div className="no-reviews">
        <p>No reviews yet. Be the first to review this point!</p>
      </div>
    );
  }

  return (
    <div className="review-list">
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
      
      {error && <div className="error-message">{error}</div>}
      
      {reviews.map((review) => {
        const isOwner = currentUserId && review.userId?._id === currentUserId;
        const canDelete = isOwner || isAdmin;
        const canEdit = isOwner; // Only owner can edit

        return (
          <div key={review._id} className="review-card-compact">
            <div className="review-header-compact">
              <div className="reviewer-info-compact">
                <div className="reviewer-avatar-compact">
                  {review.userId?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="reviewer-details-compact">
                  <h4 className="reviewer-name-compact">
                    {review.userId?.name || 'Anonymous'}
                  </h4>
                  <span className="review-date-compact">{formatDate(review.createdAt)}</span>
                </div>
              </div>
              
              <div className="review-actions-compact">
                {canEdit && onReviewEdit && (
                  <button
                    onClick={() => onReviewEdit(review)}
                    className="edit-btn-compact"
                    aria-label="Edit review"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                )}
                
                {canDelete && (
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="delete-btn-compact"
                    disabled={deletingId === review._id}
                    aria-label="Delete review"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
              </div>
            </div>

            <div className="review-ratings-inline">
              <div className="rating-inline-item">
                <span className="material-symbols-outlined">star</span>
                <span className="rating-value-inline">{review.ratingOverall}</span>
              </div>
              <div className="rating-inline-item">
                <span className="material-symbols-outlined">payments</span>
                <span className="rating-value-inline">{review.ratingPrice}</span>
              </div>
              <div className="rating-inline-item">
                <span className="material-symbols-outlined">directions_car</span>
                <span className="rating-value-inline">{review.ratingAccessibilityArrival}</span>
              </div>
              <div className="rating-inline-item">
                <span className="material-symbols-outlined">accessible</span>
                <span className="rating-value-inline">{review.ratingAccessibilityDisability}</span>
              </div>
            </div>

            {review.text && (
              <p className="review-text-compact">{review.text}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
