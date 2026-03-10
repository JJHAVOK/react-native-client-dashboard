import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: any | null;
  token: string | null;
  login: (user: any, token?: string) => Promise<void>; // Make token optional
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: async (user, token) => {
    // Only try to save the token to hardware if it actually exists
    if (token) {
      await SecureStore.setItemAsync('jwt_token', token);
    }
    set({ user, token: token || null });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('jwt_token');
    set({ user: null, token: null });
  },
}));