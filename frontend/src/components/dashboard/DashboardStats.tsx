import { ReactElement } from 'react';
import { Card, Grid } from '@mui/material';
import {
  AccessTimeOutlined,
  CheckCircleOutline,
  DescriptionOutlined,
  PendingActionsOutlined,
  PeopleOutline,
  TimelapseOutlined,
} from '@mui/icons-material';
import { useDashboardStats } from '../../api/analytics';
import { StatCard } from '../common/StatCard';
import { ErrorState, LoadingState } from '../common/QueryState';
import { formatDuration } from '../../utils/format';
import { formatHours } from './chartTheme';

interface Stat {
  label: string;
  value: string | number;
  icon: ReactElement;
  tone: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

/** Headline numbers for the supervisor's department (all departments for admins). */
export const DashboardStats = () => {
  const { data, isLoading, isError, error, refetch } = useDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <LoadingState height={96} />
      </Card>
    );
  }
  if (isError || !data) {
    return (
      <Card>
        <ErrorState error={error} onRetry={() => refetch()} />
      </Card>
    );
  }

  const stats: Stat[] = [
    { label: 'Active Employees', value: data.totalUsers, icon: <PeopleOutline />, tone: 'primary' },
    { label: 'OT Records (All)', value: data.totalOtRecords, icon: <DescriptionOutlined />, tone: 'info' },
    { label: 'Approved Records', value: data.approvedOtRecords, icon: <CheckCircleOutline />, tone: 'success' },
    { label: 'Pending Approval', value: data.pendingOtRecords, icon: <PendingActionsOutlined />, tone: 'warning' },
    { label: 'Approved OT Hours', value: formatHours(data.totalOtHours), icon: <AccessTimeOutlined />, tone: 'secondary' },
    {
      label: 'Avg per Approved OT',
      value: formatDuration(data.avgOtDuration),
      icon: <TimelapseOutlined />,
      tone: 'primary',
    },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={stat.label}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};
