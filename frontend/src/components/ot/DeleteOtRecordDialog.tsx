import React from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useDeleteOtRecord } from '../../api/otRecords';
import { getErrorMessage } from '../../api/client';
import { OtRecord } from '../../types';
import { formatDate, formatTime } from '../../utils/format';

interface DeleteOtRecordDialogProps {
  /** The record to delete; the dialog is open while this is set. */
  record: OtRecord | null;
  onClose: () => void;
  onDeleted: () => void;
}

/** Confirms deletion of a pending OT request. */
export const DeleteOtRecordDialog: React.FC<DeleteOtRecordDialogProps> = ({ record, onClose, onDeleted }) => {
  const deleteMutation = useDeleteOtRecord();

  const handleClose = () => {
    if (deleteMutation.isPending) return;
    deleteMutation.reset();
    onClose();
  };

  const handleConfirm = () => {
    if (!record) return;
    deleteMutation.mutate(record.id, {
      onSuccess: () => {
        deleteMutation.reset();
        onDeleted();
      },
    });
  };

  return (
    <Dialog open={record !== null} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Delete OT request?</DialogTitle>
      <DialogContent>
        {deleteMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getErrorMessage(deleteMutation.error, 'Failed to delete the OT request.')}
          </Alert>
        )}
        {record && (
          <DialogContentText variant="body2">
            Your pending request for {formatDate(record.date)} ({formatTime(record.startTime)} –{' '}
            {formatTime(record.endTime)}) will be permanently removed. This cannot be undone.
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={deleteMutation.isPending}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={handleConfirm} disabled={deleteMutation.isPending}>
          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
