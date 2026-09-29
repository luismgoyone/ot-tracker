import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

const GUIDELINES = [
  'All OT requests must be submitted within 24 hours of completion.',
  'Claims over 4 hours require manager\'s pre-approval email attachment.',
  'Weekend OT rates are applied automatically based on the date.',
  'An end time earlier than the start time counts as finishing the next day.',
  'Each request must be between 15 minutes and 12 hours.',
];

export const OtGuidelinesCard: React.FC = () => (
  <Card sx={{ bgcolor: 'tint.primary', borderColor: 'primary.light' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Typography variant="subtitle2" fontWeight={700} color="primary.dark" mb={1.5}>
        OT Guidelines
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
        {GUIDELINES.map((g) => (
          <Box key={g} component="li" display="flex" gap={1} mb={1}>
            <Box
              sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0, mt: 0.75 }}
            />
            <Typography variant="caption" color="primary.dark" lineHeight={1.5}>
              {g}
            </Typography>
          </Box>
        ))}
      </Box>
    </CardContent>
  </Card>
);
