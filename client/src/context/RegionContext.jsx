import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

const RegionContext = createContext();

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};

export const RegionProvider = ({ children }) => {
  const [regions, setRegions] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all regions on mount
  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/regions');
      setRegions(response.data);
    } catch (err) {
      console.error('Error fetching regions:', err);
      setError(err.response?.data?.message || 'Failed to fetch regions');
    } finally {
      setLoading(false);
    }
  };

  const selectRegion = (region) => {
    setCurrentRegion(region);
  };

  const selectRegionBySlug = async (slug) => {
    try {
      const response = await axiosInstance.get(`/regions/${slug}`);
      setCurrentRegion(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching region by slug:', err);
      throw err;
    }
  };

  const clearRegion = () => {
    setCurrentRegion(null);
  };

  const value = {
    regions,
    currentRegion,
    loading,
    error,
    selectRegion,
    selectRegionBySlug,
    clearRegion,
    fetchRegions
  };

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
};

export default RegionContext;
