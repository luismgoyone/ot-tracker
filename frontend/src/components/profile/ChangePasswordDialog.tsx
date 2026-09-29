import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useAuthStore } from '../../stores/authStore';
import { getErrorMessage } from '../../api/client';
import { newPasswordError } from './passwordRules';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ open, onClose }) => {
  const changePassword = useAuthStore((s) => s.changePassword);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirm('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!currentPassword) {
      setError('Enter your current password');
      return;
    }
    const validationError = newPasswordError(newPassword, confirm);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password');
      return;
    }
    setIsLoading(true);
    try {
      await changePassword(newPassword, currentPassword);
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Change Password</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {success ? (
            <Alert severity="success">Password updated successfully.</Alert>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  size="small"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  size="small"
                  autoComplete="new-password"
                  placeholder="8–72 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  size="small"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          {success ? (
            <Button variant="contained" onClick={handleClose}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
              >
                Update Password
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};
