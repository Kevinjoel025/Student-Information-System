const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  courseTitle: { type: String, required: true },
  credits: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
