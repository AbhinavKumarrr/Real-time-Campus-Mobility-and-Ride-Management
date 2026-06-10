import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../lib/api.js';
import { disconnectSocket } from '../lib/socket.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Restore session on first load.
  useEffect(() => {
    let active = true;
    async function load() {
      if (!token) return setLoading(false);
      try {
        const { data } = await api.get('/auth/me');
        if (active) setUser(data.user);
      } catch {
        localStorage.removeItem('token');
        if (active) setToken(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = (data) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    persist(data);
    return data.user;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await api.patch('/auth/profile', payload);
    setUser(data.user);
    return data.user;
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    disconnectSocket();
  }, []);

  const value = { user, token, loading, login, register, logout, updateProfile, refreshUser, setUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
