import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import { Business } from '@mui/icons-material';

import { Box, Typography, Button } from '@mui/material';
import { AuthProvider, useAuth } from '../features/auth/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import Login from '../features/auth/Login';
import GestaoMaster from '../features/master/GestaoMaster';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import theme from './theme';

const globalStyles = (
  <GlobalStyles
    styles={{
      '@import': 'url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap")',
      
      body: {
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        backgroundColor: '#0A0A0B',
        overflowX: 'hidden',
      },
      
      '*': {
        boxSizing: 'border-box',
      },
      
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '4px',
      },
      '*::-webkit-scrollbar-thumb': {
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.3)',
        },
      },
      
      '::selection': {
        backgroundColor: 'rgba(24, 144, 255, 0.3)',
        color: '#FFFFFF',
      },
      
      '@keyframes fadeInUp': {
        from: {
          opacity: 0,
          transform: 'translateY(30px)',
        },
        to: {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },
      
      '@keyframes slideInRight': {
        from: {
          opacity: 0,
          transform: 'translateX(-30px)',
        },
        to: {
          opacity: 1,
          transform: 'translateX(0)',
        },
      },
      
      '@keyframes pulse': {
        '0%': {
          transform: 'scale(1)',
        },
        '50%': {
          transform: 'scale(1.05)',
        },
        '100%': {
          transform: 'scale(1)',
        },
      },
      
      'button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible': {
        outline: '2px solid #1890FF',
        outlineOffset: '2px',
        borderRadius: '8px',
      },
      
      '@media (prefers-reduced-motion: reduce)': {
        '*': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
      
      '@media (max-width: 768px)': {
        body: {
          fontSize: '14px',
        },
      },
    }}
  />
);

const UnauthorizedScreen = () => {
  const { logout } = useAuth();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
      <Typography variant="h5" color="error">Acesso não autorizado</Typography>
      <Typography variant="body2" color="text.secondary">Sua conta não tem permissão para acessar este painel.</Typography>
      <Button variant="outlined" color="error" onClick={logout}>Sair</Button>
    </Box>
  );
};

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated, isMaster } = useAuth();
  if (loading) return <LoadingSpinner fullScreen message="Verificando autenticação..." />;
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isMaster()) return <UnauthorizedScreen />;
  return children;
};



const masterMenuItems = [
  { text: 'Painel Master', path: '/master', icon: Business },
];

const AuthenticatedApp = () => {
  const { user, logout } = useAuth();

  return (
    <AppLayout user={user} onLogout={logout} menuItems={masterMenuItems}>
      <Routes>
        <Route path="/" element={<Navigate to="/master" replace />} />
        <Route path="/master" element={<GestaoMaster />} />
        <Route path="*" element={<Navigate to="/master" replace />} />
      </Routes>
    </AppLayout>
  );
};

const AppContent = () => {
  const { loading, isAuthenticated, isMaster, login } = useAuth();

  if (loading) return <LoadingSpinner fullScreen message="Carregando aplicação..." />;

  const resolveLoginRedirect = () => {
    if (!isAuthenticated()) return <Login onLoginSuccess={login} />;
    if (!isMaster()) return <UnauthorizedScreen />;
    return <Navigate to="/master" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={resolveLoginRedirect()} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AuthenticatedApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
