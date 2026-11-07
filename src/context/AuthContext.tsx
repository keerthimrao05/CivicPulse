import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api } from '../api/client.ts';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  login: (email?: string, targetRole?: UserRole) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; address?: string; city?: string }) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize with default demo session (Citizen Keerthi Rao)
  useEffect(() => {
    const savedUser = localStorage.getItem('civicpulse_user');
    const savedToken = localStorage.getItem('civicpulse_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        setIsLoading(false);
        return;
      } catch {
        // Fallback
      }
    }

    // Default to citizen demo profile
    api.login('keerthimrao05@gmail.com', 'citizen')
      .then(res => {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('civicpulse_user', JSON.stringify(res.user));
        localStorage.setItem('civicpulse_token', res.token);
      })
      .catch(() => {
        // Fallback static user
        const defaultUser: User = {
          id: 'user-cit-1',
          name: 'Keerthi Rao',
          email: 'keerthimrao05@gmail.com',
          phone: '+91 98451 22334',
          role: 'citizen',
          city: 'Bengaluru',
          address: '100 Feet Road, Indiranagar',
          createdAt: new Date().toISOString()
        };
        setUser(defaultUser);
        setToken('jwt_token_default');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email?: string, targetRole?: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, targetRole);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('civicpulse_user', JSON.stringify(res.user));
      localStorage.setItem('civicpulse_token', res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; address?: string; city?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('civicpulse_user', JSON.stringify(res.user));
      localStorage.setItem('civicpulse_token', res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      let email = 'keerthimrao05@gmail.com';
      if (targetRole === 'superadmin') email = 'admin@civicpulse.gov.in';
      if (targetRole === 'officer') email = 'sarah.jenkins@civicpulse.gov.in';

      const res = await api.login(email, targetRole);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('civicpulse_user', JSON.stringify(res.user));
      localStorage.setItem('civicpulse_token', res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('civicpulse_user');
    localStorage.removeItem('civicpulse_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'citizen',
        token,
        login,
        register,
        logout,
        switchRole,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
