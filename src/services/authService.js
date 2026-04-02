// src/services/authService.js
import api from './api';

export const authService = {
  login:          (email, password, role) => api.post('/auth/login', { email, password, role }),
  me:             ()                      => api.get('/auth/me'),
  forgotPassword: (email)                 => api.post('/auth/forgot-password', { email }),
};
