const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// GET - Récupérer tous les cours (exclut les supprimés par défaut)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, instructor, includeDeleted = false } = req.query;
    
    let query = {};
    
    // Par défaut, exclure les cours supprimés sauf si includeDeleted est true
    if (includeDeleted !== 'true') {
      query.isDeleted = { $ne: true };
    }
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (instructor) {
      query.instructor = instructor;
    }
    
    console.log('Query pour les cours actifs:', query);
    
    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName')
      .populate('enrolledStudents.candidate', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: 1 });
    
    const total = await Course.countDocuments(query);
    
    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Erreur dans la route GET /:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET - Récupérer les cours supprimés
router.get('/deleted', async (req, res) => {
  try {
    console.log('=== DÉBOGAGE BACKEND - ROUTE /deleted APPELÉE ===');
    const { page = 1, limit = 10, type, status, instructor } = req.query;
    
    // Rechercher les cours qui ont isDeleted: true
    let query = { isDeleted: true };
    console.log('Query initiale:', query);
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (instructor) {
      query.instructor = instructor;
    }
    
    console.log('Query finale:', query);
    
    // Vérifier d'abord combien de cours ont isDeleted: true
    const totalDeleted = await Course.countDocuments({ isDeleted: true });
    console.log('Total des cours avec isDeleted: true:', totalDeleted);
    
    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName')
      .populate('enrolledStudents.candidate', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: 1 });
    
    console.log('Cours trouvés avec la query:', courses.length);
    console.log('Détails des cours trouvés:');
    courses.forEach((course, index) => {
      console.log(`Cours ${index + 1}:`, {
        id: course._id,
        title: course.title,
        type: course.type,
        isDeleted: course.isDeleted
      });
    });
    
    const total = await Course.countDocuments(query);
    console.log('Total avec la query finale:', total);
    
    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Erreur dans la route /deleted:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET - Récupérer un cours par ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName email phone')
      .populate('enrolledStudents.candidate', 'firstName lastName email phone');
    
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Créer un nouveau cours
router.post('/', async (req, res) => {
  try {
    console.log('=== DÉBOGAGE BACKEND - DONNÉES REÇUES ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    // Validation des champs obligatoires
    const requiredFields = ['title', 'type', 'instructor', 'date'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('=== ERREUR - CHAMPS MANQUANTS ===');
      console.log('Missing fields:', missingFields);
      return res.status(400).json({ 
        message: `Champs manquants: ${missingFields.join(', ')}`,
        missingFields 
      });
    }
    
    // Validation du type
    if (req.body.type && !['théorique', 'pratique'].includes(req.body.type)) {
      console.log('=== ERREUR - TYPE INVALIDE ===');
      console.log('Invalid type:', req.body.type);
      return res.status(400).json({ 
        message: 'Type de cours invalide. Doit être "théorique" ou "pratique"' 
      });
    }
    
    // Validation de la date
    if (req.body.date) {
      const date = new Date(req.body.date);
      if (isNaN(date.getTime())) {
        console.log('=== ERREUR - DATE INVALIDE ===');
        console.log('Invalid date:', req.body.date);
        return res.status(400).json({ 
          message: 'Format de date invalide' 
        });
      }
    }
    
    console.log('=== DÉBOGAGE BACKEND - CRÉATION DU COURS ===');
    
    // Ajouter les valeurs par défaut si elles ne sont pas fournies
    const courseData = {
      ...req.body,
      description: req.body.description || '',
      duration: req.body.duration || 60,
      maxStudents: req.body.maxStudents || 1,
      location: req.body.location || '',
      cost: req.body.cost || 0,
      status: req.body.status || 'planifié'
    };
    
    console.log('Course data with defaults:', courseData);
    const course = new Course(courseData);
    console.log('Course object:', course);
    
    const newCourse = await course.save();
    console.log('=== DÉBOGAGE BACKEND - COURS CRÉÉ ===');
    console.log('New course:', newCourse);
    
    res.status(201).json(newCourse);
  } catch (error) {
    console.error('=== ERREUR BACKEND DÉTAILLÉE ===');
    console.error('Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    // Messages d'erreur plus détaillés selon le type d'erreur
    let errorMessage = error.message;
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      errorMessage = `Erreur de validation: ${validationErrors.join(', ')}`;
    } else if (error.code === 11000) {
      errorMessage = 'Un cours avec ce titre existe déjà';
    }
    
    res.status(400).json({ 
      message: errorMessage,
      error: error.message,
      details: error
    });
  }
});

// PUT - Mettre à jour un cours
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Supprimer un cours (marquer comme supprimé au lieu de supprimer définitivement)
router.delete('/:id', async (req, res) => {
  try {
    console.log('=== DÉBOGAGE BACKEND - SUPPRESSION DE COURS ===');
    console.log('ID du cours à supprimer:', req.params.id);
    
    // Vérifier d'abord si le cours existe
    const existingCourse = await Course.findById(req.params.id);
    console.log('Cours existant avant suppression:', existingCourse);
    
    if (!existingCourse) {
      console.log('Cours non trouvé');
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    
    // Mettre à jour le cours en ajoutant isDeleted: true
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    
    console.log('Cours après marquage comme supprimé:', course);
    console.log('isDeleted value:', course.isDeleted);
    
    // Vérifier que le cours est bien marqué comme supprimé
    const verification = await Course.findById(req.params.id);
    console.log('Vérification après suppression:', verification);
    console.log('isDeleted après vérification:', verification.isDeleted);
    
    res.json({ message: 'Cours supprimé avec succès', course });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT - Récupérer un cours supprimé
router.put('/:id/restore', async (req, res) => {
  try {
    console.log('=== DÉBOGAGE BACKEND - RESTAURATION DE COURS ===');
    console.log('ID du cours à restaurer:', req.params.id);
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    );
    
    console.log('Cours après restauration:', course);
    
    if (!course) {
      console.log('Cours non trouvé');
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    
    console.log('Cours restauré avec succès');
    res.json({ message: 'Cours récupéré avec succès', course });
  } catch (error) {
    console.error('Erreur lors de la restauration:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Supprimer définitivement un cours
router.delete('/:id/permanent', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    
    res.json({ message: 'Cours supprimé définitivement' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Inscrire un candidat à un cours
router.post('/:id/enroll-candidate', async (req, res) => {
  try {
    const { candidateId } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    
    // Vérifier si le candidat est déjà inscrit
    const alreadyEnrolled = course.enrolledStudents.find(
      enrollment => enrollment.candidate.toString() === candidateId
    );
    
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Candidat déjà inscrit à ce cours' });
    }
    
    // Vérifier si le cours est complet
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({ message: 'Cours complet' });
    }
    
    course.enrolledStudents.push({
      candidate: candidateId,
      enrollmentDate: new Date()
    });
    
    await course.save();
    
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Marquer la présence d'un candidat
router.put('/:id/attendance', async (req, res) => {
  try {
    const { candidateId, attendance, grade, notes } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    
    const enrollment = course.enrolledStudents.find(
      enrollment => enrollment.candidate.toString() === candidateId
    );
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Candidat non inscrit à ce cours' });
    }
    
    enrollment.attendance = attendance;
    if (grade !== undefined) enrollment.grade = grade;
    if (notes !== undefined) enrollment.notes = notes;
    
    await course.save();
    
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET - Cours à venir
router.get('/upcoming/list', async (req, res) => {
  try {
    const upcomingCourses = await Course.find({
      date: { $gte: new Date() },
      status: { $in: ['planifié', 'en_cours'] }
    })
    .populate('instructor', 'firstName lastName')
    .populate('enrolledStudents.candidate', 'firstName lastName')
    .sort({ date: 1 })
    .limit(10);
    
    res.json(upcomingCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Cours par instructeur
router.get('/instructor/:instructorId', async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.params.instructorId })
      .populate('enrolledStudents.candidate', 'firstName lastName')
      .sort({ date: 1 });
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 