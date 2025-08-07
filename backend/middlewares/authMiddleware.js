const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify token and attach user
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select('-password');
      if (!user) return res.status(401).json({ message: 'User not found' });

      req.user = user;
      req.user.organization = decoded.organization; // ✅ Ensure organization is attached
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

// Middleware to check admin or super admin role
const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'super_admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

module.exports = {
  protect,
  isAdmin,
};
