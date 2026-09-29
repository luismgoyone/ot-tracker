import { InputAdornment, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';

export const UserSearchField = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <TextField
    fullWidth
    size="small"
    placeholder="Search by name, email or department..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Search sx={{ fontSize: 18, color: 'text.disabled' }} />
        </InputAdornment>
      ),
    }}
    sx={{ mb: 2, maxWidth: 400, '& .MuiOutlinedInput-root': { bgcolor: 'grey.50' } }}
  />
);
