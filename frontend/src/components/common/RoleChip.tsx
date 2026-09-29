import { Chip, ChipProps } from '@mui/material';
import { UserRole } from '../../types';
import { ROLE_LABELS } from '../../utils/roles';

const ROLE_STYLES: Record<UserRole, { bgcolor: string; color: string }> = {
  [UserRole.ADMIN]: { bgcolor: 'tint.warning', color: 'warning.dark' },
  [UserRole.SUPERVISOR]: { bgcolor: 'tint.primary', color: 'primary.main' },
  [UserRole.REGULAR]: { bgcolor: 'tint.success', color: 'success.dark' },
};

export const RoleChip = ({ role, sx, ...props }: { role: UserRole } & ChipProps) => (
  <Chip
    label={ROLE_LABELS[role] ?? role}
    size="small"
    sx={{ ...ROLE_STYLES[role], fontWeight: 700, ...sx }}
    {...props}
  />
);
