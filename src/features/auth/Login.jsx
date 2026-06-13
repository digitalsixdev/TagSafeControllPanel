import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  CircularProgress,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import { motion as Motion } from 'framer-motion';
import { formatApiError, login as loginApi } from '../../services/api/ApiService';
import { normalizeAuthSession } from './authUtils';
import { useTranslation } from 'react-i18next';
import '../../app/i18n';

const Login = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEnv, setSelectedEnv] = useState(() => {
    const saved = localStorage.getItem('selected_env');
    return saved === 'local' ? 'dev' : saved || 'dev';
  });

  const handleEnvChange = (_, newEnv) => {
    if (!newEnv) return;
    setSelectedEnv(newEnv);
    localStorage.setItem('selected_env', newEnv);
  };

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.senha) {
      setError(t('login.messages.errorEmptyFields'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await loginApi(formData.email, formData.senha);
      const { user: normalizedUser, token: authToken, refreshToken, refreshExpiresAt } =
        normalizeAuthSession(response?.data);

      if (!normalizedUser) throw new Error(t('login.messages.errorInvalidUser'));
      if (!authToken) throw new Error(t('login.messages.errorNoToken'));

      setSuccess(t('login.messages.success'));
      setTimeout(() => {
        onLoginSuccess(normalizedUser, authToken, { refreshToken, refreshExpiresAt });
      }, 500);
    } catch (err) {
      setError(formatApiError(err) || err.message || t('login.messages.errorConnection'));
    } finally {
      setLoading(false);
    }
  };

  const envSelectedStyles = {
    dev: {
      color: 'orange', // cor laranja para dev
      borderColor: 'orange',
      bgcolor: 'rgba(255, 165, 0, 0.1)',
    },
    prod: {
      color: 'red', // cor vermelha para prod (ficar chamativo)
      borderColor: 'red',
      bgcolor: 'rgba(255, 0, 0, 0.1)',
    },
    local: {
      color: 'green', // cor verde para local
      borderColor: 'green',
      bgcolor: 'rgba(0, 128, 0, 0.1)',
    },
  };


  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0A0B 0%, #1A1A1D 50%, #2A2A2D 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                background: 'rgba(26, 26, 29, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box
                    component="img"
                    src="/Principal.png"
                    alt="Logo TagSafe"
                    sx={{
                      display: 'block',
                      width: 'auto',
                      height: 90,    
                      mb: 3,
                      mx: 'auto'   
                    }}
                  />
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.main',
                      mx: 'auto',
                      mb: 2,
                      background: 'linear-gradient(135deg, #1890FF 0%, #8B5CF6 100%)',
                    }}
                  >
                    <LoginIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    {t('login.components.welcome')}
                  </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label={t('login.components.email')}
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    disabled={loading}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label={t('login.components.password')}
                    type={showPassword ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={handleChange('senha')}
                    disabled={loading}
                    sx={{ mb: 4 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      height: 56,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #1890FF 0%, #8B5CF6 100%)',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': { background: 'linear-gradient(135deg, #40A9FF 0%, #A78BFA 100%)' },
                      '&:disabled': { background: 'rgba(255, 255, 255, 0.1)' },
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : t('login.components.signIn')}
                  </Button>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                    {t('login.components.selectEnvironment')}
                  </Typography>
                  <ToggleButtonGroup
                    value={selectedEnv}
                    exclusive
                    onChange={handleEnvChange}
                    size="small"
                    sx={{ mb: 2 }}
                  >
                    {[
                      { value: 'dev',  label: 'Dev' },
                      { value: 'prod', label: 'Prod' },
                    ].map(({ value, label }) => (
                      <ToggleButton
                        key={value}
                        value={value}
                        sx={{
                          px: 2.5,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: 'text.secondary',
                          borderColor: 'rgba(255,255,255,0.1)',
                          '&.Mui-selected': {
                              ...(envSelectedStyles[value] || {
                              color: 'primary.main',
                              borderColor: 'primary.main',
                              bgcolor: 'rgba(24, 144, 255, 0.08)',
                            }),
                          },
                        }}
                      >
                        {label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    TagSafe © 2025
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Motion.div>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;
