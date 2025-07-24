import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Alert, ToggleButton, ToggleButtonGroup, LinearProgress, Tooltip, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Tooltip as RechartsTooltip, Sector } from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EuroIcon from '@mui/icons-material/Euro';
import { statsService } from '../services/statsService';

const COLORS = ['#1976d2', '#800020', '#ff9800', '#388e3c', '#b71c1c', '#fbc02d', '#6a1b9a', '#0097a7'];

type RegistrationPoint = { date: string; inscriptions: number };
type CategoryPoint = { name: string; value: number };
type DashboardStats = {
  totalCandidates: number;
  newCandidatesThisMonth: number;
  monthlyRevenue: number;
  registrations: RegistrationPoint[];
  categories: CategoryPoint[];
  successRates: {
    code: number;
    conduite: number;
    codeProtected: number;
    conduiteProtected: number;
    codeProtectedSuccess?: number;
    codeProtectedTotal?: number;
    conduiteProtectedSuccess?: number;
    conduiteProtectedTotal?: number;
  };
  revenueByPeriod: { date: string; revenue: number }[];
  genderDistribution: { name: string; value: number }[];
  nationalityDistribution: { name: string; value: number }[];
  topInstructors: { name: string; value: number }[];
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    newCandidatesThisMonth: 0,
    monthlyRevenue: 0,
    registrations: [],
    categories: [],
    successRates: { code: 0, conduite: 0, codeProtected: 0, conduiteProtected: 0 },
    revenueByPeriod: [],
    genderDistribution: [],
    nationalityDistribution: [],
    topInstructors: [],
  });
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [period, setPeriod] = useState<'jour' | 'semaine' | 'mois' | 'année'>('mois');
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [filteredCategories, setFilteredCategories] = useState<CategoryPoint[]>([]);
  const [loadingPie, setLoadingPie] = useState(false);

  const inscriptionLabel = period === 'jour'
    ? "Nouveaux inscrits aujourd'hui"
    : period === 'semaine'
    ? 'Nouveaux inscrits cette semaine'
    : period === 'mois'
    ? 'Nouveaux inscrits ce mois'
    : 'Nouveaux inscrits cette année';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const data = await statsService.getDashboardStats(period);
      setStats({
          totalCandidates: data.totalCandidates || 0,
          newCandidatesThisMonth: data.newCandidatesThisPeriod || 0,
          monthlyRevenue: data.revenueThisPeriod || 0,
          registrations: Array.isArray(data.registrations) ? data.registrations : [],
          categories: Array.isArray(data.categories) ? data.categories : [],
          successRates: {
            code: data.successRates?.code ?? data.successRates?.theory ?? 0,
            conduite: data.successRates?.conduite ?? data.successRates?.practice ?? 0,
            codeProtected: data.successRates?.codeProtected ?? 0,
            conduiteProtected: data.successRates?.conduiteProtected ?? 0,
            codeProtectedSuccess: data.successRates?.codeProtectedSuccess ?? 0,
            codeProtectedTotal: data.successRates?.codeProtectedTotal ?? 0,
            conduiteProtectedSuccess: data.successRates?.conduiteProtectedSuccess ?? 0,
            conduiteProtectedTotal: data.successRates?.conduiteProtectedTotal ?? 0
          },
          revenueByPeriod: Array.isArray(data.revenueByPeriod) ? data.revenueByPeriod : [],
          genderDistribution: Array.isArray(data.genderDistribution) ? data.genderDistribution : [],
          nationalityDistribution: Array.isArray(data.nationalityDistribution) ? data.nationalityDistribution : [],
          topInstructors: Array.isArray(data.topInstructors) ? data.topInstructors : [],
        });
        setFilteredCategories([]);
        setSelectedPeriod(null);
      } catch (e) {
        setError('Erreur lors du chargement des données du dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period]);

  useEffect(() => {
    async function fetchFilteredCategories() {
      if (!selectedPeriod) { setFilteredCategories([]); setLoadingPie(false); return; }
      setLoadingPie(true);
      try {
        const data = await statsService.getDashboardStats(period, undefined, undefined, selectedPeriod);
        setFilteredCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch {}
      setLoadingPie(false);
    }
    fetchFilteredCategories();
  }, [selectedPeriod, period]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, sm: 3 }, minHeight: '100vh' }}>
      <style>{`
        .pie-sector-active {
          transition: transform 0.35s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
      <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ mb: 4 }}>Tableau de bord</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>Vue :</Typography>
            <ToggleButtonGroup
              value={period}
              exclusive
              onChange={(_, value) => value && setPeriod(value)}
              size="small"
              color="primary"
            >
              <ToggleButton value="jour">Jour</ToggleButton>
              <ToggleButton value="semaine">Semaine</ToggleButton>
              <ToggleButton value="mois">Mois</ToggleButton>
              <ToggleButton value="année">Année</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center', minHeight: 160 }}>
            {loading ? <CircularProgress /> : <>
              <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h6">Candidats total</Typography>
              <Typography variant="h4" fontWeight={700}>{stats.totalCandidates}</Typography>
            </>}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center', minHeight: 160 }}>
            {loading ? <CircularProgress /> : <>
              <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
              <Typography variant="h6">{inscriptionLabel}</Typography>
              <Typography variant="h4" fontWeight={700}>{stats.newCandidatesThisMonth}</Typography>
            </>}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center', minHeight: 160 }}>
            {loading ? <CircularProgress /> : <>
              <EuroIcon color="secondary" sx={{ fontSize: 40 }} />
              <Typography variant="h6">CA du mois (FCFA)</Typography>
              <Typography variant="h4" fontWeight={700}>{stats.monthlyRevenue.toLocaleString('fr-FR')}</Typography>
            </>}
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 350, mb: 3, position: 'relative' }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Évolution des inscriptions</Typography>
            {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220 }}><CircularProgress /></Box> :
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.registrations}>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip></RechartsTooltip>
                <Bar
                  dataKey="inscriptions"
                  fill="#1976d2"
                  name="Nouveaux inscrits"
                  onClick={(_, idx) => {
                    const label = stats.registrations[idx]?.date;
                    setSelectedPeriod(selectedPeriod === label ? null : label);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>}
          </Paper>
          <Paper sx={{ p: 3, height: 350, mb: 3, position: 'relative' }}>
            <Typography variant="h6" fontWeight={700} mb={2}>CA</Typography>
            {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220 }}><CircularProgress /></Box> :
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.revenueByPeriod}>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip></RechartsTooltip>
                <Line type="monotone" dataKey="revenue" stroke="#800020" name="CA (FCFA)" />
              </LineChart>
            </ResponsiveContainer>}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 350, mb: 3, position: 'relative' }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Répartition par catégorie</Typography>
            {loadingPie ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220 }}><CircularProgress /></Box> :
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={filteredCategories.length > 0 ? filteredCategories : stats.categories}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#1976d2"
                  isAnimationActive={true}
                  activeIndex={activeCategoryIndex ?? undefined}
                  activeShape={(props: any) => (
                    <g>
                      <Sector {...props} outerRadius={props.outerRadius + 10} className="pie-sector-active" />
                    </g>
                  )}
                  onMouseEnter={(_, idx) => setActiveCategoryIndex(idx)}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                >
                  {stats.categories.map((entry, idx) => (
                    <Cell key={`cell-cat-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <RechartsTooltip
                  formatter={(value: any, name: any, props: any) => [`${value} candidats`, name]}
                  separator=": "
                />
                {selectedPeriod && (
                  <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                    Répartition pour : {selectedPeriod}
                  </Typography>
                )}
              </PieChart>
            </ResponsiveContainer>}
          </Paper>
          <Paper sx={{ p: 3, height: 350, mb: 3, position: 'relative' }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Taux de réussite (%) <br /> Code & Conduite
              <Tooltip title="Un candidat protégé est un candidat ayant bénéficié d'une aide ou d'une faveur pour repasser ou réussir.">
                <span style={{ cursor: 'help', color: '#800020', fontWeight: 700, fontSize: 18, marginLeft: 4 }}>?</span>
              </Tooltip>
            </Typography>
            {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220 }}><CircularProgress /></Box> :
              <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ minWidth: 90, fontWeight: 600 }}>Code</Typography>
                  <LinearProgress variant="determinate" value={stats.successRates.code} sx={{ flex: 1, height: 16, borderRadius: 8, background: '#e3eafc', '& .MuiLinearProgress-bar': { backgroundColor: '#1976d2' } }} />
                  <Typography sx={{ minWidth: 48, ml: 2, fontWeight: 700, color: '#1976d2' }}>{stats.successRates.code} %</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography sx={{ minWidth: 90, fontWeight: 400, fontSize: 14, color: '#888' }}>Protégés</Typography>
                  <Box sx={{ flex: 1 }} />
                  <Typography sx={{ minWidth: 48, ml: 2, fontWeight: 700, color: '#00bcd4', display: 'inline-block' }}>
                    {stats.successRates.codeProtectedTotal ?? 0} protégés
                  </Typography>
                  <Button variant="outlined" size="small" sx={{ ml: 2 }} onClick={() => window.location.href = '/exams/proteges'}>
                    Voir la liste
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ minWidth: 90, fontWeight: 600 }}>Conduite</Typography>
                  <LinearProgress variant="determinate" value={stats.successRates.conduite} sx={{ flex: 1, height: 16, borderRadius: 8, background: '#fff3e0', '& .MuiLinearProgress-bar': { backgroundColor: '#ff9800' } }} />
                  <Typography sx={{ minWidth: 48, ml: 2, fontWeight: 700, color: '#ff9800' }}>{stats.successRates.conduite} %</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ minWidth: 90, fontWeight: 400, fontSize: 14, color: '#888' }}>Protégés</Typography>
                  <Box sx={{ flex: 1 }} />
                  <Typography sx={{ minWidth: 48, ml: 2, fontWeight: 700, color: '#ffb300', display: 'inline-block' }}>
                    {stats.successRates.conduiteProtectedTotal ?? 0} protégés
                  </Typography>
                  <Button variant="outlined" size="small" sx={{ ml: 2 }} onClick={() => window.location.href = '/exams/proteges'}>
                    Voir la liste
                  </Button>
                </Box>
              </Box>
            }
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 