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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, EventBusy as EventBusyIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { fr } from 'date-fns/locale';
import { SelectChangeEvent } from '@mui/material';

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

const Instructors: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAbsenceDialog, setOpenAbsenceDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    hireDate: null as Date | null,
    status: 'actif',
  });

  const [absenceData, setAbsenceData] = useState({
    instructor: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    reason: '',
    type: 'congé',
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
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      hireDate: null,
      status: 'actif',
    });
  };

  const handleOpenAbsenceDialog = () => {
    setOpenAbsenceDialog(true);
  };

  const handleCloseAbsenceDialog = () => {
    setOpenAbsenceDialog(false);
    setAbsenceData({
      instructor: '',
      startDate: null,
      endDate: null,
      reason: '',
      type: 'congé',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAbsenceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAbsenceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAbsenceSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setAbsenceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // TODO: Implémenter la logique de soumission
    handleCloseDialog();
  };

  const handleAbsenceSubmit = () => {
    // TODO: Implémenter la logique de soumission
    handleCloseAbsenceDialog();
  };

  // Données de démonstration
  const instructors = [
    {
      id: 1,
      firstName: 'Jean',
      lastName: 'Martin',
      email: 'jean.martin@autoecole.com',
      phone: '0123456789',
      status: 'actif',
      hireDate: '2023-01-15',
    },
    {
      id: 2,
      firstName: 'Marie',
      lastName: 'Dubois',
      email: 'marie.dubois@autoecole.com',
      phone: '0123456789',
      status: 'actif',
      hireDate: '2023-03-20',
    },
  ];

  const absences = [
    {
      id: 1,
      instructor: 'Jean Martin',
      startDate: '2024-03-15',
      endDate: '2024-03-17',
      reason: 'Congé annuel',
      type: 'congé',
    },
    {
      id: 2,
      instructor: 'Marie Dubois',
      startDate: '2024-03-20',
      endDate: '2024-03-21',
      reason: 'Formation',
      type: 'formation',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestion des moniteurs</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ mr: 2 }}
          >
            Nouveau moniteur
          </Button>
          <Button
            variant="outlined"
            startIcon={<EventBusyIcon />}
            onClick={handleOpenAbsenceDialog}
          >
            Déclarer une absence
          </Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Liste des moniteurs" />
        <Tab label="Gestion des absences" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Date d'embauche</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {instructors.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell>{instructor.lastName}</TableCell>
                  <TableCell>{instructor.firstName}</TableCell>
                  <TableCell>{instructor.email}</TableCell>
                  <TableCell>{instructor.phone}</TableCell>
                  <TableCell>{instructor.hireDate}</TableCell>
                  <TableCell>{instructor.status}</TableCell>
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
                <TableCell>Moniteur</TableCell>
                <TableCell>Date de début</TableCell>
                <TableCell>Date de fin</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Raison</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {absences.map((absence) => (
                <TableRow key={absence.id}>
                  <TableCell>{absence.instructor}</TableCell>
                  <TableCell>{absence.startDate}</TableCell>
                  <TableCell>{absence.endDate}</TableCell>
                  <TableCell>{absence.type}</TableCell>
                  <TableCell>{absence.reason}</TableCell>
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Nouveau moniteur</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <Box>
              <TextField
                fullWidth
                label="Nom"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Prénom"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Téléphone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                fullWidth
                label="Adresse"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </Box>
            <Box>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date d'embauche"
                  value={formData.hireDate}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, hireDate: newValue }))}
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
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="Statut"
                >
                  <MenuItem value="actif">Actif</MenuItem>
                  <MenuItem value="inactif">Inactif</MenuItem>
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

      <Dialog open={openAbsenceDialog} onClose={handleCloseAbsenceDialog} maxWidth="md" fullWidth>
        <DialogTitle>Déclarer une absence</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Moniteur</InputLabel>
                <Select
                  name="instructor"
                  value={absenceData.instructor}
                  onChange={handleAbsenceSelectChange}
                  label="Moniteur"
                >
                  <MenuItem value="1">Jean Martin</MenuItem>
                  <MenuItem value="2">Marie Dubois</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date de début"
                  value={absenceData.startDate}
                  onChange={(newValue) => setAbsenceData(prev => ({ ...prev, startDate: newValue }))}
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
                <DatePicker
                  label="Date de fin"
                  value={absenceData.endDate}
                  onChange={(newValue) => setAbsenceData(prev => ({ ...prev, endDate: newValue }))}
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
                <InputLabel>Type d'absence</InputLabel>
                <Select
                  name="type"
                  value={absenceData.type}
                  onChange={handleAbsenceSelectChange}
                  label="Type d'absence"
                >
                  <MenuItem value="congé">Congé</MenuItem>
                  <MenuItem value="maladie">Maladie</MenuItem>
                  <MenuItem value="formation">Formation</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                fullWidth
                label="Raison"
                name="reason"
                value={absenceData.reason}
                onChange={handleAbsenceInputChange}
                multiline
                rows={3}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAbsenceDialog}>Annuler</Button>
          <Button onClick={handleAbsenceSubmit} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Instructors; 