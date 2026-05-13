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
  transformResponse, // prevents large integers from being corrupted by JS float precision
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(
          'http://localhost:8000/api/auth/token/refresh/',
          {}, { withCredentials: true }
        );
        localStorage.setItem('access_token', data.access);
        processQueue(null, data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;