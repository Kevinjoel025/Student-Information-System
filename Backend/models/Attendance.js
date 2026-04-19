const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalClasses: { type: Number, required: true, default: 0 },
  attendedClasses: { type: Number, required: true, default: 0 },
  attendancePercentage: { type: Number, default: 0 }
}, { timestamps: true });

attendanceSchema.pre('save', function(next) {
  if (this.totalClasses > 0) {
    this.attendancePercentage = Number(((this.attendedClasses / this.totalClasses) * 100).toFixed(2));
  } else {
    this.attendancePercentage = 0;
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
