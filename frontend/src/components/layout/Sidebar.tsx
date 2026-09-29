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
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { Logout, AccessTime } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';
import { sidebarNavByRole, panelLabelByRole, NavItem } from '../../config/navConfig';
import { UserAvatar } from '../common/UserAvatar';
import { fullName } from '../../utils/format';

interface SidebarProps {
  width: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ width, mobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!user) return null;

  const navSections = sidebarNavByRole[user.role ?? UserRole.REGULAR];
  const panelLabel = panelLabelByRole[user.role ?? UserRole.REGULAR];

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
            bgcolor: 'primary.main',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AccessTime sx={{ color: 'primary.contrastText', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" lineHeight={1.2}>
            OT Tracker
          </Typography>
          <Typography variant="caption" color="text.disabled" lineHeight={1}>
            {panelLabel}
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box component="nav" sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
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
                  color: 'text.disabled',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  fontSize: '0.65rem',
                }}
              >
                {section.section}
              </Typography>
            )}
            <List dense disablePadding>
              {section.items.map((item: NavItem) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItem key={item.label} disablePadding sx={{ px: 1.5, py: 0.2 }}>
                    <ListItemButton
                      onClick={() => handleNavClick(item.path)}
                      aria-current={isActive ? 'page' : undefined}
                      sx={{
                        borderRadius: 2,
                        py: 0.85,
                        px: 1.5,
                        bgcolor: isActive ? 'tint.primary' : 'transparent',
                        color: isActive ? 'primary.main' : 'text.secondary',
                        '&:hover': {
                          bgcolor: isActive ? 'tint.primary' : 'grey.50',
                          color: isActive ? 'primary.main' : 'text.primary',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 30, color: isActive ? 'primary.main' : 'text.disabled' }}>
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
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, px: 0.5 }}>
          <UserAvatar firstName={user.firstName} lastName={user.lastName} colorKey={user.id} size={34} />
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} color="text.primary" noWrap sx={{ lineHeight: 1.3 }}>
              {fullName(user)}
            </Typography>
            <Typography variant="caption" color="text.disabled" noWrap display="block" sx={{ lineHeight: 1.2 }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          startIcon={<Logout fontSize="small" />}
          onClick={handleLogout}
          sx={{
            color: 'text.disabled',
            justifyContent: 'flex-start',
            px: 1.5,
            py: 0.7,
            borderRadius: 2,
            fontSize: '0.8rem',
            '&:hover': { bgcolor: 'tint.error', color: 'error.main' },
          }}
        >
          Sign Out
        </Button>
      </Box>
    </>
  );

  const drawerPaperSx: SxProps<Theme> = {
    width,
    boxSizing: 'border-box',
    bgcolor: 'background.paper',
    color: 'text.secondary',
    borderRight: 1,
    borderColor: 'divider',
    display: 'flex',
    flexDirection: 'column',
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
    <Drawer variant="permanent" sx={{ width, flexShrink: 0, '& .MuiDrawer-paper': drawerPaperSx }}>
      {drawerContent}
    </Drawer>
  );
};
