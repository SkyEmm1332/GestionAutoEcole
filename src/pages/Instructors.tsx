import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  LinearProgress,
  TablePagination,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, EventBusy as EventBusyIcon, School } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { fr } from 'date-fns/locale';
import { SelectChangeEvent } from '@mui/material';
import { instructorService } from '../services/instructorService';
import jsPDF from 'jspdf';
import logo from '../logo.png';
import badgeRecto from '../badge_recto.jpg';
import badgeVerso from '../badge_verso.jpg';
import PrintBadge from '../components/PrintBadge';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`instructors-tabpanel-${index}`}
      aria-labelledby={`instructors-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const instructorStatus = [
  { value: 'actif', color: 'success' },
  { value: 'inactif', color: 'default' },
  { value: 'vacances', color: 'warning' },
  { value: 'maladie', color: 'error' }
];

const licenseTypes = ['A', 'B', 'C', 'D', 'E'];

function getMuiColor(status: string): "info" | "warning" | "success" | "error" | "default" {
  switch (status) {
    case "actif": return "success";
    case "inactif": return "default";
    case "vacances": return "warning";
    case "maladie": return "error";
    default: return "default";
  }
}

interface InstructorType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specializations: string[];
  hourlyRate: number;
  maxStudents: number;
  status: string;
  notes?: string;
  matricule: string;
  fonction: string;
  birthDate: string;
  birthPlace: string;
  document: string;
  photo: string;
}

const tabLabels = [
  { label: 'Liste des moniteurs', value: 0 }
];

const STATUS = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'vacances', label: 'Vacances' },
  { value: 'maladie', label: 'Maladie' }
];
const SPECIALIZATIONS = ['A', 'B', 'C', 'D', 'E'];
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100, 'Tout afficher'];

const FONCTIONS = [
  'Directeur',
  'Directrice',
  'Sous-directeur',
  'Sous-directrice',
  'Secrétaire',
  'Moniteur',
  'Monitrice',
];

// Fonction utilitaire pour charger une image en base64
const getBase64FromImage = (imgPath: string): Promise<string> =>
  new Promise((resolve, reject) => {
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
    img.src = imgPath;
  });

const Instructors: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [instructors, setInstructors] = useState<InstructorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editInstructor, setEditInstructor] = useState<any>(null);
  const [form, setForm] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
    fonction: '',
    document: '',
    birthDate: '',
    birthPlace: '',
    status: '',
    photo: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState<number | string>(25);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const data = await instructorService.getInstructors();
      setInstructors(data.instructors || []);
      setTotal((data.instructors || []).length);
      setError(null);
    } catch (e) {
      setInstructors([]);
      setTotal(0);
      setError("Erreur lors du chargement des instructeurs.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setForm({ lastName: '', firstName: '', phone: '', email: '', fonction: '', document: '', birthDate: '', birthPlace: '', status: '', photo: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditInstructor(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFonctionChange = (e: any) => {
    setForm(prev => ({ ...prev, fonction: e.target.value }));
  };

  const handleStatusChange = (e: any) => {
    setForm(prev => ({ ...prev, status: e.target.value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({ ...prev, photo: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = async (instructor: InstructorType) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 86] });
  
    // === RECTO ===
    // Dimensions du badge
    const badgeWidth = 54;
    const badgeHeight = 86;
    const zoneHeight = badgeHeight * 0.35; // Zone blanche en haut (35%)
    
    // Couleurs
    const colors = {
      blueDark: [15, 30, 64], // #0F1E40
      yellow: [255, 193, 7],  // #FFC107
      white: [255, 255, 255],
      grayLight: [200, 200, 200],
      grayDark: [100, 100, 100],
      blueNavy: [0, 50, 100]
    };
    
    // Styles de texte
    const styles = {
      logo: { font: 'helvetica', style: 'bold', size: 8, color: colors.blueDark },
      slogan: { font: 'helvetica', style: 'normal', size: 6, color: colors.grayLight },
      name: { font: 'helvetica', style: 'bold', size: 11, color: colors.yellow },
      function: { font: 'helvetica', style: 'normal', size: 8, color: colors.white },
      contact: { font: 'helvetica', style: 'normal', size: 7, color: colors.white }
    };
    
    // Fonction pour appliquer un style
    const applyStyle = (style: any) => {
      doc.setFont(style.font, style.style);
      doc.setFontSize(style.size);
      doc.setTextColor(style.color[0], style.color[1], style.color[2]);
    };
    
    // Charger l'image de fond du recto
    try {
      const rectoBase64 = await getBase64FromImage(badgeRecto);
      doc.addImage(rectoBase64, 'JPEG', 0, 0, 54, 86);
    } catch (error) {
      // Si l'image n'existe pas, créer le design en code
      // 1. Fond principal (bleu foncé)
      doc.setFillColor(colors.blueDark[0], colors.blueDark[1], colors.blueDark[2]);
      doc.rect(0, 0, badgeWidth, badgeHeight, 'F');
      
      // 2. Zone blanche en haut
      doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.rect(0, 0, badgeWidth, zoneHeight, 'F');
      
      // 3. Bande courbe jaune (simulation avec un rectangle arrondi)
      doc.setFillColor(colors.yellow[0], colors.yellow[1], colors.yellow[2]);
      doc.rect(0, zoneHeight - 5, badgeWidth, 10, 'F');
    }
    
    // 4. Logo et slogan (zone blanche)
    applyStyle(styles.logo);
    doc.text('YOUR LOGO', badgeWidth/2, 12, { align: 'center' });
    
    applyStyle(styles.slogan);
    doc.text('SLOGAN', badgeWidth/2, 18, { align: 'center' });
    
    // 5. Photo ronde avec bordure jaune (simulation)
    const photoRadius = 12;
    const photoX = badgeWidth/2;
    const photoY = zoneHeight + 5;
    
    // Bordure jaune de la photo
    doc.setFillColor(colors.yellow[0], colors.yellow[1], colors.yellow[2]);
    doc.circle(photoX, photoY, photoRadius + 2, 'F');
    
    // Photo (fond blanc pour simulation)
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.circle(photoX, photoY, photoRadius, 'F');
    
    // 6. Nom complet (jaune, centré)
    applyStyle(styles.name);
    const fullName = `${instructor.lastName || 'ROBERTS'} ${instructor.firstName || 'STEVE'}`.toUpperCase();
    doc.text(fullName, 10, photoY + photoRadius + 15, { align: 'left' });
    
    // 7. Fonction (blanc)
    applyStyle(styles.function);
    doc.text((instructor.fonction || 'ACCOUNTANT').toUpperCase(), 10, photoY + photoRadius + 22, { align: 'left' });
    
    // 8. Infos de contact avec icônes carrées jaunes
    applyStyle(styles.contact);
    let currentY = photoY + photoRadius + 30;
    
    // Email
    doc.setFillColor(colors.yellow[0], colors.yellow[1], colors.yellow[2]);
    doc.rect(8, currentY - 3, 3, 3, 'F');
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.text(instructor.email || 'STEVE@COMPANY.COM', 13, currentY, { align: 'left' });
    
    // Site web
    currentY += 8;
    doc.setFillColor(colors.yellow[0], colors.yellow[1], colors.yellow[2]);
    doc.rect(8, currentY - 3, 3, 3, 'F');
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.text('WWW.WEBSITE.COM', 13, currentY, { align: 'left' });
    
    // Adresse ligne 1
    currentY += 8;
    doc.setFillColor(colors.yellow[0], colors.yellow[1], colors.yellow[2]);
    doc.rect(8, currentY - 3, 3, 3, 'F');
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.text('713 SOUTH LAS VEGAS BOULEVARD,', 13, currentY, { align: 'left' });
    
    // Adresse ligne 2
    currentY += 6;
    doc.text('LAS VEGAS, NV 89101-6755', 13, currentY, { align: 'left' });
    
    // Téléphone
    currentY += 8;
    doc.setFillColor(colors.yellow[0], colors.yellow[1], colors.yellow[2]);
    doc.rect(8, currentY - 3, 3, 3, 'F');
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.text(instructor.phone || '+1 (702) 500-0000', 13, currentY, { align: 'left' });
    
    // 9. Motifs décoratifs
    // Points blancs en triangle (bas droite)
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j <= i; j++) {
        doc.circle(badgeWidth - 8 + j * 2, badgeHeight - 8 + i * 2, 0.5, 'F');
      }
    }
    
    // Lignes jaunes en coin (haut gauche) - Utilisation de rectangles fins au lieu de lignes
    doc.setFillColor(colors.yellow[0], colors.yellow[1], colors.yellow[2]);
    doc.rect(2, 2, 6, 0.5, 'F'); // Ligne horizontale
    doc.rect(2, 2, 0.5, 6, 'F'); // Ligne verticale
    doc.rect(2, 8, 4, 0.5, 'F'); // Ligne horizontale courte
    
    // === VERSO ===
    doc.addPage([54, 86], 'portrait');
    
    // Essayer de charger l'image du verso, sinon créer un verso simple
    try {
      const versoBase64 = await getBase64FromImage(badgeVerso);
      doc.addImage(versoBase64, 'JPEG', 0, 0, 54, 86);
    } catch (error) {
      // Si l'image n'existe pas, créer un verso simple
      doc.setFillColor(colors.blueDark[0], colors.blueDark[1], colors.blueDark[2]);
      doc.rect(0, 0, 54, 86, 'F');
      
      doc.setFillColor(colors.yellow[0], colors.yellow[1], colors.yellow[2]);
      doc.text('VERSO DU BADGE', 27, 43, { align: 'center' });
    }
    
    doc.save(`badge_${instructor.lastName}_${instructor.firstName}.pdf`);
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lastName.trim() || !form.firstName.trim() || !form.phone.trim() || !form.fonction.trim() || !form.document.trim()) {
      return;
    }
    const lastNameUC = form.lastName.trim().toUpperCase();
    const firstNameUC = form.firstName.trim().toUpperCase();
    const matricule = `${form.firstName.trim().charAt(0).toLowerCase()}.${form.lastName.trim().toLowerCase().replace(/\s+/g, '')}.e.ae`;
    try {
      if (editInstructor) {
        await instructorService.updateInstructor(editInstructor._id, {
          ...form,
          lastName: lastNameUC,
          firstName: firstNameUC,
          matricule,
        });
      } else {
        await instructorService.createInstructor({
          ...form,
          lastName: lastNameUC,
          firstName: firstNameUC,
          matricule,
        });
      }
      fetchInstructors();
      setOpenDialog(false);
      setEditInstructor(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erreur lors de l'ajout du moniteur.";
      setError(msg);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await instructorService.deleteInstructor(deleteId);
        fetchInstructors();
      } catch (e) {
        setError("Erreur lors de la suppression de l'instructeur.");
      }
    }
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  // Filtres locaux (à remplacer par API si dispo)
  const filtered = instructors.filter(i => {
    let match = true;
    if (search && !(`${i.lastName} ${i.firstName} ${i.phone} ${i.email}`.toLowerCase().includes(search.toLowerCase()))) match = false;
    if (filterSpecialization && !(i.specializations || []).includes(filterSpecialization)) match = false;
    if (filterStatus && i.status !== filterStatus) match = false;
    return match;
  });
  const paginated = rowsPerPage === 'Tout afficher' ? filtered : filtered.slice(page * Number(rowsPerPage), page * Number(rowsPerPage) + Number(rowsPerPage));

  const resetFilters = () => {
    setSearch('');
    setFilterSpecialization('');
    setFilterStatus('');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Liste des moniteurs</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2 }} onClick={() => handleOpenDialog()}>
          Nouveau moniteur
        </Button>
      </Stack>
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="flex-start">
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <TextField
              size="small"
              placeholder="Rechercher par nom, prénom, téléphone, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><span role="img" aria-label="search">🔍</span></InputAdornment>,
                endAdornment: search && (
                  <InputAdornment position="end">
                    {search && (
                      <Button aria-label="Effacer la recherche" onClick={() => setSearch('')} size="small" tabIndex={0} sx={{ ml: 1, minWidth: 0, p: 0, color: '#888', fontSize: 13 }}>
                        Effacer
                      </Button>
                    )}
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
              inputProps={{ 'aria-label': 'Recherche moniteurs' }}
              sx={{ width: 320 }}
              label="Recherche moniteurs"
              InputLabelProps={{ shrink: false, style: { display: 'none' } }}
            />
            <Typography variant="body2" sx={{ ml: 2, color: '#888', minWidth: 80 }}>
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
            </Typography>
        </Box>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="filter-status-label">Statut</InputLabel>
            <Select
              labelId="filter-status-label"
              value={filterStatus}
              label="Statut"
              onChange={e => setFilterStatus(e.target.value)}
              MenuProps={{ PaperProps: { sx: { maxHeight: 260 } } }}
            >
              <MenuItem value="">Tous</MenuItem>
              {STATUS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            color="inherit"
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
              onChange={e => setRowsPerPage(e.target.value)}
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Matricule</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Prénom</TableCell>
                  <TableCell>Fonction</TableCell>
                  <TableCell>Document d'identification</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ color: '#888' }}>
                      Aucun moniteur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((row, idx) => (
                    <TableRow key={row._id || idx} hover>
                      <TableCell>{row.matricule}</TableCell>
                      <TableCell>{row.lastName ? row.lastName.toUpperCase() : ''}</TableCell>
                      <TableCell>{row.firstName ? row.firstName.toUpperCase() : ''}</TableCell>
                      <TableCell>{row.fonction}</TableCell>
                      <TableCell>{row.document}</TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <PrintBadge instructor={row} />
                          <IconButton color="primary" onClick={() => {
                            setEditInstructor(row);
                            setForm({ ...row });
                            setOpenDialog(true);
                          }}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={() => handleDelete(row._id)}><DeleteIcon /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {rowsPerPage !== 'Tout afficher' && (
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={typeof rowsPerPage === 'number' ? rowsPerPage : 25}
              onRowsPerPageChange={e => setRowsPerPage(e.target.value)}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS.filter(opt => opt !== 'Tout afficher').map(opt => Number(opt))}
              labelRowsPerPage="Afficher"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count !== -1 ? count : 'plus de ' + to}`}
              sx={{ minWidth: 320, mb: 2 }}
            />
          )}
        </>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontSize: 24, fontWeight: 700, pb: 0 }}>Ajouter un moniteur</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ bgcolor: '#f8fafc', borderRadius: 2, mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                  label="Nom *"
                value={form.lastName}
                  onChange={handleFormChange}
                required
                fullWidth
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
              />
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                  label="Prénom *"
                value={form.firstName}
                  onChange={handleFormChange}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="phone"
                  label="Téléphone *"
                  value={form.phone}
                  onChange={handleFormChange}
                required
                fullWidth
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
              />
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                value={form.email}
                  onChange={handleFormChange}
                fullWidth
                type="email"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="fonction-label">Fonction</InputLabel>
                <Select
                    labelId="fonction-label"
                    name="fonction"
                    value={form.fonction}
                    label="Fonction"
                    onChange={handleFonctionChange}
                    sx={{ borderRadius: 2 }}
                  >
                    {FONCTIONS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextField
                  name="document"
                  label="Document d'identification *"
                  value={form.document}
                  onChange={handleFormChange}
                required
                fullWidth
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="birthDate"
                  label="Date de naissance"
                  value={form.birthDate}
                  onChange={handleFormChange}
                  fullWidth
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextField
                  name="birthPlace"
                  label="Lieu de naissance"
                  value={form.birthPlace}
                  onChange={handleFormChange}
                fullWidth
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }}>
                    Photo d'identité
                    <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                  </Button>
                  {form.photo && (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                      <img src={form.photo} alt="Aperçu" style={{ maxWidth: 100, maxHeight: 120, borderRadius: 8, border: '1px solid #ccc' }} />
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Statut</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={form.status}
                  label="Statut"
                    onChange={handleStatusChange}
                    sx={{ borderRadius: 2 }}
                >
                    {STATUS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ pr: 3, pb: 2, pt: 3, justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseDialog} variant="outlined" sx={{ minWidth: 120, borderRadius: 2 }}>Annuler</Button>
            <Button type="submit" variant="contained" sx={{ minWidth: 120, borderRadius: 2, ml: 2 }} disabled={!form.lastName.trim() || !form.firstName.trim() || !form.phone.trim() || !form.fonction.trim() || !form.document.trim()}>Ajouter</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Instructors; 