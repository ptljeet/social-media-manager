const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getAnalytics } = require('../controllers/analyticsController');

router.get('/', protect, getAnalytics);

module.exports = router;
