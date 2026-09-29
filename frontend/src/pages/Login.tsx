import React, { useState } from 'react';
import axios from 'axios';
import { Alert, Box, Button, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AccessTime, Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getErrorMessage } from '../api/client';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { User, UserRole } from '../types';

const homePath = (user: User | null) => (user?.role === UserRole.REGULAR ? '/my-ot' : '/dashboard');

const loginErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 429) {
    return 'Too many attempts, try again in a minute.';
  }
  return getErrorMessage(error, 'Sign in failed. Please try again.');
};

const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'grey.50' } };

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  // A persisted session may still owe a password change (e.g. after a reload).
  const mustChangePassword = useAuthStore((state) => Boolean(state.user?.mustChangePassword));

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const user = await login(credentials);
      if (!user.mustChangePassword) navigate(homePath(user));
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSuccess = () => {
    navigate(homePath(useAuthStore.getState().user));
  };

  const handleChange = (field: keyof typeof credentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.tint.primary} 0%, ${alpha(theme.palette.primary.light, 0.25)} 50%, ${alpha(theme.palette.secondary.main, 0.25)} 100%)`,
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
          boxShadow: (theme) => `0 8px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
          border: 1,
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
        }}
      >
        <Box textAlign="center" mb={3.5}>
          <Box
            sx={{
              width: 52,
              height: 52,
              bgcolor: 'primary.main',
              borderRadius: 2.5,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
            }}
          >
            <AccessTime sx={{ color: 'primary.contrastText', fontSize: 26 }} />
          </Box>
          {!mustChangePassword && (
            <>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                OT Tracker
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Manage your overtime effortlessly
              </Typography>
            </>
          )}
        </Box>

        {mustChangePassword ? (
          <ResetPasswordForm onSuccess={handleResetSuccess} />
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <Box mb={2}>
                <Typography
                  component="label"
                  htmlFor="login-email"
                  variant="body2"
                  fontWeight={500}
                  color="text.secondary"
                  display="block"
                  mb={0.75}
                >
                  Email Address
                </Typography>
                <TextField
                  id="login-email"
                  fullWidth
                  placeholder="you@company.com"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={credentials.email}
                  onChange={handleChange('email')}
                  disabled={isSubmitting}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ fontSize: 18, color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
              </Box>

              <Box mb={3}>
                <Typography
                  component="label"
                  htmlFor="login-password"
                  variant="body2"
                  fontWeight={500}
                  color="text.secondary"
                  display="block"
                  mb={0.75}
                >
                  Password
                </Typography>
                <TextField
                  id="login-password"
                  fullWidth
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={handleChange('password')}
                  disabled={isSubmitting}
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
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                endIcon={!isSubmitting && '→'}
                sx={{ py: 1.25, borderRadius: 2, fontSize: '0.95rem' }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </>
        )}
      </Paper>
    </Box>
  );
};
