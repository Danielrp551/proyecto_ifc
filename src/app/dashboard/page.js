import React from 'react';
import { Container, Typography, Grid } from '@mui/material';
import ConversationsChart from '../../components/ConversationsChart';

export default function Dashboard() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ConversationsChart />
        </Grid>
        {/* Aquí puedes agregar más componentes del dashboard en el futuro */}
      </Grid>
    </Container>
  );
}

