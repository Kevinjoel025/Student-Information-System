const Attendance = require('../models/Attendance');

exports.markAttendance = async (req, res) => {
  try {
    const { student, present } = req.body;
    let attendance = await Attendance.findOne({ student });
    
    if (!attendance) {
      attendance = new Attendance({ student, totalClasses: 0, attendedClasses: 0 });
    }

    attendance.totalClasses += 1;
    if (present) attendance.attendedClasses += 1;

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const attendance = await Attendance.findOne({ student: studentId });
    if (!attendance) return res.status(404).json({ message: 'No attendance record found' });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
