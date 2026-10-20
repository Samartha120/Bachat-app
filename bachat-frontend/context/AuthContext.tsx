import React, { createContext, useContext, useState, useEffect } from 'react';
import { authStorage } from '@/services/api';

export type UserRole = 'ROLE_OFFICE_ADMIN' | 'ROLE_STAFF_USER';

export interface UserSession {
  userId: number;
  username: string;
  fullName: string;
  role: UserRole;
  companyName: string;
  token: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN: UserSession = {
  userId: 1,
  username: 'admin@shrestha.com',
  fullName: 'Rajesh Shrestha (Admin)',
  role: 'ROLE_OFFICE_ADMIN',
  companyName: 'Shrestha Services',
  token: 'mock-jwt-office-admin-bearer-token-bachat-2026',
};

const DEFAULT_STAFF: UserSession = {
  userId: 2,
  username: 'staff@shrestha.com',
  fullName: 'Sunita Shrestha (Staff)',
  role: 'ROLE_STAFF_USER',
  companyName: 'Shrestha Services',
  token: 'mock-jwt-staff-user-bearer-token-bachat-2026',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(DEFAULT_ADMIN);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSavedSession() {
      try {
        const saved = await authStorage.getUser();
        if (saved) {
          setUser(saved);
        } else {
          // Initialize with default admin session for quick preview
          await authStorage.saveUser(DEFAULT_ADMIN);
          await authStorage.saveToken(DEFAULT_ADMIN.token);
          setUser(DEFAULT_ADMIN);
        }
      } catch (e) {
        console.warn('Failed to load saved session:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSavedSession();
  }, []);

  const login = async (username: string, role: UserRole = 'ROLE_OFFICE_ADMIN') => {
    const session: UserSession = role === 'ROLE_OFFICE_ADMIN' ? {
      ...DEFAULT_ADMIN,
      username,
    } : {
      ...DEFAULT_STAFF,
      username,
    };

    await authStorage.saveUser(session);
    await authStorage.saveToken(session.token);
    setUser(session);
  };

  const logout = async () => {
    await authStorage.removeUser();
    await authStorage.removeToken();
    setUser(null);
  };

  const switchRole = async (newRole: UserRole) => {
    const newSession = newRole === 'ROLE_OFFICE_ADMIN' ? DEFAULT_ADMIN : DEFAULT_STAFF;
    await authStorage.saveUser(newSession);
    await authStorage.saveToken(newSession.token);
    setUser(newSession);
  };

  const isAdmin = user?.role === 'ROLE_OFFICE_ADMIN';

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
