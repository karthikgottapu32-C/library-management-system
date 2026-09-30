import axios from 'axios';
import { getSupabaseClient } from './supabase';

const apiBaseUrl = import.meta.env.PROD
    ? '/api'
    : import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: apiBaseUrl
});

api.interceptors.request.use(async (config) => {
    const { data, error } = await getSupabaseClient().auth.getSession();
    if (error) throw error;
    if (data.session?.access_token) {
        config.headers.Authorization = `Bearer ${data.session.access_token}`;
    }
    return config;
});

export { apiBaseUrl };
export default api;
