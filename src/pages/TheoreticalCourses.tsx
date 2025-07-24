import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Paper
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';

const TheoreticalCourses: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}
      >
        <Box sx={{ position: 'relative', mb: 3 }}>
          <BuildIcon 
            sx={{ 
              fontSize: 80, 
              color: 'primary.main',
              animation: 'spin 2s linear infinite'
            }} 
          />
        </Box>
        
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: 'text.primary',
            mb: 2
          }}
        >
          En cours de construction
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ maxWidth: 400 }}
        >
          Cette section est actuellement en développement. 
          Nous travaillons pour vous offrir une expérience optimale.
        </Typography>
      </Paper>
      
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </Container>
  );
};

export default TheoreticalCourses; 