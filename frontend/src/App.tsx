import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { useAuthStore } from './stores/authStore';
import { UserRole } from './types';

// Components
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { SupervisorDashboard } from './pages/SupervisorDashboard';
import { OtRecordManagement } from './pages/OtRecordManagement';
import { MyOtRecords } from './pages/MyOtRecords';
import { CreateOtRecord } from './pages/CreateOtRecord';
import { UserManagement } from './pages/UserManagement';
import { UserProfile } from './pages/UserProfile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366F1',
      light: '#818CF8',
      dark: '#4F46E5',
    },
    secondary: {
      main: '#8B5CF6',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    info: { main: '#3B82F6' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 600, fontSize: '0.75rem' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#94A3B8',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child .MuiTableCell-root': { borderBottom: 0 },
        },
      },
    },
  },
});

const SIDEBAR_WIDTH = 240;

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const isSupervisorOrAdmin = user?.role === UserRole.SUPERVISOR || user?.role === UserRole.ADMIN;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Always close the sidebar when auth state changes (login/logout)
  useEffect(() => {
    setMobileOpen(false);
  }, [isAuthenticated]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Router>
          {isAuthenticated && !user?.mustChangePassword ? (
            <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
              <TopBar onMenuToggle={() => setMobileOpen((prev) => !prev)} />
              <Sidebar
                width={SIDEBAR_WIDTH}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
              />

              {/* Main content */}
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  mt: '81px',
                  minHeight: 'calc(100vh - 90px)',
                  overflow: 'auto',
                  // On mobile, add bottom padding for the bottom nav bar
                  pb: { xs: '56px', md: 0 },
                  // Prevent content overflow on mobile
                  minWidth: 0,
                }}
              >
                <Routes>
                  <Route path="/login" element={<Navigate to="/dashboard" replace />} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        {isSupervisorOrAdmin ? (
                          <SupervisorDashboard />
                        ) : (
                          <Navigate to="/my-ot" replace />
                        )}
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/ot-management"
                    element={
                      <ProtectedRoute>
                        {isSupervisorOrAdmin ? (
                          <OtRecordManagement />
                        ) : (
                          <Navigate to="/my-ot" replace />
                        )}
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/user-management"
                    element={
                      <ProtectedRoute>
                        {user?.role === UserRole.ADMIN ? (
                          <UserManagement />
                        ) : (
                          <Navigate to="/dashboard" replace />
                        )}
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/my-ot"
                    element={
                      <ProtectedRoute>
                        <MyOtRecords />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/create-ot"
                    element={
                      <ProtectedRoute>
                        {user?.role === UserRole.REGULAR ? (
                          <CreateOtRecord />
                        ) : (
                          <Navigate to="/dashboard" replace />
                        )}
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/reports" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/settings" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                  <Route path="/help" element={<Navigate to="/" replace />} />

                  <Route
                    path="/"
                    element={
                      isSupervisorOrAdmin ? (
                        <Navigate to="/dashboard" replace />
                      ) : (
                        <Navigate to="/my-ot" replace />
                      )
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>

              {/* Mobile bottom navigation */}
              <BottomNav />
            </Box>
          ) : (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
