import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3333/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
