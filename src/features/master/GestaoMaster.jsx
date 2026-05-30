import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Grow,
  Avatar,
  Grid,
  Divider,
  Chip,
  Fade,
} from '@mui/material';
import {
  Business,
  ViewModule,
  Groups3,
  Store,
  AdminPanelSettings,
  People,
  School,
  LinkRounded,
  Edit,
  Add,
  Search,
  CheckCircle,
  Shield,
  ArrowForward,
} from '@mui/icons-material';
import { getStats } from '../../services/api/ApiService';

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

const panelFeatures = [
  {
    title: 'Painel de Empresas',
    icon: Business,
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0.05) 100%)',
    border: 'rgba(37,99,235,0.3)',
    description: 'Gerencie todas as empresas e suas unidades cadastradas na plataforma.',
    features: [
      { icon: Add, text: 'Cadastrar novas empresas com CNPJ e módulos' },
      { icon: Store, text: 'Adicionar e editar unidades por empresa' },
      { icon: ViewModule, text: 'Vincular módulos (TR, GL) a cada unidade' },
      { icon: Search, text: 'Buscar empresas por nome ou CNPJ' },
      { icon: People, text: 'Visualizar usuários vinculados a cada unidade' },
      { icon: Edit, text: 'Editar dados de empresas e unidades' },
    ],
  },
  {
    title: 'Painel de Usuários',
    icon: Groups3,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)',
    border: 'rgba(139,92,246,0.3)',
    description: 'Controle completo sobre usuários, cargos, vínculos e instrutores.',
    features: [
      { icon: Add, text: 'Cadastrar usuários com cargo e unidade vinculada' },
      { icon: School, text: 'Registrar instrutores com unidades atendidas e módulos' },
      { icon: LinkRounded, text: 'Vincular instrutores existentes a novas unidades' },
      { icon: LinkRounded, text: 'Vincular usuários a unidades adicionais' },
      { icon: Edit, text: 'Editar nome e cargos de qualquer usuário' },
      { icon: Search, text: 'Filtrar usuários por nome, e-mail, empresa ou cargo' },
    ],
  },
];

const roles = [
  { label: 'Padrão', description: 'Acesso básico à plataforma', color: '#94a3b8', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
  { label: 'Admin', description: 'Permissões administrativas', color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
  { label: 'Instrutor', description: 'Acesso às unidades atendidas', color: '#60a5fa', bg: 'rgba(37,99,235,0.1)', border: 'rgba(59,130,246,0.3)' },
  { label: 'Master', description: 'Acesso total ao painel de controle', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
];

const modules = [
  {
    label: 'TR',
    name: 'Training Safe',
    description: 'Módulo voltado para gestão e controle de treinamentos de segurança realizados nas unidades.',
    color: '#60a5fa',
    bg: 'rgba(37,99,235,0.1)',
    border: 'rgba(59,130,246,0.3)',
  },
  {
    label: 'GL',
    name: 'GL Safe',
    description: 'Módulo voltado para a gestão e controle de sessões de ginástica laboral realizadas nas unidades.',
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
  },
];

function GestaoMaster() {
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_empresas: '',
    total_usuarios: '',
    total_modulos: '',
    total_unidades: '',
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

  return (
    <Container maxWidth="xl">
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                Painel Master
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Central de controle do ecossistema TagSafe.
              </Typography>
            </Box>
          </Box>

          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Empresas cadastradas" value={stats.total_empresas} icon={Business} gradient="linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)" isLoading={statsLoading} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Módulos disponíveis" value={stats.total_modulos} icon={ViewModule} gradient="linear-gradient(135deg, #0f172a 0%, #6d28d9 100%)" isLoading={statsLoading} delay={100} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Usuários cadastrados" value={stats.total_usuarios} icon={Groups3} gradient="linear-gradient(135deg, #0f172a 0%, #0e7490 100%)" isLoading={statsLoading} delay={200} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Unidades cadastradas" value={stats.total_unidades} icon={Store} gradient="linear-gradient(135deg, #0f172a 0%, #4c1d95 100%)" isLoading={statsLoading} delay={300} />
            </Grid>
          </Grid>

          {/* O que é o painel */}
          <Grow in timeout={900}>
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'background.paper', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch' }}>
                <Box
                  sx={{
                    minWidth: { md: 280 },
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(99,102,241,0.1) 100%)',
                    borderRight: { md: '1px solid rgba(255,255,255,0.06)' },
                    borderBottom: { xs: '1px solid rgba(255,255,255,0.06)', md: 'none' },
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    justifyContent: 'center',
                  }}
                >
                  <Avatar sx={{ bgcolor: 'rgba(37,99,235,0.25)', color: '#60a5fa', width: 56, height: 56 }}>
                    <Shield fontSize="large" />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                    TagSafe Control Panel
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Plataforma centralizada de gestão para administradores master do ecossistema TagSafe.
                  </Typography>
                </Box>

                <Box sx={{ p: 4, flex: 1 }}>
                  <Typography variant="overline" sx={{ color: 'text.disabled', letterSpacing: 2 }}>
                    Para que serve
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, mb: 3, color: 'text.secondary', lineHeight: 1.8 }}>
                    Este painel permite que usuários <Chip label="Master" size="small" sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', mx: 0.5, fontWeight: 700 }} /> gerenciem toda a estrutura da plataforma: desde o cadastro de empresas e suas unidades até o controle de usuários, cargos e vínculos com módulos disponíveis.
                  </Typography>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 3 }} />

                  <Typography variant="overline" sx={{ color: 'text.disabled', letterSpacing: 2 }}>
                    Como acessar
                  </Typography>
                  <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[
                      { step: '1', text: 'Faça login com uma conta com o cargo Master.' },
                      { step: '2', text: 'Use o menu lateral para navegar entre os painéis.' },
                      { step: '3', text: 'Gerencie empresas, unidades e usuários de forma independente.' },
                    ].map(({ step, text }) => (
                      <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                          {step}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">{text}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grow>

          {/* Painéis disponíveis */}
          <Grow in timeout={1100}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Painéis disponíveis</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                O painel de controle é dividido em duas seções principais, acessíveis pelo menu lateral.
              </Typography>

              <Grid container spacing={3}>
                {panelFeatures.map((panel, i) => (
                  <Grid item xs={12} md={6} key={panel.title}>
                    <Grow in timeout={1200 + i * 150}>
                      <Card
                        sx={{
                          height: '100%',
                          borderRadius: 2,
                          border: `1px solid ${panel.border}`,
                          background: panel.gradient,
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar sx={{ bgcolor: `rgba(${panel.color === '#2563EB' ? '37,99,235' : '139,92,246'},0.2)`, color: panel.color, width: 44, height: 44 }}>
                              <panel.icon />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{panel.title}</Typography>
                              <Typography variant="caption" color="text.secondary">{panel.description}</Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                            {panel.features.map((feat, j) => (
                              <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CheckCircle sx={{ fontSize: 16, color: panel.color, opacity: 0.8, flexShrink: 0 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                  {feat.text}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grow>

          {/* Cargos */}
          <Grow in timeout={1400}>
            <Card sx={{ borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'background.paper', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Cargos da plataforma</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Cada usuário possui um cargo que define seu nível de acesso dentro do sistema.
                </Typography>

                <Grid container spacing={2}>
                  {roles.map((role) => (
                    <Grid item xs={12} sm={6} md={3} key={role.label}>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          border: `1px solid ${role.border}`,
                          bgcolor: role.bg,
                          height: '100%',
                        }}
                      >
                        <Chip
                          label={role.label}
                          size="small"
                          sx={{ bgcolor: role.bg, color: role.color, border: `1px solid ${role.border}`, fontWeight: 700, mb: 1.5 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                          {role.description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grow>

          {/* Módulos */}
          <Grow in timeout={1600}>
            <Card sx={{ borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'background.paper' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Módulos disponíveis</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Os módulos definem quais funcionalidades estão ativas em cada unidade cadastrada.
                </Typography>

                <Grid container spacing={2}>
                  {modules.map((mod) => (
                    <Grid item xs={12} sm={6} key={mod.label}>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          border: `1px solid ${mod.border}`,
                          bgcolor: mod.bg,
                          height: '100%',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          <Chip
                            label={mod.label}
                            size="small"
                            sx={{ bgcolor: mod.bg, color: mod.color, border: `1px solid ${mod.border}`, fontWeight: 700 }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: mod.color }}>
                            {mod.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                          {mod.description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grow>
        </Box>
      </Fade>
    </Container>
  );
}

export default GestaoMaster;
