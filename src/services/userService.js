// src/services/userService.js
import api from './api';

export const userService = {
  getAll:     (role, className) => api.get('/users',   { params: { role, className } }),
  getStudents: (className)      => api.get('/users/students', { params: { className } }),
  getFaculty:  ()               => api.get('/users/faculty'),
  getById:     (id)             => api.get(`/users/${id}`),
  create:      (data)           => api.post('/users', data),
  update:      (id, data)       => api.put(`/users/${id}`, data),
  delete:      (id)             => api.delete(`/users/${id}`),
};
