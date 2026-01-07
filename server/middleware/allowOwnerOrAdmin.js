import Point from '../models/Point.js';
import User from '../models/User.js';

// Middleware to check if user can edit/delete a point
// Permissions:
// - Admin: can edit any point
// - Map Ranger: can edit points in their assigned regions
// - Regular user: can edit only their own private points (not public ones)
const allowOwnerOrAdmin = async (req, res, next) => {
  try {
    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    // Admin can edit any point
    if (userRole === 'admin') {
      req.point = point;
      return next();
    }

    // Map Ranger can edit points in their assigned regions
    if (userRole === 'mapRanger') {
      const user = await User.findById(userId);
      if (user.rangerRegions && user.rangerRegions.includes(point.regionSlug)) {
        req.point = point;
        return next();
      }
    }

    // Regular user can only edit their own private points
    if (point.createdBy.toString() === userId) {
      // For regular users, only allow editing private points
      if (userRole === 'user' && !point.isPrivate) {
        return res.status(403).json({ 
          message: 'Access denied. You can only edit your private points.' 
        });
      }
      req.point = point;
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied. You do not have permission to edit this point.' 
    });
  } catch (error) {
    console.error('allowOwnerOrAdmin middleware error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Point not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default allowOwnerOrAdmin;
