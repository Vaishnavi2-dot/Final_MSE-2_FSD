import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://final-mse-2-fsd.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const register = (userData) => api.post('/register', userData);
export const login = (userData) => api.post('/login', userData);

// Grievance APIs
export const submitGrievance = (data) => api.post('/grievances', data);
export const getAllGrievances = () => api.get('/grievances');
export const getGrievanceById = (id) => api.get(`/grievances/${id}`);
export const updateGrievance = (id, data) => api.put(`/grievances/${id}`, data);
export const deleteGrievance = (id) => api.delete(`/grievances/${id}`);
export const searchGrievances = (title) => api.get(`/grievances/search?title=${title}`);

export default api;