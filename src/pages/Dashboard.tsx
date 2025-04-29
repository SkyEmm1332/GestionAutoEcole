import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  Euro as EuroIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
      backgroundColor: color,
      color: 'white',
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography component="h2" variant="h6" gutterBottom>
        {title}
      </Typography>
      {icon}
    </Box>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
  </Paper>
);

const QuickActionCard = ({ title, description, action, path }: { title: string; description: string; action: string; path: string }) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => navigate(path)}>
          {action}
        </Button>
      </CardActions>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
        {/* Statistiques */}
        <Box>
          <StatCard
            title="Candidats inscrits"
            value="156"
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Box>
        <Box>
          <StatCard
            title="Nouvelles inscriptions"
            value="12"
            icon={<TrendingUpIcon />}
            color="#2e7d32"
          />
        </Box>
        <Box>
          <StatCard
            title="Recettes"
            value="€12,450"
            icon={<EuroIcon />}
            color="#ed6c02"
          />
        </Box>
        <Box>
          <StatCard
            title="Dépenses"
            value="€8,750"
            icon={<TrendingDownIcon />}
            color="#d32f2f"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 3 }}>
        {/* Raccourcis */}
        <Box>
          <QuickActionCard
            title="Programmer un examen"
            description="Ajouter un candidat à un examen de code ou de conduite"
            action="Programmer"
            path="/exams"
          />
        </Box>
        <Box>
          <QuickActionCard
            title="Voir le calendrier"
            description="Consulter le planning des cours et des examens"
            action="Voir calendrier"
            path="/theoretical-courses"
          />
        </Box>
      </Box>

      {/* Section des examens à venir */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Examens à venir
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Examen de code</Typography>
            <Typography>15 Mars 2024 - 10 candidats</Typography>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Examen de conduite</Typography>
            <Typography>20 Mars 2024 - 8 candidats</Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 