const mongoose = require('mongoose');
const Candidate = require('./backend/models/Candidate');
const Payment = require('./backend/models/Payment');

// Mets ici l'URL de ta base MongoDB
const uri = 'mongodb://localhost:27017/auto-ecole'; // <-- adapté au nom de ta base

function parseDateFr(str) {
  // str = "12/05/2024"
  const [day, month, year] = str.split('/');
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}

async function main() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // Correction des candidats
  const candidats = await Candidate.find({ registrationDate: { $type: "string" } });
  console.log(`Candidats à corriger : ${candidats.length}`);
  for (const c of candidats) {
    let dateObj = null;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(c.registrationDate)) {
      dateObj = parseDateFr(c.registrationDate);
    } else if (!isNaN(Date.parse(c.registrationDate))) {
      dateObj = new Date(c.registrationDate);
    }
    if (dateObj) {
      await Candidate.updateOne(
        { _id: c._id },
        { $set: { registrationDate: dateObj } }
      );
      console.log(`Candidat corrigé : ${c._id} -> ${dateObj.toISOString()}`);
    }
  }

  // Correction des paiements
  const paiements = await Payment.find({ date: { $type: "string" } });
  console.log(`Paiements à corriger : ${paiements.length}`);
  for (const p of paiements) {
    let dateObj = null;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(p.date)) {
      dateObj = parseDateFr(p.date);
    } else if (!isNaN(Date.parse(p.date))) {
      dateObj = new Date(p.date);
    }
    if (dateObj) {
      await Payment.updateOne(
        { _id: p._id },
        { $set: { date: dateObj } }
      );
      console.log(`Paiement corrigé : ${p._id} -> ${dateObj.toISOString()}`);
    }
  }

  await mongoose.disconnect();
  console.log('Conversion terminée !');
}

main().catch(console.error); 