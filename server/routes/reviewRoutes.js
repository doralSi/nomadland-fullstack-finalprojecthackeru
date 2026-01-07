import express from 'express';
import { createReview, getReviewsForPoint, deleteReview, updateReview } from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/reviews/point/:pointId - Get all reviews for a point
router.get('/point/:pointId', getReviewsForPoint);

// POST /api/reviews/point/:pointId - Create a new review
router.post('/point/:pointId', authMiddleware, createReview);

// PUT /api/reviews/:id - Update a review
router.put('/:id', authMiddleware, updateReview);

// DELETE /api/reviews/:id - Delete a review
router.delete('/:id', authMiddleware, deleteReview);

export default router;
