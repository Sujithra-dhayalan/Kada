import React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as jwtDecodeModule from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const navigate = useNavigate();

  // Helper to decode token safely
  const decode = useCallback((t) => {
    try {
      // Handle both ESM (default export) and CommonJS (module.exports = function)
      let decoder = jwtDecodeModule.default;
      if (!decoder) {
        // If no default export, try using the module itself if it's a function
        decoder = typeof jwtDecodeModule === 'function' ? jwtDecodeModule : jwtDecodeModule.jwtDecode;
      }
      if (!decoder) {
        console.error('[AuthContext] jwt_decode not found');
        return null;
      }
      console.log('[AuthContext.decode] Successfully decoded token');
      return decoder(t);
    } catch (err) {
      console.error('[AuthContext.decode] Error:', err.message);
      return null;
    }
  }, []);

  // Define login and logout early so effects can use them
  const login = useCallback((newToken) => {
    console.log('[AuthContext.login] Setting token and user');
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const decoded = decode(newToken);
    if (decoded) {
      console.log('[AuthContext.login] User decoded:', decoded);
      setUser(decoded);
    }
  }, [decode]);

  const logout = useCallback(() => {
    console.log('[AuthContext.logout] Clearing token and user');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // Keep user state in sync with token
  useEffect(() => {
    if (token) {
      const decoded = decode(token);
      if (decoded) {
        console.log('[AuthContext] Token is valid, user decoded');
        setUser(decoded);
      } else {
        console.warn('[AuthContext] Token is invalid, clearing');
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token, decode]);

  // Listen for global unauthorized events triggered by the API layer
  useEffect(() => {
    const onUnauthorized = () => {
      console.warn('[AuthContext] Received unauthorized event');
      logout();
      if (window.location.pathname !== '/login') {
        console.log('[AuthContext] Navigating to /login');
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('kada:unauthorized', onUnauthorized);
    return () => window.removeEventListener('kada:unauthorized', onUnauthorized);
  }, [logout, navigate]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};