import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({ baseURL: BASE_URL });

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.post("/auth/logout");
export const getMe = () => api.get("/auth/me");

// Soal
export const getSoal = (params) => api.get("/soal", { params });
export const getSoalById = (id) => api.get(`/soal/${id}`);
export const createSoal = (data) => api.post("/soal", data);
export const updateSoal = (id, data) => api.put(`/soal/${id}`, data);
export const deleteSoal = (id) => api.delete(`/soal/${id}`);

// Latihan
export const mulaiLatihan = (data) => api.post("/latihan/mulai", data);
export const submitLatihan = (sessionId, data) =>
  api.post(`/latihan/${sessionId}/submit`, data);
export const getRiwayat = () => api.get("/latihan/riwayat");
export const getDetailLatihan = (sessionId) => api.get(`/latihan/${sessionId}`);

// Info PTN
export const getJalur = () => api.get("/info/jalur");
export const getJalurBySlug = (slug) => api.get(`/info/jalur/${slug}`);

// Tryout
export const createTryout = (data) => api.post("/tryout", data);
export const updateTryoutStatus = (id, data) =>
  api.patch(`/tryout/${id}/status`, data);
export const addTryoutSubtes = (id, data) =>
  api.post(`/tryout/${id}/subtes`, data);
export const deleteTryout = (id) => api.delete(`/tryout/${id}`);
export const getTryoutList = () => api.get("/tryout");
export const getTryoutById = (id) => api.get(`/tryout/${id}`);
export const startTryoutSession = (id) => api.post(`/tryout/${id}/mulai`);
export const submitTryoutSubtes = (sesiId, data) =>
  api.post(`/tryout/sesi/${sesiId}/submit-subtes`, data);
export const finishTryout = (sesiId, data) =>
  api.post(`/tryout/sesi/${sesiId}/selesai`, data);
export const getTryoutResult = (sesiId) =>
  api.get(`/tryout/sesi/${sesiId}/hasil`);
export const getTryoutHistory = () => api.get("/tryout/sesi/riwayat");

// PTN & Jurusan
export const getPtnList = (params) => api.get("/ptn", { params });
export const getPtnById = (id) => api.get(`/ptn/${id}`);
export const createPtn = (data) => api.post("/ptn", data);
export const updatePtn = (id, data) => api.put(`/ptn/${id}`, data);
export const deletePtn = (id) => api.delete(`/ptn/${id}`);

export const getJurusanList = (params) => api.get("/ptn/jurusan", { params });
export const getJurusanById = (id) => api.get(`/ptn/jurusan/${id}`);
export const createJurusan = (data) => api.post("/ptn/jurusan", data);
export const updateJurusan = (id, data) => api.put(`/ptn/jurusan/${id}`, data);
export const deleteJurusan = (id) => api.delete(`/ptn/jurusan/${id}`);
