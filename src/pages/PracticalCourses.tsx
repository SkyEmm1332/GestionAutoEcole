import React, { useEffect, useState, useContext } from 'react';
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
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  LinearProgress,
  InputAdornment,
  TablePagination,
  Checkbox,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Tooltip,
  Snackbar,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import PaymentIcon from '@mui/icons-material/Payment';
import PowerIcon from '@mui/icons-material/Power';
import ArticleIcon from '@mui/icons-material/Article';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import RestoreIcon from '@mui/icons-material/Restore';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { fr } from 'date-fns/locale';
import { courseService } from '../services/courseService';
import { instructorService } from '../services/instructorService';
import { candidateService } from '../services/candidateService';
import { SnackbarContext } from '../components/Layout';
import { paymentService } from '../services/paymentService';

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
      id={`practical-courses-tabpanel-${index}`}
      aria-labelledby={`practical-courses-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const courseTypes = ['conduite', 'manœuvre', 'parking', 'autoroute'];
const courseStatus = [
  { value: 'planifié', color: 'info' },
  { value: 'en_cours', color: 'warning' },
  { value: 'terminé', color: 'success' },
  { value: 'annulé', color: 'error' }
];

function getMuiColor(status: string): "info" | "warning" | "success" | "error" | "default" {
  switch (status) {
    case "planifié": return "info";
    case "en_cours": return "warning";
    case "terminé": return "success";
    case "annulé": return "error";
    default: return "default";
  }
}

interface PracticalCourseType {
  _id: string;
  title: string;
  type: string;
  instructor: string;
  description: string;
  date: string;
  location: string;
  status: string;
  enrolledStudents: any[];
}

const tabLabels = [
  { label: 'Cours Pratique', value: 'pratique' },
  { label: 'Séance supprimée', value: 'supplement' }
];

const columns = [
  { id: 'title', label: 'TITRE' },
  { id: 'enrolledStudents', label: 'CANDIDATS' },
  { id: 'instructor', label: 'INSTRUCTEUR' },
  { id: 'date', label: 'DATE' },
  { id: 'type', label: 'TYPE' },
  { id: 'actions', label: 'ACTIONS' }
];

const mockCourses = [
  { 
    title: 'Conduite 1', 
    enrolledStudents: [{ candidate: 'candidate1' }], 
    instructor: 'Mr. Karim', 
    date: '02/04/2022', 
    type: 'pratique',
    description: 'Cours de conduite en ville',
    location: 'Centre-ville',
    status: 'planifié'
  },
  { 
    title: 'Parking', 
    enrolledStudents: [{ candidate: 'candidate2' }], 
    instructor: 'Mme. Nadia', 
    date: '05/04/2022', 
    type: 'pratique',
    description: 'Exercices de stationnement',
    location: 'Parking école',
    status: 'planifié'
  },
];

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100, 'Tout afficher'];

const PracticalCourses: React.FC = () => {
  const [tab, setTab] = useState('pratique');
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<PracticalCourseType[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editCourse, setEditCourse] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    type: 'pratique',
    instructor: '',
    description: '',
    date: '',
    location: '',
    status: 'planifié',
    enrolledStudents: [] as any[],
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: '', method: '', description: '' });
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsCourse, setDetailsCourse] = useState<any>(null);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [attendanceCourse, setAttendanceCourse] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number | string>(25);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<any[]>([]);
  
  // États pour les nouvelles fonctionnalités
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [printData, setPrintData] = useState<any>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  
  // États pour les cours supprimés
  const [deletedCourses, setDeletedCourses] = useState<PracticalCourseType[]>([]);
  const [deletedCoursesLoading, setDeletedCoursesLoading] = useState(false);

  const [candidateSearchResults, setCandidateSearchResults] = useState<any[]>([]);
  const [candidateLoading, setCandidateLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue.toString());
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await courseService.getCourses();
      // Filtrer pour ne garder que les cours pratiques
      const practicalCourses = (data.courses || []).filter((course: any) => course.type === 'pratique');
      setCourses(practicalCourses);
      setError(null);
    } catch (e) {
      setError("Erreur lors du chargement des cours.");
    }
    setLoading(false);
  };

  const fetchDeletedCourses = async () => {
    setDeletedCoursesLoading(true);
    try {
      console.log('=== DÉBOGAGE - fetchDeletedCourses ===');
      const data = await courseService.getDeletedCourses();
      console.log('Données reçues de getDeletedCourses:', data);
      
      // Filtrer pour ne garder que les cours pratiques supprimés
      const deletedPracticalCourses = (data.courses || []).filter((course: any) => course.type === 'pratique');
      console.log('Cours pratiques supprimés filtrés:', deletedPracticalCourses);
      
      setDeletedCourses(deletedPracticalCourses);
    } catch (e) {
      console.error('Erreur lors du chargement des cours supprimés:', e);
      setDeletedCourses([]);
    }
    setDeletedCoursesLoading(false);
  };

  const fetchInstructors = async () => {
    try {
      const data = await instructorService.getInstructors();
      setInstructors(data.instructors || []);
    } catch (e) {
      setInstructors([]);
    }
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
    fetchCourses();
    fetchDeletedCourses();
    fetchInstructors();
    fetchCandidates();
  }, []);

  const handleOpenDialog = (course: any = null) => {
    setEditCourse(course);
    if (course) {
      setForm({
        title: course.title || '',
        type: course.type || 'pratique',
        instructor: course.instructor || '',
        description: course.description || '',
        date: course.date ? course.date.slice(0, 10) : '',
        location: course.location || '',
        status: course.status || 'planifié',
        enrolledStudents: course.enrolledStudents || [],
      });
      // Si c'est un cours existant, récupérer les candidats sélectionnés
      if (course.enrolledStudents && course.enrolledStudents.length > 0) {
        const selectedCands = candidates.filter(c => 
          course.enrolledStudents.some((enrollment: any) => 
            enrollment.candidate === c._id || enrollment.candidate._id === c._id
          )
        );
        setSelectedCandidates(selectedCands);
      } else {
        setSelectedCandidates([]);
      }
    } else {
      setForm({
        title: '',
        type: 'pratique',
        instructor: '',
        description: '',
        date: '',
        location: '',
        status: 'planifié',
        enrolledStudents: [],
      });
      setSelectedCandidates([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditCourse(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setForm(prev => ({ ...prev, [e.target.name as string]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug: Afficher les données envoyées
    console.log('=== DÉBOGAGE - DONNÉES DU FORMULAIRE ===');
    console.log('Form data:', form);
    console.log('Selected candidates:', selectedCandidates);
    console.log('Edit course:', editCourse);
    
    try {
      // Préparer les données pour l'API
      const courseData = {
        ...form,
        type: 'pratique', // Forcer le type pratique
        date: new Date(form.date).toISOString(), // Convertir en format ISO
        enrolledStudents: selectedCandidates.map(candidate => ({
          candidate: candidate._id,
          enrollmentDate: new Date(),
          attendance: false
        }))
      };
      
      console.log('=== DÉBOGAGE - DONNÉES ENVOYÉES À L\'API ===');
      console.log('Course data:', courseData);
      
      if (editCourse) {
        console.log('=== MODIFICATION DE COURS ===');
        const response = await courseService.updateCourse(editCourse._id, courseData);
        console.log('Response:', response);
        showCustomMessage('Cours modifié avec succès', 'success');
      } else {
        console.log('=== CRÉATION DE COURS ===');
        const response = await courseService.createCourse(courseData);
        console.log('Response:', response);
        showCustomMessage('Cours ajouté avec succès', 'success');
      }
      
      fetchCourses();
      handleCloseDialog();
      setEditCourse(null);
    } catch (error: any) {
      console.error('=== ERREUR DÉTAILLÉE ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Afficher un message d'erreur plus détaillé
      let errorMessage = "Erreur lors de l'enregistrement du cours";
      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      showCustomMessage(errorMessage, 'error');
    }
  };

  const handleOpenPayment = (course: any) => {
    setEditCourse(course);
    setPaymentForm({ amount: '', date: '', method: '', description: '' });
    setOpenPaymentDialog(true);
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentService.createPayment({ ...paymentForm, course: editCourse._id });
      showCustomMessage('Paiement enregistré', 'success');
      setOpenPaymentDialog(false);
    } catch (e) {
      showCustomMessage("Erreur lors de l'enregistrement du paiement", 'error');
    }
  };

  const handleDeactivate = async (course: any) => {
    try {
      await courseService.updateCourse(course._id, { ...course, status: 'inactif' });
      showCustomMessage('Cours désactivé', 'success');
      fetchCourses();
    } catch (e) {
      showCustomMessage('Erreur lors de la désactivation', 'error');
    }
  };

  const handleOpenDetails = (course: any) => {
    setDetailsCourse(course);
    setOpenDetailsDialog(true);
  };

  const handleOpenPrint = (course: any) => {
    setPrintData(course);
    setOpenPrintDialog(true);
  };

  const handleDelete = (course: any) => {
    setCourseToDelete(course);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    
    try {
      console.log('=== SUPPRESSION DE COURS ===');
      console.log('Cours à supprimer:', courseToDelete);
      console.log('ID du cours:', courseToDelete._id);
      
      // Appel API pour supprimer le cours (soft delete)
      const response = await courseService.deleteCourse(courseToDelete._id);
      console.log('Réponse de suppression:', response);
      
      console.log('Rafraîchissement des listes...');
      // Rafraîchir les listes depuis la base de données
      await fetchCourses();
      await fetchDeletedCourses();
      
      console.log('Suppression terminée avec succès');
      showCustomMessage('Cours supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showCustomMessage('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleRestoreCourse = async (course: any) => {
    try {
      console.log('=== RÉCUPÉRATION DE COURS ===');
      console.log('Cours à récupérer:', course);
      
      // Appel API pour restaurer le cours
      const response = await courseService.restoreCourse(course._id);
      console.log('Réponse de restauration:', response);
      
      // Rafraîchir les listes depuis la base de données
      await fetchCourses();
      await fetchDeletedCourses();
      
      showCustomMessage('Cours récupéré avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      showCustomMessage('Erreur lors de la récupération', 'error');
    }
  };

  const handlePrintCourse = () => {
    if (!printData) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Fiche de cours - ${printData.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .info-row { margin: 10px 0; }
              .label { font-weight: bold; }
              .candidates { margin-top: 20px; }
              .candidate-item { padding: 5px 0; border-bottom: 1px solid #eee; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Fiche de cours pratique</h1>
              <h2>${printData.title}</h2>
            </div>
            <div class="info-row">
              <span class="label">Type:</span> ${printData.type}
            </div>
            <div class="info-row">
              <span class="label">Instructeur:</span> ${printData.instructor?.firstName || ''} ${printData.instructor?.lastName || ''}
            </div>
            <div class="info-row">
              <span class="label">Date:</span> ${new Date(printData.date).toLocaleDateString('fr-FR')}
            </div>
            <div class="info-row">
              <span class="label">Localisation:</span> ${printData.location || 'Non spécifiée'}
            </div>
            <div class="info-row">
              <span class="label">Description:</span> ${printData.description || 'Aucune description'}
            </div>
            <div class="candidates">
              <h3>Candidats inscrits (${printData.enrolledStudents?.length || 0})</h3>
              ${printData.enrolledStudents?.map((enrollment: any) => `
                <div class="candidate-item">
                  ${enrollment.candidate?.firstName || ''} ${enrollment.candidate?.lastName || ''}
                </div>
              `).join('') || 'Aucun candidat inscrit'}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    setOpenPrintDialog(false);
  };

  const showCustomMessage = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleOpenAttendanceDialog = (course: any) => {
    setAttendanceCourse(course);
    // Préparer les données de présence
    const attendance = course.enrolledStudents?.map((enrollment: any) => ({
      candidateId: enrollment.candidate._id || enrollment.candidate,
      candidateName: enrollment.candidate.firstName && enrollment.candidate.lastName
        ? `${enrollment.candidate.firstName} ${enrollment.candidate.lastName}`
        : 'Candidat inconnu',
      attendance: enrollment.attendance || false,
      enrollmentId: enrollment._id
    })) || [];
    setAttendanceData(attendance);
    setOpenAttendanceDialog(true);
  };

  const handleAttendanceChange = (candidateId: string, attendance: boolean) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.candidateId === candidateId 
          ? { ...item, attendance } 
          : item
      )
    );
  };

  const handleSaveAttendance = async () => {
    try {
      // Sauvegarder les présences
      for (const item of attendanceData) {
        await courseService.markAttendance(
          attendanceCourse._id, 
          item.candidateId, 
          { attendance: item.attendance }
        );
      }
      showCustomMessage('Présences enregistrées avec succès', 'success');
      setOpenAttendanceDialog(false);
      fetchCourses(); // Rafraîchir la liste
    } catch (error) {
      showCustomMessage('Erreur lors de l\'enregistrement des présences', 'error');
    }
  };

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

  // Fonctions pour la gestion des candidats
  const handleAddCandidate = (candidate: any) => {
    if (!selectedCandidates.find(c => c._id === candidate._id)) {
      setSelectedCandidates([...selectedCandidates, candidate]);
      setForm(prev => ({
        ...prev,
        enrolledStudents: [...prev.enrolledStudents, {
          candidate: candidate._id,
          enrollmentDate: new Date(),
          attendance: false
        }]
      }));
    }
    setCandidateSearch('');
  };

  const handleRemoveCandidate = (candidateId: string) => {
    setSelectedCandidates(selectedCandidates.filter(c => c._id !== candidateId));
    setForm(prev => ({
      ...prev,
      enrolledStudents: prev.enrolledStudents.filter((enrollment: any) => 
        enrollment.candidate !== candidateId
      )
    }));
  };

  const handleCandidateSearch = async (searchTerm: string) => {
    setCandidateSearch(searchTerm);
    if (searchTerm.length >= 1) {
      setCandidateLoading(true);
      try {
        const response = await fetch(`/api/candidates?search=${encodeURIComponent(searchTerm)}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setCandidateSearchResults(data.candidates || []);
        }
      } catch (error) {
        setCandidateSearchResults([]);
      }
      setCandidateLoading(false);
    } else {
      setCandidateSearchResults([]);
      setCandidateLoading(false);
    }
  };

  // Recherche sur les cours actifs
  const filteredCourses = courses.filter(c => {
    const searchLower = search.toLowerCase();
    const titleMatch = c.title.toLowerCase().includes(searchLower);
    const instructorName = c.instructor && typeof c.instructor === 'object' && 'firstName' in c.instructor
      ? `${(c.instructor as any).firstName || ''} ${(c.instructor as any).lastName || ''}`
      : typeof c.instructor === 'string' 
        ? c.instructor 
        : '';
    const instructorMatch = instructorName.toLowerCase().includes(searchLower);
    const candidatesMatch = c.enrolledStudents && c.enrolledStudents.some((enrollment: any) => {
      const candidateName = enrollment.candidate && typeof enrollment.candidate === 'object'
        ? `${enrollment.candidate.firstName || ''} ${enrollment.candidate.lastName || ''}`
        : '';
      return candidateName.toLowerCase().includes(searchLower);
    });
    return titleMatch || instructorMatch || candidatesMatch;
  });

  // Recherche sur les cours supprimés
  const filteredDeletedCourses = deletedCourses.filter(c => {
    const searchLower = search.toLowerCase();
    const titleMatch = c.title.toLowerCase().includes(searchLower);
    const instructorName = c.instructor && typeof c.instructor === 'object' && 'firstName' in c.instructor
      ? `${(c.instructor as any).firstName || ''} ${(c.instructor as any).lastName || ''}`
      : typeof c.instructor === 'string' 
        ? c.instructor 
        : '';
    const instructorMatch = instructorName.toLowerCase().includes(searchLower);
    const candidatesMatch = c.enrolledStudents && c.enrolledStudents.some((enrollment: any) => {
      const candidateName = enrollment.candidate && typeof enrollment.candidate === 'object'
        ? `${enrollment.candidate.firstName || ''} ${enrollment.candidate.lastName || ''}`
        : '';
      return candidateName.toLowerCase().includes(searchLower);
    });
    return titleMatch || instructorMatch || candidatesMatch;
  });

  const handleEditDetails = () => {
    // Fermer la modale de détails
    setOpenDetailsDialog(false);
    
    // Pré-remplir le formulaire avec les données du cours
    if (detailsCourse) {
      setForm({
        title: detailsCourse.title,
        type: detailsCourse.type,
        instructor: detailsCourse.instructor?._id || detailsCourse.instructor,
        description: detailsCourse.description || '',
        date: detailsCourse.date,
        location: detailsCourse.location || '',
        status: detailsCourse.status || 'planifié',
        enrolledStudents: detailsCourse.enrolledStudents || []
      });
      
      // Pré-remplir les candidats sélectionnés
      if (detailsCourse.enrolledStudents && detailsCourse.enrolledStudents.length > 0) {
        const selectedCandidatesData = detailsCourse.enrolledStudents.map((enrollment: any) => {
          if (enrollment.candidate && typeof enrollment.candidate === 'object') {
            return enrollment.candidate;
          }
          // Si c'est juste un ID, on doit récupérer les données du candidat
          return candidates.find(c => c._id === enrollment.candidate) || { _id: enrollment.candidate };
        }).filter(Boolean);
        setSelectedCandidates(selectedCandidatesData);
      } else {
        setSelectedCandidates([]);
      }
      
      // Marquer comme mode édition
      setEditCourse(detailsCourse);
      
      // Ouvrir le formulaire de planification
      setOpenDialog(true);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, sm: 3 }, background: '#f6f8fa', minHeight: '100vh' }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <DirectionsCar color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" fontWeight={700} color="primary.main">Gestion des cours pratiques</Typography>
      </Stack>
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, background: '#fff', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ fontWeight: 700, borderRadius: 1, background: '#d32f2f', color: '#fff', boxShadow: 'none', textTransform: 'none', '&:hover': { background: '#d32f2f', opacity: 0.9 } }}>Planifier un cours</Button>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          {tabLabels.map(t => (
            <Tab key={t.value} value={t.value} label={t.label} sx={{ fontWeight: 600 }} />
          ))}
        </Tabs>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
            sx={{ width: 220 }}
          />
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
        {tab === 'pratique' ? (
          loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 220 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {rowsPerPage !== 'Tout afficher' && (
                <TablePagination
                  component="div"
                  count={filteredCourses.length}
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
                  <TableHead sx={{ backgroundColor: '#fff' }}>
                    <TableRow>
                      {columns.map(col => (
                        <TableCell key={col.id} sx={{ fontWeight: 700 }}>{col.label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(rowsPerPage === 'Tout afficher' 
                      ? filteredCourses 
                      : filteredCourses.slice(page * Number(rowsPerPage), page * Number(rowsPerPage) + Number(rowsPerPage))
                    ).map((course) => (
                      <TableRow key={course._id} hover sx={{ transition: 'background 0.2s' }}>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>
                          <Box 
                            sx={{ 
                              cursor: 'pointer',
                              color: 'primary.main',
                              textDecoration: 'underline',
                              fontWeight: 600
                            }}
                            onClick={() => handleOpenAttendanceDialog(course)}
                          >
                            {course.enrolledStudents && course.enrolledStudents.length > 0 
                              ? `${course.enrolledStudents.length} candidat(s)`
                              : 'Aucun candidat'
                            }
                          </Box>
                        </TableCell>
                        <TableCell>
                        {course.instructor && typeof course.instructor === 'object' && 'firstName' in course.instructor
                          ? `${(course.instructor as any).firstName || ''} ${(course.instructor as any).lastName || ''}`
                          : typeof course.instructor === 'string' 
                            ? course.instructor 
                            : 'Non assigné'
                        }
                      </TableCell>
                    <TableCell>{new Date(course.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={course.type} 
                        color="warning" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton color="success" onClick={() => handleOpenDetails(course)}> <ArticleIcon /> </IconButton>
                        <IconButton color="info" onClick={() => handleOpenPrint(course)}> <PrintIcon /> </IconButton>
                            <IconButton color="error" onClick={() => handleDelete(course)}> <DeleteIcon /> </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
                {filteredCourses.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      Aucun cours pratique
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Commencez par planifier un nouveau cours pratique.
                    </Typography>
                  </Box>
                )}
              </>
            )
          ) : (
          // Onglet "Séance supprimée"
          deletedCoursesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 220 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {rowsPerPage !== 'Tout afficher' && (
                <TablePagination
                  component="div"
                  count={filteredDeletedCourses.length}
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
                  <TableHead sx={{ backgroundColor: '#fff' }}>
                    <TableRow>
                      {columns.map(col => (
                        <TableCell key={col.id} sx={{ fontWeight: 700 }}>{col.label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(rowsPerPage === 'Tout afficher' 
                      ? filteredDeletedCourses 
                      : filteredDeletedCourses.slice(page * Number(rowsPerPage), page * Number(rowsPerPage) + Number(rowsPerPage))
                    ).map((course) => (
                      <TableRow key={course._id} hover sx={{ transition: 'background 0.2s', opacity: 0.7 }}>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>
                          <Box 
                            sx={{ 
                              cursor: 'pointer',
                              color: 'primary.main',
                              textDecoration: 'underline',
                              fontWeight: 600
                            }}
                            onClick={() => handleOpenAttendanceDialog(course)}
                          >
                            {course.enrolledStudents && course.enrolledStudents.length > 0 
                              ? `${course.enrolledStudents.length} candidat(s)`
                              : 'Aucun candidat'
                            }
                          </Box>
                        </TableCell>
                        <TableCell>
                        {course.instructor && typeof course.instructor === 'object' && 'firstName' in course.instructor
                          ? `${(course.instructor as any).firstName || ''} ${(course.instructor as any).lastName || ''}`
                          : typeof course.instructor === 'string' 
                            ? course.instructor 
                            : 'Non assigné'
                        }
                      </TableCell>
                        <TableCell>{new Date(course.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>
                          <Chip 
                            label={course.type} 
                            color="warning" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton color="success" onClick={() => handleOpenDetails(course)}> <ArticleIcon /> </IconButton>
                            <IconButton color="info" onClick={() => handleOpenPrint(course)}> <PrintIcon /> </IconButton>
                            <Button 
                              variant="contained" 
                              size="small"
                              startIcon={<RestoreIcon />}
                              onClick={() => handleRestoreCourse(course)}
                              sx={{ 
                                backgroundColor: '#4caf50', 
                                color: 'white',
                                '&:hover': { backgroundColor: '#45a049' },
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                px: 1
                              }}
                            >
                              Récupérer
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {filteredDeletedCourses.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Aucune séance supprimée
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Les cours supprimés apparaîtront ici avec la possibilité de les récupérer.
                  </Typography>
                </Box>
              )}
            </>
          )
        )}
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ 
          fontWeight: 700, 
          color: 'primary.main',
          textAlign: 'center',
          fontSize: '1.5rem',
          pb: 1
        }}>
          {editCourse ? 'Modifier le cours' : 'Planifier un cours pratique'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Première ligne - Titre et Type */}
              <Grid item xs={12} md={6}>
              <TextField
                name="title"
                label="Titre du cours"
                value={form.title}
                onChange={handleChange}
                required
                fullWidth
                  size="medium"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="medium" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel id="type-label">Type de cours</InputLabel>
                <Select
                  labelId="type-label"
                  name="type"
                  value={form.type}
                  label="Type de cours"
                  onChange={handleSelectChange}
                  required
                >
                  {courseTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Grid>

              {/* Deuxième ligne - Candidats et Instructeur */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Candidats ({selectedCandidates.length})
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      placeholder="Rechercher un candidat..."
                      value={candidateSearch}
                      onChange={(e) => handleCandidateSearch(e.target.value)}
                      fullWidth
                      size="medium"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      InputProps={{
                        endAdornment: candidateLoading ? (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ) : null
                      }}
                    />
                    {(candidateSearch.length > 0) && (
                      <Paper
                        elevation={3}
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 1000,
                          maxHeight: 200,
                          overflow: 'auto',
                          mt: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        {candidateLoading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : candidateSearchResults.length === 0 ? (
                          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                            Aucun résultat
                          </Box>
                        ) : candidateSearchResults.map((candidate) => {
                          const alreadySelected = selectedCandidates.find((c) => c._id === candidate._id);
                          return (
                            <Box
                              key={candidate._id}
                              onClick={() => !alreadySelected && handleAddCandidate(candidate)}
                              sx={{
                                p: 2,
                                cursor: alreadySelected ? 'not-allowed' : 'pointer',
                                borderBottom: '1px solid #eee',
                                backgroundColor: alreadySelected ? '#f0f0f0' : 'inherit',
                                color: alreadySelected ? 'text.disabled' : 'inherit',
                                '&:hover': { backgroundColor: !alreadySelected ? '#f5f5f5' : '#f0f0f0' },
                                '&:last-child': { borderBottom: 'none' }
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {candidate.firstName} {candidate.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                CIN: {candidate.cin} {candidate.phone ? `| Tél: ${candidate.phone}` : ''}
                              </Typography>
                              {alreadySelected && (
                                <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                                  (déjà sélectionné)
                                </Typography>
                              )}
                            </Box>
                          );
                        })}
                      </Paper>
                    )}
                  </Box>
                  {selectedCandidates.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                                               {selectedCandidates.map((candidate) => (
                           <Chip
                             key={candidate._id}
                             label={`${candidate.firstName || ''} ${candidate.lastName || ''}`}
                             onDelete={() => handleRemoveCandidate(candidate._id)}
                             sx={{ m: 0.5 }}
                             color="primary"
                             variant="outlined"
                           />
                         ))}
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="medium" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel id="instructor-label">Instructeur</InputLabel>
                <Select
                  labelId="instructor-label"
                  name="instructor"
                  value={form.instructor}
                  label="Instructeur"
                  onChange={handleSelectChange}
                  required
                >
                  {instructors.map((instructor) => (
                    <MenuItem key={instructor._id} value={instructor._id}>
                      {instructor.firstName || ''} {instructor.lastName || ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Grid>

              {/* Troisième ligne - Date */}
              <Grid item xs={12} md={6}>
              <TextField
                name="date"
                label="Date"
                type="date"
                value={form.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
                  size="medium"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              </Grid>

              {/* Troisième ligne - Description et Localisation */}
              <Grid item xs={12} md={6}>
              <TextField
                  name="description"
                  label="Description (optionnel)"
                  value={form.description}
                onChange={handleChange}
                fullWidth
                  multiline
                  minRows={2}
                  maxRows={3}
                  size="medium"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              </Grid>
              <Grid item xs={12} md={6}>
              <TextField
                  name="location"
                  label="Localisation (optionnel)"
                  value={form.location}
                onChange={handleChange}
                fullWidth
                  size="medium"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={handleCloseDialog} 
              variant="outlined"
              sx={{ 
                borderRadius: 2, 
                px: 3,
                fontWeight: 600
              }}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                borderRadius: 2, 
                px: 3,
                fontWeight: 600,
                background: '#d32f2f',
                '&:hover': { background: '#b71c1c' }
              }}
            >
              {editCourse ? 'Enregistrer' : 'Planifier'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          color: 'error.main',
          fontWeight: 700,
          fontSize: '1.3rem'
        }}>
          <WarningIcon color="error" sx={{ fontSize: 30 }} />
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
              Êtes-vous sûr de vouloir supprimer ce cours ?
            </Typography>
            {courseToDelete && (
              <Card sx={{ bgcolor: '#fff3e0', border: '1px solid #ffb74d' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#e65100', mb: 1 }}>
                    {courseToDelete.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {courseToDelete.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(courseToDelete.date).toLocaleDateString('fr-FR')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Candidats inscrits: {courseToDelete.enrolledStudents?.length || 0}
                  </Typography>
                </CardContent>
              </Card>
            )}
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Cette action est irréversible. Toutes les données associées à ce cours seront définitivement supprimées.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)} 
            variant="outlined"
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              fontWeight: 600,
              background: '#d32f2f',
              '&:hover': { background: '#b71c1c' }
            }}
          >
            Supprimer définitivement
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
        <DialogTitle>Enregistrer un paiement</DialogTitle>
        <form onSubmit={handlePaymentSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                name="amount"
                label="Montant"
                type="number"
                value={paymentForm.amount}
                onChange={handlePaymentChange}
                required
                fullWidth
                InputProps={{ endAdornment: <InputAdornment position="end">FCFA</InputAdornment> }}
              />
              <TextField
                name="date"
                label="Date"
                type="date"
                value={paymentForm.date}
                onChange={handlePaymentChange}
                required
                fullWidth
              />
              <TextField
                name="method"
                label="Méthode de paiement"
                value={paymentForm.method}
                onChange={handlePaymentChange}
                required
                fullWidth
              />
              <TextField
                name="description"
                label="Description"
                value={paymentForm.description}
                onChange={handlePaymentChange}
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPaymentDialog(false)}>Annuler</Button>
            <Button type="submit" variant="contained">Enregistrer</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          color: 'primary.main',
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          <ArticleIcon color="primary" sx={{ fontSize: 30 }} />
          Détails du cours
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {detailsCourse && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                    <CardContent>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                        {detailsCourse.title}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <SchoolIcon color="primary" />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Type: {detailsCourse.type}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PersonIcon color="primary" />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Instructeur: {detailsCourse.instructor?.firstName || ''} {detailsCourse.instructor?.lastName || ''}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CalendarTodayIcon color="primary" />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Date: {new Date(detailsCourse.date).toLocaleDateString('fr-FR')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocationOnIcon color="primary" />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Localisation: {detailsCourse.location || 'Non spécifiée'}
                            </Typography>
                          </Box>
                        </Grid>
                        {detailsCourse.description && (
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                              <DescriptionIcon color="primary" sx={{ mt: 0.5 }} />
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Description: {detailsCourse.description}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    Candidats inscrits ({detailsCourse.enrolledStudents?.length || 0})
                  </Typography>
                  {detailsCourse.enrolledStudents && detailsCourse.enrolledStudents.length > 0 ? (
                    <List>
                      {detailsCourse.enrolledStudents.map((enrollment: any, index: number) => (
                        <ListItem key={index} sx={{ bgcolor: '#fff', mb: 1, borderRadius: 1, border: '1px solid #e9ecef' }}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                              <PersonIcon />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={`${enrollment.candidate?.firstName || ''} ${enrollment.candidate?.lastName || ''}`}
                            secondary={`Présence: ${enrollment.attendance ? 'Présent' : 'Absent'}`}
                          />
                          <Chip 
                            label={enrollment.attendance ? 'Présent' : 'Absent'} 
                            color={enrollment.attendance ? 'success' : 'default'}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                      Aucun candidat inscrit à ce cours
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setOpenDetailsDialog(false)} 
            variant="outlined"
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            Fermer
          </Button>
          <Button 
            onClick={handleEditDetails}
            variant="contained"
            startIcon={<EditIcon />}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              fontWeight: 600,
              background: '#d32f2f',
              '&:hover': { background: '#b71c1c' }
            }}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          color: 'primary.main',
          fontWeight: 700,
          fontSize: '1.3rem'
        }}>
          <PrintIcon color="primary" sx={{ fontSize: 30 }} />
          Imprimer la fiche
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
              Voulez-vous imprimer la fiche de cours suivante ?
            </Typography>
            {printData && (
              <Card sx={{ bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                    {printData.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {printData.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(printData.date).toLocaleDateString('fr-FR')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Candidats: {printData.enrolledStudents?.length || 0}
                  </Typography>
                </CardContent>
              </Card>
            )}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                La fiche sera imprimée avec tous les détails du cours et la liste des candidats inscrits.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setOpenPrintDialog(false)} 
            variant="outlined"
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handlePrintCourse}
            variant="contained"
            startIcon={<PrintIcon />}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              fontWeight: 600,
              background: '#1976d2',
              '&:hover': { background: '#1565c0' }
            }}
          >
            Imprimer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openAttendanceDialog} onClose={() => setOpenAttendanceDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ 
          fontWeight: 700, 
          color: 'primary.main',
          textAlign: 'center'
        }}>
          Gestion des présences - {attendanceCourse?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Candidats inscrits ({attendanceData.length})
            </Typography>
            {attendanceData.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                Aucun candidat inscrit à ce cours
              </Typography>
            ) : (
              <Stack spacing={2}>
                {attendanceData.map((item, index) => (
                  <Paper key={index} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {item.candidateName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Présent
                      </Typography>
                      <Checkbox
                        checked={item.attendance}
                        onChange={(e) => handleAttendanceChange(item.candidateId, e.target.checked)}
                        color="primary"
                      />
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenAttendanceDialog(false)} 
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSaveAttendance}
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              px: 3,
              background: '#d32f2f',
              '&:hover': { background: '#b71c1c' }
            }}
          >
            Enregistrer les présences
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PracticalCourses; 