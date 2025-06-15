const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, (req, res) => {
  res.json({
    message: 'Welcome to the protected route!',
    user: req.user
  });
});

module.exports = router;

