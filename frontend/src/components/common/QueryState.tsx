import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { getErrorMessage } from '../../api/client';

export const LoadingState = ({ height = 200 }: { height?: number }) => (
  <Box height={height} display="flex" alignItems="center" justifyContent="center">
    <CircularProgress size={28} />
  </Box>
);

/** Inline error with a retry button, for a failed query. */
export const ErrorState = ({ error, onRetry }: { error: unknown; onRetry?: () => void }) => (
  <Box p={2}>
    <Alert
      severity="error"
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      {getErrorMessage(error, 'Failed to load data.')}
    </Alert>
  </Box>
);
