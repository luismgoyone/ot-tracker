import { UserRole } from '../common/enums';

/** The authenticated user attached to each request, loaded fresh from the database. */
export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  departmentId: number;
  mustChangePassword: boolean;
}
