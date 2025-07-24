import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Alert, Stack, Chip, MenuItem, Select, InputLabel, FormControl, LinearProgress, Grid, TablePagination, InputAdornment, Snackbar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Event, Person, Edit as CreateIcon, School as SchoolIcon, CalendarToday as CalendarTodayIcon } from '@mui/icons-material';
import { examService } from '../services/examService';
import { candidateService } from '../services/candidateService';
import { SelectChangeEvent } from '@mui/material/Select';
import { SnackbarContext } from '../components/Layout';

const examTypes = ['théorique', 'pratique'];
const examStatus = [
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

interface ExamType {
  _id: string;
  type: string;
  date: string;
  location?: string;
  notes?: string;
  registeredCandidates?: any[];
  instructor?: string;
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100, 'Tout afficher'];

const Exams: React.FC = () => {
  const [exams, setExams] = useState<ExamType[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editExam, setEditExam] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState<number | string>(25);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateSearchResults, setCandidateSearchResults] = useState<any[]>([]);
  const [showCandidateResults, setShowCandidateResults] = useState(false);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [instructors, setInstructors] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    type: 'théorique',
    date: '',
    location: '',
    notes: '',
    selectedCandidates: [] as any[],
    instructor: '',
  });
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openCandidatesDialog, setOpenCandidatesDialog] = useState(false);
  const [selectedExamCandidates, setSelectedExamCandidates] = useState<any[]>([]);
  const [candidatesStatus, setCandidatesStatus] = useState<any[]>([]);
  const [instructorSearch, setInstructorSearch] = useState('');
  const [instructorSearchResults, setInstructorSearchResults] = useState<any[]>([]);
  const [instructorLoading, setInstructorLoading] = useState(false);
  const [dialogInstructorId, setDialogInstructorId] = useState('');

  const fetchExams = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page + 1,
        limit: typeof rowsPerPage === 'number' ? rowsPerPage : 1000
      };
      
      const data = await examService.getExams(params);
      setExams(data.exams || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (e) {
      setError("Erreur lors du chargement des examens.");
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

  const fetchInstructors = async () => {
    try {
      const data = await (await fetch('/api/instructors?limit=1000')).json();
      setInstructors(data.instructors || []);
    } catch (e) {
      setInstructors([]);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchCandidates();
    fetchInstructors();
  }, [page, rowsPerPage]);

  const handleOpenDialog = (exam: any = null) => {
    setEditExam(exam);
    if (exam) {
      setForm({
        type: exam.type || 'théorique',
        date: exam.date ? exam.date.slice(0, 10) : '',
        location: exam.location || '',
        notes: exam.notes || '',
        selectedCandidates: (exam.registeredCandidates || []).map((rc: any) => rc.candidate || rc),
        instructor: exam.instructor || '',
      });
    } else {
      setForm({
        type: 'théorique',
        date: '',
        location: '',
        notes: '',
        selectedCandidates: [],
        instructor: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditExam(null);
    setShowCandidateResults(false);
    setCandidateSearch('');
    setCandidateSearchResults([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setForm(prev => ({ ...prev, [e.target.name as string]: e.target.value }));
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
          setShowCandidateResults(true);
        }
      } catch (error) {
        setCandidateSearchResults([]);
        setShowCandidateResults(true);
      }
      setCandidateLoading(false);
    } else {
      setCandidateSearchResults([]);
      setShowCandidateResults(false);
      setCandidateLoading(false);
    }
  };

  const addCandidateToExam = (candidate: any) => {
    if (!form.selectedCandidates.find(c => c._id === candidate._id)) {
      setForm(prev => ({
        ...prev,
        selectedCandidates: [...prev.selectedCandidates, candidate]
      }));
    }
    setCandidateSearch('');
    setShowCandidateResults(false);
  };

  const removeCandidateFromExam = (candidateId: string) => {
    setForm(prev => ({
      ...prev,
      selectedCandidates: prev.selectedCandidates.filter(c => c._id !== candidateId)
    }));
  };

  const handleInstructorSearch = async (searchTerm: string) => {
    setInstructorSearch(searchTerm);
    if (searchTerm.length >= 1) {
      setInstructorLoading(true);
      // Si la liste des moniteurs est déjà chargée, filtrer localement
      const filtered = instructors.filter((instructor: any) =>
        (`${instructor.firstName} ${instructor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setInstructorSearchResults(filtered);
      setInstructorLoading(false);
    } else {
      setInstructorSearchResults([]);
      setInstructorLoading(false);
    }
  };
  const handleSelectInstructor = (instructor: any) => {
    setForm(prev => ({ ...prev, instructor }));
    setInstructorSearch('');
    setInstructorSearchResults([]);
  };
  const handleRemoveInstructor = () => {
    setForm(prev => ({ ...prev, instructor: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const examData = {
        ...form,
        date: new Date(form.date).toISOString()
      };
      
      if (editExam) {
        await examService.updateExam(editExam._id, examData);
        showCustomMessage('Examen modifié avec succès', 'success');
      } else {
        await examService.createExam(examData);
        showCustomMessage('Examen programmé avec succès', 'success');
      }
      
      fetchExams();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement:', error);
      showCustomMessage('Erreur lors de l\'enregistrement de l\'examen', 'error');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await examService.deleteExam(deleteId);
        showCustomMessage('Examen supprimé avec succès', 'success');
        fetchExams();
      } catch (e) {
        showCustomMessage('Erreur lors de la suppression de l\'examen', 'error');
      }
    }
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const showCustomMessage = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
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

  // Recherche sur les examens
  const filteredExams = exams.filter(exam => {
    const searchLower = search.toLowerCase();
    const typeMatch = exam.type.toLowerCase().includes(searchLower);
    const locationMatch = (exam.location || '').toLowerCase().includes(searchLower);
    const dateMatch = new Date(exam.date).toLocaleDateString('fr-FR').includes(searchLower);
    
    return typeMatch || locationMatch || dateMatch;
  });

  const handleSaveCandidatesStatus = async () => {
    if (!editExam && !selectedExamCandidates.length) return;
    try {
      const examId = editExam?._id || (exams.find(e => e.registeredCandidates === selectedExamCandidates)?._id);
      if (!examId) return;
      const updatedCandidates = candidatesStatus.map((cand: any) => ({
        candidate: cand.candidate?._id || cand._id,
        presence: cand.presence,
        result: cand.result,
        protected: cand.protected,
      }));
      console.log('Envoi PATCH candidats protégés:', updatedCandidates);
      await fetch(`/api/exams/${examId}/update-candidates-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidates: updatedCandidates }),
      });
      setOpenCandidatesDialog(false);
      showCustomMessage('Statuts enregistrés avec succès', 'success');
      fetchExams();
    } catch (error) {
      showCustomMessage('Erreur lors de l\'enregistrement', 'error');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, sm: 3 }, background: '#f6f8fa', minHeight: '100vh' }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Event color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" fontWeight={700} color="primary.main">Gestion des examens</Typography>
      </Stack>
      
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, background: '#fff', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>Liste des examens</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenDialog()} 
            sx={{ 
              fontWeight: 700, 
              borderRadius: 2, 
              background: '#c62828', 
              color: '#fff', 
              boxShadow: 'none', 
              textTransform: 'none', 
              px: 3,
              '&:hover': { background: '#b71c1c' } 
            }}
          >
            Programmer un examen
          </Button>
        </Box>

        {/* Barre de recherche */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Rechercher un examen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Event color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: 2,
                backgroundColor: '#f8f9fa'
              } 
            }}
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
                <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#666' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666' }}>Lieu</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666' }}>Accompagnateur</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#666' }}>Candidats</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#666' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rowsPerPage === 'Tout afficher' 
                    ? filteredExams 
                    : filteredExams.slice(page * Number(rowsPerPage), page * Number(rowsPerPage) + Number(rowsPerPage))
                  ).map((exam) => {
                    const instructorObj = instructors.find(i => i._id === (exam.instructor || form.instructor));
                    return (
                      <TableRow key={exam._id} hover sx={{ transition: 'background 0.2s' }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {new Date(exam.date).toLocaleDateString('fr-FR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={exam.type === 'théorique' ? 'Code' : 'Conduite'} 
                            color={exam.type === 'théorique' ? 'info' : 'warning'} 
                            variant="outlined" 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{exam.location || 'Non spécifié'}</TableCell>
                        <TableCell>
                          {(() => {
                            let found = null;
                            if (exam.instructor && typeof exam.instructor === 'object') {
                              found = exam.instructor;
                            } else {
                              found = instructors.find(i => i._id === exam.instructor);
                            }
                            return found ? `${found.firstName} ${found.lastName}` : 'Non assigné';
                          })()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="text"
                            size="small"
                            sx={{ fontWeight: 700, color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', p: 0, minWidth: 0 }}
                            onClick={() => {
                              // Enrichir les candidats avec leurs infos si besoin
                              const initialStatus = (exam.registeredCandidates || []).map((cand: any) => {
                                const candidateObj = cand.candidate || cand;
                                return {
                                  ...cand,
                                  candidate: candidateObj,
                                  presence: cand.presence ?? false,
                                  result: cand.result ?? '',
                                  protected: cand.protected ?? false,
                                  attempts: cand.attempts ?? 1,
                                };
                              });
                              setSelectedExamCandidates(exam.registeredCandidates || []);
                              setCandidatesStatus(initialStatus);
                              setOpenCandidatesDialog(true);
                              setDialogInstructorId(exam.instructor || '');
                            }}
                          >
                            {exam.registeredCandidates?.length || 0} candidat(s)
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1}>
                            <IconButton 
                              onClick={() => handleOpenDialog(exam)} 
                              color="primary"
                              size="small"
                              sx={{ 
                                backgroundColor: '#e3f2fd',
                                '&:hover': { backgroundColor: '#bbdefb' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={() => handleDelete(exam._id)}
                              size="small"
                              sx={{ 
                                backgroundColor: '#ffebee',
                                '&:hover': { backgroundColor: '#ffcdd2' }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
            {filteredExams.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Aucun examen trouvé
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {search ? 'Aucun examen ne correspond à votre recherche.' : 'Commencez par programmer un nouvel examen.'}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Dialog pour créer/modifier un examen */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ 
          fontWeight: 700, 
          color: 'primary.main',
          textAlign: 'center',
          fontSize: '1.5rem',
          pb: 1,
          borderBottom: '2px solid #e3f2fd',
          mb: 2
        }}>
          {editExam ? 'Modifier l\'examen' : 'Programmer un examen'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Première ligne - Type et Date */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="medium" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                  <InputLabel id="type-label">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon sx={{ fontSize: 20 }} />
                      Type d'examen
                    </Box>
                  </InputLabel>
                  <Select
                    labelId="type-label"
                    name="type"
                    value={form.type}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon sx={{ fontSize: 20 }} />
                        Type d'examen
                      </Box>
                    }
                    onChange={handleSelectChange}
                    required
                  >
                    {examTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type === 'théorique' ? 'EXAMEN DE CODE' : 'EXAMEN DE CONDUITE'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="date"
                  label="Date de l'examen"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  fullWidth
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              {/* Deuxième ligne - Lieu et Recherche de candidats */}
              <Grid item xs={12} md={6}>
                <TextField
                  name="location"
                  label="Lieu de l'examen (optionnel)"
                  value={form.location}
                  onChange={handleChange}
                  fullWidth
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    label="Rechercher un moniteur"
                    value={instructorSearch}
                    onChange={e => handleInstructorSearch(e.target.value)}
                    fullWidth
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: instructorLoading ? (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  {(instructorSearch.length > 0) && (
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
                      {instructorLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : instructorSearchResults.length === 0 ? (
                        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                          Aucun résultat
                        </Box>
                      ) : instructorSearchResults.map((instructor) => (
                        <Box
                          key={instructor._id}
                          onClick={() => handleSelectInstructor(instructor._id)}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee',
                            '&:hover': { backgroundColor: '#f5f5f5' },
                            '&:last-child': { borderBottom: 'none' }
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {instructor.firstName} {instructor.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {instructor.phone ? `Tél: ${instructor.phone}` : ''}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  )}
                  {form.instructor && (
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={(() => {
                          const found = instructors.find(i => i._id === form.instructor);
                          return found ? `${found.firstName} ${found.lastName}` : 'Moniteur sélectionné';
                        })()}
                        onDelete={handleRemoveInstructor}
                        sx={{ m: 0.5 }}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    name="candidateSearch"
                    label="Rechercher un candidat"
                    value={candidateSearch}
                    onChange={(e) => handleCandidateSearch(e.target.value)}
                    fullWidth
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: candidateLoading ? (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  {(candidateSearch.length > 0 && showCandidateResults) && (
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
                        const alreadySelected = form.selectedCandidates.find((c) => c._id === candidate._id);
                        return (
                          <Box
                            key={candidate._id}
                            onClick={() => !alreadySelected && addCandidateToExam(candidate)}
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
                  {/* Les chips ne sont plus affichés ici */}
                </Box>
              </Grid>
              {/* Zone unique pour les chips des candidats sélectionnés */}
              {form.selectedCandidates.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {form.selectedCandidates.map((candidate) => (
                      <Chip
                        key={candidate._id}
                        label={`${candidate.firstName || ''} ${candidate.lastName || ''}`}
                        onDelete={() => removeCandidateFromExam(candidate._id)}
                        sx={{ m: 0.5 }}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              )}

              {/* Troisième ligne - Notes (pleine largeur) */}
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Notes et observations"
                  value={form.notes}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <CreateIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1, borderTop: '1px solid #e0e0e0' }}>
            <Button 
              onClick={handleCloseDialog} 
              variant="outlined"
              sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
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
                background: '#c62828',
                '&:hover': { background: '#b71c1c' }
              }}
            >
              {editExam ? 'Enregistrer' : 'Programmer l\'examen'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cet examen ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            variant="outlined"
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour afficher la liste des candidats d'un examen */}
      <Dialog open={openCandidatesDialog} onClose={() => setOpenCandidatesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>Liste des candidats inscrits</DialogTitle>
        <DialogContent>
          {/* Supprimer l'affichage de l'accompagnateur ici */}
          {candidatesStatus.length === 0 ? (
            <Typography color="text.secondary">Aucun candidat inscrit à cet examen.</Typography>
          ) : (
            <Table size="small" sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow sx={{ background: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Nom & Prénom</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Téléphone</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Présent</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Réussite</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Protégé</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidatesStatus.map((cand, idx) => {
                  const candidate = cand.candidate || cand;
                  return (
                    <TableRow key={candidate._id || idx} hover sx={{ transition: 'background 0.2s' }}>
                      <TableCell sx={{ fontWeight: 600 }}>{candidate.lastName} {candidate.firstName}</TableCell>
                      <TableCell>{candidate.phone ? candidate.phone : '-'}</TableCell>
                      <TableCell align="center">
                        <input type="checkbox" checked={cand.presence} onChange={e => {
                          const updated = [...candidatesStatus];
                          updated[idx].presence = e.target.checked;
                          setCandidatesStatus(updated);
                        }} style={{ width: 20, height: 20 }} />
                      </TableCell>
                      <TableCell align="center">
                        <input
                          type="checkbox"
                          checked={cand.protected ? true : cand.result === 'réussi'}
                          disabled={cand.protected}
                          onChange={e => {
                            const updated = [...candidatesStatus];
                            updated[idx].result = e.target.checked ? 'réussi' : 'échoué';
                            setCandidatesStatus(updated);
                          }}
                          style={{ width: 20, height: 20 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <input
                          type="checkbox"
                          checked={cand.protected}
                          onChange={e => {
                            const updated = [...candidatesStatus];
                            updated[idx].protected = e.target.checked;
                            if (e.target.checked) {
                              updated[idx].result = 'réussi';
                            }
                            setCandidatesStatus(updated);
                          }}
                          style={{ width: 20, height: 20 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCandidatesDialog(false)} color="primary" variant="outlined">Fermer</Button>
          <Button onClick={handleSaveCandidatesStatus} color="primary" variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
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

export default Exams; 