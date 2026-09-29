import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useUpdateUser } from '../../api/users';
import { getErrorMessage } from '../../api/client';
import { ROLE_LABELS } from '../../utils/roles';
import { Department, UpdateUserPayload, User, UserRole } from '../../types';

interface EditUserDialogProps {
  user: User | null;
  /** The signed-in admin; they can't change their own role. */
  currentUserId?: number;
  onClose: () => void;
  departments: Department[];
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, currentUserId, onClose, departments }) => {
  const updateUser = useUpdateUser();
  const [form, setForm] = useState<UpdateUserPayload>({});
  const [error, setError] = useState('');
  const isSelf = !!user && user.id === currentUserId;

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName, lastName: user.lastName, role: user.role, departmentId: user.departmentId });
      setError('');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.firstName?.trim() || !form.lastName?.trim()) {
      setError('First and last name are required');
      return;
    }
    const data: UpdateUserPayload = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
    };
    if (isSelf) delete data.role;
    try {
      await updateUser.mutateAsync({ id: user.id, data });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update user'));
    }
  };

  return (
    <Dialog open={!!user} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>Edit User</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                size="small"
                value={form.firstName ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                size="small"
                value={form.lastName ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" disabled={isSelf}>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  value={form.role ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}
                >
                  {Object.values(UserRole).map((role) => (
                    <MenuItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </MenuItem>
                  ))}
                </Select>
                {isSelf && <FormHelperText>You can't change your own role</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  value={form.departmentId ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, departmentId: Number(e.target.value) }))}
                >
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateUser.isPending}
            startIcon={updateUser.isPending ? <CircularProgress size={16} /> : undefined}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
