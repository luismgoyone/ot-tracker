export enum UserRole {
  REGULAR = 'regular',
  SUPERVISOR = 'supervisor',
  ADMIN = 'admin',
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
  isActive?: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
}

export interface CreateUserPayload {
  email: string;
  temporaryPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId: number;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  departmentId?: number;
  isActive?: boolean;
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
  /** Hours, computed by the server from start/end time. */
  duration: number;
  reason: string;
  status: OtStatus;
  approvedBy?: number | null;
  comments?: string | null;
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

/** Duration is not sent: the server computes it from the times. */
export interface CreateOtRecordPayload {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  comments?: string;
}

export interface OtRecordFilters {
  page: number;
  limit: number;
  status?: OtStatus;
  search?: string;
}

export interface MyOtSummary {
  totalRecords: number;
  pendingRecords: number;
  approvedHours: number;
  approvedHoursThisMonth: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
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
  departmentId: number;
  departmentName: string;
  count: number;
  totalHours: number;
}

export interface MonthlyStats {
  year: number;
  /** 1-12 */
  month: number;
  count: number;
  totalHours: number;
}

/** Approved OT this month, compared with last month. */
export interface TopUser {
  userId: number;
  name: string;
  departmentName: string;
  count: number;
  totalHours: number;
  previousHours: number;
  /** null when there was no approved OT last month to compare against. */
  changePercent: number | null;
}

export interface OtTrend {
  /** YYYY-MM-DD */
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
