const express = require('express');
const router = express.Router();
const CalendarMonth = require('../models/CalendarMonth');

// Récupérer les données d'un mois
router.get('/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  try {
    let doc = await CalendarMonth.findOne({ year: Number(year), month: Number(month) });
    if (!doc) doc = await CalendarMonth.create({ year: Number(year), month: Number(month) });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Créer ou mettre à jour les données d'un mois
router.post('/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  const { notes, todos, dailyNotes } = req.body;
  try {
    let doc = await CalendarMonth.findOneAndUpdate(
      { year: Number(year), month: Number(month) },
      { $set: { notes, todos, dailyNotes } },
      { new: true, upsert: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 