import { createTheme } from '@mui/material/styles';

// Paleta de cores moderna inspirada no design system atual
const colors = {
  primary: {
    50: '#E6F7FF',
    100: '#BAE7FF', 
    200: '#91D5FF',
    300: '#69C0FF',
    400: '#40A9FF',
    500: '#1890FF', // Cor principal
    600: '#096DD9',
    700: '#0050B3',
    800: '#003A8C',
    900: '#002766'
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  },
  dark: {
    bg: {
      primary: '#0A0A0B',
      secondary: '#121214',
      paper: '#1A1A1D',
      elevated: '#242428'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
      disabled: '#666666'
    }
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6'
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary[500],
      light: colors.primary[300],
      dark: colors.primary[700],
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B5CF6',
      light: '#A78BFA',
      dark: '#7C3AED',
    },
    background: {
      default: colors.dark.bg.primary,
      paper: colors.dark.bg.paper,
    },
    text: {
      primary: colors.dark.text.primary,
      secondary: colors.dark.text.secondary,
      disabled: colors.dark.text.disabled,
    },
    success: { main: colors.success },
    warning: { main: colors.warning },
    error: { main: colors.error },
    info: { main: colors.info },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
    },
  },

  shape: {
    borderRadius: 16,
  },

  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.4)',
    '0 4px 6px rgba(0,0,0,0.3)',
    '0 8px 25px rgba(0,0,0,0.4)',
    '0 12px 40px rgba(0,0,0,0.5)',
    '0 16px 50px rgba(0,0,0,0.6)',
    ...Array(19).fill('0 20px 60px rgba(0,0,0,0.7)')
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.neutral[600]} transparent`,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: colors.neutral[600],
            borderRadius: 3,
          },
        },
      },
    },
    
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`,
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.dark.bg.paper,
          border: `1px solid rgba(255, 255, 255, 0.05)`,
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease-in-out',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
            border: `1px solid rgba(255, 255, 255, 0.1)`,
          },
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.dark.bg.secondary,
          borderRight: `1px solid rgba(255, 255, 255, 0.05)`,
          backdropFilter: 'blur(20px)',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: `${colors.dark.bg.secondary}CC`,
          backdropFilter: 'blur(20px)',
          border: 'none',
          borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 12px',
          padding: '12px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            backgroundColor: `${colors.primary[500]}20`,
            borderLeft: `3px solid ${colors.primary[500]}`,
            '&:hover': {
              backgroundColor: `${colors.primary[500]}30`,
            },
          },
        },
      },
    },

    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: `1px solid rgba(255, 255, 255, 0.05)`,
          borderRadius: 16,
          backgroundColor: colors.dark.bg.paper,
          '& .MuiDataGrid-cell': {
            borderColor: 'rgba(255, 255, 255, 0.05)',
            '&:focus': {
              outline: `2px solid ${colors.primary[500]}`,
              outlineOffset: '-2px',
            },
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: colors.dark.bg.elevated,
            borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
            borderRadius: '16px 16px 0 0',
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
            },
          },
        },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          '&::after': {
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
          },
        },
      },
    },

    MuiTypography: {
      styleOverrides: {
        h4: {
          background: `linear-gradient(135deg, ${colors.dark.text.primary} 0%, ${colors.primary[300]} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
      },
    },
  },
});

export default theme;