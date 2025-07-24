const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['théorique', 'pratique'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // en minutes
    required: false,
    default: 60
  },
  maxStudents: {
    type: Number,
    required: false,
    default: 1
  },
  enrolledStudents: [{
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    attendance: {
      type: Boolean,
      default: false
    },
    grade: Number,
    notes: String
  }],
  location: {
    type: String,
    required: false,
    default: ''
  },
  cost: {
    type: Number,
    required: false,
    default: 0
  },
  status: {
    type: String,
    enum: ['planifié', 'en_cours', 'terminé', 'annulé'],
    default: 'planifié'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  materials: [String],
  objectives: [String],
  prerequisites: [String]
}, {
  timestamps: true
});

// Index pour améliorer les performances
courseSchema.index({ date: 1 });
courseSchema.index({ type: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Course', courseSchema); 