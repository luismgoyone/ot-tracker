import React from 'react';
import { Grid } from '@mui/material';
import { Assignment, CalendarMonth, CheckCircleOutline, HourglassEmpty } from '@mui/icons-material';
import { useMyOtSummary } from '../../api/otRecords';
import { StatCard } from '../common/StatCard';
import { ErrorState } from '../common/QueryState';

const formatHours = (hours: number) => `${Math.round(hours * 10) / 10}h`;

/** Totals across all of the user's records (not just the visible page). */
export const MyOtSummaryCards: React.FC = () => {
  const { data, isPending, isError, error, refetch } = useMyOtSummary();

  if (isError) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  const placeholder = isPending ? '–' : undefined;
  const cards = [
    { label: 'Total Requests', value: data?.totalRecords, icon: <Assignment />, tone: 'primary' as const },
    { label: 'Pending', value: data?.pendingRecords, icon: <HourglassEmpty />, tone: 'warning' as const },
    {
      label: 'Approved Hours',
      value: data && formatHours(data.approvedHours),
      icon: <CheckCircleOutline />,
      tone: 'success' as const,
    },
    {
      label: 'This Month',
      value: data && formatHours(data.approvedHoursThisMonth),
      icon: <CalendarMonth />,
      tone: 'info' as const,
    },
  ];

  return (
    <Grid container spacing={2} mb={3}>
      {cards.map((card) => (
        <Grid item xs={6} sm={3} key={card.label}>
          <StatCard label={card.label} value={placeholder ?? card.value} icon={card.icon} tone={card.tone} />
        </Grid>
      ))}
    </Grid>
  );
};
