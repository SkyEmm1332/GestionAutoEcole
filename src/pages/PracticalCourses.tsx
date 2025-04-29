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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
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
      id={`practical-courses-tabpanel-${index}`}
      aria-labelledby={`practical-courses-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PracticalCourses: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [formData, setFormData] = useState({
    candidate: '',
    instructor: '',
    date: null as Date | null,
    startTime: null as Date | null,
    endTime: null as Date | null,
    vehicle: '',
    type: 'conduite',
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
      candidate: '',
      instructor: '',
      date: null,
      startTime: null,
      endTime: null,
      vehicle: '',
      type: 'conduite',
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
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
      candidate: 'Jean Dupont',
      instructor: 'M. Martin',
      startTime: '09:00',
      endTime: '10:30',
      vehicle: 'Voiture 1',
      type: 'conduite',
    },
    {
      id: 2,
      date: '2024-03-15',
      candidate: 'Marie Durand',
      instructor: 'Mme Dubois',
      startTime: '11:00',
      endTime: '12:30',
      vehicle: 'Voiture 2',
      type: 'conduite',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Cours pratiques</Typography>
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
        <Tab label="Vue d'ensemble" />
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
                <TableCell>Candidat</TableCell>
                <TableCell>Moniteur</TableCell>
                <TableCell>Horaire</TableCell>
                <TableCell>Véhicule</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.date}</TableCell>
                  <TableCell>{course.candidate}</TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>{course.startTime} - {course.endTime}</TableCell>
                  <TableCell>{course.vehicle}</TableCell>
                  <TableCell>{course.type}</TableCell>
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
        <Typography>Vue d'ensemble des cours pratiques</Typography>
        {/* TODO: Ajouter un calendrier ou une vue d'ensemble des cours */}
      </TabPanel>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Nouveau cours pratique</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Candidat</InputLabel>
                <Select
                  name="candidate"
                  value={formData.candidate}
                  onChange={handleSelectChange}
                  label="Candidat"
                >
                  <MenuItem value="1">Jean Dupont</MenuItem>
                  <MenuItem value="2">Marie Durand</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Moniteur</InputLabel>
                <Select
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleSelectChange}
                  label="Moniteur"
                >
                  <MenuItem value="1">M. Martin</MenuItem>
                  <MenuItem value="2">Mme Dubois</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, date: newValue as Date | null }))}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Type de cours</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleSelectChange}
                  label="Type de cours"
                >
                  <MenuItem value="conduite">Conduite</MenuItem>
                  <MenuItem value="parking">Parking</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <TimePicker
                  label="Heure de début"
                  value={formData.startTime}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, startTime: newValue as Date | null }))}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <TimePicker
                  label="Heure de fin"
                  value={formData.endTime}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, endTime: newValue as Date | null }))}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <FormControl fullWidth>
                <InputLabel>Véhicule</InputLabel>
                <Select
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleSelectChange}
                  label="Véhicule"
                >
                  <MenuItem value="1">Voiture 1</MenuItem>
                  <MenuItem value="2">Voiture 2</MenuItem>
                </Select>
              </FormControl>
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

export default PracticalCourses; 