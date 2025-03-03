import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginData, SignupData, UpdateProfileData } from '../types/auth';
import * as authService from '../services/auth.service';

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.getProfile();
        setState({
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const user = await authService.login(data);
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || 'Login failed',
      }));
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const user = await authService.signup(data);
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || 'Signup failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || 'Logout failed',
      }));
      throw error;
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const user = await authService.updateProfile(data);
      setState((prev) => ({
        ...prev,
        user,
        error: null,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || 'Profile update failed',
      }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 