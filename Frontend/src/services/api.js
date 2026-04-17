import axios from 'axios';

// Vite uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'https://final-mse-2-fsd.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
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

// Auth APIs
export const register = (userData) => api.post('/register', userData);
export const login = (userData) => api.post('/login', userData);

// Expense APIs
export const addExpense = (expenseData) => api.post('/expense', expenseData);
export const getExpenses = (category = '') => {
  const url = category ? `/expenses?category=${category}` : '/expenses';
  return api.get(url);
};
export const updateExpense = (id, expenseData) => api.put(`/expense/${id}`, expenseData);
export const deleteExpense = (id) => api.delete(`/expense/${id}`);

export default api;