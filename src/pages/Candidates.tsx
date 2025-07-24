import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Typography, Button, Tabs, Tab, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, Chip, InputAdornment, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControl, InputLabel, Select, SelectChangeEvent, Grid
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import PaymentIcon from '@mui/icons-material/Payment';
import PowerIcon from '@mui/icons-material/Power';
import ArticleIcon from '@mui/icons-material/Article';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { candidateService } from '../services/candidateService';
import { paymentService } from '../services/paymentService';
import { SnackbarContext } from '../components/Layout';
import TablePagination from '@mui/material/TablePagination';
import { CATEGORIES } from '../constants/categories';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { fr } from 'date-fns/locale';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const tabLabels = [
  { label: 'Liste des candidats', value: 'basic' }
];

const columns = [
  { id: 'cin', label: 'DOCUMENT D\'IDENTIFICATION' },
  { id: 'lastName', label: 'NOM' },
  { id: 'firstName', label: 'PRÉNOM' },
  { id: 'phone', label: 'TÉLÉPHONE' },
  { id: 'registrationDate', label: "DATE D'INSCRIPTION" },
  { id: 'category', label: 'CATÉGORIE' },
  { id: 'nationality', label: 'NATIONALITÉ' },
  { id: 'amount', label: 'MONTANT' },
  { id: 'actions', label: 'ACTIONS' }
];

const licenseTypes = ['A', 'B', 'A,B', 'B,C,D,E', 'A,B,C,D,E'];

// Fonction utilitaire pour formater la catégorie comme dans la colonne Catégorie
function formatCategory(licenseType: any): string {
  if (Array.isArray(licenseType)) return licenseType.join(',');
  if (typeof licenseType === 'string') return licenseType.replace(/\s+/g, '');
  return '';
}

// Fonction utilitaire pour convertir jj/mm/aaaa en aaaa-mm-jj
function toISODate(input: string): string {
  const match = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return '';
  return `${match[3]}-${match[2]}-${match[1]}`;
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100, 'Tout afficher'];

const Candidates: React.FC = () => {
  const [tab, setTab] = useState('basic');
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showMessage } = useContext(SnackbarContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    cin: '',
    lastName: '',
    firstName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    phone: '',
    fatherName: '',
    motherName: '',
    registrationDate: '',
    licenseType: '',
    nationality: '',
    amount: '',
  });
  const [editCandidate, setEditCandidate] = useState<any>(null);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: '', method: '', description: '' });
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsCandidate, setDetailsCandidate] = useState<any>(null);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [candidatePayments, setCandidatePayments] = useState<any[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number | string>(25);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [filterLicenseType, setFilterLicenseType] = useState('');
  const [filterRegistrationDate, setFilterRegistrationDate] = useState('');
  const [allLicenseTypes, setAllLicenseTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    nationality: '',
    registrationDate: '',
  });

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params: any = { };
      if (rowsPerPage !== 'Tout afficher') {
        params.page = page + 1;
        params.limit = rowsPerPage;
      }
      if (filterLicenseType) params.licenseType = filterLicenseType;
      if (search) params.search = search;
      if (filterRegistrationDate) {
        const iso = toISODate(filterRegistrationDate);
        if (iso) params.registrationDate = iso;
      }
      const data = await candidateService.getCandidates(params);
      setCandidates(data.candidates || data || []);
      setTotal(data.total || 0);
    } catch (e) {
      showMessage("Erreur lors du chargement des candidats", 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, [page, rowsPerPage]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchCandidates();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    setPage(0);
    fetchCandidates();
    // eslint-disable-next-line
  }, [filterLicenseType, search, filterRegistrationDate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await candidateService.getCategories();
        setAllLicenseTypes(cats);
      } catch {}
    };
    fetchCategories();
    // eslint-disable-next-line
  }, [search, filterRegistrationDate]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce candidat ? Cette action est irréversible.")) return;
    try {
      await candidateService.deleteCandidate(id);
      showMessage('Candidat supprimé avec succès', 'success');
      fetchCandidates();
    } catch (e) {
      showMessage("Erreur lors de la suppression du candidat", 'error');
    }
  };

  const handleOpenDialog = () => {
    setForm({
      cin: '',
      lastName: '',
      firstName: '',
      dateOfBirth: '',
      placeOfBirth: '',
      phone: '',
      fatherName: '',
      motherName: '',
      registrationDate: '',
      licenseType: '',
      nationality: '',
      amount: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: any) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEdit = (candidate: any) => {
    setForm({
      cin: candidate.cin || '',
      lastName: candidate.lastName || candidate.nom || '',
      firstName: candidate.firstName || '',
      dateOfBirth: candidate.dateOfBirth ? candidate.dateOfBirth.slice(0, 10) : '',
      placeOfBirth: candidate.placeOfBirth || '',
      phone: candidate.phone || '',
      fatherName: candidate.fatherName || '',
      motherName: candidate.motherName || '',
      registrationDate: candidate.registrationDate ? candidate.registrationDate.slice(0, 10) : '',
      licenseType: candidate.licenseType || candidate.category || '',
      nationality: candidate.nationality || '',
      amount: candidate.amount !== undefined ? candidate.amount : '',
    });
    setEditCandidate(candidate);
    setOpenDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formToSend = { ...form, amount: form.amount ? Number(form.amount) : 0 };
      if (editCandidate) {
        await candidateService.updateCandidate(editCandidate._id, formToSend);
        showMessage('Candidat modifié avec succès', 'success');
      } else {
        await candidateService.createCandidate(formToSend);
        showMessage('Candidat ajouté avec succès', 'success');
      }
      fetchCandidates();
      handleCloseDialog();
      setEditCandidate(null);
    } catch (e) {
      showMessage("Erreur lors de l'enregistrement du candidat", 'error');
    }
  };

  const handleOpenPayment = async (candidate: any) => {
    setEditCandidate(candidate);
    setPaymentForm({ amount: '', date: '', method: '', description: '' });
    try {
      const payments = await paymentService.getPaymentsByCandidate(candidate._id);
      setCandidatePayments(payments || []);
      const total = (payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      setTotalPaid(total);
    } catch {
      setCandidatePayments([]);
      setTotalPaid(0);
    }
    setOpenPaymentDialog(true);
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentService.createPayment({ ...paymentForm, candidate: editCandidate._id });
      showMessage('Paiement enregistré', 'success');
      setOpenPaymentDialog(false);
    } catch (e) {
      showMessage("Erreur lors de l'enregistrement du paiement", 'error');
    }
  };

  const handleDeactivate = async (candidate: any) => {
    showMessage('La désactivation n\'est plus disponible.', 'info');
  };

  const handleOpenDetails = (candidate: any) => {
    setDetailsCandidate(candidate);
    setOpenDetailsDialog(true);
  };

  const handleOpenPrint = (candidate: any) => {
    setDetailsCandidate(candidate);
    setOpenPrintDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await candidateService.deleteCandidate(deleteId);
      showMessage('Candidat supprimé avec succès', 'success');
      fetchCandidates();
    } catch (e) {
      showMessage("Erreur lors de la suppression du candidat", 'error');
    }
    setOpenDeleteDialog(false);
    setDeleteId(null);
  };

  // Filtrage strict sur la catégorie affichée
  const filteredCandidates = filterLicenseType
    ? candidates.filter(c => formatCategory(c.licenseType) === filterLicenseType)
    : candidates;

  // Pagination : paginer sur filteredCandidates si filtre actif, sinon sur tous les candidats
  const paginatedList = filterLicenseType ? filteredCandidates : candidates;

  // Gestionnaire de saisie pour formater automatiquement la date jj/mm/aaaa
  function handleDateInput(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) value = value.slice(0,2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0,5) + '/' + value.slice(5);
    if (value.length > 10) value = value.slice(0,10);
    setFilterRegistrationDate(value);
  }

  // Handler pour TablePagination
  const handleTablePaginationRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setRowsPerPage(value);
    setPage(0);
  };
  // Handler pour le Select personnalisé
  const handleSelectRowsPerPage = (event: SelectChangeEvent<string | number>) => {
    const value = event.target.value === 'Tout afficher' ? 'Tout afficher' : Number(event.target.value);
    setRowsPerPage(value);
    setPage(0);
  };

  // Ajout d'une fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setSearch('');
    setFilterLicenseType('');
    setFilterRegistrationDate('');
  };

  // Fonction pour générer le PDF du candidat (style moderne simple, pas premium)
  const generateCandidatePDF = async (candidate: any) => {
    const doc = new jsPDF();
    // Charger le logo en base64
    const loadImageAsBase64 = (url: string): Promise<string> => {
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
    };
    const logoBase64 = await loadImageAsBase64(process.env.PUBLIC_URL + '/logo.png');
    // Logo à gauche
    doc.addImage(logoBase64, 'PNG', 10, 10, 40, 20);
    // Infos auto-école à droite
    doc.setFontSize(13);
    const infoX = 200;
    let infoY = 14;
    doc.setTextColor('#1976d2');
    doc.text('EMMARY AUTO-ECOLE', infoX, infoY, { align: 'right' }); infoY += 6;
    doc.setFontSize(10);
    doc.setTextColor('#333');
    doc.text('Kouassi, Station des 3 ampoules', infoX, infoY, { align: 'right' }); infoY += 5;
    doc.text('Tél : +225 0708299652', infoX, infoY, { align: 'right' }); infoY += 5;
    doc.text('Email : emmaryae@gmail.com', infoX, infoY, { align: 'right' }); infoY += 5;
    doc.text('Directrice : Kouassi Yah Henriette', infoX, infoY, { align: 'right' }); infoY += 5;
    doc.text('RC-KOUMASSI-47', infoX, infoY, { align: 'right' });
    // Séparation visuelle
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.7);
    doc.line(10, 48, 200, 48);
    // Bande colorée sous le titre
    doc.setFillColor(25, 118, 210);
    doc.rect(10, 52, 190, 14, 'F');
    // Titre
    doc.setFontSize(16);
    doc.setTextColor('#fff');
    doc.setFont('helvetica', 'bold');
    doc.text('Fiche d\'information du candidat', 105, 62, { align: 'center' });
    // Fond gris clair pour la fiche
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(15, 72, 180, 90, 5, 5, 'F');
    // Infos candidat (dans l'encadré)
    let y = 82;
    doc.setFontSize(12);
    const champ = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#1976d2');
      doc.text(label, 25, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#222');
      doc.text(value, 80, y);
      y += 10;
    };
    champ('Nom :', `${candidate.lastName || candidate.nom} ${candidate.firstName}`);
    champ("Document d'identification :", candidate.cin || '-');
    champ('Date de naissance :', candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toLocaleDateString('fr-FR') : '-');
    champ('Lieu de naissance :', candidate.placeOfBirth || '-');
    champ('Téléphone :', candidate.phone || '-');
    champ('Nom du père :', candidate.fatherName || '-');
    champ('Nom de la mère :', candidate.motherName || '-');
    champ("Date d'inscription :", candidate.registrationDate ? new Date(candidate.registrationDate).toLocaleDateString('fr-FR') : '-');
    champ('Catégorie :', Array.isArray(candidate.licenseType) ? candidate.licenseType.join(', ') : (candidate.licenseType || '-'));
    champ('Nationalité :', candidate.nationality || '-');
    champ('Coût du permis :', candidate.amount !== undefined ? `${candidate.amount} FCFA` : '-');
    // Pied de page : date d'édition à gauche et signature à droite, sur la même ligne, un peu plus haut
    doc.setFontSize(10);
    doc.setTextColor('#444');
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.text(`Édité le : ${new Date().toLocaleDateString('fr-FR')}`, 20, pageHeight - 30);
    doc.text('Signature / Directrice', 200 - 20, pageHeight - 30, { align: 'right' });
    doc.save(`Fiche_Candidat_${candidate.lastName || candidate.nom}_${candidate.firstName}.pdf`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>GESTION DES CANDIDATS</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog} sx={{ borderRadius: 2 }}>
          Ajouter un candidat
        </Button>
      </Stack>
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="flex-start">
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <TextField
              size="small"
              placeholder="Rechercher par nom, prénom, téléphone..."
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
              inputProps={{ 'aria-label': 'Recherche candidats' }}
              sx={{ width: 320 }}
              label="Recherche candidats"
              InputLabelProps={{ shrink: false, style: { display: 'none' } }}
            />
            {typeof total === 'number' && (
              <Typography variant="body2" sx={{ ml: 2, color: '#888', minWidth: 80 }}>
                {total} résultat{total > 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="filter-license-label">Catégorie</InputLabel>
            <Select
              labelId="filter-license-label"
              value={filterLicenseType}
              label="Catégorie"
              onChange={e => {
                setFilterLicenseType(e.target.value);
                setPage(0);
              }}
              MenuProps={{ PaperProps: { sx: { maxHeight: 260 } } }}
            >
              <MenuItem value="">Toutes</MenuItem>
              {CATEGORIES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DatePicker
              label="Date d'inscription"
              value={filterRegistrationDate ? new Date(toISODate(filterRegistrationDate)) : null}
              onChange={date => {
                if (date) {
                  const d = date as Date;
                  const formatted = d.toLocaleDateString('fr-FR');
                  setFilterRegistrationDate(formatted);
                } else {
                  setFilterRegistrationDate('');
                }
              }}
              slotProps={{
                textField: { size: 'small', sx: { minWidth: 170 } },
                field: { clearable: true }
              }}
              format="dd/MM/yyyy"
            />
          </LocalizationProvider>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltIcon />}
            onClick={resetFilters}
            sx={{ height: 40, borderRadius: 2, color: '#555', borderColor: '#ccc', whiteSpace: 'nowrap', minWidth: 140 }}
          >
            Réinitialiser
          </Button>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="rows-per-page-label">Lignes par page</InputLabel>
            <Select
              labelId="rows-per-page-label"
              value={rowsPerPage}
              label="Lignes par page"
              onChange={handleSelectRowsPerPage}
            >
              {ROWS_PER_PAGE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option === 'Tout afficher' ? option : `${option} lignes`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          </Stack>
      </Paper>
          {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 220 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {rowsPerPage !== 'Tout afficher' && (
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={typeof rowsPerPage === 'number' ? rowsPerPage : 25}
              onRowsPerPageChange={handleTablePaginationRowsPerPage}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS.filter(opt => opt !== 'Tout afficher').map(opt => Number(opt))}
              labelRowsPerPage="Afficher"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count !== -1 ? count : 'plus de ' + to}`}
              sx={{ minWidth: 320, mb: 2 }}
            />
          )}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map(col => (
                    <TableCell key={col.id} sx={{ fontWeight: 700 }}>{col.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(filterLicenseType
                  ? filteredCandidates.slice(page * Number(rowsPerPage), page * Number(rowsPerPage) + Number(rowsPerPage))
                  : candidates
                ).map((row, idx) => (
                  <TableRow key={row._id || idx}>
                    <TableCell>{row.cin}</TableCell>
                    <TableCell>{row.lastName || row.nom}</TableCell>
                    <TableCell>{row.firstName}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.registrationDate ? new Date(row.registrationDate).toLocaleDateString('fr-FR') : ''}</TableCell>
                    <TableCell>{Array.isArray(row.licenseType) ? row.licenseType.join(',') : (typeof row.licenseType === 'string' ? row.licenseType.split(',').map((cat: string) => cat.trim()).join(',') : row.category || '-')}</TableCell>
                    <TableCell>{row.nationality}</TableCell>
                    <TableCell>{row.amount !== undefined ? `${row.amount} FCFA` : ''}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton color="primary" onClick={() => handleEdit(row)}><EditIcon /></IconButton>
                        <IconButton color="error" onClick={() => { setDeleteId(row._id); setOpenDeleteDialog(true); }}><DeleteIcon /></IconButton>
                        <IconButton color="success" onClick={() => handleOpenPayment(row)}><PaymentIcon /></IconButton>
                        <IconButton color="secondary" onClick={() => handleOpenPrint(row)}><PrintIcon /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>Ajouter un candidat</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField name="cin" label="Document d'identification" value={form.cin} onChange={handleFormChange} required fullWidth />
              <TextField name="lastName" label="Nom" value={form.lastName} onChange={handleFormChange} required fullWidth />
              <TextField name="firstName" label="Prénom" value={form.firstName} onChange={handleFormChange} required fullWidth />
              <TextField name="dateOfBirth" label="Date de naissance" type="date" value={form.dateOfBirth} onChange={handleFormChange} InputLabelProps={{ shrink: true }} required fullWidth />
              <TextField name="placeOfBirth" label="Lieu de naissance" value={form.placeOfBirth} onChange={handleFormChange} required fullWidth />
              <TextField name="phone" label="Téléphone" value={form.phone} onChange={handleFormChange} required fullWidth />
              <TextField name="fatherName" label="Nom du père" value={form.fatherName} onChange={handleFormChange} required fullWidth />
              <TextField name="motherName" label="Nom de la mère" value={form.motherName} onChange={handleFormChange} required fullWidth />
              <TextField name="registrationDate" label="Date d'inscription" type="date" value={form.registrationDate} onChange={handleFormChange} InputLabelProps={{ shrink: true }} required fullWidth />
              <FormControl fullWidth>
                <InputLabel id="licenseType-label">Type de permis</InputLabel>
                <Select labelId="licenseType-label" name="licenseType" value={form.licenseType} label="Type de permis" onChange={handleSelectChange} required>
                  {licenseTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField name="nationality" label="Nationalité" value={form.nationality} onChange={handleFormChange} required fullWidth />
              <TextField name="amount" label="Montant" value={form.amount} onChange={handleFormChange} required fullWidth type="number" InputProps={{ endAdornment: <InputAdornment position="end">FCFA</InputAdornment> }} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} variant="outlined">Annuler</Button>
            <Button type="submit" variant="contained">Ajouter</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>Versements du candidat</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography><b>Montant à payer :</b> {editCandidate?.amount !== undefined ? `${Number(editCandidate.amount)} FCFA` : '-'}</Typography>
            <Typography><b>Déjà versé :</b> {totalPaid} FCFA</Typography>
            <Typography><b>Reste à payer :</b> {editCandidate?.amount !== undefined ? Math.max(0, Number(editCandidate.amount) - totalPaid) : '-'} FCFA</Typography>
            <Chip
              label={editCandidate?.amount !== undefined && Number(editCandidate.amount) > 0 && totalPaid >= Number(editCandidate.amount) ? 'Payé' : 'Reste à payer'}
              color={editCandidate?.amount !== undefined && Number(editCandidate.amount) > 0 && totalPaid >= Number(editCandidate.amount) ? 'success' : 'warning'}
              sx={{ mt: 1 }}
            />
          </Box>
          <form onSubmit={handlePaymentSubmit}>
            <Stack spacing={2}>
              <TextField name="amount" label="Montant du versement" value={paymentForm.amount} onChange={handlePaymentChange} required fullWidth type="number" InputProps={{ endAdornment: <InputAdornment position="end">FCFA</InputAdornment> }} />
              <TextField name="date" label="Date" type="date" value={paymentForm.date} onChange={handlePaymentChange} required fullWidth InputLabelProps={{ shrink: true }} />
              <FormControl fullWidth required>
                <InputLabel id="method-label">Méthode</InputLabel>
                <Select
                  labelId="method-label"
                  name="method"
                  value={paymentForm.method}
                  label="Méthode"
                  onChange={e => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                >
                  <MenuItem value="Espèces">Espèces</MenuItem>
                  <MenuItem value="Mobile Money">Mobile Money</MenuItem>
                </Select>
              </FormControl>
              <TextField name="description" label="Description" value={paymentForm.description} onChange={handlePaymentChange} fullWidth />
            </Stack>
            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={() => setOpenPaymentDialog(false)} variant="outlined">Annuler</Button>
              <Button type="submit" variant="contained">Ajouter le versement</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {/* Implementation of handleOpenDetails dialog content */}
      </Dialog>
      <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center', pb: 0 }}>
          <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Logo" style={{ height: 60, marginBottom: 8 }} />
          <div>Fiche d'information du candidat</div>
        </DialogTitle>
        <DialogContent>
          {detailsCandidate && (
            <Box id="fiche-candidat-print" sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 2px 16px #0002',
              bgcolor: '#f9fafb',
              maxWidth: 500,
              mx: 'auto',
              my: 2,
              fontFamily: 'Arial, sans-serif',
              color: '#1a237e',
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', color: '#1976d2' }}>
                {detailsCandidate.lastName || detailsCandidate.nom} {detailsCandidate.firstName}
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}><b>Document d'identification :</b></Grid>
                <Grid item xs={6}>{detailsCandidate.cin}</Grid>
                <Grid item xs={6}><b>Date de naissance :</b></Grid>
                <Grid item xs={6}>{detailsCandidate.dateOfBirth ? new Date(detailsCandidate.dateOfBirth).toLocaleDateString('fr-FR') : '-'}</Grid>
                <Grid item xs={6}><b>Lieu de naissance :</b></Grid>
                <Grid item xs={6}>{detailsCandidate.placeOfBirth || '-'}</Grid>
                <Grid item xs={6}><b>Téléphone :</b></Grid>
                <Grid item xs={6}>{detailsCandidate.phone}</Grid>
                <Grid item xs={6}><b>Nom du père :</b></Grid>
                <Grid item xs={6}>{detailsCandidate.fatherName || '-'}</Grid>
                <Grid item xs={6}><b>Nom de la mère :</b></Grid>
                <Grid item xs={6}>{detailsCandidate.motherName || '-'}</Grid>
                <Grid item xs={6}><b>Date d'inscription :</b></Grid>
                <Grid item xs={6}>{detailsCandidate.registrationDate ? new Date(detailsCandidate.registrationDate).toLocaleDateString('fr-FR') : '-'}</Grid>
                <Grid item xs={6}><b>Catégorie :</b></Grid>
                <Grid item xs={6}>{Array.isArray(detailsCandidate.licenseType) ? detailsCandidate.licenseType.join(', ') : detailsCandidate.licenseType}</Grid>
                <Grid item xs={6}><b>Nationalité :</b></Grid>
                <Grid item xs={6}>{detailsCandidate.nationality}</Grid>
                <Grid item xs={6}><b>Coût du permis :</b></Grid>
                <Grid item xs={6}>{detailsCandidate.amount !== undefined ? `${detailsCandidate.amount} FCFA` : '-'}</Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={() => setOpenPrintDialog(false)} variant="outlined">Fermer</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => detailsCandidate && generateCandidatePDF(detailsCandidate)}
          >
            Imprimer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: '#333', fontWeight: 500 }}>
            Êtes-vous sûr de vouloir supprimer ce candidat ?<br/>Cette action est <b>irréversible</b>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">Annuler</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Candidates; 