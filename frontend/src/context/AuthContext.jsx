import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { saveToken, clearToken, formatApiError } from '../lib/api';
import { toast } from 'sonner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null | user object | false (not authed)
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (e) {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      saveToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      return data.user;
    } catch (e) {
      const msg = formatApiError(e.response?.data?.detail) || e.message;
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      saveToken(data.token);
      setUser(data.user);
      toast.success(`Welcome to Farm2Home, ${data.user.name}!`);
      return data.user;
    } catch (e) {
      const msg = formatApiError(e.response?.data?.detail) || e.message;
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {}
    clearToken();
    setUser(false);
    toast.info('Signed out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, isAuthed: !!user && user !== false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
