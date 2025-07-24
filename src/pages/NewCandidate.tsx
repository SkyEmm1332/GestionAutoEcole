import React, { useState, useContext } from 'react';
import { Box, Typography, Button, TextField, Paper, Grid, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { candidateService } from '../services/candidateService';
import { SnackbarContext } from '../components/Layout';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { CATEGORIES } from '../constants/categories';

const labelSx = { fontWeight: 700, color: '#222', mb: 0.5, fontSize: 16 };
const fieldSx = {
  bgcolor: '#f8fafc',
  borderRadius: 2,
  '& .MuiInputBase-root': { fontSize: 17, fontWeight: 500 },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2', boxShadow: '0 0 0 2px #1976d220' },
};

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const NewCandidate = () => {
  const { showMessage } = useContext(SnackbarContext);
  const [form, setForm] = useState({
    fullName: '',
    cin: '',
    dateOfBirth: '',
    placeOfBirth: '',
    phone: '',
    fatherName: '',
    motherName: '',
    registrationDate: '',
    licenseType: '',
    nationality: '',
    amount: '',
    sexe: '',
  });
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const extractFieldsFromText = (text: string) => {
    const lines = text.split(/\n|\r|\r\n/).map(l => l.trim());
    const parasites = [
      'ADRESSE :', 'CODE :', 'EMMARY AUTO-ECOLE', 'N° Certificat', 'AUTO-ECOLE :', 'CERTIFICAT', 'YAH KOUASSI', '', 'NOM', 'PRENOM', 'CANDIDAT', 'CANDIDATE', 'CATEGORIE', 'CATEGORIES', 'CATEGORIE(S)', '(S) SUIVANTES:', '(S) SUIVANTE:', 'SUIVANTES:', 'SUIVANTE:'
    ];
    let fullName = '', fatherName = '', motherName = '', cin = '', dateOfBirth = '', placeOfBirth = '', phone = '', registrationDate = '', licenseType = '', nationality = '', amount = '';
    // Extraction contextuelle
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      // Prénom & Nom
      if (l.toUpperCase().includes('NOM ET PRÉNOMS')) {
        let j = i + 1;
        while (j < lines.length && (parasites.includes(lines[j]) || lines[j].toUpperCase().includes('NOM DU PÈRE') || lines[j].toUpperCase().includes('CODE'))) j++;
        if (j < lines.length && /^[A-ZÀ-Ÿ'\-\s]+$/.test(lines[j]) && lines[j].length > 2) {
          fullName = lines[j];
          // Nom du père juste après le nom
          if (j + 1 < lines.length && /^[A-ZÀ-Ÿ'\-\s]+$/.test(lines[j + 1]) && lines[j + 1] !== fullName && !parasites.includes(lines[j + 1])) {
            fatherName = lines[j + 1];
          }
        }
      }
      // Nom de la mère
      if (l.toUpperCase().startsWith('NOM DU MÈRE')) {
        // Sur la même ligne ?
        const match = l.match(/NOM DU MÈRE\s*:?\s*(.+)/i);
        if (match && match[1] && match[1].length > 2) motherName = match[1].trim();
        else if (i + 1 < lines.length && /^[A-ZÀ-Ÿ'\-\s]+$/.test(lines[i + 1]) && !parasites.includes(lines[i + 1])) motherName = lines[i + 1];
      }
      // Document d'identification
      if (l.toUpperCase().includes('DOCUMENT') && (l.toUpperCase().includes('IDENTIFICATION') || l.toUpperCase().includes('IDENTITE'))) {
        const match = l.match(/CNI?\s*-\s*[A-Z0-9]{5,}/i);
        if (match) cin = match[0];
        else if (i + 1 < lines.length && /CNI?\s*-\s*[A-Z0-9]{5,}/i.test(lines[i + 1])) {
          const match2 = lines[i + 1].match(/CNI?\s*-\s*[A-Z0-9]{5,}/i);
          if (match2) cin = match2[0];
        }
      }
      // Date et lieu de naissance
      if (l.toUpperCase().includes('DATE ET LIEU DE NAISSANCE')) {
        const match = l.match(/:([^,]+),\s*le\s*(\d{2}\/\d{2}\/\d{4})/i);
        if (match) {
          placeOfBirth = match[1]?.trim() || '';
          dateOfBirth = match[2] || '';
        } else {
          // fallback : séparer à la virgule
          const parts = l.split(':')[1]?.split(',');
          if (parts && parts.length === 2) {
            placeOfBirth = parts[0]?.trim() || '';
            dateOfBirth = parts[1]?.replace(/le\s*/i, '').trim() || '';
          }
        }
      }
      // Téléphone
      if (l.toUpperCase().includes('TÉLÉPHONE')) {
        if (i + 1 < lines.length && /^(\+?\d{7,}|0\d{7,}|[\d\s\-]+)$/.test(lines[i + 1])) phone = lines[i + 1];
      }
      // Date d'inscription
      if (l.toLowerCase().startsWith('fait à')) {
        const match = l.match(/le\s*(\d{2}\/\d{2}\/\d{4})/i);
        if (match && match[1]) registrationDate = match[1];
      }
      // Catégorie
      if (l.toLowerCase().includes('catégor')) {
        // On prend la sous-chaîne après le mot 'catégor' pour éviter de prendre le 'C' du label
        const afterLabel = l.replace(/.*cat[ée]gor(ie|ies)?s?\s*:?/i, '');
        let match = afterLabel.match(/([A-E])/g);
        if (!match && i + 1 < lines.length) match = lines[i + 1].match(/([A-E])/g);
        if (match) licenseType = match.join(',');
      }
      // Nationalité
      if (l.toUpperCase().includes('NATIONALITE')) {
        const match = l.match(/NATIONALITE\s*:?[\s]*([A-ZÀ-Ÿa-zà-ÿ]+)/i);
        let nat = '';
        if (match && match[1]) nat = match[1].trim();
        else if (i + 1 < lines.length && lines[i + 1].length > 2 && !parasites.some(p => lines[i + 1].toUpperCase().includes(p.replace(/\s*:/, '').toUpperCase()))) nat = lines[i + 1].trim();
        // Nettoyage : première lettre en majuscule, reste en minuscule
        if (nat) nat = nat.charAt(0).toUpperCase() + nat.slice(1).toLowerCase();
        nationality = nat;
      }
      // Montant à payer (optionnel)
      if (l.toUpperCase().includes('MONTANT')) {
        const match = l.match(/\d+/);
        if (match && match[0]) amount = match[0];
        else if (i + 1 < lines.length && /\d+/.test(lines[i + 1])) {
          const match2 = lines[i + 1].match(/\d+/);
          if (match2 && match2[0]) amount = match2[0];
        }
      }
    }
    // Si cin est toujours vide, chercher dans toutes les lignes (motifs CI, CNI, CIE, CIN, etc. avec au moins 5 caractères après le tiret)
    if (!cin) {
      const found = lines.find(l => /C(I|IN|NI|IE)?\s*-\s*[A-Z0-9]{5,}/i.test(l));
      if (found) {
        const match = found.match(/C(I|IN|NI|IE)?\s*-\s*[A-Z0-9]{5,}/i);
        if (match) cin = match[0];
      }
    }
    // Si toujours rien, prendre la première ligne contenant au moins 2 groupes de lettres/chiffres séparés par un tiret et la partie après le tiret fait au moins 5 caractères
    if (!cin) {
      const found = lines.find(l => /[A-Z0-9]+\s*-\s*[A-Z0-9]{5,}/i.test(l));
      if (found) {
        const match = found.match(/[A-Z0-9]+\s*-\s*[A-Z0-9]{5,}/i);
        if (match) cin = match[0];
      }
    }
    // Valeurs par défaut si vides
    if (!registrationDate) {
      const today = new Date();
      registrationDate = today.toISOString().slice(0, 10);
    }
    // Conversion en majuscules pour tous les champs (sauf date au format JJ/MM/AAAA)
    const toUpper = (v: string) => (v ? v.toUpperCase() : '');
    return {
      fullName: toUpper(fullName),
      cin: toUpper(cin),
      dateOfBirth, // on garde le format JJ/MM/AAAA
      placeOfBirth: toUpper(placeOfBirth),
      phone: toUpper(phone),
      fatherName: toUpper(fatherName),
      motherName: toUpper(motherName),
      registrationDate, // on garde le format JJ/MM/AAAA
      licenseType: toUpper(licenseType),
      nationality: toUpper(nationality),
      amount: toUpper(amount),
    };
  }

  const handlePdfImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function() {
      const typedarray = new Uint8Array(this.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        let pageText = '';
        let lastY = null;
        for (const item of content.items) {
          // @ts-ignore
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) pageText += '\n';
          // @ts-ignore
          pageText += item.str + ' ';
          // @ts-ignore
          lastY = item.transform[5];
        }
        text += pageText + '\n';
      }
      setExtractedText(text);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleValidateExtraction = () => {
    if (!extractedText) return;
    const extracted = extractFieldsFromText(extractedText);
    setForm(prev => ({ ...prev, ...extracted }));
    showMessage('Extraction validée !', 'success');
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, sm: 3 }, background: '#f6f8fa', minHeight: '100vh' }}>
          <Typography
        variant="h4"
            fontWeight={900}
        mb={4}
        color="#1a237e"
        textAlign="left"
            letterSpacing={1.5}
            sx={{
              textShadow: '0 2px 8px #1976d220',
          fontSize: { xs: '1.2rem', sm: '1.7rem', md: '2rem', lg: '2.2rem' },
              lineHeight: 1.15
            }}
          >
            Ajouter un nouveau candidat
          </Typography>
      <Box sx={{ mb: 3 }}>
        <Button variant="outlined" component="label" color="primary" sx={{ fontWeight: 700, fontSize: 16, borderRadius: 3, px: 3, py: 1 }}>
              Importer un PDF
              <input type="file" accept="application/pdf" hidden onChange={handlePdfImport} />
            </Button>
          </Box>
          {extractedText && (
            <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#1a237e', textTransform: 'uppercase', letterSpacing: 1 }}>Blocs extraits du PDF :</Typography>
          <Box sx={{ maxHeight: 180, overflowY: 'auto', bgcolor: '#f5f5f5', borderRadius: 2, p: 1, mb: 1, border: '1px solid #e0e0e0' }}>
                {extractedText.split(/\n+/).map((block, idx) => (
                  <Box key={idx} sx={{ fontFamily: 'monospace', fontSize: 15, mb: 0.5, p: 0.5, borderBottom: '1px solid #eee' }}>{block}</Box>
                ))}
              </Box>
          <Button variant="contained" color="primary" onClick={handleValidateExtraction} sx={{ fontWeight: 700, borderRadius: 3, px: 3, py: 1 }}>
                Valider l'extraction
              </Button>
            </Box>
          )}
      <Box component="form" onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
          const { fullName, licenseType, dateOfBirth, registrationDate, ...rest } = form;
          const nameParts = fullName.trim().split(' ');
          const lastName = nameParts[0] || '';
          const firstName = nameParts.slice(1).join(' ') || '';
          // Conversion date JJ/MM/AAAA -> YYYY-MM-DD
          const toISO = (d: string) => {
            if (!d) return '';
            const [day, month, year] = d.split('/');
            if (day && month && year) return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            return d;
          };
          // Conversion licenseType string -> array
          const licenseTypeArray = licenseType ? licenseType.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
          const formToSend = {
            ...rest,
            lastName,
            firstName,
            dateOfBirth: toISO(dateOfBirth),
            registrationDate: toISO(registrationDate),
            licenseType: licenseTypeArray,
            amount: form.amount ? Number(form.amount) : 0
          };
          await candidateService.createCandidate(formToSend);
          showMessage('Candidat ajouté avec succès', 'success');
          setForm({
            fullName: '',
            cin: '',
            dateOfBirth: '',
            placeOfBirth: '',
            phone: '',
            fatherName: '',
            motherName: '',
            registrationDate: '',
            licenseType: '',
            nationality: '',
            amount: '',
            sexe: '',
          });
        } catch (e: any) {
          let errorMsg = "Erreur lors de l'ajout du candidat";
          if (e?.response?.data?.message) errorMsg = e.response.data.message;
          else if (e?.message) errorMsg = e.message;
          showMessage(errorMsg, 'error');
        }
        setLoading(false);
      }}>
        <Grid container spacing={3} sx={{ px: { xs: 0, sm: 2, md: 4 }, py: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField label="Prénom & Nom" name="fullName" value={form.fullName} onChange={handleFormChange} required fullWidth sx={fieldSx} InputLabelProps={{ sx: labelSx }} minRows={1} />
              </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField label="Document d'identification" name="cin" value={form.cin} onChange={handleFormChange} required fullWidth sx={fieldSx} InputLabelProps={{ sx: labelSx }} minRows={1} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
            <TextField label="Date de naissance" name="dateOfBirth" value={form.dateOfBirth} onChange={handleFormChange} required fullWidth sx={fieldSx} InputLabelProps={{ sx: labelSx }} minRows={1} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
            <TextField label="Lieu de naissance" name="placeOfBirth" value={form.placeOfBirth} onChange={handleFormChange} required fullWidth sx={fieldSx} InputLabelProps={{ sx: labelSx }} minRows={1} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
            <TextField label="Téléphone" name="phone" value={form.phone} onChange={handleFormChange} required fullWidth sx={fieldSx} InputLabelProps={{ sx: labelSx }} minRows={1} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
            <TextField label="Nom du père" name="fatherName" value={form.fatherName} onChange={handleFormChange} required fullWidth sx={fieldSx} InputLabelProps={{ sx: labelSx }} minRows={1} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
            <TextField label="Nom de la mère" name="motherName" value={form.motherName} onChange={handleFormChange} required fullWidth sx={fieldSx} InputLabelProps={{ sx: labelSx }} minRows={1} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
            <TextField label="Date d'inscription" name="registrationDate" value={form.registrationDate} onChange={handleFormChange} required fullWidth sx={fieldSx} InputLabelProps={{ sx: labelSx }} minRows={1} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="licenseType-label">Catégorie</InputLabel>
              <Select
                labelId="licenseType-label"
                name="licenseType"
                value={form.licenseType}
                onChange={handleSelectChange}
                label="Catégorie"
              >
                {CATEGORIES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
            <TextField label="Nationalité" name="nationality" value={form.nationality} onChange={handleFormChange} required fullWidth sx={fieldSx} InputLabelProps={{ sx: labelSx }} minRows={1} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
            <TextField label="Montant à payer" name="amount" type="number" value={form.amount} onChange={handleFormChange} required fullWidth sx={fieldSx} InputLabelProps={{ sx: labelSx }} minRows={1} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth required sx={fieldSx}>
              <InputLabel id="sexe-label" sx={labelSx}>Sexe</InputLabel>
              <Select
                labelId="sexe-label"
                name="sexe"
                value={form.sexe}
                label="Sexe"
                onChange={handleSelectChange}
              >
                <MenuItem value="M">Masculin</MenuItem>
                <MenuItem value="F">Féminin</MenuItem>
              </Select>
            </FormControl>
              </Grid>
              <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700, fontSize: 18, borderRadius: 3, px: 6, py: 1.5, boxShadow: '0 2px 8px #1976d220', bgcolor: '#1a237e', ':hover': { bgcolor: '#3949ab' }, width: { xs: '100%', sm: 'auto' }, mt: 2 }} disabled={loading}>
              {loading ? 'Ajout en cours...' : 'Ajouter le candidat'}
                </Button>
              </Grid>
            </Grid>
      </Box>
    </Box>
  );
};

export default NewCandidate; 