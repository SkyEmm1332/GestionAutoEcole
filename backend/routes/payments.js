const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Candidate = require('../models/Candidate');

// GET - Liste des paiements
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('candidate')
      .sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Paiements d'un candidat
router.get('/candidate/:candidateId', async (req, res) => {
  try {
    const payments = await Payment.find({ candidate: req.params.candidateId })
      .sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Ajouter un paiement
router.post('/', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    const newPayment = await payment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Modifier un paiement
router.put('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Versement non trouvé' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Supprimer un paiement
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Versement non trouvé' });
    }
    res.json({ message: 'Versement supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 