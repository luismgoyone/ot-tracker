import React from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useResetUserPassword } from '../../api/users';
import { getErrorMessage } from '../../api/client';
import { fullName } from '../../utils/format';
import { User } from '../../types';

interface ResetPasswordDialogProps {
  user: User | null;
  onClose: () => void;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ user, onClose }) => {
  const resetPassword = useResetUserPassword();
  const tempPassword = resetPassword.data;

  const handleClose = () => {
    resetPassword.reset();
    onClose();
  };

  return (
    <Dialog open={!!user} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Reset Password</DialogTitle>
      <DialogContent>
        {resetPassword.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getErrorMessage(resetPassword.error, 'Failed to reset password')}
          </Alert>
        )}
        {tempPassword ? (
          <>
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
              Password reset successfully.
            </Alert>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Share this temporary password with <strong>{user?.firstName}</strong>. They will be prompted to change it
              on next login.
            </Typography>
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                fontFamily: 'monospace',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: 2,
                textAlign: 'center',
                userSelect: 'all',
              }}
            >
              {tempPassword}
            </Box>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Reset the password for <strong>{fullName(user)}</strong>? A new temporary password will be generated. They
            will be required to change it on next login.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {tempPassword ? (
          <Button variant="contained" onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="warning"
              disabled={resetPassword.isPending || !user}
              onClick={() => user && resetPassword.mutate(user.id)}
            >
              {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
