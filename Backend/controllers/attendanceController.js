const Attendance = require('../models/Attendance');
const User = require('../models/User');

function attendanceStatus(pct) {
  if (pct >= 75) return { key: 'safe', label: 'Safe (75% and above)', color: 'green' };
  if (pct >= 65) return { key: 'condonation', label: 'Condonation (65% to 74%)', color: 'yellow' };
  return { key: 'detention', label: 'Detention risk (below 65%)', color: 'red' };
}

function assertStudentAttendanceAccess(req, studentId) {
  if (req.user.role === 'admin') return;
  if (req.user.role === 'student' && String(req.user._id) === String(studentId)) return;
  const err = new Error('Not authorized to view this attendance');
  err.status = 403;
  throw err;
}

function buildAttendancePayload(rows) {
  let sumTotal = 0;
  let sumAttended = 0;
  const courses = rows.map((r) => {
    sumTotal += r.totalClasses || 0;
    sumAttended += r.attendedClasses || 0;
    const pct = r.attendancePercentage ?? 0;
    return {
      _id: r._id,
      course: r.course,
      totalClasses: r.totalClasses,
      attendedClasses: r.attendedClasses,
      attendancePercentage: pct,
    };
  });

  const overallPercentage =
    sumTotal > 0 ? Math.round((sumAttended / sumTotal) * 10000) / 100 : 0;
  const overall = {
    totalClasses: sumTotal,
    attendedClasses: sumAttended,
    attendancePercentage: overallPercentage,
    ...attendanceStatus(overallPercentage),
  };

  return { overall, courses };
}

exports.markAttendance = async (req, res) => {
  try {
    const { student, course, present } = req.body;
    if (!student || !course) {
      return res.status(400).json({ message: 'student and course are required' });
    }
    let attendance = await Attendance.findOne({ student, course });
    if (!attendance) {
      attendance = new Attendance({ student, course, totalClasses: 0, attendedClasses: 0 });
    }
    attendance.totalClasses += 1;
    if (present) attendance.attendedClasses += 1;
    await attendance.save();
    const populated = await Attendance.findById(attendance._id)
      .populate('course', 'courseTitle courseCode credits')
      .lean();
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Students only' });
    }
    const rows = await Attendance.find({ student: req.user._id })
      .populate('course', 'courseTitle courseCode credits')
      .lean();
    if (!rows.length) return res.status(404).json({ message: 'No attendance records found' });
    rows.sort((a, b) =>
      String(a.course?.courseCode || '').localeCompare(String(b.course?.courseCode || ''))
    );
    res.json(buildAttendancePayload(rows));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    assertStudentAttendanceAccess(req, studentId);
    const rows = await Attendance.find({ student: studentId })
      .populate('course', 'courseTitle courseCode credits')
      .lean();
    if (!rows.length) return res.status(404).json({ message: 'No attendance records found' });
    rows.sort((a, b) =>
      String(a.course?.courseCode || '').localeCompare(String(b.course?.courseCode || ''))
    );
    res.json(buildAttendancePayload(rows));
  } catch (error) {
    if (error.status === 403) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminAttendanceOverview = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name rollNumber department')
      .sort({ rollNumber: 1 })
      .lean();

    const rows = await Attendance.find().lean();
    const byStudent = {};
    for (const r of rows) {
      const sid = String(r.student);
      if (!byStudent[sid]) byStudent[sid] = [];
      byStudent[sid].push(r);
    }

    const overview = students.map((s) => {
      const list = byStudent[String(s._id)] || [];
      let sumTotal = 0;
      let sumAttended = 0;
      for (const r of list) {
        sumTotal += r.totalClasses || 0;
        sumAttended += r.attendedClasses || 0;
      }
      const attendancePercentage =
        sumTotal > 0 ? Math.round((sumAttended / sumTotal) * 10000) / 100 : 0;
      const status = attendanceStatus(attendancePercentage);
      return {
        _id: s._id,
        name: s.name,
        rollNumber: s.rollNumber,
        department: s.department,
        coursesCount: list.length,
        totalClasses: sumTotal,
        attendedClasses: sumAttended,
        attendancePercentage,
        statusKey: status.key,
        statusLabel: status.label,
      };
    });

    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
