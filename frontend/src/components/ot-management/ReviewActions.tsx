import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { Cancel, CheckCircle } from '@mui/icons-material';

interface ReviewActionsProps {
  onApprove: () => void;
  onReject: () => void;
  disabled?: boolean;
  /** `icon` for dense table rows, `button` for the mobile list and dialog. */
  variant?: 'icon' | 'button';
  size?: 'small' | 'medium';
}

export const ReviewActions = ({ onApprove, onReject, disabled, variant = 'button', size = 'small' }: ReviewActionsProps) => {
  if (variant === 'icon') {
    return (
      <>
        <Tooltip title="Approve">
          <span>
            <IconButton
              size="small"
              aria-label="Approve"
              disabled={disabled}
              onClick={onApprove}
              sx={{ color: 'success.main', '&:hover': { bgcolor: 'tint.success' } }}
            >
              <CheckCircle fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Reject">
          <span>
            <IconButton
              size="small"
              aria-label="Reject"
              disabled={disabled}
              onClick={onReject}
              sx={{ color: 'error.main', '&:hover': { bgcolor: 'tint.error' } }}
            >
              <Cancel fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </>
    );
  }

  const compact = size === 'small' ? { fontSize: '0.75rem', py: 0.4 } : {};
  return (
    <Box display="flex" gap={1}>
      <Button
        size={size}
        variant="outlined"
        color="error"
        startIcon={<Cancel fontSize="small" />}
        disabled={disabled}
        onClick={onReject}
        sx={{ borderRadius: 2, ...compact }}
      >
        Reject
      </Button>
      <Button
        size={size}
        variant="contained"
        color="success"
        startIcon={<CheckCircle fontSize="small" />}
        disabled={disabled}
        onClick={onApprove}
        sx={{ borderRadius: 2, ...compact }}
      >
        Approve
      </Button>
    </Box>
  );
};
