const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['théorique', 'pratique'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: false
  },
  registeredCandidates: [{
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    result: {
      type: String,
      enum: ['en_attente', 'réussi', 'échoué'],
      default: 'en_attente'
    },
    presence: {
      type: Boolean,
      default: false
    },
    protected: {
      type: Boolean,
      default: false
    },
    score: Number,
    notes: String
  }],
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor'
  },
  status: {
    type: String,
    enum: ['planifié', 'en_cours', 'terminé', 'annulé'],
    default: 'planifié',
    required: false
  },
  cost: {
    type: Number,
    required: false
  },
  requirements: [String],
  notes: String
}, {
  timestamps: true
});

// Index pour améliorer les performances
examSchema.index({ date: 1 });
examSchema.index({ type: 1 });
examSchema.index({ status: 1 });

module.exports = mongoose.model('Exam', examSchema); 