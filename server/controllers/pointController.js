import Point from '../models/Point.js';

// Create a new point
export const createPoint = async (req, res) => {
  try {
    const { title, description, category, lat, lng, images } = req.body;

    // Validate required fields
    if (!title || lat === undefined || lng === undefined) {
      return res.status(400).json({ 
        message: 'Title, latitude, and longitude are required' 
      });
    }

    const point = new Point({
      title,
      description,
      category,
      lat,
      lng,
      images: images || [],
      createdBy: req.user.id
    });

    await point.save();
    await point.populate('createdBy', 'username email');

    res.status(201).json(point);
  } catch (error) {
    console.error('Create point error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all points
export const getPoints = async (req, res) => {
  try {
    const points = await Point.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json(points);
  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single point by ID
export const getPointById = async (req, res) => {
  try {
    const point = await Point.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    res.json(point);
  } catch (error) {
    console.error('Get point by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Point not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a point
export const updatePoint = async (req, res) => {
  try {
    const { title, description, category, lat, lng, images } = req.body;

    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    // Update fields
    if (title !== undefined) point.title = title;
    if (description !== undefined) point.description = description;
    if (category !== undefined) point.category = category;
    if (lat !== undefined) point.lat = lat;
    if (lng !== undefined) point.lng = lng;
    if (images !== undefined) point.images = images;

    await point.save();
    await point.populate('createdBy', 'username email');

    res.json(point);
  } catch (error) {
    console.error('Update point error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Point not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a point
export const deletePoint = async (req, res) => {
  try {
    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    await point.deleteOne();

    res.json({ message: 'Point deleted successfully' });
  } catch (error) {
    console.error('Delete point error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Point not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
