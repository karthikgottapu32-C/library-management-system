import axios from 'axios';

const apiBaseUrl = import.meta.env.PROD
    ? '/api'
    : import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: apiBaseUrl
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { apiBaseUrl };
export default api;
