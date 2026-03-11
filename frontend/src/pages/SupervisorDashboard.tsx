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
  Avatar,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { DashboardStats } from '../components/DashboardStats';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const AVATAR_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981'];

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
    Promise.all([
      fetchDashboardStats(),
      fetchDepartmentStats(),
      fetchMonthlyStats(),
      fetchTopUsers(5),
      fetchOtTrends(30),
    ]);
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

  const totalDeptHours = departmentData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Stat Cards */}
      <Box mb={3}>
        <DashboardStats />
      </Box>

      {/* Charts Row 1 */}
      <Grid container spacing={2.5} mb={2.5}>
        {/* Monthly Bar Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={700} color="#1E293B">
                  Monthly OT Statistics
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last 6 Months
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData} barSize={18} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
                  />
                  <Bar dataKey="count" fill="#6366F1" name="OT Count" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hours" fill="#C4B5FD" name="Total Hours" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Donut Chart */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} color="#1E293B" mb={2}>
                OT Hours by Dept
              </Typography>
              <Box position="relative" display="flex" justifyContent="center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {departmentData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} hrs`, 'Total Hours']} />
                  </PieChart>
                </ResponsiveContainer>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="#1E293B">
                    {totalDeptHours.toFixed(1)}k
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Hours
                  </Typography>
                </Box>
              </Box>
              <Box mt={1}>
                {departmentData.slice(0, 3).map((dept, index) => {
                  const pct = totalDeptHours > 0 ? Math.round((dept.value / totalDeptHours) * 100) : 0;
                  return (
                    <Box key={index} display="flex" alignItems="center" justifyContent="space-between" py={0.5}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length] }} />
                        <Typography variant="caption" color="#475569">{dept.name}</Typography>
                      </Box>
                      <Typography variant="caption" fontWeight={600} color="#1E293B">{pct}%</Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={2.5}>
        {/* Trends Line Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={700} color="#1E293B">
                  OT Trends (Last 30 Days)
                </Typography>
                <Chip label="Active" size="small" sx={{ bgcolor: '#ECFDF5', color: '#10B981', fontWeight: 600 }} />
              </Box>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    dot={false}
                    name="Daily Hours"
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#C4B5FD"
                    strokeWidth={2}
                    dot={false}
                    name="Daily Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Users */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} color="#1E293B" mb={2}>
                Top OT Users (This Month)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell align="right">Hours</TableCell>
                      <TableCell align="right">Trend</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topUsers.map((user, index) => {
                      const trend = index % 2 === 0 ? '+12%' : '-4%';
                      const trendUp = index % 2 === 0;
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  fontSize: '0.65rem',
                                  bgcolor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                                  fontWeight: 700,
                                }}
                              >
                                {getInitials(user.name)}
                              </Avatar>
                              <Box>
                                <Typography variant="caption" fontWeight={600} color="#1E293B" display="block">
                                  {user.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                  {user.departmentName}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" fontWeight={600} color="#1E293B">
                              {Number(user.totalHours || 0).toFixed(1)}h
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.25}>
                              {trendUp ? (
                                <TrendingUp sx={{ fontSize: 14, color: '#10B981' }} />
                              ) : (
                                <TrendingDown sx={{ fontSize: 14, color: '#EF4444' }} />
                              )}
                              <Typography variant="caption" color={trendUp ? 'success.main' : 'error.main'} fontWeight={600}>
                                {trend}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>
                              Review
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
