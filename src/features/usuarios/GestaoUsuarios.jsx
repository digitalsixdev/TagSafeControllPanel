import React, { useEffect, useState, useMemo } from 'react';
import {
  createUser,
  getRoles,
  getCompanies,
  formatApiError,
  getAllCompanies,
  setUnitsAttended,
  getUserByEmail,
  getUnitByCompanieId,
  addUnitToUser,
  getAllUsersQuantity,
  getAllUsers,
  getCompanyById,
  getStats,
  updateNameByPublicId,
  updateRolesByPublicId,
  getRolesByUserId,
} from '../../services/api/ApiService';
import { People, Groups3, LinkRounded, AdminPanelSettings, School, ManageAccounts, Search, CheckCircle, HourglassEmpty, MoreVert, Edit, Business, Close } from '@mui/icons-material';
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
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
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
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';

const getRolesColor = (roleName) => {
  const colors = {
    'instrutor':   { backgroundColor: 'rgba(37, 99, 235, 0.1)',   textColor: '#60a5fa', border: 'rgba(59, 130, 246, 0.5)' },
    'user_master': { backgroundColor: 'rgba(245, 158, 11, 0.1)',  textColor: '#fbbf24', border: 'rgba(245, 158, 11, 0.5)' },
    'admin':       { backgroundColor: 'rgba(139, 92, 246, 0.1)',  textColor: '#a78bfa', border: 'rgba(139, 92, 246, 0.5)' },
    'padrao':      { backgroundColor: 'rgba(255, 255, 255, 0.05)', textColor: '#94a3b8', border: 'rgba(255, 255, 255, 0.2)' },
    'default':     { backgroundColor: 'rgba(255, 255, 255, 0.05)', textColor: '#94a3b8', border: 'rgba(255, 255, 255, 0.2)' },
  };
  return colors[roleName] || colors['default'];
};

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

  // seção de unidades atendidas no dialog de criar usuário (instrutor)
  const [instrEmpresaListLoading, setInstrEmpresaListLoading] = useState(false);
  const [instrEmpresaId, setInstrEmpresaId] = useState('');
  const [instrUnits, setInstrUnits] = useState([]);
  const [instrUnitsLoading, setInstrUnitsLoading] = useState(false);
  const [instrUnit, setInstrUnit] = useState(null);
  const [instrUnitModules, setInstrUnitModules] = useState([]);
  const [instrModulos, setInstrModulos] = useState([]);
  const [instrUnidades, setInstrUnidades] = useState([]);
  const [instrError, setInstrError] = useState('');

  // "Vincular Instrutores" dialog
  const [vincularOpen, setVincularOpen] = useState(false);
  const [vincularLoading, setVincularLoading] = useState(false);
  const [vincularError, setVincularError] = useState('');
  const [vincularSuccess, setVincularSuccess] = useState('');
  const [vincularEmail, setVincularEmail] = useState('');
  const [vincularEmailLoading, setVincularEmailLoading] = useState(false);
  const [vincularUser, setVincularUser] = useState(null);
  const [allCompaniesList, setAllCompaniesList] = useState([]);
  const [vincularEmpresaId, setVincularEmpresaId] = useState('');
  const [vincularUnits, setVincularUnits] = useState([]);
  const [vincularUnitsLoading, setVincularUnitsLoading] = useState(false);
  const [vincularUnit, setVincularUnit] = useState(null);
  const [unitModules, setUnitModules] = useState([]);
  const [vincularModulos, setVincularModulos] = useState([]);
  const [unidadesAdicionadas, setUnidadesAdicionadas] = useState([]);

  // "Vincular Unidades" dialog
  const [unidadeOpen, setUnidadeOpen] = useState(false);
  const [unidadeLoading, setUnidadeLoading] = useState(false);
  const [unidadeError, setUnidadeError] = useState('');
  const [unidadeSuccess, setUnidadeSuccess] = useState('');
  const [unidadeEmail, setUnidadeEmail] = useState('');
  const [unidadeEmailLoading, setUnidadeEmailLoading] = useState(false);
  const [unidadeUser, setUnidadeUser] = useState(null);
  const [unidadeUnits, setUnidadeUnits] = useState([]);
  const [unidadeUnitsLoading, setUnidadeUnitsLoading] = useState(false);
  const [unidadeSelectedUnit, setUnidadeSelectedUnit] = useState('');
  const [usersQuantity, setUsersQuantity] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersSearchTerm, setUsersSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [allRoles, setAllRoles] = useState([]);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewUnitsOpen, setViewUnitsOpen] = useState(false);
  const [viewUnitsUser, setViewUnitsUser] = useState(null);

  // "Editar Usuário" dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRoles, setEditRoles] = useState([]);

  const handleUserMenuOpen = (event, row) => {
    setUserMenuAnchor(event.currentTarget);
    setSelectedUser(row);
  };
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
    setSelectedUser(null);
  };
  const handleViewUnits = () => {
    setViewUnitsUser(selectedUser);
    setUserMenuAnchor(null);
    setSelectedUser(null);
    setViewUnitsOpen(true);
  };
  const handleViewUnitsClose = () => {
    setViewUnitsOpen(false);
    setViewUnitsUser(null);
  };

  const handleEditOpen = () => {
    if (!selectedUser) return;
    setEditUser(selectedUser);
    setEditName(selectedUser.nome || '');
    setEditRoles(selectedUser.roles?.map(r => r.public_id) || []);
    setEditError('');
    setEditSuccess('');
    setUserMenuAnchor(null);
    setSelectedUser(null);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditError('');
    setEditSuccess('');
    setEditUser(null);
  };

  const handleEditSubmit = async () => {
    if (!editUser) return;

    const originalRoles = editUser.roles?.map(r => r.public_id) || [];
    const nameChanged = editName.trim() !== (editUser.nome || '').trim();
    const rolesChanged =
      editRoles.length !== originalRoles.length ||
      editRoles.some(id => !originalRoles.includes(id));

    if (!nameChanged && !rolesChanged) {
      setEditError('Nenhuma alteração detectada.');
      return;
    }

    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const requests = [];
      if (nameChanged) requests.push(updateNameByPublicId(editUser.public_id, editName.trim()));
      if (rolesChanged) requests.push(updateRolesByPublicId(editUser.public_id, editRoles));
      await Promise.all(requests);
      setEditSuccess('Usuário atualizado com sucesso!');
      loadStats();
      setTimeout(handleEditClose, 2000);
    } catch (err) {
      setEditError(formatApiError(err));
    } finally {
      setEditLoading(false);
    }
  };

  const roleConfig = {
    total:       { label: 'Total de Usuários', icon: Groups3,            gradient: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)' },
    padrao:      { label: 'Padrão',            icon: People,             gradient: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)' },
    admin:       { label: 'Administrador',     icon: AdminPanelSettings, gradient: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)' },
    instrutor:   { label: 'Instrutor',         icon: School,             gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' },
    user_master: { label: 'Master',            icon: ManageAccounts,     gradient: 'linear-gradient(135deg, #0f172a 0%, #172554 100%)' },
  };

  const loadStats = async () => {
    try {
      const [statsRes, quantityRes, usersRes, rolesRes] = await Promise.all([
        getStats(), getAllUsersQuantity(), getAllUsers(), getRoles(),
      ]);
      setAllRoles(rolesRes.data || []);
      setStats(statsRes.data);
      setUsersQuantity(quantityRes.data || []);
      const rawUsers = usersRes.data || [];
      const uniqueEmpresaIds = [...new Set(rawUsers.map(u => u.empresa_id).filter(Boolean))];
      const empresaResults = await Promise.all(uniqueEmpresaIds.map(id => getCompanyById(id)));
      const companiesMap = {};
      empresaResults.forEach((res, i) => { companiesMap[uniqueEmpresaIds[i]] = res.data?.nome || '—'; });
      setUsers(rawUsers.map(u => ({ ...u, empresa: companiesMap[u.empresa_id] || '—' })));
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  useEffect(() => {
    const isInstrutor = roles.find(r => r.public_id === formData.roles)?.nome === 'instrutor';
    if (!isInstrutor || allCompaniesList.length > 0) return;
    setInstrEmpresaListLoading(true);
    getAllCompanies()
      .then(res => setAllCompaniesList(res.data || []))
      .catch(() => {})
      .finally(() => setInstrEmpresaListLoading(false));
  }, [formData.roles]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setInstrEmpresaId('');
    setInstrUnits([]);
    setInstrUnit(null);
    setInstrUnitModules([]);
    setInstrModulos([]);
    setInstrUnidades([]);
    setInstrError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createUser(formData);
      if (instrUnidades.length > 0) {
        const allUsersRes = await getAllUsers();
        const newUser = (allUsersRes.data || []).find(u => u.email === formData.email);
        const newUserPublicId = newUser?.public_id;
        const unidades_atendidas = instrUnidades.map(({ unit, modulos }) => ({
          id: unit.public_id,
          modulos,
        }));
        await setUnitsAttended(newUserPublicId, unidades_atendidas);
      }
      setSuccess('Usuário cadastrado com sucesso!');
      loadStats();
      setTimeout(handleClose, 3000);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const usersColumns = useMemo(() => [
    { field: 'nome', headerName: 'Nome', flex: 1, minWidth: 160 },
    { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 200 },
    { field: 'empresa', headerName: 'Empresa', flex: 1, minWidth: 160, renderCell: (params) => params.value || '—' },
    {
      field: 'primeiro_acesso',
      headerName: 'Primeiro Acesso',
      width: 140,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const pendente = params.value === true;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            {pendente ? (
              <HourglassEmpty sx={{ color: '#f59e0b', fontSize: 20 }} titleAccess="Aguardando primeiro acesso" />
            ) : (
              <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} titleAccess="Primeiro acesso concluído" />
            )}
          </Box>
        );
      },
    },
    {
      field: 'roles',
      headerName: 'Cargo',
      width: 160,
      sortable: false,
      renderCell: (params) => {
        const role = params.value?.[0];
        if (!role) return <Typography variant="caption" color="text.disabled">—</Typography>;
        const style = getRolesColor(role.nome);
        const label = role.nome === 'user_master' ? 'Master' : role.nome.charAt(0).toUpperCase() + role.nome.slice(1);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip label={label} size="small" variant="outlined" sx={{ color: style.textColor, backgroundColor: style.backgroundColor, borderColor: style.border, fontWeight: 700 }} />
          </Box>
        );
      },
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
            handleUserMenuOpen(e, params.row);
          }}
          sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(255,255,255,0.05)' } }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      ),
    },
  ], []);

  const filteredUsers = useMemo(() => {
    const term = usersSearchTerm.toLowerCase();
    return users.filter(u => {
      const matchSearch =
        u.nome?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.empresa?.toLowerCase().includes(term);
      const matchRole = !roleFilter || u.roles?.[0]?.nome === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, usersSearchTerm, roleFilter]);

  // set para unificar as empresas sem precisar de uma nova rota
  const uniqueCompanyNames = useMemo(() => {
    const names = companies.map(c => c.nome).filter(Boolean);
    return [...new Set(names)].sort();
  }, [companies]);

  const filteredUnits = useMemo(() => {
    return companies.filter(c => c.nome === selectedCompanyName);
  }, [companies, selectedCompanyName]);

  // handlers da seção de instrutor no dialog de criar usuário
  const handleInstrEmpresaChange = async (empresaId) => {
    setInstrEmpresaId(empresaId);
    setInstrUnits([]);
    setInstrUnit(null);
    setInstrUnitModules([]);
    setInstrModulos([]);
    setInstrError('');
    if (!empresaId) return;
    setInstrUnitsLoading(true);
    try {
      const res = await getUnitByCompanieId(empresaId);
      const raw = res.data;
      setInstrUnits(Array.isArray(raw) ? raw : raw ? [raw] : []);
    } catch {
      setInstrError('Erro ao carregar unidades.');
    } finally {
      setInstrUnitsLoading(false);
    }
  };

  const handleInstrUnitChange = (publicId) => {
    const unit = instrUnits.find(u => u.public_id === publicId) || null;
    setInstrUnit(unit);
    setInstrUnitModules(unit?.modulos || []);
    setInstrModulos([]);
  };

  const handleInstrAdicionarUnidade = () => {
    if (!instrUnit || !instrModulos.length) return;
    const jaAdicionada = instrUnidades.some(u => u.unit.public_id === instrUnit.public_id);
    if (jaAdicionada) {
      setInstrError('Essa unidade já foi adicionada.');
      return;
    }
    const empresa = allCompaniesList.find(e => e.empresa_id === instrEmpresaId)?.nome || '';
    setInstrUnidades(prev => [...prev, { unit: instrUnit, modulos: instrModulos, empresa }]);
    setInstrUnit(null);
    setInstrUnitModules([]);
    setInstrModulos([]);
    setInstrError('');
  };

  const handleInstrRemoverUnidade = (index) => {
    setInstrUnidades(prev => prev.filter((_, i) => i !== index));
  };

  // handlers de vincular instrutores
  const resetVincular = () => {
    setVincularEmail('');
    setVincularUser(null);
    setVincularEmpresaId('');
    setVincularUnits([]);
    setVincularUnit(null);
    setUnitModules([]);
    setVincularModulos([]);
    setUnidadesAdicionadas([]);
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

  const handleBuscarInstrutor = async () => {
    if (!vincularEmail.trim()) return;
    setVincularEmailLoading(true);
    setVincularError('');
    setVincularUser(null);
    setVincularEmpresaId('');
    setVincularUnits([]);
    setVincularUnit(null);
    setUnitModules([]);
    setVincularModulos([]);
    setUnidadesAdicionadas([]);
    try {
      const userRes = await getUserByEmail(vincularEmail.trim());
      const user = userRes.data;
      const rolesRes = await getRolesByUserId(user.public_id);
      const roles = rolesRes.data || [];
      const isInstrutor = roles.some(r => r.nome === 'instrutor');
      if (!isInstrutor) {
        setVincularError('O usuário existe, mas não é um instrutor.');
        return;
      }
      setVincularUser(user);
    } catch (err) {
      const status = err?.response?.status;
      setVincularError(status === 404 ? 'Usuário não encontrado.' : formatApiError(err));
    } finally {
      setVincularEmailLoading(false);
    }
  };

  const handleEmpresaChange = async (empresaId) => {
    setVincularEmpresaId(empresaId);
    setVincularUnits([]);
    setVincularUnit(null);
    setUnitModules([]);
    setVincularModulos([]);
    setVincularError('');
    if (!empresaId) return;
    setVincularUnitsLoading(true);
    try {
      const res = await getUnitByCompanieId(empresaId);
      const raw = res.data;
      setVincularUnits(Array.isArray(raw) ? raw : raw ? [raw] : []);
    } catch {
      setVincularError('Erro ao carregar unidades.');
    } finally {
      setVincularUnitsLoading(false);
    }
  };

  const handleVincularUnitChange = (publicId) => {
    const unit = vincularUnits.find(u => u.public_id === publicId) || null;
    setVincularUnit(unit);
    setUnitModules(unit?.modulos || []);
    setVincularModulos([]);
  };

  const handleAdicionarUnidade = () => {
    if (!vincularUnit || !vincularModulos.length) return;
    const jaAdicionada = unidadesAdicionadas.some(u => u.unit.public_id === vincularUnit.public_id);
    if (jaAdicionada) {
      setVincularError('Essa unidade já foi adicionada.');
      return;
    }
    const empresa = allCompaniesList.find(e => e.empresa_id === vincularEmpresaId)?.nome || '';
    setUnidadesAdicionadas(prev => [...prev, { unit: vincularUnit, modulos: vincularModulos, empresa }]);
    setVincularUnit(null);
    setUnitModules([]);
    setVincularModulos([]);
    setVincularError('');
  };

  const handleRemoverUnidade = (index) => {
    setUnidadesAdicionadas(prev => prev.filter((_, i) => i !== index));
  };

  const handleVincularSubmit = async () => {
    if (!vincularUser || !unidadesAdicionadas.length) return;
    setVincularLoading(true);
    setVincularError('');
    setVincularSuccess('');
    try {
      const unidades_atendidas = unidadesAdicionadas.map(({ unit, modulos }) => ({
        id: unit.public_id,
        modulos,
      }));
      await setUnitsAttended(vincularUser.public_id, unidades_atendidas);
      setVincularSuccess('Instrutor vinculado com sucesso!');
      setTimeout(handleVincularClose, 2000);
    } catch (err) {
      setVincularError(formatApiError(err));
    } finally {
      setVincularLoading(false);
    }
  };

  // handlers de vincular unidades
  const handleUnidadeOpen = () => {
    setUnidadeEmail('');
    setUnidadeUser(null);
    setUnidadeUnits([]);
    setUnidadeSelectedUnit('');
    setUnidadeError('');
    setUnidadeSuccess('');
    setUnidadeOpen(true);
  };

  const handleUnidadeClose = () => {
    setUnidadeOpen(false);
    setUnidadeError('');
    setUnidadeSuccess('');
  };

  const handleBuscarUsuario = async () => {
    if (!unidadeEmail.trim()) return;
    setUnidadeEmailLoading(true);
    setUnidadeError('');
    setUnidadeUser(null);
    setUnidadeUnits([]);
    setUnidadeSelectedUnit('');
    try {
      const res = await getUserByEmail(unidadeEmail.trim());
      const user = res.data;
      setUnidadeUser(user);
      if (!user.empresa_id) return;
      setUnidadeUnitsLoading(true);
      try {
        const unitsRes = await getUnitByCompanieId(user.empresa_id);
        const raw = unitsRes.data;
        setUnidadeUnits(Array.isArray(raw) ? raw : raw ? [raw] : []);
      } catch (err) {
        setUnidadeError(`Unidades: ${formatApiError(err)}`);
      } finally {
        setUnidadeUnitsLoading(false);
      }
    } catch (err) {
      const status = err?.response?.status;
      setUnidadeError(status === 404 ? 'Usuário não encontrado.' : formatApiError(err));
    } finally {
      setUnidadeEmailLoading(false);
    }
  };

  const handleUnidadeSubmit = async () => {
    if (!unidadeUser || !unidadeSelectedUnit) return;
    setUnidadeLoading(true);
    setUnidadeError('');
    setUnidadeSuccess('');
    try {
      await addUnitToUser(unidadeUser.public_id, unidadeSelectedUnit);
      setUnidadeSuccess('Unidade vinculada com sucesso!');
      setTimeout(handleUnidadeClose, 2000);
    } catch (err) {
      setUnidadeError(formatApiError(err));
    } finally {
      setUnidadeLoading(false);
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
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[
                { label: 'Vincular Instrutores', icon: <LinkRounded />, onClick: handleVincularOpen },
                { label: 'Vincular Unidades',    icon: <LinkRounded />, onClick: handleUnidadeOpen },
                { label: 'Novo Usuário',          icon: <People />,      onClick: handleOpen },
              ].map(({ label, icon, onClick }) => (
                <Button
                  key={label}
                  variant="text"
                  startIcon={icon}
                  onClick={onClick}
                  sx={{
                    borderRadius: 2,
                    color: 'rgba(255,255,255,0.65)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.16)',
                      color: 'rgba(255,255,255,0.95)',
                    },
                  }}
                >
                  {label}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            {[{ role: 'total', quantidade: stats.total_usuarios }, ...usersQuantity].map((item, i) => {
              const config = roleConfig[item.role] || { label: item.role, icon: People, gradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)' };
              return (
                <Box key={item.role} sx={{ flex: '1 1 200px', minWidth: 0 }}>
                  <StatCard title={config.label} value={item.quantidade} icon={config.icon} gradient={config.gradient} delay={i * 100} isLoading={statsLoading} />
                </Box>
              );
            })}
          </Box>

          <Grow in timeout={1200}>
            <Card sx={{ borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'background.paper' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}>
                  Encontre todos os {stats.total_usuarios} usuários cadastrados no sistema
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Buscar por nome, e-mail ou empresa..."
                    value={usersSearchTerm}
                    onChange={(e) => setUsersSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: { xs: '100%', sm: 400 } }}
                  />
                  <Select
                    size="small"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    displayEmpty
                    renderValue={(val) => {
                      if (!val) return 'Todos os cargos';
                      const role = allRoles.find(r => r.nome === val);
                      return role?.nome === 'user_master' ? 'Master' : role?.nome.charAt(0).toUpperCase() + role?.nome.slice(1);
                    }}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {allRoles.map(r => (
                      <MenuItem key={r.public_id} value={r.nome}>
                        {r.nome === 'user_master' ? 'Master' : r.nome.charAt(0).toUpperCase() + r.nome.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Box>
              <Box sx={{ p: 1, height: 500, width: '100%' }}>
                <DataGrid
                  rows={filteredUsers}
                  columns={usersColumns}
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
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-roles-label">Cargo</InputLabel>
            <Select
              labelId="select-roles-label"
              value={formData.roles || ''}
              onChange={(e) => {
                setFormData({ ...formData, roles: e.target.value, senha: '' });
                setInstrEmpresaId(''); setInstrUnits([]); setInstrUnit(null);
                setInstrUnitModules([]); setInstrModulos([]); setInstrUnidades([]); setInstrError('');
              }}
              label="Cargo"
            >
              {roles?.map((rol) => (
                <MenuItem key={rol.public_id} value={rol.public_id}>{rol.nome}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {roles.find(r => r.public_id === formData.roles)?.nome === 'user_master' && (
            <TextField label="Senha" fullWidth margin="normal" value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} />
          )}

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

          {roles.find(r => r.public_id === formData.roles)?.nome === 'instrutor' && (
            <>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Unidades atendidas pelo instrutor
              </Typography>

              {instrError && <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{instrError}</Alert>}

              <FormControl fullWidth margin="normal" disabled={instrEmpresaListLoading}>
                <InputLabel id="instr-empresa-label">{instrEmpresaListLoading ? 'Carregando...' : 'Empresa'}</InputLabel>
                <Select
                  labelId="instr-empresa-label"
                  value={instrEmpresaId}
                  onChange={(e) => handleInstrEmpresaChange(e.target.value)}
                  label={instrEmpresaListLoading ? 'Carregando...' : 'Empresa'}
                  endAdornment={instrEmpresaListLoading ? <CircularProgress size={18} sx={{ mr: 2 }} /> : null}
                >
                  {allCompaniesList.map(emp => (
                    <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {instrEmpresaId && (
                <FormControl fullWidth margin="normal" disabled={instrUnitsLoading}>
                  <InputLabel id="instr-unit-label">{instrUnitsLoading ? 'Carregando...' : 'Unidade'}</InputLabel>
                  <Select
                    labelId="instr-unit-label"
                    value={instrUnit?.public_id || ''}
                    onChange={(e) => handleInstrUnitChange(e.target.value)}
                    label={instrUnitsLoading ? 'Carregando...' : 'Unidade'}
                    endAdornment={instrUnitsLoading ? <CircularProgress size={18} sx={{ mr: 2 }} /> : null}
                  >
                    {instrUnits.map(unit => (
                      <MenuItem key={unit.public_id} value={unit.public_id}>{unit.unidade}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {instrUnit && (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="instr-modulos-label">Módulos</InputLabel>
                  <Select
                    labelId="instr-modulos-label"
                    multiple
                    value={instrModulos}
                    onChange={(e) => setInstrModulos(e.target.value)}
                    label="Módulos"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {instrUnitModules.filter(m => selected.includes(m.public_id)).map(m => (
                          <Chip key={m.public_id} label={m.abreviacao} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {instrUnitModules.map(mod => (
                      <MenuItem key={mod.public_id} value={mod.public_id}>
                        <Checkbox checked={instrModulos.includes(mod.public_id)} />
                        <ListItemText primary={mod.nome} secondary={mod.abreviacao} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {instrUnit && instrModulos.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button variant="outlined" size="small" onClick={handleInstrAdicionarUnidade}>
                    + Adicionar unidade
                  </Button>
                </Box>
              )}

              {instrUnidades.length > 0 && (
                <>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Unidades a vincular ({instrUnidades.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {instrUnidades.map(({ unit, modulos, empresa }, index) => (
                      <Box
                        key={unit.public_id}
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {empresa && <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>{empresa} · </Box>}
                            {unit.unidade}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {unit.modulos?.filter(m => modulos.includes(m.public_id)).map(m => (
                              <Chip key={m.public_id} label={m.abreviacao} size="small" variant="outlined" color="primary" />
                            ))}
                          </Box>
                        </Box>
                        <IconButton size="small" onClick={() => handleInstrRemoverUnidade(index)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </>
          )}
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

          {/* 1. Email */}
          <TextField
            label="E-mail do instrutor"
            fullWidth
            margin="normal"
            value={vincularEmail}
            onChange={(e) => {
              setVincularEmail(e.target.value);
              setVincularUser(null);
              setVincularEmpresaId('');
              setVincularUnits([]);
              setVincularUnit(null);
              setUnitModules([]);
              setVincularModulos([]);
              setVincularError('');
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBuscarInstrutor(); }}
            InputProps={{
              endAdornment: vincularEmailLoading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null,
            }}
            helperText="Pressione Enter para buscar"
          />

          {/* 2. Confirmação do instrutor */}
          {vincularUser && (
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(49,173,255,0.06)', border: '1px solid rgba(49,173,255,0.2)', mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(49,173,255,0.15)', color: '#31adff', width: 38, height: 38 }}>
                <School fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#31adff', fontWeight: 600, letterSpacing: 0.5 }} display="block">
                  Instrutor encontrado
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                  {vincularUser.nome_usuario}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {vincularUser.empresa}
                </Typography>
              </Box>
            </Box>
          )}

          {/* 3. Empresa */}
          {vincularUser && (
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
          )}

          {/* 4. Unidade */}
          {vincularUser && vincularEmpresaId && (
            <FormControl fullWidth margin="normal" disabled={vincularUnitsLoading}>
              <InputLabel id="vincular-unidade-label">
                {vincularUnitsLoading ? 'Carregando...' : 'Unidade'}
              </InputLabel>
              <Select
                labelId="vincular-unidade-label"
                value={vincularUnit?.public_id || ''}
                onChange={(e) => handleVincularUnitChange(e.target.value)}
                label={vincularUnitsLoading ? 'Carregando...' : 'Unidade'}
                endAdornment={vincularUnitsLoading ? <CircularProgress size={18} sx={{ mr: 2 }} /> : null}
              >
                {vincularUnits.map((unit) => (
                  <MenuItem key={unit.public_id} value={unit.public_id}>
                    {unit.unidade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* 5. Módulos */}
          {vincularUnit && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="vincular-modulos-label">Módulos</InputLabel>
              <Select
                labelId="vincular-modulos-label"
                multiple
                value={vincularModulos}
                onChange={(e) => setVincularModulos(e.target.value)}
                label="Módulos"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {unitModules
                      .filter(m => selected.includes(m.public_id))
                      .map(m => <Chip key={m.public_id} label={m.abreviacao} size="small" />)}
                  </Box>
                )}
              >
                {unitModules.map((mod) => (
                  <MenuItem key={mod.public_id} value={mod.public_id}>
                    <Checkbox checked={vincularModulos.includes(mod.public_id)} />
                    <ListItemText primary={mod.nome} secondary={mod.abreviacao} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Botão adicionar unidade */}
          {vincularUnit && vincularModulos.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button variant="outlined" size="small" onClick={handleAdicionarUnidade}>
                + Adicionar unidade
              </Button>
            </Box>
          )}

          {/* Lista de unidades adicionadas */}
          {unidadesAdicionadas.length > 0 && (
            <>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Unidades a vincular ({unidadesAdicionadas.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {unidadesAdicionadas.map(({ unit, modulos, empresa }, index) => (
                  <Box
                    key={unit.public_id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {empresa && <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>{empresa} · </Box>}
                        {unit.unidade}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {unit.modulos
                          ?.filter(m => modulos.includes(m.public_id))
                          .map(m => (
                            <Chip key={m.public_id} label={m.abreviacao} size="small" variant="outlined" color="primary" />
                          ))}
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={() => handleRemoverUnidade(index)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVincularClose} disabled={vincularLoading}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleVincularSubmit}
            disabled={vincularLoading || !vincularUser || !unidadesAdicionadas.length}
          >
            {vincularLoading ? 'Vinculando...' : `Vincular${unidadesAdicionadas.length > 1 ? ` (${unidadesAdicionadas.length})` : ''}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vincular Unidades dialog */}
      <Dialog open={unidadeOpen} onClose={handleUnidadeClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Fade in={unidadeOpen} timeout={800}>
            <Box sx={{ pt: 2, textAlign: 'center' }}>
              <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                <Box><LinkRounded /></Box>
                Vincular Unidade
              </Typography>
            </Box>
          </Fade>
        </DialogTitle>
        <DialogContent>
          {unidadeError && <Alert severity="error" sx={{ mb: 2 }}>{unidadeError}</Alert>}
          {unidadeSuccess && <Alert severity="success" sx={{ mb: 2 }}>{unidadeSuccess}</Alert>}

          {/* 1. Email */}
          <TextField
            label="E-mail do usuário"
            fullWidth
            margin="normal"
            value={unidadeEmail}
            onChange={(e) => { setUnidadeEmail(e.target.value); setUnidadeUser(null); setUnidadeUnits([]); setUnidadeSelectedUnit(''); setUnidadeError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBuscarUsuario(); }}
            InputProps={{
              endAdornment: unidadeEmailLoading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null,
            }}
            helperText="Pressione Enter para buscar"
          />

          {/* 2. Confirmação do usuário */}
          {unidadeUser && (
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(49,173,255,0.06)', border: '1px solid rgba(49,173,255,0.2)', mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(49,173,255,0.15)', color: '#31adff', width: 38, height: 38 }}>
                <People fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#31adff', fontWeight: 600, letterSpacing: 0.5 }} display="block">
                  Usuário encontrado
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                  {unidadeUser.nome_usuario}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {unidadeUser.empresa}
                </Typography>
              </Box>
            </Box>
          )}

          {/* 3. Unidade */}
          <FormControl fullWidth margin="normal" disabled={!unidadeUser || unidadeUnitsLoading}>
            <InputLabel id="unidade-select-label">
              {unidadeUnitsLoading ? 'Carregando...' : 'Unidade'}
            </InputLabel>
            <Select
              labelId="unidade-select-label"
              value={unidadeSelectedUnit}
              onChange={(e) => setUnidadeSelectedUnit(e.target.value)}
              label={unidadeUnitsLoading ? 'Carregando...' : 'Unidade'}
              endAdornment={unidadeUnitsLoading ? <CircularProgress size={18} sx={{ mr: 2 }} /> : null}
            >
              {unidadeUnits.map((unit) => (
                <MenuItem key={unit.public_id} value={unit.public_id}>
                  {unit.unidade}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Resumo */}
          {unidadeUser && unidadeSelectedUnit && (
            <>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(49,173,255,0.06)', border: '1px solid rgba(49,173,255,0.15)' }}>
                <Typography variant="caption" sx={{ color: '#31adff', fontWeight: 600, letterSpacing: 0.5 }} display="block" sx={{ mb: 0.5 }}>
                  Resumo do vínculo
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <Box component="span" sx={{ color: 'white', fontWeight: 600 }}>{unidadeUser.nome_usuario}</Box>
                  <Box component="span" sx={{ color: 'text.secondary', mx: 0.75 }}>→</Box>
                  <Box component="span" sx={{ color: '#31adff' }}>
                    {unidadeUnits.find(u => u.public_id === unidadeSelectedUnit)?.unidade}
                  </Box>
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUnidadeClose} disabled={unidadeLoading}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleUnidadeSubmit}
            disabled={unidadeLoading || !unidadeUser || !unidadeSelectedUnit}
          >
            {unidadeLoading ? 'Salvando...' : 'Vincular'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Visualizar Unidades dialog */}
      <Dialog open={viewUnitsOpen} onClose={handleViewUnitsClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Business sx={{ color: 'info.main' }} />
            Unidades Vinculadas
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewUnitsUser && (
            <>
              <Box sx={{ mb: 2.5, mt: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewUnitsUser.nome}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{viewUnitsUser.email}</Typography>
                {viewUnitsUser.empresa && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                    {viewUnitsUser.empresa}
                  </Typography>
                )}
              </Box>

              {(!viewUnitsUser.unidades || viewUnitsUser.unidades.length === 0) ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Business sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma unidade vinculada a este usuário.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {viewUnitsUser.unidades.map((unit) => (
                    <Box
                      key={unit.public_id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.08)',
                        bgcolor: 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: unit.modulos?.length > 0 ? 1 : 0 }}>
                        {unit.nome}
                      </Typography>
                      {unit.modulos?.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                          {unit.modulos.map((mod) => (
                            <Chip
                              key={mod.public_id}
                              label={mod.abreviacao || mod.nome}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 22, borderColor: 'rgba(255,255,255,0.15)', color: 'text.secondary' }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewUnitsClose}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Editar Usuário dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Fade in={editOpen} timeout={800}>
            <Box sx={{ pt: 2, textAlign: 'center' }}>
              <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                <Box><Edit /></Box>
                Editar Usuário
              </Typography>
            </Box>
          </Fade>
        </DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          {editSuccess && <Alert severity="success" sx={{ mb: 2 }}>{editSuccess}</Alert>}

          <TextField
            label="Nome"
            fullWidth
            margin="normal"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="edit-roles-label">Cargos</InputLabel>
            <Select
              labelId="edit-roles-label"
              multiple
              value={editRoles}
              onChange={(e) => setEditRoles(e.target.value)}
              label="Cargos"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {allRoles
                    .filter(r => selected.includes(r.public_id))
                    .map(r => {
                      const label = r.nome === 'user_master' ? 'Master' : r.nome.charAt(0).toUpperCase() + r.nome.slice(1);
                      return <Chip key={r.public_id} label={label} size="small" />;
                    })}
                </Box>
              )}
            >
              {allRoles.map((role) => {
                const label = role.nome === 'user_master' ? 'Master' : role.nome.charAt(0).toUpperCase() + role.nome.slice(1);
                return (
                  <MenuItem key={role.public_id} value={role.public_id}>
                    <Checkbox checked={editRoles.includes(role.public_id)} />
                    <ListItemText primary={label} />
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} disabled={editLoading}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={editLoading || !editName.trim() || editRoles.length === 0}
          >
            {editLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User context menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: { minWidth: 180, bgcolor: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)' }
        }}
      >
        <MenuItem onClick={handleEditOpen}>
          <Edit fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="body2">Editar Usuário</Typography>
        </MenuItem>
        <MenuItem onClick={handleViewUnits}>
          <Business fontSize="small" sx={{ mr: 1.5, color: 'info.main' }} />
          <Typography variant="body2">Visualizar Unidades</Typography>
        </MenuItem>
      </Menu>
    </Container>
  );
}

export default GestaoUsuarios;
