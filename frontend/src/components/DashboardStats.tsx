import React from 'react';
import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
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
  iconBg: string;
  iconColor: string;
  suffix?: string;
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconBg, iconColor, suffix = '', trend }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} color="#1E293B" mt={0.5} lineHeight={1}>
              {value}{suffix}
            </Typography>
            {trend && (
              <Typography variant="caption" color={trend.startsWith('+') ? 'success.main' : 'error.main'} fontWeight={600}>
                {trend}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: iconBg,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              sx: { color: iconColor, fontSize: 22 },
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const DashboardStats: React.FC = () => {
  const { dashboardStats } = useAnalyticsStore();

  if (!dashboardStats) return null;

  const stats: StatCardProps[] = [
    {
      title: 'Total Employees',
      value: dashboardStats.totalUsers,
      icon: <PeopleOutline />,
      iconBg: '#EEF2FF',
      iconColor: '#6366F1',
      trend: '+2.8%',
      trendUp: true,
    },
    {
      title: 'Total OT Records',
      value: dashboardStats.totalOtRecords,
      icon: <AccessTimeOutlined />,
      iconBg: '#EFF6FF',
      iconColor: '#3B82F6',
      trend: '-1.2%',
      trendUp: false,
    },
    {
      title: 'Approved OTs',
      value: dashboardStats.approvedOtRecords,
      icon: <CheckCircleOutline />,
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      trend: '+6.8%',
      trendUp: true,
    },
    {
      title: 'Pending Approval',
      value: dashboardStats.pendingOtRecords,
      icon: <PendingActionsOutlined />,
      iconBg: '#FFFBEB',
      iconColor: '#F59E0B',
    },
    {
      title: 'Total OT Hours',
      value: dashboardStats.totalOtHours.toFixed(1),
      icon: <AccessTimeOutlined />,
      iconBg: '#F5F3FF',
      iconColor: '#8B5CF6',
      suffix: 'h',
      trend: '+2.8%',
      trendUp: true,
    },
    {
      title: 'Avg OT Duration',
      value: dashboardStats.avgOtDuration.toFixed(1),
      icon: <AccessTimeOutlined />,
      iconBg: '#FEF2F2',
      iconColor: '#EF4444',
      suffix: 'h',
    },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};
