import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Paper, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { candidateService } from '../services/candidateService';
import { SnackbarContext } from '../components/Layout';
import { paymentService } from '../services/paymentService';

const CandidateHistory: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showMessage } = useContext(SnackbarContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const data = await candidateService.getCandidates({ deleted: true });
      setCandidates((data.candidates || data || []));
    } catch (e) {
      showMessage("Erreur lors du chargement des candidats supprimés", 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(c =>
    (c.lastName || c.nom || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDialog = async (candidate: any) => {
    setSelectedCandidate(candidate);
    setOpenDialog(true);
    setLoadingPayments(true);
    try {
      const data = await paymentService.getPaymentsByCandidate(candidate._id);
      setPayments(Array.isArray(data) ? data : data.payments || []);
    } catch {
      setPayments([]);
    }
    setLoadingPayments(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCandidate(null);
    setPayments([]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Historique des candidats supprimés</Typography>
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
                  <TableCell>Date de suppression</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: '#888' }}>
                      Aucun candidat supprimé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((row, idx) => (
                    <TableRow key={row._id || idx} hover sx={{ cursor: 'pointer' }} onClick={() => handleOpenDialog(row)}>
                      <TableCell>{row.lastName || row.nom}</TableCell>
                      <TableCell>{row.firstName}</TableCell>
                      <TableCell>{row.cin}</TableCell>
                      <TableCell>{row.deletedAt ? new Date(row.deletedAt).toLocaleDateString('fr-FR') : '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, minHeight: 400 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', fontSize: 22 }}>
          Détail du candidat supprimé
        </DialogTitle>
        <DialogContent dividers>
          {selectedCandidate && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>Nom : {selectedCandidate.lastName || selectedCandidate.nom}</Typography>
              <Typography variant="subtitle1" fontWeight={700}>Prénom : {selectedCandidate.firstName}</Typography>
              <Typography variant="subtitle1" fontWeight={700}>CIN : {selectedCandidate.cin}</Typography>
              <Typography variant="subtitle1" fontWeight={700}>Catégorie : {Array.isArray(selectedCandidate.licenseType) ? selectedCandidate.licenseType.join(', ') : selectedCandidate.licenseType || '-'}</Typography>
              <Typography variant="subtitle1" fontWeight={700}>Date de suppression : {selectedCandidate.deletedAt ? new Date(selectedCandidate.deletedAt).toLocaleDateString('fr-FR') : '-'}</Typography>
            </Box>
          )}
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Historique des paiements</Typography>
          {loadingPayments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
          ) : payments.length === 0 ? (
            <Alert severity="info">Aucun versement trouvé pour ce candidat.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Méthode</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>{new Date(p.date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell><b>{p.amount} FCFA</b></TableCell>
                      <TableCell>{p.method}</TableCell>
                      <TableCell>{p.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CandidateHistory; 