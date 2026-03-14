import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useOtStore } from '../stores/otStore';
import { CreateOtRecordDto } from '../types';
import { CreateOtRecordForm, OtFormData } from '../components/CreateOtRecordForm';

const GUIDELINES = [
  'All OT requests must be submitted within 24 hours of completion.',
  'Claims over 4 hours require manager\'s pre-approval email attachment.',
  'Weekend OT rates are applied automatically based on the date.',
  'Double check your end time to ensure accurate duration calculation.',
];

const MONTHLY_LIMIT = 40;
const currentMonthLogged = 12.5; // placeholder

const EMPTY_FORM: OtFormData = {
  date: dayjs(),
  startTime: null,
  endTime: null,
  reason: '',
  comments: '',
};

const calculateDuration = (startTime: Dayjs | null, endTime: Dayjs | null): number => {
  if (!startTime || !endTime) return 0;
  return Math.max(0, endTime.diff(startTime, 'minute') / 60);
};

export const CreateOtRecord: React.FC = () => {
  const { createOtRecord, isLoading } = useOtStore();
  const [formData, setFormData] = useState<OtFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (field: keyof OtFormData, value: Dayjs | string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'startTime' || field === 'endTime') {
      setErrors((prev) => { const e = { ...prev }; delete e[field]; delete e.duration; return e; });
    } else if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const duration = calculateDuration(formData.startTime, formData.endTime);
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
    if (!validate()) return;
    const duration = calculateDuration(formData.startTime, formData.endTime);
    try {
      const payload: CreateOtRecordDto = {
        date: formData.date!.format('YYYY-MM-DD'),
        startTime: formData.startTime!.format('HH:mm'),
        endTime: formData.endTime!.format('HH:mm'),
        duration: Math.round(duration * 100) / 100,
        reason: formData.reason.trim(),
        comments: formData.comments.trim() || undefined,
      };
      await createOtRecord(payload);
      setSuccessMessage('OT record submitted successfully! It will be reviewed by your supervisor.');
      setFormData(EMPTY_FORM);
    } catch {
      // Error handled by store
    }
  };

  const handleReset = () => {
    setFormData(EMPTY_FORM);
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} color="#1E293B">Submit Overtime Request</Typography>
        <Typography variant="body2" color="text.secondary">
          Log your extra hours for project deadlines or support tasks.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <CreateOtRecordForm
            formData={formData}
            errors={errors}
            successMessage={successMessage}
            isLoading={isLoading}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onReset={handleReset}
            onCloseSuccess={() => setSuccessMessage('')}
          />
        </Grid>

        <Grid item xs={12} lg={4}>
          <Box display="flex" flexDirection="column" gap={2.5}>
            <Card sx={{ bgcolor: '#EEF2FF', border: '1px solid #C7D2FE' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} color="#4338CA" mb={1.5}>
                  OT Guidelines
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
                  {GUIDELINES.map((g) => (
                    <Box key={g} component="li" display="flex" gap={1} mb={1}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6366F1', flexShrink: 0, mt: 0.75 }} />
                      <Typography variant="caption" color="#4338CA" lineHeight={1.5}>{g}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} color="#1E293B" mb={1.5}>
                  Current Month Status
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
                  <Typography variant="caption" color="text.secondary">Total OT Logged</Typography>
                  <Typography variant="caption" fontWeight={700} color="#1E293B">{currentMonthLogged} hrs</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(currentMonthLogged / MONTHLY_LIMIT) * 100}
                  sx={{ height: 6, borderRadius: 3, bgcolor: '#E0E7FF', '& .MuiLinearProgress-bar': { bgcolor: '#6366F1', borderRadius: 3 } }}
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
