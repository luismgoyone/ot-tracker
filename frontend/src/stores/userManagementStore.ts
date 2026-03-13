import { create } from 'zustand';
import { apiClient } from '../utils/apiClient';
import { User, CreateUserPayload, UpdateUserPayload } from '../types';

interface UserManagementState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (data: CreateUserPayload) => Promise<void>;
  updateUser: (id: number, data: UpdateUserPayload) => Promise<void>;
  resetUserPassword: (id: number) => Promise<string>;
}

export const useUserManagementStore = create<UserManagementState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<User[]>('/users');
      set({ users: response.data, isLoading: false });
    } catch {
      set({ error: 'Failed to load users', isLoading: false });
    }
  },

  createUser: async (data) => {
    const response = await apiClient.post<User>('/users', data);
    set((state) => ({ users: [...state.users, response.data] }));
  },

  updateUser: async (id, data) => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? response.data : u)),
    }));
  },

  resetUserPassword: async (id) => {
    const response = await apiClient.post<{ temporaryPassword: string }>(`/users/${id}/reset-password`);
    return response.data.temporaryPassword;
  },
}));
