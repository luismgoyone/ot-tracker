import { ReactNode } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { AccessTime, Business, CalendarToday, Person } from '@mui/icons-material';
import { StatusChip } from '../common/StatusChip';
import { OtRecord, OtStatus } from '../../types';
import { formatDate, formatDuration, formatTime, fullName } from '../../utils/format';
import { ReviewActions } from './ReviewActions';
import { ReviewDecision } from './useReviewOtRecord';

interface OtRecordDetailsDialogProps {
  record: OtRecord | null;
  onClose: () => void;
  canReview: boolean;
  reviewing: boolean;
  onReview: (id: number, status: ReviewDecision) => void;
}

const Detail = ({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) => (
  <Box display="flex" alignItems="center" gap={1}>
    <Box sx={{ color: 'text.disabled', display: 'flex', '& svg': { fontSize: 20 } }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {children}
      </Typography>
    </Box>
  </Box>
);

const TextBlock = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
      {label}
    </Typography>
    <Typography variant="body2">{children}</Typography>
  </>
);

export const OtRecordDetailsDialog = ({ record, onClose, canReview, reviewing, onReview }: OtRecordDetailsDialogProps) => (
  <Dialog open={record !== null} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    {record && (
      <>
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>OT Record Details</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Detail icon={<Person />} label="Employee">
                {fullName(record.user)}
              </Detail>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Detail icon={<Business />} label="Department">
                {record.user?.department?.name}
              </Detail>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Detail icon={<CalendarToday />} label="Date">
                {formatDate(record.date, 'MMMM DD, YYYY')}
              </Detail>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Detail icon={<AccessTime />} label="Time">
                {formatTime(record.startTime)} - {formatTime(record.endTime)} ({formatDuration(record.duration)})
              </Detail>
            </Grid>
            <Grid item xs={12}>
              <TextBlock label="Reason">{record.reason}</TextBlock>
            </Grid>
            {record.comments && (
              <Grid item xs={12}>
                <TextBlock label="Comments">{record.comments}</TextBlock>
              </Grid>
            )}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Status:
                </Typography>
                <StatusChip status={record.status} />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          {canReview && (
            <ReviewActions
              size="medium"
              disabled={reviewing}
              onApprove={() => onReview(record.id, OtStatus.APPROVED)}
              onReject={() => onReview(record.id, OtStatus.REJECTED)}
            />
          )}
          <Button onClick={onClose} sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </>
    )}
  </Dialog>
);
