import api from './axios';
export const getRooms = (params) => api.get('/rooms/', { params });
export const getRoom = (id) => api.get(`/rooms/${id}/`);
export const getRoomTypes = () => api.get('/rooms/types/');
export const checkAvailability = (params) => api.get('/rooms/availability/', { params });
