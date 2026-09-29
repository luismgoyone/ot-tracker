import { Box, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { Edit, LockReset, PersonOff } from '@mui/icons-material';
import { RoleChip } from '../common/RoleChip';
import { UserAvatar } from '../common/UserAvatar';
import { fullName } from '../../utils/format';
import { UserStatusChip } from './UserStatusChip';
import { isUserActive, UserRowsProps } from './types';

/** Desktop layout of the user list. */
export const UsersTable = ({
  users,
  currentUserId,
  togglingId,
  onEdit,
  onResetPassword,
  onToggleActive,
}: UserRowsProps) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Department</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="center">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => {
          const isActive = isUserActive(user);
          const isSelf = user.id === currentUserId;
          return (
            <TableRow key={user.id} hover>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <UserAvatar firstName={user.firstName} lastName={user.lastName} colorKey={user.id} />
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {fullName(user)}
                    {isSelf && (
                      <Typography component="span" variant="caption" color="text.disabled" ml={0.75}>
                        (you)
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {user.department?.name ?? '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <RoleChip role={user.role} />
              </TableCell>
              <TableCell>
                <UserStatusChip isActive={isActive} />
              </TableCell>
              <TableCell align="center">
                <Box display="flex" justifyContent="center" gap={0.5}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(user)} sx={{ color: 'text.secondary' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset Password">
                    <IconButton size="small" onClick={() => onResetPassword(user)} sx={{ color: 'text.secondary' }}>
                      <LockReset fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={isSelf ? "You can't deactivate yourself" : isActive ? 'Deactivate' : 'Activate'}>
                    {/* The span keeps the tooltip working while the button is disabled. */}
                    <span>
                      <IconButton
                        size="small"
                        disabled={isSelf || togglingId === user.id}
                        onClick={() => onToggleActive(user)}
                        sx={{
                          color: isActive ? 'error.main' : 'success.main',
                          '&:hover': { bgcolor: isActive ? 'tint.error' : 'tint.success' },
                        }}
                      >
                        <PersonOff fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
);
