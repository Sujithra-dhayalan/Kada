import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Matches server PORT in `.env` (default 5000)
});

// Interceptor: Attach Token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Response interceptor: if token expired or unauthorized, clear token and reload to force re-auth
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      try {
        localStorage.removeItem('token');
        // Dispatch a custom event so the React app can respond and navigate using React Router
        // Throttle to avoid multiple rapid events causing redirect loops
        const now = Date.now();
        if (!api._lastUnauthorizedAt || now - api._lastUnauthorizedAt > 1000) {
          api._lastUnauthorizedAt = now;
          window.dispatchEvent(new Event('kada:unauthorized'));
        }
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(err);
  }
);