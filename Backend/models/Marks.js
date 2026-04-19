const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  marks: { type: Number, required: true, min: 0, max: 100 },
}, { timestamps: true });

marksSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
