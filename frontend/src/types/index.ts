export enum UserRole {
  REGULAR = 'regular',
  SUPERVISOR = 'supervisor',
}

export enum OtStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId: number;
  department?: Department;
  createdAt: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OtRecord {
  id: number;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: string | number; // Can be string from API or number
  reason: string;
  status: OtStatus;
  approvedBy?: number;
  comments?: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface CreateOtRecordDto {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  reason: string;
  comments?: string;
}

export interface DashboardStats {
  totalOtRecords: number;
  pendingOtRecords: number;
  approvedOtRecords: number;
  totalUsers: number;
  totalOtHours: number;
  avgOtDuration: number;
}

export interface DepartmentStats {
  departmentName: string;
  count: number;
  totalHours: number;
}

export interface MonthlyStats {
  month: number;
  count: number;
  totalHours: number;
}

export interface TopUser {
  name: string;
  departmentName: string;
  count: number;
  totalHours: number;
}

export interface OtTrend {
  date: string;
  count: number;
  totalHours: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
