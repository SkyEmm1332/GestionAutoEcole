import React, { useState } from 'react';
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
  Checkbox,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Event as EventIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { fr } from 'date-fns/locale';

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
      id={`theoretical-courses-tabpanel-${index}`}
      aria-labelledby={`theoretical-courses-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TheoreticalCourses: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: '',
      instructor: '',
      startTime: '',
      endTime: '',
      maxParticipants: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // TODO: Implémenter la logique de soumission
    handleCloseDialog();
  };

  // Données de démonstration
  const courses = [
    {
      id: 1,
      date: '2024-03-15',
      title: 'Cours de code - Niveau 1',
      instructor: 'M. Dupont',
      startTime: '09:00',
      endTime: '11:00',
      participants: 12,
      maxParticipants: 20,
    },
    {
      id: 2,
      date: '2024-03-15',
      title: 'Cours de code - Niveau 2',
      instructor: 'Mme Martin',
      startTime: '14:00',
      endTime: '16:00',
      participants: 15,
      maxParticipants: 20,
    },
  ];

  const attendance = [
    {
      id: 1,
      candidate: 'Jean Dupont',
      status: 'Présent',
      signature: true,
    },
    {
      id: 2,
      candidate: 'Marie Martin',
      status: 'Absent',
      signature: false,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Cours théoriques</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Nouveau cours
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Planning" />
        <Tab label="Gestion des présences" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <Box sx={{ mb: 3 }}>
            <DatePicker
              label="Sélectionner une date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
          </Box>
        </LocalizationProvider>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Titre</TableCell>
                <TableCell>Moniteur</TableCell>
                <TableCell>Horaire</TableCell>
                <TableCell>Participants</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.date}</TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>{course.startTime} - {course.endTime}</TableCell>
                  <TableCell>{course.participants}/{course.maxParticipants}</TableCell>
                  <TableCell>
                    <IconButton color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidat</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Signature</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.candidate}</TableCell>
                  <TableCell>{record.status}</TableCell>
                  <TableCell>
                    <Checkbox checked={record.signature} disabled />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary">
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Nouveau cours théorique</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                fullWidth
                label="Titre du cours"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Moniteur"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Nombre maximum de participants"
                name="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={handleInputChange}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Heure de début"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Heure de fin"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TheoreticalCourses; 