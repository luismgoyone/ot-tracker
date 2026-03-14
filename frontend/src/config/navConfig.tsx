import React from 'react';
import {
  Dashboard as DashboardIcon,
  ManageAccounts,
  AccessTime,
  Add,
  HelpOutline,
  BarChart,
  AdminPanelSettings,
  Person,
} from '@mui/icons-material';
import { UserRole } from '../types';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export interface NavSection {
  section?: string;
  items: NavItem[];
}

const systemSection: NavSection = {
  section: 'SYSTEM',
  items: [
    { label: 'Settings', path: '/settings', icon: <Person fontSize="small" /> },
    {
      label: 'Help Center',
      path: '/help',
      icon: <HelpOutline fontSize="small" />,
    },
  ],
};

export const sidebarNavByRole: Record<UserRole, NavSection[]> = {
  [UserRole.ADMIN]: [
    {
      section: 'GENERAL',
      items: [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: <DashboardIcon fontSize="small" />,
        },
        {
          label: 'OT Management',
          path: '/ot-management',
          icon: <ManageAccounts fontSize="small" />,
        },
        {
          label: 'User Management',
          path: '/user-management',
          icon: <AdminPanelSettings fontSize="small" />,
        },
        {
          label: 'Reports',
          path: '/reports',
          icon: <BarChart fontSize="small" />,
        },
      ],
    },
    systemSection,
  ],
  [UserRole.SUPERVISOR]: [
    {
      section: 'GENERAL',
      items: [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: <DashboardIcon fontSize="small" />,
        },
        {
          label: 'OT Management',
          path: '/ot-management',
          icon: <ManageAccounts fontSize="small" />,
        },
        {
          label: 'Reports',
          path: '/reports',
          icon: <BarChart fontSize="small" />,
        },
      ],
    },
    systemSection,
  ],
  [UserRole.REGULAR]: [
    {
      items: [
        {
          label: 'My Requests',
          path: '/my-ot',
          icon: <AccessTime fontSize="small" />,
        },
        {
          label: 'Submit OT',
          path: '/create-ot',
          icon: <Add fontSize="small" />,
        },
        {
          label: 'Settings',
          path: '/settings',
          icon: <Person fontSize="small" />,
        },
      ],
    },
  ],
};

export const bottomNavByRole: Record<UserRole, NavItem[]> = {
  [UserRole.ADMIN]: [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Requests', path: '/ot-management', icon: <ManageAccounts /> },
    { label: 'Users', path: '/user-management', icon: <AdminPanelSettings /> },
    { label: 'Settings', path: '/settings', icon: <Person /> },
  ],
  [UserRole.SUPERVISOR]: [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Requests', path: '/ot-management', icon: <ManageAccounts /> },
    { label: 'Settings', path: '/settings', icon: <Person /> },
  ],
  [UserRole.REGULAR]: [
    { label: 'Dashboard', path: '/my-ot', icon: <DashboardIcon /> },
    { label: 'Submit OT', path: '/create-ot', icon: <AccessTime /> },
    { label: 'Settings', path: '/settings', icon: <Person /> },
  ],
};

export const panelLabelByRole: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin Panel',
  [UserRole.SUPERVISOR]: 'Supervisor Panel',
  [UserRole.REGULAR]: 'Employee Portal',
};
