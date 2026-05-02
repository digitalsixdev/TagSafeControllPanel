import React from 'react';
import { Box, Container, Typography } from '@mui/material';

function GestaoMaster() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Painel Master
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bem-vindo ao painel de controle.
        </Typography>
      </Box>
    </Container>
  );
}

export default GestaoMaster;
