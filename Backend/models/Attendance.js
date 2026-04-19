const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  totalClasses: { type: Number, required: true, default: 45 },
  attendedClasses: { type: Number, required: true, default: 0 },
  attendancePercentage: { type: Number, default: 0 },
}, { timestamps: true });

attendanceSchema.index({ student: 1, course: 1 }, { unique: true });

attendanceSchema.pre('save', function preSave(next) {
  const t = Number(this.totalClasses) || 0;
  if (t > 0) {
    const a = Math.min(Number(this.attendedClasses) || 0, t);
    this.attendedClasses = a;
    this.attendancePercentage = Number(((a / t) * 100).toFixed(2));
  } else {
    this.attendancePercentage = 0;
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
