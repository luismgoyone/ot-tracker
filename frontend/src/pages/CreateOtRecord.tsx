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
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AccessTime, CalendarToday, Notes } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { useOtStore } from '../stores/otStore';
import { CreateOtRecordDto } from '../types';

const calculateDuration = (startTime: Dayjs | null, endTime: Dayjs | null): number => {
  if (!startTime || !endTime) return 0;
  const diff = endTime.diff(startTime, 'minute');
  return Math.max(0, diff / 60);
};

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (formData.date.isAfter(dayjs(), 'day')) {
      newErrors.date = 'Date cannot be in the future';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      if (formData.endTime.isBefore(formData.startTime) || formData.endTime.isSame(formData.startTime)) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (duration < 0.25) {
      newErrors.duration = 'Minimum OT duration is 15 minutes';
    } else if (duration > 12) {
      newErrors.duration = 'Maximum OT duration is 12 hours';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for overtime is required';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      const otRecordData: CreateOtRecordDto = {
        date: formData.date!.format('YYYY-MM-DD'),
        startTime: formData.startTime!.format('HH:mm'),
        endTime: formData.endTime!.format('HH:mm'),
        duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
        reason: formData.reason.trim(),
        comments: formData.comments.trim() || undefined,
      };

      await createOtRecord(otRecordData);
      setSuccessMessage('OT record submitted successfully! It will be reviewed by your supervisor.');
      
      // Reset form
      setFormData({
        date: dayjs(),
        startTime: null,
        endTime: null,
        reason: '',
        comments: '',
      });
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: Dayjs | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear related errors
    if (errors[field] || errors.duration) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        delete newErrors.duration;
        return newErrors;
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Submit Overtime Request
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Card>
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Date */}
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="OT Date"
                    value={formData.date}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, date: value }));
                      if (errors.date) {
                        setErrors(prev => ({ ...prev, date: '' }));
                      }
                    }}
                    maxDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.date,
                        helperText: errors.date,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Duration Display */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Duration"
                    value={duration > 0 ? `${duration.toFixed(2)} hours` : ''}
                    fullWidth
                    disabled
                    error={!!errors.duration}
                    helperText={errors.duration || 'Calculated automatically'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Start Time */}
                <Grid item xs={12} md={6}>
                  <TimePicker
                    label="Start Time"
                    value={formData.startTime}
                    onChange={(value) => handleTimeChange('startTime', value)}
                    ampm={false}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.startTime,
                        helperText: errors.startTime,
                      },
                    }}
                  />
                </Grid>

                {/* End Time */}
                <Grid item xs={12} md={6}>
                  <TimePicker
                    label="End Time"
                    value={formData.endTime}
                    onChange={(value) => handleTimeChange('endTime', value)}
                    ampm={false}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.endTime,
                        helperText: errors.endTime,
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
                    required
                    value={formData.reason}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, reason: e.target.value }));
                      if (errors.reason) {
                        setErrors(prev => ({ ...prev, reason: '' }));
                      }
                    }}
                    error={!!errors.reason}
                    helperText={errors.reason || 'Provide a detailed reason for the overtime work'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Notes />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Comments */}
                <Grid item xs={12}>
                  <TextField
                    label="Additional Comments (Optional)"
                    multiline
                    rows={2}
                    fullWidth
                    value={formData.comments}
                    onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                    helperText="Any additional information or context"
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => {
                        setFormData({
                          date: dayjs(),
                          startTime: null,
                          endTime: null,
                          reason: '',
                          comments: '',
                        });
                        setErrors({});
                        setSuccessMessage('');
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      sx={{ minWidth: 120 }}
                    >
                      {isLoading ? 'Submitting...' : 'Submit OT Request'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </LocalizationProvider>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            OT Request Guidelines
          </Typography>
          <Typography variant="body2" component="div">
            <ul style={{ marginLeft: 20 }}>
              <li>Minimum overtime duration is 15 minutes (0.25 hours)</li>
              <li>Maximum overtime duration is 12 hours per day</li>
              <li>Overtime date cannot be in the future</li>
              <li>Provide a clear and detailed reason for overtime work</li>
              <li>All requests require supervisor approval</li>
              <li>Submit requests within 7 days of the overtime date</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
