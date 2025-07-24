import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Alert, Stack, Chip, MenuItem, Select, InputLabel, FormControl, SelectChangeEvent, InputAdornment
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Euro } from '@mui/icons-material';
import PaymentIcon from '@mui/icons-material/Payment';
import { paymentService } from '../services/paymentService';
import { candidateService } from '../services/candidateService';
import Snackbar from '@mui/material/Snackbar';
import TablePagination from '@mui/material/TablePagination';
import { SnackbarContext } from '../components/Layout';
import ClearIcon from '@mui/icons-material/Clear';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { CATEGORIES } from '../constants/categories';

function getMuiColor(status: string): "info" | "warning" | "success" | "error" | "default" {
  switch (status) {
    case "payé": return "success";
    case "en attente": return "warning";
    case "annulé": return "error";
    default: return "default";
  }
}

interface CandidateType {
  _id: string;
  firstName: string;
  lastName: string;
  cin?: string;
  licenseType?: string[];
  nationality?: string;
  deletedAt?: string;
}

interface PaymentType {
  _id: string;
  candidate: CandidateType;
  amount: number;
  date: string;
  method: string;
  description?: string;
  status: string;
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [candidates, setCandidates] = useState<CandidateType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [editPayment, setEditPayment] = useState<PaymentType | null>(null);
  const [form, setForm] = useState({
    candidate: '',
    amount: 0,
    date: '',
    method: '',
    description: '',
    status: '',
  });
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string}>({open: false, message: ''});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openHistory, setOpenHistory] = useState(false);
  const [historyCandidate, setHistoryCandidate] = useState<CandidateType | null>(null);
  const [historyPayments, setHistoryPayments] = useState<PaymentType[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { showMessage } = React.useContext(SnackbarContext);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getPayments();
      setPayments(data.payments || []);
      setError(null);
    } catch (e) {
      setError("Erreur lors du chargement des versements.");
      showMessage("Erreur lors du chargement des versements", 'error');
    }
    setLoading(false);
  };

  const fetchCandidates = async () => {
    try {
      const data = await candidateService.getCandidates();
      setCandidates(data.candidates || []);
    } catch (e) {
      setCandidates([]);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchCandidates();
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchPayments();
        fetchCandidates();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const handleOpen = (payment?: PaymentType) => {
    setEditPayment(payment || null);
    if (payment) {
      setForm({
        candidate: payment.candidate?._id || '',
        amount: payment.amount,
        date: payment.date ? payment.date.slice(0, 10) : '',
        method: payment.method,
        description: payment.description || '',
        status: payment.status
      });
    } else {
      setForm({
        candidate: '',
        amount: 0,
        date: '',
        method: '',
        description: '',
        status: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditPayment(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setForm(prev => ({ ...prev, [e.target.name as string]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editPayment) {
        await paymentService.updatePayment(editPayment._id, form);
        showMessage('Versement modifié avec succès', 'success');
      } else {
        await paymentService.createPayment(form);
        showMessage('Versement ajouté avec succès', 'success');
      }
      fetchPayments();
      handleClose();
      window.dispatchEvent(new Event('paymentsUpdated'));
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Erreur lors de l'enregistrement du versement.";
      setError(msg);
      showMessage(msg, 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await paymentService.deletePayment(deleteId);
      showMessage('Versement supprimé avec succès', 'success');
        fetchPayments();
      } catch (e) {
      showMessage("Erreur lors de la suppression du versement", 'error');
    }
    setOpenDeleteDialog(false);
    setDeleteId(null);
  };

  const handleOpenHistory = useCallback(async (candidate: CandidateType) => {
    setHistoryCandidate(candidate);
    setOpenHistory(true);
    setLoadingHistory(true);
    try {
      const data = await paymentService.getPaymentsByCandidate(candidate._id);
      setHistoryPayments(Array.isArray(data) ? data : data.payments || []);
    } catch {
      setHistoryPayments([]);
    }
    setLoadingHistory(false);
  }, []);

  const handleCloseHistory = () => {
    setOpenHistory(false);
    setHistoryCandidate(null);
    setHistoryPayments([]);
  };

  function loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  const handlePrintHistory = async () => {
    if (!historyCandidate) return;
    setPrinting(true);
    // @ts-ignore
    const jsPDFModule = await import('jspdf');
    // @ts-ignore
    const autoTable = (await import('jspdf-autotable')).default || (await import('jspdf-autotable'));
    const doc = new jsPDFModule.jsPDF();
    // Charger le logo en base64
    const logoBase64 = await loadImageAsBase64('/logo.png');
    // Logo à gauche
    doc.addImage(logoBase64, 'PNG', 10, 10, 40, 20);
    // Infos auto-école à droite
    doc.setFontSize(13);
    const infoX = 200; // bord droit du PDF
    let infoY = 14;
    doc.text('EMMARY AUTO-ECOLE', infoX, infoY, { align: 'right' }); infoY += 6;
    doc.setFontSize(10);
    doc.text('Kouassi, Station des 3 ampoules', infoX, infoY, { align: 'right' }); infoY += 5;
    doc.text('Tél : +225 0708299652', infoX, infoY, { align: 'right' }); infoY += 5;
    doc.text('Email : emmaryae@gmail.com', infoX, infoY, { align: 'right' }); infoY += 5;
    doc.text('Directrice : Kouassi Yah Henriette', infoX, infoY, { align: 'right' }); infoY += 5;
    doc.text('RC-KOUMASSI-47', infoX, infoY, { align: 'right' });
    doc.setLineWidth(0.5);
    doc.line(10, 48, 200, 48);
    // Titre
    doc.setFontSize(14);
    doc.text('Historique des paiements du candidat', 105, 56, { align: 'center' });
    // Infos candidat
    doc.setFontSize(11);
    doc.text(`Nom : ${historyCandidate.lastName || ''}`, 10, 66);
    doc.text(`Prénom : ${historyCandidate.firstName || ''}`, 70, 66);
    doc.text(`CIN : ${historyCandidate.cin || '-'}`, 10, 72);
    doc.text(`Catégorie : ${Array.isArray(historyCandidate.licenseType) ? historyCandidate.licenseType.join(', ') : historyCandidate.licenseType || '-'}`, 70, 72);
    doc.text(`Nationalité : ${historyCandidate.nationality || '-'}`, 10, 78);
    // Tableau paiements
    autoTable(doc, {
      startY: 84,
      head: [['Date', 'Montant', 'Méthode', 'Description']],
      body: historyPayments.map(p => [
        new Date(p.date).toLocaleDateString('fr-FR'),
        `${p.amount} FCFA`,
        p.method,
        p.description || ''
      ]),
    });
    // Total
    const total = historyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    doc.setFontSize(12);
    doc.text(`Total payé : ${total} FCFA`, 10, (doc as any).lastAutoTable.finalY + 10);
    // Date d'édition
    doc.setFontSize(10);
    doc.text(`Édité le : ${new Date().toLocaleDateString('fr-FR')}`, 10, (doc as any).lastAutoTable.finalY + 18);
    // Signature
    doc.text('Signature / Directrice', 150, (doc as any).lastAutoTable.finalY + 25);
    doc.save(`Paiements_${historyCandidate.lastName || ''}_${historyCandidate.firstName || ''}.pdf`);
    setPrinting(false);
  };

  const resetFilters = () => {
    setSearch('');
    setFilterCategory('');
    setFilterDate('');
  };

  // Fonction utilitaire pour formater une date en JJ/MM/AAAA
  function toDDMMYYYYSlashed(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const filteredPayments = payments.filter(payment => {
    const nom = payment.candidate?.lastName?.toLowerCase() || '';
    const prenom = payment.candidate?.firstName?.toLowerCase() || '';
    const cat = Array.isArray(payment.candidate?.licenseType) ? payment.candidate.licenseType.join(',') : (payment.candidate?.licenseType || '');
    // Date du paiement au format JJ/MM/AAAA
    const paymentDateDDMMYYYY = payment.date ? toDDMMYYYYSlashed(payment.date) : '';
    let match = true;
    if (search && !(nom.includes(search.toLowerCase()) || prenom.includes(search.toLowerCase()))) match = false;
    if (filterCategory && cat.replace(/\s+/g, '') !== filterCategory.replace(/\s+/g, '')) match = false;
    // N'applique le filtre date que si la date est complète (10 caractères, 3 parties)
    if (filterDate && filterDate.length === 10 && filterDate.split('/').length === 3) {
      if (filterDate !== paymentDateDDMMYYYY) match = false;
    }
    return match;
  });
  const paginatedPayments = filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Regrouper les paiements par candidat
  const paymentsByCandidate = filteredPayments.reduce((acc, payment) => {
    const id = payment.candidate?._id;
    if (!id) return acc;
    if (!acc[id]) acc[id] = { candidate: payment.candidate, payments: [] };
    acc[id].payments.push(payment);
    return acc;
  }, {} as Record<string, { candidate: CandidateType, payments: PaymentType[] }>);
  const groupedCandidates = Object.values(paymentsByCandidate);

  console.log('PAIEMENTS AFFICHÉS DANS LE TABLEAU:', payments);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, sm: 3 }, background: '#f6f8fa', minHeight: '100vh' }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <PaymentIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" fontWeight={700} color="primary.main">Gestion des versements</Typography>
      </Stack>
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, background: '#fff', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', mb: 3 }}>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ fontWeight: 700, borderRadius: 1, background: '#1976d2', color: '#fff', boxShadow: 'none', textTransform: 'none', '&:hover': { background: '#1976d2', opacity: 0.9 } }}>Ajouter un versement</Button>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="flex-start" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <TextField
              size="small"
              placeholder="Rechercher par nom, prénom..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><span role="img" aria-label="search">🔍</span></InputAdornment>,
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton aria-label="Effacer la recherche" onClick={() => setSearch('')} edge="end" size="small" tabIndex={0}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: '#f8fafc',
                  borderRadius: 2.5,
                  px: 1.5,
                  boxShadow: '0 1px 4px #0001',
                  width: 320,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2', boxShadow: '0 0 0 2px #1976d220' },
                }
              }}
              inputProps={{ 'aria-label': 'Recherche versements' }}
              sx={{ width: 320 }}
              label="Recherche versements"
              InputLabelProps={{ shrink: false, style: { display: 'none' } }}
            />
            <Typography variant="body2" sx={{ ml: 2, color: '#888', minWidth: 80 }}>
              {filteredPayments.length} résultat{filteredPayments.length > 1 ? 's' : ''}
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="filter-category-label">Catégorie</InputLabel>
            <Select
              labelId="filter-category-label"
              value={filterCategory}
              label="Catégorie"
              onChange={e => setFilterCategory(e.target.value)}
              MenuProps={{ PaperProps: { sx: { maxHeight: 260 } } }}
            >
              <MenuItem value="">Toutes</MenuItem>
              {CATEGORIES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Date de versement"
            placeholder="JJ/MM/AAAA"
            value={filterDate}
            onChange={e => {
              let value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
              if (value.length >= 5) value = value.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
              else if (value.length >= 3) value = value.replace(/(\d{2})(\d{0,2})/, '$1/$2');
              setFilterDate(value);
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><CalendarTodayIcon fontSize="small" /></InputAdornment>,
              sx: { minWidth: 170 }
            }}
          />
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltIcon />}
            onClick={resetFilters}
            sx={{ height: 40, borderRadius: 2, color: '#555', borderColor: '#ccc', whiteSpace: 'nowrap', minWidth: 140 }}
          >
            Réinitialiser
          </Button>
        </Stack>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : (
          <TablePagination
            component="div"
            count={groupedCandidates.length}
            page={page}
            onPageChange={(e: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Éléments par page"
            sx={{ background: '#f6f8fa', borderRadius: 1, mb: 2 }}
          />
        )}
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#fff' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#888' }}>Candidat</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#888' }}>Catégorie</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#888' }}>Montant (FCFA)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#888' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#888' }}>Méthode</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#888' }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#888' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedCandidates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(({ candidate, payments }) => {
                const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
                const lastPayment = payments.reduce((latest, p) => (!latest || new Date(p.date) > new Date(latest.date)) ? p : latest, null as PaymentType | null);
                return (
                  <TableRow key={candidate._id} hover>
                  <TableCell>
                      <span style={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline', fontWeight: 600 }} onClick={() => handleOpenHistory(candidate)}>
                        {candidate.firstName} {candidate.lastName}
                        {candidate.deletedAt && (
                          <Chip label="Candidat supprimé" color="error" size="small" sx={{ ml: 1, fontWeight: 700 }} />
                        )}
                      </span>
                  </TableCell>
                    <TableCell>{Array.isArray(candidate.licenseType) ? candidate.licenseType.join(', ') : candidate.licenseType || '-'}</TableCell>
                    <TableCell><b>{totalPaid} FCFA</b></TableCell>
                    <TableCell>{lastPayment ? new Date(lastPayment.date).toLocaleDateString('fr-FR') : '-'}</TableCell>
                    <TableCell>{lastPayment ? <Chip label={lastPayment.method} color="info" variant="outlined" /> : '-'}</TableCell>
                    <TableCell>{lastPayment?.description || '-'}</TableCell>
                  <TableCell align="right">
                      <IconButton onClick={() => handleOpen(payments[0])} color="primary"><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(payments[0]._id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>{editPayment ? 'Modifier le versement' : 'Ajouter un versement'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="candidate-label">Candidat</InputLabel>
                <Select
                  labelId="candidate-label"
                  name="candidate"
                  value={form.candidate}
                  label="Candidat"
                  onChange={handleSelectChange}
                  required
                >
                  {candidates.map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.firstName} {c.lastName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {form.candidate && (
                <TextField
                  label="Catégorie du candidat"
                  value={
                    Array.isArray(candidates.find(c => c._id === form.candidate)?.licenseType)
                      ? candidates.find(c => c._id === form.candidate)?.licenseType?.join(', ')
                      : candidates.find(c => c._id === form.candidate)?.licenseType || ''
                  }
                  InputProps={{ readOnly: true }}
                  fullWidth
                  sx={{ bgcolor: '#f6f8fa', borderRadius: 1 }}
                  margin="dense"
                />
              )}
              <TextField
                name="amount"
                label="Montant"
                type="number"
                value={form.amount}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{ endAdornment: <InputAdornment position="end">FCFA</InputAdornment> }}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                name="date"
                label="Date"
                type="date"
                value={form.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel id="method-label">Méthode</InputLabel>
                <Select
                  labelId="method-label"
                  name="method"
                  value={form.method}
                  label="Méthode"
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="espèces">Espèces</MenuItem>
                  <MenuItem value="chèque">Chèque</MenuItem>
                  <MenuItem value="virement">Virement</MenuItem>
                  <MenuItem value="cb">Carte bancaire</MenuItem>
                </Select>
              </FormControl>
              <TextField
                name="description"
                label="Description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
              />
              <FormControl fullWidth>
                <InputLabel id="status-label">Statut</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={form.status}
                  label="Statut"
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="effectué">Effectué</MenuItem>
                  <MenuItem value="en attente">En attente</MenuItem>
                  <MenuItem value="remboursé">Remboursé</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} variant="outlined">Annuler</Button>
            <Button type="submit" variant="contained">{editPayment ? 'Enregistrer' : 'Ajouter'}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={openHistory} onClose={handleCloseHistory} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, minHeight: 500 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', fontSize: 24 }}>
          Historique des paiements — {historyCandidate?.firstName} {historyCandidate?.lastName}
        </DialogTitle>
        <DialogContent dividers>
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><CircularProgress /></Box>
          ) : (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Catégorie : {Array.isArray(historyCandidate?.licenseType) ? historyCandidate?.licenseType.join(', ') : historyCandidate?.licenseType || '-'}
              </Typography>
              {historyPayments.length === 0 ? (
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
                      {historyPayments.map((p) => (
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
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistory} variant="outlined">Fermer</Button>
          <Button onClick={handlePrintHistory} variant="contained" color="primary" disabled={printing}>Imprimer</Button>
          {printing && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </DialogActions>
      </Dialog>
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer ce versement ? Cette action est irréversible.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">Annuler</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payments; 