import React from 'react';
import { Box, Grid } from '@mui/material';
import { PageHeader } from '../components/common/PageHeader';
import { CreateOtRecordForm } from '../components/ot/CreateOtRecordForm';
import { OtGuidelinesCard } from '../components/ot/OtGuidelinesCard';
import { MonthlyOtStatusCard } from '../components/ot/MonthlyOtStatusCard';

export const CreateOtRecord: React.FC = () => (
  <Box sx={{ p: { xs: 2, md: 3 } }}>
    <PageHeader
      title="Submit Overtime Request"
      subtitle="Log your extra hours for project deadlines or support tasks."
    />

    <Grid container spacing={2.5}>
      <Grid item xs={12} lg={8}>
        <CreateOtRecordForm />
      </Grid>

      <Grid item xs={12} lg={4}>
        <Box display="flex" flexDirection="column" gap={2.5}>
          <OtGuidelinesCard />
          <MonthlyOtStatusCard />
        </Box>
      </Grid>
    </Grid>
  </Box>
);
