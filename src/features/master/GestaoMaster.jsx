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
import { useTranslation, Trans } from 'react-i18next';
import '../../app/i18n';

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

function GestaoMaster() {
  const { t } = useTranslation();

  const panelFeatures = [
    {
      title: t("gestaoMaster.components.panelsContainer.companiesCard.title"),
      icon: Business,
      color: '#2563EB',
      gradient: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0.05) 100%)',
      border: 'rgba(37,99,235,0.3)',
      description: t("gestaoMaster.components.panelsContainer.companiesCard.subtitle"),
      features: [
        { icon: Add,        text: t("gestaoMaster.components.panelsContainer.companiesCard.features.first") },
        { icon: Store,      text: t("gestaoMaster.components.panelsContainer.companiesCard.features.second") },
        { icon: ViewModule, text: t("gestaoMaster.components.panelsContainer.companiesCard.features.third") },
        { icon: Search,     text: t("gestaoMaster.components.panelsContainer.companiesCard.features.fourty") },
        { icon: People,     text: t("gestaoMaster.components.panelsContainer.companiesCard.features.fifth") },
        { icon: Edit,       text: t("gestaoMaster.components.panelsContainer.companiesCard.features.sixth") },
      ],
    },
    {
      title: t("gestaoMaster.components.panelsContainer.usersCard.title"),
      icon: Groups3,
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)',
      border: 'rgba(139,92,246,0.3)',
      description: t("gestaoMaster.components.panelsContainer.usersCard.subtitle"),
      features: [
        { icon: Add,         text: t("gestaoMaster.components.panelsContainer.usersCard.features.first") },
        { icon: School,      text: t("gestaoMaster.components.panelsContainer.usersCard.features.second") },
        { icon: LinkRounded, text: t("gestaoMaster.components.panelsContainer.usersCard.features.third") },
        { icon: LinkRounded, text: t("gestaoMaster.components.panelsContainer.usersCard.features.fourty") },
        { icon: Edit,        text: t("gestaoMaster.components.panelsContainer.usersCard.features.fifth") },
        { icon: Search,      text: t("gestaoMaster.components.panelsContainer.usersCard.features.sixth") },
      ],
    },
  ];

  const rolesList = [
    { label: t("gestaoMaster.components.rolesContainer.roles.default.name"),    description: t("gestaoMaster.components.rolesContainer.roles.default.about"),    color: '#94a3b8', bg: 'rgba(255,255,255,0.05)',   border: 'rgba(255,255,255,0.1)' },
    { label: t("gestaoMaster.components.rolesContainer.roles.admin.name"),       description: t("gestaoMaster.components.rolesContainer.roles.admin.about"),       color: '#a78bfa', bg: 'rgba(139,92,246,0.1)',    border: 'rgba(139,92,246,0.3)' },
    { label: t("gestaoMaster.components.rolesContainer.roles.instructor.name"),  description: t("gestaoMaster.components.rolesContainer.roles.instructor.about"),  color: '#60a5fa', bg: 'rgba(37,99,235,0.1)',     border: 'rgba(59,130,246,0.3)' },
    { label: t("gestaoMaster.components.rolesContainer.roles.master.name"),      description: t("gestaoMaster.components.rolesContainer.roles.master.about"),      color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)' },
  ];

  const modulesList = [
    {
      label: t("gestaoMaster.components.modulesContainer.tr.prefix"),
      name:  t("gestaoMaster.components.modulesContainer.tr.name"),
      description: t("gestaoMaster.components.modulesContainer.tr.about"),
      color: '#60a5fa', bg: 'rgba(37,99,235,0.1)', border: 'rgba(59,130,246,0.3)',
    },
    {
      label: t("gestaoMaster.components.modulesContainer.gl.prefix"),
      name:  t("gestaoMaster.components.modulesContainer.gl.name"),
      description: t("gestaoMaster.components.modulesContainer.gl.about"),
      color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)',
    },
  ];
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
                {t("gestaoMaster.components.title")}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t("gestaoMaster.components.subtitle")}
              </Typography>
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 5 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
              <StatCard title={t("gestaoMaster.components.cards.registeredCompanies")} value={stats.total_empresas} icon={Business} gradient="linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)" isLoading={statsLoading} />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
              <StatCard title={t("gestaoMaster.components.cards.availableModules")} value={stats.total_modulos} icon={ViewModule} gradient="linear-gradient(135deg, #0f172a 0%, #6d28d9 100%)" isLoading={statsLoading} delay={100} />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
              <StatCard title={t("gestaoMaster.components.cards.registeredUsers")} value={stats.total_usuarios} icon={Groups3} gradient="linear-gradient(135deg, #0f172a 0%, #0e7490 100%)" isLoading={statsLoading} delay={200} />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
              <StatCard title={t("gestaoMaster.components.cards.registeredUnits")} value={stats.total_unidades} icon={Store} gradient="linear-gradient(135deg, #0f172a 0%, #4c1d95 100%)" isLoading={statsLoading} delay={300} />
            </Box>
          </Box>

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
                    {t("gestaoMaster.components.aboutContainer.title")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {t("gestaoMaster.components.aboutContainer.subtitle")}
                  </Typography>
                </Box>

                <Box sx={{ p: 4, flex: 1 }}>
                  <Typography variant="overline" sx={{ color: 'text.disabled', letterSpacing: 2 }}>
                    {t("gestaoMaster.components.aboutContainer.explication.about.title")}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, mb: 3, color: 'text.secondary', lineHeight: 1.8 }}>
                    <Trans
                      i18nKey="gestaoMaster.components.aboutContainer.explication.about.text"
                      components={{
                        role: <Chip label="Master" size="small" sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', mx: 0.5, fontWeight: 700 }} />
                      }}
                    />
                  </Typography>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 3 }} />

                  <Typography variant="overline" sx={{ color: 'text.disabled', letterSpacing: 2 }}>
                    {t("gestaoMaster.components.aboutContainer.explication.howToAccess.title")}
                  </Typography>
                  <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[
                      { step: '1', text: t("gestaoMaster.components.aboutContainer.explication.howToAccess.firstStep") },
                      { step: '2', text: t("gestaoMaster.components.aboutContainer.explication.howToAccess.secondStep") },
                      { step: '3', text: t("gestaoMaster.components.aboutContainer.explication.howToAccess.thirdStep") },
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
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{t("gestaoMaster.components.panelsContainer.title")}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("gestaoMaster.components.panelsContainer.subtitle")}
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
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{t("gestaoMaster.components.rolesContainer.title")}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t("gestaoMaster.components.rolesContainer.subtitle")}
                </Typography>

                <Grid container spacing={2}>
                  {rolesList.map((role) => (
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
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{t("gestaoMaster.components.modulesContainer.title")}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t("gestaoMaster.components.modulesContainer.subtitle")}
                </Typography>

                <Grid container spacing={2}>
                  {modulesList.map((mod) => (
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
