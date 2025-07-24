const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false }
}, { _id: false });

const CalendarMonthSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true }, // 0 = janvier
  notes: { type: String, default: '' },
  todos: { type: [TodoSchema], default: [] },
  dailyNotes: { type: Map, of: String, default: {} },
  // autoEcoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'AutoEcole' }, // optionnel
}, { timestamps: true });

CalendarMonthSchema.index({ year: 1, month: 1 }/*, { unique: true }*/);

module.exports = mongoose.model('CalendarMonth', CalendarMonthSchema); 