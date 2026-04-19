const express = require('express');
const router = express.Router();
const { getCourses, addCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.route('/')
  .get(protect, getCourses)
  .post(protect, authorize('admin'), addCourse);

router.route('/:id')
  .put(protect, authorize('admin'), updateCourse)
  .delete(protect, authorize('admin'), deleteCourse);

module.exports = router;
