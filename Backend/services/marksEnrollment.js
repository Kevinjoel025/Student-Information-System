const Course = require('../models/Course');
const Marks = require('../models/Marks');
const { generateBTechMark } = require('../utils/realisticMarks');

/**
 * Create marks for every course (realistic B.Tech distribution).
 */
async function assignRandomMarksToStudent(studentId) {
  const courses = await Course.find().select('_id courseCode courseTitle').lean();
  if (!courses.length) return;
  const docs = courses.map((c) => ({
    student: studentId,
    course: c._id,
    marks: generateBTechMark(c),
  }));
  await Marks.insertMany(docs);
}

module.exports = { assignRandomMarksToStudent };
