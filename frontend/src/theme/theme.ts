import { createTheme } from '@mui/material/styles';

/**
 * Design tokens. Components should reference these through the theme
 * (e.g. `color: 'text.secondary'`, `bgcolor: 'tint.primary'`) rather than hex values.
 */
const slate = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
};

declare module '@mui/material/styles' {
  interface Palette {
    /** Pale backgrounds that pair with the matching main colour (icon tiles, chips, hovers). */
    tint: { primary: string; secondary: string; success: string; warning: string; error: string; info: string };
    /** Categorical colours for avatars and chart series. */
    series: string[];
  }
  interface PaletteOptions {
    tint?: Palette['tint'];
    series?: string[];
  }
}

export const theme = createTheme({
  palette: {
    primary: { main: '#6366F1', light: '#818CF8', dark: '#4F46E5', contrastText: '#FFFFFF' },
    secondary: { main: '#8B5CF6' },
    success: { main: '#10B981', dark: '#16A34A' },
    warning: { main: '#F59E0B', dark: '#CA8A04' },
    error: { main: '#EF4444', dark: '#DC2626' },
    info: { main: '#3B82F6' },
    grey: slate,
    text: { primary: slate[800], secondary: slate[500], disabled: slate[400] },
    divider: slate[200],
    background: { default: slate[50], paper: '#FFFFFF' },
    tint: {
      primary: '#EEF2FF',
      secondary: '#F5F3FF',
      success: '#ECFDF5',
      warning: '#FFFBEB',
      error: '#FEF2F2',
      info: '#EFF6FF',
    },
    series: ['#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'],
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          border: `1px solid ${slate[200]}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 600, fontSize: '0.75rem' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: slate[400],
            backgroundColor: slate[50],
            borderBottom: `1px solid ${slate[200]}`,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child .MuiTableCell-root': { borderBottom: 0 },
          '&.MuiTableRow-hover:hover': { backgroundColor: slate[50] },
        },
      },
    },
  },
});
