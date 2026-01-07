import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import './ReviewForm.css';

const ReviewForm = ({ pointId, onReviewAdded, onCancel, requiredLanguage = 'he', editMode = false, reviewData = null }) => {
  const [formData, setFormData] = useState({
    text: '',
    ratingOverall: 5,
    ratingPrice: 3,
    ratingAccessibilityArrival: 3,
    ratingAccessibilityDisability: 3,
    language: requiredLanguage
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize form data when in edit mode
  useEffect(() => {
    if (editMode && reviewData) {
      setFormData({
        text: reviewData.text || '',
        ratingOverall: reviewData.ratingOverall || 5,
        ratingPrice: reviewData.ratingPrice || 3,
        ratingAccessibilityArrival: reviewData.ratingAccessibilityArrival || 3,
        ratingAccessibilityDisability: reviewData.ratingAccessibilityDisability || 3,
        language: reviewData.language || requiredLanguage
      });
    }
  }, [editMode, reviewData, requiredLanguage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'text' ? value : Number(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.text.length < 5) {
      setError('Review text must be at least 5 characters long');
      return;
    }

    try {
      setLoading(true);
      
      if (editMode && reviewData) {
        // Update existing review
        const response = await axiosInstance.put(`/reviews/${reviewData._id}`, formData);
        toast.success('Review updated successfully!');
        onReviewAdded(response.data);
      } else {
        // Create new review
        const response = await axiosInstance.post(`/reviews/point/${pointId}`, formData);
        toast.success('Review submitted successfully!');
        onReviewAdded(response.data);
        setFormData({
          text: '',
          ratingOverall: 5,
          ratingPrice: 3,
          ratingAccessibilityArrival: 3,
          ratingAccessibilityDisability: 3,
          language: requiredLanguage
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Failed to ${editMode ? 'update' : 'submit'} review`;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (name, value, label) => (
    <div className="rating-field">
      <label htmlFor={name}>{label}</label>
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${value >= star ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, [name]: star }))}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
        <span className="rating-value">{value}/5</span>
      </div>
    </div>
  );

  return (
    <div className="review-form-container">
      <h3>{editMode ? 'Edit Your Review' : 'Write Your Review'}</h3>
      <form onSubmit={handleSubmit} className="review-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="text">Your Review *</label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            placeholder="Share your experience at this point..."
            rows="4"
            required
            minLength="5"
          />
          <small className="char-count">{formData.text.length} characters</small>
        </div>

        <div className="ratings-section">
          <h4>Rate Your Experience</h4>
          
          {renderStarRating('ratingOverall', formData.ratingOverall, <><span className="material-symbols-outlined rating-label-icon">star</span> Overall Rating *</>)}
          {renderStarRating('ratingPrice', formData.ratingPrice, <><span className="material-symbols-outlined rating-label-icon">payments</span> Price Level *</>)}
          {renderStarRating('ratingAccessibilityArrival', formData.ratingAccessibilityArrival, <><span className="material-symbols-outlined rating-label-icon">directions_car</span> Accessibility (Arrival) *</>)}
          {renderStarRating('ratingAccessibilityDisability', formData.ratingAccessibilityDisability, <><span className="material-symbols-outlined rating-label-icon">accessible</span> Accessibility (Disability) *</>)}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (editMode ? 'Updating...' : 'Submitting...') : (editMode ? 'Update Review' : 'Submit Review')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
