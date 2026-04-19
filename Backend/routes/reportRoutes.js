const express = require('express');
const router = express.Router();
const { exportStudentsCSV, exportMarksCSV } = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.route('/students')
  .get(protect, authorize('admin'), exportStudentsCSV);

router.route('/marks')
  .get(protect, authorize('admin'), exportMarksCSV);

module.exports = router;
