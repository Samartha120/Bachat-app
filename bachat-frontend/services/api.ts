import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { CONFIG } from '@/constants/Config';

const TOKEN_KEY = 'bachat_auth_jwt_token';
const USER_KEY = 'bachat_auth_user_payload';

// Web-safe storage fallback
export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

const PIN_KEY = 'bachat_security_pin';

export const authStorage = {
  saveToken: (token: string) => storage.setItem(TOKEN_KEY, token),
  getToken: () => storage.getItem(TOKEN_KEY),
  removeToken: () => storage.removeItem(TOKEN_KEY),

  saveUser: (user: any) => storage.setItem(USER_KEY, JSON.stringify(user)),
  getUser: async () => {
    const raw = await storage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  removeUser: () => storage.removeItem(USER_KEY),

  savePin: (pin: string) => storage.setItem(PIN_KEY, pin),
  getPin: () => storage.getItem(PIN_KEY),
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${CONFIG.API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      // response is not json
    }
    const message = errorData.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}
