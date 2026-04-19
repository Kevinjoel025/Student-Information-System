const User = require('../models/User');

// @desc    Get all students with search & filter
// @route   GET /api/students
// @access  Admin & Student
exports.getStudents = async (req, res) => {
  try {
    const { search, department, year } = req.query;
    let query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (department) query.department = department;
    if (year) query.year = year;

    // When using $or with other fields, wrap in $and to avoid conflicts
    let finalQuery;
    if (query.$or) {
      const { $or, ...rest } = query;
      finalQuery = { $and: [rest, { $or }] };
    } else {
      finalQuery = query;
    }

    const students = await User.find(finalQuery).select('-password').sort({ rollNumber: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Admin
exports.updateStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Whitelist of updatable fields
    const allowedFields = [
      'name', 'department', 'year', 'bloodGroup',
      'parentMobile', 'studentMobile', 'residentialAddress'
    ];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    }

    const updatedStudent = await student.save();
    const result = updatedStudent.toObject();
    delete result.password;
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Admin
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }
    await User.deleteOne({ _id: student._id });
    res.json({ message: 'Student removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
