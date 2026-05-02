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

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.senha) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await loginApi(formData.email, formData.senha);
      const { user: normalizedUser, token: authToken, refreshToken, refreshExpiresAt } =
        normalizeAuthSession(response?.data);

      if (!normalizedUser) throw new Error('Dados do usuário inválidos.');
      if (!authToken) throw new Error('Token de autenticação não encontrado.');

      setSuccess('Login realizado com sucesso!');
      setTimeout(() => {
        onLoginSuccess(normalizedUser, authToken, { refreshToken, refreshExpiresAt });
      }, 500);
    } catch (err) {
      setError(formatApiError(err) || err.message || 'Erro ao conectar com o servidor!');
    } finally {
      setLoading(false);
    }
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
                    Bem-vindo
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Painel de controle master
                  </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email"
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
                    label="Senha"
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
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Entrar'}
                  </Button>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Plataforma de Gestão e Evidência Operacional
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
