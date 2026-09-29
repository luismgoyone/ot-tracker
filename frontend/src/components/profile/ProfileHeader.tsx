import { useState } from 'react';
import { Alert, Avatar, Box, Button, Card, CardContent, CircularProgress, Grid, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Edit } from '@mui/icons-material';
import { useUpdateProfile } from '../../api/users';
import { getErrorMessage } from '../../api/client';
import { RoleChip } from '../common/RoleChip';
import { fullName, getInitials } from '../../utils/format';
import { User } from '../../types';

/** Gradient banner with the user's avatar, name and role, and an inline form to edit their name. */
export const ProfileHeader = ({ user }: { user: User }) => {
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const startEditing = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setError('');
    setIsEditing(true);
  };

  const handleSave = async () => {
    setError('');
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required');
      return;
    }
    try {
      await updateProfile.mutateAsync({ firstName: firstName.trim(), lastName: lastName.trim() });
      setIsEditing(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save changes'));
    }
  };

  return (
    <Card sx={{ mb: 2.5, overflow: 'visible' }}>
      <Box
        sx={(theme) => ({
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
          borderRadius: '12px 12px 0 0',
          height: 80,
          position: 'relative',
        })}
      >
        {!isEditing && (
          <Button
            size="small"
            variant="contained"
            startIcon={<Edit fontSize="small" />}
            onClick={startEditing}
            sx={(theme) => ({
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: alpha(theme.palette.common.white, 0.2),
              backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.3), boxShadow: 'none' },
            })}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      <CardContent sx={{ pt: 0, pb: '16px !important' }}>
        <Box sx={{ mt: -4, mb: 1.5 }}>
          <Avatar
            sx={(theme) => ({
              width: 64,
              height: 64,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              fontSize: '1.25rem',
              fontWeight: 700,
              border: `3px solid ${theme.palette.background.paper}`,
              boxShadow: theme.shadows[2],
            })}
          >
            {getInitials(user.firstName, user.lastName)}
          </Avatar>
        </Box>

        {isEditing ? (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  size="small"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Grid>
            </Grid>
            <Box display="flex" gap={1}>
              <Button variant="outlined" size="small" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={updateProfile.isPending}
                startIcon={updateProfile.isPending ? <CircularProgress size={14} /> : undefined}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {fullName(user)}
            </Typography>
            <RoleChip role={user.role} sx={{ mt: 0.5 }} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
