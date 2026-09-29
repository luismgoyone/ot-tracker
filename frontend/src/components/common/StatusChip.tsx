import { Chip, ChipProps } from '@mui/material';
import { OtStatus } from '../../types';

const STATUS_STYLES: Record<OtStatus, { label: string; bgcolor: string; color: string }> = {
  [OtStatus.APPROVED]: { label: 'Approved', bgcolor: 'tint.success', color: 'success.dark' },
  [OtStatus.REJECTED]: { label: 'Rejected', bgcolor: 'tint.error', color: 'error.dark' },
  [OtStatus.PENDING]: { label: 'Pending', bgcolor: 'tint.warning', color: 'warning.dark' },
};

export const StatusChip = ({ status, sx, ...props }: { status: OtStatus } & ChipProps) => {
  const style = STATUS_STYLES[status];
  return (
    <Chip
      label={style?.label ?? status}
      size="small"
      sx={{ bgcolor: style?.bgcolor, color: style?.color, fontWeight: 700, ...sx }}
      {...props}
    />
  );
};
