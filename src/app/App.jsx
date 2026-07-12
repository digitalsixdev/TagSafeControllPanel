import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import { 
  Business,
  People,
  AdminPanelSettings,
  FactCheck,
} from '@mui/icons-material';
import { Box, Typography, Button } from '@mui/material';
import { AuthProvider, useAuth } from '../features/auth/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import Login from '../features/auth/Login';
import GestaoMaster from '../features/master/GestaoMaster';
import GestaoEmpresas from '../features/empresas/GestaoEmpresas';
import GestaoUsuarios from '../features/usuarios/GestaoUsuarios';
import AuditoriaEvidencias from '../features/auditoria/AuditoriaEvidencias'
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import theme from './theme';
import { useTranslation } from 'react-i18next';
import './i18n';

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
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
      <Typography variant="h5" color="error">{t('app.unauthorized.title')}</Typography>
      <Typography variant="body2" color="text.secondary">{t('app.unauthorized.description')}</Typography>
      <Button variant="outlined" color="error" onClick={logout}>{t('app.logout')}</Button>
    </Box>
  );
};

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated, isMaster } = useAuth();
  const { t } = useTranslation();
  if (loading) return <LoadingSpinner fullScreen message={t('app.loading.auth')} />;
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isMaster()) return <UnauthorizedScreen />;
  return children;
};

const AuthenticatedApp = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const masterMenuItems = [
    { text: t('app.menuItems.masterPanel'),    path: '/master',   icon: AdminPanelSettings },
    { text: t('app.menuItems.companiesPanel'), path: '/empresas', icon: Business },
    { text: t('app.menuItems.usersPanel'),     path: '/usuarios', icon: People },
    { text: t('app.menuItems.audit'), path: '/auditoria', icon: FactCheck },
  ];

  return (
    <AppLayout user={user} onLogout={logout} menuItems={masterMenuItems}>
      <Routes>
        <Route 
          path="/" 
          element={<Navigate to="/master" replace />} />
        <Route 
          path="/master" 
          element={<GestaoMaster />} 
        />
        <Route 
          path="/empresas" 
          element={<GestaoEmpresas />} 
        />
        <Route
          path="/usuarios"
          element={<GestaoUsuarios />}
        />
        <Route
          path="/auditoria"
          element={<AuditoriaEvidencias />}
        />
      </Routes>
    </AppLayout>
  );
};

const AppContent = () => {
  const { loading, isAuthenticated, isMaster, login } = useAuth();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('app.tabTitle');
  }, [t, i18n.language]);

  if (loading) return <LoadingSpinner fullScreen message={t('app.loading.app')} />;

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
