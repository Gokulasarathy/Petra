/**
 * PETRA API Service
 * Centralized Axios instance and API call functions.
 * All backend communication goes through this module.
 */
import axios from 'axios';

// Create axios instance with defaults
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor — inject JWT token into every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('petra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor — handle session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('petra_token')) {
      localStorage.removeItem('petra_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== Petition APIs =====

/**
 * Create a new petition (supports file upload via FormData)
 */
export const createPetition = async (formData) => {
  const response = await api.post('/petitions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Get all petitions with optional filters
 * @param {Object} params - { page, per_page, status, priority, category, search }
 */
export const getAllPetitions = async (params = {}) => {
  const response = await api.get('/petitions', { params });
  return response.data;
};

/**
 * Get a single petition by ID
 */
export const getPetition = async (id) => {
  const response = await api.get(`/petitions/${id}`);
  return response.data;
};

/**
 * Update petition status
 * @param {number} id - Petition ID
 * @param {Object} data - { status, notes, changed_by }
 */
export const updatePetitionStatus = async (id, data) => {
  const response = await api.put(`/petitions/${id}/status`, data);
  return response.data;
};

/**
 * Delete a petition
 */
export const deletePetition = async (id) => {
  const response = await api.delete(`/petitions/${id}`);
  return response.data;
};

// ===== Dashboard APIs =====

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getStatusDistribution = async () => {
  const response = await api.get('/dashboard/status-distribution');
  return response.data;
};

export const getPriorityDistribution = async () => {
  const response = await api.get('/dashboard/priority-distribution');
  return response.data;
};

export const getCategoryDistribution = async () => {
  const response = await api.get('/dashboard/category-distribution');
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await api.get('/dashboard/recent');
  return response.data;
};

export const getTimeline = async () => {
  const response = await api.get('/dashboard/timeline');
  return response.data;
};

// ===== User & Auth APIs =====

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post('/users', data);
  return response.data;
};

export const getUsers = async (role) => {
  const params = role ? { role } : {};
  const response = await api.get('/users', { params });
  return response.data;
};

export default api;
