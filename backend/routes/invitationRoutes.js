// backend/routes/invitationRoutes.js
const express = require('express');
const router = express.Router();

const { protect, isAdmin } = require('../middlewares/authMiddleware');
const { listMembers, createInviteLink, removeMember } = require('../controllers/invitationController');

// Quick self-test (optional)
router.get('/_selftest', (_req, res) => res.json({ ok: true }));

// List members in caller's org
router.get('/members', protect, listMembers);

// Create invite link (admin only)
router.post('/create', protect, isAdmin, createInviteLink);

// Remove member (admin only)
router.delete('/members/:userId', protect, isAdmin, removeMember);

module.exports = router;
