import axios from 'axios';

const ENV_URLS = {
  dev:   import.meta.env.VITE_API_URL_DEV   || 'https://dev.api.tagsafeapplication.com',
  prod:  import.meta.env.VITE_API_URL_PROD  || 'https://api.tagsafeapplication.com',
  local: import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:3000',
};

const apiClient = axios.create({
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const env = localStorage.getItem('selected_env') || 'local';
  config.baseURL = ENV_URLS[env].replace(/\/+$/, '');
  const token = localStorage.getItem('auth_token');
  if (token) config.headers['authorization'] = `Bearer ${token}`;
  return config;
});

export const login = (email, senha) =>
  apiClient.post('/auth/login-master', { email, senha });

export const verifyToken = () =>
  apiClient.get('/auth/me');

export const logout = () =>
  apiClient.post('/auth/logout');

export const formatApiError = (error) => {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.status === 401) return 'Sessão expirada. Faça login novamente.';
  if (error?.response?.status === 403) return 'Acesso negado.';
  if (error?.response?.status === 404) return 'Recurso não encontrado.';
  if (error?.response?.status === 500) return 'Erro interno do servidor.';
  if (error?.request) return 'Erro de conexão. Verifique sua internet.';
  return 'Erro desconhecido. Tente novamente.';
};

// controle e gestao master

// empresas & unidades
export const createCompanie = (data) => {
  const payload = {
    nome: data?.nome,
    cnpj: data?.cnpj,
    unidade: data?.unidade,
    modulo: data?.modulo,
  };

  return apiClient.post('/empresas', payload);
};

export const getCompanies = () => {
  return apiClient.get('/empresas');
};

export const getUnitByUnitId = (public_id) => {
  return apiClient.get(`/empresas/${public_id}`);
};

export const getAllUsersByIdUnit = (public_id) => {
  return apiClient.get(`/empresas/users/${public_id}`);
};

// atualizar unidades pelo public_id da unidade
export const updateUnitById = (public_id, data) => {
  const payload = {
    nome: data?.nome,
    cnpj: data?.cnpj,
    unidade: data?.unidade,
    modulos: data?.modulos
  };

  return apiClient.put(`/empresas/unit/${public_id}`, payload);
};

// atualizar empresa pela empresa_id
export const updateCompanieById = (empresa_id, data) => {
  const payload = {
    nome: data?.nome
  };

  return apiClient.put(`/empresas/company/${empresa_id}`, payload);
};

// adicionar uma unidade a uma empresa
export const addUnit = (empresa_id, data) => {
  const payload = {
    unidade: data?.unidade,
    cnpj: data?.cnpj,
    modulo: data?.modulo
  };

  return apiClient.post(`/empresas/${empresa_id}/unidade`, payload);
};

// extrair todas as empresas
export const getAllCompanies = () => {
  return apiClient.get('/empresas/all_companies');
};

// extrair unidade pelo empresa_id 
export const getUnitByCompanieId = (empresa_id) => {
  return apiClient.get(`/empresas/unit_by_companie_id/${empresa_id}`);
};

// trazer todos os modulos disponiveis
export const getModules = () => {
  return apiClient.get('/modulos');
};

// criar usuario
export const createUser = (data) => {
  const payload = {
    nome: data?.nome,
    email: data?.email,
    senha: data?.senha,
    roles: data?.roles,
    unidades_id: data?.unidades_id
  }

  return apiClient.post('/auth/registrar', payload);
};

// lista todos os cargos disponiveis
export const getRoles = () => {
  return apiClient.get('/roles');
};

// traz quantas empresas, usuarios, unidades e modulos existem atualmente
export const getStats = () => {
  return apiClient.get('/admin/stats');
};

// unidades-atendidas
export const getUnitsAttended = (instrutor_id) => { 
  return apiClient.get(`/instrutores/unidades_atendidas/${instrutor_id}`);
};

export const setUnitsAttended = (usuario_id, unidades_atendidas) => {
  const payload = {
    usuario_id,
    unidades_atendidas,
  };
  return apiClient.post(`/instrutores/unidades_atendidas`, payload);
};

// selecionar o instrutor da empresa
export const getInstructorsByCompany = (empresa_id) => {
  return apiClient.get(`/instrutores/instrutores_by_company/${empresa_id}`);
};

// ter as unidades vinculadas do usuário
export const getUnitsByUserId = (usuario_id) => {
  return apiClient.get(`/empresas/units_by_user_id/${usuario_id}`);
};

// vincular uma unidade a um usuário
export const addUnitToUser = (usuario_id, unidade_id) => {
  const payload = {
    unidade_id: unidade_id
  }

  return apiClient.post(`/usuarios/${usuario_id}/unidades`, payload);
};

// extrair o usuário pelo e-mail
export const getUserByEmail = (email) => {
  return apiClient.get(`/usuarios/get_by_email/${encodeURIComponent(email)}`);
};

// extrair todos os usuários com usuário master
export const getAllUsers = () => {
  return apiClient.get('/usuarios/master');
};

// extrair quantidade de usuários por role
export const getAllUsersQuantity = () => {
  return apiClient.get('/admin/users_quantity');
}; 

// extrair empresa pelo empresa_id
export const getCompanyById = (empresa_id) => {
  return apiClient.get(`/empresas/company_by_id/${empresa_id}`);
};

// rotas para editar users (name & roles)
export const updateNameByPublicId = (public_id, name) => {
  const payload = {
    'name': name
  };

  return apiClient.put(`/usuarios/update_name/${public_id}`, payload);
};

export const updateRolesByPublicId = (public_id, roles) => {
  const payload = {
    'roles': roles
  };

  return apiClient.put(`/usuarios/update_roles/${public_id}`, payload)
};

export const getRolesByUserId = (public_id) => {
  return apiClient.get(`/usuarios/get_roles/${public_id}`);
};