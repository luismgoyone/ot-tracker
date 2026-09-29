import { CSSProperties } from 'react';
import { alpha, useTheme } from '@mui/material/styles';

/** 1234.56 -> "1,234.6h" */
export const formatHours = (hours: number) => `${hours.toLocaleString('en-US', { maximumFractionDigits: 1 })}h`;

/** Recharts styling pulled from the MUI theme, so charts follow the design tokens. */
export const useChartTheme = () => {
  const { palette } = useTheme();
  const tooltipStyle: CSSProperties = {
    borderRadius: 8,
    border: 'none',
    boxShadow: `0 4px 20px ${alpha(palette.common.black, 0.12)}`,
  };
  return {
    palette,
    gridStroke: palette.grey[100],
    axisTick: { fontSize: 12, fill: palette.text.disabled },
    tooltipStyle,
  };
};
