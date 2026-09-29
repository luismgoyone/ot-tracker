import { Chip, ChipProps } from '@mui/material';

export const UserStatusChip = ({ isActive, sx, ...props }: { isActive: boolean } & ChipProps) => (
  <Chip
    label={isActive ? 'Active' : 'Inactive'}
    size="small"
    sx={{
      bgcolor: isActive ? 'tint.success' : 'grey.100',
      color: isActive ? 'success.dark' : 'text.disabled',
      fontWeight: 700,
      ...sx,
    }}
    {...props}
  />
);
