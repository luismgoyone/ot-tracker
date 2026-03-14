import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Edit,
  LockReset,
  Email,
  Business,
  CalendarToday,
  Badge,
} from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';
import dayjs from 'dayjs';

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.SUPERVISOR]: 'Supervisor',
  [UserRole.REGULAR]: 'Employee',
};

const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  [UserRole.ADMIN]: { bg: '#FEF3C7', color: '#D97706' },
  [UserRole.SUPERVISOR]: { bg: '#EEF2FF', color: '#6366F1' },
  [UserRole.REGULAR]: { bg: '#F0FDF4', color: '#16A34A' },
};

const AVATAR_GRADIENT = 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)';
const HEADER_GRADIENT = 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)';

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

// ── Change Password Dialog ───────────────────────────────────────────────────

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
}) => {
  const { changePassword } = useAuthStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setNewPassword('');
    setConfirm('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await changePassword(newPassword);
      setSuccess(true);
    } catch {
      setError('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Change Password
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {success ? (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              Password updated successfully.
            </Alert>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  size="small"
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  size="small"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          {success ? (
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{ borderRadius: 2 }}
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={handleClose}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={
                  isLoading ? <CircularProgress size={16} /> : undefined
                }
                sx={{ borderRadius: 2 }}
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

// ── Main Page ────────────────────────────────────────────────────────────────

export const UserProfile: React.FC = () => {
  const { user, fetchProfile, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditOpen = () => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setSaveError('');
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setSaveError('');
  };

  const handleSave = async () => {
    setSaveError('');
    if (!firstName.trim() || !lastName.trim()) {
      setSaveError('First and last name are required');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile(firstName.trim(), lastName.trim());
      setIsEditing(false);
    } catch {
      setSaveError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const roleStyle = ROLE_COLORS[user.role] ?? ROLE_COLORS[UserRole.REGULAR];
  const roleLabel = ROLE_LABELS[user.role] ?? 'Employee';

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
      {/* Breadcrumb */}
      <Box display="flex" alignItems="center" gap={1} mb={2.5}>
        <Typography variant="caption" color="text.secondary">
          Settings
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ›
        </Typography>
        <Typography variant="caption" color="#6366F1" fontWeight={600}>
          User Profile
        </Typography>
      </Box>

      {/* Settings Header Card */}
      <Card sx={{ mb: 2.5, overflow: 'visible' }}>
        {/* Gradient banner */}
        <Box
          sx={{
            background: HEADER_GRADIENT,
            borderRadius: '12px 12px 0 0',
            height: 80,
            position: 'relative',
          }}
        >
          {!isEditing && (
            <Button
              size="small"
              variant="contained"
              startIcon={<Edit fontSize="small" />}
              onClick={handleEditOpen}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        <CardContent sx={{ pt: 0, pb: '16px !important' }}>
          {/* Avatar overlapping banner */}
          <Box sx={{ mt: -4, mb: 1.5 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: AVATAR_GRADIENT,
                fontSize: '1.25rem',
                fontWeight: 700,
                border: '3px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              {getInitials(user.firstName, user.lastName)}
            </Avatar>
          </Box>

          {isEditing ? (
            <Box>
              {saveError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {saveError}
                </Alert>
              )}
              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    size="small"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    size="small"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleEditCancel}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  disabled={isSaving}
                  startIcon={
                    isSaving ? <CircularProgress size={14} /> : undefined
                  }
                  onClick={handleSave}
                  sx={{ borderRadius: 2 }}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" fontWeight={700} color="#1E293B">
                {user.firstName} {user.lastName}
              </Typography>
              <Chip
                label={roleLabel}
                size="small"
                sx={{
                  bgcolor: roleStyle.bg,
                  color: roleStyle.color,
                  fontWeight: 700,
                  border: 'none',
                  mt: 0.5,
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        {/* Employment Details */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                letterSpacing="0.08em"
                textTransform="uppercase"
              >
                Employment Details
              </Typography>
              <Box mt={2} display="flex" flexDirection="column" gap={2}>
                <DetailRow
                  icon={<Email sx={{ fontSize: 16, color: '#6366F1' }} />}
                  label="Work Email"
                  value={user.email}
                />
                <Divider />
                <DetailRow
                  icon={<Business sx={{ fontSize: 16, color: '#6366F1' }} />}
                  label="Department"
                  value={user.department?.name ?? '—'}
                />
                <Divider />
                <DetailRow
                  icon={<Badge sx={{ fontSize: 16, color: '#6366F1' }} />}
                  label="Role"
                  value={roleLabel}
                />
                <Divider />
                <DetailRow
                  icon={
                    <CalendarToday sx={{ fontSize: 16, color: '#6366F1' }} />
                  }
                  label="Member Since"
                  value={
                    user.createdAt
                      ? dayjs(user.createdAt).format('MMMM D, YYYY')
                      : '—'
                  }
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                letterSpacing="0.08em"
                textTransform="uppercase"
              >
                Security
              </Typography>
              <Box mt={2} display="flex" flexDirection="column" gap={1.5}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#1E293B"
                    >
                      Password
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last changed: unknown
                    </Typography>
                  </Box>
                  <Chip
                    label="Active"
                    size="small"
                    sx={{
                      bgcolor: '#DCFCE7',
                      color: '#16A34A',
                      fontWeight: 700,
                      border: 'none',
                    }}
                  />
                </Box>
                <Divider />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LockReset fontSize="small" />}
                  onClick={() => setPasswordOpen(true)}
                  sx={{ borderRadius: 2, alignSelf: 'flex-start' }}
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ChangePasswordDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </Box>
  );
};

// ── Detail Row Helper ────────────────────────────────────────────────────────

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
  <Box display="flex" alignItems="center" gap={1.5}>
    <Box
      sx={{
        width: 28,
        height: 28,
        bgcolor: '#EEF2FF',
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        textTransform="uppercase"
        letterSpacing="0.05em"
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color="#1E293B">
        {value}
      </Typography>
    </Box>
  </Box>
);
