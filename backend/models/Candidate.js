const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  cin: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  placeOfBirth: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  fatherName: {
    type: String,
    required: true,
    trim: true
  },
  motherName: {
    type: String,
    required: true,
    trim: true
  },
  licenseType: [{
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'AB', 'BCDE', 'ABCDE'],
    required: true
  }],
  registrationDate: {
    type: Date,
    default: Date.now
  },
  sexe: {
    type: String,
    enum: ['M', 'F'],
    required: true
  },
  nationality: {
    type: String,
    required: true,
    trim: true
  },
  theoreticalExamPassed: {
    type: Boolean,
    default: false
  },
  practicalExamPassed: {
    type: Boolean,
    default: false
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor'
  },
  totalHours: {
    type: Number,
    default: 0
  },
  notes: String,
  amount: {
    type: Number,
    default: 0
  },
  documents: [{
    type: String,
    name: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['actif', 'inactif', 'diplômé', 'abandonné', 'archivé', 'supprimé'],
    default: 'actif'
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
candidateSchema.index({ cin: 1 });
candidateSchema.index({ lastName: 1, firstName: 1 });

module.exports = mongoose.model('Candidate', candidateSchema); 