const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getUsersInTeam,
  updateUserRole
} = require('../controllers/userController');

// Get all users in the same team/org
router.get('/team-users', protect, getUsersInTeam);

// Admin-only: update user role
router.put('/:id/role', protect, updateUserRole);

module.exports = router;
