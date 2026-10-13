'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiRequest,
  getStoredToken,
  saveStoredToken,
  removeStoredToken,
  setActiveAuthToken
} from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  quickSwitch: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tự động khôi phục phiên đăng nhập khi load trang (cô lập theo từng tab trình duyệt)
  useEffect(() => {
    const savedToken = getStoredToken();
    if (savedToken) {
      setActiveAuthToken(savedToken);
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      setActiveAuthToken(authToken);
      const res = await apiRequest<User>('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.data) {
        setUser(res.data);
        initSocket(authToken);
      }
    } catch {
      removeStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (usernameOrEmail: string, password: string) => {
    const res = await apiRequest<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    if (res.data) {
      saveStoredToken(res.data.token, true);
      setToken(res.data.token);
      setUser(res.data.user);
      initSocket(res.data.token);
    }
  };

  const register = async (username: string, email: string, password: string, displayName?: string) => {
    const res = await apiRequest<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, displayName }),
    });

    if (res.data) {
      saveStoredToken(res.data.token, true);
      setToken(res.data.token);
      setUser(res.data.user);
      initSocket(res.data.token);
    }
  };

  const logout = () => {
    removeStoredToken();
    disconnectSocket();
    setToken(null);
    setUser(null);
  };

  const quickSwitch = async (targetUsername: string) => {
    disconnectSocket();
    try {
      let res;
      try {
        res = await apiRequest<{ user: User; token: string }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ usernameOrEmail: targetUsername, password: '123456' }),
        });
      } catch {
        res = await apiRequest<{ user: User; token: string }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ usernameOrEmail: targetUsername, password: 'password123' }),
        });
      }

      if (res && res.data) {
        // Lưu riêng vào sessionStorage cho tab này để 2 tab song song không ghi đè token của nhau
        saveStoredToken(res.data.token, false);
        setToken(res.data.token);
        setUser(res.data.user);
        initSocket(res.data.token);
        window.location.reload();
      }
    } catch (err: any) {
      alert('Không thể chuyển tài khoản: ' + (err.message || 'Lỗi đăng nhập'));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, quickSwitch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
};
