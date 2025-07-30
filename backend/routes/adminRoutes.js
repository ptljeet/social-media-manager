const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getAllUsers, updateUserRole } = require('../controllers/adminController');

// Protect all admin routes
router.use(protect);

// Admin: View all users
router.get('/users', getAllUsers);

// Admin: Update user role
router.put('/users/:id/role', updateUserRole);

module.exports = router;
