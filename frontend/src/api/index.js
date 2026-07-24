import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sherides_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (formData) =>
    API.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadId: (formData) =>
    API.put('/auth/upload-id', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Ride endpoints
export const rideAPI = {
  createRide: (data) => API.post('/rides', data),
  getRides: (params) => API.get('/rides', { params }),
  getRideById: (id) => API.get(`/rides/${id}`),
  getMyRides: () => API.get('/rides/my-rides'),
  requestRide: (id, data) => API.post(`/rides/${id}/request`, data),
  cancelRequest: (id) => API.delete(`/rides/${id}/request`),
  handleRequest: (rideId, passengerId, action) =>
    API.put(`/rides/${rideId}/request/${passengerId}`, { action }),
  startRide: (id) => API.put(`/rides/${id}/start`),
  completeRide: (id) => API.put(`/rides/${id}/complete`),
  cancelRide: (id) => API.put(`/rides/${id}/cancel`),
  getIncomingRequests: () => API.get('/rides/requests/incoming'),
  getMyRequests: () => API.get('/rides/requests/mine'),
  createReview: (rideId, data) => API.post(`/rides/${rideId}/review`, data),
  getReviews: (rideId) => API.get(`/rides/${rideId}/reviews`),
};

export default API;
