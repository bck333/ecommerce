import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi from '../api/adminClient';
import { AdminUser, AdminLoginResponse } from '../types/admin';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrMobile: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Validate session with /api/admin/dashboard
      adminApi
        .get('/admin/dashboard')
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          logout();
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (emailOrMobile: string, password: string) => {
    const res = await adminApi.post<{ success: boolean; data: AdminLoginResponse }>('/admin/auth/login', {
      usernameOrMobile: emailOrMobile,
      emailOrMobile,
      password,
    });

    if (res.data.success && res.data.data) {
      const { token: jwtToken, user } = res.data.data;
      setToken(jwtToken);
      setAdminUser(user);
      localStorage.setItem('admin_token', jwtToken);
      localStorage.setItem('admin_user', JSON.stringify(user));
    }
  };

  const logout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token,
        isAuthenticated: !!token && !!adminUser,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
