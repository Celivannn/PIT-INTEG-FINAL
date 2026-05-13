import api from './axios';
export const getMyReservations = () => api.get('/reservations/');
export const getReservation = (id) => api.get(`/reservations/${id}/`);
export const createReservation = (data) => api.post('/reservations/', data);
export const cancelReservation = (id) => api.post(`/reservations/${id}/cancel/`);
