import axios from 'axios';
import { toast } from 'sonner';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@massas-sao-jose:access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
    failedQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Um 401 vindo do próprio login/refresh é credencial errada, não sessão
        // expirada — tentar renovar aqui limpa o localStorage, dispara o toast de
        // "sessão expirou" e ainda troca o erro original pelo erro do refresh.
        const isAuthRoute = ['/auth/login', '/auth/refresh'].some((route) =>
            originalRequest?.url?.includes(route),
        );

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
                .then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('@massas-sao-jose:refresh_token');
                const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, {
                    headers: { Authorization: `Bearer ${refreshToken}` }
                });

                localStorage.setItem('@massas-sao-jose:access_token', data.accessToken);
                localStorage.setItem('@massas-sao-jose:refresh_token', data.refreshToken);

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                processQueue(null, data.accessToken);
                return api(originalRequest);
            } catch (err) {processQueue(err, null);
                localStorage.clear();
                toast.error('Sua sessão expirou. Por favor, faça login novamente.');

                setTimeout(() => {
                    window.location.href = '/login';
                }, 500);

                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);
