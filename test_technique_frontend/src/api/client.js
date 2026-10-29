import axios from 'axios';

// Client axios : toutes les requêtes partent de l'URL de base de l'API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Avant chaque requête, ajoute le token JWT (s'il existe) dans l'en-tête Authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si l'API répond 401 (token invalide ou expiré), on déconnecte et on renvoie vers le login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;