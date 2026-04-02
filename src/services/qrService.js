// src/services/qrService.js
import api from './api';

export const qrService = {
  // Faculty: start a QR session
  startSession: (sessionData) => api.post('/qr/start', sessionData),

  // Faculty: end a session manually
  endSession: (sessionId) => api.post('/qr/end', { sessionId }),

  // Faculty: expire session when 5 min timer runs out
  expireSession: (sessionId) => api.post('/qr/expire', { sessionId }),

  // Student: poll for any active session
  getActiveSession: () => api.get('/qr/active'),

  // Student: mark themselves present (PIN + sessionId)
  markPresent: (sessionId, pin, subjectId) =>
    api.post('/qr/mark', { sessionId, pin, subjectId }),

  // Faculty: get session history
  getHistory: (facultyId) => api.get(`/qr/history/faculty/${facultyId}`),

  // Faculty: get who marked present in a session (enriched with student details)
  getSessionAttendance: (sessionId) =>
    api.get(`/qr/session/${encodeURIComponent(sessionId)}/attendance`),
};