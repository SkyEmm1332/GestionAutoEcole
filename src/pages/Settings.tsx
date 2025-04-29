import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configuration
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Paramètres de l'application
        </Typography>
        <Typography>
          Cette section est en cours de développement.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Settings; 