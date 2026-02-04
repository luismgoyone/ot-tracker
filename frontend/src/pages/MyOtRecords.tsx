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
  Paper,
  Divider,
} from '@mui/material';
import {
  Add,
  AccessTime,
  CheckCircle,
  Pending,
  Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useOtStore } from '../stores/otStore';
import { OtStatus } from '../types';

const getStatusColor = (status: OtStatus): 'success' | 'error' | 'warning' | 'default' => {
  switch (status) {
    case OtStatus.APPROVED:
      return 'success';
    case OtStatus.REJECTED:
      return 'error';
    case OtStatus.PENDING:
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: OtStatus): React.ReactElement | null => {
  switch (status) {
    case OtStatus.APPROVED:
      return <CheckCircle fontSize="small" />;
    case OtStatus.REJECTED:
      return <Cancel fontSize="small" />;
    case OtStatus.PENDING:
      return <Pending fontSize="small" />;
    default:
      return null;
  }
};

export const MyOtRecords: React.FC = () => {
  console.log('MyOtRecords component rendering...');
  
  try {
    const navigate = useNavigate();
    const { myOtRecords, fetchMyOtRecords, isLoading, error } = useOtStore();

    console.log('MyOtRecords state:', { myOtRecords, isLoading, error });

    useEffect(() => {
      console.log('MyOtRecords useEffect running, calling fetchMyOtRecords...');
      fetchMyOtRecords();
    }, [fetchMyOtRecords]);

    // Show loading state
    if (isLoading) {
      console.log('MyOtRecords showing loading state');
      return (
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Typography variant="h6">Loading OT records...</Typography>
        </Box>
      );
    }

    // Show error state
    if (error) {
      console.log('MyOtRecords showing error state:', error);
      return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
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

    console.log('MyOtRecords showing main content with records:', myOtRecords.length);

  // Calculate summary stats
  const totalRecords = myOtRecords.length;
  const pendingRecords = myOtRecords.filter(record => record.status === OtStatus.PENDING).length;
  const totalHours = myOtRecords
    .filter(record => record.status === OtStatus.APPROVED)
    .reduce((sum, record) => sum + Number(record.duration || 0), 0);

  const currentMonthRecords = myOtRecords.filter(record => 
    dayjs(record.date).isSame(dayjs(), 'month')
  );
  const currentMonthHours = currentMonthRecords
    .filter(record => record.status === OtStatus.APPROVED)
    .reduce((sum, record) => sum + Number(record.duration || 0), 0);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          My OT Records
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/create-ot')}
        >
          Submit New OT Request
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {totalRecords}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Requests
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {pendingRecords}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Approval
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {totalHours.toFixed(1)}h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Approved Hours
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {currentMonthHours.toFixed(1)}h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This Month
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* OT Records Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent OT Requests
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {myOtRecords.length === 0 ? (
            <Box textAlign="center" py={4}>
              <AccessTime sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No OT records found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
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
                    <TableRow key={record.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {dayjs(record.date).format('MMM DD, YYYY')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.startTime} - {record.endTime}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {Number(record.duration || 0).toFixed(1)}h
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography
                          variant="body2"
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
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(record.status) || undefined}
                          label={record.status.toUpperCase()}
                          color={getStatusColor(record.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {dayjs(record.createdAt).format('MMM DD, YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(record.createdAt).format('HH:mm')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
  } catch (error) {
    console.error('MyOtRecords render error:', error);
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="error" gutterBottom>
              Component Error
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Something went wrong: {error instanceof Error ? error.message : 'Unknown error'}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }
};
