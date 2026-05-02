import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Fade,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Logout,
  Menu as MenuIcon,
  KeyboardArrowDown,
  AdminPanelSettings,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

const drawerWidth = 280;

function AppLayout({ children, menuItems: menuItemsProp = [] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { user, logout, isMaster } = useAuth();

  const menuItems = menuItemsProp;

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);
  const handleLogout = () => { handleUserMenuClose(); logout(); };

  const getUserTypeChip = () => {
    if (isMaster()) {
      return (
        <Chip
          label="Master"
          size="small"
          icon={<AdminPanelSettings sx={{ fontSize: '16px !important' }} />}
          sx={{ bgcolor: 'rgba(255, 194, 26, 0.2)', color: '#f6c05c', fontSize: '0.75rem' }}
        />
      );
    }
    return null;
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src="/logo-digital-six.png"
            alt="TagSafe Admin"
            sx={{ width: '100%', maxWidth: 180, height: 'auto', objectFit: 'contain' }}
          />
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <List sx={{ padding: 0 }}>
          {menuItems.map((item, index) => (
            <Fade in={true} timeout={300 + index * 100} key={item.text}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    transition: 'all 0.2s ease-in-out',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(24, 144, 255, 0.15)',
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'rgba(24, 144, 255, 0.25)' },
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: location.pathname === item.path ? 600 : 400,
                        fontSize: '0.95rem',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Fade>
          ))}
        </List>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
          }}
          onClick={handleUserMenuOpen}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: isMaster() ? 'secondary.main' : 'primary.main',
                fontSize: '0.9rem',
                fontWeight: 'bold',
              }}
            >
              {user?.nome?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.nome || 'Usuário'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </Typography>
            </Box>
            <KeyboardArrowDown sx={{ color: 'text.secondary' }} />
          </Box>
          {getUserTypeChip() && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {getUserTypeChip()}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ml: { lg: `${drawerWidth}px` },
          width: { lg: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ minHeight: 70, px: 3 }}>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              p: 1,
              borderRadius: 2,
              transition: 'background-color 0.2s',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
            onClick={handleUserMenuOpen}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: isMaster() ? 'secondary.main' : 'primary.main',
                mr: 1,
                fontSize: '0.8rem',
                fontWeight: 'bold',
              }}
            >
              {user?.nome?.charAt(0) || 'U'}
            </Avatar>
            {!isMobile && (
              <Box sx={{ mr: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  {user?.nome?.split(' ')[0] || 'Usuário'}
                </Typography>
                {getUserTypeChip() && <Box sx={{ mt: 0.5 }}>{getUserTypeChip()}</Box>}
              </Box>
            )}
            <KeyboardArrowDown />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' } }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar sx={{ minHeight: 70 }} />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      </Box>

      {/* User Dropdown Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            bgcolor: 'background.paper',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.nome}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user?.email}</Typography>
          <Box sx={{ mt: 1 }}>{getUserTypeChip()}</Box>
        </Box>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          <ListItemText>Sair</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default AppLayout;
