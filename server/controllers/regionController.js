import Region from '../models/Region.js';

// Get all active regions
export const getAllRegions = async (req, res) => {
  try {
    const regions = await Region.find({ isActive: true }).sort({ name: 1 });
    res.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ message: 'Failed to fetch regions' });
  }
};

// Get single region by slug
export const getRegionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const region = await Region.findOne({ slug, isActive: true });
    
    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }
    
    res.json(region);
  } catch (error) {
    console.error('Error fetching region:', error);
    res.status(500).json({ message: 'Failed to fetch region' });
  }
};

// Create a new region (admin only)
export const createRegion = async (req, res) => {
  try {
    const { name, slug, description, center, zoom, polygon, heroImageUrl, isActive } = req.body;

    // Validate required fields
    if (!name || !slug || !center || !polygon) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, slug, center, and polygon are required' 
      });
    }

    // Validate center coordinates
    if (!center.lat || !center.lng) {
      return res.status(400).json({ 
        message: 'Center must include lat and lng coordinates' 
      });
    }

    // Validate polygon format
    if (!Array.isArray(polygon) || polygon.length < 3) {
      return res.status(400).json({ 
        message: 'Polygon must be an array of at least 3 coordinate pairs' 
      });
    }

    // Check if region with same slug already exists
    const existingRegion = await Region.findOne({ slug });
    if (existingRegion) {
      return res.status(400).json({ message: 'Region with this slug already exists' });
    }

    const region = new Region({
      name,
      slug: slug.toLowerCase(),
      description,
      center,
      zoom: zoom || 12,
      polygon,
      heroImageUrl,
      isActive: isActive !== undefined ? isActive : true
    });

    await region.save();
    res.status(201).json(region);
  } catch (error) {
    console.error('Error creating region:', error);
    res.status(500).json({ message: 'Failed to create region' });
  }
};

// Update region (admin only)
export const updateRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const region = await Region.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    res.json(region);
  } catch (error) {
    console.error('Error updating region:', error);
    res.status(500).json({ message: 'Failed to update region' });
  }
};

// Delete/deactivate region (admin only)
export const deleteRegion = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting isActive to false
    const region = await Region.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    res.json({ message: 'Region deactivated successfully', region });
  } catch (error) {
    console.error('Error deleting region:', error);
    res.status(500).json({ message: 'Failed to delete region' });
  }
};
