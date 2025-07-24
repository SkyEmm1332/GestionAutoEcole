const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// GET - Récupérer tous les candidats
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, deleted, licenseType, registrationDate } = req.query;
    let query = {};
    if (deleted === 'true') {
      query.deletedAt = { $exists: true };
    } else {
      query.deletedAt = { $exists: false };
    }
    // Recherche par nom, prénom ou CIN
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { cin: { $regex: search, $options: 'i' } }
      ];
    }
    // Filtre par catégorie (licenseType) : match parfait sur la valeur brute, sans tri ni transformation
    if (licenseType) {
      query.$expr = {
        $eq: [
          {
            $cond: [
              { $isArray: "$licenseType" },
              {
                $reduce: {
                  input: "$licenseType",
                  initialValue: "",
                  in: {
                    $cond: [
                      { $eq: ["$$value", ""] },
                      "$$this",
                      { $concat: ["$$value", ",", "$$this"] }
                    ]
                  }
                }
              },
              { $replaceAll: { input: "$licenseType", find: /\s+/g, replacement: "" } }
            ]
          },
          licenseType
        ]
      };
    }
    // Filtre par date d'inscription (YYYY-MM-DD)
    if (registrationDate) {
      const start = new Date(registrationDate);
      const end = new Date(registrationDate);
      end.setHours(23,59,59,999);
      query.registrationDate = { $gte: start, $lte: end };
    }
    const candidates = await Candidate.find(query)
      .populate('instructor', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    const total = await Candidate.countDocuments(query);
    res.json({
      candidates,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Récupérer un candidat par ID
router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('instructor', 'firstName lastName email phone');
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidat non trouvé' });
    }
    
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Créer un nouveau candidat
router.post('/', async (req, res) => {
  try {
    const candidate = new Candidate(req.body);
    const newCandidate = await candidate.save();
    res.status(201).json(newCandidate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Mettre à jour un candidat
router.put('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidat non trouvé' });
    }
    
    res.json(candidate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Supprimer un candidat (suppression logique)
router.delete('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!candidate) {
      console.log(`[SUPPRESSION] Candidat non trouvé pour l'ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Candidat non trouvé' });
    }
    console.log(`[SUPPRESSION] Candidat supprimé logiquement:`, { id: candidate._id, nom: candidate.lastName, deletedAt: candidate.deletedAt });
    res.json({ message: 'Candidat supprimé avec succès' });
  } catch (error) {
    console.error('[SUPPRESSION] Erreur lors de la suppression logique:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET - Statistiques des candidats
router.get('/stats/overview', async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments({ deletedAt: { $exists: false } });
    res.json({
      totalCandidates
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Nouvelle route : obtenir toutes les catégories distinctes (match parfait, insensible à l'ordre et aux espaces)
router.get('/categories', async (req, res) => {
  try {
    const candidates = await Candidate.find({}, { licenseType: 1 });
    const categoriesSet = new Set();
    candidates.forEach(c => {
      let arr = [];
      if (Array.isArray(c.licenseType)) arr = c.licenseType;
      else if (typeof c.licenseType === 'string') arr = c.licenseType.replace(/\s+/g, '').split(',');
      const sorted = arr.filter(Boolean).sort();
      if (sorted.length) categoriesSet.add(sorted.join(','));
    });
    res.json(Array.from(categoriesSet).sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 