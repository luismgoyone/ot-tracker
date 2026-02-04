import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { DashboardStats } from '../components/DashboardStats';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const SupervisorDashboard: React.FC = () => {
  const {
    departmentStats,
    monthlyStats,
    topUsers,
    otTrends,
    fetchDashboardStats,
    fetchDepartmentStats,
    fetchMonthlyStats,
    fetchTopUsers,
    fetchOtTrends,
  } = useAnalyticsStore();

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchDashboardStats(),
        fetchDepartmentStats(),
        fetchMonthlyStats(),
        fetchTopUsers(5),
        fetchOtTrends(30),
      ]);
    };

    fetchAllData();
  }, [fetchDashboardStats, fetchDepartmentStats, fetchMonthlyStats, fetchTopUsers, fetchOtTrends]);

  const monthlyData = monthlyStats.map(stat => ({
    month: monthNames[stat.month - 1] || 'Unknown',
    count: Number(stat.count) || 0,
    hours: Number(stat.totalHours) || 0,
  }));

  const departmentData = departmentStats.map(stat => ({
    name: stat.departmentName || 'Unknown',
    value: Number(stat.totalHours) || 0,
    count: Number(stat.count) || 0,
  }));

  const trendsData = otTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: Number(trend.count) || 0,
    hours: Number(trend.totalHours) || 0,
  }));

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Charts */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Monthly OT Statistics */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly OT Statistics
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="OT Count" />
                  <Bar dataKey="hours" fill="#82ca9d" name="Total Hours" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                OT Hours by Department
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} hrs`, 'Total Hours']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* OT Trends */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                OT Trends (Last 30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" name="Daily OT Count" />
                  <Line type="monotone" dataKey="hours" stroke="#82ca9d" name="Daily Hours" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top OT Users */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top OT Users
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell align="right">Hours</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topUsers.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.departmentName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {Number(user.totalHours || 0).toFixed(1)}h
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.count} records
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
