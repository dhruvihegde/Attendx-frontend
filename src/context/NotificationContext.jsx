// src/context/NotificationContext.jsx
// ─── Replace the existing NotificationContext.jsx with this file ─────────────
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (e) {
      // silently fail — notifications not critical
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds for new notifications
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) setNotifications([]);
  }, [user]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, markRead, markAllRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}
