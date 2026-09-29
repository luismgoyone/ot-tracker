import React, { useMemo, useState } from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import { PersonAdd, PersonSearch } from '@mui/icons-material';
import { useDepartments, useUpdateUser, useUsers } from '../api/users';
import { getErrorMessage } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState, LoadingState } from '../components/common/QueryState';
import { ErrorSnackbar } from '../components/users/ErrorSnackbar';
import { UserSearchField } from '../components/users/UserSearchField';
import { UserStats } from '../components/users/UserStats';
import { UsersTable } from '../components/users/UsersTable';
import { UsersList } from '../components/users/UsersList';
import { AddUserDialog } from '../components/users/AddUserDialog';
import { EditUserDialog } from '../components/users/EditUserDialog';
import { ResetPasswordDialog } from '../components/users/ResetPasswordDialog';
import { isUserActive, UserRowsProps } from '../components/users/types';
import { User } from '../types';

export const UserManagement: React.FC = () => {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const usersQuery = useUsers();
  const { data: departments = [] } = useDepartments();
  const updateUser = useUpdateUser();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [toggleError, setToggleError] = useState('');

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) =>
      [u.firstName, u.lastName, u.email, u.department?.name].join(' ').toLowerCase().includes(term),
    );
  }, [users, search]);

  const handleToggleActive = (user: User) => {
    updateUser
      .mutateAsync({ id: user.id, data: { isActive: !isUserActive(user) } })
      .catch((err) => setToggleError(getErrorMessage(err, 'Failed to update user status')));
  };

  const rowProps: UserRowsProps = {
    users: filtered,
    currentUserId,
    togglingId: updateUser.isPending ? updateUser.variables?.id : undefined,
    onEdit: setEditUser,
    onResetPassword: setResetUser,
    onToggleActive: handleToggleActive,
  };

  const renderUsers = () => {
    if (usersQuery.isLoading) return <LoadingState />;
    if (usersQuery.isError) return <ErrorState error={usersQuery.error} onRetry={() => usersQuery.refetch()} />;
    if (filtered.length === 0) {
      return (
        <EmptyState
          height={200}
          title="No users found"
          description={search ? 'Try a different name, email or department.' : 'Add a user to get started.'}
          icon={<PersonSearch sx={{ fontSize: 22, color: 'text.disabled' }} />}
        />
      );
    }
    return (
      <>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <UsersTable {...rowProps} />
        </Box>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <UsersList {...rowProps} />
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Users"
        subtitle="Manage employee access and organizational roles."
        action={
          <Button variant="contained" startIcon={<PersonAdd fontSize="small" />} onClick={() => setAddOpen(true)}>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Add User
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Add
            </Box>
          </Button>
        }
      />

      <UserStats users={users} />

      <Card>
        <Box px={2.5} pt={2}>
          <UserSearchField value={search} onChange={setSearch} />
        </Box>
        {renderUsers()}
        <Box px={2.5} py={1.5} borderTop={1} borderColor="grey.100">
          <Typography variant="caption" color="text.secondary">
            Showing {filtered.length} of {users.length} users
          </Typography>
        </Box>
      </Card>

      <AddUserDialog open={addOpen} onClose={() => setAddOpen(false)} departments={departments} />
      <EditUserDialog
        user={editUser}
        currentUserId={currentUserId}
        onClose={() => setEditUser(null)}
        departments={departments}
      />
      <ResetPasswordDialog user={resetUser} onClose={() => setResetUser(null)} />
      <ErrorSnackbar message={toggleError} onClose={() => setToggleError('')} />
    </Box>
  );
};
