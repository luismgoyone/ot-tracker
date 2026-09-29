import { Box, Typography } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useDepartmentStats } from '../../api/analytics';
import { DepartmentStats } from '../../types';
import { ChartTooltip } from './ChartTooltip';
import { DashboardCard } from './DashboardCard';
import { formatHours, useChartTheme } from './chartTheme';

const HEIGHT = 240;
/** Departments shown by name; the rest are grouped as "Other". */
const MAX_NAMED = 3;

interface Slice {
  key: string;
  name: string;
  hours: number;
  percent: number;
  color: string;
}

/**
 * Top departments plus an "Other" bucket. Percentages are rounded so they add up to 100,
 * and the chart and legend share the same slices.
 */
const toSlices = (departments: DepartmentStats[], colors: string[], otherColor: string): Slice[] => {
  const withHours = [...departments].filter((d) => d.totalHours > 0).sort((a, b) => b.totalHours - a.totalHours);
  const total = withHours.reduce((sum, d) => sum + d.totalHours, 0);
  if (total === 0) return [];

  // Only group when it saves more than one row.
  const named = withHours.length > MAX_NAMED + 1 ? withHours.slice(0, MAX_NAMED) : withHours;
  const rest = withHours.slice(named.length);

  const slices = named.map((d, index) => ({
    key: String(d.departmentId),
    name: d.departmentName,
    hours: d.totalHours,
    color: colors[index % colors.length],
  }));
  if (rest.length > 0) {
    slices.push({
      key: 'other',
      name: `Other (${rest.length})`,
      hours: rest.reduce((sum, d) => sum + d.totalHours, 0),
      color: otherColor,
    });
  }

  // Largest-remainder rounding keeps the legend summing to exactly 100%.
  const raw = slices.map((s) => (s.hours / total) * 100);
  const percents = raw.map(Math.floor);
  let remaining = 100 - percents.reduce((sum, p) => sum + p, 0);
  raw
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder)
    .forEach(({ index }) => {
      if (remaining > 0) {
        percents[index] += 1;
        remaining -= 1;
      }
    });

  return slices.map((s, index) => ({ ...s, percent: percents[index] }));
};

/** Share of approved OT hours by department. */
export const DepartmentHoursChart = () => {
  const query = useDepartmentStats();
  const { palette } = useChartTheme();
  const slices = toSlices(query.data ?? [], palette.series, palette.grey[300]);
  const totalHours = slices.reduce((sum, s) => sum + s.hours, 0);

  return (
    <DashboardCard
      title="Approved OT Hours by Department"
      height={HEIGHT}
      query={query}
      isEmpty={slices.length === 0}
      emptyDescription="Department hours will appear once OT is approved."
    >
      {() => (
        <>
          <Box position="relative" display="flex" justifyContent="center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={slices}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="hours"
                  nameKey="name"
                  paddingAngle={slices.length > 1 ? 3 : 0}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.key} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="h6" fontWeight={700} color="text.primary" lineHeight={1.2}>
                {formatHours(totalHours)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
            </Box>
          </Box>
          <Box mt={1}>
            {slices.map((slice) => (
              <Box key={slice.key} display="flex" alignItems="center" justifyContent="space-between" gap={1} py={0.5}>
                <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: slice.color, flexShrink: 0 }} />
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {slice.name}
                  </Typography>
                </Box>
                <Typography variant="caption" fontWeight={600} color="text.primary" noWrap>
                  {formatHours(slice.hours)} · {slice.percent}%
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </DashboardCard>
  );
};
