import React from 'react';
import { Box, CircularProgress, Typography, keyframes } from '@mui/material';

// Animação personalizada para o spinner
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const LoadingSpinner = ({ 
  size = 40, 
  message = 'Carregando...', 
  fullScreen = false,
  variant = 'default' // 'default', 'minimal', 'dots'
}) => {
  if (variant === 'minimal') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: fullScreen ? 0 : 2,
          minHeight: fullScreen ? '100vh' : 'auto',
        }}
      >
        <CircularProgress 
          size={size} 
          thickness={4}
          sx={{ 
            color: 'primary.main',
            animation: `${spin} 1s linear infinite`
          }} 
        />
      </Box>
    );
  }

  if (variant === 'dots') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          p: fullScreen ? 0 : 3,
          minHeight: fullScreen ? '100vh' : 'auto',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                animation: `${pulse} 1.4s ease-in-out ${i * 0.2}s infinite both`,
              }}
            />
          ))}
        </Box>
        {message && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              textAlign: 'center',
              animation: `${pulse} 2s ease-in-out infinite`
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  // Variant padrão
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
        p: fullScreen ? 0 : 3,
        minHeight: fullScreen ? '100vh' : 'auto',
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 10, 11, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
        }),
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress 
          size={size} 
          thickness={4}
          sx={{ 
            color: 'primary.main',
            position: 'relative',
            zIndex: 1,
          }} 
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            opacity: 0.1,
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        />
      </Box>
      {message && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;