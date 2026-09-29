import React from 'react';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { OtRecord, OtStatus } from '../../types';
import { formatDate, formatDuration, formatTime } from '../../utils/format';
import { StatusChip } from '../common/StatusChip';

interface MyOtTableProps {
  records: OtRecord[];
  onDelete: (record: OtRecord) => void;
}

/** Desktop (md+) view of the user's OT records. */
export const MyOtTable: React.FC<MyOtTableProps> = ({ records, onDelete }) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Time Period</TableCell>
          <TableCell>Duration</TableCell>
          <TableCell>Reason</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Submitted</TableCell>
          <TableCell align="right" aria-label="Actions" />
        </TableRow>
      </TableHead>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id} hover>
            <TableCell>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {formatDate(record.date)}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" color="text.secondary">
                {formatTime(record.startTime)} - {formatTime(record.endTime)}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {formatDuration(record.duration)}
              </Typography>
            </TableCell>
            <TableCell sx={{ maxWidth: 260 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={record.reason}
              >
                {record.reason}
              </Typography>
            </TableCell>
            <TableCell>
              <StatusChip status={record.status} />
            </TableCell>
            <TableCell>
              <Typography variant="body2" color="text.secondary">
                {formatDate(record.createdAt)}
              </Typography>
            </TableCell>
            <TableCell align="right" sx={{ width: 56 }}>
              {record.status === OtStatus.PENDING && (
                <Tooltip title="Delete request">
                  <IconButton
                    size="small"
                    aria-label="Delete request"
                    onClick={() => onDelete(record)}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
