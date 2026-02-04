import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { useAuthStore } from './stores/authStore';
import { UserRole } from './types';

// Components
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { SupervisorDashboard } from './pages/SupervisorDashboard';
import { OtRecordManagement } from './pages/OtRecordManagement';
import { MyOtRecords } from './pages/MyOtRecords';
import { CreateOtRecord } from './pages/CreateOtRecord';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Router>
          {isAuthenticated && <Navbar />}
          <Routes>
            {/* Public Route */}
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {user?.role === UserRole.SUPERVISOR ? (
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
                  {user?.role === UserRole.SUPERVISOR ? (
                    <OtRecordManagement />
                  ) : (
                    <Navigate to="/my-ot" replace />
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

            {/* Default Routes */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  user?.role === UserRole.SUPERVISOR ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/my-ot" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
