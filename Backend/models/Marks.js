const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  marks: { type: Number, required: true },
  grade: { type: String }
}, { timestamps: true });

marksSchema.pre('save', function(next) {
  if (this.marks >= 90) this.grade = 'A';
  else if (this.marks >= 75) this.grade = 'B';
  else if (this.marks >= 50) this.grade = 'C';
  else this.grade = 'Fail';
  next();
});

module.exports = mongoose.model('Marks', marksSchema);
