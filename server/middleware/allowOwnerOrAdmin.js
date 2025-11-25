import Point from '../models/Point.js';

// Middleware to check if user is owner or admin
const allowOwnerOrAdmin = async (req, res, next) => {
  try {
    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    // Check if user is the owner or an admin
    if (point.createdBy.toString() === req.user.id || req.user.role === 'admin') {
      req.point = point; // Optionally attach the point to the request
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied. You must be the owner or an admin.' 
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
