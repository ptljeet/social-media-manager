const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createOrganization,
  createTeam,
  getUserOrganizations
} = require('../controllers/organizationController');

// Protected routes
router.post('/org', protect, createOrganization);
router.post('/org/:orgId/team', protect, createTeam);
router.get('/org', protect, getUserOrganizations);

module.exports = router;
