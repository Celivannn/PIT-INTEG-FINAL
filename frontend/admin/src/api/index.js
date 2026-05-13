import api from './axios';

// Auth
export const adminLogin  = (data) => api.post('/auth/login/', data);
export const adminLogout = ()     => api.post('/auth/logout/');

// Dashboard
export const getDashboard = (params) => api.get('/admin/dashboard/', { params });

// Reservations
export const getReservations         = (params) => api.get('/reservations/admin/', { params });
export const getReservation          = (id)     => api.get(`/reservations/admin/${id}/`);
export const updateReservationStatus = (id, status) => api.patch(`/reservations/admin/${id}/status/`, { status });

// Rooms
export const getRooms        = (params)       => api.get('/rooms/', { params });
export const getRoom         = (id)           => api.get(`/rooms/${id}/`);
export const createRoom      = (data)         => api.post('/rooms/', data);
export const updateRoom      = (id, data)     => api.patch(`/rooms/${id}/`, data);
export const deleteRoom      = (id)           => api.delete(`/rooms/${id}/`);
export const getRoomTypes    = ()             => api.get('/rooms/types/');
export const createRoomType  = (data)         => api.post('/rooms/types/', data);
export const updateRoomType  = (id, data)     => api.patch(`/rooms/types/${id}/`, data);
export const uploadRoomImage = (roomId, data) => api.post(`/rooms/${roomId}/images/`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteRoomImage = (roomId, imageId) => api.delete(`/rooms/${roomId}/images/${imageId}/`);

// Customers
export const getCustomers = ()   => api.get('/admin/customers/');
export const getCustomer  = (id) => api.get(`/admin/customers/${id}/`);

// Reports — override transformResponse to prevent the large-int regex
// from corrupting binary CSV/PDF blob data
export const exportReport = (params) => api.get('/admin/reports/export/', {
  params,
  responseType: 'blob',
  transformResponse: [(data) => data], // bypass global transform for binary response
});

// Settings
export const getSettings    = ()     => api.get('/settings/');
export const updateSettings = (data) => api.patch('/settings/', data);