import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { api } from '../services/api';
import { clearAuthToken, setAuthToken } from '../services/apiClient';
import { AuthUser } from '../types/models';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, timezone?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const TOKEN_STORAGE_KEY = 'auth.token';

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (!storedToken) {
          return;
        }

        setAuthToken(storedToken);
        setToken(storedToken);

        const profile = await api.auth.profile();
        setUser(profile);
      } catch {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        clearAuthToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Login iniciado con email:', email);
      console.log('🌐 API URL:', process.env.EXPO_PUBLIC_API_URL);

      const result = await api.auth.login({ email, password });
      console.log('✅ Login exitoso:', result);

      setAuthToken(result.token);
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, result.token);

      setToken(result.token);
      setUser(result.user);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.log('❌ Error en login:', error);
      // Re-throw the error so it can be handled by the component
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, timezone?: string) => {
    try {
      const result = await api.auth.register({
        email,
        password,
        name,
        timezone,
      });

      setAuthToken(result.token);
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, result.token);

      setToken(result.token);
      setUser(result.user);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      // Re-throw the error so it can be handled by the component
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    clearAuthToken();
    setToken(null);
    setUser(null);
    router.replace('/(auth)/login');
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

