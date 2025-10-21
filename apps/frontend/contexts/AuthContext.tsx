'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role: 'PARTICIPANT' | 'ORGANIZER';
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await apiClient.getMe();
        if (response.data) {
          setUser(response.data.user);
        }
      } catch (error) {
        // User not authenticated
        apiClient.clearToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      if (response.data) {
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    role: 'PARTICIPANT' | 'ORGANIZER';
  }) => {
    try {
      const response = await apiClient.signup(data);
      if (response.data) {
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Signup failed' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
