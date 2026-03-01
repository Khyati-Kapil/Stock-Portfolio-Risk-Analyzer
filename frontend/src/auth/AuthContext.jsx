import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, getCurrentUser, logoutSession } from '../api/riskApi';

const TOKEN_KEY = 'portfolio_jwt';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function validate() {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getCurrentUser(token);
        if (!ignore) setUser(profile);
      } catch (_err) {
        localStorage.removeItem(TOKEN_KEY);
        if (!ignore) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    validate();
    return () => {
      ignore = true;
    };
  }, [token]);

  const login = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const completeLogin = (jwtToken, profile) => {
    localStorage.setItem(TOKEN_KEY, jwtToken);
    setToken(jwtToken);
    setUser(profile || null);
  };

  const logout = async () => {
    try {
      await logoutSession();
    } catch (_err) {
      // no-op
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, token, login, logout, completeLogin, isLoading }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
