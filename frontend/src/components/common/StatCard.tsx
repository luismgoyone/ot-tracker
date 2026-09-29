import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactElement;
  tone?: Tone;
}

/** A labelled number with a tinted icon tile. */
export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, tone = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
        <Box minWidth={0}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}
          >
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={700} color="text.primary" mt={0.5} lineHeight={1.2}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: `tint.${tone}`,
            borderRadius: 2,
            p: 1,
            display: 'flex',
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, { sx: { color: `${tone}.main`, fontSize: 22 } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);
