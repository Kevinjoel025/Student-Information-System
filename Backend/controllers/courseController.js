const Course = require('../models/Course');

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ courseCode: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addCourse = async (req, res) => {
  try {
    const { courseTitle, courseCode, credits } = req.body;
    if (!courseTitle || !courseCode) {
      return res.status(400).json({ message: 'courseTitle and courseCode are required' });
    }
    const exists = await Course.findOne({ courseCode });
    if (exists) return res.status(400).json({ message: 'Course code already exists' });

    const course = await Course.create({
      courseTitle,
      courseCode,
      credits: credits !== undefined ? Number(credits) : 0,
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { courseTitle, courseCode, credits } = req.body;
    const update = {};
    if (courseTitle !== undefined) update.courseTitle = courseTitle;
    if (courseCode !== undefined) update.courseCode = courseCode;
    if (credits !== undefined) update.credits = Number(credits);

    const course = await Course.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await Course.deleteOne({ _id: course._id });
    res.json({ message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
