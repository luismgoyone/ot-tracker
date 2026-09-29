import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';
import { bottomNavByRole } from '../../config/navConfig';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const items = bottomNavByRole[user?.role ?? UserRole.REGULAR];
  const currentValue = items.findIndex((item) => item.path === location.pathname);

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', md: 'none' },
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <BottomNavigation
        value={currentValue === -1 ? false : currentValue}
        onChange={(_, newValue) => navigate(items[newValue].path)}
        sx={{
          '& .MuiBottomNavigationAction-root': { color: 'text.disabled' },
          '& .MuiBottomNavigationAction-root.Mui-selected': { color: 'primary.main' },
        }}
      >
        {items.map((item) => (
          <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
};
