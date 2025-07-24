import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import TheoreticalCourses from './pages/TheoreticalCourses';
import PracticalCourses from './pages/PracticalCourses';
import Exams from './pages/Exams';
import Instructors from './pages/Instructors';
import Administration from './pages/Administration';
import Settings from './pages/Settings';
import Payments from './pages/Payments';
import NewCandidate from './pages/NewCandidate';
import CandidateHistory from './pages/CandidateHistory';
import ProtectedCandidates from './pages/ProtectedCandidates';

const theme = createTheme({
  palette: {
    primary: {
      main: '#181a20',
      contrastText: '#fff',
    },
    secondary: {
      main: '#800020',
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#fff',
    },
    text: {
      primary: '#111',
      secondary: '#555',
    },
    error: {
      main: '#b71c1c',
    },
    warning: {
      main: '#fbc02d',
    },
    info: {
      main: '#1976d2',
    },
    success: {
      main: '#388e3c',
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          textTransform: 'none',
          boxShadow: 'none',
        },
        containedPrimary: {
          backgroundColor: '#181a20',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#23242a',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#181a20',
          borderRadius: 0,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#181a20',
          color: '#fff',
          borderRadius: 0,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="candidates/*" element={<Candidates />} />
            <Route path="candidates/new" element={<NewCandidate />} />
            <Route path="candidates/history" element={<CandidateHistory />} />
            <Route path="theoretical-courses" element={<TheoreticalCourses />} />
            <Route path="practical-courses" element={<PracticalCourses />} />
            <Route path="exams" element={<Exams />} />
            <Route path="exams/proteges" element={<ProtectedCandidates />} />
            <Route path="instructors" element={<Instructors />} />
            <Route path="administration" element={<Administration />} />
            <Route path="settings" element={<Settings />} />
            <Route path="payments" element={<Payments />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
