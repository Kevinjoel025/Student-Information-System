const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getStudentAttendance,
  getMyAttendance,
  getAdminAttendanceOverview,
} = require('../controllers/attendanceController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.get('/my', protect, authorize('student'), getMyAttendance);
router.get('/admin/overview', protect, authorize('admin'), getAdminAttendanceOverview);
router.post('/mark', protect, authorize('admin'), markAttendance);
router.get('/:studentId', protect, getStudentAttendance);

module.exports = router;
