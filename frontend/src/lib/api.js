import axios from 'axios';

const BASE = process.env.REACT_APP_BACKEND_URL;
export const API = `${BASE}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Attach bearer token from localStorage as fallback for cookieless CORS
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('farm2home_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export function saveToken(token) {
  if (token) localStorage.setItem('farm2home_token', token);
}
export function clearToken() {
  localStorage.removeItem('farm2home_token');
}

export function formatApiError(detail) {
  if (detail == null) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e))).filter(Boolean).join(' ');
  if (detail && typeof detail.msg === 'string') return detail.msg;
  return String(detail);
}
