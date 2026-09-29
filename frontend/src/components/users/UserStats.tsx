import { Grid } from '@mui/material';
import { AdminPanelSettings, CheckCircle, People, SupervisorAccount } from '@mui/icons-material';
import { StatCard } from '../common/StatCard';
import { User, UserRole } from '../../types';
import { isUserActive } from './types';

export const UserStats = ({ users }: { users: User[] }) => {
  const stats = [
    { label: 'Total Users', value: users.length, icon: <People />, tone: 'primary' as const },
    { label: 'Active', value: users.filter(isUserActive).length, icon: <CheckCircle />, tone: 'success' as const },
    {
      label: 'Supervisors',
      value: users.filter((u) => u.role === UserRole.SUPERVISOR).length,
      icon: <SupervisorAccount />,
      tone: 'secondary' as const,
    },
    {
      label: 'Admins',
      value: users.filter((u) => u.role === UserRole.ADMIN).length,
      icon: <AdminPanelSettings />,
      tone: 'warning' as const,
    },
  ];

  return (
    <Grid container spacing={2} mb={3}>
      {stats.map((stat) => (
        <Grid item xs={6} md={3} key={stat.label}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};
