import Review from '../models/Review.js';
import Point from '../models/Point.js';

// Helper function to compute point averages
const computePointAverages = async (pointId) => {
  const reviews = await Review.find({ pointId });

  if (reviews.length === 0) {
    return {
      averageRating: null,
      averagePriceLevel: null,
      averageAccessibilityArrival: null,
      averageAccessibilityDisability: null
    };
  }

  const totals = reviews.reduce((acc, review) => {
    acc.ratingOverall += review.ratingOverall;
    acc.ratingPrice += review.ratingPrice;
    acc.ratingAccessibilityArrival += review.ratingAccessibilityArrival;
    acc.ratingAccessibilityDisability += review.ratingAccessibilityDisability;
    return acc;
  }, {
    ratingOverall: 0,
    ratingPrice: 0,
    ratingAccessibilityArrival: 0,
    ratingAccessibilityDisability: 0
  });

  const count = reviews.length;

  return {
    averageRating: parseFloat((totals.ratingOverall / count).toFixed(1)),
    averagePriceLevel: parseFloat((totals.ratingPrice / count).toFixed(1)),
    averageAccessibilityArrival: parseFloat((totals.ratingAccessibilityArrival / count).toFixed(1)),
    averageAccessibilityDisability: parseFloat((totals.ratingAccessibilityDisability / count).toFixed(1))
  };
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { pointId } = req.params;
    const { text, ratingOverall, ratingPrice, ratingAccessibilityArrival, ratingAccessibilityDisability, language } = req.body;
    const userId = req.user.id;

    console.log('📝 Create review request:', {
      pointId,
      text,
      ratingOverall,
      ratingPrice,
      ratingAccessibilityArrival,
      ratingAccessibilityDisability,
      language,
      userId
    });

    // Validate required fields
    if (!text || !ratingOverall || !ratingPrice || !ratingAccessibilityArrival || !ratingAccessibilityDisability) {
      console.log('❌ Validation failed - missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate text length
    if (text.length < 5) {
      return res.status(400).json({ message: 'Review text must be at least 5 characters' });
    }

    // Validate ratings are between 1-5
    const ratings = [ratingOverall, ratingPrice, ratingAccessibilityArrival, ratingAccessibilityDisability];
    const allRatingsValid = ratings.every(rating => rating >= 1 && rating <= 5);
    
    if (!allRatingsValid) {
      return res.status(400).json({ message: 'All ratings must be between 1 and 5' });
    }

    // Check if point exists
    const point = await Point.findById(pointId);
    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    // Check if user already reviewed this point
    const existingReview = await Review.findOne({ pointId, userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this point' });
    }

    // Create review
    const review = new Review({
      pointId,
      userId,
      text,
      ratingOverall,
      ratingPrice,
      ratingAccessibilityArrival,
      ratingAccessibilityDisability,
      language: language || point.language || 'he'
    });

    await review.save();
    await review.populate('userId', 'username email');

    // Update point averages
    const averages = await computePointAverages(pointId);
    await Point.findByIdAndUpdate(pointId, averages);

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all reviews for a point
export const getReviewsForPoint = async (req, res) => {
  try {
    const { pointId } = req.params;

    const reviews = await Review.find({ pointId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    console.log('Reviews fetched:', reviews.length);
    console.log('Sample review:', reviews[0] ? { 
      userId: reviews[0].userId, 
      text: reviews[0].text?.substring(0, 30) 
    } : 'No reviews');

    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a review (only owner or admin)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is owner or admin
    if (review.userId.toString() !== userId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const pointId = review.pointId;
    await review.deleteOne();

    // Update point averages after deletion
    const averages = await computePointAverages(pointId);
    await Point.findByIdAndUpdate(pointId, averages);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a review (only owner)
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { text, ratingOverall, ratingPrice, ratingAccessibilityArrival, ratingAccessibilityDisability } = req.body;

    // Validate required fields
    if (!text || !ratingOverall || !ratingPrice || !ratingAccessibilityArrival || !ratingAccessibilityDisability) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate text length
    if (text.length < 5) {
      return res.status(400).json({ message: 'Review text must be at least 5 characters' });
    }

    // Validate ratings are between 1-5
    const ratings = [ratingOverall, ratingPrice, ratingAccessibilityArrival, ratingAccessibilityDisability];
    const allRatingsValid = ratings.every(rating => rating >= 1 && rating <= 5);
    
    if (!allRatingsValid) {
      return res.status(400).json({ message: 'All ratings must be between 1 and 5' });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the owner
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    // Update review fields
    review.text = text;
    review.ratingOverall = ratingOverall;
    review.ratingPrice = ratingPrice;
    review.ratingAccessibilityArrival = ratingAccessibilityArrival;
    review.ratingAccessibilityDisability = ratingAccessibilityDisability;

    await review.save();
    await review.populate('userId', 'name email');

    // Update point averages
    const averages = await computePointAverages(review.pointId);
    await Point.findByIdAndUpdate(review.pointId, averages);

    res.json(review);
  } catch (error) {
    console.error('Update review error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
