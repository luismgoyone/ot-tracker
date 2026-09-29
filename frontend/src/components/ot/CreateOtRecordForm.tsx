import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AccessTime, CheckCircle, EditNote } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { useCreateOtRecord } from '../../api/otRecords';
import { getErrorMessage } from '../../api/client';
import { formatDuration, hoursBetween } from '../../utils/format';

interface OtFormData {
  date: Dayjs | null;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  reason: string;
  comments: string;
}

type FormErrors = Partial<Record<keyof OtFormData | 'duration', string>>;

const MIN_HOURS = 0.25;
const MAX_HOURS = 12;

const emptyForm = (): OtFormData => ({
  date: dayjs(),
  startTime: null,
  endTime: null,
  reason: '',
  comments: '',
});

const isValidTime = (value: Dayjs | null): value is Dayjs => value !== null && value.isValid();

/** Duration the server will compute; an end at/before the start crosses midnight. */
const previewHours = (start: Dayjs | null, end: Dayjs | null) =>
  isValidTime(start) && isValidTime(end) ? hoursBetween(start.format('HH:mm'), end.format('HH:mm')) : 0;

const crossesMidnight = (start: Dayjs | null, end: Dayjs | null) =>
  isValidTime(start) && isValidTime(end) && end.format('HH:mm') <= start.format('HH:mm');

const validate = (form: OtFormData): FormErrors => {
  const errors: FormErrors = {};
  if (!form.date || !form.date.isValid()) errors.date = 'Date is required';
  else if (form.date.isAfter(dayjs(), 'day')) errors.date = 'Date cannot be in the future';
  if (!isValidTime(form.startTime)) errors.startTime = 'Start time is required';
  if (!isValidTime(form.endTime)) errors.endTime = 'End time is required';
  if (isValidTime(form.startTime) && isValidTime(form.endTime)) {
    const hours = previewHours(form.startTime, form.endTime);
    if (hours < MIN_HOURS) errors.duration = 'Minimum OT duration is 15 minutes';
    else if (hours > MAX_HOURS) errors.duration = 'Maximum OT duration is 12 hours';
  }
  if (!form.reason.trim()) errors.reason = 'Reason for overtime is required';
  else if (form.reason.trim().length < 10) errors.reason = 'Reason must be at least 10 characters';
  return errors;
};

const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

export const CreateOtRecordForm: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateOtRecord();
  const [form, setForm] = useState<OtFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const duration = previewHours(form.startTime, form.endTime);
  const nextDay = crossesMidnight(form.startTime, form.endTime);

  const handleChange = <K extends keyof OtFormData>(field: K, value: OtFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      if (field === 'startTime' || field === 'endTime') delete next.duration;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (!form.date || !isValidTime(form.startTime) || !isValidTime(form.endTime)) return;

    createMutation.mutate(
      {
        date: form.date.format('YYYY-MM-DD'),
        startTime: form.startTime.format('HH:mm'),
        endTime: form.endTime.format('HH:mm'),
        reason: form.reason.trim(),
        comments: form.comments.trim() || undefined,
      },
      {
        onSuccess: () =>
          navigate('/my-ot', {
            state: { notice: 'OT request submitted. It will be reviewed by your supervisor.' },
          }),
      },
    );
  };

  const handleReset = () => {
    setForm(emptyForm());
    setErrors({});
    createMutation.reset();
  };

  const timeSlotProps = (field: 'startTime' | 'endTime') => ({
    textField: {
      fullWidth: true,
      size: 'small' as const,
      error: !!errors[field],
      helperText: errors[field],
      sx: fieldSx,
    },
  });

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2.5}>
          <EditNote sx={{ color: 'primary.main', fontSize: 22 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              OT Details
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fill in the required fields below.
            </Typography>
          </Box>
        </Box>

        {createMutation.isError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => createMutation.reset()}>
            {getErrorMessage(createMutation.error, 'Failed to submit the OT request.')}
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="OT Date"
                  value={form.date}
                  onChange={(v) => handleChange('date', v)}
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!errors.date,
                      helperText: errors.date,
                      sx: fieldSx,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Duration"
                  value={duration > 0 ? formatDuration(duration) : '0h 00m'}
                  fullWidth
                  size="small"
                  disabled
                  error={!!errors.duration}
                  helperText={errors.duration ?? (nextDay ? 'Ends the next day' : undefined)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime sx={{ fontSize: 16, color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Start Time"
                  value={form.startTime}
                  onChange={(v) => handleChange('startTime', v)}
                  ampm={false}
                  slotProps={timeSlotProps('startTime')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="End Time"
                  value={form.endTime}
                  onChange={(v) => handleChange('endTime', v)}
                  ampm={false}
                  slotProps={timeSlotProps('endTime')}
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
                  value={form.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  error={!!errors.reason}
                  helperText={errors.reason}
                  sx={fieldSx}
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
                  value={form.comments}
                  onChange={(e) => handleChange('comments', e.target.value)}
                  sx={fieldSx}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={1.5}>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    disabled={createMutation.isPending}
                    sx={{ borderRadius: 2 }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={createMutation.isPending}
                    startIcon={<CheckCircle fontSize="small" />}
                    sx={{ borderRadius: 2 }}
                  >
                    {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
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
