import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ============================================================
// CONFIGURATION API - NE PAS MODIFIER CETTE SECTION
// ============================================================
// URL du backend de production Render - FIXE ET DÉFINITIVE
const PRODUCTION_API_URL = 'https://aila-backend-hc1m.onrender.com';

// Determine API URL based on environment
const getApiUrl = () => {
  // Sur le WEB : toujours utiliser la production SAUF localhost
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Seul localhost utilise le backend local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const devUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
      console.log('[API] DEV MODE - localhost:', devUrl);
      return devUrl;
    }
    
    // TOUS les autres domaines (aila.family, vercel, preview, etc.) → PRODUCTION
    console.log('[API] PRODUCTION MODE for domain:', hostname);
    return PRODUCTION_API_URL;
  }
  
  // Mobile natif : utiliser la production par défaut
  console.log('[API] MOBILE/NATIVE MODE → PRODUCTION');
  return PRODUCTION_API_URL;
};

const API_URL = getApiUrl();
console.log('[API] ========================================');
console.log('[API] FINAL API URL:', API_URL);
console.log('[API] ========================================');

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
  clearTree: () => api.delete('/tree/clear'),
  debugTree: () => api.get('/tree/debug'),
};

export const previewAPI = {
  createSession: () => api.post('/preview/session'),
  getSession: (token: string) => api.get(`/preview/${token}`),
  addPerson: (token: string, data: any) => api.post(`/preview/${token}/person`, data),
  updatePerson: (token: string, personId: string, data: any) => api.put(`/preview/${token}/person/${personId}`, data),
  addLink: (token: string, data: any) => api.post(`/preview/${token}/link`, data),
  deleteLink: (token: string, linkId: string) => api.delete(`/preview/${token}/link/${linkId}`),
  deletePerson: (token: string, personId: string) => api.delete(`/preview/${token}/person/${personId}`),
  convertToAccount: (token: string) => api.post(`/preview/${token}/convert`),
};

export const gdprAPI = {
  exportData: () => api.get('/gdpr/export'),
  deleteAccount: () => api.delete('/gdpr/delete-account'),
};

export const exportAPI = {
  downloadJSON: () => api.get('/tree/export/json'),
  downloadGEDCOM: () => api.get('/tree/export/gedcom', { responseType: 'blob' }),
};

// Collaboration APIs
export const collaboratorsAPI = {
  invite: (email: string, role: string = 'editor') => 
    api.post('/collaborators/invite', { email, role }),
  getAll: () => api.get('/collaborators'),
  getSharedWithMe: () => api.get('/collaborators/shared-with-me'),
  remove: (id: string) => api.delete(`/collaborators/${id}`),
  getSharedTree: (ownerId: string) => api.get(`/tree/shared/${ownerId}`),
  acceptInvitation: (inviteToken: string) => api.post(`/collaborators/accept/${inviteToken}`),
  // NEW: Create person/link in shared tree (for editors)
  createPersonInSharedTree: (ownerId: string, data: any) => 
    api.post(`/tree/shared/${ownerId}/persons`, data),
  createLinkInSharedTree: (ownerId: string, data: { person_id_1: string; person_id_2: string; link_type: string }) => 
    api.post(`/tree/shared/${ownerId}/links`, data),
};

export const contributionsAPI = {
  create: (ownerId: string, data: { action: string; entity_type: string; entity_id?: string; entity_data?: any }) =>
    api.post(`/contributions?owner_id=${ownerId}`, data),
  getPending: () => api.get('/contributions/pending'),
  getMy: () => api.get('/contributions/my'),
  review: (id: string, status: string, note?: string) =>
    api.post(`/contributions/${id}/review`, { status, note }),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const chatAPI = {
  getMessages: (limit = 50, skip = 0) => api.get(`/chat/messages?limit=${limit}&skip=${skip}`),
  sendMessage: (data: { message: string; mentioned_person_id?: string }) => api.post('/chat/messages', data),
  deleteMessage: (id: string) => api.delete(`/chat/messages/${id}`),
};

// Family Events API
export const eventsAPI = {
  getUpcomingBirthdays: () => api.get('/events/birthdays'),
  getTodaysEvents: () => api.get('/events/today'),
  getEvents: () => api.get('/events'),
  createEvent: (data: {
    event_type: string;
    title: string;
    description?: string;
    event_date: string;
    person_id?: string;
    recipients?: string[];
    send_email?: boolean;
  }) => api.post('/events', data),
  deleteEvent: (id: string) => api.delete(`/events/${id}`),
};

// Tree Merge API
export const mergeAPI = {
  getMergeableTrees: () => api.get('/tree/merge/shared-trees'),
  analyzeMerge: (sourceTreeOwnerId: string) => 
    api.post(`/tree/merge/analyze?source_tree_owner_id=${sourceTreeOwnerId}`),
  executeMerge: (data: {
    source_tree_owner_id: string;
    decisions: Array<{
      source_person_id: string;
      action: 'merge' | 'add' | 'skip';
      target_person_id?: string;
    }>;
    import_links: boolean;
  }) => api.post('/tree/merge/execute', data),
};
