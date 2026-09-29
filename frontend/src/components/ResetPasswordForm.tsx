import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, InputAdornment, IconButton } from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';
import { getErrorMessage } from '../api/client';
import { newPasswordError } from './profile/passwordRules';

interface ResetPasswordFormProps {
  onSuccess: () => void;
}

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

const PasswordField = ({ label, placeholder, value, onChange, disabled }: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Typography variant="body2" fontWeight={500} color="grey.700" mb={0.75}>
        {label}
      </Typography>
      <TextField
        fullWidth
        placeholder={placeholder}
        type={visible ? 'text' : 'password'}
        autoComplete="new-password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock sx={{ fontSize: 18, color: 'text.disabled' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setVisible((v) => !v)}
                edge="end"
                aria-label={visible ? 'Hide password' : 'Show password'}
              >
                {visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'grey.50' } }}
      />
    </>
  );
};

/** Forced password change after signing in with a temporary password (no current password needed). */
export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSuccess }) => {
  const changePassword = useAuthStore((s) => s.changePassword);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = newPasswordError(newPassword, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    try {
      await changePassword(newPassword);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update password. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Box textAlign="center" mb={3}>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Set Your Password
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          You're using a temporary password. Please set a new one to continue.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <PasswordField
            label="New Password"
            placeholder="8–72 characters"
            value={newPassword}
            onChange={setNewPassword}
            disabled={isLoading}
          />
        </Box>
        <Box mb={3}>
          <PasswordField
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            disabled={isLoading}
          />
        </Box>
        <Button type="submit" fullWidth variant="contained" disabled={isLoading} sx={{ py: 1.25, fontSize: '0.95rem' }}>
          {isLoading ? 'Updating...' : 'Update Password & Continue'}
        </Button>
      </form>
    </Box>
  );
};
