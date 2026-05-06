import React, { useEffect, useState, useMemo } from 'react';
import {
  createUser,
  getRoles,
  getCompanies,
  formatApiError
} from '../../services/api/ApiService';
import { People, Groups3 } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Grow,
  Avatar,
  Grid
} from '@mui/material';
import { getStats } from '../../services/api/ApiService';

function StatCard({ title, value, icon: Icon, gradient, delay = 0, isLoading = false, view = false}) {
  if (isLoading) {
    return (
      <Card sx={{ height: 160, borderRadius: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={22} />
          <Skeleton variant="text" width="40%" height={40} sx={{ my: 1 }} />
        </CardContent>
      </Card>
    );
  }
  return (
    <Grow in timeout={500 + delay}>
      <Card sx={{ height: 160, position: 'relative', background: gradient, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 1, fontWeight: 500 }}>
                {title}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
                {value}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', width: 52, height: 52 }}>
              <Icon fontSize="medium" />
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
}

function GestaoUsuarios() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [stats, setStats] = useState({
    total_empresas: '',
    total_usuarios: '',
    total_modulos: '',
    total_unidades: '',
  });
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    roles: '',
    unidades_id: '',
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await getStats();
        setStats(response.data);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleOpen = async () => {
    setError('');
    setSuccess('');
    const [rolesRes, companiesRes] = await Promise.all([getRoles(), getCompanies()]);
    setRoles(rolesRes.data);
    setCompanies(companiesRes.data);
    setSelectedCompanyName('');
    setFormData({ nome: '', email: '', senha: '', roles: '', unidades_id: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    setOpen(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createUser(formData);
      setSuccess('Usuário cadastrado com sucesso!');
      setTimeout(handleClose, 3000);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // set para unificar as empresas sem precisar de uma nova rota
  const uniqueCompanyNames = useMemo(() => {
    const names = companies.map(c => c.nome).filter(Boolean);
    return [...new Set(names)].sort();
  }, [companies]);

  const filteredUnits = useMemo(() => {
    return companies.filter(c => c.nome === selectedCompanyName);
  }, [companies, selectedCompanyName]);

  return (
    <Container maxWidth="xl">
      <Fade in timeout={800}>
        <Box>

          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                Painel de Usuários
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
                Gerencie os usuários cadastrados na plataforma.
              </Typography>
            </Box>
            <Button variant="outlined" startIcon={<People />} onClick={handleOpen} sx={{ borderRadius: 2 }}>
              Novo Usuário
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'left' }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Usuários cadastrados" value={stats.total_usuarios} icon={Groups3} gradient="linear-gradient(135deg, #31adff 0%, #1976b3 100%)" isLoading={statsLoading} />
            </Grid>
          </Grid>

        </Box>
      </Fade>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Fade in={open} timeout={800}>
            <Box
              sx={{
                pt: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant='h4' component='span' sx={{ fontWeight: 'bold', letterSpacing: 1}}>
                <Box>
                  <People />
                </Box>
                {'Cadastre um novo usuário'}
              </Typography>
            </Box>
          </Fade>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <TextField label="Nome" fullWidth margin="normal" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
          <TextField label="E-mail" fullWidth margin="normal" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <TextField label="Senha" fullWidth margin="normal" value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-roles-label">Cargo</InputLabel>
            <Select labelId="select-roles-label" value={formData.roles || ''} onChange={(e) => setFormData({ ...formData, roles: e.target.value })} label="Cargo">
              {roles?.map((rol) => (
                <MenuItem key={rol.public_id} value={rol.public_id}>{rol.nome}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-company-name-label">Empresa</InputLabel>
            <Select 
              labelId="select-company-name-label" 
              value={selectedCompanyName} 
              onChange={(e) => {
                setSelectedCompanyName(e.target.value);
                setFormData({ ...formData, unidades_id: '' });
              }} 
              label="Empresa"
            >
              {uniqueCompanyNames.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" disabled={!selectedCompanyName}>
            <InputLabel id="select-units-label">Unidade</InputLabel>
            <Select 
              labelId="select-units-label" 
              value={formData.unidades_id || ''} 
              onChange={(e) => setFormData({ ...formData, unidades_id: e.target.value })} 
              label="Unidade"
            >
              {filteredUnits.map((unit) => (
                <MenuItem key={unit.public_id} value={unit.public_id}>{unit.unidade}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default GestaoUsuarios;
