// src/context/AuthContext.jsx
// ─── Replace the existing AuthContext.jsx with this file ────────────────────
import { useState, createContext, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('attendx_token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.data))
        .catch(() => localStorage.removeItem('attendx_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role) => {
    try {
      const res = await api.post('/auth/login', { email, password, role });
      const { token, user: userData } = res.data.data;
      localStorage.setItem('attendx_token', token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials or role mismatch';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('attendx_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
