import React, { useEffect, useState, useMemo } from 'react';
import {
  createUser,
  getRoles,
  getCompanies,
  formatApiError,
  getAllCompanies,
  getInstructorsByCompany,
  getUnitsByUserId,
  getUnitByUnitId,
  setUnitsAttended
} from '../../services/api/ApiService';
import { People, Groups3, LinkRounded } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Checkbox,
  ListItemText,
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
    unidades_id: [],
  });

  // "Vincular Instrutores" dialog
  const [vincularOpen, setVincularOpen] = useState(false);
  const [vincularLoading, setVincularLoading] = useState(false);
  const [vincularError, setVincularError] = useState('');
  const [vincularSuccess, setVincularSuccess] = useState('');
  const [allCompaniesList, setAllCompaniesList] = useState([]);
  const [vincularEmpresaId, setVincularEmpresaId] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [instructorsLoading, setInstructorsLoading] = useState(false);
  const [vincularInstructor, setVincularInstructor] = useState(null);
  const [instructorUnits, setInstructorUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [vincularUnit, setVincularUnit] = useState(null);
  const [unitModules, setUnitModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [vincularModulos, setVincularModulos] = useState([]);

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
    setFormData({ nome: '', email: '', senha: '', roles: '', unidades_id: [] });
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

  // handlers de vincular instrutores
  const resetVincular = () => {
    setVincularEmpresaId('');
    setInstructors([]);
    setVincularInstructor(null);
    setInstructorUnits([]);
    setVincularUnit(null);
    setUnitModules([]);
    setVincularModulos([]);
  };

  const handleVincularOpen = async () => {
    setVincularError('');
    setVincularSuccess('');
    resetVincular();
    try {
      const res = await getAllCompanies();
      setAllCompaniesList(res.data || []);
    } catch {
      setVincularError('Erro ao carregar empresas.');
    }
    setVincularOpen(true);
  };

  const handleVincularClose = () => {
    setVincularOpen(false);
    setVincularError('');
    setVincularSuccess('');
  };

  const handleEmpresaChange = async (empresaId) => {
    setVincularEmpresaId(empresaId);
    setInstructors([]);
    setVincularInstructor(null);
    setInstructorUnits([]);
    setVincularUnit(null);
    setUnitModules([]);
    setVincularModulos([]);
    if (!empresaId) return;
    setInstructorsLoading(true);
    try {
      const res = await getInstructorsByCompany(empresaId);
      setInstructors(res.data || []);
    } catch {
      setVincularError('Erro ao carregar instrutores.');
    } finally {
      setInstructorsLoading(false);
    }
  };

  const handleInstructorChange = async (usuarioId) => {
    const instructor = instructors.find((i) => i.usuario_id === usuarioId) || null;
    setVincularInstructor(instructor);
    setInstructorUnits([]);
    setVincularUnit(null);
    setUnitModules([]);
    setVincularModulos([]);
    if (!instructor) return;
    setUnitsLoading(true);
    try {
      const res = await getUnitsByUserId(instructor.usuario_id);
      setInstructorUnits(res.data || []);
    } catch {
      setVincularError('Erro ao carregar unidades do instrutor.');
    } finally {
      setUnitsLoading(false);
    }
  };

  const handleVincularUnitChange = async (publicId) => {
    const unit = instructorUnits.find((u) => u.public_id === publicId) || null;
    setVincularUnit(unit);
    setUnitModules([]);
    setVincularModulos([]);
    if (!unit) return;
    setModulesLoading(true);
    try {
      const res = await getUnitByUnitId(unit.public_id);
      setUnitModules(res.data?.modulos || []);
    } catch {
      setVincularError('Erro ao carregar módulos da unidade.');
    } finally {
      setModulesLoading(false);
    }
  };

  const handleVincularSubmit = async () => {
    if (!vincularInstructor || !vincularUnit || !vincularModulos.length) return;
    setVincularLoading(true);
    setVincularError('');
    setVincularSuccess('');
    try {
      await setUnitsAttended(vincularInstructor.public_id, vincularUnit.public_id, vincularModulos);
      setVincularSuccess('Instrutor vinculado com sucesso!');
      setTimeout(handleVincularClose, 2000);
    } catch (err) {
      setVincularError(formatApiError(err));
    } finally {
      setVincularLoading(false);
    }
  };

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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<LinkRounded />}
                onClick={handleVincularOpen}
                sx={{
                  borderRadius: 2,
                  color: '#a78bfa',
                  borderColor: '#a78bfa',
                  '&:hover': { borderColor: '#8B5CF6', bgcolor: 'rgba(139, 92, 246, 0.08)' },
                }}
              >
                Vincular Instrutores
              </Button>
              <Button variant="outlined" startIcon={<People />} onClick={handleOpen} sx={{ borderRadius: 2 }}>
                Novo Usuário
              </Button>
            </Box>
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
                setFormData({ ...formData, unidades_id: [] });
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
              multiple
              value={formData.unidades_id} 
              onChange={(e) => setFormData({ ...formData, unidades_id: e.target.value })} 
              label="Unidade"
              renderValue={(selected) => (
                filteredUnits.filter(u => selected.includes(u.public_id)).map(u => u.unidade).join(', ')
              )}
            >
              {filteredUnits.map((unit) => (
                <MenuItem key={unit.public_id} value={unit.public_id}>
                  <Checkbox checked={formData.unidades_id.includes(unit.public_id)} />
                  <ListItemText primary={unit.unidade} />
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
      {/* Vincular Instrutores dialog */}
      <Dialog open={vincularOpen} onClose={handleVincularClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Fade in={vincularOpen} timeout={800}>
            <Box sx={{ pt: 2, textAlign: 'center' }}>
              <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                <Box><LinkRounded /></Box>
                Vincular Instrutor
              </Typography>
            </Box>
          </Fade>
        </DialogTitle>
        <DialogContent>
          {vincularError && <Alert severity="error" sx={{ mb: 2 }}>{vincularError}</Alert>}
          {vincularSuccess && <Alert severity="success" sx={{ mb: 2 }}>{vincularSuccess}</Alert>}

          {/* 1. Empresa */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="vincular-empresa-label">Empresa</InputLabel>
            <Select
              labelId="vincular-empresa-label"
              value={vincularEmpresaId}
              onChange={(e) => handleEmpresaChange(e.target.value)}
              label="Empresa"
            >
              {allCompaniesList.map((emp) => (
                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                  {emp.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 2. Instrutor */}
          <FormControl fullWidth margin="normal" disabled={!vincularEmpresaId || instructorsLoading}>
            <InputLabel id="vincular-instrutor-label">
              {instructorsLoading ? 'Carregando...' : 'Instrutor'}
            </InputLabel>
            <Select
              labelId="vincular-instrutor-label"
              value={vincularInstructor?.usuario_id || ''}
              onChange={(e) => handleInstructorChange(e.target.value)}
              label={instructorsLoading ? 'Carregando...' : 'Instrutor'}
              endAdornment={instructorsLoading ? <CircularProgress size={18} sx={{ mr: 2 }} /> : null}
            >
              {instructors.map((inst) => (
                <MenuItem key={inst.usuario_id} value={inst.usuario_id}>
                  {inst.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 3. Unidade */}
          <FormControl fullWidth margin="normal" disabled={!vincularInstructor || unitsLoading}>
            <InputLabel id="vincular-unidade-label">
              {unitsLoading ? 'Carregando...' : 'Unidade'}
            </InputLabel>
            <Select
              labelId="vincular-unidade-label"
              value={vincularUnit?.public_id || ''}
              onChange={(e) => handleVincularUnitChange(e.target.value)}
              label={unitsLoading ? 'Carregando...' : 'Unidade'}
              endAdornment={unitsLoading ? <CircularProgress size={18} sx={{ mr: 2 }} /> : null}
            >
              {instructorUnits.map((unit) => (
                <MenuItem key={unit.public_id} value={unit.public_id}>
                  {unit.unidade}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 4. Módulos */}
          <FormControl fullWidth margin="normal" disabled={!vincularUnit || modulesLoading}>
            <InputLabel id="vincular-modulos-label">
              {modulesLoading ? 'Carregando...' : 'Módulos'}
            </InputLabel>
            <Select
              labelId="vincular-modulos-label"
              multiple
              value={vincularModulos}
              onChange={(e) => setVincularModulos(e.target.value)}
              label={modulesLoading ? 'Carregando...' : 'Módulos'}
              endAdornment={modulesLoading ? <CircularProgress size={18} sx={{ mr: 2 }} /> : null}
              renderValue={(selected) =>
                unitModules
                  .filter((m) => selected.includes(m.modulo_public_id))
                  .map((m) => (
                    <Chip key={m.modulo_public_id} label={m.abreviacao} size="small" sx={{ mr: 0.5 }} />
                  ))
              }
            >
              {unitModules.map((mod) => (
                <MenuItem key={mod.modulo_public_id} value={mod.modulo_public_id}>
                  <Checkbox checked={vincularModulos.includes(mod.modulo_public_id)} />
                  <ListItemText primary={mod.nome} secondary={mod.abreviacao} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Resumo antes de salvar */}
          {vincularInstructor && vincularUnit && vincularModulos.length > 0 && (
            <>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
              <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Resumo do vínculo</Typography>
                <Typography variant="body2"><strong>{vincularInstructor.nome}</strong> → {vincularUnit.unidade}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                  {unitModules
                    .filter((m) => vincularModulos.includes(m.modulo_public_id))
                    .map((m) => (
                      <Chip key={m.modulo_public_id} label={m.abreviacao} size="small" variant="outlined" color="primary" />
                    ))}
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVincularClose} disabled={vincularLoading}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleVincularSubmit}
            disabled={vincularLoading || !vincularInstructor || !vincularUnit || !vincularModulos.length}
          >
            {vincularLoading ? 'Salvando...' : 'Vincular'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default GestaoUsuarios;
