import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

const api = axios.create({
    baseURL: 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
    const token = getCookie('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = getCookie('refreshToken');

            if (refreshToken) {
                try {
                    const res = await axios.post('http://localhost:3001/auth/refresh', { refreshToken });
                    const { accessToken } = res.data;

                    setCookie('accessToken', accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    return api(originalRequest); // Retry the original request
                } catch (refreshError) {
                    deleteCookie('accessToken');
                    deleteCookie('refreshToken');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;