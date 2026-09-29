import { alpha, useTheme } from '@mui/material/styles';

/** 1234.56 -> "1,234.6h" */
export const formatHours = (hours: number) => `${hours.toLocaleString('en-US', { maximumFractionDigits: 1 })}h`;

/** Recharts styling pulled from the MUI theme, so charts follow the design tokens. */
export const useChartTheme = () => {
  const { palette } = useTheme();
  return {
    palette,
    gridStroke: palette.grey[100],
    axisTick: { fontSize: 12, fill: palette.text.disabled },
    /** Hover highlight behind a bar group: a faint primary tint. */
    barCursor: { fill: alpha(palette.primary.main, 0.06) },
    /** Hover guide line for line charts. */
    lineCursor: { stroke: palette.divider, strokeWidth: 1, strokeDasharray: '4 4' },
  };
};
