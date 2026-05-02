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
  Icon,
  Grid
} from '@mui/material';
import { Add, Business, ViewModule, Groups3, Store } from '@mui/icons-material';
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
      <Box>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Painel Master
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Bem-vindo ao painel de controle.
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Empresas cadastradas" value={stats.total_empresas} icon={Business} gradient="linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)" isLoading={statsLoading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Módulos disponíveis" value={stats.total_modulos} icon={ViewModule} gradient="linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)" isLoading={statsLoading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Usuários cadastrados" value={stats.total_usuarios} icon={Groups3} gradient="linear-gradient(135deg, #31adff 0%, #1976b3 100%)" isLoading={statsLoading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Unidades cadastradas" value={stats.total_unidades} icon={Store} gradient="linear-gradient(135deg, #5f46ff 0%, #501bff 100%)" isLoading={statsLoading} />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default GestaoMaster;
