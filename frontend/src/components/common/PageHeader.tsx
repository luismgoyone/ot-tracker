import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={3}>
    <Box>
      <Typography variant="h5" fontWeight={700} color="text.primary">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {action}
  </Box>
);
