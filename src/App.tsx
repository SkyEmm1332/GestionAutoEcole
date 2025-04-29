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

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
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
            <Route path="theoretical-courses" element={<TheoreticalCourses />} />
            <Route path="practical-courses" element={<PracticalCourses />} />
            <Route path="exams" element={<Exams />} />
            <Route path="instructors" element={<Instructors />} />
            <Route path="administration" element={<Administration />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
