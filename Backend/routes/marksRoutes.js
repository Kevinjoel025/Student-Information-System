const express = require('express');
const router = express.Router();
const { addMarks, getMarks, getStudentMarks } = require('../controllers/marksController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.route('/')
  .get(protect, authorize('admin'), getMarks)
  .post(protect, authorize('admin'), addMarks);

router.route('/student/:id')
  .get(protect, getStudentMarks);

module.exports = router;
