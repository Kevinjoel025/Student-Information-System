const Marks = require('../models/Marks');

exports.addMarks = async (req, res) => {
  try {
    const { student, course, marks } = req.body;
    let existing = await Marks.findOne({ student, course });
    if(existing) {
      existing.marks = marks;
      await existing.save(); 
      return res.json(existing);
    }
    const newMarks = await Marks.create({ student, course, marks });
    res.status(201).json(newMarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMarks = async (req, res) => {
  try {
    const marksList = await Marks.find()
      .populate('student', 'name rollNumber')
      .populate('course', 'courseName courseCode');
    res.json(marksList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentMarks = async (req, res) => {
  try {
    const studentId = req.params.id;
    const marksList = await Marks.find({ student: studentId }).populate('course', 'courseName courseCode');
    
    let totalMarks = 0;
    let highestMarks = 0;

    marksList.forEach(m => {
      totalMarks += m.marks;
      if (m.marks > highestMarks) highestMarks = m.marks;
    });

    const averageMarks = marksList.length > 0 ? (totalMarks / marksList.length).toFixed(2) : 0;

    let academicStatus = 'Needs Improvement';
    if (averageMarks >= 85) academicStatus = 'Excellent';
    else if (averageMarks >= 60) academicStatus = 'Good';

    res.json({
      marks: marksList,
      performanceSummary: {
        averageMarks: Number(averageMarks),
        highestMarks,
        academicStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
