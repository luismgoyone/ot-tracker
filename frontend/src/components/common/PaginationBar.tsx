import { Box, Button, Chip, Typography } from '@mui/material';
import { PaginationMeta } from '../../types';

export const PaginationBar = ({
  meta,
  onPageChange,
  noun = 'records',
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  noun?: string;
}) => {
  const { page, limit, total, totalPages } = meta;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <Box
      px={2.5}
      py={1.5}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderTop={1}
      borderColor="grey.100"
    >
      <Typography variant="caption" color="text.secondary">
        Showing {start}–{end} of {total} {noun}
      </Typography>
      <Box display="flex" gap={1} alignItems="center">
        <Button size="small" disabled={page <= 1} onClick={() => onPageChange(page - 1)} sx={{ fontSize: '0.75rem' }}>
          Previous
        </Button>
        <Chip
          label={`${page} / ${totalPages}`}
          size="small"
          color="primary"
          sx={{ fontWeight: 700, height: 24, fontSize: '0.7rem' }}
        />
        <Button
          size="small"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          sx={{ fontSize: '0.75rem' }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};
