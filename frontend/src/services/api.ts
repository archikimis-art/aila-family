import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('[API] Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('[API] No response:', error.request);
    } else {
      console.error('[API] Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

// API Functions
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; first_name: string; last_name: string; gdpr_consent: boolean }) => 
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const personsAPI = {
  getAll: () => api.get('/persons'),
  getOne: (id: string) => api.get(`/persons/${id}`),
  create: (data: any) => api.post('/persons', data),
  update: (id: string, data: any) => api.put(`/persons/${id}`, data),
  delete: (id: string) => api.delete(`/persons/${id}`),
};

export const linksAPI = {
  getAll: () => api.get('/links'),
  create: (data: { person_id_1: string; person_id_2: string; link_type: string }) => 
    api.post('/links', data),
  delete: (id: string) => api.delete(`/links/${id}`),
};

export const treeAPI = {
  getTree: () => api.get('/tree'),
};

export const previewAPI = {
  createSession: () => api.post('/preview/session'),
  getSession: (token: string) => api.get(`/preview/${token}`),
  addPerson: (token: string, data: any) => api.post(`/preview/${token}/person`, data),
  addLink: (token: string, data: any) => api.post(`/preview/${token}/link`, data),
  convertToAccount: (token: string) => api.post(`/preview/${token}/convert`),
};

export const gdprAPI = {
  exportData: () => api.get('/gdpr/export'),
  deleteAccount: () => api.delete('/gdpr/delete-account'),
};
