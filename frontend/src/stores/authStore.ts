import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse, LoginCredentials } from '../types';
import { apiClient } from '../api/client';
import { queryClient } from '../api/queryClient';

/** Session state only; server data lives in TanStack Query (see src/api). */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
  requirePasswordChange: () => void;
  changePassword: (newPassword: string, currentPassword?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
        set({ user: data.user, token: data.access_token, isAuthenticated: true });
        return data.user;
      },

      logout: () => {
        queryClient.clear();
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user) => {
        set((state) => ({ user: state.user ? { ...state.user, ...user } : user }));
      },

      requirePasswordChange: () => {
        set((state) => ({ user: state.user ? { ...state.user, mustChangePassword: true } : null }));
      },

      changePassword: async (newPassword, currentPassword) => {
        await apiClient.post('/auth/change-password', { newPassword, currentPassword });
        set((state) => ({
          user: state.user ? { ...state.user, mustChangePassword: false } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
