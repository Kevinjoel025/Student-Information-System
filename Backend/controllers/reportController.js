const { Parser } = require('json2csv');
const User = require('../models/User');
const Marks = require('../models/Marks');
const { marksToGradePoint } = require('../utils/cgpa');

exports.exportStudentsCSV = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email rollNumber department year -_id').lean();
    if (students.length === 0) return res.status(404).json({ message: 'No students found' });

    const parser = new Parser();
    const csv = parser.parse(students);

    res.header('Content-Type', 'text/csv');
    res.attachment('students.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportMarksCSV = async (req, res) => {
  try {
    const marks = await Marks.find()
      .populate('student', 'name rollNumber')
      .populate('course', 'courseTitle courseCode credits').lean();

    if (marks.length === 0) return res.status(404).json({ message: 'No marks found' });

    const formattedData = marks.map(m => ({
      StudentName: m.student?.name || 'Unknown',
      RollNumber: m.student?.rollNumber || 'N/A',
      Course: m.course?.courseTitle || 'Unknown',
      CourseCode: m.course?.courseCode || 'N/A',
      Credits: m.course?.credits ?? 0,
      Marks: m.marks,
      GradePoint: marksToGradePoint(m.marks),
    }));

    const parser = new Parser();
    const csv = parser.parse(formattedData);

    res.header('Content-Type', 'text/csv');
    res.attachment('marks.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
