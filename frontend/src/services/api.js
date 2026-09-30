import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: apiBaseUrl
});

export { apiBaseUrl };
export default api;
