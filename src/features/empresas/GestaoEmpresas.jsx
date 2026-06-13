import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  createCompanie,
  getModules,
  getStats,
  formatApiError,
  getApiCode,
  addUnit,
  getAllCompanies,
  getUnitByCompanieId,
  updateCompanieById,
  updateUnitById,
  getAllUsersByIdUnit
} from '../../services/api/ApiService';
import {
  Business,
  ViewModule,
  Store,
  Search,
  MoreVert,
  Edit,
  Delete,
  Group,
  FileDownload
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
import { ptBR, enUS } from '@mui/x-data-grid/locales';
import { useTranslation } from 'react-i18next';
import '../../app/i18n';

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
  const { t, i18n } = useTranslation();

  const exportCSV = (rows, filename) => {
    const columns = [
      { label: t('gestaoEmpresas.components.table.companiesColumn'), get: r => r.nome || '' },
      { label: t('gestaoEmpresas.components.table.cnpjBaseColumn'),  get: r => r.cnpj_base || '' },
    ];
    const escape = v => v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
    const header = columns.map(c => c.label).join(',');
    const body = rows.map(r => columns.map(c => escape(c.get(r))).join(',')).join('\n');
    const blob = new Blob(['﻿' + header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const dataGridLocale = i18n.language === 'pt'
    ? ptBR.components.MuiDataGrid.defaultProps.localeText
    : enUS.components.MuiDataGrid.defaultProps.localeText;
  // "Nova Empresa" dialog
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: '', cnpj: '', unidade: '', modulos: [] });
  const [modules, setModules] = useState([]);

  // "Editar Empresa" dialog
  const [editCompanieOpen, setEditCompanieOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ nome: '' });

  // "Visualizar Unidades" dialog
  const [unitsOpen, setUnitsOpen] = useState(false);
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);

  // "Nova Unidade" dialog
  const [unitOpen, setUnitOpen] = useState(false);
  const [allCompaniesList, setAllCompaniesList] = useState([]);
  const [unitFormData, setUnitFormData] = useState({ empresa_id: '', unidade: '', cnpj: '', modulo: [] });
  const [unitUsersList, setUnitUsersList] = useState([]);

  // Unit context menu
  const [unitAnchorEl, setUnitAnchorEl] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // "Visualizar Usuários da Unidade" dialog
  const [unitUsersOpen, setUnitUsersOpen] = useState(false);
  const [unitUsers, setUnitUsers] = useState([]);
  const [unitUsersLoading, setUnitUsersLoading] = useState(false);

  // "Editar Unidade" dialog
  const [editUnitOpen, setEditUnitOpen] = useState(false);
  const [editUnitFormData, setEditUnitFormData] = useState({ unidade: '', cnpj: '', modulos: [] });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [stats, setStats] = useState({
    total_empresas: '',
    total_usuarios: '',
    total_modulos: '',
    total_unidades: '',
  });

  const loadData = useCallback(async () => {
    try {
      setStatsLoading(true);
      const [statsRes, companiesRes] = await Promise.all([getStats(), getAllCompanies()]);
      setStats(statsRes.data);
      setCompanies(companiesRes.data || []);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCompanies = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return companies.filter((emp) =>
      emp.nome?.toLowerCase().includes(term) ||
      emp.cnpj_base?.includes(term)
    );
  }, [companies, searchTerm]);

  const columns = useMemo(() => [
    {
      field: 'nome',
      headerName: t("gestaoEmpresas.components.table.companiesColumn"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'cnpj_base',
      headerName: t("gestaoEmpresas.components.table.cnpjBaseColumn"),
      width: 200,
      renderCell: (params) => params.value || '—',
    },
    {
      field: 'actions',
      headerName: t("gestaoEmpresas.components.table.actionsColumn"),
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
  ], [t]);

  const unitsColumns = useMemo(() => [
    {
      field: 'unidade',
      headerName: t("gestaoEmpresas.components.dialogViewUnits.table.unitColumn"),
      flex: 1,
    },
    {
      field: 'cnpj',
      headerName: t("gestaoEmpresas.components.dialogViewUnits.table.cnpjColumn"),
      width: 220,
      renderCell: (params) => {
        if (!params.value) return '—';
        return params.value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
      },
    },
    {
      field: 'modulos',
      headerName: t("gestaoEmpresas.components.dialogViewUnits.table.modulesColumn"),
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', height: '100%' }}>
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
                        fontWeight: 700
                      }}
                  />
                );
              })
            : <Typography variant="caption" color="text.disabled">—</Typography>
          }
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: t("gestaoEmpresas.components.dialogViewUnits.table.actionsColumn"),
      width: 80,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleUnitMenuOpen(e, params.row);
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
  ], [t]);

  const unitUsersColumns = useMemo(() => [
    { field: 'nome', headerName: t("gestaoEmpresas.components.dialogViewUnitUsers.table.nameColumn"), flex: 1 },
    { field: 'email', headerName: t("gestaoEmpresas.components.dialogViewUnitUsers.table.emailColumn"), flex: 1 },
    {
      field: 'cargo',
      headerName: t("gestaoEmpresas.components.dialogViewUnitUsers.table.roleColumn"),
      width: 160,
      renderCell: (params) => {
        const style = getRolesColor(params.value);

        const cargoFormatado = params.value 
          ? params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase() 
          : t("gestaoEmpresas.components.dialogViewUnitUsers.table.noRole");
          
        const cargo = params.value == 'user_master' ? 'Master' : cargoFormatado;
          
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={cargo}
              size="small"
              variant="outlined"
              sx={{ color: style.textColor, backgroundColor: style.backgroundColor, borderColor: style.border, fontWeight: 700 }}
            />
          </Box>
        );
      },
    },
    {
      field: 'primeiro_acesso',
      headerName: t("gestaoEmpresas.components.dialogViewUnitUsers.table.firstAccessColumn"),
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2" color={params.value ? 'warning.main' : 'success.main'}>
            {params.value ? t("gestaoEmpresas.components.dialogViewUnitUsers.table.firstAccessStatus.pending") : t("gestaoEmpresas.components.dialogViewUnitUsers.table.firstAccessStatus.completed")}
          </Typography>
        </Box>
      ),
    },
  ], [t]);

  const handleOpen = async () => {
    setError('');
    setSuccess('');
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
      const { modulos, ...rest } = formData;
      const payload = { ...rest };
      if (modulos.length) payload.modulo = modulos;
      await createCompanie(payload);
      setSuccess(t('gestaoEmpresas.messages.companyCreated'));
      await loadData();
      setTimeout(handleClose, 2000);
    } catch (err) {
      const code = getApiCode(err);
      setError(code ? t(`gestaoEmpresas.api_codes.${code}`, { defaultValue: formatApiError(err) }) : formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, company) => {
    setAnchorEl(event.currentTarget);
    setSelectedCompany(company);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleViewUnits = async () => {
    if (!selectedCompany) return;
    handleMenuClose();
    setError('');
    setUnits([]);
    setUnitsOpen(true);
    setUnitsLoading(true);
    try {
      const response = await getUnitByCompanieId(selectedCompany.empresa_id);
      setUnits(response.data || []);
    } catch (err) {
      const code = getApiCode(err);
      setError(code ? t(`gestaoEmpresas.api_codes.${code}`, { defaultValue: formatApiError(err) }) : formatApiError(err));
    } finally {
      setUnitsLoading(false);
    }
  };

  const handleUnitsClose = () => {
    setUnitsOpen(false);
    setSelectedCompany(null);
    setError('');
  };

  const handleEditCompanies = () => {
    if (!selectedCompany) return;
    handleMenuClose();
    setError('');
    setSuccess('');
    setEditFormData({ nome: selectedCompany.nome || '', cnpj: selectedCompany.cnpj_base || '' });
    setEditCompanieOpen(true);
  };

  const handleEditClose = () => {
    setEditCompanieOpen(false);
    setError('');
    setSuccess('');
  };

  const handleEditSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateCompanieById(selectedCompany.empresa_id, editFormData);
      setSuccess(t('gestaoEmpresas.messages.companyUpdated'));
      await loadData();
      setTimeout(handleEditClose, 2000);
    } catch (err) {
      const code = getApiCode(err);
      setError(code ? t(`gestaoEmpresas.api_codes.${code}`, { defaultValue: formatApiError(err) }) : formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUnitMenuOpen = (event, unit) => {
    setUnitAnchorEl(event.currentTarget);
    setSelectedUnit(unit);
  };

  const handleUnitMenuClose = () => setUnitAnchorEl(null);

  const handleViewUnitUsers = async () => {
    if (!selectedUnit) return;
    handleUnitMenuClose();
    setUnitUsers([]);
    setUnitUsersOpen(true);
    setUnitUsersLoading(true);
    try {
      const response = await getAllUsersByIdUnit(selectedUnit.public_id);
      setUnitUsers(response.data || []);
    } catch (err) {
      const code = getApiCode(err);
      setError(code ? t(`gestaoEmpresas.api_codes.${code}`, { defaultValue: formatApiError(err) }) : formatApiError(err));
    } finally {
      setUnitUsersLoading(false);
    }
  };

  const handleUnitUsersClose = () => {
    setUnitUsersOpen(false);
    setUnitUsers([]);
  };

  const handleEditUnit = async () => {
    if (!selectedUnit) return;
    handleUnitMenuClose();
    setError('');
    setSuccess('');
    try {
      const modulesRes = await getModules();
      const availableModules = modulesRes.data || [];
      setModules(availableModules);

      const selectedModuleIds = (selectedUnit.modulos || [])
        .map((unitMod) =>
          availableModules.find(
            (m) => m.abreviacao === unitMod.abreviacao || m.nome === unitMod.nome
          )?.public_id
        )
        .filter(Boolean);

      setEditUnitFormData({
        unidade: selectedUnit.unidade || '',
        cnpj: selectedUnit.cnpj || '',
        modulos: selectedModuleIds,
      });
    } catch {}
    setEditUnitOpen(true);
  };

  const handleEditUnitClose = () => {
    setEditUnitOpen(false);
    setError('');
    setSuccess('');
  };

  const handleEditUnitSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateUnitById(selectedUnit.public_id, editUnitFormData);
      setSuccess(t('gestaoEmpresas.messages.unitUpdated'));
      const response = await getUnitByCompanieId(selectedCompany.empresa_id);
      setUnits(response.data || []);
      setTimeout(handleEditUnitClose, 2000);
    } catch (err) {
      const code = getApiCode(err);
      setError(code ? t(`gestaoEmpresas.api_codes.${code}`, { defaultValue: formatApiError(err) }) : formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

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
      setError(t('gestaoEmpresas.messages.errorLoadingData'));
    }
  };

  const handleUnitClose = () => setUnitOpen(false);

  const handleUnitSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { empresa_id, ...data } = unitFormData;
      await addUnit(empresa_id, data);
      setSuccess(t('gestaoEmpresas.messages.unitCreated'));
      setTimeout(handleUnitClose, 2000);
    } catch (err) {
      const code = getApiCode(err);
      setError(code ? t(`gestaoEmpresas.api_codes.${code}`, { defaultValue: formatApiError(err) }) : formatApiError(err));
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
                {t("gestaoEmpresas.components.title")}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
                {t("gestaoEmpresas.components.subtitle")}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[
                { label: t("gestaoEmpresas.components.buttons.newUnitButton"), icon: <Business />, onClick: handleUnitOpen },
                { label: t("gestaoEmpresas.components.buttons.newCompanyButton"), icon: <Store />,    onClick: handleOpen },
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
            <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
              <StatCard title={t("gestaoEmpresas.components.cards.companies")} value={stats.total_empresas} icon={Business} gradient="linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)" isLoading={statsLoading} />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
              <StatCard title={t("gestaoEmpresas.components.cards.units")} value={stats.total_unidades} icon={Store} gradient="linear-gradient(135deg, #0f172a 0%, #6d28d9 100%)" isLoading={statsLoading} />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
              <StatCard title={t("gestaoEmpresas.components.cards.modules")} value={stats.total_modulos} icon={ViewModule} gradient="linear-gradient(135deg, #0f172a 0%, #047857 100%)" isLoading={statsLoading} delay={200} />
            </Box>
          </Box>

          <Grow in timeout={1200}>
            <Card sx={{ borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'background.paper' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {t("gestaoEmpresas.components.table.title", { quantity: stats.total_empresas})}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder={t("gestaoEmpresas.components.table.field")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: { xs: '100%', sm: 400 } }}
                  />
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<FileDownload />}
                    onClick={() => exportCSV(filteredCompanies, `empresas_${new Date().toISOString().slice(0,10)}.csv`)}
                    disabled={filteredCompanies.length === 0}
                    sx={{
                      borderRadius: 2,
                      color: 'rgba(255,255,255,0.65)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(8px)',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.16)',
                        color: 'rgba(255,255,255,0.95)',
                      },
                    }}
                  >
                    {t("gestaoEmpresas.components.buttons.csvButton")}
                  </Button>
                </Box>
              </Box>

              <Box sx={{ p: 1, height: 500, width: '100%' }}>
                <DataGrid
                  rows={filteredCompanies}
                  columns={columns}
                  loading={statsLoading}
                  getRowId={(row) => row.empresa_id}
                  localeText={dataGridLocale}
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

      {/* Context menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 180, bgcolor: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)' }
        }}
      >
        <MenuItem onClick={handleEditCompanies}>
          <Edit fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="body2">{t("gestaoEmpresas.components.table.actions.editCompany")}</Typography>
        </MenuItem>

        <MenuItem onClick={handleViewUnits}>
          <Business fontSize="small" sx={{ mr: 1.5, color: 'info.main' }} />
          <Typography variant="body2">{t("gestaoEmpresas.components.table.actions.viewUnits")}</Typography>
        </MenuItem>
      </Menu>

      {/* Unit context menu */}
      <Menu
        anchorEl={unitAnchorEl}
        open={Boolean(unitAnchorEl)}
        onClose={handleUnitMenuClose}
        PaperProps={{
          sx: { minWidth: 180, bgcolor: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)' }
        }}
      >
        <MenuItem onClick={handleEditUnit}>
          <Edit fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="body2">{t("gestaoEmpresas.components.dialogViewUnits.table.actions.editUnit")}</Typography>
        </MenuItem>
        <MenuItem onClick={handleViewUnitUsers}>
          <Group fontSize="small" sx={{ mr: 1.5, color: 'info.main' }} />
          <Typography variant="body2">{t("gestaoEmpresas.components.dialogViewUnits.table.actions.viewUsers")}</Typography>
        </MenuItem>
      </Menu>

      {/* Nova Empresa dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Fade in={open} timeout={800}>
            <Box sx={{ pt: 2, textAlign: 'center' }}>
              <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                <Box><Store /></Box>
                {t("gestaoEmpresas.components.dialogAddNewCompany.title")}
              </Typography>
            </Box>
          </Fade>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <TextField label={t("gestaoEmpresas.components.dialogAddNewCompany.fields.nameField")} fullWidth margin="normal" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
          <TextField label={t("gestaoEmpresas.components.dialogAddNewCompany.fields.cnpjField")} fullWidth margin="normal" value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} />
          <TextField label={t("gestaoEmpresas.components.dialogAddNewCompany.fields.unitField")} fullWidth margin="normal" value={formData.unidade} onChange={(e) => setFormData({ ...formData, unidade: e.target.value })} />

          <FormControl fullWidth margin="normal">
            <InputLabel id="select-modulos-label">{t("gestaoEmpresas.components.dialogAddNewCompany.fields.modulesField")}</InputLabel>
            <Select
              labelId="select-modulos-label"
              multiple
              value={formData.modulos}
              onChange={(e) => setFormData({ ...formData, modulos: e.target.value })}
              label={t("gestaoEmpresas.components.dialogAddNewCompany.fields.modulesField")}
              renderValue={(selected) =>
                modules.filter(mod => selected.includes(mod.public_id)).map(mod => mod.nome).join(', ')
              }
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
          <Button onClick={handleClose} disabled={loading}>{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? t('common.saving') : t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Editar Empresa dialog */}
      <Dialog open={editCompanieOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Fade in={editCompanieOpen} timeout={800}>
            <Box sx={{ pt: 2, textAlign: 'center' }}>
              <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                <Box><Edit /></Box>
                {t("gestaoEmpresas.components.dialogEditCompany.title")}
              </Typography>
            </Box>
          </Fade>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <TextField label={t("gestaoEmpresas.components.dialogEditCompany.fieldEditName")} fullWidth margin="normal" value={editFormData.nome} onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} disabled={loading}>{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleEditSubmit} disabled={loading}>
            {loading ? t('common.saving') : t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nova Unidade dialog */}
      <Dialog open={unitOpen} onClose={handleUnitClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Fade in={unitOpen} timeout={800}>
            <Box sx={{ pt: 2, textAlign: 'center' }}>
              <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                <Box><Business /></Box>
                {t("gestaoEmpresas.components.dialogAddNewUnit.title")}
              </Typography>
            </Box>
          </Fade>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <FormControl fullWidth margin="normal">
            <InputLabel id="select-company-label">{t("gestaoEmpresas.components.dialogAddNewUnit.fields.companyField")}</InputLabel>
            <Select
              labelId="select-company-label"
              value={unitFormData.empresa_id}
              onChange={(e) => setUnitFormData({ ...unitFormData, empresa_id: e.target.value })}
              label={t("gestaoEmpresas.components.dialogAddNewUnit.fields.companyField")}
            >
              {allCompaniesList.map((emp) => (
                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                  {emp.nome} {emp.cnpj_base ? `(${emp.cnpj_base})` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label={t("gestaoEmpresas.components.dialogAddNewUnit.fields.nameUnitField")} fullWidth margin="normal" value={unitFormData.unidade} onChange={(e) => setUnitFormData({ ...unitFormData, unidade: e.target.value })} />
          <TextField label={t("gestaoEmpresas.components.dialogAddNewUnit.fields.cnpjField")} fullWidth margin="normal" value={unitFormData.cnpj} onChange={(e) => setUnitFormData({ ...unitFormData, cnpj: e.target.value })} />

          <FormControl fullWidth margin="normal">
            <InputLabel id="select-unit-modulos-label">{t("gestaoEmpresas.components.dialogAddNewUnit.fields.modulesField")}</InputLabel>
            <Select
              labelId="select-unit-modulos-label"
              multiple
              value={unitFormData.modulo}
              onChange={(e) => setUnitFormData({ ...unitFormData, modulo: e.target.value })}
              label={t("gestaoEmpresas.components.dialogAddNewUnit.fields.modulesField")}
              renderValue={(selected) =>
                modules.filter(mod => selected.includes(mod.public_id)).map(mod => mod.nome).join(', ')
              }
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
          <Button onClick={handleUnitClose} disabled={loading}>{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleUnitSubmit} disabled={loading}>
            {loading ? t('common.saving') : t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Visualizar Unidades dialog */}
      <Dialog open={unitsOpen} onClose={handleUnitsClose} fullWidth maxWidth="md">
        <DialogTitle variant="h4" component="span" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
          {t("gestaoEmpresas.components.dialogViewUnits.title",  { company: selectedCompany?.nome })}
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={units}
              columns={unitsColumns}
              loading={unitsLoading}
              getRowId={(row) => row.public_id}
              localeText={dataGridLocale}
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
              disableRowSelectionOnClick
              sx={{ border: 'none' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUnitsClose} variant="outlined">{t("common.close")}</Button>
        </DialogActions>
      </Dialog>

      {/* Visualizar Usuários da Unidade dialog */}
      <Dialog open={unitUsersOpen} onClose={handleUnitUsersClose} fullWidth maxWidth="md">
        <DialogTitle variant="h4" component="span" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
          {t("gestaoEmpresas.components.dialogViewUnitUsers.title", { unit: selectedUnit?.unidade })}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={unitUsers}
              columns={unitUsersColumns}
              loading={unitUsersLoading}
              getRowId={(row) => row.public_id}
              localeText={dataGridLocale}
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
              disableRowSelectionOnClick
              sx={{ border: 'none' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUnitUsersClose} variant="outlined">{t("common.close")}</Button>
        </DialogActions>
      </Dialog>

      {/* Editar Unidade dialog */}
      <Dialog open={editUnitOpen} onClose={handleEditUnitClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Fade in={editUnitOpen} timeout={800}>
            <Box sx={{ pt: 2, textAlign: 'center' }}>
              <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                <Box><Edit /></Box>
                {t("gestaoEmpresas.components.dialogEditUnit.title")}
              </Typography>
            </Box>
          </Fade>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <TextField
            label={t("gestaoEmpresas.components.dialogEditUnit.fields.nameUnitField")}
            fullWidth
            margin="normal"
            value={editUnitFormData.unidade}
            onChange={(e) => setEditUnitFormData({ ...editUnitFormData, unidade: e.target.value })}
          />
          <TextField
            label={t("gestaoEmpresas.components.dialogEditUnit.fields.cnpjField")}
            fullWidth
            margin="normal"
            value={editUnitFormData.cnpj}
            onChange={(e) => setEditUnitFormData({ ...editUnitFormData, cnpj: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="edit-unit-modulos-label">{t("gestaoEmpresas.components.dialogEditUnit.fields.modulesField")}</InputLabel>
            <Select
              labelId="edit-unit-modulos-label"
              multiple
              value={editUnitFormData.modulos}
              onChange={(e) => setEditUnitFormData({ ...editUnitFormData, modulos: e.target.value })}
              label={t("gestaoEmpresas.components.dialogEditUnit.fields.modulesField")}
              renderValue={(selected) =>
                modules.filter((mod) => selected.includes(mod.public_id)).map((mod) => mod.nome).join(', ')
              }
            >
              {modules?.map((mod) => (
                <MenuItem key={mod.public_id} value={mod.public_id}>
                  <Checkbox checked={editUnitFormData.modulos.indexOf(mod.public_id) > -1} />
                  <ListItemText primary={mod.nome} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditUnitClose} disabled={loading}>{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleEditUnitSubmit} disabled={loading}>
            {loading ? t('common.saving') : t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default GestaoEmpresas;
