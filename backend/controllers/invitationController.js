// backend/controllers/invitationController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const listMembers = async (req, res) => {
  try {
    const orgId = req.user?.organization;
    if (!orgId) return res.status(400).json({ message: 'No organization for user' });

    const members = await User.find({ organization: orgId }).select('_id name email role');
    return res.json(members);
  } catch (err) {
    console.error('LIST MEMBERS ERROR:', err);
    return res.status(500).json({ message: 'Failed to fetch members' });
  }
};

const createInviteLink = async (req, res) => {
  try {
    const orgId = req.user?.organization;
    if (!orgId) return res.status(400).json({ message: 'No organization for user' });

    const role = 'viewer'; // enforced server-side
    const email = req.body?.email || null;

    const token = jwt.sign({ type: 'invite', orgId, role, email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteUrl = `${base}/register?invite=${encodeURIComponent(token)}`;

    return res.json({ token, inviteUrl, expiresInDays: 7 });
  } catch (err) {
    console.error('CREATE INVITE LINK ERROR:', err);
    return res.status(500).json({ message: 'Failed to create invite link' });
  }
};

const removeMember = async (req, res) => {
  try {
    const orgId = req.user?.organization;
    const { userId } = req.params;

    const user = await User.findOne({ _id: userId, organization: orgId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.deleteOne({ _id: userId });
    return res.json({ ok: true });
  } catch (err) {
    console.error('REMOVE MEMBER ERROR:', err);
    return res.status(500).json({ message: 'Failed to remove user' });
  }
};

module.exports = { listMembers, createInviteLink, removeMember };
