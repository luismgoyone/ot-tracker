import { ReactNode } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { EmptyState } from '../common/EmptyState';
import { ErrorState, LoadingState } from '../common/QueryState';

interface QueryStatus {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

interface DashboardCardProps {
  title: string;
  /** Shown to the right of the title. */
  meta?: ReactNode;
  /** Height of the body, so the card doesn't jump between states. */
  height: number;
  query: QueryStatus;
  isEmpty: boolean;
  emptyDescription: string;
  /** Rendered only once the query has non-empty data. */
  children: () => ReactNode;
}

/** A titled dashboard card that shows its query's loading, error and empty states. */
export const DashboardCard = ({ title, meta, height, query, isEmpty, emptyDescription, children }: DashboardCardProps) => {
  let body: ReactNode;
  if (query.isLoading) {
    body = <LoadingState height={height} />;
  } else if (query.isError) {
    body = (
      <Box height={height}>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Box>
    );
  } else if (isEmpty) {
    body = <EmptyState height={height} description={emptyDescription} />;
  } else {
    body = children();
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={1} mb={2}>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            {title}
          </Typography>
          {meta && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {meta}
            </Typography>
          )}
        </Box>
        {body}
      </CardContent>
    </Card>
  );
};
