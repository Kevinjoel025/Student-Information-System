const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const { randomInt } = require('../utils/realisticMarks');

/** ~72% safe, ~20% condonation, ~8% detention (overall band per student). */
function pickAttendanceBand() {
  const r = Math.random();
  if (r < 0.72) return 'green';
  if (r < 0.92) return 'yellow';
  return 'red';
}

function buildRowsForStudent(studentId, courses, band) {
  return courses.map((course) => {
    const total = randomInt(40, 55);
    let targetPct;
    if (band === 'green') {
      targetPct = randomInt(76, 98) + randomInt(-4, 4);
    } else if (band === 'yellow') {
      targetPct = randomInt(65, 74) + randomInt(-3, 3);
    } else {
      targetPct = randomInt(48, 64) + randomInt(-3, 3);
    }
    targetPct = Math.max(0, Math.min(100, targetPct));
    let attended = Math.round((total * targetPct) / 100);
    attended = Math.min(Math.max(0, attended), total);
    const attendancePercentage =
      total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;
    return {
      student: studentId,
      course: course._id,
      totalClasses: total,
      attendedClasses: attended,
      attendancePercentage,
    };
  });
}

async function assignAttendanceToStudent(studentId) {
  const courses = await Course.find().lean();
  if (!courses.length) return;
  const band = pickAttendanceBand();
  const docs = buildRowsForStudent(studentId, courses, band);
  await Attendance.insertMany(docs);
}

module.exports = {
  assignAttendanceToStudent,
  pickAttendanceBand,
  buildRowsForStudent,
};
