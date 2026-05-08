import React, { createContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      if (authAPI.isAuthenticated()) {
        const userData = await authAPI.getMe();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Token might be invalid, clear it
      authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = async (username, password) => {
    const response = await authAPI.login(username, password);
    if (response.access_token) {
      // Fetch user data after login
      const userData = await authAPI.getMe();
      setUser(userData);
      setIsAuthenticated(true);
    }
    return response;
  };

  // Register function
  const register = async (userData) => {
    const response = await authAPI.register(userData);
    if (response.access_token) {
      // Fetch user data after registration
      const userInfo = await authAPI.getMe();
      setUser(userInfo);
      setIsAuthenticated(true);
    }
    return response;
  };

  // Logout function
  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user data
  const updateUser = async (userData) => {
    const updatedUser = await authAPI.updateMe(userData);
    setUser(updatedUser);
    return updatedUser;
  };

  // Refresh user data from server
  const refreshUser = async () => {
    if (isAuthenticated) {
      const userData = await authAPI.getMe();
      setUser(userData);
      return userData;
    }
    return null;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
