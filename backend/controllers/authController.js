const User = require('../models/User');
const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');

// Generate JWT with role & organization
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role, 
      organization: user.organization 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ======================== REGISTER ========================
exports.registerUser = async (req, res) => {
  const { name, email, password, organization, inviteToken } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    let orgId = organization || null;
    let finalRole = 'viewer';

    // ✅ If invited user
    if (inviteToken) {
      try {
        const decoded = jwt.verify(inviteToken, process.env.JWT_SECRET);
        orgId = decoded.orgId;
        finalRole = decoded.role;

        const existingUser = await User.findOne({ email: decoded.email });
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Invalid or expired invitation token' });
      }
    }

    // ✅ Create user
    user = new User({
      name,
      email,
      password,
      role: finalRole,
      organization: orgId,
      isVerified: !!inviteToken
    });

    await user.save();

    // ✅ Add user to organization
    if (orgId) {
      await Organization.findByIdAndUpdate(orgId, { $push: { users: user._id } });
    }

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        organization: user.organization
      }
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ======================== LOGIN ========================
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('organization');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        organization: user.organization
      }
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
