import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';

const TEMP_PASSWORD_MESSAGE = 'You must change your temporary password first';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const { status, data } = error.response ?? {};
    // Login failures are handled by the login form, not by logging out.
    const isLoginRequest = error.config?.url?.endsWith('/auth/login');

    if (status === 401 && !isLoginRequest) {
      useAuthStore.getState().logout();
    } else if (status === 403 && data?.message === TEMP_PASSWORD_MESSAGE) {
      // The server requires a password change; show the reset screen.
      useAuthStore.getState().requirePasswordChange();
    }
    return Promise.reject(error);
  },
);

/** The API's error message (NestJS returns a string or a list of validation messages). */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(message)) return message.join('. ');
    if (message) return message;
    if (!error.response) return 'Unable to reach the server. Check your connection and try again.';
  }
  return fallback;
}
