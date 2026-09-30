import axios from 'axios';

// Dynamically use the current origin if running in a browser, fallback to localhost for SSR/tests
const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || `${currentOrigin}/api`).replace(/\/+$/, '');

const api = axios.create({
    baseURL: apiBaseUrl
});

export { apiBaseUrl };
export default api;
