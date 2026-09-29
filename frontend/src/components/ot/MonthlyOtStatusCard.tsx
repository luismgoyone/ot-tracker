import React from 'react';
import { Box, Card, CardContent, LinearProgress, Typography } from '@mui/material';
import { useMyOtSummary } from '../../api/otRecords';

const MONTHLY_LIMIT = 40;

/** Approved OT this month against the monthly limit. */
export const MonthlyOtStatusCard: React.FC = () => {
  const { data } = useMyOtSummary();
  const hours = data?.approvedHoursThisMonth ?? 0;

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={1.5}>
          Current Month Status
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
          <Typography variant="caption" color="text.secondary">
            Approved OT
          </Typography>
          <Typography variant="caption" fontWeight={700} color="text.primary">
            {data ? `${Math.round(hours * 10) / 10} hrs` : '–'}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, (hours / MONTHLY_LIMIT) * 100)}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'tint.primary',
            '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 3 },
          }}
        />
        <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
          LIMIT: {MONTHLY_LIMIT} HRS / MONTH
        </Typography>
      </CardContent>
    </Card>
  );
};
