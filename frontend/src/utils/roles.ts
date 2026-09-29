import { UserRole } from '../types';

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.SUPERVISOR]: 'Supervisor',
  [UserRole.REGULAR]: 'Employee',
};
