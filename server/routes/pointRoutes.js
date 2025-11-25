import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import allowOwnerOrAdmin from '../middleware/allowOwnerOrAdmin.js';
import {
  createPoint,
  getPoints,
  getPointById,
  updatePoint,
  deletePoint
} from '../controllers/pointController.js';

const router = express.Router();

// Public route - get all points
router.get('/', getPoints);

// Public route - get single point
router.get('/:id', getPointById);

// Protected route - create point (requires authentication)
router.post('/', authMiddleware, createPoint);

// Protected route - update point (requires owner or admin)
router.put('/:id', authMiddleware, allowOwnerOrAdmin, updatePoint);

// Protected route - delete point (requires owner or admin)
router.delete('/:id', authMiddleware, allowOwnerOrAdmin, deletePoint);

export default router;
