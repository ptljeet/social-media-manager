const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const sendEmail = require('../utils/sendEmail'); // helper to send emails

// Generate invite link
exports.sendInvitation = async (req, res) => {
  try {
    const { email, role } = req.body;
    const orgId = req.user.organization;

    if (!orgId) return res.status(400).json({ message: 'Organization missing' });

    const token = jwt.sign(
      { email, orgId, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const inviteLink = `${process.env.FRONTEND_URL}/register?invite=${token}`;

    await sendEmail(email, 'Organization Invite', `Join here: ${inviteLink}`);

    res.json({ message: 'Invitation sent successfully', inviteLink });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send invitation' });
  }
};

// Accept invitation
exports.acceptInvitation = async (req, res) => {
  try {
    const { token, name, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { email, orgId, role } = decoded;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({
      name,
      email,
      password,
      role,
      organization: orgId,
      isVerified: true
    });
    await newUser.save();

    await Organization.findByIdAndUpdate(orgId, {
      $push: { users: newUser._id }
    });

    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to accept invitation' });
  }
};
