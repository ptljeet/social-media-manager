// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Extract Bearer token from Authorization header.
 */
function getTokenFromHeader(req) {
  const hdr = req.headers.authorization || '';
  if (!hdr.startsWith('Bearer ')) return null;
  return hdr.slice(7);
}

/**
 * Auth middleware:
 *  - verifies JWT
 *  - loads user (lean)
 *  - normalizes req.user:
 *      { _id, id, name, email, role, organization, organizationName, ... }
 *    where organization is a string (ObjectId) or null
 */
const protect = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return res.status(401).json({ message: 'Invalid token payload' });

    const doc = await User.findById(decoded.id)
      .select('-password')
      .populate('organization', 'name _id')
      .lean();

    if (!doc) return res.status(401).json({ message: 'User not found' });

    // Normalize IDs to strings
    const userId = String(doc._id);

    // organization can be populated (object) or raw ObjectId, or absent
    let orgId = null;
    let orgName = null;

    if (doc.organization && typeof doc.organization === 'object') {
      // populated
      orgId = doc.organization._id ? String(doc.organization._id) : null;
      orgName = doc.organization.name || null;
    } else if (doc.organization) {
      // unpopulated ObjectId or string
      orgId = String(doc.organization);
    } else if (decoded.organization) {
      // fallback to token if present
      orgId = String(decoded.organization);
    }

    req.user = {
      ...doc,
      _id: userId,
      id: userId,
      organization: orgId,
      organizationName: orgName,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Allow only admin/super_admin.
 */
const isAdmin = (req, res, next) => {
  const role = (req.user?.role || '').toLowerCase();
  if (role === 'admin' || role === 'super_admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
};

/**
 * Role-based guard: require any of the given roles (case-insensitive).
 * Usage: router.get('/x', protect, requireRoles('editor','admin'), handler)
 */
const requireRoles = (...roles) => (req, res, next) => {
  const role = (req.user?.role || '').toLowerCase();
  if (roles.map(r => String(r).toLowerCase()).includes(role)) return next();
  return res.status(403).json({ message: 'Insufficient role' });
};

module.exports = { protect, isAdmin, requireRoles };
