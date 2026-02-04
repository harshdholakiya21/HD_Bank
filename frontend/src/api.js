import axios from 'axios';

const api = axios.create({
    baseURL: window.location.hostname === 'localhost' ? 'http://localhost:8000/api/' : 'https://hd-bank-backend.onrender.com/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export default api;
