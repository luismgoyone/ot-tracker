import { create } from 'zustand';
import { DashboardStats, DepartmentStats, MonthlyStats, TopUser, OtTrend } from '../types';
import { apiClient } from '../utils/apiClient';

interface AnalyticsState {
  dashboardStats: DashboardStats | null;
  departmentStats: DepartmentStats[];
  monthlyStats: MonthlyStats[];
  topUsers: TopUser[];
  otTrends: OtTrend[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardStats: () => Promise<void>;
  fetchDepartmentStats: () => Promise<void>;
  fetchMonthlyStats: (year?: number) => Promise<void>;
  fetchTopUsers: (limit?: number) => Promise<void>;
  fetchOtTrends: (days?: number) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  dashboardStats: null,
  departmentStats: [],
  monthlyStats: [],
  topUsers: [],
  otTrends: [],
  isLoading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/analytics/dashboard');
      set({ dashboardStats: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
        isLoading: false 
      });
    }
  },

  fetchDepartmentStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/analytics/by-department');
      set({ departmentStats: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch department stats',
        isLoading: false 
      });
    }
  },

  fetchMonthlyStats: async (year?: number) => {
    set({ isLoading: true, error: null });
    try {
      const url = year ? `/analytics/monthly?year=${year}` : '/analytics/monthly';
      const response = await apiClient.get(url);
      set({ monthlyStats: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch monthly stats',
        isLoading: false 
      });
    }
  },

  fetchTopUsers: async (limit?: number) => {
    set({ isLoading: true, error: null });
    try {
      const url = limit ? `/analytics/top-users?limit=${limit}` : '/analytics/top-users';
      const response = await apiClient.get(url);
      set({ topUsers: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch top users',
        isLoading: false 
      });
    }
  },

  fetchOtTrends: async (days?: number) => {
    set({ isLoading: true, error: null });
    try {
      const url = days ? `/analytics/trends?days=${days}` : '/analytics/trends';
      const response = await apiClient.get(url);
      set({ otTrends: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch OT trends',
        isLoading: false 
      });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
