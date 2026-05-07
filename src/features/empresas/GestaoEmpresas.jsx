import React, { useEffect, useState, useMemo } from 'react';
import {
  createCompanie,
  getModules,
  getStats,
  getCompanies,
  formatApiError,
  getAllUsersByIdCompany,
  updateCompaniesById,
  addUnit,
  getAllCompanies
} from '../../services/api/ApiService';
import { 
  Add, 
  Business, 
  ViewModule, 
  Groups3, 
  Store, 
  Search,
  MoreVert,
  Edit,
  Delete
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  Grid,
  Grow,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  Menu,
  Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';

const getModulesColor = (moduleName) => {
  const colors = {
    'TR': { backgroundColor: 'rgba(37, 99, 235, 0.1)', textColor: '#60a5fa', border: 'rgba(59, 130, 246, 0.5)' },
    'GL': { backgroundColor: 'rgba(245, 158, 11, 0.1)', textColor: '#fbbf24', border: 'rgba(245, 158, 11, 0.5)' },
    'default': { backgroundColor: 'rgba(255, 255, 255, 0.05)', textColor: '#94a3b8', border: 'rgba(255, 255, 255, 0.2)' }
  };
  return colors[moduleName] || colors['default'];
};

const getRolesColor = (roleName) => {
  const colors = {
    'instrutor': { backgroundColor: 'rgba(37, 99, 235, 0.1)', textColor: '#60a5fa', border: 'rgba(59, 130, 246, 0.5)' },
    'user_master': { backgroundColor: 'rgba(245, 158, 11, 0.1)', textColor: '#fbbf24', border: 'rgba(245, 158, 11, 0.5)' },
    'admin': { backgroundColor: 'rgba(139, 92, 246, 0.1)', textColor: '#a78bfa', border: 'rgba(139, 92, 246, 0.5)' },
    'padrao': { backgroundColor: 'rgba(255, 255, 255, 0.05)', textColor: '#94a3b8', border: 'rgba(255, 255, 255, 0.2)' },
    'default': { backgroundColor: 'rgba(255, 255, 255, 0.05)', textColor: '#94a3b8', border: 'rgba(255, 255, 255, 0.2)' }
  };
  return colors[roleName] || colors['default'];
};

function StatCard({ title, value, icon: Icon, gradient, delay = 0, isLoading = false }) {
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
  const [isEditing, setIsEditing] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [usersOpen, setUsersOpen] = useState(false);
  const [editCompanieOpen, setEditCompanieOpen] = useState(false);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [allCompaniesList, setAllCompaniesList] = useState([]);
  const [unitFormData, setUnitFormData] = useState({
    empresa_id: '',
    unidade: '',
    cnpj: '',
    modulo: [],
  });
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

  const columns = useMemo(() => [
    {
      field: 'nome',
      headerName: 'Empresa',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'unidade',
      headerName: 'Unidade',
      width: 300,
    },
    {
      field: 'cnpj',
      headerName: 'CNPJ',
      width: 250,
      renderCell: (params) => {
        if (!params.value) return '—';
        return params.value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
      }
    },
    {
      field: 'modulos',
      headerName: 'Módulos',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {params.value?.length
            ? params.value.map((mod) => {
                const style = getModulesColor(mod.abreviacao);
                return (
                  <Chip 
                    key={mod.id} 
                    label={mod.abreviacao || mod.nome} 
                    size="small" 
                    variant="outlined"
                    sx={{
                      color: style.textColor,
                      backgroundColor: style.backgroundColor,
                      borderColor: style.border,
                      fontWeight: 600
                    }}
                  />
              )})
            : <Typography variant="caption" color="text.disabled">—</Typography>
          }
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 80,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleMenuOpen(e, params.row);
          }}
          sx={{ 
            color: 'text.secondary',
            '&:hover': { color: 'primary.main', bgcolor: 'rgba(255,255,255,0.05)' }
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      ),
    },
  ], []);

  const usersColumns = useMemo(() => [
    { 
      field: 'nome', 
      headerName: 'Nome', 
      flex: 1
    },
    { 
      field: 'email', 
      headerName: 'E-mail', 
      flex: 1 
    },
    { 
      field: 'cargo', 
      headerName: 'Cargo', 
      width: 150,
      renderCell: (params) => {
        if (!params.value) return <Typography variant="caption" color="text.disabled">—</Typography>;
        const style = getRolesColor(params.value);
        const displayLabel = params.value === 'user_master' ? 'Master' : params.value.replace('_', ' ');
        return (
          <Chip 
            label={displayLabel} 
            size="small" 
            variant="outlined"
            sx={{
              color: style.textColor,
              backgroundColor: style.backgroundColor,
              borderColor: style.border,
              fontWeight: 600,
              textTransform: 'capitalize'
            }}
          />
        );
      }
    },
  ], []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response_stats = await getStats();
        setStats(response_stats.data);

        const response_companies = await getCompanies();
        setCompanies(response_companies.data || []);
      } finally {
        setStatsLoading(false);
      }
    };

    if (!open) {
      loadStats();
    }
  }, [open]);

  const filteredCompanies = useMemo(() => {
    console.log("Filtrando empresas...");
    const term = searchTerm.toLowerCase();

    return companies.filter((emp) => {
      return (
        emp.nome?.toLowerCase().includes(term) ||
        emp.cnpj?.includes(term)
      );
    });
  }, [companies, searchTerm]);

  const handleOpen = async () => {
    setError('');
    setSuccess('');
    setIsEditing(false);
    const response = await getModules();
    setModules(response.data);
    setFormData({ nome: '', cnpj: '', unidade: '', modulos: [] });
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
      if (isEditing) {
        await updateCompaniesById(selectedCompany.public_id, formData);
        console.log(formData.modulos)
        setSuccess('Empresa atualizada com sucesso!');
      } else {
        const { modulos, ...rest } = formData;
        await createCompanie({ ...rest, modulo: modulos });
        setSuccess('Empresa cadastrada com sucesso!');
      }
      setTimeout(handleClose, 3000);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, company) => {
    setAnchorEl(event.currentTarget);
    setSelectedCompany(company);
  }

  const handleMenuClose = () => setAnchorEl(null);

  const handleViewUsers = async () => {
    if (!selectedCompany) return;
    
    handleMenuClose();
    setError('');
    setCompanyUsers([]);
    setUsersOpen(true);
    setUsersLoading(true);
    
    try {
      const response = await getAllUsersByIdCompany(selectedCompany.public_id);
      setCompanyUsers(response.data || []);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setUsersLoading(false);
    }
  };

  const handleEditCompanies = async () => {
    if (!selectedCompany) return;

    handleMenuClose();
    setError('');
    setSuccess('');
    setIsEditing(true);
    
    try {
      const response = await getModules();
      setModules(response.data);

      const existingModules = selectedCompany.modulos || [];
      const selectedPublicIds = response.data
        .filter(m =>
          existingModules.some(em =>
            (em.id && em.id === m.id) ||
            (em.nome && em.nome === m.nome) ||
            (em.abreviacao && em.abreviacao === m.abreviacao)
          )
        )
        .map(m => m.public_id);

      setFormData({
        nome: selectedCompany.nome || '',
        cnpj: selectedCompany.cnpj || '',
        unidade: selectedCompany.unidade || '',
        modulos: selectedPublicIds,
      });

      setOpen(true);
    } catch (err) {
      setError('Erro ao carregar dados para edição.');
    }
  }

  const handleUnitOpen = async () => {
    setError('');
    setSuccess('');
    try {
      const [companiesRes, modulesRes] = await Promise.all([getAllCompanies(), getModules()]);
      setAllCompaniesList(companiesRes.data || []);
      setModules(modulesRes.data || []);
      setUnitFormData({ empresa_id: '', unidade: '', cnpj: '', modulo: [] });
      setUnitOpen(true);
    } catch (err) {
      setError('Erro ao carregar dados necessários.');
    }
  };

  const handleUnitClose = () => {
    setUnitOpen(false);
  };

  const handleUnitSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { empresa_id, ...data } = unitFormData;
      await addUnit(empresa_id, data);
      setSuccess('Unidade cadastrada com sucesso!');
      setTimeout(handleUnitClose, 3000);
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<Business />} onClick={handleUnitOpen} sx={{ borderRadius: 2 }}>
                Nova Unidade
              </Button>
              <Button variant="contained" startIcon={<Store />} onClick={handleOpen} sx={{ borderRadius: 2 }}>
                Nova Empresa
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Empresas cadastradas" value={stats.total_empresas} icon={Business} gradient="linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)" isLoading={statsLoading} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Unidades cadastradas" value={stats.total_unidades} icon={Store} gradient="linear-gradient(135deg, #5f46ff 0%, #501bff 100%)" isLoading={statsLoading} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Módulos disponíveis" value={stats.total_modulos} icon={ViewModule} gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" isLoading={statsLoading} delay={200} />
            </Grid>
          </Grid>

          <Grow in timeout={1200}>
            <Card sx={{ 
              borderRadius: 2, 
              border: '1px solid rgba(255,255,255,0.08)', 
              bgcolor: 'background.paper' 
            }}>
              
              <Box sx={{ p: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography sx={{ p: 2, fontWeight: 'bold'}}>
                  Encontre todas as {stats.total_empresas} empresas e suas respectivas unidades cadastradas no sistema
                </Typography>
                <TextField
                  size="small"
                  placeholder="Buscar empresa por nome ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ p: 1, width: { xs: '100%', sm: 700 } }}
                />
              </Box>

              <Box sx={{ p: 1, height: 500, width: '100%' }}>
                <DataGrid
                  rows={filteredCompanies}
                  columns={columns}
                  loading={statsLoading}
                  getRowId={(row) => row.public_id}
                  localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  pageSizeOptions={[5, 10, 25, 50]}
                  rowHeight={64}
                  disableRowSelectionOnClick
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' },
                    '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' },
                    '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(255,255,255,0.02)' },
                    '& .MuiDataGrid-footerContainer': { borderColor: 'rgba(255,255,255,0.05)' },
                  }}
                />
              </Box>
            </Card>
          </Grow>
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
                {isEditing ? <Store /> : <Store />}
                </Box>
                {isEditing ? 'Editar Empresa' : 'Vincule uma nova empresa'}
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
              value={formData.modulos}
              onChange={(e) => setFormData({ ...formData, modulos: e.target.value })}
              label="Módulos"
              renderValue={(selected) => {
                const selectedNames = modules
                  .filter(mod => selected.includes(mod.public_id))
                  .map(mod => mod.nome);
                return selectedNames.join(', ');
              }}
            >
              {modules?.map((mod) => (
                <MenuItem key={mod.public_id} value={mod.public_id}>
                  <Checkbox checked={formData.modulos.indexOf(mod.public_id) > -1} />
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

      <Dialog open={unitOpen} onClose={handleUnitClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Fade in={unitOpen} timeout={800}>
            <Box sx={{ pt: 2, textAlign: 'center' }}>
              <Typography variant='h4' component='span' sx={{ fontWeight: 'bold', letterSpacing: 1}}>
                <Box><Store /></Box>
                Adicionar Nova Unidade
              </Typography>
            </Box>
          </Fade>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-company-label">Empresa</InputLabel>
            <Select
              labelId="select-company-label"
              value={unitFormData.empresa_id}
              onChange={(e) => setUnitFormData({ ...unitFormData, empresa_id: e.target.value })}
              label="Empresa"
            >
              {allCompaniesList.map((emp) => (
                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                  {emp.nome} {emp.cnpj_base ? `(${emp.cnpj_base})` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="Nome da Unidade" fullWidth margin="normal" value={unitFormData.unidade} onChange={(e) => setUnitFormData({ ...unitFormData, unidade: e.target.value })} />
          <TextField label="CNPJ" fullWidth margin="normal" value={unitFormData.cnpj} onChange={(e) => setUnitFormData({ ...unitFormData, cnpj: e.target.value })} />

          <FormControl fullWidth margin="normal">
            <InputLabel id="select-unit-modulos-label">Módulos</InputLabel>
            <Select
              labelId="select-unit-modulos-label"
              multiple
              value={unitFormData.modulo}
              onChange={(e) => setUnitFormData({ ...unitFormData, modulo: e.target.value })}
              label="Módulos"
              renderValue={(selected) => {
                const selectedNames = modules
                  .filter(mod => selected.includes(mod.public_id))
                  .map(mod => mod.nome);
                return selectedNames.join(', ');
              }}
            >
              {modules?.map((mod) => (
                <MenuItem key={mod.public_id} value={mod.public_id}>
                  <Checkbox checked={unitFormData.modulo.indexOf(mod.public_id) > -1} />
                  <ListItemText primary={mod.nome} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUnitClose} disabled={loading}>Cancelar</Button>
          <Button variant="contained" onClick={handleUnitSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { 
            minWidth: 180, 
            bgcolor: '#1e1e1e',
            border: '1px solid rgba(255,255,255,0.1)' 
          }
        }}
      >
        <MenuItem onClick={handleEditCompanies}>
          <Edit fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="body2">Editar Empresa</Typography>
        </MenuItem>

        <MenuItem onClick={handleViewUsers}>
          <Groups3 fontSize="small" sx={{ mr: 1.5, color: 'info.main' }} />
          <Typography variant="body2">Visualizar Usuários</Typography>
        </MenuItem> 

        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />

        <MenuItem onClick={() => { /* Lógica de Deletar */ handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1.5 }} />
          <Typography variant="body2">Remover Empresa</Typography>
        </MenuItem>
      </Menu>

      <Dialog open={usersOpen} onClose={() => setUsersOpen(false)} fullWidth maxWidth="md">
        <DialogTitle variant='h4' component='span' sx={{ fontWeight: 'bold', letterSpacing: 1}}>
          Usuários vinculados - {selectedCompany?.nome}
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={companyUsers}
              columns={usersColumns}
              loading={usersLoading}
              getRowId={(row) => row.public_id}
              localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
              disableRowSelectionOnClick
              sx={{ border: 'none' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setUsersOpen(false);
              setSelectedCompany(null);
              setError('');
            }} 
            variant="outlined"
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default GestaoEmpresas;
