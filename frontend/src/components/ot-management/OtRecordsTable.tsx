import { Box, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { StatusChip } from '../common/StatusChip';
import { UserAvatar } from '../common/UserAvatar';
import { OtStatus } from '../../types';
import { formatDate, formatDuration, fullName } from '../../utils/format';
import { ReviewActions } from './ReviewActions';
import { OtRecordsViewProps } from './types';

/** Desktop (md+) view of the OT records. */
export const OtRecordsTable = ({ records, canReview, isReviewing, onView, onReview }: OtRecordsViewProps) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Employee</TableCell>
          <TableCell>Department</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Duration</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Reason</TableCell>
          <TableCell align="center">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id} hover>
            <TableCell>
              <Box display="flex" alignItems="center" gap={1.5}>
                <UserAvatar firstName={record.user?.firstName} lastName={record.user?.lastName} colorKey={record.userId} />
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {fullName(record.user)}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Typography variant="body2" color="text.secondary">
                {record.user?.department?.name}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {formatDate(record.date)}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {formatDuration(record.duration)}
              </Typography>
            </TableCell>
            <TableCell>
              <StatusChip status={record.status} />
            </TableCell>
            <TableCell sx={{ maxWidth: 180 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={record.reason}
              >
                {record.reason}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Box display="flex" justifyContent="center" gap={0.5}>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    aria-label="View details"
                    onClick={() => onView(record)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
                {canReview(record) && (
                  <ReviewActions
                    variant="icon"
                    disabled={isReviewing(record.id)}
                    onApprove={() => onReview(record.id, OtStatus.APPROVED)}
                    onReject={() => onReview(record.id, OtStatus.REJECTED)}
                  />
                )}
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
