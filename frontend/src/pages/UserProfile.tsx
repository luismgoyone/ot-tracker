import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useProfile } from '../api/users';
import { useAuthStore } from '../stores/authStore';
import { ErrorState, LoadingState } from '../components/common/QueryState';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { EmploymentDetails } from '../components/profile/EmploymentDetails';
import { SecurityCard } from '../components/profile/SecurityCard';

export const UserProfile: React.FC = () => {
  const profile = useProfile();
  const sessionUser = useAuthStore((s) => s.user);
  // Show the session copy straight away; the query refreshes it from the server.
  const user = profile.data ?? sessionUser;

  if (!user) {
    return profile.isError ? (
      <ErrorState error={profile.error} onRetry={() => profile.refetch()} />
    ) : (
      <LoadingState height={400} />
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
      <Box display="flex" alignItems="center" gap={1} mb={2.5}>
        <Typography variant="caption" color="text.secondary">
          Settings
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ›
        </Typography>
        <Typography variant="caption" color="primary.main" fontWeight={600}>
          User Profile
        </Typography>
      </Box>

      <ProfileHeader user={user} />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <EmploymentDetails user={user} />
        </Grid>
        <Grid item xs={12} md={5}>
          <SecurityCard />
        </Grid>
      </Grid>
    </Box>
  );
};
