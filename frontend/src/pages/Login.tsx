import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Paper,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  AccessTime,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const { user } = useAuthStore.getState();
    if (user?.mustChangePassword) setShowReset(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      await login(credentials);
      const { user } = useAuthStore.getState();
      if (user?.mustChangePassword) {
        setShowReset(true);
        return;
      }
      navigate(user?.role === UserRole.REGULAR ? '/my-ot' : '/dashboard');
    } catch {
      setError('Invalid email or password');
    }
  };

  const handleResetSuccess = () => {
    const { user } = useAuthStore.getState();
    navigate(user?.role === UserRole.REGULAR ? '/my-ot' : '/dashboard');
  };

  const handleChange =
    (field: keyof typeof credentials) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #DDD6FE 100%)',
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
          boxShadow: '0 8px 40px rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.1)',
        }}
      >
        {/* Logo */}
        <Box textAlign="center" mb={3.5}>
          <Box
            sx={{
              width: 52,
              height: 52,
              bgcolor: '#6366F1',
              borderRadius: 2.5,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
            }}
          >
            <AccessTime sx={{ color: '#fff', fontSize: 26 }} />
          </Box>
          {!showReset && (
            <>
              <Typography variant="h5" fontWeight={700} color="#1E293B">
                OT Tracker
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Manage your overtime effortlessly
              </Typography>
            </>
          )}
        </Box>

        {showReset ? (
          <ResetPasswordForm onSuccess={handleResetSuccess} />
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <Box mb={2}>
                <Typography variant="body2" fontWeight={500} color="#374151" mb={0.75}>
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  placeholder="supervisor@company.com"
                  type="email"
                  value={credentials.email}
                  onChange={handleChange('email')}
                  disabled={isLoading}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ fontSize: 18, color: '#9CA3AF' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#F9FAFB' } }}
                />
              </Box>

              {/* Password */}
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
                  <Typography variant="body2" fontWeight={500} color="#374151">
                    Password
                  </Typography>
                  <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 500 }}>
                    Forgot password?
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleChange('password')}
                  disabled={isLoading}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ fontSize: 18, color: '#9CA3AF' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#F9FAFB' } }}
                />
              </Box>

              <FormControlLabel
                control={<Checkbox size="small" sx={{ color: '#D1D5DB' }} />}
                label={<Typography variant="body2" color="#6B7280">Keep me signed in</Typography>}
                sx={{ mb: 2.5 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                endIcon={!isLoading && '→'}
                sx={{
                  py: 1.25,
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  bgcolor: '#6366F1',
                  '&:hover': { bgcolor: '#4F46E5' },
                }}
              >
                {isLoading ? 'Signing In...' : 'Sign in'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#EFF6FF', borderRadius: 2, border: '1px solid #BFDBFE' }}>
              <Box display="flex" alignItems="center" gap={0.75} mb={1}>
                <Info sx={{ fontSize: 14, color: '#3B82F6' }} />
                <Typography variant="caption" fontWeight={700} color="#1D4ED8" letterSpacing="0.05em">
                  DEMO CREDENTIALS
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="#374151">Supervisor:</Typography>
                <Typography variant="caption" color="#374151" fontWeight={500}>supervisor@company.com</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="#374151">Employee:</Typography>
                <Typography variant="caption" color="#374151" fontWeight={500}>employee@company.com</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="#374151">Password:</Typography>
                <Typography variant="caption" color="#374151" fontWeight={500}>password123</Typography>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};
