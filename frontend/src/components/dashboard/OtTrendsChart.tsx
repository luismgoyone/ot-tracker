import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useOtTrends } from '../../api/analytics';
import { formatDate } from '../../utils/format';
import { DashboardCard } from './DashboardCard';
import { useChartTheme } from './chartTheme';

const DAYS = 30;
const HEIGHT = 200;

/** Approved OT per day over the last 30 days. */
export const OtTrendsChart = () => {
  const query = useOtTrends(DAYS);
  const { palette, gridStroke, axisTick, tooltipStyle } = useChartTheme();

  const data = (query.data ?? []).map((day) => ({
    date: formatDate(day.date, 'MMM D'),
    count: day.count,
    hours: Math.round(day.totalHours * 10) / 10,
  }));

  return (
    <DashboardCard
      title="Daily Approved OT"
      meta={`Last ${DAYS} days`}
      height={HEIGHT}
      query={query}
      isEmpty={!data.some((d) => d.count > 0)}
      emptyDescription={`No OT records in the last ${DAYS} days.`}
    >
      {() => (
        <ResponsiveContainer width="100%" height={HEIGHT}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ ...axisTick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={16}
            />
            <YAxis tick={{ ...axisTick, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="hours"
              stroke={palette.primary.main}
              strokeWidth={2.5}
              dot={false}
              name="Hours"
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={palette.secondary.main}
              strokeWidth={2}
              dot={false}
              name="Records"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </DashboardCard>
  );
};
