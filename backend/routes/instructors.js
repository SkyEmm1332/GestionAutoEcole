const express = require('express');
const router = express.Router();
const Instructor = require('../models/Instructor');

// GET - Récupérer tous les instructeurs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const instructors = await Instructor.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Instructor.countDocuments(query);
    
    res.json({
      instructors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Récupérer un instructeur par ID
router.get('/:id', async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    
    if (!instructor) {
      return res.status(404).json({ message: 'Instructeur non trouvé' });
    }
    
    res.json(instructor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Créer un nouvel instructeur
router.post('/', async (req, res) => {
  try {
    const instructor = new Instructor(req.body);
    const newInstructor = await instructor.save();
    res.status(201).json(newInstructor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Mettre à jour un instructeur
router.put('/:id', async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!instructor) {
      return res.status(404).json({ message: 'Instructeur non trouvé' });
    }
    
    res.json(instructor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Supprimer un instructeur
router.delete('/:id', async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndDelete(req.params.id);
    
    if (!instructor) {
      return res.status(404).json({ message: 'Instructeur non trouvé' });
    }
    
    res.json({ message: 'Instructeur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Statistiques des instructeurs
router.get('/stats/overview', async (req, res) => {
  try {
    const totalInstructors = await Instructor.countDocuments();
    const activeInstructors = await Instructor.countDocuments({ status: 'actif' });
    const avgHourlyRate = await Instructor.aggregate([
      { $group: { _id: null, avgRate: { $avg: '$hourlyRate' } } }
    ]);
    
    res.json({
      totalInstructors,
      activeInstructors,
      averageHourlyRate: avgHourlyRate[0]?.avgRate || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 