import React, { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Snackbar, Typography } from '@mui/material';
import { AccessTime, Add } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMyOtRecords } from '../api/otRecords';
import { OtRecord } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { PaginationBar } from '../components/common/PaginationBar';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState, LoadingState } from '../components/common/QueryState';
import { MyOtSummaryCards } from '../components/ot/MyOtSummaryCards';
import { MyOtTable } from '../components/ot/MyOtTable';
import { MyOtList } from '../components/ot/MyOtList';
import { DeleteOtRecordDialog } from '../components/ot/DeleteOtRecordDialog';

const PAGE_SIZE = 10;

export const MyOtRecords: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [recordToDelete, setRecordToDelete] = useState<OtRecord | null>(null);
  // A notice passed by the create page after a successful submission.
  const [notice, setNotice] = useState<string | null>(
    () => (location.state as { notice?: string } | null)?.notice ?? null,
  );
  const { data, isPending, isError, error, refetch } = useMyOtRecords(page, PAGE_SIZE);
  const records = data?.data ?? [];

  const goToCreate = () => navigate('/create-ot');

  const handleNoticeClose = () => {
    setNotice(null);
    navigate(location.pathname, { replace: true, state: null });
  };

  const handleDeleted = () => {
    setRecordToDelete(null);
    setNotice('OT request deleted.');
    // Step back if we just removed the only record on this page.
    if (records.length === 1 && page > 1) setPage((p) => p - 1);
  };

  const renderRecords = () => {
    if (isPending) return <LoadingState height={240} />;
    if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;
    if (records.length === 0) {
      return (
        <EmptyState
          height={280}
          icon={<AccessTime sx={{ fontSize: 22, color: 'text.disabled' }} />}
          title="No OT records found"
          description="You haven't submitted any overtime requests yet."
          action={
            <Button variant="contained" startIcon={<Add />} onClick={goToCreate}>
              Submit Your First OT Request
            </Button>
          }
        />
      );
    }
    return (
      <>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <MyOtTable records={records} onDelete={setRecordToDelete} />
        </Box>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <MyOtList records={records} onDelete={setRecordToDelete} />
        </Box>
        {data && <PaginationBar meta={data.meta} onPageChange={setPage} />}
      </>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="My OT Records"
        subtitle="Track and manage your overtime requests"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={goToCreate} sx={{ borderRadius: 2, flexShrink: 0 }}>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Submit New OT Request
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              New Request
            </Box>
          </Button>
        }
      />

      <MyOtSummaryCards />

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box px={2.5} py={2}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              Recent OT Submissions
            </Typography>
          </Box>
          {renderRecords()}
        </CardContent>
      </Card>

      <DeleteOtRecordDialog record={recordToDelete} onClose={() => setRecordToDelete(null)} onDeleted={handleDeleted} />

      <Snackbar open={notice !== null} autoHideDuration={4000} onClose={handleNoticeClose}>
        <Alert severity="success" variant="filled" onClose={handleNoticeClose}>
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  );
};
