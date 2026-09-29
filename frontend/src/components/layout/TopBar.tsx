import React from 'react';
import { AppBar, Toolbar, Box, Typography, IconButton, Button } from '@mui/material';
import { Add, FactCheckOutlined, Menu as MenuIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';
import { SIDEBAR_WIDTH, TOPBAR_HEIGHT } from './constants';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Supervisor Dashboard',
    subtitle: 'Approved overtime at a glance.',
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

const actionButtonSx = { borderRadius: 2, fontSize: '0.8rem', py: 0.75, whiteSpace: 'nowrap' };

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
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        py: 1,
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: `${TOPBAR_HEIGHT}px !important` }}>
        {/* Hamburger — mobile only */}
        <IconButton
          onClick={onMenuToggle}
          size="small"
          aria-label="Open navigation"
          sx={{ mr: 1, display: { xs: 'flex', md: 'none' }, color: 'text.secondary' }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page title */}
        {meta ? (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" lineHeight={1.2} noWrap>
              {meta.title}
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              lineHeight={1}
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {meta.subtitle}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}

        {/* Page action */}
        <Box display="flex" alignItems="center" gap={1.5}>
          {isSupervisor && location.pathname === '/dashboard' && (
            <Button
              variant="contained"
              startIcon={<FactCheckOutlined fontSize="small" />}
              onClick={() => navigate('/ot-management')}
              sx={actionButtonSx}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Review Requests
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                Review
              </Box>
            </Button>
          )}
          {!isSupervisor && location.pathname === '/my-ot' && (
            <Button
              variant="contained"
              startIcon={<Add fontSize="small" />}
              onClick={() => navigate('/create-ot')}
              sx={actionButtonSx}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Submit OT
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                Submit
              </Box>
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
