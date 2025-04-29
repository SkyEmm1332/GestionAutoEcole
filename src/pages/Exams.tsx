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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { fr } from 'date-fns/locale';
import { SelectChangeEvent } from '@mui/material/Select';

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
      id={`exams-tabpanel-${index}`}
      aria-labelledby={`exams-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface FormData {
  candidate: string;
  type: string;
  date: Date;
  time: Date | null;
  location: string;
  result: string;
}

const Exams: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [formData, setFormData] = useState<FormData>({
    candidate: '',
    type: 'code',
    date: new Date(),
    time: null,
    location: '',
    result: '',
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
      type: 'code',
      date: new Date(),
      time: null,
      location: '',
      result: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  const handleSubmit = () => {
    // TODO: Implémenter la logique de soumission
    handleCloseDialog();
  };

  // Données de démonstration
  const exams = [
    {
      id: 1,
      date: '2024-03-15',
      candidate: 'Jean Dupont',
      type: 'code',
      time: '09:00',
      location: 'Centre d\'examen 1',
      result: 'En attente',
    },
    {
      id: 2,
      date: '2024-03-20',
      candidate: 'Marie Durand',
      type: 'conduite',
      time: '14:00',
      location: 'Centre d\'examen 2',
      result: 'En attente',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestion des examens</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Programmer un examen
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Examens à venir" />
        <Tab label="Historique" />
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
                <TableCell>Type</TableCell>
                <TableCell>Heure</TableCell>
                <TableCell>Lieu</TableCell>
                <TableCell>Résultat</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{exam.date}</TableCell>
                  <TableCell>{exam.candidate}</TableCell>
                  <TableCell>{exam.type}</TableCell>
                  <TableCell>{exam.time}</TableCell>
                  <TableCell>{exam.location}</TableCell>
                  <TableCell>{exam.result}</TableCell>
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
        <Typography>Historique des examens</Typography>
        {/* TODO: Ajouter l'historique des examens */}
      </TabPanel>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Programmer un examen</DialogTitle>
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
                <InputLabel>Type d'examen</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleSelectChange}
                  label="Type d'examen"
                >
                  <MenuItem value="code">Code</MenuItem>
                  <MenuItem value="conduite">Conduite</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, date: newValue || new Date() }))}
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
                  label="Heure"
                  value={formData.time}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, time: newValue || null }))}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                fullWidth
                label="Lieu"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
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

export default Exams; 