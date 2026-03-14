import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  InputAdornment,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AccessTime, CheckCircle, EditNote } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';

export interface OtFormData {
  date: Dayjs | null;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  reason: string;
  comments: string;
}

interface CreateOtRecordFormProps {
  formData: OtFormData;
  errors: Record<string, string>;
  successMessage: string;
  isLoading: boolean;
  onChange: (field: keyof OtFormData, value: Dayjs | string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onCloseSuccess: () => void;
}

const calculateDuration = (startTime: Dayjs | null, endTime: Dayjs | null): number => {
  if (!startTime || !endTime) return 0;
  return Math.max(0, endTime.diff(startTime, 'minute') / 60);
};

export const CreateOtRecordForm: React.FC<CreateOtRecordFormProps> = ({
  formData, errors, successMessage, isLoading, onChange, onSubmit, onReset, onCloseSuccess,
}) => {
  const duration = calculateDuration(formData.startTime, formData.endTime);

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2.5}>
          <EditNote sx={{ color: '#6366F1', fontSize: 22 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#1E293B">OT Details</Typography>
            <Typography variant="caption" color="text.secondary">Fill in the required fields below.</Typography>
          </Box>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={onCloseSuccess}>
            {successMessage}
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <form onSubmit={onSubmit}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="OT Date"
                  value={formData.date}
                  onChange={(v) => onChange('date', v)}
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!errors.date,
                      helperText: errors.date,
                      sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Duration (Hours)"
                  value={duration > 0 ? duration.toFixed(1) : '0.0'}
                  fullWidth
                  size="small"
                  disabled
                  error={!!errors.duration}
                  helperText={errors.duration}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime sx={{ fontSize: 16, color: '#9CA3AF' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(v) => onChange('startTime', v)}
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!errors.startTime,
                      helperText: errors.startTime,
                      sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={(v) => onChange('endTime', v)}
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!errors.endTime,
                      helperText: errors.endTime,
                      sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Reason for Overtime"
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                  placeholder="Explain the project or task requirement..."
                  value={formData.reason}
                  onChange={(e) => onChange('reason', e.target.value)}
                  error={!!errors.reason}
                  helperText={errors.reason}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Comments (Optional)"
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                  placeholder="Additional details or context..."
                  value={formData.comments}
                  onChange={(e) => onChange('comments', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={1.5}>
                  <Button variant="outlined" onClick={onReset} sx={{ borderRadius: 2 }}>
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    startIcon={<CheckCircle fontSize="small" />}
                    sx={{ borderRadius: 2 }}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </LocalizationProvider>
      </CardContent>
    </Card>
  );
};
