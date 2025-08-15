import axios from 'axios';

// Normalize base URL and compute API prefix dynamically to avoid double /api
const rawBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '');
const hasApiSuffix = /\/api$/i.test(normalizedBaseUrl);

export const API_PREFIX = hasApiSuffix ? '' : '/api';

export const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
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

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);