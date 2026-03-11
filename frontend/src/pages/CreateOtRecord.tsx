import React, { useState } from 'react';
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
  LinearProgress,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  AccessTime,
  CheckCircle,
  EditNote,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { useOtStore } from '../stores/otStore';
import { CreateOtRecordDto } from '../types';

const calculateDuration = (startTime: Dayjs | null, endTime: Dayjs | null): number => {
  if (!startTime || !endTime) return 0;
  return Math.max(0, endTime.diff(startTime, 'minute') / 60);
};

const GUIDELINES = [
  'All OT requests must be submitted within 24 hours of completion.',
  'Claims over 4 hours require manager\'s pre-approval email attachment.',
  'Weekend OT rates are applied automatically based on the date.',
  'Double check your end time to ensure accurate duration calculation.',
];

export const CreateOtRecord: React.FC = () => {
  const [formData, setFormData] = useState<{
    date: Dayjs | null;
    startTime: Dayjs | null;
    endTime: Dayjs | null;
    reason: string;
    comments: string;
  }>({
    date: dayjs(),
    startTime: null,
    endTime: null,
    reason: '',
    comments: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const { createOtRecord, isLoading } = useOtStore();

  const duration = calculateDuration(formData.startTime, formData.endTime);

  // Assume a monthly limit of 40hrs for the progress bar
  const MONTHLY_LIMIT = 40;
  const currentMonthLogged = 12.5; // placeholder

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = 'Date is required';
    else if (formData.date.isAfter(dayjs(), 'day')) newErrors.date = 'Date cannot be in the future';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (formData.startTime && formData.endTime) {
      if (formData.endTime.isBefore(formData.startTime) || formData.endTime.isSame(formData.startTime)) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    if (duration > 0 && duration < 0.25) newErrors.duration = 'Minimum OT duration is 15 minutes';
    else if (duration > 12) newErrors.duration = 'Maximum OT duration is 12 hours';
    if (!formData.reason.trim()) newErrors.reason = 'Reason for overtime is required';
    else if (formData.reason.trim().length < 10) newErrors.reason = 'Reason must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    if (!validateForm()) return;
    try {
      const otRecordData: CreateOtRecordDto = {
        date: formData.date!.format('YYYY-MM-DD'),
        startTime: formData.startTime!.format('HH:mm'),
        endTime: formData.endTime!.format('HH:mm'),
        duration: Math.round(duration * 100) / 100,
        reason: formData.reason.trim(),
        comments: formData.comments.trim() || undefined,
      };
      await createOtRecord(otRecordData);
      setSuccessMessage('OT record submitted successfully! It will be reviewed by your supervisor.');
      setFormData({ date: dayjs(), startTime: null, endTime: null, reason: '', comments: '' });
    } catch {
      // Error handled by store
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: Dayjs | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field] || errors.duration) {
      setErrors(prev => { const e = { ...prev }; delete e[field]; delete e.duration; return e; });
    }
  };

  const handleReset = () => {
    setFormData({ date: dayjs(), startTime: null, endTime: null, reason: '', comments: '' });
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} color="#1E293B">Submit Overtime Request</Typography>
        <Typography variant="body2" color="text.secondary">
          Log your extra hours for project deadlines or support tasks.
        </Typography>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {/* Form */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                <EditNote sx={{ color: '#6366F1', fontSize: 22 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#1E293B">OT Details</Typography>
                  <Typography variant="caption" color="text.secondary">Fill in the required fields below.</Typography>
                </Box>
              </Box>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2.5}>
                    {/* Date */}
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="OT Date"
                        value={formData.date}
                        onChange={(v) => {
                          setFormData(prev => ({ ...prev, date: v }));
                          if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
                        }}
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

                    {/* Duration */}
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

                    {/* Start Time */}
                    <Grid item xs={12} sm={6}>
                      <TimePicker
                        label="Start Time"
                        value={formData.startTime}
                        onChange={(v) => handleTimeChange('startTime', v)}
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

                    {/* End Time */}
                    <Grid item xs={12} sm={6}>
                      <TimePicker
                        label="End Time"
                        value={formData.endTime}
                        onChange={(v) => handleTimeChange('endTime', v)}
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

                    {/* Reason */}
                    <Grid item xs={12}>
                      <TextField
                        label="Reason for Overtime"
                        multiline
                        rows={3}
                        fullWidth
                        size="small"
                        placeholder="Explain the project or task requirement..."
                        value={formData.reason}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, reason: e.target.value }));
                          if (errors.reason) setErrors(prev => ({ ...prev, reason: '' }));
                        }}
                        error={!!errors.reason}
                        helperText={errors.reason}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    {/* Comments */}
                    <Grid item xs={12}>
                      <TextField
                        label="Comments (Optional)"
                        multiline
                        rows={2}
                        fullWidth
                        size="small"
                        placeholder="Additional details or context..."
                        value={formData.comments}
                        onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    {/* Buttons */}
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="flex-end" gap={1.5}>
                        <Button variant="outlined" onClick={handleReset} sx={{ borderRadius: 2 }}>
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
        </Grid>

        {/* Right Panel */}
        <Grid item xs={12} lg={4}>
          <Box display="flex" flexDirection="column" gap={2.5}>
            {/* Guidelines */}
            <Card sx={{ bgcolor: '#EEF2FF', border: '1px solid #C7D2FE' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} color="#4338CA" mb={1.5}>
                  OT Guidelines
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
                  {GUIDELINES.map((g, i) => (
                    <Box key={i} component="li" display="flex" gap={1} mb={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: '#6366F1',
                          flexShrink: 0,
                          mt: 0.75,
                        }}
                      />
                      <Typography variant="caption" color="#4338CA" lineHeight={1.5}>
                        {g}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Current Month Status */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} color="#1E293B" mb={1.5}>
                  Current Month Status
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
                  <Typography variant="caption" color="text.secondary">Total OT Logged</Typography>
                  <Typography variant="caption" fontWeight={700} color="#1E293B">
                    {currentMonthLogged} hrs
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(currentMonthLogged / MONTHLY_LIMIT) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#E0E7FF',
                    '& .MuiLinearProgress-bar': { bgcolor: '#6366F1', borderRadius: 3 },
                  }}
                />
                <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                  LIMIT: {MONTHLY_LIMIT} HRS / MONTH
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
