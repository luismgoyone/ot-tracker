import { Box, InputAdornment, Tab, Tabs, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';
import { OtStatus } from '../../types';

export type StatusTab = 'all' | OtStatus;

interface OtRecordFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  tab: StatusTab;
  onTabChange: (tab: StatusTab) => void;
}

export const OtRecordFilters = ({ search, onSearchChange, tab, onTabChange }: OtRecordFiltersProps) => (
  <Box px={2.5} pt={2}>
    <TextField
      fullWidth
      size="small"
      placeholder="Search by employee, department or reason"
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      inputProps={{ 'aria-label': 'Search OT records' }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search sx={{ fontSize: 18, color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
      sx={{
        mb: 2,
        maxWidth: 400,
        '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'grey.50' },
      }}
    />
    <Tabs
      value={tab}
      onChange={(_, value: StatusTab) => onTabChange(value)}
      variant="scrollable"
      allowScrollButtonsMobile
      sx={{
        '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minHeight: 40, py: 0 },
      }}
    >
      <Tab label="All Requests" value="all" />
      <Tab label="Pending" value={OtStatus.PENDING} />
      <Tab label="Approved" value={OtStatus.APPROVED} />
      <Tab label="Rejected" value={OtStatus.REJECTED} />
    </Tabs>
  </Box>
);
