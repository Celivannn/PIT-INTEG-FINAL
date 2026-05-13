import axios from 'axios';

// Fix CockroachDB 64-bit integer precision loss.
// Must intercept the RAW response string BEFORE axios's built-in JSON.parse runs.
const transformResponse = [
  (data) => {
    if (typeof data !== 'string') return data;
    try {
      return JSON.parse(data.replace(/:(\s*)(\d{16,})/g, ':"$2"'));
    } catch {
      return data;
    }
  }
];

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  transformResponse,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.config.url}`, response.status);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          'http://localhost:8000/api/auth/token/refresh/',
          {},
          { withCredentials: true }
        );

        localStorage.setItem('admin_access_token', data.access);
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_user');
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 400) {
      console.error('Bad Request Details:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        response: error.response?.data,
      });
    }

    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config?.url);
    }

    if (error.response?.status === 500) {
      console.error('Server Error:', error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default api;