import { Box, Paper, Typography } from '@mui/material';
import { TooltipProps } from 'recharts';
import { formatHours } from './chartTheme';

type ValueKind = 'hours' | 'records';

const formatValue = (value: number, kind: ValueKind) =>
  kind === 'hours' ? formatHours(value) : `${value} ${value === 1 ? 'record' : 'records'}`;

interface ChartTooltipProps extends TooltipProps<number, string> {
  /** How to format each series by its dataKey; anything not listed is shown as hours. */
  kinds?: Record<string, ValueKind>;
}

/**
 * Shared Recharts tooltip: a title, then one row per series with a colour dot and a
 * readable (not series-coloured) value. Pass as `<Tooltip content={<ChartTooltip />} />`.
 */
export const ChartTooltip = ({ active, payload, label, kinds = {} }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  // Pie charts have no axis label; use the slice name instead.
  const title = label ?? payload[0].name;
  const isPie = label === undefined;

  return (
    <Paper elevation={0} sx={{ px: 1.5, py: 1, borderRadius: 2, boxShadow: 4, minWidth: 140 }}>
      <Typography variant="caption" fontWeight={700} color="text.primary" display="block" mb={0.5}>
        {title}
      </Typography>
      {payload.map((entry) => {
        const key = String(entry.dataKey ?? entry.name);
        const color = entry.color ?? (entry.payload as { color?: string } | undefined)?.color;
        return (
          <Box key={key} display="flex" alignItems="center" gap={1} py={0.25}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
              {isPie ? 'Approved hours' : entry.name}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.primary">
              {formatValue(Number(entry.value ?? 0), kinds[key] ?? 'hours')}
            </Typography>
          </Box>
        );
      })}
    </Paper>
  );
};
