import React, { createContext, useContext, useState, useEffect } from 'react';
import { authStorage, apiRequest } from '@/services/api';

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
  isLocked: boolean;
  savedPin: string;
  unlockWithPin: (pin: string) => boolean;
  setCustomPin: (newPin: string) => Promise<boolean>;
  loginWithCredentials: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  lockApp: () => void;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_ADMIN: UserSession = {
  userId: 1,
  username: 'admin@shrestha.com',
  fullName: 'Rajesh Shrestha (Handler)',
  role: 'ROLE_OFFICE_ADMIN',
  companyName: 'Shrestha Services',
  token: 'jwt-office-admin-bearer-token-bachat-2026',
};

export const DEFAULT_STAFF: UserSession = {
  userId: 2,
  username: 'staff@shrestha.com',
  fullName: 'Sunita Shrestha (Staff)',
  role: 'ROLE_STAFF_USER',
  companyName: 'Shrestha Services',
  token: 'jwt-staff-user-bearer-token-bachat-2026',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(DEFAULT_ADMIN);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true); // Cold start is always locked
  const [savedPin, setSavedPin] = useState('1234');

  useEffect(() => {
    async function loadSavedSession() {
      try {
        const [savedUser, storedPin] = await Promise.all([
          authStorage.getUser(),
          authStorage.getPin(),
        ]);

        if (storedPin) {
          setSavedPin(storedPin);
        } else {
          await authStorage.savePin('1234');
        }

        if (savedUser) {
          setUser(savedUser);
        } else {
          // Preset handler session so PIN unlock is ready immediately
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

  const unlockWithPin = (pin: string): boolean => {
    if (pin === savedPin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const setCustomPin = async (newPin: string): Promise<boolean> => {
    if (!newPin || newPin.length !== 4) return false;
    await authStorage.savePin(newPin);
    setSavedPin(newPin);
    return true;
  };

  const loginWithCredentials = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      // 1. Attempt live authentication with Spring Boot core
      try {
        const response = await apiRequest<any>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });

        if (response && response.token) {
          const session: UserSession = {
            userId: response.userId || 1,
            username: response.username || username,
            fullName: response.fullName || (username.includes('admin') ? 'Rajesh Shrestha (Handler)' : 'Sunita Shrestha (Staff)'),
            role: response.role || 'ROLE_OFFICE_ADMIN',
            companyName: response.companyName || 'Shrestha Services',
            token: response.token,
          };
          await authStorage.saveUser(session);
          await authStorage.saveToken(session.token);
          setUser(session);
          setIsLocked(false);
          return { success: true };
        }
      } catch (backendError) {
        // Backend might be offline or network unreachable from physical mobile
        console.log('Backend live login attempt:', backendError);
      }

      // 2. Verified fallback credentials for offline/local environment
      const cleanUsername = username.trim().toLowerCase();
      if (cleanUsername === 'admin@shrestha.com' && password === 'Admin@123') {
        await authStorage.saveUser(DEFAULT_ADMIN);
        await authStorage.saveToken(DEFAULT_ADMIN.token);
        setUser(DEFAULT_ADMIN);
        setIsLocked(false);
        return { success: true };
      }

      if (cleanUsername === 'staff@shrestha.com' && password === 'Staff@123') {
        await authStorage.saveUser(DEFAULT_STAFF);
        await authStorage.saveToken(DEFAULT_STAFF.token);
        setUser(DEFAULT_STAFF);
        setIsLocked(false);
        return { success: true };
      }

      return {
        success: false,
        message: 'Invalid credentials. Please verify your corporate email and password.',
      };
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'Authentication error',
      };
    }
  };

  const lockApp = () => {
    setIsLocked(true);
  };

  const logout = async () => {
    await authStorage.removeUser();
    await authStorage.removeToken();
    setUser(null);
    setIsLocked(true);
  };

  const switchRole = async (newRole: UserRole) => {
    const newSession = newRole === 'ROLE_OFFICE_ADMIN' ? DEFAULT_ADMIN : DEFAULT_STAFF;
    await authStorage.saveUser(newSession);
    await authStorage.saveToken(newSession.token);
    setUser(newSession);
  };

  const isAdmin = user?.role === 'ROLE_OFFICE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        isLocked,
        savedPin,
        unlockWithPin,
        setCustomPin,
        loginWithCredentials,
        lockApp,
        logout,
        switchRole,
      }}
    >
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
