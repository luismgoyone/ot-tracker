import React from 'react';
import { Box, Typography } from '@mui/material';
import { InsertChartOutlined } from '@mui/icons-material';

interface EmptyStateProps {
  height: number;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  height,
  title = 'No data yet',
  description = 'Data will appear here once OT records are submitted.',
  icon = <InsertChartOutlined sx={{ fontSize: 22, color: 'text.disabled' }} />,
  action,
}) => (
  <Box
    height={height}
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    textAlign="center"
    gap={1}
    px={2}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        bgcolor: 'grey.100',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </Box>
    <Typography variant="body2" fontWeight={600} color="text.primary">
      {title}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 280 }}>
      {description}
    </Typography>
    {action && <Box mt={1}>{action}</Box>}
  </Box>
);
