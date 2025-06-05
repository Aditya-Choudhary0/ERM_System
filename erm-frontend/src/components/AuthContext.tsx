import React, { createContext, useState, useEffect } from 'react';
import { login, getProfile } from '../api/api'; // Import API functions
import type { User } from '../types';


// Define the shape of the AuthContext value
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
}

// Create the Auth Context with a default undefined value (will be set by AuthProvider)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // Stores authenticated user data
  const [token, setToken] = useState<string | null>(localStorage.getItem('token')); // Stores JWT token
  const [loading, setLoading] = useState<boolean>(true); // Indicates if auth status is being loaded

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const profile = await getProfile(token); // Fetch user profile using the token
          setUser(profile);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // If token is invalid or expired, clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false); // Authentication check is complete
    };

    loadUser();
  }, [token]); // Re-run when token changes

  // Function to handle user login
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login(email, password);
      localStorage.setItem('token', response.token); // Store token in local storage
      setToken(response.token);
      setUser(response.user); // Set user data from login response
      return response; // Return full response for success handling in Login component
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw error for UI to display
    }
  };

  // Function to handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    setToken(null);
    setUser(null);
  };

  const authContextValue: AuthContextType = {
    user,
    token,
    loading,
    login: handleLogin,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};