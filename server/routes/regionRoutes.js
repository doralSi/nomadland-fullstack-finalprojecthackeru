import express from 'express';
import {
  getAllRegions,
  getRegionBySlug,
  createRegion,
  updateRegion,
  deleteRegion
} from '../controllers/regionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

// Public routes
router.get('/', getAllRegions);
router.get('/:slug', getRegionBySlug);

// Admin-only routes
router.post('/', authMiddleware, isAdmin, createRegion);
router.put('/:id', authMiddleware, isAdmin, updateRegion);
router.delete('/:id', authMiddleware, isAdmin, deleteRegion);

export default router;
