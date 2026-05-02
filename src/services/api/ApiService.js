import axios from 'axios';

const defaultApiBaseUrl = 'https://dev.api.tagsafeapplication.com';
const apiBaseUrl = String(
  import.meta.env.VITE_API_URL || defaultApiBaseUrl
).replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers['authorization'] = `Bearer ${token}`;
  return config;
});

export const login = (email, senha) =>
  apiClient.post('/auth/login', { email, senha });

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
