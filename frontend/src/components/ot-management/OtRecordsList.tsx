import { Fragment } from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { StatusChip } from '../common/StatusChip';
import { UserAvatar } from '../common/UserAvatar';
import { OtStatus } from '../../types';
import { formatDate, formatDuration, fullName } from '../../utils/format';
import { ReviewActions } from './ReviewActions';
import { OtRecordsViewProps } from './types';

/** Mobile (below md) view of the OT records. */
export const OtRecordsList = ({ records, canReview, isReviewing, onView, onReview }: OtRecordsViewProps) => (
  <Box>
    {records.map((record, index) => (
      <Fragment key={record.id}>
        {index > 0 && <Divider />}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <UserAvatar
              firstName={record.user?.firstName}
              lastName={record.user?.lastName}
              colorKey={record.userId}
              size={36}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
                {fullName(record.user)}
              </Typography>
              <Typography variant="caption" color="text.disabled" noWrap component="p">
                {record.user?.department?.name} · {formatDate(record.date)}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
              <StatusChip status={record.status} />
              <Typography variant="caption" display="block" fontWeight={700} color="text.primary" mt={0.25}>
                {formatDuration(record.duration)}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button
              size="small"
              startIcon={<Visibility fontSize="small" />}
              onClick={() => onView(record)}
              sx={{ borderRadius: 2, fontSize: '0.75rem', color: 'text.secondary' }}
            >
              View
            </Button>
            {canReview(record) && (
              <ReviewActions
                disabled={isReviewing(record.id)}
                onApprove={() => onReview(record.id, OtStatus.APPROVED)}
                onReject={() => onReview(record.id, OtStatus.REJECTED)}
              />
            )}
          </Box>
        </Box>
      </Fragment>
    ))}
  </Box>
);
