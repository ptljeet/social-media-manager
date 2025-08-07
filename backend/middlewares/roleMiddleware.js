exports.isAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'super_admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
};

exports.isSuperAdmin = (req, res, next) => {
  if (req.user.role === 'super_admin') return next();
  return res.status(403).json({ message: 'Super admin access required' });
};
