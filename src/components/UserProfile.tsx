import React from 'react';
import { Box, Avatar, Typography, Chip } from '@mui/material';

const UserProfile = () => (
  <Box sx={{
    background: 'linear-gradient(135deg, #174ea6 60%, #800020 100%)',
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    mb: 2
  }}>
    <Avatar
      src="https://randomuser.me/api/portraits/women/44.jpg"
      alt="Profil"
      sx={{ width: 64, height: 64, mb: 1, boxShadow: 2, border: '3px solid #fff' }}
    />
    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
      Kouassi Yah Henriette
    </Typography>
    <Typography variant="body2" sx={{ color: '#e3e3e3', mb: 1 }}>
      Bienvenue
    </Typography>
    <Chip label="En ligne" size="small" sx={{ background: '#42a5f5', color: '#fff', fontWeight: 600 }} />
  </Box>
);

export default UserProfile; 