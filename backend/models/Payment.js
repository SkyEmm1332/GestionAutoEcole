const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    enum: ['Espèces', 'Mobile Money'],
    default: 'Espèces'
  },
  description: String,
  status: {
    type: String,
    enum: ['effectué', 'en attente', 'remboursé'],
    default: 'effectué'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema); 