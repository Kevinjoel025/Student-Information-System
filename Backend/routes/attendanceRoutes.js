const express = require('express');
const router = express.Router();
const { markAttendance, getStudentAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.route('/mark')
  .post(protect, authorize('admin'), markAttendance);

router.route('/:studentId')
  .get(protect, getStudentAttendance);

module.exports = router;
