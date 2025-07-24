const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Payment = require('../models/Payment');

// GET - Statistiques simplifiées pour le dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const period = req.query.period || 'mois';
    const subPeriod = req.query.subPeriod;
    const now = new Date();

    // Fonctions utilitaires pour les périodes
    function getStartOfDay(date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    function getEndOfDay(date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    }
    function getStartOfWeek(date) {
      const d = new Date(date);
      const day = d.getDay() || 7;
      d.setHours(0,0,0,0);
      d.setDate(d.getDate() - day + 1);
      return d;
    }
    function getEndOfWeek(date) {
      const d = getStartOfWeek(date);
      d.setDate(d.getDate() + 6);
      d.setHours(23,59,59,999);
      return d;
    }
    function getStartOfMonth(date) {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    function getEndOfMonth(date) {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    function getStartOfYear(date) {
      return new Date(date.getFullYear(), 0, 1);
    }
    function getEndOfYear(date) {
      return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    // 1. Nombre total de candidats
    const totalCandidates = await Candidate.countDocuments({ deletedAt: { $exists: false } });

    // 2. Nouveaux inscrits sur la période sélectionnée
    let firstDay, lastDay, labelFormat, nbPeriods, periodStep;
    if (period === 'jour') {
      // 24 heures du jour en cours
      nbPeriods = 24;
      labelFormat = d => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0,2) + 'h';
      periodStep = d => { const nd = new Date(d); nd.setHours(nd.getHours() + 1); return nd; };
      firstDay = getStartOfDay(now);
      lastDay = getEndOfDay(now);
    } else if (period === 'semaine') {
      // Semaine en cours, du lundi au dimanche
      nbPeriods = 7;
      const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
      const monday = getStartOfWeek(now);
      labelFormat = d => DAYS_FR[d.getDay() === 0 ? 6 : d.getDay() - 1];
      periodStep = d => { const nd = new Date(d); nd.setDate(nd.getDate() + 1); return nd; };
      firstDay = monday;
      lastDay = new Date(monday); lastDay.setDate(monday.getDate() + 6); lastDay.setHours(23,59,59,999);
    } else if (period === 'mois') {
      // 12 mois de l'année en cours
      nbPeriods = 12;
      const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      labelFormat = d => MONTHS_FR[d.getMonth()];
      periodStep = d => { const nd = new Date(d); nd.setMonth(nd.getMonth() + 1); return nd; };
      firstDay = new Date(now.getFullYear(), 0, 1);
      lastDay = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (period === 'année') {
      // Années depuis le premier candidat inscrit jusqu'à l'année en cours
      const firstCandidate = await Candidate.findOne({ deletedAt: { $exists: false } }).sort({ registrationDate: 1 });
      const firstYear = firstCandidate ? firstCandidate.registrationDate.getFullYear() : now.getFullYear();
      const lastYear = now.getFullYear();
      nbPeriods = lastYear - firstYear + 1;
      labelFormat = d => d.getFullYear().toString();
      periodStep = d => { const nd = new Date(d); nd.setFullYear(nd.getFullYear() + 1); return nd; };
      firstDay = new Date(firstYear, 0, 1);
      lastDay = new Date(lastYear, 11, 31, 23, 59, 59, 999);
    }
    function getWeekNumber(d) {
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
      return weekNo;
    }

    // Nouveaux inscrits sur la période courante
    const newCandidatesThisPeriod = await Candidate.countDocuments({
      registrationDate: { $gte: firstDay, $lte: lastDay },
      deletedAt: { $exists: false }
    });

    // CA sur la période courante
    const payments = await Payment.find({ date: { $gte: firstDay, $lte: lastDay } });
    const revenueThisPeriod = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Évolution des inscriptions et CA sur nbPeriods périodes
    const registrations = [];
    const revenueByPeriod = [];
    let cursor = new Date(firstDay);
    for (let i = 0; i < nbPeriods; i++) {
      let start, end;
      if (period === 'mois') {
        start = new Date(now.getFullYear(), i, 1);
        end = new Date(now.getFullYear(), i + 1, 0, 23, 59, 59, 999);
      } else if (period === 'année') {
        start = new Date(firstDay.getFullYear() + i, 0, 1);
        end = new Date(firstDay.getFullYear() + i, 11, 31, 23, 59, 59, 999);
      } else if (period === 'semaine') {
        start = new Date(cursor);
        end = new Date(cursor);
        end.setHours(23,59,59,999);
      } else if (period === 'jour') {
        start = new Date(cursor);
        start.setMinutes(0,0,0);
        end = new Date(cursor);
        end.setMinutes(59,59,999);
      }
      const count = await Candidate.countDocuments({ registrationDate: { $gte: start, $lte: end }, deletedAt: { $exists: false } });
      registrations.push({ date: labelFormat(cursor), inscriptions: count });
      const paymentsPeriod = await Payment.find({ date: { $gte: start, $lte: end } });
      const total = paymentsPeriod.reduce((sum, p) => sum + (p.amount || 0), 0);
      revenueByPeriod.push({ date: labelFormat(cursor), revenue: total });
      cursor = periodStep(cursor);
    }

    // Pour la répartition par catégorie, si subPeriod est présent, on filtre sur la sous-période
    let catsFilter = {
      deletedAt: { $exists: false },
      registrationDate: { $gte: firstDay, $lte: lastDay }
    };
    if (subPeriod) {
      if (period === 'semaine') {
        // subPeriod = 'Lundi', 'Mardi', ...
        const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const monday = getStartOfWeek(now);
        const idx = DAYS_FR.indexOf(subPeriod);
        if (idx !== -1) {
          const d = new Date(monday); d.setDate(monday.getDate() + idx);
          catsFilter.registrationDate = { $gte: getStartOfDay(d), $lte: getEndOfDay(d) };
        }
      } else if (period === 'mois') {
        // subPeriod = 'Janvier', ...
        const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const idx = MONTHS_FR.indexOf(subPeriod);
        if (idx !== -1) {
          const year = now.getFullYear();
          catsFilter.registrationDate = {
            $gte: new Date(year, idx, 1),
            $lte: new Date(year, idx + 1, 0, 23, 59, 59, 999)
          };
        }
      } else if (period === 'année') {
        // subPeriod = '2024', ...
        const year = parseInt(subPeriod);
        if (!isNaN(year)) {
          catsFilter.registrationDate = {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31, 23, 59, 59, 999)
          };
        }
      } else if (period === 'jour') {
        // subPeriod = '00h', '01h', ...
        const hour = parseInt(subPeriod);
        if (!isNaN(hour)) {
          const d = getStartOfDay(now);
          d.setHours(hour, 0, 0, 0);
          const end = new Date(d); end.setMinutes(59,59,999);
          catsFilter.registrationDate = { $gte: d, $lte: end };
        }
      }
    }
    const cats = await Candidate.find(catsFilter, { licenseType: 1 });
    const catMap = {};
    cats.forEach(c => {
      let label = '';
      if (Array.isArray(c.licenseType)) label = c.licenseType.join(',');
      else if (typeof c.licenseType === 'string') label = c.licenseType.replace(/\s+/g, '');
      if (!label) return;
      catMap[label] = (catMap[label] || 0) + 1;
    });
    const categories = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    // Taux de réussite basé sur tous les examens (pas seulement la période)
    const Exam = require('../models/Exam');
    const allExams = await Exam.find({});
    let codeTotal = 0, codeSuccess = 0, conduiteTotal = 0, conduiteSuccess = 0;
    let codeProtectedTotal = 0, codeProtectedSuccess = 0, conduiteProtectedTotal = 0, conduiteProtectedSuccess = 0;
    allExams.forEach(exam => {
      if (exam.type === 'théorique') {
        codeTotal += exam.registeredCandidates.length;
        codeSuccess += exam.registeredCandidates.filter(c => c.result === 'réussi' || c.protected === true).length;
        // Corriger ici : tous les protégés
        codeProtectedTotal += exam.registeredCandidates.filter(c => c.protected === true).length;
        codeProtectedSuccess += exam.registeredCandidates.filter(c => c.result === 'réussi' && c.protected === true).length;
      } else if (exam.type === 'pratique') {
        conduiteTotal += exam.registeredCandidates.length;
        conduiteSuccess += exam.registeredCandidates.filter(c => c.result === 'réussi' || c.protected === true).length;
        conduiteProtectedTotal += exam.registeredCandidates.filter(c => c.protected === true).length;
        conduiteProtectedSuccess += exam.registeredCandidates.filter(c => c.result === 'réussi' && c.protected === true).length;
      }
    });
    const successRates = {
      code: codeTotal ? Math.round((codeSuccess / codeTotal) * 100) : 0,
      conduite: conduiteTotal ? Math.round((conduiteSuccess / conduiteTotal) * 100) : 0,
      codeProtected: codeProtectedTotal ? Math.round((codeProtectedSuccess / codeProtectedTotal) * 100) : 0,
      conduiteProtected: conduiteProtectedTotal ? Math.round((conduiteProtectedSuccess / conduiteProtectedTotal) * 100) : 0,
      codeProtectedTotal,
      codeProtectedSuccess,
      conduiteProtectedTotal,
      conduiteProtectedSuccess
    };

    // Répartition par sexe (inchangé)
    const genderAgg = await Candidate.aggregate([
      { $match: { deletedAt: { $exists: false } } },
      { $group: { _id: '$sexe', value: { $sum: 1 } } }
    ]);
    const genderDistribution = genderAgg.map(g => ({ name: g._id, value: g.value }));

    // Répartition par nationalité (inchangé)
    const natAgg = await Candidate.aggregate([
      { $match: { deletedAt: { $exists: false } } },
      { $group: { _id: '$nationality', value: { $sum: 1 } } },
      { $sort: { value: -1 } }
    ]);
    const nationalityDistribution = natAgg.map(n => ({ name: n._id, value: n.value }));

    // Top 5 moniteurs (inchangé)
    const topInstructorsAgg = await Candidate.aggregate([
      { $match: { deletedAt: { $exists: false } } },
      { $group: { _id: '$instructor', value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]);
    const instructorIds = topInstructorsAgg.map(i => i._id).filter(Boolean);
    let instructorsMap = {};
    if (instructorIds.length) {
      const instructors = await require('../models/Instructor').find({ _id: { $in: instructorIds } });
      instructorsMap = instructors.reduce((acc, i) => {
        acc[i._id] = i.firstName + ' ' + i.lastName;
        return acc;
      }, {});
    }
    const topInstructors = topInstructorsAgg.map(i => ({ name: instructorsMap[i._id] || 'Inconnu', value: i.value }));

    res.json({
      totalCandidates,
      newCandidatesThisPeriod,
      revenueThisPeriod,
      registrations,
      categories,
      successRates,
      revenueByPeriod,
      genderDistribution,
      nationalityDistribution,
      topInstructors
    });
  } catch (error) {
    console.error('[DASHBOARD ERROR]', error);
    res.status(500).json({ message: 'Erreur serveur: ' + error.message });
  }
});

module.exports = router; 