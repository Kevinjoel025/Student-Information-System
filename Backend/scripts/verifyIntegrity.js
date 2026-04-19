/**
 * After seeding: verify student counts, marks per student, attendance rows, CGPA sample.
 * Usage: node scripts/verifyIntegrity.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const { computeCgpaSummary } = require('../utils/cgpa');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const students = await User.countDocuments({ role: 'student' });
  const courses = await Course.countDocuments();
  const marks = await Marks.countDocuments();
  const att = await Attendance.countDocuments();
  const expectedMarks = students * courses;
  const expectedAtt = students * courses;

  console.log('Students:', students);
  console.log('Courses:', courses);
  console.log('Marks rows:', marks, '(expected', expectedMarks + ')');
  console.log('Attendance rows:', att, '(expected', expectedAtt + ')');

  const sample = await User.findOne({ role: 'student' }).select('_id rollNumber').lean();
  if (sample) {
    const m = await Marks.find({ student: sample._id }).populate('course', 'credits').lean();
    const sum = computeCgpaSummary(m);
    console.log('Sample student:', sample.rollNumber, '| courses with marks:', m.length, '| CGPA:', sum.cgpa);
  }

  const bad = await Marks.aggregate([
    { $group: { _id: '$student', n: { $sum: 1 } } },
    { $match: { n: { $ne: courses } } },
    { $limit: 3 },
  ]);
  if (bad.length) {
    console.warn('Some students do not have marks for every course (sample ids):', bad);
  } else {
    console.log('All students have exactly', courses, 'marks entries each.');
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
