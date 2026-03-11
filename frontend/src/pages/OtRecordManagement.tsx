import React, { useEffect, useState } from 'react';
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
  Tab,
  Tabs,
  InputAdornment,
  TextField,
  Avatar,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  AccessTime,
  CalendarToday,
  Person,
  Business,
  Search,
  FilterList,
  FileDownload,
} from '@mui/icons-material';
import { useOtStore } from '../stores/otStore';
import { OtRecord, OtStatus } from '../types';
import dayjs from 'dayjs';

const getStatusChip = (status: OtStatus) => {
  switch (status) {
    case OtStatus.APPROVED:
      return <Chip label="Approved" size="small" sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 700, border: 'none' }} />;
    case OtStatus.REJECTED:
      return <Chip label="Rejected" size="small" sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 700, border: 'none' }} />;
    case OtStatus.PENDING:
      return <Chip label="Pending" size="small" sx={{ bgcolor: '#FEF9C3', color: '#CA8A04', fontWeight: 700, border: 'none' }} />;
    default:
      return <Chip label={status} size="small" />;
  }
};

const formatDuration = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
};

const getInitials = (first?: string, last?: string) =>
  `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();

const AVATAR_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

interface DetailsDialogProps {
  record: OtRecord | null;
  open: boolean;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const DetailsDialog: React.FC<DetailsDialogProps> = ({ record, open, onClose, onApprove, onReject }) => {
  if (!record) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>OT Record Details</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <Person sx={{ color: '#94A3B8', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Employee</Typography>
                <Typography variant="body2" fontWeight={600}>{record.user?.firstName} {record.user?.lastName}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <Business sx={{ color: '#94A3B8', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Department</Typography>
                <Typography variant="body2" fontWeight={600}>{record.user?.department?.name}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarToday sx={{ color: '#94A3B8', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Date</Typography>
                <Typography variant="body2" fontWeight={600}>{dayjs(record.date).format('MMMM DD, YYYY')}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTime sx={{ color: '#94A3B8', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Time</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {record.startTime} - {record.endTime} ({formatDuration(Number(record.duration))})
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>Reason</Typography>
            <Typography variant="body2">{record.reason}</Typography>
          </Grid>
          {record.comments && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>Comments</Typography>
              <Typography variant="body2">{record.comments}</Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Status:</Typography>
              {getStatusChip(record.status)}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {record.status === OtStatus.PENDING && (
          <>
            <Button startIcon={<Cancel />} color="error" variant="outlined" sx={{ borderRadius: 2 }} onClick={() => onReject(record.id)}>
              Reject
            </Button>
            <Button startIcon={<CheckCircle />} variant="contained" sx={{ borderRadius: 2, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }} onClick={() => onApprove(record.id)}>
              Approve
            </Button>
          </>
        )}
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

type TabValue = 'all' | OtStatus;

export const OtRecordManagement: React.FC = () => {
  const { otRecords, fetchOtRecords, updateOtStatus } = useOtStore();
  const [selectedRecord, setSelectedRecord] = useState<OtRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOtRecords();
  }, [fetchOtRecords]);

  const handleViewDetails = (record: OtRecord) => { setSelectedRecord(record); setDetailsOpen(true); };
  const handleCloseDetails = () => { setDetailsOpen(false); setSelectedRecord(null); };
  const handleApprove = async (id: number) => { await updateOtStatus(id, OtStatus.APPROVED); handleCloseDetails(); };
  const handleReject = async (id: number) => { await updateOtStatus(id, OtStatus.REJECTED); handleCloseDetails(); };

  const filtered = otRecords.filter(r => {
    const matchTab = activeTab === 'all' || r.status === activeTab;
    const matchSearch = !search || [r.user?.firstName, r.user?.lastName, r.user?.department?.name, r.reason]
      .join(' ').toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const tabCounts = {
    all: otRecords.length,
    [OtStatus.PENDING]: otRecords.filter(r => r.status === OtStatus.PENDING).length,
    [OtStatus.APPROVED]: otRecords.filter(r => r.status === OtStatus.APPROVED).length,
    [OtStatus.REJECTED]: otRecords.filter(r => r.status === OtStatus.REJECTED).length,
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#1E293B">OT Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Review and manage overtime submissions across your departments.
          </Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <Button variant="outlined" startIcon={<FilterList />} sx={{ borderRadius: 2 }}>
            Filter
          </Button>
          <Button variant="contained" startIcon={<FileDownload />} sx={{ borderRadius: 2 }}>
            Export CSV
          </Button>
        </Box>
      </Box>

      <Card>
        {/* Search + Tabs */}
        <Box px={2.5} pt={2} pb={0}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search requests, employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: '#9CA3AF' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              maxWidth: 400,
              '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#F9FAFB' },
            }}
          />
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minHeight: 40, py: 0 },
              '& .MuiTabs-indicator': { bgcolor: '#6366F1' },
              '& .Mui-selected': { color: '#6366F1 !important' },
            }}
          >
            <Tab label={`All Requests (${tabCounts.all})`} value="all" />
            <Tab label={`Pending (${tabCounts[OtStatus.PENDING]})`} value={OtStatus.PENDING} />
            <Tab label={`Approved (${tabCounts[OtStatus.APPROVED]})`} value={OtStatus.APPROVED} />
            <Tab label={`Rejected (${tabCounts[OtStatus.REJECTED]})`} value={OtStatus.REJECTED} />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
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
                {filtered.map((record, index) => (
                  <TableRow key={record.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                          }}
                        >
                          {getInitials(record.user?.firstName, record.user?.lastName)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600} color="#1E293B">
                          {record.user?.firstName} {record.user?.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="#475569">{record.user?.department?.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="#1E293B">
                        {dayjs(record.date).format('MMM DD, YYYY')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="#1E293B">
                        {formatDuration(Number(record.duration))}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(record.status)}</TableCell>
                    <TableCell sx={{ maxWidth: 180 }}>
                      <Typography
                        variant="body2"
                        color="#475569"
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={record.reason}
                      >
                        {record.reason}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewDetails(record)} sx={{ color: '#6B7280' }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {record.status === OtStatus.PENDING && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                onClick={() => handleApprove(record.id)}
                                sx={{ color: '#10B981', '&:hover': { bgcolor: '#ECFDF5' } }}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                onClick={() => handleReject(record.id)}
                                sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary">No records found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box px={2.5} py={1.5} display="flex" justifyContent="space-between" alignItems="center" borderTop="1px solid #F1F5F9">
            <Typography variant="caption" color="text.secondary">
              Showing {filtered.length} of {otRecords.length} records
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <Button size="small" disabled sx={{ fontSize: '0.75rem' }}>Previous</Button>
              <Chip label="1" size="small" sx={{ bgcolor: '#6366F1', color: '#fff', fontWeight: 700, width: 28, height: 24 }} />
              <Button size="small" sx={{ fontSize: '0.75rem', color: '#6366F1' }}>Next</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <DetailsDialog
        record={selectedRecord}
        open={detailsOpen}
        onClose={handleCloseDetails}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </Box>
  );
};
