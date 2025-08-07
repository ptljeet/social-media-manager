const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const { sendInvitation, acceptInvitation } = require('../controllers/invitationController');

// Admin sends invitation
router.post('/send', protect, isAdmin, sendInvitation);

// User accepts invitation (no auth required)
router.post('/accept', acceptInvitation);

module.exports = router;
