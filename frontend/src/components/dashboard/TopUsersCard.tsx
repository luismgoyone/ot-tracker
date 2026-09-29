import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { TrendingDown, TrendingFlat, TrendingUp } from '@mui/icons-material';
import { useTopUsers } from '../../api/analytics';
import { TopUser } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { DashboardCard } from './DashboardCard';
import { formatHours } from './chartTheme';

const LIMIT = 5;
const HEIGHT = 200;

const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return { firstName: parts[0] ?? '', lastName: parts.length > 1 ? parts[parts.length - 1] : '' };
};

/** Change in approved hours vs last month; "New" when there was nothing last month. */
const ChangeIndicator = ({ user }: { user: TopUser }) => {
  if (user.changePercent === null) {
    return (
      <Tooltip title="No approved OT last month">
        <Typography variant="caption" color="text.disabled" fontWeight={600}>
          New
        </Typography>
      </Tooltip>
    );
  }

  const { changePercent } = user;
  const color = changePercent > 0 ? 'success.main' : changePercent < 0 ? 'error.main' : 'text.secondary';
  const Icon = changePercent > 0 ? TrendingUp : changePercent < 0 ? TrendingDown : TrendingFlat;

  return (
    <Tooltip title={`Last month: ${formatHours(user.previousHours)}`}>
      <Box display="inline-flex" alignItems="center" justifyContent="flex-end" gap={0.25}>
        <Icon sx={{ fontSize: 14, color }} />
        <Typography variant="caption" color={color} fontWeight={600}>
          {changePercent > 0 ? '+' : ''}
          {changePercent}%
        </Typography>
      </Box>
    </Tooltip>
  );
};

/** Employees with the most approved OT hours this month. */
export const TopUsersCard = () => {
  const query = useTopUsers(LIMIT);
  const users = query.data ?? [];

  return (
    <DashboardCard
      title="Top OT Users"
      meta="This month"
      height={HEIGHT}
      query={query}
      isEmpty={users.length === 0}
      emptyDescription="No OT logged this month yet."
    >
      {() => (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell align="right">Hours</TableCell>
                <TableCell align="right">vs Last Month</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <UserAvatar {...splitName(user.name)} colorKey={user.userId} size={28} />
                      <Box minWidth={0}>
                        <Typography variant="caption" fontWeight={600} color="text.primary" display="block" noWrap>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }} noWrap>
                          {user.departmentName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" fontWeight={600} color="text.primary">
                      {formatHours(user.totalHours)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <ChangeIndicator user={user} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DashboardCard>
  );
};
