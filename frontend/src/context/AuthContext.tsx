import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  sendOtp: (mobileNumber: string) => Promise<void>;
  verifyOtp: (mobileNumber: string, otp: string) => Promise<{ newUser: boolean }>;
  updateProfile: (name: string, email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      // Validate session with /api/users/me
      api.get<{ success: boolean; data: User }>('/users/me')
        .then((res) => {
          if (res.data.success && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const sendOtp = async (mobileNumber: string) => {
    await api.post('/auth/send-otp', { mobileNumber });
  };

  const verifyOtp = async (mobileNumber: string, otp: string): Promise<{ newUser: boolean }> => {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/verify-otp', {
      mobileNumber,
      otp,
    });

    if (res.data.success && res.data.data) {
      const { token: jwtToken, user: userData, newUser } = res.data.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      return { newUser };
    }
    throw new Error('OTP verification failed');
  };

  const updateProfile = async (name: string, email: string) => {
    const res = await api.put<{ success: boolean; data: User }>('/users/profile', { name, email });
    if (res.data.success && res.data.data) {
      setUser(res.data.data);
      localStorage.setItem('user', JSON.stringify(res.data.data));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        sendOtp,
        verifyOtp,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
