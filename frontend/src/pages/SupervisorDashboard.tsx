import { Box, Grid } from '@mui/material';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { MonthlyOtChart } from '../components/dashboard/MonthlyOtChart';
import { DepartmentHoursChart } from '../components/dashboard/DepartmentHoursChart';
import { OtTrendsChart } from '../components/dashboard/OtTrendsChart';
import { TopUsersCard } from '../components/dashboard/TopUsersCard';

/** Approved-OT analytics for the supervisor's department (all departments for admins). */
export const SupervisorDashboard = () => (
  <Box sx={{ p: { xs: 2, md: 3 } }}>
    <Box mb={3}>
      <DashboardStats />
    </Box>

    <Grid container spacing={2.5} mb={2.5}>
      <Grid item xs={12} lg={8}>
        <MonthlyOtChart />
      </Grid>
      <Grid item xs={12} lg={4}>
        <DepartmentHoursChart />
      </Grid>
    </Grid>

    <Grid container spacing={2.5}>
      <Grid item xs={12} lg={8}>
        <OtTrendsChart />
      </Grid>
      <Grid item xs={12} lg={4}>
        <TopUsersCard />
      </Grid>
    </Grid>
  </Box>
);
