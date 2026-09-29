import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { useAuthStore } from './stores/authStore';
import { queryClient } from './api/queryClient';
import { theme } from './theme/theme';
import { UserRole } from './types';

// Components
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { BottomNav } from './components/layout/BottomNav';
import { SIDEBAR_WIDTH } from './components/layout/constants';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { SupervisorDashboard } from './pages/SupervisorDashboard';
import { OtRecordManagement } from './pages/OtRecordManagement';
import { MyOtRecords } from './pages/MyOtRecords';
import { CreateOtRecord } from './pages/CreateOtRecord';
import { UserManagement } from './pages/UserManagement';
import { UserProfile } from './pages/UserProfile';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const isSupervisorOrAdmin = user?.role === UserRole.SUPERVISOR || user?.role === UserRole.ADMIN;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Always close the sidebar when auth state changes (login/logout)
  useEffect(() => {
    setMobileOpen(false);
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
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

                    <Route path="/settings" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

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
    </QueryClientProvider>
  );
}

export default App;
