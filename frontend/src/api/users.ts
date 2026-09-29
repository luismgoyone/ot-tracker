import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '../stores/authStore';
import { CreateUserPayload, Department, UpdateUserPayload, User } from '../types';

const userKeys = { all: ['users'] as const, me: ['users', 'me'] as const };

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: async () => (await apiClient.get<User[]>('/users')).data,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await apiClient.get<Department[]>('/departments')).data,
    staleTime: 5 * 60_000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => (await apiClient.post<User>('/users', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserPayload }) =>
      (await apiClient.patch<User>(`/users/${id}`, data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: async (id: number) =>
      (await apiClient.post<{ temporaryPassword: string }>(`/users/${id}/reset-password`)).data.temporaryPassword,
  });
}

/** The signed-in user's profile; also refreshes the session copy in the auth store. */
export function useProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: userKeys.me,
    queryFn: async () => {
      const user = (await apiClient.get<User>('/auth/me')).data;
      setUser(user);
      return user;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) =>
      (await apiClient.patch<User>('/auth/me', data)).data,
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(userKeys.me, user);
    },
  });
}
