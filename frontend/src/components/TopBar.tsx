import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from '@mui/material';
import { Search, NotificationsOutlined, Add, Menu as MenuIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';

const SIDEBAR_WIDTH = 240;
const TOPBAR_HEIGHT = 64;

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Supervisor Dashboard',
    subtitle: "Welcome back. Here's what's happening today.",
  },
  '/my-ot': {
    title: 'My OT Records',
    subtitle: 'Track and manage your overtime requests.',
  },
  '/create-ot': {
    title: 'Submit OT Request',
    subtitle: 'Log your extra hours for project deadlines.',
  },
  '/ot-management': {
    title: 'OT Management',
    subtitle: 'Review and manage overtime submissions.',
  },
  '/user-management': {
    title: 'User Management',
    subtitle: 'Create and manage system users and permissions.',
  },
};

interface TopBarProps {
  onMenuToggle: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isSupervisor = user?.role === UserRole.SUPERVISOR || user?.role === UserRole.ADMIN;
  const meta = PAGE_META[location.pathname];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        // Desktop: offset by sidebar width
        left: { xs: 0, md: SIDEBAR_WIDTH },
        width: { xs: '100%', md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        top: 0,
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        py: 1,
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: `${TOPBAR_HEIGHT}px !important` }}>
        {/* Hamburger — mobile only */}
        <IconButton
          onClick={onMenuToggle}
          size="small"
          sx={{ mr: 1, display: { xs: 'flex', md: 'none' }, color: '#64748B' }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page title */}
        {meta ? (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="#1E293B"
              lineHeight={1.2}
              noWrap
            >
              {meta.title}
            </Typography>
            <Typography
              variant="caption"
              color="#94A3B8"
              lineHeight={1}
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {meta.subtitle}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}

        {/* Right actions */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search data..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 16, color: '#9CA3AF' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              width: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#F8FAFC',
                fontSize: '0.875rem',
                '& fieldset': { borderColor: '#E2E8F0' },
              },
            }}
          />
          <IconButton size="small" sx={{ color: '#64748B' }}>
            <NotificationsOutlined fontSize="small" />
          </IconButton>
          {meta && isSupervisor && location.pathname === '/dashboard' && (
            <Button
              variant="contained"
              startIcon={<Add fontSize="small" />}
              onClick={() => navigate('/ot-management')}
              sx={{ borderRadius: 2, fontSize: '0.8rem', py: 0.75, whiteSpace: 'nowrap' }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>New Entry</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>New</Box>
            </Button>
          )}
          {meta && !isSupervisor && location.pathname === '/my-ot' && (
            <Button
              variant="contained"
              startIcon={<Add fontSize="small" />}
              onClick={() => navigate('/create-ot')}
              sx={{ borderRadius: 2, fontSize: '0.8rem', py: 0.75, whiteSpace: 'nowrap' }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Submit OT</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Submit</Box>
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
