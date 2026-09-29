import React from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { OtRecord, OtStatus } from '../../types';
import { formatDate, formatDuration, formatTime } from '../../utils/format';
import { StatusChip } from '../common/StatusChip';

interface MyOtListProps {
  records: OtRecord[];
  onDelete: (record: OtRecord) => void;
}

/** Mobile (xs–sm) card list of the user's OT records. */
export const MyOtList: React.FC<MyOtListProps> = ({ records, onDelete }) => (
  <Box>
    {records.map((record, idx) => (
      <React.Fragment key={record.id}>
        {idx > 0 && <Divider />}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Day badge */}
            <Box
              sx={{
                minWidth: 44,
                textAlign: 'center',
                bgcolor: 'tint.primary',
                borderRadius: 2,
                py: 0.75,
                px: 0.5,
              }}
            >
              <Typography variant="h6" fontWeight={700} color="primary.main" lineHeight={1}>
                {formatDate(record.date, 'DD')}
              </Typography>
              <Typography
                variant="caption"
                color="primary.main"
                lineHeight={1}
                sx={{ fontSize: '0.65rem', fontWeight: 600 }}
              >
                {formatDate(record.date, 'MMM').toUpperCase()}
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} color="text.primary" noWrap sx={{ mb: 0.25 }}>
                {record.reason}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {formatTime(record.startTime)} – {formatTime(record.endTime)}
              </Typography>
            </Box>

            {/* Duration + status */}
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 0.25 }}>
                {formatDuration(record.duration)}
              </Typography>
              <StatusChip status={record.status} />
            </Box>
          </Box>

          {record.status === OtStatus.PENDING && (
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteOutline fontSize="small" />}
                onClick={() => onDelete(record)}
                sx={{ fontSize: '0.75rem' }}
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>
      </React.Fragment>
    ))}
  </Box>
);
