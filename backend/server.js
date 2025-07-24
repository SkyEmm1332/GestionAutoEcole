const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Routes
const candidateRoutes = require('./routes/candidates');
const instructorRoutes = require('./routes/instructors');
const courseRoutes = require('./routes/courses');
const examRoutes = require('./routes/exams');
const paymentRoutes = require('./routes/payments');
const statsRoutes = require('./routes/stats');
const calendarRoutes = require('./routes/calendar');

app.use('/api/candidates', candidateRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/calendar', calendarRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'API Auto-École Gestion' });
});

// Connexion à MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-ecole';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion MongoDB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 