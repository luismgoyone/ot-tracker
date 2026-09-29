import { User } from '../../types';

/** Props shared by the desktop table and the mobile list of users. */
export interface UserRowsProps {
  users: User[];
  /** The signed-in admin; their own row can't be deactivated. */
  currentUserId?: number;
  /** The user whose active flag is being saved, if any. */
  togglingId?: number;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
  onToggleActive: (user: User) => void;
}

export const isUserActive = (user: User) => user.isActive ?? true;
