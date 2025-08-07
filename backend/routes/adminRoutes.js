const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const adminController = require('../controllers/adminController');

// ✅ Protect all admin routes
router.use(protect, isAdmin);

// ✅ View all users (same organization)
router.get('/users', adminController.getAllUsers);

// ✅ Update user role (restricted to same org)
router.put('/users/:id/role', adminController.updateUserRole);

// ✅ Delete user (restricted to same org)
router.delete('/users/:id', adminController.deleteUser);

// ✅ Dashboard Stats (filtered by organization)
router.get('/stats', adminController.getStats);

module.exports = router;
