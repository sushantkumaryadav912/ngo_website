import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/dashboard';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

// User Management APIs
export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  delete: (id) => api.delete(`/users/${id}`),
};

// Volunteer APIs
export const volunteerAPI = {
  apply: (data) => api.post('/volunteers/apply', data),
  getAll: (status) => api.get('/volunteers', { params: { status } }),
  getById: (id) => api.get(`/volunteers/${id}`),
  approve: (id) => api.patch(`/volunteers/${id}/approve`),
  reject: (id, reason) => api.patch(`/volunteers/${id}/reject`, { reason }),
  getStats: () => api.get('/volunteers/stats/overview'),
};

// Task APIs
export const taskAPI = {
  create: (data) => api.post('/tasks', data),
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  updateStatus: (id, status, notes) => api.patch(`/tasks/${id}/status`, { status, notes }),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getStats: () => api.get('/tasks/stats/overview'),
};

// Event APIs
export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.patch(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// Content APIs
export const contentAPI = {
  getByType: (type) => api.get(`/content/${type}`),
  getById: (type, id) => api.get(`/content/${type}/${id}`),
  create: (data) => api.post('/content', data),
  update: (id, data) => api.patch(`/content/${id}`, data),
  delete: (id) => api.delete(`/content/${id}`),
};

// Urgent Needs APIs
export const urgentNeedAPI = {
  getAll: (params) => api.get('/urgent-needs', { params }),
  getById: (id) => api.get(`/urgent-needs/${id}`),
  create: (data) => api.post('/urgent-needs', data),
  update: (id, data) => api.patch(`/urgent-needs/${id}`, data),
  addDonation: (id, amount) => api.patch(`/urgent-needs/${id}/donation`, { amount }),
  delete: (id) => api.delete(`/urgent-needs/${id}`),
};

// Gallery APIs
export const galleryAPI = {
  getAll: () => api.get('/gallery'),
  getById: (id) => api.get(`/gallery/${id}`),
  create: (data) => api.post('/gallery', data),
  update: (id, data) => api.patch(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`),
};

// Volunteer Hours APIs
export const volunteerHoursAPI = {
  log: (data) => api.post('/volunteer-hours', data),
  getAll: (params) => api.get('/volunteer-hours', { params }),
  getTotal: (volunteerId) => api.get(`/volunteer-hours/total/${volunteerId}`),
  updateStatus: (id, status, adminNotes) => api.patch(`/volunteer-hours/${id}/status`, { status, admin_notes: adminNotes }),
  update: (id, data) => api.patch(`/volunteer-hours/${id}`, data),
  delete: (id) => api.delete(`/volunteer-hours/${id}`),
};

export default api;
