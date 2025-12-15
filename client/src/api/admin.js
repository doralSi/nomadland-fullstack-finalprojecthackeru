import axiosInstance from "./axiosInstance";

// Get dashboard statistics
export const getAdminStats = async () => {
  const response = await axiosInstance.get("/admin/stats");
  return response.data;
};

// Users management
export const getUsers = async (params) => {
  const response = await axiosInstance.get("/admin/users", { params });
  return response.data;
};

export const freezeUser = async (userId) => {
  const response = await axiosInstance.put(`/admin/users/${userId}/freeze`);
  return response.data;
};

export const unfreezeUser = async (userId) => {
  const response = await axiosInstance.put(`/admin/users/${userId}/unfreeze`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/admin/users/${userId}`);
  return response.data;
};

export const promoteToMapRanger = async (userId) => {
  const response = await axiosInstance.put(`/admin/users/${userId}/promote`);
  return response.data;
};

export const demoteFromMapRanger = async (userId) => {
  const response = await axiosInstance.put(`/admin/users/${userId}/demote`);
  return response.data;
};

// Points management
export const getAdminPoints = async (params) => {
  const response = await axiosInstance.get("/admin/points", { params });
  return response.data;
};

export const deletePoint = async (pointId) => {
  const response = await axiosInstance.delete(`/admin/points/${pointId}`);
  return response.data;
};

// Events management
export const getAdminEvents = async (params) => {
  const response = await axiosInstance.get("/admin/events", { params });
  return response.data;
};

export const deleteEvent = async (eventId) => {
  const response = await axiosInstance.delete(`/admin/events/${eventId}`);
  return response.data;
};
