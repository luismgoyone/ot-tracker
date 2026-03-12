import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add,
  AccessTime,
  FilterList,
  FileDownload,
  Assignment,
  CheckCircleOutline,
  HourglassEmpty,
  CalendarMonth,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useOtStore } from '../stores/otStore';
import { OtStatus } from '../types';

const getStatusChip = (status: OtStatus) => {
  switch (status) {
    case OtStatus.APPROVED:
      return (
        <Chip
          label="Approved"
          size="small"
          sx={{
            bgcolor: '#DCFCE7',
            color: '#16A34A',
            fontWeight: 700,
            border: 'none',
          }}
        />
      );
    case OtStatus.REJECTED:
      return (
        <Chip
          label="Rejected"
          size="small"
          sx={{
            bgcolor: '#FEE2E2',
            color: '#DC2626',
            fontWeight: 700,
            border: 'none',
          }}
        />
      );
    case OtStatus.PENDING:
      return (
        <Chip
          label="Pending"
          size="small"
          sx={{
            bgcolor: '#FEF9C3',
            color: '#CA8A04',
            fontWeight: 700,
            border: 'none',
          }}
        />
      );
    default:
      return <Chip label={status} size="small" />;
  }
};

const formatDuration = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
};

export const MyOtRecords: React.FC = () => {
  const navigate = useNavigate();
  const { myOtRecords, fetchMyOtRecords, isLoading, error } = useOtStore();

  useEffect(() => {
    fetchMyOtRecords();
  }, [fetchMyOtRecords]);

  if (isLoading) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Loading OT records...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="error" gutterBottom>
              Error loading OT records
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error}
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => fetchMyOtRecords()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const totalRecords = myOtRecords.length;
  const pendingRecords = myOtRecords.filter(
    (r) => r.status === OtStatus.PENDING,
  ).length;
  const totalHours = myOtRecords
    .filter((r) => r.status === OtStatus.APPROVED)
    .reduce((sum, r) => sum + Number(r.duration || 0), 0);
  const currentMonthHours = myOtRecords
    .filter(
      (r) =>
        r.status === OtStatus.APPROVED &&
        dayjs(r.date).isSame(dayjs(), 'month'),
    )
    .reduce((sum, r) => sum + Number(r.duration || 0), 0);

  const statCards = [
    {
      label: 'TOTAL REQUESTS',
      value: totalRecords,
      icon: <Assignment sx={{ fontSize: 18, color: '#6366F1' }} />,
      iconBg: '#EEF2FF',
    },
    {
      label: 'PENDING',
      value: pendingRecords,
      icon: <HourglassEmpty sx={{ fontSize: 18, color: '#F59E0B' }} />,
      iconBg: '#FFFBEB',
    },
    {
      label: 'APPROVED HOURS',
      value: `${Math.round(totalHours)}h`,
      icon: <CheckCircleOutline sx={{ fontSize: 18, color: '#10B981' }} />,
      iconBg: '#ECFDF5',
    },
    {
      label: 'THIS MONTH',
      value: `${Math.round(currentMonthHours)}h`,
      icon: <CalendarMonth sx={{ fontSize: 18, color: '#3B82F6' }} />,
      iconBg: '#EFF6FF',
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="#1E293B">
            My OT Records
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Track and manage your overtime requests
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/create-ot')}
          sx={{ borderRadius: 2, flexShrink: 0 }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Submit New OT Request
          </Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
            New Request
          </Box>
        </Button>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} mb={3}>
        {statCards.map((card, idx) => (
          <Grid item xs={6} sm={3} key={idx}>
            <Card>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ letterSpacing: '0.05em', fontSize: '0.65rem' }}
                  >
                    {card.label}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: card.iconBg,
                      borderRadius: 1.5,
                      p: 0.5,
                      display: 'flex',
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={700} color="#1E293B">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={2.5}
            py={2}
          >
            <Typography variant="subtitle1" fontWeight={700} color="#1E293B">
              Recent OT Submissions
            </Typography>
            <Box display="flex" gap={1}>
              <Tooltip title="Filter">
                <IconButton size="small" sx={{ color: '#6B7280' }}>
                  <FilterList fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton size="small" sx={{ color: '#6B7280' }}>
                  <FileDownload fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {myOtRecords.length === 0 ? (
            <Box textAlign="center" py={6}>
              <AccessTime sx={{ fontSize: 48, color: '#D1D5DB', mb: 1.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No OT records found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2.5}>
                You haven't submitted any overtime requests yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/create-ot')}
              >
                Submit Your First OT Request
              </Button>
            </Box>
          ) : (
            <>
              {/* Desktop table */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Time Period</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Submitted</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myOtRecords.map((record) => (
                        <TableRow
                          key={record.id}
                          sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}
                        >
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="#1E293B"
                            >
                              {dayjs(record.date).format('MMM DD, YYYY')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#475569">
                              {record.startTime} - {record.endTime}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="#1E293B"
                            >
                              {formatDuration(Number(record.duration || 0))}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 260 }}>
                            <Typography
                              variant="body2"
                              color="#475569"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={record.reason}
                            >
                              {record.reason}
                            </Typography>
                          </TableCell>
                          <TableCell>{getStatusChip(record.status)}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#6B7280">
                              {dayjs(record.createdAt).format('MMM DD, YYYY')}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile card list */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {myOtRecords.map((record, idx) => (
                  <React.Fragment key={record.id}>
                    {idx > 0 && <Divider />}
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      {/* Day badge */}
                      <Box
                        sx={{
                          minWidth: 44,
                          textAlign: 'center',
                          bgcolor: '#EEF2FF',
                          borderRadius: 2,
                          py: 0.75,
                          px: 0.5,
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="#6366F1"
                          lineHeight={1}
                        >
                          {dayjs(record.date).format('DD')}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="#6366F1"
                          lineHeight={1}
                          sx={{ fontSize: '0.65rem', fontWeight: 600 }}
                        >
                          {dayjs(record.date).format('MMM').toUpperCase()}
                        </Typography>
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="#1E293B"
                          noWrap
                          sx={{ mb: 0.25 }}
                        >
                          {record.reason}
                        </Typography>
                        <Typography variant="caption" color="#94A3B8">
                          {record.startTime} – {record.endTime}
                        </Typography>
                      </Box>

                      {/* Right: duration + status */}
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="#1E293B"
                          sx={{ mb: 0.25 }}
                        >
                          {formatDuration(Number(record.duration || 0))}
                        </Typography>
                        {getStatusChip(record.status)}
                      </Box>
                    </Box>
                  </React.Fragment>
                ))}
              </Box>

              <Box
                px={2.5}
                py={1.5}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderTop="1px solid #F1F5F9"
              >
                <Typography variant="caption" color="text.secondary">
                  Showing 1 to {myOtRecords.length} of {myOtRecords.length}{' '}
                  records
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    disabled
                    sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}
                  >
                    Previous
                  </Button>
                  <Button
                    size="small"
                    disabled
                    sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
