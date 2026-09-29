import { Fragment } from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import { Edit, LockReset, PersonOff } from '@mui/icons-material';
import { RoleChip } from '../common/RoleChip';
import { UserAvatar } from '../common/UserAvatar';
import { fullName } from '../../utils/format';
import { UserStatusChip } from './UserStatusChip';
import { isUserActive, UserRowsProps } from './types';

const ACTION_SX = { fontSize: '0.75rem', color: 'text.secondary' };

/** Mobile layout of the user list. */
export const UsersList = ({
  users,
  currentUserId,
  togglingId,
  onEdit,
  onResetPassword,
  onToggleActive,
}: UserRowsProps) => (
  <>
    {users.map((user, index) => {
      const isActive = isUserActive(user);
      const isSelf = user.id === currentUserId;
      return (
        <Fragment key={user.id}>
          {index > 0 && <Divider />}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <UserAvatar firstName={user.firstName} lastName={user.lastName} colorKey={user.id} size={36} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
                  {fullName(user)}
                  {isSelf && ' (you)'}
                </Typography>
                <Typography variant="caption" color="text.disabled" noWrap component="div">
                  {user.email}
                </Typography>
              </Box>
              <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                <RoleChip role={user.role} />
                <Box mt={0.5}>
                  <UserStatusChip isActive={isActive} sx={{ height: 18, fontSize: '0.65rem' }} />
                </Box>
              </Box>
            </Box>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button size="small" startIcon={<Edit fontSize="small" />} onClick={() => onEdit(user)} sx={ACTION_SX}>
                Edit
              </Button>
              <Button
                size="small"
                startIcon={<LockReset fontSize="small" />}
                onClick={() => onResetPassword(user)}
                sx={ACTION_SX}
              >
                Reset
              </Button>
              {!isSelf && (
                <Button
                  size="small"
                  startIcon={<PersonOff fontSize="small" />}
                  disabled={togglingId === user.id}
                  onClick={() => onToggleActive(user)}
                  sx={{ fontSize: '0.75rem', color: isActive ? 'error.main' : 'success.main' }}
                >
                  {isActive ? 'Deactivate' : 'Activate'}
                </Button>
              )}
            </Box>
          </Box>
        </Fragment>
      );
    })}
  </>
);
