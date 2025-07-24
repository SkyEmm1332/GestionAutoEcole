import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, InputAdornment, TextField, Stack, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { candidateService } from '../services/candidateService';
import { SnackbarContext } from '../components/Layout';

const CandidateList = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showMessage } = useContext(SnackbarContext);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const data = await candidateService.getCandidates();
      setCandidates(data.candidates || data || []);
    } catch (e) {
      showMessage("Erreur lors du chargement des candidats", 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(c =>
    (c.lastName || c.nom || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Liste des candidats</Typography>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <TextField
          size="small"
          placeholder="Rechercher un nom..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
          sx={{ width: 220, mb: 2 }}
        />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Prénom</TableCell>
                  <TableCell>Document d'identification</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: '#888' }}>
                      Aucun candidat trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((row, idx) => (
                    <TableRow key={row._id || idx}>
                      <TableCell>{row.lastName || row.nom}</TableCell>
                      <TableCell>{row.firstName}</TableCell>
                      <TableCell>{row.cin}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton color="primary"><EditIcon /></IconButton>
                          <IconButton color="error"><DeleteIcon /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default CandidateList; 