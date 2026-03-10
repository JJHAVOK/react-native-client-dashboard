import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: any | null;
  token: string | null;
  isInitialized: boolean; // Tells the app if we are done checking the hard drive
  login: (user: any, token?: string) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>; // The function that runs when the app boots
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isInitialized: false,

  // 1. Run this the exact second the app opens
  initAuth: async () => {
    try {
      const userStr = await SecureStore.getItemAsync('user_data');
      if (userStr) {
        // We found a saved user! Load them up.
        set({ user: JSON.parse(userStr), isInitialized: true });
      } else {
        // No saved user found.
        set({ isInitialized: true });
      }
    } catch (e) {
      set({ isInitialized: true });
    }
  },

  // 2. Updated to save the user data to the hard drive
  login: async (user, token) => {
    if (token) {
      await SecureStore.setItemAsync('jwt_token', token);
    }
    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    set({ user, token: token || null });
  },

  // 3. Updated to wipe the hard drive on logout
  logout: async () => {
    await SecureStore.deleteItemAsync('jwt_token');
    await SecureStore.deleteItemAsync('user_data');
    set({ user: null, token: null });
  },
}));