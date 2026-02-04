import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  PeopleOutline,
  AccessTimeOutlined,
  CheckCircleOutline,
  PendingActionsOutlined,
} from '@mui/icons-material';
import { useAnalyticsStore } from '../stores/analyticsStore';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, suffix = '' }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}{suffix}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: `${color}20`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              sx: { color, fontSize: 32 },
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const DashboardStats: React.FC = () => {
  const theme = useTheme();
  const { dashboardStats } = useAnalyticsStore();

  if (!dashboardStats) {
    return null;
  }

  const stats = [
    {
      title: 'Total Employees',
      value: dashboardStats.totalUsers,
      icon: <PeopleOutline />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Total OT Records',
      value: dashboardStats.totalOtRecords,
      icon: <AccessTimeOutlined />,
      color: theme.palette.info.main,
    },
    {
      title: 'Approved OTs',
      value: dashboardStats.approvedOtRecords,
      icon: <CheckCircleOutline />,
      color: theme.palette.success.main,
    },
    {
      title: 'Pending Approval',
      value: dashboardStats.pendingOtRecords,
      icon: <PendingActionsOutlined />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Total OT Hours',
      value: dashboardStats.totalOtHours.toFixed(1),
      icon: <AccessTimeOutlined />,
      color: theme.palette.secondary.main,
      suffix: ' hrs',
    },
    {
      title: 'Average OT Duration',
      value: dashboardStats.avgOtDuration.toFixed(1),
      icon: <AccessTimeOutlined />,
      color: theme.palette.error.main,
      suffix: ' hrs',
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Dashboard Overview
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
