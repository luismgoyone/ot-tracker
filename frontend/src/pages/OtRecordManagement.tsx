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
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  AccessTime,
  CalendarToday,
  Person,
  Business,
} from '@mui/icons-material';
import { useOtStore } from '../stores/otStore';
import { OtRecord, OtStatus } from '../types';
import dayjs from 'dayjs';

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

interface OtRecordDetailsDialogProps {
  record: OtRecord | null;
  open: boolean;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const OtRecordDetailsDialog: React.FC<OtRecordDetailsDialogProps> = ({
  record,
  open,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!record) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">OT Record Details</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <Person sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle2">Employee</Typography>
                <Typography variant="body1">
                  {record.user?.firstName} {record.user?.lastName}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <Business sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle2">Department</Typography>
                <Typography variant="body1">
                  {record.user?.department?.name}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle2">Date</Typography>
                <Typography variant="body1">
                  {dayjs(record.date).format('MMMM DD, YYYY')}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle2">Time</Typography>
                <Typography variant="body1">
                  {record.startTime} - {record.endTime} ({Number(record.duration).toFixed(1)}h)
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Reason
            </Typography>
            <Typography variant="body1" paragraph>
              {record.reason}
            </Typography>
          </Grid>
          {record.comments && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Comments
              </Typography>
              <Typography variant="body1" paragraph>
                {record.comments}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle2" sx={{ mr: 2 }}>
                Status:
              </Typography>
              <Chip
                label={record.status.toUpperCase()}
                color={getStatusColor(record.status)}
                size="small"
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {record.status === OtStatus.PENDING && (
          <>
            <Button
              startIcon={<Cancel />}
              color="error"
              onClick={() => onReject(record.id)}
            >
              Reject
            </Button>
            <Button
              startIcon={<CheckCircle />}
              variant="contained"
              color="success"
              onClick={() => onApprove(record.id)}
            >
              Approve
            </Button>
          </>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export const OtRecordManagement: React.FC = () => {
  const { otRecords, fetchOtRecords, updateOtStatus } = useOtStore();
  const [selectedRecord, setSelectedRecord] = React.useState<OtRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  useEffect(() => {
    fetchOtRecords();
  }, [fetchOtRecords]);

  const handleViewDetails = (record: OtRecord) => {
    setSelectedRecord(record);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedRecord(null);
  };

  const handleApprove = async (id: number) => {
    await updateOtStatus(id, OtStatus.APPROVED);
    handleCloseDetails();
  };

  const handleReject = async (id: number) => {
    await updateOtStatus(id, OtStatus.REJECTED);
    handleCloseDetails();
  };

  const handleQuickAction = async (id: number, status: OtStatus) => {
    await updateOtStatus(id, status);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        OT Record Management
      </Typography>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {otRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {record.user?.firstName} {record.user?.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.user?.department?.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(record.date).format('MMM DD, YYYY')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {record.startTime} - {record.endTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {Number(record.duration).toFixed(1)}h
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status.toUpperCase()}
                        color={getStatusColor(record.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {record.reason}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(record)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {record.status === OtStatus.PENDING && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleQuickAction(record.id, OtStatus.APPROVED)}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleQuickAction(record.id, OtStatus.REJECTED)}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <OtRecordDetailsDialog
        record={selectedRecord}
        open={detailsOpen}
        onClose={handleCloseDetails}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </Box>
  );
};
