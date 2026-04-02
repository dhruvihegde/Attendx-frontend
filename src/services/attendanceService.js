// src/services/attendanceService.js
import api from './api';

export const attendanceService = {

  // Faculty: mark attendance for all students in a subject
  // records = [{ studentId: 's1', status: 'present' }, ...]
  markAttendance: (subjectId, date, records, method = 'manual') =>
    api.post('/attendance/mark', { subjectId, date, method, records }),

  // Student: subject-wise stats
  getStudentStats: (studentId) =>
    api.get(`/attendance/student/${studentId}/stats`),

  // Student: daily records for a subject
  getStudentRecords: (studentId, subjectId) =>
    api.get(`/attendance/student/${studentId}/records`, { params: { subjectId } }),

  // Faculty: attendance history for a subject (all records)
  getSubjectHistory: (subjectId) =>
    api.get(`/attendance/subject/${subjectId}/history`),

  // Faculty: attendance for a specific date
  getByDate: (subjectId, date) =>
    api.get(`/attendance/subject/${subjectId}/date/${date}`),

  // Overall percentage for a student
  getOverall: (studentId) =>
    api.get(`/attendance/overall/${studentId}`),

  // Analytics
  getSummary:     () => api.get('/attendance/analytics/summary'),
  getSubjectWise: () => api.get('/attendance/analytics/subject-wise'),
  getStudentWise: () => api.get('/attendance/analytics/student-wise'),
  getBatchWise:   () => api.get('/attendance/analytics/batch-wise'),
};