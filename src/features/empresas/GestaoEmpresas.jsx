import React, { useEffect, useState } from 'react';
import {
  createCompanie,
  getModules,
  getStats,
  formatApiError
} from '../../services/api/ApiService';
import { Add, Business, ViewModule, Groups3, Store } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  Grid,
  Grow,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
  Checkbox,
  ListItemText
} from '@mui/material';

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

function GestaoEmpresas() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modules, setModules] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_empresas: '',
    total_usuarios: '',
    total_modulos: '',
    total_unidades: '',
  });
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    unidade: '',
    modulos: [],
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

    if (!open) {
      loadStats();
    }
  }, [open]);

  const handleOpen = async () => {
    setError('');
    setSuccess('');
    const response = await getModules();
    setModules(response.data);
    setFormData({ nome: '', cnpj: '', unidade: '', modulo: '' });
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
      await createCompanie(formData);
      setSuccess('Empresa cadastrada com sucesso!');
      setTimeout(handleClose, 3000);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Fade in timeout={800}>
        <Box>

          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                Painel de Empresas
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
                Gerencie as empresas cadastradas na plataforma.
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpen} sx={{ borderRadius: 2 }}>
              Nova Empresa
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'left' }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Empresas cadastradas" value={stats.total_empresas} icon={Business} gradient="linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)" isLoading={statsLoading} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Unidades cadastradas" value={stats.total_unidades} icon={Store} gradient="linear-gradient(135deg, #5f46ff 0%, #501bff 100%)" isLoading={statsLoading} />
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
                Vincule uma nova empresa
              </Typography>
            </Box>
          </Fade>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <TextField label="Nome" fullWidth margin="normal" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
          <TextField label="CNPJ" fullWidth margin="normal" value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} />
          <TextField label="Unidade" fullWidth margin="normal" value={formData.unidade} onChange={(e) => setFormData({ ...formData, unidade: e.target.value })} />

          <FormControl fullWidth margin="normal">
            <InputLabel id="select-modulos-label">Módulos</InputLabel>
            <Select
              labelId="select-modulos-label"
              multiple // atributo para permitir selecionar varios
              value={formData.modulo || []}
              onChange={(e) => setFormData({ ...formData, modulo: e.target.value })}
              label="Módulos"
              renderValue={(selected) => {
                // mostrar os nomes separados por virgulas
                const selectedNames = modules
                  .filter(mod => selected.includes(mod.public_id))
                  .map(mod => mod.nome);
                return selectedNames.join(', ');
              }}
            >
              {modules?.map((mod) => (
                <MenuItem key={mod.public_id} value={mod.public_id}>
                  <Checkbox checked={formData.modulo.indexOf(mod.public_id) > -1} />
                  <ListItemText primary={mod.nome} />
                </MenuItem>
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

export default GestaoEmpresas;
