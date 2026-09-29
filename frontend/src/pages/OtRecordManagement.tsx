import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Card, CardContent, Snackbar } from '@mui/material';
import { SearchOff } from '@mui/icons-material';
import { useOtRecords } from '../api/otRecords';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { PaginationBar } from '../components/common/PaginationBar';
import { ErrorState, LoadingState } from '../components/common/QueryState';
import { OtRecordDetailsDialog } from '../components/ot-management/OtRecordDetailsDialog';
import { OtRecordFilters, StatusTab } from '../components/ot-management/OtRecordFilters';
import { OtRecordsList } from '../components/ot-management/OtRecordsList';
import { OtRecordsTable } from '../components/ot-management/OtRecordsTable';
import { useDebouncedValue } from '../components/ot-management/useDebouncedValue';
import { ReviewDecision, useReviewOtRecord } from '../components/ot-management/useReviewOtRecord';
import { OtRecord } from '../types';

const PAGE_SIZE = 10;

export const OtRecordManagement = () => {
  const [tab, setTab] = useState<StatusTab>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<OtRecord | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  // The page belongs to one tab + search; changing either starts again from page 1.
  const filterKey = `${tab}|${debouncedSearch}`;
  const [pageState, setPageState] = useState({ filterKey, page: 1 });
  const page = pageState.filterKey === filterKey ? pageState.page : 1;
  const setPage = useCallback((next: number) => setPageState({ filterKey, page: next }), [filterKey]);

  const { data, isPending, isError, error, refetch } = useOtRecords({
    page,
    limit: PAGE_SIZE,
    status: tab === 'all' ? undefined : tab,
    search: debouncedSearch || undefined,
  });
  const { review, canReview, isReviewing, error: reviewError, clearError } = useReviewOtRecord();

  // Deciding the last record on the last page (e.g. in "Pending") can leave the page empty.
  const totalPages = data?.meta.totalPages ?? 0;
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages, setPage]);

  const records = data?.data ?? [];
  // Prefer the freshest copy of the selected record after a refetch.
  const dialogRecord = selected ? (records.find((r) => r.id === selected.id) ?? selected) : null;

  const handleReview = async (id: number, status: ReviewDecision) => {
    const ok = await review(id, status);
    if (ok && selected?.id === id) setSelected(null);
  };

  const viewProps = { records, canReview, isReviewing, onView: setSelected, onReview: handleReview };

  const renderContent = () => {
    if (isPending) return <LoadingState height={240} />;
    if (isError && !data) return <ErrorState error={error} onRetry={() => refetch()} />;
    if (records.length === 0) {
      return (
        <EmptyState
          height={240}
          icon={<SearchOff sx={{ fontSize: 22, color: 'text.disabled' }} />}
          title="No records found"
          description={
            debouncedSearch
              ? `No OT records match "${debouncedSearch}". Try a different name, department or reason.`
              : 'There are no OT records in this view yet.'
          }
        />
      );
    }
    return (
      <>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <OtRecordsTable {...viewProps} />
        </Box>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <OtRecordsList {...viewProps} />
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="OT Management" subtitle="Review and manage overtime submissions across your departments." />

      <Card>
        <OtRecordFilters search={search} onSearchChange={setSearch} tab={tab} onTabChange={setTab} />
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {renderContent()}
          {data && records.length > 0 && <PaginationBar meta={data.meta} onPageChange={setPage} />}
        </CardContent>
      </Card>

      <OtRecordDetailsDialog
        record={dialogRecord}
        onClose={() => setSelected(null)}
        canReview={dialogRecord ? canReview(dialogRecord) : false}
        reviewing={dialogRecord ? isReviewing(dialogRecord.id) : false}
        onReview={handleReview}
      />

      <Snackbar
        open={reviewError !== null}
        autoHideDuration={6000}
        onClose={clearError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={clearError} sx={{ width: '100%' }}>
          {reviewError}
        </Alert>
      </Snackbar>
    </Box>
  );
};
