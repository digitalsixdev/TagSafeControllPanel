import React, { createContext, useContext, useState, useEffect } from 'react';
import { normalizeAuthSession } from './authUtils';
import { logout as logoutApi, verifyToken } from '../../services/api/ApiService';

const AuthContext = createContext();

const AUTH_STORAGE_KEYS = {
  token: 'auth_token',
  userData: 'user_data',
  refreshToken: 'refresh_token',
  refreshExpiresAt: 'refresh_expires_at',
};

const setOptionalStorageValue = (key, value, { clearWhenMissing = false } = {}) => {
  if (typeof value === 'string' && value.trim()) {
    localStorage.setItem(key, value.trim());
    return;
  }
  if (clearWhenMissing) localStorage.removeItem(key);
};

const clearAuthStorage = () => {
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const savedToken = localStorage.getItem(AUTH_STORAGE_KEYS.token);
        const savedUserData = localStorage.getItem(AUTH_STORAGE_KEYS.userData);

        if (savedToken && savedUserData) {
          const response = await verifyToken();
          const { user: normalizedUser, token: verifiedToken, refreshToken, refreshExpiresAt } =
            normalizeAuthSession(response?.data);
          const activeToken = verifiedToken ?? savedToken;

          if (!normalizedUser || !activeToken) {
            clearAuthStorage();
            return;
          }

          setUser(normalizedUser);
          setToken(activeToken);
          localStorage.setItem(AUTH_STORAGE_KEYS.token, activeToken);
          localStorage.setItem(AUTH_STORAGE_KEYS.userData, JSON.stringify(normalizedUser));
          setOptionalStorageValue(AUTH_STORAGE_KEYS.refreshToken, refreshToken);
          setOptionalStorageValue(AUTH_STORAGE_KEYS.refreshExpiresAt, refreshExpiresAt);
        }
      } catch {
        clearAuthStorage();
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = (userData, authToken, sessionData = {}) => {
    const { user: normalizedUser, token: resolvedToken, refreshToken, refreshExpiresAt } =
      normalizeAuthSession({
        usuario: userData,
        token: authToken,
        refresh_token: sessionData?.refreshToken,
        refresh_expires_at: sessionData?.refreshExpiresAt,
      });

    if (!normalizedUser || !resolvedToken) return;

    setUser(normalizedUser);
    setToken(resolvedToken);
    localStorage.setItem(AUTH_STORAGE_KEYS.token, resolvedToken);
    localStorage.setItem(AUTH_STORAGE_KEYS.userData, JSON.stringify(normalizedUser));
    setOptionalStorageValue(AUTH_STORAGE_KEYS.refreshToken, refreshToken, { clearWhenMissing: true });
    setOptionalStorageValue(AUTH_STORAGE_KEYS.refreshExpiresAt, refreshExpiresAt, { clearWhenMissing: true });
  };

  const logout = async () => {
    try {
      if (token) await logoutApi();
    } catch {
      // silently ignore
    } finally {
      setUser(null);
      setToken(null);
      clearAuthStorage();
    }
  };

  const isAuthenticated = () => !!user && !!token;
  const isMaster = () => Array.isArray(user?.roles) && user.roles.some((r) => r.nome === 'user_master')
  const getAuthHeader = () => (token ? `Bearer ${token}` : null);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated, getAuthHeader, isMaster}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
