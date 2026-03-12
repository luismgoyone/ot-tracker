import React from 'react';
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ManageAccounts,
  AccessTime,
  Add,
  Logout,
  Settings,
  HelpOutline,
  Group,
  BarChart,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';

interface SidebarProps {
  width: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavSection {
  section?: string;
  items: NavItem[];
}

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

export const Sidebar: React.FC<SidebarProps> = ({ width, mobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!user) return null;

  const isSupervisor = user.role === UserRole.SUPERVISOR;

  const supervisorNav: NavSection[] = [
    {
      section: 'GENERAL',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
        { label: 'OT Management', path: '/ot-management', icon: <ManageAccounts fontSize="small" /> },
        { label: 'Employees', path: '/employees', icon: <Group fontSize="small" /> },
        { label: 'Reports', path: '/reports', icon: <BarChart fontSize="small" /> },
      ],
    },
    {
      section: 'SYSTEM',
      items: [
        { label: 'Settings', path: '/settings', icon: <Settings fontSize="small" /> },
        { label: 'Help Center', path: '/help', icon: <HelpOutline fontSize="small" /> },
      ],
    },
  ];

  const employeeNav: NavSection[] = [
    {
      items: [
        { label: 'Dashboard', path: '/my-ot', icon: <DashboardIcon fontSize="small" /> },
        { label: 'Submit OT', path: '/create-ot', icon: <Add fontSize="small" /> },
        { label: 'My Requests', path: '/my-ot', icon: <AccessTime fontSize="small" /> },
        { label: 'Settings', path: '/settings', icon: <Settings fontSize="small" /> },
      ],
    },
  ];

  const navSections = isSupervisor ? supervisorNav : employeeNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    onMobileClose();
  };

  const drawerContent = (
    <>
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            bgcolor: '#6366F1',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AccessTime sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="#1E293B" lineHeight={1.2}>
            OT Tracker
          </Typography>
          <Typography variant="caption" color="#94A3B8" lineHeight={1}>
            {isSupervisor ? 'Supervisor Panel' : 'Employee Portal'}
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        {navSections.map((section) => (
          <Box key={section.section ?? 'main'} sx={{ mb: 0.5 }}>
            {section.section && (
              <Typography
                variant="caption"
                sx={{
                  px: 2.5,
                  pt: 1.5,
                  pb: 0.5,
                  display: 'block',
                  color: '#94A3B8',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  fontSize: '0.65rem',
                }}
              >
                {section.section}
              </Typography>
            )}
            <List dense disablePadding>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItem key={item.label} disablePadding sx={{ px: 1.5, py: 0.2 }}>
                    <ListItemButton
                      onClick={() => handleNavClick(item.path)}
                      sx={{
                        borderRadius: 2,
                        py: 0.85,
                        px: 1.5,
                        bgcolor: isActive ? '#EEF2FF' : 'transparent',
                        color: isActive ? '#6366F1' : '#64748B',
                        '&:hover': {
                          bgcolor: isActive ? '#EEF2FF' : '#F8FAFC',
                          color: isActive ? '#6366F1' : '#1E293B',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 30,
                          color: isActive ? '#6366F1' : '#94A3B8',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* User + Sign Out */}
      <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, px: 0.5 }}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: '#EEF2FF',
              color: '#6366F1',
              fontSize: '0.8rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {getInitials(user.firstName, user.lastName)}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} color="#1E293B" noWrap sx={{ lineHeight: 1.3 }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="caption" color="#94A3B8" noWrap sx={{ lineHeight: 1.2 }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          startIcon={<Logout fontSize="small" />}
          onClick={handleLogout}
          sx={{
            color: '#94A3B8',
            justifyContent: 'flex-start',
            px: 1.5,
            py: 0.7,
            borderRadius: 2,
            fontSize: '0.8rem',
            '&:hover': { bgcolor: '#FEF2F2', color: '#EF4444' },
          }}
        >
          Sign Out
        </Button>
      </Box>
    </>
  );

  const drawerPaperSx = {
    width,
    boxSizing: 'border-box' as const,
    bgcolor: '#FFFFFF',
    color: '#374151',
    borderRight: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column' as const,
    top: 0,
    height: '100%',
  };

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{ '& .MuiDrawer-paper': drawerPaperSx }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': drawerPaperSx,
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
