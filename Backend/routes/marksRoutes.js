const express = require('express');
const router = express.Router();
const {
  addMarks,
  getMarks,
  getMyResults,
  getStudentMarks,
  updateMarks,
  getStudentMarksAdmin,
  getAdminResultsOverview,
} = require('../controllers/marksController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.get('/my-results', protect, authorize('student'), getMyResults);
router.get('/overview', protect, authorize('admin'), getAdminResultsOverview);
router.get('/student/:id', protect, getStudentMarks);
router.get('/admin/student/:id', protect, authorize('admin'), getStudentMarksAdmin);

router.route('/')
  .get(protect, authorize('admin'), getMarks)
  .post(protect, authorize('admin'), addMarks);

router.route('/:id')
  .put(protect, authorize('admin'), updateMarks);

module.exports = router;
