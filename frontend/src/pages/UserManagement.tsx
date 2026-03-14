import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Divider,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Edit,
  LockReset,
  PersonOff,
  PersonAdd,
  Search,
  CheckCircle,
} from '@mui/icons-material';
import { useUserManagementStore } from '../stores/userManagementStore';
import { apiClient } from '../utils/apiClient';
import { User, UserRole, Department, UpdateUserPayload } from '../types';
import { AddUserDialog, AddUserFormData } from '../components/AddUserDialog';

const EMPTY_ADD_FORM: AddUserFormData = {
  fullName: '',
  email: '',
  temporaryPassword: '',
  role: '',
  departmentId: 0,
};

const AVATAR_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const getRoleChip = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN:
      return <Chip label="Admin" size="small" sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 700, border: 'none' }} />;
    case UserRole.SUPERVISOR:
      return <Chip label="Supervisor" size="small" sx={{ bgcolor: '#EEF2FF', color: '#6366F1', fontWeight: 700, border: 'none' }} />;
    default:
      return <Chip label="Employee" size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700, border: 'none' }} />;
  }
};

// ── Stat cards ──────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  bg: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, bg }) => (
  <Card sx={{ flex: 1, minWidth: 140 }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.05em" textTransform="uppercase">
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ color, mt: 0.5 }}>{value}</Typography>
      <Box sx={{ width: 32, height: 4, bgcolor: bg, borderRadius: 2, mt: 1 }} />
    </CardContent>
  </Card>
);

// ── Edit User Dialog ─────────────────────────────────────────────────────────

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  departments: Department[];
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, open, onClose, departments }) => {
  const { updateUser } = useUserManagementStore();
  const [form, setForm] = useState<UpdateUserPayload>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName, lastName: user.lastName, role: user.role, departmentId: user.departmentId, isActive: user.isActive });
    }
  }, [user]);

  const handleClose = () => { setError(''); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      await updateUser(user.id, form);
      handleClose();
    } catch {
      setError('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>Edit User</Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="First Name" size="small" value={form.firstName || ''} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Last Name" size="small" value={form.lastName || ''} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel>Role</InputLabel>
                <Select label="Role" value={form.role || ''} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}>
                  <MenuItem value={UserRole.REGULAR}>Employee</MenuItem>
                  <MenuItem value={UserRole.SUPERVISOR}>Supervisor</MenuItem>
                  <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel>Department</InputLabel>
                <Select label="Department" value={form.departmentId || ''} onChange={(e) => setForm((p) => ({ ...p, departmentId: Number(e.target.value) }))}>
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={handleClose} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading} sx={{ borderRadius: 2 }}>Save Changes</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// ── Reset Password Confirm Dialog ────────────────────────────────────────────

interface ResetPasswordDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ user, open, onClose }) => {
  const { resetUserPassword } = useUserManagementStore();
  const [tempPassword, setTempPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleClose = () => { setTempPassword(''); setDone(false); onClose(); };

  const handleReset = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const pw = await resetUserPassword(user.id);
      setTempPassword(pw);
      setDone(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>Reset Password</Typography>
      </DialogTitle>
      <DialogContent>
        {done ? (
          <>
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2, borderRadius: 2 }}>
              Password reset successfully.
            </Alert>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Share this temporary password with <strong>{user?.firstName}</strong>. They will be prompted to change it on next login.
            </Typography>
            <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, letterSpacing: 2, textAlign: 'center' }}>
              {tempPassword}
            </Box>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Reset the password for <strong>{user?.firstName} {user?.lastName}</strong>? A new temporary password will be generated. They will be required to change it on next login.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {done ? (
          <Button variant="contained" onClick={handleClose} sx={{ borderRadius: 2 }}>Done</Button>
        ) : (
          <>
            <Button variant="outlined" onClick={handleClose} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button variant="contained" color="warning" disabled={isLoading} onClick={handleReset} sx={{ borderRadius: 2 }}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────

export const UserManagement: React.FC = () => {
  const { users, isLoading, fetchUsers, updateUser, createUser } = useUserManagementStore();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddUserFormData>(EMPTY_ADD_FORM);
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    apiClient.get<Department[]>('/departments').then((r) => setDepartments(r.data)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = users.filter((u) => {
    if (!search) return true;
    return [u.firstName, u.lastName, u.email, u.department?.name]
      .join(' ').toLowerCase().includes(search.toLowerCase());
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive ?? true).length;
  const adminCount = users.filter((u) => u.role === UserRole.ADMIN).length;
  const supervisorCount = users.filter((u) => u.role === UserRole.SUPERVISOR).length;

  const handleAddFormChange = (field: keyof AddUserFormData, value: string | number) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddClose = () => {
    setAddForm(EMPTY_ADD_FORM);
    setAddError('');
    setAddOpen(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    const { fullName, email, temporaryPassword, role, departmentId } = addForm;
    if (!fullName.trim() || !email || !temporaryPassword || !role || !departmentId) {
      setAddError('Please fill in all fields');
      return;
    }
    if (!email.endsWith('@company.com')) {
      setAddError('Email must be a @company.com address');
      return;
    }
    const spaceIdx = fullName.trim().indexOf(' ');
    const firstName = spaceIdx === -1 ? fullName.trim() : fullName.trim().slice(0, spaceIdx);
    const lastName = spaceIdx === -1 ? '' : fullName.trim().slice(spaceIdx + 1);
    if (!lastName) {
      setAddError('Please enter both first and last name');
      return;
    }
    setAddLoading(true);
    try {
      await createUser({ email, temporaryPassword, firstName, lastName, role, departmentId });
      handleAddClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setAddError(msg || 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggleActive = (user: User) => {
    updateUser(user.id, { isActive: !(user.isActive ?? true) });
  };

  const renderTableRows = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
            <CircularProgress size={28} />
          </TableCell>
        </TableRow>
      );
    }
    if (filtered.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
            <Typography variant="body2" color="text.secondary">No users found</Typography>
          </TableCell>
        </TableRow>
      );
    }
    return filtered.map((user, index) => {
      const isActive = user.isActive ?? true;
      return (
        <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
          <TableCell>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.7rem', fontWeight: 700, bgcolor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
                {getInitials(user.firstName, user.lastName)}
              </Avatar>
              <Typography variant="body2" fontWeight={600} color="#1E293B">
                {user.firstName} {user.lastName}
              </Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Typography variant="body2" color="#475569">{user.email}</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2" color="#475569">{user.department?.name ?? '—'}</Typography>
          </TableCell>
          <TableCell>{getRoleChip(user.role)}</TableCell>
          <TableCell>
            {isActive
              ? <Chip label="Active" size="small" sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 700, border: 'none' }} />
              : <Chip label="Inactive" size="small" sx={{ bgcolor: '#F1F5F9', color: '#94A3B8', fontWeight: 700, border: 'none' }} />
            }
          </TableCell>
          <TableCell align="center">
            <Box display="flex" justifyContent="center" gap={0.5}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => setEditUser(user)} sx={{ color: '#6B7280' }}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset Password">
                <IconButton size="small" onClick={() => setResetUser(user)} sx={{ color: '#6B7280' }}>
                  <LockReset fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={isActive ? 'Deactivate' : 'Activate'}>
                <IconButton
                  size="small"
                  onClick={() => handleToggleActive(user)}
                  sx={{ color: isActive ? '#EF4444' : '#10B981', '&:hover': { bgcolor: isActive ? '#FEF2F2' : '#ECFDF5' } }}
                >
                  <PersonOff fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </TableCell>
        </TableRow>
      );
    });
  };

  const renderMobileRows = () => {
    if (isLoading) {
      return <Box textAlign="center" py={5}><CircularProgress size={28} /></Box>;
    }
    if (filtered.length === 0) {
      return (
        <Box textAlign="center" py={5}>
          <Typography variant="body2" color="text.secondary">No users found</Typography>
        </Box>
      );
    }
    return filtered.map((user, index) => {
      const isActive = user.isActive ?? true;
      return (
        <React.Fragment key={user.id}>
          {index > 0 && <Divider />}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <Avatar sx={{ width: 36, height: 36, fontSize: '0.75rem', fontWeight: 700, bgcolor: AVATAR_COLORS[index % AVATAR_COLORS.length], flexShrink: 0 }}>
                {getInitials(user.firstName, user.lastName)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} color="#1E293B" noWrap>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" color="#94A3B8" noWrap>
                  {user.email}
                </Typography>
              </Box>
              <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                {getRoleChip(user.role)}
                <Box mt={0.5}>
                  {isActive
                    ? <Chip label="Active" size="small" sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 700, border: 'none', height: 18, fontSize: '0.65rem' }} />
                    : <Chip label="Inactive" size="small" sx={{ bgcolor: '#F1F5F9', color: '#94A3B8', fontWeight: 700, border: 'none', height: 18, fontSize: '0.65rem' }} />
                  }
                </Box>
              </Box>
            </Box>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button size="small" startIcon={<Edit fontSize="small" />} onClick={() => setEditUser(user)} sx={{ borderRadius: 2, fontSize: '0.75rem', color: '#6B7280' }}>Edit</Button>
              <Button size="small" startIcon={<LockReset fontSize="small" />} onClick={() => setResetUser(user)} sx={{ borderRadius: 2, fontSize: '0.75rem', color: '#6B7280' }}>Reset</Button>
              <Button
                size="small"
                startIcon={<PersonOff fontSize="small" />}
                onClick={() => handleToggleActive(user)}
                sx={{ borderRadius: 2, fontSize: '0.75rem', color: isActive ? '#EF4444' : '#10B981' }}
              >
                {isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </Box>
          </Box>
        </React.Fragment>
      );
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#1E293B">Users</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Manage employee access and organizational roles.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd fontSize="small" />}
          onClick={() => setAddOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Add User</Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Add</Box>
        </Button>
      </Box>

      {/* Stat cards */}
      <Box display="flex" gap={2} mb={3} sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        <StatCard label="Total Users" value={totalUsers} color="#1E293B" bg="#6366F1" />
        <StatCard label="Active Now" value={activeUsers} color="#16A34A" bg="#10B981" />
        <StatCard label="Supervisors" value={supervisorCount} color="#6366F1" bg="#818CF8" />
        <StatCard label="Admins" value={adminCount} color="#D97706" bg="#F59E0B" />
      </Box>

      <Card>
        {/* Search */}
        <Box px={2.5} pt={2} pb={0}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: '#9CA3AF' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2, maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#F9FAFB' } }}
          />
        </Box>

        <CardContent sx={{ p: 0 }}>
          {/* Desktop table */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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
                  {renderTableRows()}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mobile card list */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {renderMobileRows()}
          </Box>

          <Box px={2.5} py={1.5} borderTop="1px solid #F1F5F9">
            <Typography variant="caption" color="text.secondary">
              Showing {filtered.length} of {totalUsers} users
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <AddUserDialog
        open={addOpen}
        onClose={handleAddClose}
        departments={departments}
        formData={addForm}
        onChange={handleAddFormChange}
        onSubmit={handleAddSubmit}
        error={addError}
        isLoading={addLoading}
      />
      <EditUserDialog user={editUser} open={!!editUser} onClose={() => setEditUser(null)} departments={departments} />
      <ResetPasswordDialog user={resetUser} open={!!resetUser} onClose={() => setResetUser(null)} />
    </Box>
  );
};
