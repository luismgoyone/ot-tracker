import { useState } from 'react';
import { Box, Button, Card, CardContent, Divider, Typography } from '@mui/material';
import { LockReset } from '@mui/icons-material';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { SectionLabel } from './SectionLabel';

export const SecurityCard = () => {
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <SectionLabel>Security</SectionLabel>
        <Box mt={2} display="flex" flexDirection="column" gap={1.5}>
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              Password
            </Typography>
            <Typography variant="caption" color="text.secondary">
              You'll need your current password to set a new one.
            </Typography>
          </Box>
          <Divider />
          <Button
            variant="outlined"
            size="small"
            startIcon={<LockReset fontSize="small" />}
            onClick={() => setPasswordOpen(true)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Change Password
          </Button>
        </Box>
      </CardContent>
      <ChangePasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </Card>
  );
};
