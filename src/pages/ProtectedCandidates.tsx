import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Chip, TablePagination, Stack } from '@mui/material';

const ROWS_PER_PAGE_OPTIONS = [
  10,
  25,
  50,
  100,
  { value: -1, label: 'Tout afficher' }
];

const ProtectedCandidates: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  useEffect(() => {
    const fetchProtected = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/exams/protected-candidates');
        const data = await res.json();
        setCandidates(data.candidates || []);
      } catch {
        setCandidates([]);
      }
      setLoading(false);
    };
    fetchProtected();
  }, []);

  // Pagination
  const paginated = rowsPerPage === -1
    ? candidates
    : candidates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, sm: 3 }, minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ mb: 4 }}>Candidats protégés</Typography>
      <Paper sx={{ p: 2.5, borderRadius: 2, background: '#fff', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', mb: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 220 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TablePagination
              component="div"
              count={candidates.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={e => {
                const value = Number(e.target.value);
                setRowsPerPage(value);
                setPage(0);
              }}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage="Afficher"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count !== -1 ? count : 'plus de ' + to}`}
              sx={{ minWidth: 320, mb: 2 }}
            />
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Nom & Prénom</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Téléphone</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>CIN</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type d'examen</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date d'examen</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: '#888' }}>
                        Aucun candidat protégé trouvé
                      </TableCell>
                    </TableRow>
                  ) : paginated.map((cand, idx) => (
                    <TableRow key={cand._id + '-' + cand.examDate + '-' + cand.examType}>
                      <TableCell sx={{ fontWeight: 600 }}>{cand.lastName} {cand.firstName}</TableCell>
                      <TableCell>{cand.phone || '-'}</TableCell>
                      <TableCell>{cand.cin || '-'}</TableCell>
                      <TableCell>
                        <Chip label={cand.examType === 'théorique' ? 'Code' : 'Conduite'} color={cand.examType === 'théorique' ? 'info' : 'warning'} />
                      </TableCell>
                      <TableCell>{cand.examDate ? new Date(cand.examDate).toLocaleDateString('fr-FR') : '-'}</TableCell>
                      <TableCell>
                        <Chip label="Protégé" color="success" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ProtectedCandidates; 