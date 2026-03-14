import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Department, UserRole } from '../types';

export interface AddUserFormData {
  fullName: string;
  email: string;
  temporaryPassword: string;
  role: UserRole | '';
  departmentId: number;
}

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  departments: Department[];
  formData: AddUserFormData;
  onChange: (field: keyof AddUserFormData, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  isLoading: boolean;
}

const FIELD_SX = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open, onClose, departments, formData, onChange, onSubmit, error, isLoading,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle sx={{ pb: 0.5 }}>
      <Typography variant="h6" fontWeight={700}>Add New User</Typography>
      <Typography variant="body2" color="text.secondary">Configure employee access credentials.</Typography>
    </DialogTitle>
    <form onSubmit={onSubmit}>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              placeholder="e.g. Elizabeth Smith"
              size="small"
              value={formData.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              sx={FIELD_SX}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Work Email"
              placeholder="e.smith@company.com"
              type="email"
              size="small"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              helperText="User will receive a temporary password and must change it on first login"
              sx={FIELD_SX}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Temporary Password"
              placeholder="Min. 8 characters"
              size="small"
              value={formData.temporaryPassword}
              onChange={(e) => onChange('temporaryPassword', e.target.value)}
              sx={FIELD_SX}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" sx={FIELD_SX}>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={formData.role}
                onChange={(e) => onChange('role', e.target.value)}
              >
                <MenuItem value={UserRole.REGULAR}>Employee</MenuItem>
                <MenuItem value={UserRole.SUPERVISOR}>Supervisor</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" sx={FIELD_SX}>
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                value={formData.departmentId || ''}
                onChange={(e) => onChange('departmentId', Number(e.target.value))}
              >
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2 }}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <Add />}
          sx={{ borderRadius: 2 }}
        >
          Create User
        </Button>
      </DialogActions>
    </form>
  </Dialog>
);
