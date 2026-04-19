const Marks = require('../models/Marks');
const User = require('../models/User');
const {
  computeCgpaSummary,
  enrichMarkRow,
  cgpaToOverallGrade,
} = require('../utils/cgpa');

function assertStudentMarksAccess(req, studentId) {
  if (req.user.role === 'admin') return;
  if (req.user.role === 'student' && String(req.user._id) === String(studentId)) return;
  const err = new Error('Not authorized to view these marks');
  err.status = 403;
  throw err;
}

async function findMarksForStudent(studentId) {
  const list = await Marks.find({ student: studentId })
    .populate('course', 'courseTitle courseCode credits')
    .lean();
  list.sort((a, b) =>
    String(a.course?.courseCode || '').localeCompare(String(b.course?.courseCode || ''))
  );
  return list;
}

function buildResultsPayload(marksList) {
  const courses = marksList.map((m) =>
    enrichMarkRow({
      _id: m._id,
      marks: m.marks,
      course: m.course,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    })
  );
  const summary = computeCgpaSummary(marksList);
  const overallGrade = cgpaToOverallGrade(summary.cgpa);
  return { courses, summary: { ...summary, overallGrade } };
}

exports.addMarks = async (req, res) => {
  try {
    const { student, course, marks } = req.body;
    const m = Number(marks);
    if (Number.isNaN(m) || m < 0 || m > 100) {
      return res.status(400).json({ message: 'Marks must be between 0 and 100' });
    }
    let existing = await Marks.findOne({ student, course });
    if (existing) {
      existing.marks = m;
      await existing.save();
      const populated = await Marks.findById(existing._id)
        .populate('student', 'name rollNumber department')
        .populate('course', 'courseTitle courseCode credits')
        .lean();
      return res.json(enrichMarkRow(populated));
    }
    const newMarks = await Marks.create({ student, course, marks: m });
    const populated = await Marks.findById(newMarks._id)
      .populate('student', 'name rollNumber department')
      .populate('course', 'courseTitle courseCode credits')
      .lean();
    res.status(201).json(enrichMarkRow(populated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMarks = async (req, res) => {
  try {
    const marksList = await Marks.find()
      .populate('student', 'name rollNumber department')
      .populate('course', 'courseTitle courseCode credits')
      .lean();
    res.json(marksList.map((row) => enrichMarkRow(row)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyResults = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Students only' });
    }
    const marksList = await findMarksForStudent(req.user._id);
    res.json(buildResultsPayload(marksList));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentMarks = async (req, res) => {
  try {
    const studentId = req.params.id;
    assertStudentMarksAccess(req, studentId);
    const marksList = await findMarksForStudent(studentId);
    res.json(buildResultsPayload(marksList));
  } catch (error) {
    if (error.status === 403) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

exports.updateMarks = async (req, res) => {
  try {
    const marksEntry = await Marks.findById(req.params.id);
    if (!marksEntry) return res.status(404).json({ message: 'Marks entry not found' });

    const m = Number(req.body.marks);
    if (Number.isNaN(m) || m < 0 || m > 100) {
      return res.status(400).json({ message: 'Marks must be between 0 and 100' });
    }

    marksEntry.marks = m;
    await marksEntry.save();

    const populated = await Marks.findById(marksEntry._id)
      .populate('student', 'name rollNumber department')
      .populate('course', 'courseTitle courseCode credits')
      .lean();

    const allForStudent = await findMarksForStudent(marksEntry.student);
    const sum = computeCgpaSummary(allForStudent);
    const studentSummary = {
      ...sum,
      overallGrade: cgpaToOverallGrade(sum.cgpa),
    };

    res.json({
      entry: enrichMarkRow(populated),
      studentSummary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentMarksAdmin = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findOne({ _id: studentId, role: 'student' })
      .select('name rollNumber department email year')
      .lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const marksList = await findMarksForStudent(studentId);
    res.json({ student, ...buildResultsPayload(marksList) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminResultsOverview = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name rollNumber department')
      .sort({ rollNumber: 1 })
      .lean();

    const marks = await Marks.find()
      .populate('course', 'credits')
      .lean();

    const byStudent = {};
    for (const m of marks) {
      const sid = String(m.student);
      if (!byStudent[sid]) byStudent[sid] = [];
      byStudent[sid].push(m);
    }

    const overview = students.map((s) => {
      const rows = byStudent[String(s._id)] || [];
      const summary = computeCgpaSummary(rows);
      return {
        _id: s._id,
        name: s.name,
        rollNumber: s.rollNumber,
        department: s.department,
        coursesCount: rows.length,
        ...summary,
        overallGrade: cgpaToOverallGrade(summary.cgpa),
      };
    });

    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
