import React, { createContext, useState, useEffect } from 'react';
import { login, getProfile } from '../api/api';
import type { User } from '../types';

// Define the shape of the AuthContext value
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  updateUser: (newUser: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const profile = await getProfile(token);
          setUser(profile);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Function to handle user login
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login(email, password);
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Function to handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Function to update user in context (e.g., after profile update)
  const handleUpdateUser = (newUser: User) => {
    setUser(newUser);
  };

  const authContextValue: AuthContextType = {
    user,
    token,
    loading,
    login: handleLogin,
    logout: handleLogout,
    updateUser: handleUpdateUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};