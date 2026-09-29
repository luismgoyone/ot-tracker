import React, { useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useCreateUser } from '../../api/users';
import { getErrorMessage } from '../../api/client';
import { ROLE_LABELS } from '../../utils/roles';
import { passwordLengthError } from '../profile/passwordRules';
import { Department, UserRole } from '../../types';

interface AddUserForm {
  fullName: string;
  email: string;
  temporaryPassword: string;
  role: UserRole | '';
  departmentId: number | '';
}

const EMPTY_FORM: AddUserForm = { fullName: '', email: '', temporaryPassword: '', role: '', departmentId: '' };

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  departments: Department[];
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({ open, onClose, departments }) => {
  const createUser = useCreateUser();
  const [form, setForm] = useState<AddUserForm>(EMPTY_FORM);
  const [error, setError] = useState('');

  const setField = <K extends keyof AddUserForm>(field: K, value: AddUserForm[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setError('');
    createUser.reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { email, temporaryPassword, role, departmentId } = form;
    const [firstName = '', ...rest] = form.fullName.trim().split(/\s+/);
    const lastName = rest.join(' ');
    if (!firstName || !email.trim() || !temporaryPassword || !role || !departmentId) {
      setError('Please fill in all fields');
      return;
    }
    if (!lastName) {
      setError('Please enter both first and last name');
      return;
    }
    const passwordError = passwordLengthError(temporaryPassword, 'Temporary password');
    if (passwordError) {
      setError(passwordError);
      return;
    }
    try {
      await createUser.mutateAsync({ email: email.trim(), temporaryPassword, firstName, lastName, role, departmentId });
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create user'));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography variant="h6" component="span" display="block" fontWeight={700}>
          Add New User
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure employee access credentials.
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                placeholder="e.g. Elizabeth Smith"
                size="small"
                value={form.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Work Email"
                placeholder="name@example.com"
                type="email"
                size="small"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                helperText="User will receive a temporary password and must change it on first login"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Temporary Password"
                placeholder="8–72 characters"
                size="small"
                value={form.temporaryPassword}
                onChange={(e) => setField('temporaryPassword', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select label="Role" value={form.role} onChange={(e) => setField('role', e.target.value as UserRole)}>
                  {Object.values(UserRole).map((role) => (
                    <MenuItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  value={form.departmentId}
                  onChange={(e) => setField('departmentId', Number(e.target.value))}
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
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createUser.isPending}
            startIcon={createUser.isPending ? <CircularProgress size={16} /> : <Add />}
          >
            Create User
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
