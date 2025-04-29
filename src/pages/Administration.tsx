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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
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
      id={`administration-tabpanel-${index}`}
      aria-labelledby={`administration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Administration: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [openIncomeDialog, setOpenIncomeDialog] = useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);

  const [expenseData, setExpenseData] = useState({
    date: null as Date | null,
    amount: '',
    category: '',
    description: '',
    paymentMethod: '',
  });

  const [incomeData, setIncomeData] = useState({
    date: new Date(),
    amount: '',
    source: '',
    description: '',
    paymentMethod: '',
  });

  const [documentData, setDocumentData] = useState({
    title: '',
    type: '',
    date: new Date(),
    file: null,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenExpenseDialog = () => {
    setOpenExpenseDialog(true);
  };

  const handleCloseExpenseDialog = () => {
    setOpenExpenseDialog(false);
    setExpenseData({
      date: null,
      amount: '',
      category: '',
      description: '',
      paymentMethod: '',
    });
  };

  const handleOpenIncomeDialog = () => {
    setOpenIncomeDialog(true);
  };

  const handleCloseIncomeDialog = () => {
    setOpenIncomeDialog(false);
    setIncomeData({
      date: new Date(),
      amount: '',
      source: '',
      description: '',
      paymentMethod: '',
    });
  };

  const handleOpenDocumentDialog = () => {
    setOpenDocumentDialog(true);
  };

  const handleCloseDocumentDialog = () => {
    setOpenDocumentDialog(false);
    setDocumentData({
      title: '',
      type: '',
      date: new Date(),
      file: null,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    if (target.type === 'file') {
      setDocumentData(prev => ({
        ...prev,
        [name]: target.files?.[0] || null
      }));
    } else {
      setExpenseData(prev => ({
        ...prev,
        [name]: value
      }));
      setIncomeData(prev => ({
        ...prev,
        [name]: value
      }));
      setDocumentData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = () => {
    // TODO: Implémenter la logique de soumission
    handleCloseExpenseDialog();
    handleCloseIncomeDialog();
    handleCloseDocumentDialog();
  };

  // Données de démonstration
  const expenses = [
    {
      id: 1,
      date: '2024-03-15',
      amount: '500.00',
      category: 'Salaires',
      description: 'Salaire moniteur',
      paymentMethod: 'Virement',
    },
    {
      id: 2,
      date: '2024-03-16',
      amount: '200.00',
      category: 'Fournitures',
      description: 'Achat de matériel pédagogique',
      paymentMethod: 'Carte bancaire',
    },
  ];

  const incomes = [
    {
      id: 1,
      date: '2024-03-15',
      amount: '1200.00',
      source: 'Inscription',
      description: 'Inscription nouveau candidat',
      paymentMethod: 'Espèces',
    },
    {
      id: 2,
      date: '2024-03-16',
      amount: '800.00',
      source: 'Cours',
      description: 'Paiement cours de conduite',
      paymentMethod: 'Virement',
    },
  ];

  const documents = [
    {
      id: 1,
      title: 'Contrat de travail',
      type: 'Ressources humaines',
      date: '2024-03-15',
      file: 'contrat.pdf',
    },
    {
      id: 2,
      title: 'Facture fournisseur',
      type: 'Comptabilité',
      date: '2024-03-16',
      file: 'facture.pdf',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Administration</Typography>
        <Box>
          {tabValue === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenExpenseDialog}
              sx={{ mr: 2 }}
            >
              Nouvelle dépense
            </Button>
          )}
          {tabValue === 1 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenIncomeDialog}
              sx={{ mr: 2 }}
            >
              Nouvelle recette
            </Button>
          )}
          {tabValue === 2 && (
            <Button
              variant="contained"
              startIcon={<AttachFileIcon />}
              onClick={handleOpenDocumentDialog}
            >
              Ajouter un document
            </Button>
          )}
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Dépenses" />
        <Tab label="Recettes" />
        <Tab label="Documents" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Mode de paiement</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>{expense.amount} €</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.paymentMethod}</TableCell>
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
                <TableCell>Date</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Mode de paiement</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell>{income.date}</TableCell>
                  <TableCell>{income.amount} €</TableCell>
                  <TableCell>{income.source}</TableCell>
                  <TableCell>{income.description}</TableCell>
                  <TableCell>{income.paymentMethod}</TableCell>
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

      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Fichier</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{document.title}</TableCell>
                  <TableCell>{document.type}</TableCell>
                  <TableCell>{document.date}</TableCell>
                  <TableCell>{document.file}</TableCell>
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

      <Dialog open={openExpenseDialog} onClose={handleCloseExpenseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Nouvelle dépense</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <Box>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date"
                  value={expenseData.date}
                  onChange={(newValue) => setExpenseData(prev => ({ ...prev, date: newValue }))}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Montant"
                name="amount"
                type="number"
                value={expenseData.amount}
                onChange={handleInputChange}
              />
            </Box>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="category"
                  value={expenseData.category}
                  onChange={handleInputChange}
                  label="Catégorie"
                >
                  <MenuItem value="salaires">Salaires</MenuItem>
                  <MenuItem value="fournitures">Fournitures</MenuItem>
                  <MenuItem value="entretien">Entretien véhicules</MenuItem>
                  <MenuItem value="autres">Autres</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Mode de paiement</InputLabel>
                <Select
                  name="paymentMethod"
                  value={expenseData.paymentMethod}
                  onChange={handleInputChange}
                  label="Mode de paiement"
                >
                  <MenuItem value="virement">Virement</MenuItem>
                  <MenuItem value="carte">Carte bancaire</MenuItem>
                  <MenuItem value="cheque">Chèque</MenuItem>
                  <MenuItem value="especes">Espèces</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={expenseData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExpenseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openIncomeDialog} onClose={handleCloseIncomeDialog} maxWidth="md" fullWidth>
        <DialogTitle>Nouvelle recette</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <Box>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date"
                  value={incomeData.date}
                  onChange={(newValue) => setIncomeData(prev => ({ ...prev, date: newValue || new Date() }))}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Montant"
                name="amount"
                type="number"
                value={incomeData.amount}
                onChange={handleInputChange}
              />
            </Box>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Source</InputLabel>
                <Select
                  name="source"
                  value={incomeData.source}
                  onChange={handleInputChange}
                  label="Source"
                >
                  <MenuItem value="inscription">Inscription</MenuItem>
                  <MenuItem value="cours">Cours</MenuItem>
                  <MenuItem value="examen">Examen</MenuItem>
                  <MenuItem value="autres">Autres</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Mode de paiement</InputLabel>
                <Select
                  name="paymentMethod"
                  value={incomeData.paymentMethod}
                  onChange={handleInputChange}
                  label="Mode de paiement"
                >
                  <MenuItem value="virement">Virement</MenuItem>
                  <MenuItem value="carte">Carte bancaire</MenuItem>
                  <MenuItem value="cheque">Chèque</MenuItem>
                  <MenuItem value="especes">Espèces</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={incomeData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIncomeDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDocumentDialog} onClose={handleCloseDocumentDialog} maxWidth="md" fullWidth>
        <DialogTitle>Ajouter un document</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <Box>
              <TextField
                fullWidth
                label="Titre"
                name="title"
                value={documentData.title}
                onChange={handleInputChange}
              />
            </Box>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={documentData.type}
                  onChange={handleInputChange}
                  label="Type"
                >
                  <MenuItem value="comptabilite">Comptabilité</MenuItem>
                  <MenuItem value="rh">Ressources humaines</MenuItem>
                  <MenuItem value="vehicules">Véhicules</MenuItem>
                  <MenuItem value="autres">Autres</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date"
                  value={documentData.date}
                  onChange={(newValue) => setDocumentData(prev => ({ ...prev, date: newValue || new Date() }))}
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
                type="file"
                name="file"
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDocumentDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Administration; 