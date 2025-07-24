const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
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
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    trim: true
  },
  specializations: [{
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E']
  }],
  hireDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['actif', 'inactif', 'vacances', 'maladie'],
    default: 'actif'
  },
  hourlyRate: {
    type: Number,
  },
  maxStudents: {
    type: Number,
    default: 10
  },
  currentStudents: {
    type: Number,
    default: 0
  },
  notes: String,
  schedule: [{
    day: {
      type: String,
      enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
    },
    startTime: String,
    endTime: String,
    available: {
      type: Boolean,
      default: true
    }
  }],
  // Ajouts pour gestion auto-école
  matricule: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fonction: {
    type: String,
    required: true,
    trim: true
  },
  document: {
    type: String,
    required: true,
    trim: true
  },
  birthDate: {
    type: String,
    trim: true
  },
  birthPlace: {
    type: String,
    trim: true
  },
  photo: {
    type: String, // base64
    default: ''
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
// instructorSchema.index({ email: 1 });
// instructorSchema.index({ licenseNumber: 1 });
instructorSchema.index({ status: 1 });

module.exports = mongoose.model('Instructor', instructorSchema); 