import React, { useState } from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const daysOfWeek = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const monthNames = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  let d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // lundi = 0
}

const CustomCalendar: React.FC = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  let grid: (number | null)[] = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  // Toujours 6 lignes (42 cases)
  while (grid.length < 42) grid.push(null);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11); setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0); setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  return (
    <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: 2, minWidth: 520, maxWidth: 520, mx: 'auto', fontFamily: 'Montserrat, Arial, sans-serif', boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <IconButton onClick={prevMonth}><ArrowBackIosNewIcon /></IconButton>
        <Typography variant="h3" sx={{ fontWeight: 900, mx: 2, letterSpacing: 1, color: '#884800', textTransform: 'capitalize', textAlign: 'center', flex: 1 }}>
          {monthNames[month]} {year}
        </Typography>
        <IconButton onClick={nextMonth}><ArrowForwardIosIcon /></IconButton>
      </Box>
      <Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
          {daysOfWeek.map(d => (
            <Typography key={d} align="center" sx={{ fontWeight: 700, fontSize: 15, letterSpacing: 1, color: '#884800', textTransform: 'capitalize', py: 1 }}>{d}</Typography>
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
          {grid.map((day, idx) => {
            const isWeekend = idx % 7 === 5 || idx % 7 === 6;
            return (
              <Paper key={idx} elevation={0} sx={{
                height: 56, minHeight: 56, bgcolor: isWeekend ? '#ffe5d0' : '#fff',
                border: '1px solid #d1bfa3', boxShadow: 'none',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                px: 1.5, pt: 1.2, fontWeight: 700, fontSize: 16
              }}>
                {day ? String(day).padStart(2, '0') : ''}
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default CustomCalendar; 