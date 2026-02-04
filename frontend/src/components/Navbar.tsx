import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Logout,
  Person,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    // Navigate to profile page (if implemented)
    handleMenuClose();
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    handleMenuClose();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) return null;

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Box display="flex" alignItems="center" flexGrow={1}>
          <Typography
            variant="h6"
            component="div"
            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => navigate('/dashboard')}
          >
            OT Tracker
          </Typography>

          <Box sx={{ ml: 4, display: 'flex', gap: 2 }}>
            {user.role === UserRole.SUPERVISOR ? (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    bgcolor: isActive('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/ot-management')}
                  sx={{
                    bgcolor: isActive('/ot-management') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                >
                  OT Management
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/my-ot')}
                  sx={{
                    bgcolor: isActive('/my-ot') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                >
                  My OT Records
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/create-ot')}
                  sx={{
                    bgcolor: isActive('/create-ot') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                >
                  Submit OT
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <Box textAlign="right" sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" color="inherit">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.7)">
              {user.role === UserRole.SUPERVISOR ? 'Supervisor' : 'Employee'}
            </Typography>
          </Box>

          <Avatar
            sx={{ cursor: 'pointer', bgcolor: 'primary.dark' }}
            onClick={handleMenuOpen}
          >
            {getInitials(user.firstName, user.lastName)}
          </Avatar>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleDashboard}>
              <ListItemIcon>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Dashboard</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
