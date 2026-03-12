import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Dashboard,
  AccessTime,
  Person,
  ManageAccounts,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';

const supervisorItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
  { label: 'Requests', path: '/ot-management', icon: <ManageAccounts /> },
  { label: 'Profile', path: '/settings', icon: <Person /> },
];

const employeeItems = [
  { label: 'Dashboard', path: '/my-ot', icon: <Dashboard /> },
  { label: 'Submit OT', path: '/create-ot', icon: <AccessTime /> },
  { label: 'Profile', path: '/settings', icon: <Person /> },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isSupervisor = user?.role === UserRole.SUPERVISOR;

  const items = isSupervisor ? supervisorItems : employeeItems;
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
        borderTop: '1px solid #E2E8F0',
      }}
    >
      <BottomNavigation
        value={currentValue === -1 ? false : currentValue}
        onChange={(_, newValue) => navigate(items[newValue].path)}
        sx={{
          '& .MuiBottomNavigationAction-root': { color: '#94A3B8' },
          '& .Mui-selected': { color: '#6366F1 !important' },
        }}
      >
        {items.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};
