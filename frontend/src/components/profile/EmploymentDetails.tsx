import React from 'react';
import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import { Badge, Business, CalendarToday, Email } from '@mui/icons-material';
import { ROLE_LABELS } from '../../utils/roles';
import { formatDate } from '../../utils/format';
import { User } from '../../types';
import { SectionLabel } from './SectionLabel';

const ICON_SX = { fontSize: 16, color: 'primary.main' };

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Box display="flex" alignItems="center" gap={1.5}>
    <Box
      sx={{
        width: 28,
        height: 28,
        bgcolor: 'tint.primary',
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box minWidth={0}>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        textTransform="uppercase"
        letterSpacing="0.05em"
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

export const EmploymentDetails = ({ user }: { user: User }) => {
  const rows = [
    { icon: <Email sx={ICON_SX} />, label: 'Work Email', value: user.email },
    { icon: <Business sx={ICON_SX} />, label: 'Department', value: user.department?.name ?? '—' },
    { icon: <Badge sx={ICON_SX} />, label: 'Role', value: ROLE_LABELS[user.role] ?? user.role },
    {
      icon: <CalendarToday sx={ICON_SX} />,
      label: 'Member Since',
      value: user.createdAt ? formatDate(user.createdAt, 'MMMM D, YYYY') : '—',
    },
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <SectionLabel>Employment Details</SectionLabel>
        <Box mt={2} display="flex" flexDirection="column" gap={2}>
          {rows.map((row, index) => (
            <React.Fragment key={row.label}>
              {index > 0 && <Divider />}
              <DetailRow {...row} />
            </React.Fragment>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
