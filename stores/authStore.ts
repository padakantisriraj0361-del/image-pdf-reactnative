import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  loadAuth: () => Promise<void>;
  saveAuth: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'auth_data';

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: (user: User, token: string) => {
    set({
      user,
      token,
      isAuthenticated: true,
    });
    get().saveAuth();
  },
  
  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  },
  
  loadAuth: async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const authData = JSON.parse(stored);
        set({
          user: authData.user,
          token: authData.token,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    }
  },
  
  saveAuth: async () => {
    try {
      const { user, token } = get();
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
    } catch (error) {
      console.error('Error saving auth:', error);
    }
  },
}));