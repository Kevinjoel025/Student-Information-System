import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAPI } from '../lib/api';

export type Role = 'admin' | 'student' | null;

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  token: string;
}

interface AuthContextType {
  role: Role;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('sis_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('sis_user');
        localStorage.removeItem('sis_token');
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginAPI(email, password);
      const userData: User = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
      };
      setUser(userData);
      localStorage.setItem('sis_user', JSON.stringify(userData));
      localStorage.setItem('sis_token', data.token);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    localStorage.removeItem('sis_user');
    localStorage.removeItem('sis_token');
  }, []);

  const role = user?.role ?? null;
  const token = user?.token ?? null;

  return (
    <AuthContext.Provider value={{ role, user, token, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
