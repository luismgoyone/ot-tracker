import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMonthlyStats } from '../../api/analytics';
import { monthLabel } from '../../utils/format';
import { ChartTooltip } from './ChartTooltip';
import { DashboardCard } from './DashboardCard';
import { useChartTheme } from './chartTheme';

const HEIGHT = 240;

/** Approved OT per month for the last six months, including the current one. */
export const MonthlyOtChart = () => {
  const query = useMonthlyStats();
  const { palette, gridStroke, axisTick, barCursor } = useChartTheme();
  const months = query.data ?? [];

  const spansYears = new Set(months.map((m) => m.year)).size > 1;
  const data = months.map((m) => ({
    month: monthLabel(m.month, m.year, spansYears),
    count: m.count,
    hours: Math.round(m.totalHours * 10) / 10,
  }));

  return (
    <DashboardCard
      title="Monthly Approved OT"
      meta="Last 6 months"
      height={HEIGHT}
      query={query}
      isEmpty={!data.some((d) => d.count > 0)}
      emptyDescription="No OT records in the last 6 months."
    >
      {() => (
        <ResponsiveContainer width="100%" height={HEIGHT}>
          <BarChart data={data} barSize={18} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip kinds={{ count: 'records', hours: 'hours' }} />} cursor={barCursor} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="count" fill={palette.primary.main} name="Records" radius={[4, 4, 0, 0]} />
            <Bar dataKey="hours" fill={palette.secondary.main} name="Hours" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </DashboardCard>
  );
};
