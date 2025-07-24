const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');

// GET - Récupérer tous les examens
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, date } = req.query;
    
    let query = {};
    
    if (type) {
      query.type = type;
    }
    
    // Le statut n'est plus obligatoire, on affiche tous les examens
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    const exams = await Exam.find(query)
      .populate('instructor', 'firstName lastName phone')
      .populate('registeredCandidates.candidate', 'firstName lastName email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: 1 });
    
    const total = await Exam.countDocuments(query);
    
    res.json({
      exams,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Récupérer un examen par ID
router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('instructor', 'firstName lastName email phone')
      .populate('registeredCandidates.candidate', 'firstName lastName email phone');
    
    if (!exam) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }
    
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Créer un nouvel examen
router.post('/', async (req, res) => {
  try {
    const { selectedCandidates, ...examData } = req.body;
    
    // Créer l'examen
    const exam = new Exam({
      ...examData,
      status: 'planifié' // Statut par défaut
    });
    
    // Ajouter les candidats sélectionnés
    if (selectedCandidates && selectedCandidates.length > 0) {
      exam.registeredCandidates = selectedCandidates.map(candidate => ({
        candidate: candidate._id,
        registrationDate: new Date()
      }));
    }
    
    const newExam = await exam.save();
    
    // Populate les candidats pour la réponse
    await newExam.populate('registeredCandidates.candidate', 'firstName lastName email phone');
    
    res.status(201).json(newExam);
  } catch (error) {
    console.error('Erreur création examen:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT - Mettre à jour un examen
router.put('/:id', async (req, res) => {
  try {
    const { selectedCandidates, ...examData } = req.body;
    
    // Mettre à jour l'examen
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      examData,
      { new: true, runValidators: true }
    );
    
    if (!exam) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }
    
    // Dans la route PUT /exams/:id, remplacer la mise à jour des candidats :
    if (req.body.registeredCandidates) {
      exam.registeredCandidates = req.body.registeredCandidates.map(candidate => ({
        candidate: candidate.candidate,
        presence: candidate.presence,
        result: candidate.result,
        protected: candidate.protected,
        registrationDate: candidate.registrationDate || new Date()
      }));
      await exam.save();
    }
    
    // Populate les candidats pour la réponse
    await exam.populate('registeredCandidates.candidate', 'firstName lastName email phone');
    
    res.json(exam);
  } catch (error) {
    console.error('Erreur mise à jour examen:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Supprimer un examen
router.delete('/:id', async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }
    
    res.json({ message: 'Examen supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Inscrire un candidat à un examen
router.post('/:id/register-candidate', async (req, res) => {
  try {
    const { candidateId } = req.body;
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }
    
    // Vérifier si le candidat est déjà inscrit
    const alreadyRegistered = exam.registeredCandidates.find(
      reg => reg.candidate.toString() === candidateId
    );
    
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Candidat déjà inscrit à cet examen' });
    }
    
    // Vérifier si l'examen est complet (pas de limite fixe pour l'instant)
    // if (exam.registeredCandidates.length >= exam.maxCandidates) {
    //   return res.status(400).json({ message: 'Examen complet' });
    // }
    
    exam.registeredCandidates.push({
      candidate: candidateId,
      registrationDate: new Date()
    });
    
    await exam.save();
    
    res.json(exam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Mettre à jour le résultat d'un candidat
router.put('/:id/candidate-result', async (req, res) => {
  try {
    const { candidateId, result, score, notes, presence, protected: isProtected } = req.body;
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }
    
    const candidateRegistration = exam.registeredCandidates.find(
      reg => reg.candidate.toString() === candidateId
    );
    
    if (!candidateRegistration) {
      return res.status(404).json({ message: 'Candidat non inscrit à cet examen' });
    }
    
    candidateRegistration.result = result;
    if (score !== undefined) candidateRegistration.score = score;
    if (notes !== undefined) candidateRegistration.notes = notes;
    if (presence !== undefined) candidateRegistration.presence = presence;
    if (isProtected !== undefined) candidateRegistration.protected = isProtected;
    
    await exam.save();
    
    res.json(exam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET - Examens à venir
router.get('/upcoming/list', async (req, res) => {
  try {
    const upcomingExams = await Exam.find({
      date: { $gte: new Date() },
      status: { $in: ['planifié', 'en_cours'] }
    })
    .populate('instructor', 'firstName lastName')
    .populate('registeredCandidates.candidate', 'firstName lastName')
    .sort({ date: 1 })
    .limit(10);
    
    res.json(upcomingExams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Liste des candidats protégés
router.get('/protected-candidates', async (req, res) => {
  try {
    const exams = await Exam.find({ 'registeredCandidates.protected': true })
      .populate('registeredCandidates.candidate', 'firstName lastName phone cin');
    console.log('EXAMS RAW:', JSON.stringify(exams, null, 2));
    // Correction automatique des examens corrompus
    let corrections = 0;
    for (const exam of exams) {
      if (!Array.isArray(exam.registeredCandidates)) {
        exam.registeredCandidates = [];
        await exam.save();
        corrections++;
        console.warn('Correction: registeredCandidates n\'était pas un tableau pour l\'examen', exam._id);
      } else {
        // Filtrer les valeurs inattendues (null, string, etc.)
        const filtered = exam.registeredCandidates.filter(rc => rc && typeof rc === 'object' && rc.candidate);
        if (filtered.length !== exam.registeredCandidates.length) {
          exam.registeredCandidates = filtered;
          await exam.save();
          corrections++;
          console.warn('Correction: registeredCandidates contenait des valeurs invalides pour l\'examen', exam._id);
        }
      }
    }
    if (corrections > 0) console.warn('Corrections automatiques appliquées sur', corrections, 'examens.');
    // Liste à plat de toutes les protections
    const protectedList = [];
    exams.forEach(exam => {
      try {
        if (!Array.isArray(exam.registeredCandidates)) return;
        exam.registeredCandidates.forEach(rc => {
          if (
            rc &&
            rc.protected &&
            rc.candidate &&
            typeof rc.candidate === 'object' &&
            rc.candidate.firstName &&
            rc.candidate.lastName
          ) {
            protectedList.push({
              _id: rc.candidate._id,
              firstName: rc.candidate.firstName,
              lastName: rc.candidate.lastName,
              phone: rc.candidate.phone,
              cin: rc.candidate.cin,
              examDate: exam.date,
              examType: exam.type,
              protected: true
            });
          }
        });
      } catch (err) {
        console.error('Erreur dans exam.registeredCandidates:', err, exam);
      }
    });
    console.log('Candidats protégés trouvés:', protectedList.length, protectedList);
    res.json({
      candidates: protectedList
    });
  } catch (error) {
    console.error('Erreur /protected-candidates:', error);
    res.status(500).json({ message: error.message });
  }
});

// PATCH - Mettre à jour les statuts des candidats protégés d'un examen
router.patch('/:id/update-candidates-status', async (req, res) => {
  try {
    const { candidates } = req.body; // [{ candidate, presence, result, protected }]
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Examen non trouvé' });

    let updated = false;
    console.log('PATCH /:id/update-candidates-status', candidates);
    candidates.forEach(update => {
      const reg = exam.registeredCandidates.find(rc =>
        rc.candidate.toString() === (update.candidate._id || update.candidate)
      );
      if (reg) {
        reg.presence = update.presence;
        reg.result = update.result;
        reg.protected = update.protected;
        updated = true;
      }
    });
    if (updated) await exam.save();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 