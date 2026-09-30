import axios from 'axios';

const apiBaseUrl = import.meta.env.PROD
    ? '/api'
    : import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: apiBaseUrl
});

api.interceptors.request.use(async (config) => {
    // Authentication headers have been removed for simple login.
    return config;
});

export { apiBaseUrl };
export default api;
