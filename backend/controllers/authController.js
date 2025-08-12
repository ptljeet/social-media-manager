const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (userDoc) => {
  // Ensure organization is a plain string in token
  const orgId =
    (userDoc.organization && userDoc.organization._id) ||
    userDoc.organization ||
    null;

  return jwt.sign(
    {
      id: String(userDoc._id),
      role: String(userDoc.role || '').toLowerCase(),
      organization: orgId ? String(orgId) : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/** POST /api/auth/register */
exports.registerUser = async (req, res) => {
  const { name, email, password, organization, inviteToken } = req.body;

  try {
    // TODO: if you support invites, decode inviteToken to get orgId/role here.
    const orgId = organization || null;
    const role = 'viewer';

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password, role, organization: orgId });
    await user.save();

    // Re-fetch to populate organization name for response
    const populated = await User.findById(user._id).populate('organization', 'name');

    const token = signToken(populated);
    return res.status(201).json({
      token,
      user: {
        id: populated._id,
        name: populated.name,
        email: populated.email,
        role: populated.role,
        organization: populated.organization?._id || null,
        organizationName: populated.organization?.name || null,
      },
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

/** POST /api/auth/login */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('organization', 'name');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization?._id || null,
        organizationName: user.organization?.name || null,
      },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

/** GET /api/auth/me */
exports.me = async (req, res) => {
  const u = req.user; // provided by protect()
  return res.json({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    organization: u.organization || null,
    organizationName: req.user.organizationName || null,
  });
};
