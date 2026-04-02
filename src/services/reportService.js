// src/services/reportService.js
import api from './api';

export const reportService = {
  getStudentReport: (studentId) => api.get(`/attendance/student/${studentId}/stats`),
  getClassReport:   (classId)   => api.get(`/attendance/analytics/batch-wise`),
};
