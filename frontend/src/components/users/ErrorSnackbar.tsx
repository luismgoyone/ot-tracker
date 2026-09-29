import { Alert, Snackbar } from '@mui/material';

/** Transient error toast for actions that have no dialog to show the message in. */
export const ErrorSnackbar = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <Snackbar
    open={!!message}
    autoHideDuration={6000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  >
    <Alert severity="error" variant="filled" onClose={onClose} sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
);
