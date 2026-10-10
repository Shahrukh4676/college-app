import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { StudentProfile } from '@/types';
import { authService, LoginDto, RegisterDto } from '@/services/authService';
import { StorageService } from '@/services/api/storage';
import { API_CONFIG, setMockApiOverride } from '@/services/api/config';
import { setOnSessionExpired } from '@/services/api/client';

interface AuthContextValue {
  user: StudentProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (payload: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  setDevMockMode?: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(API_CONFIG.USE_MOCK_API);

  // Restore session strictly from SecureStore
  const restoreSession = useCallback(async () => {
    try {
      const savedToken = await StorageService.getAuthToken();
      const savedUser = await StorageService.getUserProfile<StudentProfile>();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);

        // Fetch fresh profile in background
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
        } catch {
          // If offline or fails, keep cached session
        }
      } else {
        // Unauthenticated initial state
        setUser(null);
        setToken(null);
      }
    } catch (e) {
      console.warn('[AuthContext] Session restore error:', e);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void restoreSession();
  }, [restoreSession]);

  // Session expired handler
  useEffect(() => {
    setOnSessionExpired(() => {
      setUser(null);
      setToken(null);
    });
  }, []);

  const login = useCallback(async (credentials: LoginDto) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterDto) => {
    setIsLoading(true);
    try {
      const res = await authService.register(payload);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<StudentProfile>) => {
    const updated = await authService.updateProfile(updates);
    setUser(updated);
  }, []);

  const refreshProfile = useCallback(async () => {
    const fresh = await authService.getMe();
    setUser(fresh);
  }, []);

  const setDevMockMode = useCallback((enabled: boolean) => {
    if (__DEV__) {
      setMockApiOverride(enabled);
      setIsMockMode(enabled);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      isMockMode,
      login,
      register,
      logout,
      updateProfile,
      refreshProfile,
      setDevMockMode,
    }),
    [user, token, isLoading, isMockMode, login, register, logout, updateProfile, refreshProfile, setDevMockMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
