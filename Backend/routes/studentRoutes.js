const express = require('express');
const router = express.Router();
const { getStudents, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.route('/')
  .get(protect, getStudents);

router.route('/:id')
  .put(protect, authorize('admin'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

module.exports = router;
