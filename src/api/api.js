import axios from 'axios';

const BASE_URL = 'https://utbk-backend-production.up.railway.app/api/v1';

const api = axios.create({ baseURL: BASE_URL });

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// Soal
export const getSoal = (params) => api.get('/soal', { params });
export const getSoalById = (id) => api.get(`/soal/${id}`);
export const createSoal = (data) => api.post('/soal', data);
export const updateSoal = (id, data) => api.put(`/soal/${id}`, data);
export const deleteSoal = (id) => api.delete(`/soal/${id}`);

// Latihan
export const mulaiLatihan = (data) => api.post('/latihan/mulai', data);
export const submitLatihan = (sessionId, data) => api.post(`/latihan/${sessionId}/submit`, data);
export const getRiwayat = () => api.get('/latihan/riwayat');
export const getDetailLatihan = (sessionId) => api.get(`/latihan/${sessionId}`);

// Info PTN
export const getJalur = () => api.get('/info/jalur');
export const getJalurBySlug = (slug) => api.get(`/info/jalur/${slug}`);
