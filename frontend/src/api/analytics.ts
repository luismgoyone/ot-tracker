import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { DashboardStats, DepartmentStats, MonthlyStats, OtTrend, TopUser } from '../types';

const get = async <T>(url: string, params?: Record<string, number>) => (await apiClient.get<T>(url, { params })).data;

export const useDashboardStats = () =>
  useQuery({ queryKey: ['analytics', 'dashboard'], queryFn: () => get<DashboardStats>('/analytics/dashboard') });

export const useDepartmentStats = () =>
  useQuery({ queryKey: ['analytics', 'by-department'], queryFn: () => get<DepartmentStats[]>('/analytics/by-department') });

export const useMonthlyStats = () =>
  useQuery({ queryKey: ['analytics', 'monthly'], queryFn: () => get<MonthlyStats[]>('/analytics/monthly') });

export const useTopUsers = (limit = 5) =>
  useQuery({ queryKey: ['analytics', 'top-users', limit], queryFn: () => get<TopUser[]>('/analytics/top-users', { limit }) });

export const useOtTrends = (days = 30) =>
  useQuery({ queryKey: ['analytics', 'trends', days], queryFn: () => get<OtTrend[]>('/analytics/trends', { days }) });
